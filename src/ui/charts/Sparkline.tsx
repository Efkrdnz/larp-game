interface Props {
  values: number[];
  width?: number;
  height?: number;
  baseline?: number;
  className?: string;
  fill?: boolean;
}

/** Tiny SVG line chart; green above baseline, red below. */
export default function Sparkline({ values, width = 100, height = 32, baseline, className, fill = true }: Props) {
  if (values.length < 2) return <svg width={width} height={height} className={className} />;
  const min = Math.min(...values, baseline ?? Infinity);
  const max = Math.max(...values, baseline ?? -Infinity);
  const span = max - min || 1;
  const x = (i: number) => (i / (values.length - 1)) * width;
  const y = (v: number) => height - 2 - ((v - min) / span) * (height - 4);
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const up = values[values.length - 1] >= (baseline ?? values[0]);
  const color = up ? '#22c55e' : '#ef4444';
  const id = `sg${up ? 'u' : 'd'}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.3" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {baseline !== undefined && <line x1="0" x2={width} y1={y(baseline)} y2={y(baseline)} stroke="#3a4659" strokeDasharray="2 3" strokeWidth="1" />}
      {fill && <path d={`${d}L${width},${height}L0,${height}Z`} fill={`url(#${id})`} />}
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
