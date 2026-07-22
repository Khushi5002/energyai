import { useState } from "react";
import axios from "axios";
import InfoLabel from "../InfoLabel";

const API = import.meta.env.VITE_API_URL;

export default function Recommendations() {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const r = await axios.get(`${API}/api/recommend/explain`);
    setRecs(r.data.recommendations);
    setLoading(false);
  };

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Procurement Recommendations</h1>
          <p className="text-xs text-zinc-500 mt-1 font-mono-data">
            AI-ranked sourcing options based on live risk, reliability, and refinery compatibility
          </p>
        </div>
        <button
          onClick={generate}
          className="text-xs font-mono-data px-4 py-2 rounded-lg font-medium shrink-0"
          style={{ background: "var(--accent-amber)", color: "#0B0E14" }}
        >
          {loading ? "ANALYZING..." : "GENERATE"}
        </button>
      </header>

      {recs.length === 0 && (
        <div className="rounded-xl p-16 text-center text-zinc-600 text-sm font-mono-data" style={{ background: "var(--panel)", border: "1px solid var(--panel-border)" }}>
          Click "GENERATE" to run the procurement orchestrator against live risk data.
        </div>
      )}

      <div className="space-y-4">
        {recs.map((r, i) => (
          <div key={i} className="rounded-xl p-5" style={{ background: "var(--panel)", border: "1px solid var(--panel-border)" }}>
            <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
              <div>
                <span className="font-mono-data text-xs" style={{ color: "var(--accent-amber)" }}>#{i + 1}</span>
                <span className="ml-2 font-semibold">{r.supplier}</span>
                <span className="text-zinc-500 text-xs ml-2">({r.country})</span>
              </div>
              <InfoLabel
                label={<span className="font-mono-data text-xs text-zinc-500">composite score {r.composite_score}</span>}
                tooltip="Lower is better. Combines: 30% country risk + 25% route risk + 20% (1 - reliability) + 15% (1 - compatibility) + 10% distance factor."
              />
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] uppercase tracking-wide text-zinc-600">via route:</span>
              {r.route_chokepoints?.length > 0 ? (
                r.route_chokepoints.map((cp, idx) => (
                  <span key={idx} className="text-[11px] font-mono-data px-2 py-0.5 rounded" style={{ background: "#1B2233", color: "var(--accent-amber)" }}>
                    {cp}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-zinc-500">direct / no chokepoint</span>
              )}
              <span className="text-[11px] text-zinc-600 ml-1">· {r.estimated_delivery_days} days ETA</span>
            </div>

            <div className="flex flex-wrap gap-3 mb-3 text-[11px] font-mono-data">
              <InfoLabel label={<span className="text-zinc-400">reliability {(r.reliability * 100).toFixed(0)}%</span>} tooltip="How consistently this supplier has historically met delivery commitments." />
              <InfoLabel label={<span className="text-zinc-400">compatibility {(r.compatibility * 100).toFixed(0)}%</span>} tooltip="How well this crude grade's density and sulfur content match the destination refinery's processing range." />
              <InfoLabel label={<span className="text-zinc-400">country risk {r.country_risk}</span>} tooltip="Supplier's country risk score (0-100) at generation time." />
              <InfoLabel label={<span className="text-zinc-400">route risk {r.route_risk}</span>} tooltip="Shipment route risk score (0-100) at generation time." />
            </div>

            <p className="text-sm text-zinc-400 leading-relaxed">{r.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}