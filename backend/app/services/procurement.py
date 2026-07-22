"""
procurement.py
--------------
The Adaptive Procurement Orchestrator.

Given current risk scores (live, from real news) and static supplier/refinery
data, this ranks the best crude oil sourcing options for India.

Fix applied: previously, one supplier with great compatibility across
multiple refineries could occupy ALL the top recommendation slots.
Now we pick each supplier's single best refinery/grade match first, THEN
rank across suppliers - giving a diverse, more realistic set of options.
"""

import json
from pathlib import Path
from app.services.risk_scorer import country_risk, route_risk

SEED = Path(__file__).parent.parent.parent.parent / "data" / "seeds"
SUPPLIERS = json.loads((SEED / "suppliers.json").read_text())
REFINERIES = json.loads((SEED / "refineries.json").read_text())
GRADES = json.loads((SEED / "crude_grades.json").read_text())

# Which chokepoints does each supplier's shipment pass through to reach India
SUPPLIER_ROUTES = {
    "SAU": ["Hormuz"],
    "ARE": ["Hormuz"],
    "KWT": ["Hormuz"],
    "QAT": ["Hormuz"],
    "IRN": ["Hormuz"],
    "RUS": ["Suez"],
    "NGA": ["Cape"],
    "BRA": ["Cape"],
    "USA": ["Cape"],
}


def compatibility(grade: dict, refinery: dict) -> float:
    """
    How well does this crude grade suit this refinery's configuration?
    Based on API gravity (density/lightness) and sulfur content matching
    the refinery's processing range.
    """
    if not (refinery["api_min"] <= grade["api"] <= refinery["api_max"]):
        return 0.2
    if grade["sulfur_pct"] > refinery["sulfur_max_pct"]:
        return 0.3
    api_span = refinery["api_max"] - refinery["api_min"]
    api_fit = 1 - abs(grade["api"] - (refinery["api_min"]+refinery["api_max"])/2) / api_span
    sulfur_fit = 1 - (grade["sulfur_pct"] / refinery["sulfur_max_pct"])
    return round(0.6*api_fit + 0.4*sulfur_fit, 2)


def recommend(volume_bpd: int = 500000, max_results: int = 5):
    all_matches = []

    for sup in SUPPLIERS:
        if sup["sanctioned"]:
            continue

        crisk = country_risk(sup["iso"])["score"]
        rroute = route_risk(SUPPLIER_ROUTES.get(sup["iso"], []))["score"]
        sup_grades = [g for g in GRADES if g["supplier"] == sup["name"]]

        best_match_for_supplier = None

        for g in sup_grades:
            for r in REFINERIES:
                compat = compatibility(g, r)
                if compat < 0.3:
                    continue

                cost = (
                    0.30*crisk + 0.25*rroute
                    + 0.20*(1-sup["reliability"])*100
                    + 0.15*(1-compat)*100
                    + 0.10*(50 if "Cape" in SUPPLIER_ROUTES.get(sup["iso"], []) else 20)
                )

                candidate = {
                    "supplier": sup["name"],
                    "country": sup["country"],
                    "grade": g["name"],
                    "refinery": r["name"],
                    "route_chokepoints": SUPPLIER_ROUTES.get(sup["iso"], []),
                    "country_risk": crisk,
                    "route_risk": rroute,
                    "reliability": sup["reliability"],
                    "compatibility": compat,
                    "composite_score": round(cost, 2),
                    "estimated_delivery_days": 15 if "Cape" in SUPPLIER_ROUTES.get(sup["iso"], []) else 8,
                }

                if best_match_for_supplier is None or candidate["composite_score"] < best_match_for_supplier["composite_score"]:
                    best_match_for_supplier = candidate

        if best_match_for_supplier:
            all_matches.append(best_match_for_supplier)

    all_matches.sort(key=lambda x: x["composite_score"])
    return all_matches[:max_results]