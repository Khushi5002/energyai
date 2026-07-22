import { useEffect, useState } from "react";
import axios from "axios";
import RiskGauge from "../RiskGauge";

const API = import.meta.env.VITE_API_URL;

export default function Overview() {
  const [global, setGlobal] = useState(null);

  useEffect(() => {
    axios.get(`${API}/api/risk/global`).then(r => setGlobal(r.data));
  }, []);

  return (
    <div>
      <header className="mb-6 sm:mb-10">
        <h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Overview</h1>
        <p className="text-xs leading-relaxed text-zinc-500 mt-1 font-mono-data">
          Real-time snapshot of India's crude oil supply chain risk
        </p>
      </header>

      <div className="rounded-xl p-5 sm:p-8 lg:p-10 flex flex-col items-center" style={{ background: "var(--panel)", border: "1px solid var(--panel-border)" }}>
        <RiskGauge score={global?.score ?? 0} label="GLOBAL OIL SUPPLY RISK" />
        <p className="text-sm text-zinc-500 text-center mt-6 max-w-md leading-relaxed">
          {global && global.score > 60
            ? "Elevated risk detected. Review Supplier Countries and Shipping Routes for specifics, or jump to Procurement for rerouting options."
            : "Supply conditions are currently within normal range across monitored routes and suppliers."}
        </p>
        <div className="text-xs text-zinc-600 mt-4 font-mono-data">
          Last refreshed: {global?.last_refreshed ? new Date(global.last_refreshed).toLocaleTimeString() : "—"}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
        {[
          { label: "SPR DAYS OF COVER", value: "9.5", note: "India's strategic reserve buffer" },
          { label: "CRUDE IMPORT DEPENDENCE", value: "88%", note: "Share of India's oil that is imported" },
          { label: "HORMUZ TRANSIT SHARE", value: "~30-45%", note: "Of imports historically routed via Hormuz" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl p-4 sm:p-5" style={{ background: "var(--panel)", border: "1px solid var(--panel-border)" }}>
            <div className="text-2xl font-mono-data font-semibold" style={{ color: "var(--accent-amber)" }}>{s.value}</div>
            <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
            <div className="text-[11px] text-zinc-600 mt-1">{s.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
