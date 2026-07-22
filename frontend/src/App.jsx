import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer, PieChart, Pie, Tooltip } from "recharts";
import RiskGauge from "./RiskGauge";
import InfoLabel from "./InfoLabel";
import Recommendations from "./pages/Recommendations";

const API = import.meta.env.VITE_API_URL;

const DONUT_COLORS = ["#D4A24C", "#4FAE8B", "#6B8FE0", "#E0A83E", "#8B93A7", "#E85D4A", "#B47EE5", "#5FC9E8"];

function riskColor(score) {
  return score > 70 ? "var(--accent-danger)" : score > 40 ? "var(--accent-warn)" : "var(--accent-safe)";
}

export default function App() {
  const [global, setGlobal] = useState(null);
  const [countries, setCountries] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = async () => {
    const [g, c, r, s] = await Promise.all([
      axios.get(`${API}/api/risk/global`),
      axios.get(`${API}/api/risk/countries`),
      axios.get(`${API}/api/risk/routes`),
      axios.get(`${API}/api/suppliers`),
    ]);
    setGlobal(g.data);
    setCountries(c.data.sort((a, b) => b.score - a.score));
    setRoutes(r.data.sort((a, b) => b.score - a.score));
    setSuppliers(s.data);
  };

  useEffect(() => { loadAll(); }, []);

  const forceRefresh = async () => {
    setRefreshing(true);
    await axios.post(`${API}/api/risk/refresh`);
    await loadAll();
    setRefreshing(false);
  };



  // Build supply mix with % share for the legend
  const activeSuppliers = suppliers.filter(s => !s.sanctioned);
  const totalCapacity = activeSuppliers.reduce((sum, s) => sum + s.capacity_bpd, 0);
  const supplierMix = activeSuppliers.map(s => ({
    name: s.country,
    value: s.capacity_bpd,
    pct: totalCapacity ? ((s.capacity_bpd / totalCapacity) * 100).toFixed(1) : 0,
  }));

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:p-10">
      {/* Header */}
      <header className="flex flex-col items-start justify-between gap-4 mb-6 pb-5 border-b sm:mb-10 sm:flex-row sm:items-center" style={{ borderColor: "var(--panel-border)" }}>
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
            ENERGY RESILIENCE <span style={{ color: "var(--accent-amber)" }}>COMMAND</span>
          </h1>
          <p className="text-[11px] leading-relaxed text-zinc-500 mt-1 font-mono-data">
            INDIA CRUDE SUPPLY · AUTONOMOUS PROCUREMENT INTELLIGENCE
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono-data text-zinc-400">
          <span className="w-2 h-2 rounded-full live-dot" style={{ background: "var(--accent-safe)" }}></span>
          LIVE
        </div>
      </header>

      {/* Hero row: Gauge + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="rounded-xl p-5 sm:p-6 flex flex-col items-center justify-center" style={{ background: "var(--panel)", border: "1px solid var(--panel-border)" }}>
          <RiskGauge score={global?.score ?? 0} label="GLOBAL OIL SUPPLY RISK" />
          <p className="text-[11px] text-zinc-600 text-center mt-3 leading-relaxed max-w-[220px]">
            Weighted from: route risk (35%) + country risk (30%) + OPEC instability (20%) + price volatility (15%)
          </p>
        </div>

        <div className="lg:col-span-2 rounded-xl p-5 sm:p-6" style={{ background: "var(--panel)", border: "1px solid var(--panel-border)" }}>
          <div className="flex flex-col items-start justify-between gap-3 mb-4 sm:flex-row sm:items-center">
            <h2 className="font-display text-sm tracking-wide text-zinc-400">RISK BREAKDOWN</h2>
            <button
              onClick={forceRefresh}
              className="w-full text-xs font-mono-data px-3 py-2 rounded-lg border transition sm:w-auto"
              style={{ borderColor: "var(--accent-amber)", color: "var(--accent-amber)" }}
            >
              {refreshing ? "REFRESHING..." : "↻ REFRESH LIVE DATA"}
            </button>
          </div>
          {global && (
            <div className="grid grid-cols-2 gap-5 text-sm font-mono-data">
              <div>
                <InfoLabel
                  label={<span className="text-zinc-500 text-xs">AVG COUNTRY RISK</span>}
                  tooltip="Average AI-scored political/sanctions risk (0-1) across all 9 supplier countries, based on live news headlines analyzed today."
                />
                <div className="text-xl mt-1">{global.breakdown.avg_country_risk?.toFixed(2)}</div>
              </div>
              <div>
                <InfoLabel
                  label={<span className="text-zinc-500 text-xs">AVG ROUTE RISK</span>}
                  tooltip="Average AI-scored risk (0-1) across all 5 shipping chokepoints (Hormuz, Suez, Malacca, Bab-el-Mandeb, Cape), weighted by how critical each route is to global oil flow."
                />
                <div className="text-xl mt-1">{global.breakdown.avg_route_risk?.toFixed(2)}</div>
              </div>
              <div>
                <InfoLabel
                  label={<span className="text-zinc-500 text-xs">OPEC STABILITY</span>}
                  tooltip="How stable current OPEC+ production decisions appear, based on today's news. Lower = more stable/predictable output."
                />
                <div className="text-xl mt-1">{global.breakdown.opec_stability?.toFixed(2)}</div>
              </div>
              <div>
                <InfoLabel
                  label={<span className="text-zinc-500 text-xs">BRENT VOLATILITY</span>}
                  tooltip="How much Brent crude prices are swinging right now, based on today's market news. Higher = more erratic pricing."
                />
                <div className="text-xl mt-1">{global.breakdown.brent_volatility?.toFixed(2)}</div>
              </div>
            </div>
          )}
          <div className="text-xs text-zinc-600 mt-5 font-mono-data">
            Last refreshed: {global?.last_refreshed ? new Date(global.last_refreshed).toLocaleTimeString() : "—"}
          </div>
        </div>
      </div>

      {/* Country + Route risk bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="rounded-xl p-4 sm:p-6" style={{ background: "var(--panel)", border: "1px solid var(--panel-border)" }}>
          <InfoLabel
            label={<span className="font-display text-sm tracking-wide text-zinc-400">SUPPLIER COUNTRY RISK</span>}
            tooltip="Each country's score = a fixed baseline (based on general political/sanctions history) + a live adjustment from today's news. Scale: 0-100, higher = riskier to source from right now."
            className="mb-4"
          />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={countries} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#8B93A7", fontSize: 11 }} />
              <YAxis dataKey="iso" type="category" tick={{ fill: "#E8EAED", fontSize: 12 }} width={40} />
              <Tooltip contentStyle={{ background: "#131826", border: "1px solid #232a3b" }} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {countries.map((c, i) => <Cell key={i} fill={riskColor(c.score)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl p-4 sm:p-6" style={{ background: "var(--panel)", border: "1px solid var(--panel-border)" }}>
          <InfoLabel
            label={<span className="font-display text-sm tracking-wide text-zinc-400">SHIPPING ROUTE RISK</span>}
            tooltip="Each chokepoint's score = live news severity × how critical that route is to global oil flow (e.g. Hormuz carries far more traffic than Cape, so equal news severity there scores higher)."
            className="mb-4"
          />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={routes} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--panel-border)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#8B93A7", fontSize: 11 }} />
              <YAxis dataKey="route" type="category" tick={{ fill: "#E8EAED", fontSize: 11 }} width={90} />
              <Tooltip contentStyle={{ background: "#131826", border: "1px solid #232a3b" }} />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {routes.map((r, i) => <Cell key={i} fill={riskColor(r.score)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

 {/* Supplier mix donut + Recommendations */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">

  {/* Supplier Mix */}
  <div
    className="rounded-xl p-4 sm:p-6"
    style={{
      background: "var(--panel)",
      border: "1px solid var(--panel-border)"
    }}
  >
    <InfoLabel
      label={
        <span className="font-display text-sm tracking-wide text-zinc-400">
          SUPPLY CAPACITY MIX
        </span>
      }
      tooltip="Shows each non-sanctioned supplier's share of total daily production capacity (barrels/day) among the suppliers in our database - not their actual current share of India's imports."
      className="mb-4"
    />

    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={supplierMix}
          dataKey="value"
          nameKey="name"
          innerRadius={45}
          outerRadius={75}
          paddingAngle={2}
        >
          {supplierMix.map((_, i) => (
            <Cell
              key={i}
              fill={DONUT_COLORS[i % DONUT_COLORS.length]}
            />
          ))}
        </Pie>

        <Tooltip
          contentStyle={{
            background: "#131826",
            border: "1px solid #232a3b"
          }}
          formatter={(value, name, props) => [
            `${props.payload.pct}%`,
            name
          ]}
        />
      </PieChart>
    </ResponsiveContainer>

    {/* Legend */}
    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">
      {supplierMix.map((s, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              background:
                DONUT_COLORS[i % DONUT_COLORS.length]
            }}
          ></span>

          <span className="text-zinc-400">
            {s.name}
          </span>

          <span className="text-zinc-600 font-mono-data ml-auto">
            {s.pct}%
          </span>
        </div>
      ))}
    </div>
  </div>

  {/* Recommendations Component */}
  <Recommendations />

</div>

</div>
);
}
