import { COMPANY_BY_TICKER } from '../engine/data/companies';
import { SECTORS } from '../engine/data/sectors';

/** Generated monogram logo, coloured by sector. */
export default function CompanyLogo({ ticker, size = 36 }: { ticker: string; size?: number }) {
  const c = COMPANY_BY_TICKER[ticker];
  const color = SECTORS[c.sector].color;
  const shape = ticker.charCodeAt(0) % 3;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className="shrink-0">
      <rect width="40" height="40" rx="10" fill={color} opacity="0.16" />
      {shape === 0 && <circle cx="20" cy="20" r="13" fill="none" stroke={color} strokeWidth="2.5" opacity="0.6" />}
      {shape === 1 && <rect x="8" y="8" width="24" height="24" rx="4" fill="none" stroke={color} strokeWidth="2.5" opacity="0.6" transform="rotate(45 20 20)" />}
      {shape === 2 && <path d="M8 30 20 8l12 22Z" fill="none" stroke={color} strokeWidth="2.5" opacity="0.6" />}
      <text x="20" y="25" textAnchor="middle" fontFamily="Space Grotesk, Inter, sans-serif" fontWeight="700" fontSize="13" fill={color}>
        {c.name[0]}
        {c.name.split(' ')[1]?.[0] ?? ''}
      </text>
    </svg>
  );
}
