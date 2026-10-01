import { useMemo, useState } from 'react';
import { formatDateTime } from '../../engine/calendar';
import { money } from '../format';

interface Props {
  points: { t: number; v: number }[];
  height?: number;
  color?: string;
  format?: (v: number) => string;
}

/** Responsive SVG area chart with a hover/touch readout. */
export default function AreaChart({ points, height = 180, color = '#f0b429', format = (v) => money(v, { compact: true }) }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 600;
  const H = height;
  const geo = useMemo(() => {
    if (points.length < 2) return null;
    const vs = points.map((p) => p.v);
    const min = Math.min(...vs);
    const max = Math.max(...vs);
    const pad = (max - min) * 0.1 || Math.abs(max) * 0.05 || 1;
    const lo = min - pad;
    const hi = max + pad;
    const x = (i: number) => (i / (points.length - 1)) * W;
    const y = (v: number) => H - ((v - lo) / (hi - lo)) * H;
    const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join('');
    return { x, y, d, lo, hi };
  }, [points, H]);

  if (!geo) return <div style={{ height }} className="grid place-items-center text-sm text-ink-400">Not enough data yet — let time pass.</div>;
  const hp = hover !== null ? points[hover] : points[points.length - 1];
  const first = points[0].v;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-2 top-1 text-xs">
        <span className="font-mono font-semibold text-ink-100">{format(hp.v)}</span>
        <span className="ml-2 text-ink-400">{formatDateTime(hp.t)}</span>
        <span className={`ml-2 font-mono ${hp.v >= first ? 'text-up' : 'text-down'}`}>{first ? `${hp.v >= first ? '+' : ''}${(((hp.v - first) / Math.abs(first)) * 100).toFixed(1)}%` : ''}</span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full touch-none"
        style={{ height }}
        onPointerMove={(e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const i = Math.round(((e.clientX - r.left) / r.width) * (points.length - 1));
          setHover(Math.max(0, Math.min(points.length - 1, i)));
        }}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.35" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="#263042" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}
        <path d={`${geo.d}L${W},${H}L0,${H}Z`} fill="url(#areaFill)" />
        <path d={geo.d} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {hover !== null && <line x1={geo.x(hover)} x2={geo.x(hover)} y1="0" y2={H} stroke="#8d99ad" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />}
      </svg>
    </div>
  );
}
