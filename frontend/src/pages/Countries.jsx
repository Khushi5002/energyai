import { useEffect, useState } from "react";
import axios from "axios";
import InfoLabel from "../InfoLabel";

const API = import.meta.env.VITE_API_URL;

function riskColor(score) {
  return score > 70 ? "var(--accent-danger)" : score > 40 ? "var(--accent-warn)" : "var(--accent-safe)";
}

const COUNTRY_NAMES = { SAU: "Saudi Arabia", ARE: "UAE", KWT: "Kuwait", QAT: "Qatar", IRN: "Iran", RUS: "Russia", NGA: "Nigeria", BRA: "Brazil", USA: "USA" };

export default function Countries() {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    axios.get(`${API}/api/risk/countries`).then(r => setCountries(r.data.sort((a, b) => b.score - a.score)));
  }, []);

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold">Supplier Countries</h1>
        <p className="text-xs text-zinc-500 mt-1 font-mono-data">
          Baseline risk + live news-derived adjustment, for every country India sources crude from
        </p>
      </header>

      <div className="rounded-xl overflow-hidden" style={{ background: "var(--panel)", border: "1px solid var(--panel-border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-zinc-500 font-mono-data border-b" style={{ borderColor: "var(--panel-border)" }}>
              <th className="p-4">Country</th>
              <th className="p-4">
                <InfoLabel label="Baseline" tooltip="Fixed starting risk estimate based on general political/sanctions history." />
              </th>
              <th className="p-4">
                <InfoLabel label="Live Factor" tooltip="Today's AI-scored news severity (0-1) for this country's oil supply." />
              </th>
              <th className="p-4">Final Score</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {countries.map((c, i) => (
              <tr key={i} className="border-b last:border-0" style={{ borderColor: "var(--panel-border)" }}>
                <td className="p-4 font-medium">{COUNTRY_NAMES[c.iso] || c.iso} <span className="text-zinc-600 text-xs">({c.iso})</span></td>
                <td className="p-4 font-mono-data text-zinc-400">{c.baseline}</td>
                <td className="p-4 font-mono-data text-zinc-400">{c.live_factor}</td>
                <td className="p-4 font-mono-data font-semibold" style={{ color: riskColor(c.score) }}>{c.score}</td>
                <td className="p-4">
                  <span className="text-[11px] px-2 py-1 rounded font-mono-data" style={{ background: "#1B2233", color: riskColor(c.score) }}>
                    {c.score > 70 ? "HIGH RISK" : c.score > 40 ? "WATCH" : "STABLE"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}