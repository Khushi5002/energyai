# Energy Resilience AI

Energy Resilience AI monitors India's crude-oil supply resilience. The project combines a FastAPI backend that calculates country and shipping-route risk with a React dashboard for visualizing risk and producing procurement recommendations.

## Repository layout

```text
energyai/
├── backend/       # FastAPI API, risk scoring, recommendation logic
├── frontend/      # React/Vite dashboard
├── data/seeds/    # Supplier, refinery, grade, and chokepoint seed data
└── docker-compose.yml
```

## Requirements

- Git
- Python 3.11 or later
- Node.js 20 or later and npm
- A Groq API key (required for AI risk scoring and recommendation explanations)
- Optional: Docker Desktop, for MongoDB, Neo4j, Redis, and Qdrant
- Optional: a NewsAPI key, for live headlines; the backend uses built-in fallback headlines if it is omitted

## Clone and run

```bash
git clone https://github.com/Khushi5002/energyai.git
cd energyai
```

### 1. Configure and run the backend

Create and activate a virtual environment.

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

On macOS/Linux, activate it with `source venv/bin/activate` instead.

Copy the environment template and add your Groq key.

```powershell
Copy-Item .env.example .env
```

Set `GROQ_API_KEY` in `backend/.env`. You may also set `NEWSAPI_KEY` to use live news; otherwise the app falls back to bundled headlines.

Install the Python dependencies and start the API.

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Confirm that the backend is running at [http://localhost:8001/api/health](http://localhost:8001/api/health). It should return:

```json
{ "healthy": true }
```

### 2. Configure and run the frontend

Open a second terminal from the repository root.

```bash
cd frontend
npm ci
npm run dev
```

The dashboard is normally available at [http://localhost:5173](http://localhost:5173). Its default configuration uses `VITE_API_URL=http://localhost:8001`, which matches the backend command above.

### 3. Optional: run supporting data services

MongoDB and Neo4j are only needed for `backend/app/seed.py`; the current API reads the tracked JSON seed data directly. Redis and Qdrant are also included for future service integrations.

From the repository root:

```bash
docker compose up -d
```

To seed MongoDB and Neo4j after configuring the database variables in `backend/.env`:

```bash
cd backend
python -m app.seed
```

Stop the optional containers with:

```bash
docker compose down
```

## Validation commands

```bash
# Frontend
cd frontend
npm run lint
npm run build

# Backend health check (while the API is running)
curl http://localhost:8001/api/health
```

## Environment and version-control policy

- Do not commit `backend/.env`, API keys, or virtual environments.
- `backend/.env.example` is the safe template to copy.
- `backend/venv/`, Python caches, frontend `node_modules/`, and frontend build output are ignored by Git.
- The full frontend endpoint and structure documentation is in [frontend/PROJECT_REPORT.md](./frontend/PROJECT_REPORT.md).
