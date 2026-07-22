import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const SPR_DAYS = 9.5;

export default function IndiaImpact() {
  const [refineries, setRefineries] = useState([]);
  const [global, setGlobal] = useState(null);

  useEffect(() => {
    axios.get(`${API}/api/refineries`).then(r => setRefineries(r.data));
    axios.get(`${API}/api/risk/global`).then(r => setGlobal(r.data));
  }, []);

  const daysUntilCritical = global ? Math.max(1, Math.round(SPR_DAYS * (1 - global.score / 150))) : SPR_DAYS;

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold">India Impact</h1>
        <p className="text-xs text-zinc-500 mt-1 font-mono-data">
          What today's risk level means for India's actual reserves and refining capacity
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl p-6" style={{ background: "var(--panel)", border: "1px solid var(--panel-border)" }}>
          <div className="text-xs text-zinc-500 mb-2">STRATEGIC PETROLEUM RESERVE</div>
          <div className="text-4xl font-mono-data font-semibold" style={{ color: "var(--accent-amber)" }}>{SPR_DAYS} days</div>
          <p className="text-xs text-zinc-500 mt-3 leading-relaxed">
            India's SPR provides {SPR_DAYS} days of national consumption cover. At the current global risk score
            ({global?.score ?? "—"}/100), sustained disruption at this severity would put meaningful pressure
            on the reserve within roughly {daysUntilCritical} days if imports were fully halted.
          </p>
        </div>

        <div className="rounded-xl p-6" style={{ background: "var(--panel)", border: "1px solid var(--panel-border)" }}>
          <div className="text-xs text-zinc-500 mb-2">IMPORT DEPENDENCE</div>
          <div className="text-4xl font-mono-data font-semibold" style={{ color: "var(--accent-amber)" }}>88%</div>
          <p className="text-xs text-zinc-500 mt-3 leading-relaxed">
            Share of India's crude oil that is imported, with historically 30-45% transiting the Strait of Hormuz —
            the single most-monitored chokepoint on this dashboard.
          </p>
        </div>
      </div>

      <div className="rounded-xl p-6" style={{ background: "var(--panel)", border: "1px solid var(--panel-border)" }}>
        <div className="text-xs text-zinc-500 mb-4 font-mono-data">REFINERY CAPACITY & CRUDE COMPATIBILITY RANGE</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-zinc-500 border-b" style={{ borderColor: "var(--panel-border)" }}>
              <th className="pb-3">Refinery</th>
              <th className="pb-3">Capacity (bpd)</th>
              <th className="pb-3">API Range</th>
              <th className="pb-3">Max Sulfur %</th>
            </tr>
          </thead>
          <tbody>
            {refineries.map((r, i) => (
              <tr key={i} className="border-b last:border-0 text-zinc-300" style={{ borderColor: "var(--panel-border)" }}>
                <td className="py-3">{r.name}</td>
                <td className="py-3 font-mono-data">{r.capacity_bpd.toLocaleString()}</td>
                <td className="py-3 font-mono-data">{r.api_min}–{r.api_max}</td>
                <td className="py-3 font-mono-data">{r.sulfur_max_pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}