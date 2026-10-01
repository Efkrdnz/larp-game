import { useId } from 'react';

export function YachtArt({ size, hull, name, lights, className }: { size: 'small' | 'super'; hull: string; name: string; lights: boolean; className?: string }) {
  const uid = useId().replace(/:/g, '');
  const big = size === 'super';
  return (
    <svg viewBox="0 0 400 200" className={className} role="img" aria-label="yacht">
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id={`${uid}-sea`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0284c7" />
          <stop offset="1" stopColor="#0c4a6e" />
        </linearGradient>
        <linearGradient id={`${uid}-hull`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.25" />
          <stop offset="1" stopColor="#000" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill={`url(#${uid}-sky)`} />
      <circle cx="60" cy="40" r="16" fill="#fef9c3" />
      <path d="M0,118 L60,108 L110,116 L170,104 L230,116 L260,110 L320,118 L400,112 L400,140 L0,140 Z" fill="#64748b" opacity="0.35" />
      <rect y="132" width="400" height="68" fill={`url(#${uid}-sea)`} />
      {lights && <ellipse cx="200" cy="158" rx={big ? 170 : 110} ry="16" fill="#22d3ee" opacity="0.55" style={{ filter: 'blur(6px)' }} />}
      {big ? (
        <g>
          <path d="M20,118 L380,112 L352,148 Q200,156 48,148 Z" fill={hull} />
          <path d="M20,118 L380,112 L352,148 Q200,156 48,148 Z" fill={`url(#${uid}-hull)`} />
          <path d="M60,118 L80,92 L300,92 L330,114 Z" fill="#f8fafc" />
          <path d="M100,92 L118,72 L270,72 L288,92 Z" fill="#f1f5f9" />
          <path d="M140,72 L156,56 L236,56 L248,72 Z" fill="#e2e8f0" />
          <rect x="88" y="98" width="230" height="8" fill="#0f172a" opacity="0.85" />
          <rect x="124" y="78" width="150" height="7" fill="#0f172a" opacity="0.85" />
          <rect x="162" y="61" width="72" height="6" fill="#0f172a" opacity="0.85" />
          <ellipse cx="72" cy="114" rx="22" ry="3" fill="#94a3b8" />
          <text x="72" y="116" textAnchor="middle" fontSize="5" fontWeight="800" fill="#fde047">H</text>
          <rect x="196" y="40" width="4" height="16" fill="#94a3b8" />
          <circle cx="198" cy="40" r="5" fill="#e2e8f0" />
        </g>
      ) : (
        <g>
          <path d="M80,122 L340,116 L320,146 Q210,152 96,146 Z" fill={hull} />
          <path d="M80,122 L340,116 L320,146 Q210,152 96,146 Z" fill={`url(#${uid}-hull)`} />
          <path d="M120,121 L150,98 L260,98 L292,118 Z" fill="#f8fafc" />
          <path d="M150,104 L262,104 L280,116 L140,116 Z" fill="#0f172a" opacity="0.85" />
          <rect x="226" y="86" width="3" height="12" fill="#94a3b8" />
        </g>
      )}
      <rect x={big ? 30 : 92} y={big ? 128 : 130} width={big ? 330 : 222} height="3" fill="#fff" opacity="0.7" />
      {name && (
        <text x={big ? 300 : 280} y={big ? 142 : 140} textAnchor="middle" fontSize={big ? 10 : 8} fontFamily="Playfair Display, Georgia, serif" fontStyle="italic" fontWeight="700" fill="#e2e8f0">
          {name}
        </text>
      )}
      <path d="M0,160 q20,-5 40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0" stroke="#7dd3fc" strokeOpacity="0.5" fill="none" strokeWidth="2" />
      <path d="M0,180 q20,-5 40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0" stroke="#7dd3fc" strokeOpacity="0.3" fill="none" strokeWidth="2" />
    </svg>
  );
}

export function JetArt({ livery, tail, className }: { livery: string; tail: string; className?: string }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 400 180" className={className} role="img" aria-label="private jet">
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#1e3a8a" />
          <stop offset="1" stopColor="#93c5fd" />
        </linearGradient>
        <linearGradient id={`${uid}-body`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>
      <rect width="400" height="180" fill={`url(#${uid}-sky)`} />
      <g fill="#fff" opacity="0.7">
        <ellipse cx="70" cy="140" rx="60" ry="12" />
        <ellipse cx="320" cy="150" rx="80" ry="14" />
      </g>
      <path d="M150,104 L250,104 L190,150 L150,150 Z" fill="#94a3b8" />
      <path d="M40,90 Q40,72 70,70 L320,68 Q370,70 380,88 Q370,102 320,104 L70,106 Q40,106 40,90 Z" fill={`url(#${uid}-body)`} />
      <path d="M40,94 L380,90 Q376,96 360,100 L60,104 Q46,102 40,94 Z" fill={livery} />
      <path d="M50,72 L30,28 L56,28 L94,70 Z" fill={livery} />
      <path d="M36,34 L60,34" stroke="#fff" strokeWidth="2" />
      <ellipse cx="96" cy="64" rx="26" ry="9" fill="#e2e8f0" stroke="#94a3b8" />
      <ellipse cx="80" cy="64" rx="6" ry="6" fill="#334155" />
      {Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx={140 + i * 20} cy="82" rx="5" ry="5.5" fill="#1e293b" />)}
      <path d="M350,76 Q362,78 368,86 L346,86 Z" fill="#1e293b" />
      <path d="M150,96 L250,96 L230,112 L160,112 Z" fill="#cbd5e1" />
      {tail && (
        <text x="58" y="56" textAnchor="middle" fontSize="7" fontFamily="JetBrains Mono, monospace" fontWeight="700" fill="#fff" transform="rotate(-8 58 56)">
          {tail.toUpperCase()}
        </text>
      )}
    </svg>
  );
}

export function HeliArt({ livery, tail, className }: { livery: string; tail: string; className?: string }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 400 180" className={className} role="img" aria-label="helicopter">
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id={`${uid}-glass`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#bae6fd" />
          <stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      <rect width="400" height="180" fill={`url(#${uid}-sky)`} />
      <rect y="150" width="400" height="30" fill="#334155" />
      <circle cx="200" cy="164" r="22" fill="none" stroke="#fde047" strokeWidth="3" />
      <text x="200" y="172" textAnchor="middle" fontSize="20" fontWeight="800" fill="#fde047">H</text>
      <path d="M60,84 L190,88 L190,100 L60,92 Z" fill={livery} />
      <path d="M50,70 L62,70 L70,96 L56,96 Z" fill={livery} />
      <circle cx="60" cy="84" r="12" fill="none" stroke="#475569" strokeWidth="2" />
      <path d="M180,80 Q180,58 230,56 Q296,56 310,96 Q306,120 260,122 L200,122 Q176,118 180,80 Z" fill={livery} />
      <path d="M250,62 Q292,62 304,94 L252,94 Z" fill={`url(#${uid}-glass)`} />
      <rect x="206" y="72" width="34" height="20" rx="4" fill={`url(#${uid}-glass)`} />
      <rect x="226" y="44" width="10" height="14" fill="#475569" />
      <rect x="70" y="40" width="270" height="4" rx="2" fill="#1f2937" opacity="0.85" />
      <ellipse cx="231" cy="42" rx="140" ry="3" fill="#1f2937" opacity="0.15" />
      <path d="M190,132 L300,132 M210,122 L204,132 M280,122 L286,132" stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
      {tail && (
        <text x="120" y="92" textAnchor="middle" fontSize="7" fontFamily="JetBrains Mono, monospace" fontWeight="700" fill="#fff">
          {tail.toUpperCase()}
        </text>
      )}
    </svg>
  );
}
