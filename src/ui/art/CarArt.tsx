import { useId } from 'react';
import type { CarBody } from '../../engine/data/shopItems';

export interface CarCustom {
  paint: string;
  rims: string;
  wrap: string;
  tint: string;
  spoiler: boolean;
  lowered: boolean;
  plate: string;
}

interface Shape {
  body: string;
  windows: string;
  wheels: [number, number];
  pillars: number[];
  doors: number[];
  head: [number, number];
  tail: [number, number];
  deck: [number, number]; // spoiler anchor (x, y)
  hood: string; // area for carbon hood wrap
}

const SHAPES: Record<CarBody, Shape> = {
  hatch: {
    body: 'M66,130 L64,96 Q64,86 74,80 L104,50 Q110,44 120,44 L236,44 Q248,44 256,52 L288,82 Q330,86 338,100 L340,122 Q340,130 332,130 Z',
    windows: 'M112,52 L240,52 Q247,52 252,58 L276,82 L88,82 L104,58 Q107,52 112,52 Z',
    wheels: [112, 290], pillars: [176], doors: [176, 250], head: [326, 94], tail: [68, 92], deck: [88, 46],
    hood: 'M288,82 Q330,86 338,100 L338,104 L282,98 Z',
  },
  sedan: {
    body: 'M40,128 L38,104 Q38,94 52,90 L100,84 L140,54 Q148,48 160,48 L244,48 Q256,48 266,56 L300,82 Q346,86 356,98 L360,120 Q360,130 350,130 Z',
    windows: 'M148,56 L240,56 Q251,56 258,63 L282,82 L114,82 L138,62 Q142,56 148,56 Z',
    wheels: [104, 296], pillars: [196], doors: [130, 200, 268], head: [346, 94], tail: [42, 96], deck: [58, 84],
    hood: 'M300,82 Q346,86 356,98 L356,102 L292,96 Z',
  },
  sports: {
    body: 'M40,126 L40,104 Q42,94 58,90 L120,82 L162,62 Q172,58 186,58 L238,58 Q252,58 262,66 L292,84 Q348,90 358,104 L360,120 Q360,130 350,130 Z',
    windows: 'M172,65 L236,65 Q246,65 254,71 L274,84 L138,84 L160,70 Q165,65 172,65 Z',
    wheels: [108, 294], pillars: [], doors: [150, 252], head: [348, 100], tail: [44, 98], deck: [62, 88],
    hood: 'M292,84 Q348,90 358,104 L358,108 L286,98 Z',
  },
  super: {
    body: 'M30,124 L32,100 Q36,90 56,86 L130,80 L176,62 Q186,58 200,58 L236,60 Q248,62 258,70 L300,92 Q352,98 366,110 L370,122 Q370,130 360,130 Z',
    windows: 'M184,66 L234,66 Q244,67 252,74 L270,88 L150,88 L174,70 Q178,66 184,66 Z',
    wheels: [104, 302], pillars: [], doors: [158, 262], head: [356, 106], tail: [34, 98], deck: [52, 84],
    hood: 'M300,92 Q352,98 366,110 L366,114 L294,104 Z',
  },
  suv: {
    body: 'M50,128 L50,62 Q50,52 60,50 L80,30 Q84,26 92,26 L262,26 Q270,26 274,32 L290,60 L338,64 Q348,66 350,76 L350,122 Q350,130 342,130 Z',
    windows: 'M92,34 L262,34 L278,60 L66,60 L84,40 Q87,34 92,34 Z',
    wheels: [112, 290], pillars: [152, 214], doors: [150, 214, 280], head: [342, 78], tail: [52, 70], deck: [70, 28],
    hood: 'M290,60 L338,64 Q348,66 350,76 L350,80 L286,72 Z',
  },
  pickup: {
    body: 'M30,128 L30,78 L176,78 L176,40 Q176,32 184,32 L262,32 Q270,32 276,40 L300,74 Q352,78 364,90 L370,122 Q370,130 360,130 Z',
    windows: 'M186,40 L260,40 Q266,40 270,46 L288,74 L186,74 Z',
    wheels: [100, 302], pillars: [236], doors: [180, 290], head: [358, 92], tail: [32, 88], deck: [40, 78],
    hood: 'M300,74 Q352,78 364,90 L364,94 L294,86 Z',
  },
  limo: {
    body: 'M20,128 L20,100 Q22,90 36,86 L90,82 L126,50 Q132,44 144,44 L280,44 Q292,44 300,52 L326,80 Q368,84 376,96 L380,120 Q380,130 370,130 Z',
    windows: 'M134,52 L284,52 Q292,52 298,60 L316,80 L106,80 L128,58 Q130,52 134,52 Z',
    wheels: [92, 318], pillars: [190, 246], doors: [118, 190, 246, 300], head: [366, 92], tail: [22, 96], deck: [40, 84],
    hood: 'M326,80 Q368,84 376,96 L376,100 L318,92 Z',
  },
};

const TINTS: Record<string, [string, string]> = {
  none: ['#cfe6fb', '#6b8aa6'],
  light: ['#6d8399', '#26323f'],
  limo: ['#1b232c', '#05070a'],
};

function Rim({ cx, cy, style, uid }: { cx: number; cy: number; style: string; uid: string }) {
  const spokes = style === 'chrome' ? 10 : style === 'stock' ? 0 : 5;
  const fill = style === 'gold' ? `url(#${uid}-gold)` : style === 'chrome' ? `url(#${uid}-chrome)` : style === 'sport' ? '#2a2f37' : '#b8bec7';
  return (
    <g>
      <circle cx={cx} cy={cy} r="25" fill="#121418" />
      <circle cx={cx} cy={cy} r="25" fill="none" stroke="#2a2d33" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="17" fill={fill} />
      {style === 'stock' &&
        [0, 72, 144, 216, 288].map((a) => (
          <circle key={a} cx={cx + 9 * Math.cos((a * Math.PI) / 180)} cy={cy + 9 * Math.sin((a * Math.PI) / 180)} r="2.6" fill="#6b7280" />
        ))}
      {Array.from({ length: spokes }, (_, i) => {
        const a = (i / spokes) * Math.PI * 2;
        return (
          <line key={i} x1={cx} y1={cy} x2={cx + 16 * Math.cos(a)} y2={cy + 16 * Math.sin(a)} stroke={style === 'sport' ? '#9ca3af' : style === 'gold' ? '#fff1b8' : '#ffffff'} strokeWidth={style === 'chrome' ? 1.6 : 3.2} strokeLinecap="round" opacity="0.85" />
        );
      })}
      <circle cx={cx} cy={cy} r="4.5" fill={style === 'gold' ? '#a16207' : '#374151'} stroke="#d1d5db" strokeWidth="1" />
      {style !== 'stock' && <circle cx={cx} cy={cy} r="17" fill="none" stroke={style === 'gold' ? '#fde68a' : '#e5e7eb'} strokeWidth="1.5" />}
    </g>
  );
}

export default function CarArt({ body, custom, className }: { body: CarBody; custom: CarCustom; className?: string }) {
  const uid = useId().replace(/:/g, '');
  const s = SHAPES[body];
  const drop = custom.lowered ? 6 : 0;
  const [glassTop, glassBottom] = TINTS[custom.tint] ?? TINTS.none;
  const [rx, fx] = s.wheels;

  return (
    <svg viewBox="0 0 400 170" className={className} role="img" aria-label={`${body} car`}>
      <defs>
        <linearGradient id={`${uid}-shade`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.38" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={`${uid}-glass`} x1="0" x2="0.4" y1="0" y2="1">
          <stop offset="0" stopColor={glassTop} />
          <stop offset="1" stopColor={glassBottom} />
        </linearGradient>
        <linearGradient id={`${uid}-chrome`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#9ca3af" />
          <stop offset="1" stopColor="#f3f4f6" />
        </linearGradient>
        <linearGradient id={`${uid}-gold`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="0.5" stopColor="#ca8a04" />
          <stop offset="1" stopColor="#fef3c7" />
        </linearGradient>
        <pattern id={`${uid}-carbon`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#16181d" />
          <rect width="3" height="3" fill="#2b2f36" />
          <rect x="3" y="3" width="3" height="3" fill="#2b2f36" />
        </pattern>
        <clipPath id={`${uid}-clip`}>
          <path d={s.body} />
        </clipPath>
      </defs>

      <ellipse cx="200" cy="156" rx="178" ry="9" fill="#000" opacity="0.45" />

      <g transform={`translate(0 ${drop})`}>
        <path d={s.body} fill={custom.paint} />
        <g clipPath={`url(#${uid}-clip)`}>
          {custom.wrap === 'stripes' && (
            <>
              <rect x="0" y="96" width="400" height="5" fill="#fff" opacity="0.9" />
              <rect x="0" y="104" width="400" height="2.5" fill="#fff" opacity="0.9" />
            </>
          )}
          {custom.wrap === 'flames' && (
            <path
              d={`M${fx + 70},120 C${fx + 30},118 ${fx},96 ${fx - 40},104 C${fx - 20},92 ${fx - 70},90 ${fx - 110},100 C${fx - 80},86 ${fx - 120},82 ${fx - 150},92 C${fx - 110},108 ${fx - 60},118 ${fx - 20},120 Z`}
              fill="#f97316"
              stroke="#facc15"
              strokeWidth="3"
              opacity="0.92"
            />
          )}
          {custom.wrap === 'carbon' && <path d={s.hood} fill={`url(#${uid}-carbon)`} transform="translate(0 -6) scale(1 1.15)" />}
          <rect x="0" y="0" width="400" height="140" fill={`url(#${uid}-shade)`} />
          {s.doors.map((x) => (
            <line key={x} x1={x} x2={x - 4} y1="84" y2="124" stroke="#000" strokeOpacity="0.35" strokeWidth="1.2" />
          ))}
          <rect x="0" y="122" width="400" height="10" fill="#000" opacity="0.28" />
        </g>
        <path d={s.windows} fill={`url(#${uid}-glass)`} stroke="#0b0e14" strokeWidth="2" />
        <path d={s.windows} fill="none" stroke="#fff" strokeOpacity="0.15" strokeWidth="1" transform="translate(2 2) scale(0.99)" />
        {s.pillars.map((x) => (
          <rect key={x} x={x - 3} y="40" width="6" height="46" fill={custom.paint} clipPath={`url(#${uid}-clip)`} />
        ))}
        {s.doors.slice(0, -1).map((x) => (
          <rect key={x} x={x + 18} y="92" width="14" height="3" rx="1.5" fill="#000" opacity="0.35" />
        ))}
        <ellipse cx={s.head[0]} cy={s.head[1]} rx="9" ry="4" fill="#fffbe6" stroke="#cbd5e1" strokeWidth="1" />
        <ellipse cx={s.head[0] + 2} cy={s.head[1]} rx="16" ry="5" fill="#fff8c4" opacity="0.15" />
        <rect x={s.tail[0] - 2} y={s.tail[1] - 4} width="8" height="9" rx="2" fill="#dc2626" />
        {custom.spoiler && (
          <g>
            <path d={`M${s.deck[0] + 6},${s.deck[1] + 2} L${s.deck[0] + 2},${s.deck[1] - 10} M${s.deck[0] + 30},${s.deck[1] + 2} L${s.deck[0] + 28},${s.deck[1] - 10}`} stroke="#111827" strokeWidth="3" />
            <path d={`M${s.deck[0] - 12},${s.deck[1] - 14} L${s.deck[0] + 46},${s.deck[1] - 12} L${s.deck[0] + 44},${s.deck[1] - 8} L${s.deck[0] - 12},${s.deck[1] - 9} Z`} fill={custom.wrap === 'carbon' ? `url(#${uid}-carbon)` : '#111827'} />
          </g>
        )}
        {custom.plate && (
          <g>
            <rect x={s.tail[0] + 4} y="100" width="34" height="11" rx="2" fill="#f8fafc" stroke="#1f2937" strokeWidth="1" />
            <text x={s.tail[0] + 21} y="108.5" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="7" fontWeight="700" fill="#111827">
              {custom.plate.toUpperCase().slice(0, 8)}
            </text>
          </g>
        )}
        <circle cx={rx} cy="132" r="29" fill="#05070a" />
        <circle cx={fx} cy="132" r="29" fill="#05070a" />
      </g>

      <Rim cx={rx} cy={132} style={custom.rims} uid={uid} />
      <Rim cx={fx} cy={132} style={custom.rims} uid={uid} />
    </svg>
  );
}
