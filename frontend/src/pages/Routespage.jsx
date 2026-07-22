import { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const API = import.meta.env.VITE_API_URL;

const CHOKEPOINT_COORDS = {
  Hormuz: [26.57, 56.25],
  "Bab-el-Mandeb": [12.58, 43.33],
  Suez: [30.55, 32.35],
  Malacca: [2.5, 101.5],
  Cape: [-34.35, 18.47],
};

function riskColor(score) {
  return score > 70 ? "#E85D4A" : score > 40 ? "#E0A83E" : "#4FAE8B";
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    axios.get(`${API}/api/risk/routes`).then(r => setRoutes(r.data));
  }, []);

  return (
    <div>
      <header className="mb-6 sm:mb-8">
        <h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Shipping Routes</h1>
        <p className="max-w-2xl text-xs leading-relaxed text-zinc-500 mt-1 font-mono-data">
          Live risk across India's key maritime chokepoints, sized by criticality to global oil flow
        </p>
      </header>

      <div className="h-[260px] sm:h-[360px] lg:h-[400px] rounded-xl overflow-hidden mb-4 sm:mb-6" style={{ border: "1px solid var(--panel-border)" }}>
        <MapContainer center={[15, 60]} zoom={3} style={{ height: "100%", background: "#0B0E14" }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" />
          {routes.map((r, i) => (
            <CircleMarker
              key={i}
              center={CHOKEPOINT_COORDS[r.route] || [0, 0]}
              radius={14}
              pathOptions={{ color: riskColor(r.score), fillColor: riskColor(r.score), fillOpacity: 0.6 }}
            >
              <Popup>{r.route}: risk {r.score}/100</Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {routes.map((r, i) => (
          <div key={i} className="rounded-xl p-3 sm:p-4" style={{ background: "var(--panel)", border: "1px solid var(--panel-border)" }}>
            <div className="text-xs text-zinc-500">{r.route}</div>
            <div className="text-2xl font-mono-data font-semibold mt-1" style={{ color: riskColor(r.score) }}>{r.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
