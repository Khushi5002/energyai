# Energy Resilience Command - Frontend
 
A React dashboard for monitoring India's crude-oil supply resilience. It combines global risk, supplier-country risk, maritime chokepoint risk, refinery context, and AI-assisted procurement recommendations.

For the complete project structure, response-field reference, static-data list, and implementation notes, see [PROJECT_REPORT.md](./PROJECT_REPORT.md).

## Tech stack

- React 19 and Vite
- React Router DOM
- Axios
- Tailwind CSS
- Recharts
- React Leaflet / Leaflet

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure the backend URL in `.env`:

   ```env
   VITE_API_URL=http://localhost:8001
   ```

3. Start the frontend:

   ```bash
   npm run dev
   ```

The backend must be running and reachable at `VITE_API_URL` for live data to load.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Creates a production build. |
| `npm run lint` | Runs Oxlint. |
| `npm run preview` | Serves the production build locally. |

## Application pages

| Path | Page | Description |
| --- | --- | --- |
| `/` | Overview | Global crude-supply risk gauge and India indicators. |
| `/countries` | Supplier Countries | Country baseline, live factor, final risk, and status. |
| `/routes` | Shipping Routes | Chokepoint risk map and route score cards. |
| `/india-impact` | India Impact | Strategic reserve, import dependency, and refinery data. |
| `/recommendations` | Procurement | On-demand, ranked sourcing recommendations. |

## Backend endpoints used

The frontend sends JSON HTTP requests to `${VITE_API_URL}`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/risk/global` | Global score, breakdown, and refresh timestamp. |
| `GET` | `/api/risk/countries` | Supplier-country risk entries. |
| `GET` | `/api/risk/routes` | Maritime chokepoint risk entries. |
| `GET` | `/api/suppliers` | Supplier capacity and sanction status. |
| `POST` | `/api/risk/refresh` | Refreshes live risk data. |
| `GET` | `/api/refineries` | Refinery capacity and crude compatibility data. |
| `GET` | `/api/recommend/explain` | Ranked procurement recommendations. |

The backend source and OpenAPI specification are not part of this repository. API field details in the project report are inferred from the frontend's actual use of each response.

## Key functionality

- Displays live global, country, and route risk values with safe/watch/high thresholds.
- Maps Hormuz, Bab-el-Mandeb, Suez, Malacca, and Cape chokepoints.
- Shows non-sanctioned supplier capacity distribution.
- Estimates India reserve pressure based on the global risk score.
- Lists refinery capacity and crude compatibility limits.
- Generates procurement recommendations with reliability, compatibility, delivery, and route context.
