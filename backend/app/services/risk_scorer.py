"""
risk_scorer.py
--------------
Calculates risk scores for countries, routes, and the global oil market.

ALL supplier countries and ALL shipping routes/chokepoints are now scored
from real, live news - not just Russia/Iran/Hormuz/Red Sea as before.

Cache duration is 30 minutes (not 10) because we now make ~16 news+AI calls
per refresh instead of 6 - this keeps us within NewsAPI's free-tier limits.
Use /api/risk/refresh to force an instant update for demos.
"""

import time
from datetime import datetime, timezone
from app.collectors.news_collector import (
    fetch_all_country_headlines,
    fetch_all_route_headlines,
    fetch_all_global_headlines,
)
from app.services.ai_classifier import score_all

# --- Static baselines (starting point before live news adjusts them) ---
COUNTRY_BASELINE = {
    "SAU": 20, "ARE": 15, "KWT": 22, "QAT": 18,
    "RUS": 78, "IRN": 88, "NGA": 55, "BRA": 30, "USA": 12,
}

# How much weight live news can add on top of the baseline (points, 0-100 scale)
COUNTRY_LIVE_WEIGHT = 20

# How critical each chokepoint is to global shipping (used to weight route risk)
ROUTE_CRITICALITY = {
    "Hormuz": 0.95,
    "Bab-el-Mandeb": 0.85,
    "Suez": 0.80,
    "Malacca": 0.90,
    "Cape": 0.30,
}

CACHE_DURATION_SECONDS = 1800  # 30 minutes

_cache = {
    "country_state": None,
    "route_state": None,
    "global_state": None,
    "last_updated": 0,
}


def _refresh_all_live_data():
    """Fetches fresh news + AI scores for every country, route, and global factor."""
    print("[risk_scorer] Refreshing ALL live data from news + AI...")

    country_headlines = fetch_all_country_headlines()
    route_headlines = fetch_all_route_headlines()
    global_headlines = fetch_all_global_headlines()

    _cache["country_state"] = score_all(country_headlines)
    _cache["route_state"] = score_all(route_headlines)
    _cache["global_state"] = score_all(global_headlines)
    _cache["last_updated"] = time.time()


def _ensure_fresh(force_refresh: bool = False):
    now = time.time()
    cache_expired = (now - _cache["last_updated"]) > CACHE_DURATION_SECONDS

    if _cache["country_state"] is None or cache_expired or force_refresh:
        try:
            _refresh_all_live_data()
        except Exception as e:
            print(f"[risk_scorer] Live refresh failed: {e} - using last known data")
            if _cache["country_state"] is None:
                _cache["country_state"] = {iso: 0.3 for iso in COUNTRY_BASELINE}
                _cache["route_state"] = {r: 0.3 for r in ROUTE_CRITICALITY}
                _cache["global_state"] = {"opec_stability": 0.3, "brent_volatility": 0.3}


def get_live_state(force_refresh: bool = False) -> dict:
    """Returns all three live states together - useful for a debug/refresh endpoint."""
    _ensure_fresh(force_refresh)
    return {
        "countries": _cache["country_state"],
        "routes": _cache["route_state"],
        "global_factors": _cache["global_state"],
        "last_updated": datetime.fromtimestamp(_cache["last_updated"], tz=timezone.utc).isoformat(),
    }


def country_risk(iso: str) -> dict:
    _ensure_fresh()
    baseline = COUNTRY_BASELINE.get(iso, 50)
    live_score = _cache["country_state"].get(iso, 0.3)  # 0-1 scale
    final_score = min(100, baseline + live_score * COUNTRY_LIVE_WEIGHT)
    return {
        "score": round(final_score, 1),
        "baseline": baseline,
        "live_factor": round(live_score, 2),
        "confidence": 0.82,
        "drivers": ["sanctions", "political_stability", "recent_events"],
    }


def route_risk(passes_through: list[str]) -> dict:
    """
    passes_through: list of chokepoint names, e.g. ["Hormuz"]
    Each chokepoint contributes (live_risk_score * criticality * 100),
    averaged across all chokepoints the route uses.
    """
    _ensure_fresh()

    if not passes_through:
        return {"score": 0, "confidence": 0.78, "drivers": []}

    total = 0
    for chokepoint in passes_through:
        live_score = _cache["route_state"].get(chokepoint, 0.3)
        criticality = ROUTE_CRITICALITY.get(chokepoint, 0.5)
        total += live_score * criticality * 100

    avg_score = total / len(passes_through)
    return {
        "score": round(min(avg_score, 100), 1),
        "confidence": 0.78,
        "drivers": passes_through,
    }


def global_oil_risk() -> dict:
    _ensure_fresh()

    countries = _cache["country_state"]
    routes = _cache["route_state"]
    g = _cache["global_state"]

    avg_country_risk = sum(countries.values()) / len(countries)
    avg_route_risk = sum(routes.values()) / len(routes)

    score = int(
        0.35 * avg_route_risk * 100 +
        0.30 * avg_country_risk * 100 +
        0.20 * (1 - g.get("opec_stability", 0.5)) * 100 +
        0.15 * g.get("brent_volatility", 0.5) * 100
    )

    return {
        "score": min(score, 100),
        "confidence": 0.85,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "breakdown": {
            "avg_country_risk": round(avg_country_risk, 2),
            "avg_route_risk": round(avg_route_risk, 2),
            "opec_stability": g.get("opec_stability"),
            "brent_volatility": g.get("brent_volatility"),
        },
        "last_refreshed": datetime.fromtimestamp(_cache["last_updated"], tz=timezone.utc).isoformat() if _cache["last_updated"] else None,
    }