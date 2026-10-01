// Illustrations for the underworld, courtroom and prison.

export function Silhouette({ hat = false, glasses = false, color = '#1f2937', className }: { hat?: boolean; glasses?: boolean; color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className}>
      <rect width="80" height="80" rx="18" fill="#0b0b0f" />
      <circle cx="40" cy="80" r="34" fill={color} />
      <circle cx="40" cy="34" r="15" fill={color} />
      {hat && (
        <>
          <rect x="18" y="20" width="44" height="5" rx="2" fill="#09090b" />
          <rect x="27" y="7" width="26" height="15" rx="3" fill="#09090b" />
          <rect x="27" y="17" width="26" height="3" fill="#7f1d1d" />
        </>
      )}
      {glasses && (
        <g fill="#09090b">
          <rect x="28" y="31" width="10" height="6" rx="2" />
          <rect x="42" y="31" width="10" height="6" rx="2" />
          <rect x="37" y="32" width="6" height="2" />
        </g>
      )}
      <path d="M33,60 L40,74 L47,60" fill="#e5e7eb" opacity="0.2" />
    </svg>
  );
}

export function JailCell({ daysServed, daysTotal, className }: { daysServed: number; daysTotal: number; className?: string }) {
  const tallies = Math.min(60, Math.max(0, Math.floor(daysServed)));
  return (
    <svg viewBox="0 0 400 240" className={className} role="img" aria-label="Prison cell">
      <defs>
        <linearGradient id="cellwall" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#4b5563" />
          <stop offset="1" stopColor="#374151" />
        </linearGradient>
        <linearGradient id="cellfloor" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#52525b" />
          <stop offset="1" stopColor="#27272a" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill="url(#cellwall)" />
      {Array.from({ length: 12 }, (_, r) => (
        <line key={r} x1="0" x2="400" y1={r * 16} y2={r * 16} stroke="#00000022" />
      ))}
      <rect y="180" width="400" height="60" fill="url(#cellfloor)" />
      <rect x="250" y="30" width="60" height="40" fill="#93c5fd" opacity="0.5" />
      {[262, 274, 286, 298].map((x) => <rect key={x} x={x} y="30" width="3" height="40" fill="#1f2937" />)}
      <polygon points="250,70 310,70 340,200 220,200" fill="#fef9c3" opacity="0.06" />
      <rect x="30" y="140" width="150" height="40" rx="4" fill="#9ca3af" />
      <rect x="30" y="132" width="150" height="14" rx="6" fill="#e5e7eb" />
      <rect x="34" y="124" width="40" height="14" rx="6" fill="#f8fafc" />
      <rect x="40" y="180" width="6" height="18" fill="#6b7280" />
      <rect x="164" y="180" width="6" height="18" fill="#6b7280" />
      <ellipse cx="350" cy="190" rx="22" ry="10" fill="#e5e7eb" />
      <rect x="334" y="160" width="32" height="30" rx="6" fill="#d1d5db" />
      <g stroke="#e5e7eb" strokeWidth="2" opacity="0.8">
        {Array.from({ length: tallies }, (_, i) => {
          const group = Math.floor(i / 5);
          const k = i % 5;
          const gx = 200 + (group % 6) * 26;
          const gy = 92 + Math.floor(group / 6) * 26;
          return k < 4 ? <line key={i} x1={gx + k * 5} x2={gx + k * 5} y1={gy} y2={gy + 18} /> : <line key={i} x1={gx - 3} x2={gx + 19} y1={gy + 15} y2={gy + 3} />;
        })}
      </g>

      {Array.from({ length: 11 }, (_, i) => (
        <g key={i}>
          <rect x={i * 38 + 6} y="0" width="9" height="240" fill="#18181b" />
          <rect x={i * 38 + 7} y="0" width="2" height="240" fill="#71717a" opacity="0.6" />
        </g>
      ))}
      <rect x="0" y="40" width="400" height="8" fill="#18181b" />
      <rect x="150" y="214" width="100" height="20" rx="3" fill="#18181b" stroke="#71717a" />
      <text x="200" y="228" textAnchor="middle" fill="#fde68a" fontSize="10" fontWeight="700" fontFamily="JetBrains Mono, monospace">
        DAY {Math.floor(daysServed)} / {daysTotal}
      </text>
      <rect x="0" y="200" width="400" height="8" fill="#18181b" />
    </svg>
  );
}

export function Courtroom({ className, verdict }: { className?: string; verdict?: 'guilty' | 'innocent' | null }) {
  return (
    <svg viewBox="0 0 400 200" className={className} role="img" aria-label="Courtroom">
      <defs>
        <linearGradient id="wood" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7c4a24" />
          <stop offset="1" stopColor="#4a2a12" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill="#2a1d14" />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={i * 40 + 4} y="0" width="32" height="110" fill="#3a2718" />
      ))}
      <circle cx="200" cy="38" r="22" fill="#d4a017" opacity="0.9" />
      <circle cx="200" cy="38" r="16" fill="#3a2718" />
      <text x="200" y="43" textAnchor="middle" fontSize="14" fill="#d4a017">⚖</text>
      <rect x="110" y="70" width="180" height="70" fill="url(#wood)" />
      <rect x="104" y="64" width="192" height="10" fill="#8b5a2b" />
      <circle cx="200" cy="58" r="13" fill="#e5c9a8" />
      <path d="M182,90 Q200,66 218,90 L222,70 Q200,58 178,70 Z" fill="#111827" />
      <path d="M186,52 Q200,38 214,52 L214,60 Q200,54 186,60 Z" fill="#f8fafc" />
      <g transform={verdict ? 'rotate(-30 250 68)' : ''} style={{ transition: 'transform 0.2s' }}>
        <rect x="236" y="56" width="26" height="10" rx="3" fill="#5b3a1e" />
        <rect x="248" y="62" width="4" height="18" fill="#5b3a1e" />
      </g>
      <rect x="0" y="140" width="400" height="60" fill="#1f140c" />
      <rect x="30" y="150" width="120" height="40" fill="url(#wood)" />
      <rect x="250" y="150" width="120" height="40" fill="url(#wood)" />
      <circle cx="90" cy="140" r="11" fill="#e5c9a8" />
      <path d="M72,160 Q90,144 108,160 Z" fill="#334155" />
      <circle cx="310" cy="140" r="11" fill="#c8a07a" />
      <path d="M292,160 Q310,144 328,160 Z" fill="#7f1d1d" />
      {verdict && (
        <text x="200" y="180" textAnchor="middle" fontSize="24" fontWeight="900" fontFamily="Space Grotesk, sans-serif" fill={verdict === 'guilty' ? '#ef4444' : '#22c55e'} stroke="#000" strokeWidth="0.8">
          {verdict === 'guilty' ? 'GUILTY' : 'NOT GUILTY'}
        </text>
      )}
    </svg>
  );
}
