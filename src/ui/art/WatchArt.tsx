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

function Hand({ deg, len, w, color, tail = 10, sword = false }: { deg: number; len: number; w: number; color: string; tail?: number; sword?: boolean }) {
  return (
    <g transform={`rotate(${deg} ${CX} ${CY})`}>
      {sword ? (
        <path d={`M${CX},${CY - len} L${CX + w},${CY - len * 0.25} L${CX},${CY + tail} L${CX - w},${CY - len * 0.25} Z`} fill={color} />
      ) : (
        <rect x={CX - w / 2} y={CY - len} width={w} height={len + tail} rx={w / 2} fill={color} />
      )}
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

function isDark(hex: string) {
  const n = parseInt(hex.slice(1, 7), 16);
  return ((n >> 16) & 255) + ((n >> 8) & 255) + (n & 255) < 330;
}

/** Brand name in small caps, shrunk to fit long names. */
function Label({ text, y, color, width = 70 }: { text: string; y: number; color: string; width?: number }) {
  if (!text) return null;
  const t = text.toUpperCase();
  const size = Math.min(7, (width / t.length) * 1.55);
  return (
    <text x={CX} y={y} textAnchor="middle" fontSize={size} letterSpacing={size > 5 ? 1.2 : 0.4} fill={color} fontFamily="Playfair Display, Georgia, serif" fontWeight="700">
      {t}
    </text>
  );
}

function Strap({ uid, strap, narrow = false }: { uid: string; strap: { a: string; b: string; links: boolean }; narrow?: boolean }) {
  const [l, r] = narrow ? [72, 128] : [66, 134];
  return (
    <g>
      <path d={`M${l},0 H${r} L${r - 4},100 H${l + 4} Z`} fill={`url(#${uid}-strap)`} />
      <path d={`M${l + 4},200 H${r - 4} L${r},300 H${l} Z`} fill={`url(#${uid}-strap)`} />
      {strap.links ? (
        <>
          {[12, 34, 56, 78, 212, 234, 256, 278].map((y) => (
            <rect key={y} x={l + 2} y={y} width={r - l - 4} height="2" fill="#00000030" />
          ))}
          {[0, 200].map((y0) => (
            <g key={y0}>
              <line x1="88" x2="88" y1={y0} y2={y0 + 100} stroke="#00000025" />
              <line x1="112" x2="112" y1={y0} y2={y0 + 100} stroke="#00000025" />
            </g>
          ))}
        </>
      ) : (
        <>
          <path d={`M${l + 8},4 L${l + 10},96 M${r - 8},4 L${r - 10},96`} stroke="#ffffff33" strokeDasharray="3 3" />
          <path d={`M${l + 8},204 L${l + 10},296 M${r - 8},204 L${r - 10},296`} stroke="#ffffff33" strokeDasharray="3 3" />
        </>
      )}
    </g>
  );
}

function Defs({ uid, metal, dial, strap }: { uid: string; metal: string; dial: string; strap: { a: string; b: string } }) {
  return (
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
      <pattern id={`${uid}-tap`} width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill={dial} />
        <rect x="0.8" y="0.8" width="4.4" height="4.4" fill="#ffffff" opacity="0.08" />
        <rect x="0" y="0" width="6" height="0.8" fill="#000" opacity="0.25" />
        <rect x="0" y="0" width="0.8" height="6" fill="#000" opacity="0.25" />
      </pattern>
    </defs>
  );
}

const OCTAGON = (() => {
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = ((i * 45 + 22.5 - 90) * Math.PI) / 180;
    pts.push(`${(CX + 60 * Math.cos(a)).toFixed(1)},${(CY + 60 * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
})();

export default function WatchArt({
  style,
  metal,
  custom,
  minutes = 610,
  label = '',
  bezel,
  className,
}: {
  style: WatchStyle;
  metal: string;
  custom: WatchCustom;
  minutes?: number;
  label?: string;
  bezel?: [string, string];
  className?: string;
}) {
  const uid = useId().replace(/:/g, '');
  const strap = STRAPS[custom.strap] ?? STRAPS.steel;
  const h = Math.floor(minutes / 60) % 12;
  const m = minutes % 60;
  const hourDeg = (h + m / 60) * 30;
  const minDeg = m * 6;
  const dial = custom.dial;
  const ink = isDark(dial) ? '#f8fafc' : '#111827';
  const hh = String(Math.floor(minutes / 60) % 24).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  const secondHand = (
    <g style={{ transformOrigin: `${CX}px ${CY}px`, animation: 'spin 60s steps(60) infinite' }}>
      <rect x={CX - 0.8} y={CY - 46} width="1.6" height="58" fill="#ef4444" />
    </g>
  );

  // ---------- Digital (Casio / G-Shock style) ----------
  if (style === 'digital') {
    return (
      <svg viewBox="0 0 200 300" className={className} role="img" aria-label="digital watch">
        <rect x="64" y="0" width="72" height="110" rx="6" fill={strap.a} />
        <rect x="64" y="190" width="72" height="110" rx="6" fill={strap.a} />
        {[20, 40, 60, 80].map((y) => <rect key={y} x="76" y={y + 190} width="48" height="4" rx="2" fill="#00000055" />)}
        <rect x="46" y="92" width="108" height="116" rx="16" fill={metal} />
        <rect x="56" y="104" width="88" height="92" rx="8" fill="#111827" />
        <Label text={label} y={120} color="#e5e7eb" width={60} />
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

  // ---------- Rectangular smartwatch ----------
  if (style === 'smart') {
    return (
      <svg viewBox="0 0 200 300" className={className} role="img" aria-label="smartwatch">
        <Defs uid={uid} metal={metal} dial={dial} strap={strap} />
        <Strap uid={uid} strap={strap} narrow />
        <rect x="52" y="84" width="96" height="132" rx="30" fill={`url(#${uid}-metal)`} />
        <rect x="59" y="91" width="82" height="118" rx="24" fill="#000" />
        <rect x="148" y="124" width="8" height="22" rx="4" fill={metal} />
        <rect x="148" y="154" width="5" height="18" rx="2" fill={metal} />
        <text x="100" y="140" textAnchor="middle" fontSize="23" fontWeight="600" fill="#f8fafc" fontFamily="Inter, system-ui, sans-serif">
          {hh}:{mm}
        </text>
        <text x="100" y="112" textAnchor="middle" fontSize="8" fill="#f97316" fontFamily="Inter, system-ui, sans-serif" fontWeight="700">
          {label.toUpperCase()}
        </text>
        {[
          ['#ef4444', 76],
          ['#84cc16', 100],
          ['#22d3ee', 124],
        ].map(([c, x]) => (
          <g key={c as string}>
            <circle cx={x as number} cy="172" r="9" fill="none" stroke="#27272a" strokeWidth="3.5" />
            <circle cx={x as number} cy="172" r="9" fill="none" stroke={c as string} strokeWidth="3.5" strokeDasharray={`${20 + (Number(x) % 30)} 60`} transform={`rotate(-90 ${x} 172)`} strokeLinecap="round" />
          </g>
        ))}
        <text x="100" y="198" textAnchor="middle" fontSize="7" fill="#a1a1aa" fontFamily="Inter, system-ui, sans-serif">
          ♥ 72 · 9,412 steps
        </text>
      </svg>
    );
  }

  // ---------- Rectangular (Tank / Reverso / Monaco / Santos) ----------
  if (style === 'square') {
    const roman = ['XII', 'III', 'VI', 'IX'];
    const pos: [number, number][] = [
      [CX, 112],
      [124, 153],
      [CX, 194],
      [76, 153],
    ];
    return (
      <svg viewBox="0 0 200 300" className={className} role="img" aria-label="rectangular watch">
        <Defs uid={uid} metal={metal} dial={dial} strap={strap} />
        <Strap uid={uid} strap={strap} narrow />
        <rect x="58" y="88" width="84" height="124" rx="12" fill={`url(#${uid}-metal)`} />
        <rect x="142" y="142" width="10" height="16" rx="5" fill={metal} />
        <circle cx="153" cy="150" r="4" fill="#1d4ed8" />
        <rect x="66" y="96" width="68" height="108" rx="6" fill={dial} />
        <rect x="71" y="101" width="58" height="98" rx="3" fill="none" stroke={ink} strokeOpacity="0.5" strokeWidth="0.8" />
        {Array.from({ length: 30 }, (_, i) => (
          <line key={i} x1={71} x2={74} y1={104 + i * 3.2} y2={104 + i * 3.2} stroke={ink} strokeOpacity="0.4" strokeWidth="0.6" />
        ))}
        {roman.map((r, i) => (
          <text key={r} x={pos[i][0]} y={pos[i][1]} textAnchor="middle" fontSize="11" fill={ink} fontFamily="Georgia, serif">
            {r}
          </text>
        ))}
        <Label text={label} y={128} color={ink} width={44} />
        <Hand deg={hourDeg} len={24} w={3} color="#1e3a8a" />
        <Hand deg={minDeg} len={36} w={2} color="#1e3a8a" />
        <circle cx={CX} cy={CY} r="2.5" fill="#1e3a8a" />
        {custom.engraving && (
          <text x={CX} y={182} textAnchor="middle" fontSize="6" fontStyle="italic" fill={ink} fontFamily="Georgia, serif">
            “{custom.engraving}”
          </text>
        )}
        {custom.iced && <rect x="60" y="90" width="80" height="120" rx="11" fill="none" stroke="#f8fafc" strokeWidth="4" strokeDasharray="1 5" strokeLinecap="round" />}
        <rect x="66" y="96" width="68" height="108" rx="6" fill={`url(#${uid}-dial)`} />
      </svg>
    );
  }

  // ---------- Round family ----------
  const isCushion = style === 'dress' || style === 'skeleton';
  const caseR = style === 'dress' ? 58 : style === 'classic' ? 56 : 62;
  const caseShape =
    style === 'octagon' ? (
      <g>
        <circle cx={CX} cy={CY} r={64} fill={`url(#${uid}-metal)`} />
        <polygon points={OCTAGON} fill={`url(#${uid}-metal)`} stroke="#00000040" strokeWidth="1" />
      </g>
    ) : isCushion ? (
      <rect x={CX - caseR} y={CY - caseR} width={caseR * 2} height={caseR * 2} rx={style === 'skeleton' ? 40 : 28} fill={`url(#${uid}-metal)`} />
    ) : (
      <circle cx={CX} cy={CY} r={caseR} fill={`url(#${uid}-metal)`} />
    );
  const dialR = style === 'octagon' ? 44 : style === 'classic' ? caseR - 7 : caseR - 15;
  const isChrono = style === 'chrono' || style === 'gold';

  return (
    <svg viewBox="0 0 200 300" className={className} role="img" aria-label={`${style} watch`}>
      <Defs uid={uid} metal={metal} dial={dial} strap={strap} />
      <Strap uid={uid} strap={strap} />

      {/* crown & pushers */}
      <rect x={CX + caseR - 2} y={CY - 7} width="12" height="14" rx="3" fill={metal} />
      {isChrono && (
        <>
          <rect x={CX + caseR - 8} y={CY - 42} width="10" height="9" rx="2" fill={metal} transform={`rotate(30 ${CX + caseR} ${CY - 38})`} />
          <rect x={CX + caseR - 8} y={CY + 33} width="10" height="9" rx="2" fill={metal} transform={`rotate(-30 ${CX + caseR} ${CY + 38})`} />
        </>
      )}

      {caseShape}

      {/* bezels */}
      {style === 'diver' && (
        <g>
          {bezel ? (
            <>
              <path d={`M${CX - caseR + 5},${CY} A${caseR - 5},${caseR - 5} 0 0 1 ${CX + caseR - 5},${CY} Z`} fill={bezel[0]} />
              <path d={`M${CX + caseR - 5},${CY} A${caseR - 5},${caseR - 5} 0 0 1 ${CX - caseR + 5},${CY} Z`} fill={bezel[1]} />
            </>
          ) : (
            <circle cx={CX} cy={CY} r={caseR - 5} fill="#111827" />
          )}
          {Array.from({ length: 60 }, (_, i) => {
            const [x1, y1] = polar(caseR - 6, i * 6);
            const [x2, y2] = polar(caseR - (i % 5 === 0 ? 13 : 9), i * 6);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e5e7eb" strokeWidth={i % 5 === 0 ? 1.8 : 0.8} />;
          })}
          <path d={`M${CX - 5},${CY - caseR + 6} L${CX + 5},${CY - caseR + 6} L${CX},${CY - caseR + 14} Z`} fill="#fef3c7" />
        </g>
      )}
      {isChrono && (
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
      {style === 'classic' && metal === '#d4a017' &&
        Array.from({ length: 48 }, (_, i) => {
          const [x1, y1] = polar(caseR - 1, i * 7.5);
          const [x2, y2] = polar(caseR - 6, i * 7.5);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#00000040" strokeWidth="1.4" />;
        })}
      {style === 'octagon' &&
        Array.from({ length: 8 }, (_, i) => {
          const [x, y] = polar(53, i * 45 + 22.5);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="3.2" fill="#e5e7eb" stroke="#6b7280" strokeWidth="0.6" />
              <line x1={x - 2} x2={x + 2} y1={y} y2={y} stroke="#6b7280" strokeWidth="0.8" transform={`rotate(${i * 30} ${x} ${y})`} />
            </g>
          );
        })}

      {/* dial */}
      {isCushion ? (
        <rect x={CX - caseR + 9} y={CY - caseR + 9} width={(caseR - 9) * 2} height={(caseR - 9) * 2} rx={style === 'skeleton' ? 32 : 22} fill={dial} />
      ) : (
        <circle cx={CX} cy={CY} r={dialR} fill={style === 'octagon' ? `url(#${uid}-tap)` : dial} />
      )}
      {style === 'dress' &&
        Array.from({ length: 14 }, (_, i) => <line key={i} x1={CX - 40} x2={CX + 40} y1={CY - 40 + i * 6} y2={CY - 40 + i * 6} stroke="#00000022" strokeWidth="2.5" />)}

      {style === 'smartround' && (
        <g>
          <circle cx={CX} cy={CY} r={dialR} fill="#000" />
          <circle cx={CX} cy={CY} r={dialR - 4} fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray="70 300" transform={`rotate(-90 ${CX} ${CY})`} strokeLinecap="round" />
          <circle cx={CX} cy={CY} r={dialR - 4} fill="none" stroke="#22d3ee" strokeWidth="3" strokeDasharray="50 300" strokeDashoffset="-90" transform={`rotate(-90 ${CX} ${CY})`} strokeLinecap="round" />
          <text x={CX} y={CY + 9} textAnchor="middle" fontSize="26" fontWeight="700" fill="#f8fafc" fontFamily="Inter, system-ui, sans-serif">
            {hh}:{mm}
          </text>
          <Label text={label} y={CY - 18} color="#a1a1aa" width={50} />
          <text x={CX} y={CY + 26} textAnchor="middle" fontSize="7" fill="#a1a1aa" fontFamily="Inter, system-ui, sans-serif">
            ▲ 1,204 m · ♥ 64
          </text>
        </g>
      )}

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

      {isChrono && (
        <>
          <Subdial x={CX - 20} y={CY} r={11} color={style === 'gold' ? '#1c1917' : isDark(dial) ? '#1f2937' : '#e5e7eb'} />
          <Subdial x={CX + 20} y={CY} r={11} color={style === 'gold' ? '#1c1917' : isDark(dial) ? '#1f2937' : '#e5e7eb'} />
          <Subdial x={CX} y={CY + 22} r={11} color={style === 'gold' ? '#1c1917' : isDark(dial) ? '#1f2937' : '#e5e7eb'} />
        </>
      )}

      {/* indices */}
      {style === 'pilot' &&
        Array.from({ length: 12 }, (_, i) => {
          const [x, y] = polar(dialR - 11, i * 30);
          return i === 0 ? (
            <path key={i} d={`M${CX - 5},${CY - dialR + 5} L${CX + 5},${CY - dialR + 5} L${CX},${CY - dialR + 15} Z`} fill={ink} />
          ) : (
            <text key={i} x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={ink} fontFamily="Inter, Arial, sans-serif">
              {i}
            </text>
          );
        })}
      {style === 'pilot' &&
        Array.from({ length: 60 }, (_, i) => {
          const [x1, y1] = polar(dialR - 1, i * 6);
          const [x2, y2] = polar(dialR - 4, i * 6);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink} strokeWidth="0.7" opacity="0.7" />;
        })}
      {style !== 'skeleton' &&
        style !== 'pilot' &&
        style !== 'smartround' &&
        Array.from({ length: 12 }, (_, i) => {
          const r = isCushion ? caseR - 18 : dialR - 4;
          const [x1, y1] = polar(r, i * 30);
          const [x2, y2] = polar(r - (i % 3 === 0 ? 9 : 6), i * 30);
          if (style === 'diver' && i % 3 !== 0) {
            const [x, y] = polar(r - 3, i * 30);
            return <circle key={i} cx={x} cy={y} r="3.2" fill="#ecfccb" stroke={ink} strokeWidth="0.6" />;
          }
          if (style === 'classic' && i === 3) return <rect key={i} x={CX + r - 16} y={CY - 4} width="11" height="8" fill="#fff" stroke={ink} strokeWidth="0.6" />;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={style === 'gold' ? '#b45309' : ink} strokeWidth={i % 3 === 0 ? 3.2 : 2} strokeLinecap="round" />;
        })}
      {style === 'classic' && (
        <text x={CX + dialR - 14.5} y={CY + 2.8} textAnchor="middle" fontSize="7" fill="#111827" fontFamily="Arial">
          {(Math.floor(minutes / 1440) % 28) + 1}
        </text>
      )}

      {/* brand + engraving */}
      {style !== 'smartround' && <Label text={style === 'skeleton' ? '' : label} y={CY - 22} color={ink} width={style === 'octagon' ? 46 : 54} />}
      {style !== 'smartround' && style !== 'skeleton' && (
        <text x={CX} y={CY - 14} textAnchor="middle" fontSize="4" letterSpacing="0.8" fill={ink} opacity="0.7" fontFamily="Arial">
          {style === 'diver' ? 'SUPERLATIVE · 300M' : 'AUTOMATIC'}
        </text>
      )}
      {custom.engraving && (
        <text x={CX} y={CY + (isChrono ? 44 : 30)} textAnchor="middle" fontSize="6.5" fontStyle="italic" fill={ink} opacity="0.85" fontFamily="Georgia, serif">
          “{custom.engraving}”
        </text>
      )}

      {style === 'diamond' && <Diamonds r={caseR - 22} n={24} />}
      {(custom.iced || style === 'diamond') && !isCushion && style !== 'octagon' && <Diamonds r={caseR - 6} n={36} />}
      {custom.iced && style === 'octagon' && <Diamonds r={52} n={24} />}
      {custom.iced && isCushion && (
        <rect x={CX - caseR + 3} y={CY - caseR + 3} width={(caseR - 3) * 2} height={(caseR - 3) * 2} rx={style === 'skeleton' ? 38 : 26} fill="none" stroke="#f8fafc" strokeWidth="5" strokeDasharray="1 5" strokeLinecap="round" />
      )}

      {/* hands */}
      {style !== 'smartround' && (
        <>
          <Hand deg={hourDeg} len={style === 'skeleton' ? 26 : 28} w={style === 'pilot' ? 4.5 : 5} color={style === 'gold' ? '#b45309' : ink} sword={style === 'pilot'} />
          <Hand deg={minDeg} len={style === 'skeleton' ? 38 : 42} w={style === 'pilot' ? 3.5 : 3.4} color={style === 'gold' ? '#b45309' : ink} sword={style === 'pilot'} />
          {secondHand}
          <circle cx={CX} cy={CY} r="3.5" fill={style === 'gold' ? '#b45309' : ink} />
          <circle cx={CX} cy={CY} r="1.5" fill="#ef4444" />
        </>
      )}

      {/* glass reflection */}
      {isCushion ? (
        <rect x={CX - caseR + 9} y={CY - caseR + 9} width={(caseR - 9) * 2} height={(caseR - 9) * 2} rx={style === 'skeleton' ? 32 : 22} fill={`url(#${uid}-dial)`} />
      ) : (
        <circle cx={CX} cy={CY} r={dialR} fill={`url(#${uid}-dial)`} />
      )}
    </svg>
  );
}
