import { useId } from 'react';
import type { WatchStyle } from '../../engine/data/shopItems';

export interface WatchCustom {
  dial: string;
  strap: string;
  iced: boolean;
  engraving: string;
}

const STRAPS: Record<string, { a: string; b: string; links: boolean }> = {
  steel: { a: '#e5e7eb', b: '#9ca3af', links: true },
  gold: { a: '#fde68a', b: '#b45309', links: true },
  leather: { a: '#7c4a2a', b: '#4a2a17', links: false },
  rubber: { a: '#27272a', b: '#09090b', links: false },
};

const CX = 100;
const CY = 150;

function polar(r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

function Hand({ deg, len, w, color, tail = 10 }: { deg: number; len: number; w: number; color: string; tail?: number }) {
  return (
    <g transform={`rotate(${deg} ${CX} ${CY})`}>
      <rect x={CX - w / 2} y={CY - len} width={w} height={len + tail} rx={w / 2} fill={color} />
    </g>
  );
}

function Diamonds({ r, n }: { r: number; n: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const [x, y] = polar(r, (i / n) * 360);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="3.6" fill="#f8fafc" stroke="#64748b" strokeWidth="0.8" />
            <path d={`M${x - 2.4},${y} L${x},${y - 2.4} L${x + 2.4},${y} L${x},${y + 2.4} Z`} fill="#7dd3fc" />
          </g>
        );
      })}
    </g>
  );
}

function Subdial({ x, y, r, color }: { x: number; y: number; r: number; color: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={color} stroke="#00000055" strokeWidth="1" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <line key={i} x1={x + (r - 3) * Math.cos(a)} y1={y + (r - 3) * Math.sin(a)} x2={x + r * Math.cos(a)} y2={y + r * Math.sin(a)} stroke="#ffffff99" strokeWidth="0.8" />;
      })}
      <line x1={x} y1={y} x2={x + r * 0.7} y2={y - r * 0.3} stroke="#fff" strokeWidth="1.2" />
    </g>
  );
}

export default function WatchArt({ style, metal, custom, minutes = 600, className }: { style: WatchStyle; metal: string; custom: WatchCustom; minutes?: number; className?: string }) {
  const uid = useId().replace(/:/g, '');
  const strap = STRAPS[custom.strap] ?? STRAPS.steel;
  const h = Math.floor(minutes / 60) % 12;
  const m = minutes % 60;
  const hourDeg = (h + m / 60) * 30;
  const minDeg = m * 6;
  const dial = custom.dial;
  const darkDial = parseInt(dial.slice(1, 3), 16) + parseInt(dial.slice(3, 5), 16) + parseInt(dial.slice(5, 7), 16) < 300;
  const ink = darkDial ? '#f8fafc' : '#111827';
  const caseR = style === 'dress' ? 58 : 62;

  if (style === 'digital') {
    const hh = String(Math.floor(minutes / 60) % 24).padStart(2, '0');
    const mm = String(m).padStart(2, '0');
    return (
      <svg viewBox="0 0 200 300" className={className} role="img" aria-label="digital watch">
        <rect x="64" y="0" width="72" height="110" rx="6" fill={strap.a} />
        <rect x="64" y="190" width="72" height="110" rx="6" fill={strap.a} />
        {[20, 40, 60, 80].map((y) => <rect key={y} x="76" y={y + 190} width="48" height="4" rx="2" fill="#00000055" />)}
        <rect x="46" y="92" width="108" height="116" rx="16" fill={metal} />
        <rect x="56" y="104" width="88" height="92" rx="8" fill="#111827" />
        <text x="100" y="120" textAnchor="middle" fontSize="8" fill="#e5e7eb" fontFamily="Arial" letterSpacing="2">CASIKO</text>
        <rect x="64" y="128" width="72" height="44" rx="3" fill={dial} />
        <text x="100" y="159" textAnchor="middle" fontSize="20" fontFamily="JetBrains Mono, monospace" fontWeight="700" fill="#1f2a1a">
          {hh}:{mm}
        </text>
        <text x="100" y="188" textAnchor="middle" fontSize="6" fill="#9ca3af" fontFamily="Arial">WATER RESIST · ALARM CHRONOGRAPH</text>
        {[110, 180].map((y) => <rect key={y} x="40" y={y} width="7" height="12" rx="2" fill="#4b5563" />)}
        {[110, 180].map((y) => <rect key={y} x="153" y={y} width="7" height="12" rx="2" fill="#4b5563" />)}
      </svg>
    );
  }

  const isSquare = style === 'dress' || style === 'skeleton';
  const caseShape = isSquare ? (
    <rect x={CX - caseR} y={CY - caseR} width={caseR * 2} height={caseR * 2} rx={style === 'skeleton' ? 40 : 28} fill={`url(#${uid}-metal)`} />
  ) : (
    <circle cx={CX} cy={CY} r={caseR} fill={`url(#${uid}-metal)`} />
  );

  return (
    <svg viewBox="0 0 200 300" className={className} role="img" aria-label={`${style} watch`}>
      <defs>
        <linearGradient id={`${uid}-metal`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="0.25" stopColor={metal} />
          <stop offset="0.7" stopColor={metal} />
          <stop offset="1" stopColor="#000000" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={`${uid}-strap`} x1="0" x2="1">
          <stop offset="0" stopColor={strap.b} />
          <stop offset="0.5" stopColor={strap.a} />
          <stop offset="1" stopColor={strap.b} />
        </linearGradient>
        <radialGradient id={`${uid}-dial`} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="0.4" stopColor={dial} stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.35" />
        </radialGradient>
      </defs>

      {/* strap */}
      <path d="M66,0 H134 L130,100 H70 Z" fill={`url(#${uid}-strap)`} />
      <path d="M70,200 H130 L134,300 H66 Z" fill={`url(#${uid}-strap)`} />
      {strap.links
        ? [12, 34, 56, 78, 212, 234, 256, 278].map((y) => <rect key={y} x="68" y={y} width="64" height="2" fill="#00000030" />)
        : [
            <path key="s1" d="M74,4 L76,96 M126,4 L124,96" stroke="#ffffff33" strokeDasharray="3 3" />,
            <path key="s2" d="M74,204 L76,296 M126,204 L124,296" stroke="#ffffff33" strokeDasharray="3 3" />,
          ]}
      {strap.links && (
        <>
          <line x1="88" x2="88" y1="0" y2="100" stroke="#00000025" />
          <line x1="112" x2="112" y1="0" y2="100" stroke="#00000025" />
          <line x1="88" x2="88" y1="200" y2="300" stroke="#00000025" />
          <line x1="112" x2="112" y1="200" y2="300" stroke="#00000025" />
        </>
      )}

      {/* crown & pushers */}
      <rect x={CX + caseR - 2} y={CY - 7} width="12" height="14" rx="3" fill={metal} />
      {(style === 'chrono' || style === 'gold') && (
        <>
          <rect x={CX + caseR - 8} y={CY - 42} width="10" height="9" rx="2" fill={metal} transform={`rotate(30 ${CX + caseR} ${CY - 38})`} />
          <rect x={CX + caseR - 8} y={CY + 33} width="10" height="9" rx="2" fill={metal} transform={`rotate(-30 ${CX + caseR} ${CY + 38})`} />
        </>
      )}

      {caseShape}

      {/* bezel */}
      {style === 'diver' && (
        <g>
          <circle cx={CX} cy={CY} r={caseR - 5} fill="#111827" />
          {Array.from({ length: 60 }, (_, i) => {
            const [x1, y1] = polar(caseR - 6, i * 6);
            const [x2, y2] = polar(caseR - (i % 5 === 0 ? 13 : 9), i * 6);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e5e7eb" strokeWidth={i % 5 === 0 ? 1.8 : 0.8} />;
          })}
          <path d={`M${CX - 5},${CY - caseR + 6} L${CX + 5},${CY - caseR + 6} L${CX},${CY - caseR + 14} Z`} fill="#fef3c7" />
        </g>
      )}
      {(style === 'chrono' || style === 'gold') && (
        <g>
          <circle cx={CX} cy={CY} r={caseR - 5} fill={style === 'gold' ? '#1c1917' : '#111827'} />
          {Array.from({ length: 12 }, (_, i) => {
            const [x, y] = polar(caseR - 10, i * 30);
            return (
              <text key={i} x={x} y={y + 2.5} textAnchor="middle" fontSize="6" fill="#e5e7eb" fontFamily="Arial">
                {[60, 70, 80, 90, 100, 120, 140, 160, 200, 240, 300, 400][i]}
              </text>
            );
          })}
        </g>
      )}

      {/* dial */}
      {isSquare ? (
        <rect x={CX - caseR + 9} y={CY - caseR + 9} width={(caseR - 9) * 2} height={(caseR - 9) * 2} rx={style === 'skeleton' ? 32 : 22} fill={dial} />
      ) : (
        <circle cx={CX} cy={CY} r={caseR - 15} fill={dial} />
      )}
      {style === 'dress' &&
        Array.from({ length: 14 }, (_, i) => <line key={i} x1={CX - 40} x2={CX + 40} y1={CY - 40 + i * 6} y2={CY - 40 + i * 6} stroke="#00000022" strokeWidth="2.5" />)}

      {style === 'skeleton' && (
        <g opacity="0.95">
          {[
            [CX - 18, CY - 14, 18, 14],
            [CX + 20, CY + 4, 14, 10],
            [CX - 8, CY + 26, 12, 9],
          ].map(([x, y, r, teeth], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={r} fill="none" stroke="#d4a017" strokeWidth="3" strokeDasharray="2.5 2" />
              <circle cx={x} cy={y} r={r - 5} fill="none" stroke="#e5e7eb" strokeWidth="1.2" />
              {Array.from({ length: teeth / 2 }, (_, k) => (
                <line key={k} x1={x} y1={y} x2={x + (r - 5) * Math.cos((k / (teeth / 2)) * Math.PI * 2)} y2={y + (r - 5) * Math.sin((k / (teeth / 2)) * Math.PI * 2)} stroke="#94a3b8" strokeWidth="1" />
              ))}
              <circle cx={x} cy={y} r="2.5" fill="#ef4444" />
            </g>
          ))}
          <path d={`M${CX - 40},${CY - 40} L${CX + 40},${CY + 40} M${CX + 40},${CY - 40} L${CX - 40},${CY + 40}`} stroke="#64748b" strokeWidth="5" opacity="0.5" />
        </g>
      )}

      {(style === 'chrono' || style === 'gold') && (
        <>
          <Subdial x={CX - 20} y={CY} r={11} color={style === 'gold' ? '#1c1917' : darkDial ? '#1f2937' : '#e5e7eb'} />
          <Subdial x={CX + 20} y={CY} r={11} color={style === 'gold' ? '#1c1917' : darkDial ? '#1f2937' : '#e5e7eb'} />
          <Subdial x={CX} y={CY + 22} r={11} color={style === 'gold' ? '#1c1917' : darkDial ? '#1f2937' : '#e5e7eb'} />
        </>
      )}

      {/* indices */}
      {style !== 'skeleton' &&
        Array.from({ length: 12 }, (_, i) => {
          const r = isSquare ? caseR - 18 : caseR - 20;
          const [x1, y1] = polar(r, i * 30);
          const [x2, y2] = polar(r - (i % 3 === 0 ? 9 : 6), i * 30);
          if (style === 'diver' && i % 3 !== 0) {
            const [x, y] = polar(r - 3, i * 30);
            return <circle key={i} cx={x} cy={y} r="3.2" fill="#ecfccb" stroke={ink} strokeWidth="0.6" />;
          }
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={style === 'gold' ? '#b45309' : ink} strokeWidth={i % 3 === 0 ? 3.2 : 2} strokeLinecap="round" />;
        })}

      {/* brand text */}
      <text x={CX} y={CY - 22} textAnchor="middle" fontSize="7" letterSpacing="1.5" fill={ink} fontFamily="Playfair Display, Georgia, serif" fontWeight="700">
        {style === 'diamond' ? 'BILLIONAIRE' : style === 'skeleton' ? '' : 'SWISS MADE'}
      </text>
      {custom.engraving && (
        <text x={CX} y={CY + (style === 'chrono' || style === 'gold' ? 44 : 30)} textAnchor="middle" fontSize="6.5" fontStyle="italic" fill={ink} opacity="0.85" fontFamily="Georgia, serif">
          “{custom.engraving}”
        </text>
      )}

      {style === 'diamond' && <Diamonds r={caseR - 22} n={24} />}
      {(custom.iced || style === 'diamond') && !isSquare && <Diamonds r={caseR - 6} n={36} />}
      {custom.iced && isSquare && (
        <rect x={CX - caseR + 3} y={CY - caseR + 3} width={(caseR - 3) * 2} height={(caseR - 3) * 2} rx={style === 'skeleton' ? 38 : 26} fill="none" stroke="#f8fafc" strokeWidth="5" strokeDasharray="1 5" strokeLinecap="round" />
      )}

      {/* hands */}
      <Hand deg={hourDeg} len={style === 'skeleton' ? 26 : 28} w={5} color={style === 'gold' ? '#b45309' : ink} />
      <Hand deg={minDeg} len={style === 'skeleton' ? 38 : 42} w={3.4} color={style === 'gold' ? '#b45309' : ink} />
      <g style={{ transformOrigin: `${CX}px ${CY}px`, animation: 'spin 60s steps(60) infinite' }}>
        <rect x={CX - 0.8} y={CY - 46} width="1.6" height="58" fill="#ef4444" />
      </g>
      <circle cx={CX} cy={CY} r="3.5" fill={style === 'gold' ? '#b45309' : ink} />
      <circle cx={CX} cy={CY} r="1.5" fill="#ef4444" />

      {/* glass reflection */}
      {isSquare ? (
        <rect x={CX - caseR + 9} y={CY - caseR + 9} width={(caseR - 9) * 2} height={(caseR - 9) * 2} rx={style === 'skeleton' ? 32 : 22} fill={`url(#${uid}-dial)`} />
      ) : (
        <circle cx={CX} cy={CY} r={caseR - 15} fill={`url(#${uid}-dial)`} />
      )}
    </svg>
  );
}
