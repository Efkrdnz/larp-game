import { useId } from 'react';
import type { HomeStyle } from '../../engine/data/shopItems';

export interface HomeCustom {
  wall: string;
  roof: string;
  pool: boolean;
  garden: boolean;
  lights: boolean;
  gate: boolean;
}

type Phase = 'day' | 'dusk' | 'night';

export function phaseForHour(h: number): Phase {
  if (h >= 7 && h < 17) return 'day';
  if ((h >= 17 && h < 20) || (h >= 5 && h < 7)) return 'dusk';
  return 'night';
}

const SKY: Record<Phase, [string, string]> = {
  day: ['#5aa9e6', '#cde8f7'],
  dusk: ['#3b2a63', '#f59e6b'],
  night: ['#05070f', '#1b2547'],
};

function Windows({ x, y, cols, rows, w, h, gx, gy, lit, glass }: { x: number; y: number; cols: number; rows: number; w: number; h: number; gx: number; gy: number; lit: boolean; glass?: string }) {
  const out = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const on = lit && (r * 7 + c * 3) % 5 !== 0;
      out.push(<rect key={`${r}-${c}`} x={x + c * (w + gx)} y={y + r * (h + gy)} width={w} height={h} rx="1.5" fill={on ? '#fde68a' : glass ?? '#8fb8d8'} stroke="#1f2937" strokeOpacity="0.4" strokeWidth="1" />);
    }
  return <g>{out}</g>;
}

function Palm({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0,0 Q4,-30 2,-60" stroke="#7c5a3a" strokeWidth="5" fill="none" />
      {[-60, -20, 20, 60, 100, 140].map((a) => (
        <path key={a} d="M2,-60 q18,-6 32,6" stroke="#15803d" strokeWidth="5" fill="none" strokeLinecap="round" transform={`rotate(${a} 2 -60)`} />
      ))}
    </g>
  );
}

function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-3" y="-18" width="6" height="18" fill="#6b4423" />
      <circle cx="0" cy="-30" r="16" fill="#166534" />
      <circle cx="-9" cy="-24" r="11" fill="#15803d" />
      <circle cx="9" cy="-25" r="11" fill="#16a34a" />
    </g>
  );
}

function Lights({ points }: { points: [number, number][] }) {
  const colors = ['#f87171', '#facc15', '#4ade80', '#60a5fa', '#e879f9'];
  const out = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / 12));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      out.push(<circle key={`${i}-${k}`} cx={x1 + (x2 - x1) * t} cy={y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * 4} r="2.6" fill={colors[(i * 3 + k) % colors.length]} />);
    }
  }
  return <g style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,200,0.9))' }}>{out}</g>;
}

export default function HomeArt({ style, custom, hour = 12, className }: { style: HomeStyle; custom: HomeCustom; hour?: number; className?: string }) {
  const uid = useId().replace(/:/g, '');
  const phase = phaseForHour(hour);
  const lit = phase !== 'day';
  const [skyTop, skyBottom] = SKY[phase];
  const beach = style === 'mansion' || style === 'island';
  const ground = style === 'island' ? '#0e7490' : beach ? '#e9d8a6' : style === 'penthouse' ? '#374151' : '#3f7d3a';
  const { wall, roof } = custom;
  let building: React.ReactNode = null;
  let lightPath: [number, number][] = [];

  switch (style) {
    case 'suburban':
      building = (
        <g>
          <rect x="242" y="150" width="70" height="60" fill={wall} stroke="#00000033" />
          <rect x="250" y="162" width="54" height="48" fill="#d6d3d1" />
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1="250" x2="304" y1={170 + i * 9} y2={170 + i * 9} stroke="#a8a29e" />
          ))}
          <path d="M236,152 L277,128 L318,152 Z" fill={roof} />
          <rect x="100" y="130" width="146" height="80" fill={wall} stroke="#00000033" />
          <rect x="196" y="78" width="14" height="40" fill="#78716c" />
          <path d="M88,134 L173,72 L258,134 Z" fill={roof} />
          <path d="M88,134 L173,72 L258,134" fill="none" stroke="#00000044" strokeWidth="3" />
          <rect x="160" y="160" width="26" height="50" fill="#7c2d12" />
          <circle cx="181" cy="186" r="2" fill="#fbbf24" />
          <Windows x={112} y={150} cols={1} rows={1} w={34} h={28} gx={0} gy={0} lit={lit} />
          <Windows x={200} y={150} cols={1} rows={1} w={34} h={28} gx={0} gy={0} lit={lit} />
          <circle cx="173" cy="108" r="10" fill={lit ? '#fde68a' : '#8fb8d8'} stroke="#1f2937" strokeOpacity="0.4" />
          {!custom.gate &&
            Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${10 + i * 13},228 l0,-16 l4,-5 l4,5 l0,16 Z`} fill="#f8fafc" />)}
          {!custom.gate && <rect x="6" y="218" width="390" height="3" fill="#f8fafc" />}
        </g>
      );
      lightPath = [[88, 134], [173, 72], [258, 134]];
      break;
    case 'loft':
      building = (
        <g>
          <rect x="250" y="40" width="40" height="40" rx="4" fill="#78716c" />
          <path d="M246,40 L270,22 L294,40 Z" fill="#57534e" />
          {[256, 268, 280].map((x) => <rect key={x} x={x} y="80" width="3" height="18" fill="#57534e" />)}
          <rect x="110" y="70" width="190" height="140" fill={wall} />
          <rect x="110" y="70" width="190" height="140" fill={`url(#${uid}-brick)`} />
          <rect x="104" y="62" width="202" height="10" fill={roof} />
          {[0, 1, 2].map((r) =>
            [0, 1, 2, 3].map((c) => (
              <g key={`${r}${c}`}>
                <path d={`M${124 + c * 44},${126 + r * 38} v-22 a14,12 0 0 1 28,0 v22 Z`} fill={lit && (r + c) % 3 ? '#fde68a' : '#7aa5c4'} stroke={roof} strokeWidth="2.5" />
                <line x1={138 + c * 44} x2={138 + c * 44} y1={92 + r * 38} y2={126 + r * 38} stroke={roof} strokeWidth="1.5" />
              </g>
            )),
          )}
          <rect x="188" y="176" width="34" height="34" fill={roof} />
          <rect x="192" y="180" width="26" height="30" fill="#1f2937" />
        </g>
      );
      lightPath = [[104, 62], [306, 62]];
      break;
    case 'villa':
      building = (
        <g>
          <rect x="80" y="142" width="230" height="68" fill={wall} stroke="#00000022" />
          <rect x="150" y="86" width="190" height="56" fill={wall} stroke="#00000022" />
          <rect x="146" y="80" width="198" height="7" fill={roof} />
          <rect x="76" y="136" width="238" height="7" fill={roof} />
          <rect x="160" y="94" width="170" height="40" fill={lit ? '#fde68a' : `url(#${uid}-glassg)`} />
          {[200, 245, 290].map((x) => <rect key={x} x={x} y="94" width="2" height="40" fill={roof} />)}
          <rect x="92" y="152" width="120" height="58" fill={lit ? '#fcd34d' : `url(#${uid}-glassg)`} />
          {[132, 172].map((x) => <rect key={x} x={x} y="152" width="2" height="58" fill={roof} />)}
          <rect x="226" y="160" width="70" height="50" fill="#57534e" />
          <rect x="226" y="160" width="70" height="50" fill={`url(#${uid}-slat)`} />
        </g>
      );
      lightPath = [[146, 80], [344, 80]];
      break;
    case 'mansion':
      building = (
        <g>
          <path d="M50,118 L90,96 L310,96 L350,118 Z" fill={roof} />
          <rect x="54" y="118" width="292" height="92" fill={wall} stroke="#00000022" />
          <path d="M150,92 L200,62 L250,92 Z" fill={wall} stroke="#00000033" strokeWidth="2" />
          <rect x="146" y="92" width="108" height="8" fill="#e7e5e4" />
          {[156, 182, 210, 236].map((x) => (
            <g key={x}>
              <rect x={x} y="100" width="9" height="104" fill="#fafaf9" />
              <rect x={x - 2} y="100" width="13" height="4" fill="#e7e5e4" />
              <rect x={x - 2} y="200" width="13" height="4" fill="#e7e5e4" />
            </g>
          ))}
          <rect x="190" y="160" width="20" height="44" rx="10" fill="#78350f" />
          <Windows x={66} y={130} cols={3} rows={2} w={18} h={26} gx={10} gy={14} lit={lit} />
          <Windows x={264} y={130} cols={3} rows={2} w={18} h={26} gx={10} gy={14} lit={lit} />
          <rect x="50" y="204" width="300" height="8" fill="#e7e5e4" />
        </g>
      );
      lightPath = [[50, 118], [90, 96], [310, 96], [350, 118]];
      break;
    case 'penthouse':
      building = (
        <g>
          {[[20, 120, 50], [70, 90, 40], [300, 100, 46], [346, 130, 40]].map(([x, y, w]) => (
            <g key={x}>
              <rect x={x} y={y} width={w} height={210 - y} fill="#1e293b" opacity="0.85" />
              <Windows x={x + 5} y={y + 8} cols={Math.floor(w / 12)} rows={Math.floor((200 - y) / 16)} w={6} h={8} gx={6} gy={8} lit={lit} glass="#334155" />
            </g>
          ))}
          <rect x="140" y="30" width="120" height="180" fill={wall} />
          <rect x="140" y="30" width="120" height="180" fill={`url(#${uid}-tower)`} />
          <Windows x={148} y={66} cols={7} rows={9} w={10} h={10} gx={5} gy={5} lit={lit} glass="#4b6584" />
          <rect x="140" y="30" width="120" height="30" fill={lit ? '#fbbf24' : '#93c5fd'} opacity="0.9" />
          {[160, 180, 200, 220, 240].map((x) => <rect key={x} x={x} y="30" width="2" height="30" fill={roof} />)}
          <rect x="134" y="24" width="132" height="7" fill={roof} />
          <ellipse cx="200" cy="22" rx="26" ry="4" fill="#475569" />
          <text x="200" y="25" textAnchor="middle" fontSize="7" fontWeight="800" fill="#fde047">H</text>
        </g>
      );
      lightPath = [[134, 24], [266, 24]];
      break;
    case 'castle':
      building = (
        <g>
          <rect x="120" y="100" width="160" height="110" fill={wall} />
          <rect x="120" y="100" width="160" height="110" fill={`url(#${uid}-stone)`} />
          {Array.from({ length: 8 }, (_, i) => <rect key={i} x={120 + i * 21} y="90" width="12" height="12" fill={wall} />)}
          <rect x="160" y="60" width="80" height="50" fill={wall} />
          {Array.from({ length: 4 }, (_, i) => <rect key={i} x={160 + i * 21} y="50" width="12" height="12" fill={wall} />)}
          <path d="M180,210 v-40 a20,20 0 0 1 40,0 v40 Z" fill="#292524" />
          {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={184 + i * 8} x2={184 + i * 8} y1="160" y2="210" stroke="#57534e" strokeWidth="2" />)}
          {[[80, 70], [290, 70]].map(([x, y]) => (
            <g key={x}>
              <rect x={x} y={y} width="34" height={210 - y} fill={wall} />
              <rect x={x} y={y} width="34" height={210 - y} fill={`url(#${uid}-stone)`} />
              <path d={`M${x - 6},${y} L${x + 17},${y - 40} L${x + 40},${y} Z`} fill={roof} />
              <line x1={x + 17} x2={x + 17} y1={y - 40} y2={y - 58} stroke="#44403c" strokeWidth="2" />
              <path d={`M${x + 17},${y - 58} l16,5 l-16,5 Z`} fill="#dc2626" />
              <rect x={x + 12} y={y + 30} width="10" height="18" rx="5" fill={lit ? '#fde68a' : '#1c1917'} />
            </g>
          ))}
          <rect x="190" y="74" width="20" height="24" rx="10" fill={lit ? '#fde68a' : '#1c1917'} />
        </g>
      );
      lightPath = [[80, 70], [160, 60], [240, 60], [324, 70]];
      break;
    case 'island':
      building = (
        <g>
          <ellipse cx="200" cy="212" rx="170" ry="28" fill="#e9d8a6" />
          <ellipse cx="200" cy="206" rx="140" ry="20" fill="#4d7c0f" />
          <rect x="300" y="200" width="80" height="6" fill="#92400e" />
          {[310, 330, 350, 370].map((x) => <rect key={x} x={x} y="206" width="3" height="14" fill="#78350f" />)}
          <rect x="150" y="150" width="120" height="48" fill={wall} stroke="#00000022" />
          <path d="M140,152 L210,120 L280,152 Z" fill={roof} />
          <Windows x={160} y={162} cols={4} rows={1} w={20} h={22} gx={8} gy={0} lit={lit} />
          <Palm x={110} y={204} s={1.1} />
          <Palm x={300} y={200} s={0.9} />
          <Palm x={84} y={210} s={0.8} />
        </g>
      );
      lightPath = [[140, 152], [210, 120], [280, 152]];
      break;
  }

  return (
    <svg viewBox="0 0 400 260" className={className} role="img" aria-label={`${style} property`}>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={skyTop} />
          <stop offset="1" stopColor={skyBottom} />
        </linearGradient>
        <linearGradient id={`${uid}-glassg`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#bfe3f8" />
          <stop offset="1" stopColor="#4a7fa6" />
        </linearGradient>
        <linearGradient id={`${uid}-tower`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.3" />
        </linearGradient>
        <pattern id={`${uid}-brick`} width="16" height="8" patternUnits="userSpaceOnUse">
          <path d="M0,8 H16 M8,0 V4 M0,4 H16 M0,4 V8" stroke="#00000033" strokeWidth="1" fill="none" />
        </pattern>
        <pattern id={`${uid}-stone`} width="20" height="12" patternUnits="userSpaceOnUse">
          <path d="M0,12 H20 M10,0 V6 M0,6 H20 M0,6 V12" stroke="#00000030" strokeWidth="1" fill="none" />
        </pattern>
        <pattern id={`${uid}-slat`} width="8" height="6" patternUnits="userSpaceOnUse">
          <rect width="8" height="2" fill="#00000030" />
        </pattern>
      </defs>
      <rect width="400" height="260" fill={`url(#${uid}-sky)`} />
      {phase === 'night' && Array.from({ length: 40 }, (_, i) => <circle key={i} cx={(i * 97) % 400} cy={(i * 53) % 120} r={i % 3 === 0 ? 1.2 : 0.7} fill="#fff" opacity="0.8" />)}
      {phase === 'day' && <circle cx="340" cy="46" r="20" fill="#fde68a" opacity="0.95" />}
      {phase !== 'day' && <circle cx="330" cy="44" r="14" fill={phase === 'night' ? '#e5e7eb' : '#fdba74'} opacity="0.9" />}
      {phase === 'day' && (
        <g fill="#fff" opacity="0.85">
          <ellipse cx="80" cy="50" rx="30" ry="9" />
          <ellipse cx="100" cy="44" rx="20" ry="9" />
          <ellipse cx="230" cy="30" rx="24" ry="7" />
        </g>
      )}
      {style !== 'island' && <rect x="0" y="206" width="400" height="54" fill={ground} />}
      {style === 'island' && <rect x="0" y="180" width="400" height="80" fill="#0e7490" />}
      {style === 'island' && <path d="M0,190 Q50,185 100,190 T200,190 T300,190 T400,190" stroke="#67e8f9" strokeOpacity="0.4" fill="none" strokeWidth="2" />}
      {beach && style === 'mansion' && <rect x="0" y="236" width="400" height="24" fill="#0ea5e9" opacity="0.85" />}
      {building}
      {custom.garden && (
        <g>
          <Tree x={40} y={214} s={1.2} />
          <Tree x={360} y={214} s={1.1} />
          {[70, 96, 300, 326].map((x) => (
            <circle key={x} cx={x} cy="208" r="9" fill="#15803d" />
          ))}
          {[78, 310].map((x) => (
            <g key={x}>
              <circle cx={x} cy="204" r="2" fill="#f472b6" />
              <circle cx={x + 6} cy="207" r="2" fill="#facc15" />
            </g>
          ))}
        </g>
      )}
      {custom.pool && (
        <g>
          <rect x="24" y="226" width="130" height="24" rx="10" fill="#e5e7eb" />
          <rect x="30" y="229" width="118" height="18" rx="8" fill="#22d3ee" />
          <path d="M38,236 q8,-3 16,0 t16,0 t16,0 t16,0 t16,0 t16,0" stroke="#ecfeff" strokeWidth="1.5" fill="none" opacity="0.8" />
        </g>
      )}
      {custom.gate && (
        <g>
          <rect x="0" y="214" width="400" height="4" fill="#1f2937" />
          {Array.from({ length: 50 }, (_, i) => (
            <g key={i}>
              <rect x={i * 8 + 2} y="196" width="2.5" height="36" fill="#111827" />
              <path d={`M${i * 8 + 1},196 l2.2,-6 l2.2,6 Z`} fill="#d4a017" />
            </g>
          ))}
          <rect x="170" y="186" width="6" height="48" fill="#111827" />
          <rect x="224" y="186" width="6" height="48" fill="#111827" />
        </g>
      )}
      {custom.lights && <Lights points={lightPath} />}
      {lit && <rect width="400" height="260" fill="#000" opacity={phase === 'night' ? 0.22 : 0.08} pointerEvents="none" />}
    </svg>
  );
}
