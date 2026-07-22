export default function InfoLabel({ label, tooltip, className = "" }) {
  return (
    <div className={`relative inline-flex items-center gap-1.5 group ${className}`}>
      <span>{label}</span>
      <span tabIndex="0" aria-label={typeof tooltip === "string" ? tooltip : "More information"} className="w-3.5 h-3.5 rounded-full border border-zinc-600 text-[9px] leading-none flex items-center justify-center text-zinc-500 cursor-help shrink-0 focus:outline-none focus:border-amber-400">
        i
      </span>
      <div className="absolute bottom-full left-0 mb-2 w-64 max-w-[calc(100vw-2rem)] p-3 rounded-lg text-xs text-zinc-300 leading-relaxed opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-150 z-20 pointer-events-none"
        style={{ background: "#1B2233", border: "1px solid var(--panel-border)" }}>
        {tooltip}
      </div>
    </div>
  );
}
