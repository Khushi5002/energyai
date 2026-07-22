export default function RiskGauge({ score = 0, label = "GLOBAL RISK" }) {
  // Semi-circle gauge: 0 score = -90deg (left), 100 score = +90deg (right)
  const angle = -90 + (score / 100) * 180;

  const color = score > 70 ? "var(--accent-danger)" : score > 40 ? "var(--accent-warn)" : "var(--accent-safe)";

  // Tick marks every 10 units around the semi-circle
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const tickAngle = -90 + (i / 10) * 180;
    const rad = (tickAngle * Math.PI) / 180;
    const x1 = 100 + 78 * Math.cos(rad);
    const y1 = 100 + 78 * Math.sin(rad);
    const x2 = 100 + 88 * Math.cos(rad);
    const y2 = 100 + 88 * Math.sin(rad);
    return { x1, y1, x2, y2 };
  });

  const needleRad = (angle * Math.PI) / 180;
  const needleX = 100 + 65 * Math.cos(needleRad);
  const needleY = 100 + 65 * Math.sin(needleRad);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 130" className="w-full max-w-[220px] sm:max-w-xs">
        {/* Background arc zones */}
        <path d="M 12 100 A 88 88 0 0 1 76 22" fill="none" stroke="var(--accent-safe)" strokeWidth="10" strokeLinecap="round" opacity="0.35" />
        <path d="M 76 22 A 88 88 0 0 1 124 22" fill="none" stroke="var(--accent-warn)" strokeWidth="10" opacity="0.35" />
        <path d="M 124 22 A 88 88 0 0 1 188 100" fill="none" stroke="var(--accent-danger)" strokeWidth="10" strokeLinecap="round" opacity="0.35" />

        {/* Tick marks */}
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="var(--text-secondary)" strokeWidth="1.5" />
        ))}

        {/* Needle */}
        <line x1="100" y1="100" x2={needleX} y2={needleY} stroke={color} strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="100" r="6" fill={color} />
      </svg>

      <div className="text-center -mt-4">
        <div className="font-mono-data text-4xl sm:text-5xl font-semibold" style={{ color }}>
          {Math.round(score)}
        </div>
        <div className="text-xs tracking-widest text-zinc-500 mt-1 font-display">{label}</div>
      </div>
    </div>
  );
}
