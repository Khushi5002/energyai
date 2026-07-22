"""
news_collector.py
------------------
Fetches real, live headlines for:
1. Each supplier country (political stability / sanctions risk)
2. Each shipping chokepoint/route (conflict, attacks, blockages)
3. Global market factors (OPEC stability, Brent volatility)

Uses NewsAPI and filters results to keep only relevant headlines.
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

NEWSAPI_KEY = os.environ.get("NEWSAPI_KEY")

# ----------------------------
# COUNTRY SEARCH QUERIES
# ----------------------------
COUNTRY_QUERIES = {
    "SAU": "Saudi Arabia oil political stability",
    "ARE": "UAE oil political stability",
    "KWT": "Kuwait oil political stability",
    "QAT": "Qatar oil political stability",
    "IRN": "Iran oil sanctions",
    "RUS": "Russia oil sanctions",
    "NGA": "Nigeria oil pipeline instability",
    "BRA": "Brazil oil political stability",
    "USA": "USA oil political stability",
}

# ----------------------------
# ROUTE SEARCH QUERIES
# ----------------------------
ROUTE_QUERIES = {
    "Hormuz": "Strait of Hormuz oil tension",
    "Bab-el-Mandeb": "Red Sea shipping attack Houthi",
    "Suez": "Suez Canal shipping disruption",
    "Malacca": "Strait of Malacca shipping security",
    "Cape": "Cape of Good Hope shipping route",
}

# ----------------------------
# GLOBAL FACTORS
# ----------------------------
GLOBAL_QUERIES = {
    "opec_stability": "OPEC oil production decision",
    "brent_volatility": "Brent crude oil price volatility",
}

# ----------------------------
# KEYWORDS FOR FILTERING
# ----------------------------

COUNTRY_NAME_KEYWORDS = {
    "SAU": ["saudi"],
    "ARE": ["uae", "emirates", "abu dhabi", "dubai"],
    "KWT": ["kuwait"],
    "QAT": ["qatar"],
    "IRN": ["iran"],
    "RUS": ["russia", "russian", "moscow"],
    "NGA": ["nigeria", "nigerian"],
    "BRA": ["brazil", "brazilian", "petrobras"],
    "USA": ["u.s.", "us ", "united states", "america", "shale"],
}

OIL_SUPPLY_TERMS = [
    "production", "export", "output", "refinery", "refining",
    "drilling", "pipeline", "supply", "sanctions", "crude",
]

ROUTE_KEYWORDS = {
    "Hormuz": ["hormuz"],
    "Bab-el-Mandeb": ["red sea", "houthi", "yemen", "bab-el-mandeb"],
    "Suez": ["suez"],
    "Malacca": ["malacca"],
    "Cape": ["cape of good hope", "cape route"],
}

# ----------------------------
# FALLBACK HEADLINES
# ----------------------------

FALLBACK_HEADLINES = {
    "SAU": ["Saudi Arabia maintains stable oil production policy"],
    "ARE": ["UAE continues steady oil export operations"],
    "KWT": ["Kuwait oil exports remain stable"],
    "QAT": ["Qatar LNG and oil exports proceed normally"],
    "IRN": ["US tightens sanctions on Iranian crude exports"],
    "RUS": ["New Western sanctions target Russian oil exports"],
    "NGA": ["Nigeria pipeline vandalism disrupts some oil output"],
    "BRA": ["Brazil oil production continues to grow steadily"],
    "USA": ["US oil production remains at record levels"],

    "Hormuz": [
        "Tensions rise near Strait of Hormuz amid Iran-US standoff"
    ],
    "Bab-el-Mandeb": [
        "Houthi forces target commercial vessel in Red Sea"
    ],
    "Suez": [
        "Suez Canal traffic proceeds normally"
    ],
    "Malacca": [
        "Strait of Malacca shipping lanes remain secure"
    ],
    "Cape": [
        "Cape of Good Hope route sees increased traffic"
    ],

    "opec_stability": [
        "OPEC+ considers emergency production adjustment"
    ],
    "brent_volatility": [
        "Oil prices swing as markets weigh supply risks"
    ],
}


# -------------------------------------------------------
# FILTER IRRELEVANT HEADLINES
# -------------------------------------------------------

def _filter_relevant(headlines: list[str], name_keywords: list[str]) -> list[str]:
    """
    Keep only headlines that mention this country/route AND relate to
    its own oil supply (not just political involvement in another crisis).
    """
    if not name_keywords:
        return headlines

    relevant = []

    for headline in headlines:
        headline_lower = headline.lower()
        mentions_topic = any(kw.lower() in headline_lower for kw in name_keywords)
        mentions_oil_context = any(term in headline_lower for term in OIL_SUPPLY_TERMS)

        if mentions_topic and mentions_oil_context:
            relevant.append(headline)

    return relevant


# -------------------------------------------------------
# FETCH HEADLINES
# -------------------------------------------------------

def _fetch_headlines(query: str, fallback_key: str, page_size: int = 5) -> list[str]:
    """
    Shared NewsAPI fetch function.
    """

    if not NEWSAPI_KEY:
        print(f"[INFO] NEWSAPI key missing. Using fallback for {fallback_key}")
        return FALLBACK_HEADLINES.get(fallback_key, [])

    url = "https://newsapi.org/v2/everything"

    params = {
        "q": query,
        "apiKey": NEWSAPI_KEY,
        "pageSize": page_size,
        "sortBy": "publishedAt",
        "language": "en",
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()

        articles = data.get("articles", [])

        headlines = [
            article["title"]
            for article in articles
            if article.get("title")
        ]

        print(f"\n[DEBUG] {fallback_key}")

        if headlines:
            for headline in headlines:
                print(" •", headline)
        else:
            print("No headlines returned.")

        return headlines if headlines else FALLBACK_HEADLINES.get(fallback_key, [])

    except Exception as e:
        print(f"[ERROR] {fallback_key}: {e}")
        return FALLBACK_HEADLINES.get(fallback_key, [])


# -------------------------------------------------------
# COUNTRY HEADLINES
# -------------------------------------------------------

def fetch_all_country_headlines():

    result = {}

    for iso, query in COUNTRY_QUERIES.items():

        raw = _fetch_headlines(query, iso)

        filtered = _filter_relevant(
            raw,
            COUNTRY_NAME_KEYWORDS.get(iso, [])
        )

        if filtered:
            result[iso] = filtered
        else:
            result[iso] = FALLBACK_HEADLINES.get(iso, [])

    return result


# -------------------------------------------------------
# ROUTE HEADLINES
# -------------------------------------------------------

def fetch_all_route_headlines():

    result = {}

    for route, query in ROUTE_QUERIES.items():

        raw = _fetch_headlines(query, route)

        filtered = _filter_relevant(
            raw,
            ROUTE_KEYWORDS.get(route, [])
        )

        if filtered:
            result[route] = filtered
        else:
            result[route] = FALLBACK_HEADLINES.get(route, [])

    return result


# -------------------------------------------------------
# GLOBAL HEADLINES
# -------------------------------------------------------

def fetch_all_global_headlines():

    result = {}

    for factor, query in GLOBAL_QUERIES.items():

        result[factor] = _fetch_headlines(query, factor)

    return result


# -------------------------------------------------------
# TEST
# -------------------------------------------------------

if __name__ == "__main__":

    print("\n============================")
    print("COUNTRY HEADLINES")
    print("============================")

    countries = fetch_all_country_headlines()

    for country, headlines in countries.items():
        print(f"\n{country}")
        for h in headlines:
            print(" -", h)

    print("\n============================")
    print("ROUTE HEADLINES")
    print("============================")

    routes = fetch_all_route_headlines()

    for route, headlines in routes.items():
        print(f"\n{route}")
        for h in headlines:
            print(" -", h)

    print("\n============================")
    print("GLOBAL HEADLINES")
    print("============================")

    globals_ = fetch_all_global_headlines()

    for factor, headlines in globals_.items():
        print(f"\n{factor}")
        for h in headlines:
            print(" -", h)