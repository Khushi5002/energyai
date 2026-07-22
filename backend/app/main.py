import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.services import risk_scorer
from app.services import procurement
from app.services import explainer

from app.services.risk_scorer import (
    get_live_state,
    country_risk,
    route_risk,
    COUNTRY_BASELINE,
    ROUTE_CRITICALITY,
)

app = FastAPI(title="Energy Resilience AI")

# Comma-separated origins allow each environment to explicitly control which
# frontend deployments can call the API. Keep local development working by
# default; set CORS_ORIGINS to the production Vercel URL on Render.
cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# HEALTH
# ---------------------------------------------------------

@app.get("/api/health")
def health():
    return {"healthy": True}


# ---------------------------------------------------------
# RISK APIs
# ---------------------------------------------------------

@app.get("/api/risk/global")
def risk_global():
    return risk_scorer.global_oil_risk()


@app.get("/api/risk/country/{iso}")
def risk_country_endpoint(iso: str):
    return {
        "iso": iso.upper(),
        **country_risk(iso.upper())
    }


@app.get("/api/risk/route")
def risk_route_endpoint(chokepoints: str = ""):
    cps = [c.strip() for c in chokepoints.split(",") if c.strip()]
    return route_risk(cps)


@app.get("/api/risk/countries")
def risk_countries():
    """
    Returns risk score for every supplier country.
    Used by frontend country map/table.
    """
    return [
        {
            "iso": iso,
            **country_risk(iso)
        }
        for iso in COUNTRY_BASELINE
    ]


@app.get("/api/risk/routes")
def risk_routes_all():
    """
    Returns risk score for every shipping route/chokepoint.
    Used by frontend route visualization.
    """
    return [
        {
            "route": route,
            **route_risk([route])
        }
        for route in ROUTE_CRITICALITY
    ]


@app.post("/api/risk/refresh")
def refresh_risk():
    """
    Forces refresh of live news and AI scoring.
    """
    state = get_live_state(force_refresh=True)

    return {
        "refreshed": True,
        "state": state
    }


# ---------------------------------------------------------
# PROCUREMENT
# ---------------------------------------------------------

@app.get("/api/recommend/procurement")
def recommend(volume: int = 500000):
    return {
        "recommendations": procurement.recommend(volume)
    }


@app.get("/api/recommend/explain")
def recommend_with_explain(volume: int = 500000):
    recs = procurement.recommend(volume, max_results=3)

    for rec in recs:
        rec["explanation"] = explainer.explain_recommendation(rec)

    return {
        "recommendations": recs
    }


# ---------------------------------------------------------
# SUPPLIERS
# ---------------------------------------------------------

@app.get("/api/suppliers")
def suppliers_list():
    """
    Returns supplier data for frontend charts.
    """
    return procurement.SUPPLIERS

@app.get("/api/refineries")
def refineries_list():
    """
    Returns refinery data for frontend.
    """
    return procurement.REFINERIES
