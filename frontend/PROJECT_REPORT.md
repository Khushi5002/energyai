# Energy Resilience Command — Frontend Report

## 1. Project summary

This repository contains the React frontend for **Energy Resilience Command**, a dashboard for monitoring India's crude-oil supply resilience. It presents live global, supplier-country, and shipping-route risk; refinery capacity context; and procurement recommendations.

The application is a Vite-powered React single-page application (SPA). It calls a separate backend whose base URL is supplied at build time through `VITE_API_URL` (the checked local configuration points to `http://localhost:8001`).

## 2. Technology stack

| Area | Technology |
| --- | --- |
| UI framework | React 19 |
| Build/dev server | Vite 8 |
| Routing | React Router DOM 7 |
| HTTP client | Axios |
| Styling | Tailwind CSS with project CSS variables |
| Charts | Recharts |
| Map | React Leaflet / Leaflet |
| Icons | Lucide React (installed; no direct import found) |

## 3. Project structure

```text
frontend/
├── public/
│   ├── favicon.svg              # Browser icon
│   └── icons.svg                # SVG icon asset
├── src/
│   ├── assets/                  # Image/SVG assets (includes hero.png)
│   ├── pages/
│   │   ├── Overview.jsx         # Global risk overview
│   │   ├── Countries.jsx        # Supplier-country risk table
│   │   ├── Routespage.jsx       # Chokepoint map and route-risk cards
│   │   ├── IndiaImpact.jsx      # SPR/import/refinery impact view
│   │   └── Recommendations.jsx  # On-demand procurement recommendations
│   ├── App.jsx                  # Standalone combined dashboard (not routed)
│   ├── Layout.jsx               # Sidebar navigation and route outlet
│   ├── RiskGauge.jsx            # Reusable SVG semicircle gauge
│   ├── InfoLabel.jsx            # Reusable hover-tooltip label
│   ├── main.jsx                 # React and router bootstrap
│   └── index.css                # Tailwind directives and design tokens
├── .env                         # Local frontend configuration; not commit-safe for secrets
├── index.html                   # Vite HTML shell
├── package.json                 # Scripts and dependencies
├── tailwind.config.js           # Tailwind content configuration
└── vite.config.js               # Vite/React configuration
```

### Runtime flow

```text
Browser → main.jsx → BrowserRouter → Layout sidebar → page component
                                                      ↓
                                          Axios + VITE_API_URL backend
                                                      ↓
                                    Recharts / Leaflet / tables / gauge
```

### Frontend routes

| URL path | View | Purpose |
| --- | --- | --- |
| `/` | Overview | Shows the current global supply-risk gauge and key India metrics. |
| `/countries` | Supplier Countries | Lists country baseline, live factor, final score, and status. |
| `/routes` | Shipping Routes | Maps and scores maritime chokepoints. |
| `/india-impact` | India Impact | Relates risk to strategic reserves and refinery compatibility. |
| `/recommendations` | Procurement | Generates ranked supplier recommendations on demand. |

## 4. Backend API endpoints consumed by the frontend

**Base URL:** `${VITE_API_URL}`. In the present local `.env`, this resolves to `http://localhost:8001`.

The backend source/OpenAPI definition is not present in this repository. The following contracts are therefore documented from the frontend's actual requests and the response fields it reads. All routes below are expected to return JSON.

| Method | Endpoint | Used by | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/risk/global` | Overview, India Impact, legacy combined dashboard | Fetches global score, component breakdown, and refresh time. |
| `GET` | `/api/risk/countries` | Supplier Countries, legacy combined dashboard | Fetches supplier-country risk entries. |
| `GET` | `/api/risk/routes` | Shipping Routes, legacy combined dashboard | Fetches maritime chokepoint risk entries. |
| `GET` | `/api/suppliers` | Legacy combined dashboard | Fetches supplier capacity and sanction status used for the supply-mix chart. |
| `POST` | `/api/risk/refresh` | Legacy combined dashboard | Requests a refresh of live risk data; no request body is sent. |
| `GET` | `/api/refineries` | India Impact | Fetches Indian refinery capacity and crude compatibility data. |
| `GET` | `/api/recommend/explain` | Procurement | Generates/returns AI-ranked procurement recommendations. |

### Observed response shapes

#### `GET /api/risk/global`

```json
{
  "score": 0,
  "breakdown": {
    "avg_country_risk": 0.0,
    "avg_route_risk": 0.0,
    "opec_stability": 0.0,
    "brent_volatility": 0.0
  },
  "last_refreshed": "ISO-8601 timestamp"
}
```

`score` is displayed as a 0–100 global-risk value. The legacy dashboard describes its weighting as route risk 35%, country risk 30%, OPEC instability 20%, and price volatility 15%.

#### `GET /api/risk/countries`

```json
[
  {
    "iso": "SAU",
    "baseline": 0,
    "live_factor": 0.0,
    "score": 0
  }
]
```

The UI sorts results by descending `score`. Scores above 70 are **HIGH RISK**, scores above 40 are **WATCH**, and all others are **STABLE**.

#### `GET /api/risk/routes`

```json
[
  {
    "route": "Hormuz",
    "score": 0
  }
]
```

Recognized map route names are `Hormuz`, `Bab-el-Mandeb`, `Suez`, `Malacca`, and `Cape`.

#### `GET /api/suppliers`

```json
[
  {
    "country": "Saudi Arabia",
    "capacity_bpd": 0,
    "sanctioned": false
  }
]
```

Only entries where `sanctioned` is false are included in the supply-capacity doughnut chart.

#### `GET /api/refineries`

```json
[
  {
    "name": "Refinery name",
    "capacity_bpd": 0,
    "api_min": 0,
    "api_max": 0,
    "sulfur_max_pct": 0
  }
]
```

#### `GET /api/recommend/explain`

```json
{
  "recommendations": [
    {
      "supplier": "Supplier name",
      "country": "Country name",
      "composite_score": 0,
      "route_chokepoints": ["Hormuz"],
      "estimated_delivery_days": 0,
      "reliability": 0.0,
      "compatibility": 0.0,
      "country_risk": 0,
      "route_risk": 0,
      "explanation": "Recommendation rationale"
    }
  ]
}
```

The interface states that a lower composite score is better and describes the formula as: country risk 30%, route risk 25%, inverse reliability 20%, inverse compatibility 15%, and distance factor 10%.

## 5. Functional feature list

1. **Client-side navigation** — persistent desktop sidebar links to the five dashboard views.
2. **Global risk monitoring** — retrieves and visualizes the current 0–100 global crude-supply risk score using a reusable SVG gauge.
3. **Risk breakdown** — exposes country, route, OPEC-stability, and Brent-volatility components with explanatory tooltips in the legacy combined dashboard.
4. **Live data refresh** — posts a refresh request and reloads global, country, route, and supplier data in the legacy combined dashboard.
5. **Supplier-country risk analysis** — retrieves country data, sorts it by risk, and assigns Stable/Watch/High Risk status.
6. **Shipping-route monitoring** — displays returned chokepoint scores as colored markers on a dark Carto map and as score cards.
7. **Supply capacity mix** — calculates each non-sanctioned supplier's percentage of total reported capacity and displays it in a doughnut chart.
8. **India impact estimation** — calculates an estimated days-until-critical value from the fetched global score and the fixed SPR coverage value.
9. **Refinery compatibility display** — lists refinery capacity, API gravity range, and maximum sulfur tolerance.
10. **On-demand procurement recommendations** — calls the recommendation endpoint only when the user selects **Generate**, then displays ranked recommendations and supporting metrics.
11. **Data explanations** — reusable hover tooltips define risk, reliability, compatibility, and chart metrics.
12. **Responsive layout** — page content adapts to smaller screens; the sidebar is hidden below the large-screen breakpoint.

## 6. Static/reference content list

These values are rendered from frontend constants rather than retrieved from the backend.

| Location | Static content |
| --- | --- |
| `Layout.jsx` | Navigation labels and route paths. |
| `Countries.jsx` | ISO-to-country-name mapping: SAU, ARE, KWT, QAT, IRN, RUS, NGA, BRA, USA. |
| `Routespage.jsx` | Coordinates for Hormuz, Bab-el-Mandeb, Suez, Malacca, and Cape. |
| `Overview.jsx` | SPR coverage `9.5` days, import dependence `88%`, and Hormuz transit share `~30–45%`. |
| `IndiaImpact.jsx` | SPR coverage constant `9.5` days and the days-until-critical calculation formula. |
| `App.jsx` | Risk thresholds, doughnut colors, risk weighting/explanatory text, and chart configuration. |
| `index.css` | Dark theme tokens, fonts, colors, and live-status pulse animation. |
| `Routespage.jsx` | Carto dark basemap URL. |

### Static thresholds and calculations

- Risk colour/status thresholds: `score > 70` danger/high risk; `score > 40` warning/watch; otherwise safe/stable.
- India-impact estimate: `max(1, round(9.5 × (1 - globalScore / 150)))` days.
- Supply-mix percentage: `(supplier capacity_bpd / total non-sanctioned capacity_bpd) × 100`.
- Recommendation composite-score interpretation: lower is better.

## 7. Local development

```bash
npm install
npm run dev
```

Available package scripts:

| Command | Result |
| --- | --- |
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Creates a production build. |
| `npm run lint` | Runs Oxlint. |
| `npm run preview` | Serves the production build locally. |

Ensure the backend is reachable at the configured `VITE_API_URL` before using data-driven screens.

## 8. Implementation notes

- `App.jsx` contains a complete combined dashboard but is not mounted by `main.jsx`; the router uses the individual pages instead. It is best treated as a legacy/alternate view until it is explicitly routed or removed.
- Requests do not currently show user-facing error states or cancellation handling. A failed backend request can leave a page empty or a button loading indefinitely.
- The frontend provides no authentication headers or API versioning. Any authentication, authorization, CORS, and detailed validation rules must be defined by the backend.
- `README.md` is still the default Vite template; this report is the project-specific documentation.
