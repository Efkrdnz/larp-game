export default function HeatMeter({ label, value, sub }: { label: string; value: number; sub?: string }) {
  const color = value > 66 ? '#ef4444' : value > 33 ? '#f0b429' : '#22c55e';
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-xs">
        <span className="font-medium text-ink-200">{label}</span>
        <span className="font-mono" style={{ color }}>
          {Math.round(value)}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-ink-700">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(2, value)}%`, background: `linear-gradient(90deg, #22c55e, ${color})` }} />
      </div>
      {sub && <div className="mt-1 text-[11px] text-ink-400">{sub}</div>}
    </div>
  );
}
