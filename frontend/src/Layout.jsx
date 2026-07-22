import { NavLink, Outlet } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "OVERVIEW", end: true },
  { to: "/countries", label: "SUPPLIER COUNTRIES" },
  { to: "/routes", label: "SHIPPING ROUTES" },
  { to: "/india-impact", label: "INDIA IMPACT" },
  { to: "/recommendations", label: "PROCUREMENT" },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 shrink-0 border-r p-6 hidden lg:flex flex-col" style={{ borderColor: "var(--panel-border)" }}>
        <div className="mb-10">
          <h1 className="font-display text-lg font-semibold leading-tight">
            ENERGY<br />RESILIENCE
          </h1>
          <p className="text-[10px] text-zinc-600 mt-1 font-mono-data">COMMAND CONSOLE</p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `text-xs font-mono-data px-3 py-2.5 rounded-lg transition ${
                  isActive ? "text-black font-medium" : "text-zinc-500 hover:text-zinc-300"
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? "var(--accent-amber)" : "transparent",
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex items-center gap-2 text-[10px] font-mono-data text-zinc-600">
          <span className="w-2 h-2 rounded-full live-dot" style={{ background: "var(--accent-safe)" }}></span>
          LIVE DATA CONNECTED
        </div>
      </aside>
      <main className="flex-1 p-6 lg:p-10 max-w-6xl">
        <Outlet />
      </main>
    </div>
  );
}