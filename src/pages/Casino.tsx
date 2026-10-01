import { Fragment, useRef, useState } from 'react';
import { RANKS, SUITS, WHEEL_ORDER, betKey, blackjackReturn, handValue, isBlackjack, newShoe, numberColor, playDealer, roulettePayout, settleBlackjack, spinRoulette, type BjOutcome, type Card, type RouletteBet } from '../engine/casino';
import { recordGamble } from '../engine/game';
import { liveRng } from '../engine/rng';
import { useGame, useGameState } from '../store/useGame';
import { money } from '../ui/format';

const CHIPS = [10, 100, 1000, 10000, 100000, 1000000];
const CHIP_COLORS: Record<number, string> = { 10: '#e5e7eb', 100: '#dc2626', 1000: '#16a34a', 10000: '#1d4ed8', 100000: '#111827', 1000000: '#a855f7' };

function chipLabel(v: number) {
  return v >= 1e6 ? `${v / 1e6}M` : v >= 1e3 ? `${v / 1e3}K` : String(v);
}

function Chip({ v, active, onClick, small }: { v: number; active?: boolean; onClick?: () => void; small?: boolean }) {
  const size = small ? 'h-7 w-7 text-[9px]' : 'h-12 w-12 text-xs';
  return (
    <button
      onClick={onClick}
      className={`${size} grid shrink-0 place-items-center rounded-full font-bold shadow-lg transition ${active ? '-translate-y-1 ring-2 ring-gold-400' : ''}`}
      style={{ background: `repeating-conic-gradient(${CHIP_COLORS[v] ?? '#f0b429'} 0 30deg, #ffffffdd 30deg 45deg)`, color: v === 10 ? '#111' : '#fff' }}
    >
      <span className="grid h-[70%] w-[70%] place-items-center rounded-full" style={{ background: CHIP_COLORS[v] ?? '#f0b429', textShadow: v === 10 ? 'none' : '0 1px 2px #000' }}>
        {chipLabel(v)}
      </span>
    </button>
  );
}

export default function Casino() {
  const [game, setGame] = useState<'blackjack' | 'roulette'>('blackjack');
  const g = useGameState();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold">Casino Royale-ish</h1>
          <p className="text-sm text-ink-400">
            The house always wins. Usually. Lifetime: <span className={g.stats.casinoNet >= 0 ? 'text-up' : 'text-down'}>{money(g.stats.casinoNet, { sign: true })}</span> on {money(g.stats.casinoWagered, { compact: true })} wagered.
          </p>
        </div>
        <div className="flex rounded-xl border border-ink-700 bg-ink-850 p-1">
          {(['blackjack', 'roulette'] as const).map((v) => (
            <button key={v} onClick={() => setGame(v)} className={`rounded-lg px-4 py-1.5 text-sm font-semibold capitalize ${game === v ? 'bg-gold-500 text-ink-950' : 'text-ink-300'}`}>
              {v}
            </button>
          ))}
        </div>
      </div>
      {game === 'blackjack' ? <Blackjack /> : <Roulette />}
      <p className="text-center text-[11px] text-ink-400">Gambling winnings are taxable income. Fictional casino, fictional money — gamble responsibly in real life.</p>
    </div>
  );
}

// ---------------------------------------------------------------- Blackjack

function PlayingCard({ c, hidden, i }: { c: Card; hidden?: boolean; i: number }) {
  const red = c.suit === 1 || c.suit === 2;
  return (
    <div className="deal-in -ml-6 first:ml-0" style={{ animationDelay: `${i * 80}ms` }}>
      {hidden ? (
        <div className="h-28 w-20 rounded-xl border-2 border-white bg-[repeating-linear-gradient(45deg,#7f1d1d_0_6px,#991b1b_6px_12px)] shadow-xl sm:h-32 sm:w-24" />
      ) : (
        <div className={`relative h-28 w-20 rounded-xl border border-stone-300 bg-white shadow-xl sm:h-32 sm:w-24 ${red ? 'text-red-600' : 'text-stone-900'}`}>
          <div className="absolute left-1.5 top-1 text-center font-bold leading-none">
            <div className="text-lg">{RANKS[c.rank]}</div>
            <div className="text-base">{SUITS[c.suit]}</div>
          </div>
          <div className="absolute inset-0 grid place-items-center text-4xl">{SUITS[c.suit]}</div>
          <div className="absolute bottom-1 right-1.5 rotate-180 text-center font-bold leading-none">
            <div className="text-lg">{RANKS[c.rank]}</div>
            <div className="text-base">{SUITS[c.suit]}</div>
          </div>
        </div>
      )}
    </div>
  );
}

const OUTCOME_TEXT: Record<BjOutcome, string> = { blackjack: 'BLACKJACK! Pays 3:2', win: 'You win!', push: 'Push — bet returned', lose: 'Dealer wins', bust: 'Bust!' };

function Blackjack() {
  const g = useGameState();
  const act = useGame((s) => s.act);
  const rng = useRef(liveRng());
  const shoe = useRef<Card[]>(newShoe(rng.current));
  const [chip, setChip] = useState(100);
  const [bet, setBet] = useState(100);
  const [phase, setPhase] = useState<'bet' | 'play' | 'done'>('bet');
  const [player, setPlayer] = useState<Card[]>([]);
  const [dealer, setDealer] = useState<Card[]>([]);
  const [stake, setStake] = useState(0);
  const [outcome, setOutcome] = useState<{ o: BjOutcome; ret: number } | null>(null);

  const draw = () => {
    if (shoe.current.length < 20) shoe.current = newShoe(rng.current);
    return shoe.current.pop()!;
  };

  const finish = (p: Card[], d: Card[], st: number) => {
    const finalDealer = handValue(p).total > 21 ? d : playDealer(d, shoe.current);
    const o = settleBlackjack(p, finalDealer);
    const ret = blackjackReturn(o, st);
    act((gs) => {
      gs.player.cash += ret;
      recordGamble(gs, st, ret);
    });
    setDealer(finalDealer);
    setOutcome({ o, ret });
    setPhase('done');
  };

  const deal = () => {
    if (bet <= 0 || g.player.cash < bet) return;
    act((gs) => {
      gs.player.cash -= bet;
    });
    const p = [draw(), draw()];
    const d = [draw(), draw()];
    setPlayer(p);
    setDealer(d);
    setStake(bet);
    setOutcome(null);
    if (isBlackjack(p) || isBlackjack(d)) finish(p, d, bet);
    else setPhase('play');
  };

  const hit = () => {
    const p = [...player, draw()];
    setPlayer(p);
    if (handValue(p).total >= 21) finish(p, dealer, stake);
  };

  const double = () => {
    if (g.player.cash < stake) return;
    act((gs) => {
      gs.player.cash -= stake;
    });
    const p = [...player, draw()];
    setPlayer(p);
    setStake(stake * 2);
    finish(p, dealer, stake * 2);
  };

  const pv = handValue(player);
  const dv = phase === 'play' ? handValue(dealer.slice(0, 1)) : handValue(dealer);

  return (
    <div className="felt relative overflow-hidden rounded-3xl border-8 border-[#5b3a1e] p-4 shadow-2xl sm:p-8">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-serif text-xs font-bold uppercase tracking-[0.4em] text-white/15 sm:text-sm">
        Blackjack pays 3 to 2 · Dealer stands on soft 17
      </div>
      <div className="min-h-[150px]">
        <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/60">Dealer {dealer.length > 0 && <span className="ml-1 rounded bg-black/30 px-1.5 font-mono">{dv.total}</span>}</div>
        <div className="flex">
          {dealer.map((c, i) => (
            <PlayingCard key={i} c={c} i={i} hidden={phase === 'play' && i === 1} />
          ))}
        </div>
      </div>

      <div className="my-6 min-h-[40px] text-center">
        {outcome && (
          <div className={`inline-block rounded-full px-5 py-2 font-display text-lg font-bold shadow-lg ${outcome.ret > stake ? 'bg-gold-500 text-ink-950' : outcome.ret === stake ? 'bg-white text-ink-950' : 'bg-down text-white'}`}>
            {OUTCOME_TEXT[outcome.o]} {outcome.ret > 0 && outcome.ret !== stake ? `+${money(outcome.ret - stake)}` : outcome.ret === 0 ? `-${money(stake)}` : ''}
          </div>
        )}
      </div>

      <div className="min-h-[150px]">
        <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/60">
          You {player.length > 0 && <span className="ml-1 rounded bg-black/30 px-1.5 font-mono">{pv.soft && pv.total <= 21 ? `soft ${pv.total}` : pv.total}</span>}
          {stake > 0 && phase !== 'bet' && <span className="ml-2 font-mono text-gold-400">Bet {money(stake)}</span>}
        </div>
        <div className="flex">
          {player.map((c, i) => (
            <PlayingCard key={i} c={c} i={i} />
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-black/30 p-3">
        {phase === 'play' ? (
          <div className="grid grid-cols-3 gap-2">
            <button className="btn-primary" onClick={hit}>
              Hit
            </button>
            <button className="btn-ghost" onClick={() => finish(player, dealer, stake)}>
              Stand
            </button>
            <button className="btn-ghost" disabled={player.length !== 2 || g.player.cash < stake} onClick={double}>
              Double
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="scrollbar-none flex items-center gap-2 overflow-x-auto py-1">
              {CHIPS.map((v) => (
                <Chip key={v} v={v} active={chip === v} onClick={() => setChip(v)} />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className="btn-ghost px-3" onClick={() => setBet((b) => Math.max(0, b - chip))}>
                −
              </button>
              <div className="min-w-[110px] text-center font-mono text-xl font-bold text-gold-400">{money(bet)}</div>
              <button className="btn-ghost px-3" onClick={() => setBet((b) => b + chip)}>
                +
              </button>
              <button className="chip" onClick={() => setBet(chip)}>
                Reset
              </button>
              <button className="btn-primary ml-auto px-8" disabled={bet <= 0 || g.player.cash < bet} onClick={deal}>
                {phase === 'done' ? 'Deal again' : 'Deal'}
              </button>
            </div>
            {g.player.cash < bet && <div className="text-xs text-red-200">Not enough cash for that bet.</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Roulette

const POCKET = 360 / 37;

function Wheel({ angle, ball }: { angle: number; ball: number | null }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[320px]">
      <div className="absolute left-1/2 top-0 z-10 h-0 w-0 -translate-x-1/2 border-x-8 border-t-[14px] border-x-transparent border-t-gold-400" />
      <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-2xl" style={{ transform: `rotate(${angle}deg)`, transition: 'transform 4.2s cubic-bezier(0.15, 0.85, 0.2, 1)' }}>
        <circle cx="100" cy="100" r="99" fill="#5b3a1e" />
        <circle cx="100" cy="100" r="92" fill="#3b2412" />
        {WHEEL_ORDER.map((n, i) => {
          const a0 = ((i * POCKET - POCKET / 2 - 90) * Math.PI) / 180;
          const a1 = (((i + 1) * POCKET - POCKET / 2 - 90) * Math.PI) / 180;
          const R = 88;
          const r = 58;
          const p = (rad: number, ang: number) => `${100 + rad * Math.cos(ang)},${100 + rad * Math.sin(ang)}`;
          const color = numberColor(n) === 'green' ? '#15803d' : numberColor(n) === 'red' ? '#b91c1c' : '#111827';
          const mid = (a0 + a1) / 2;
          return (
            <g key={n}>
              <path d={`M${p(R, a0)} A${R},${R} 0 0 1 ${p(R, a1)} L${p(r, a1)} A${r},${r} 0 0 0 ${p(r, a0)} Z`} fill={color} stroke="#d4a017" strokeWidth="0.5" />
              <text x={100 + 78 * Math.cos(mid)} y={100 + 78 * Math.sin(mid)} fill="#fff" fontSize="7" fontWeight="700" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${(mid * 180) / Math.PI + 90} ${100 + 78 * Math.cos(mid)} ${100 + 78 * Math.sin(mid)})`}>
                {n}
              </text>
              {ball === n && <circle cx={100 + 64 * Math.cos(mid)} cy={100 + 64 * Math.sin(mid)} r="4" fill="#fff" stroke="#9ca3af" />}
            </g>
          );
        })}
        <circle cx="100" cy="100" r="56" fill="url(#cone)" />
        <defs>
          <radialGradient id="cone">
            <stop offset="0" stopColor="#fde68a" />
            <stop offset="0.25" stopColor="#a16207" />
            <stop offset="1" stopColor="#3b2412" />
          </radialGradient>
        </defs>
        {[0, 45, 90, 135].map((a) => (
          <rect key={a} x="97" y="52" width="6" height="96" rx="3" fill="#d4a017" transform={`rotate(${a} 100 100)`} />
        ))}
        <circle cx="100" cy="100" r="10" fill="#fde68a" stroke="#a16207" strokeWidth="2" />
      </svg>
    </div>
  );
}

const numBg = (n: number) => (numberColor(n) === 'red' ? '#b91c1c' : numberColor(n) === 'black' ? '#111827' : '#15803d');

function Cell({ bet, label, cls = '', style, bets, chip, onPlace }: { bet: RouletteBet; label: string; cls?: string; style?: React.CSSProperties; bets: Record<string, PlacedBet>; chip: number; onPlace: (b: RouletteBet) => void }) {
  const placed = bets[betKey(bet)];
  return (
    <button onClick={() => onPlace(bet)} className={`relative grid place-items-center border border-white/30 text-xs font-bold text-white transition hover:brightness-125 ${cls}`} style={style}>
      {label}
      {placed && (
        <span className="absolute -right-1 -top-1 z-10">
          <Chip v={CHIPS.includes(placed.amount) ? placed.amount : chip} small />
          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/70 px-1 text-[8px]">{chipLabel(placed.amount)}</span>
        </span>
      )}
    </button>
  );
}

const OUTSIDE: [RouletteBet, string][] = [
  [{ kind: 'low' }, '1–18'],
  [{ kind: 'even' }, 'EVEN'],
  [{ kind: 'red' }, '◆'],
  [{ kind: 'black' }, '◆'],
  [{ kind: 'odd' }, 'ODD'],
  [{ kind: 'high' }, '19–36'],
];

interface PlacedBet {
  bet: RouletteBet;
  amount: number;
}

function Roulette() {
  const g = useGameState();
  const act = useGame((s) => s.act);
  const rng = useRef(liveRng());
  const [chip, setChip] = useState(100);
  const [bets, setBets] = useState<Record<string, PlacedBet>>({});
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [ball, setBall] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const [result, setResult] = useState<{ n: number; won: number; staked: number } | null>(null);

  const total = Object.values(bets).reduce((s, b) => s + b.amount, 0);
  const place = (bet: RouletteBet) => {
    if (spinning) return;
    const k = betKey(bet);
    setBets((b) => ({ ...b, [k]: { bet, amount: (b[k]?.amount ?? 0) + chip } }));
  };

  const spin = () => {
    if (!total || total > g.player.cash || spinning) return;
    act((gs) => {
      gs.player.cash -= total;
    });
    const n = spinRoulette(rng.current);
    const idx = WHEEL_ORDER.indexOf(n);
    const target = angle - (angle % 360) + 360 * 6 - idx * POCKET;
    setAngle(target);
    setSpinning(true);
    setBall(null);
    setResult(null);
    const placed = Object.values(bets);
    window.setTimeout(() => {
      const won = placed.reduce((s, b) => s + roulettePayout(b.bet, b.amount, n), 0);
      act((gs) => {
        gs.player.cash += won;
        recordGamble(gs, total, won);
      });
      setBall(n);
      setHistory((h) => [n, ...h].slice(0, 14));
      setResult({ n, won, staked: total });
      setSpinning(false);
    }, 4300);
  };


  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
      <div className="panel panel-pad">
        <Wheel angle={angle} ball={ball} />
        <div className="mt-4 min-h-[48px] text-center">
          {spinning && <div className="animate-pulse font-display text-lg text-ink-300">No more bets…</div>}
          {result && (
            <div>
              <span className="inline-grid h-10 w-10 place-items-center rounded-full font-mono text-lg font-bold" style={{ background: numBg(result.n) }}>
                {result.n}
              </span>
              <div className={`mt-1 font-mono font-semibold ${result.won > 0 ? 'text-up' : 'text-down'}`}>{result.won > 0 ? `Won ${money(result.won)}` : `Lost ${money(result.staked)}`}</div>
            </div>
          )}
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-1">
          {history.map((n, i) => (
            <span key={i} className="grid h-7 w-7 place-items-center rounded-full font-mono text-xs font-bold" style={{ background: numBg(n) }}>
              {n}
            </span>
          ))}
        </div>
      </div>

      <div className="felt rounded-3xl border-8 border-[#5b3a1e] p-3 sm:p-5">
        {/* Desktop / tablet: classic horizontal layout */}
        <div className="hidden pb-3 sm:block">
          <div className="grid grid-cols-[40px_repeat(12,minmax(0,1fr))_44px] grid-rows-[repeat(3,44px)_36px_36px] gap-0">
            <Cell bets={bets} chip={chip} onPlace={place} bet={{ kind: 'straight', n: 0 }} label="0" cls="rounded-l-xl" style={{ background: '#15803d', gridRow: '1 / span 3', gridColumn: 1 }} />
            {[3, 2, 1].map((rowStart, r) =>
              Array.from({ length: 12 }, (_, c) => {
                const n = rowStart + c * 3;
                return <Cell key={n} bets={bets} chip={chip} onPlace={place} bet={{ kind: 'straight', n }} label={String(n)} style={{ background: numBg(n), gridRow: r + 1, gridColumn: c + 2 }} />;
              }),
            )}
            {[3, 2, 1].map((col, r) => (
              <Cell key={`c${col}`} bets={bets} chip={chip} onPlace={place} bet={{ kind: 'column', n: col as 1 | 2 | 3 }} label="2:1" style={{ gridRow: r + 1, gridColumn: 14, background: '#0c4a28' }} />
            ))}
            {[1, 2, 3].map((d) => (
              <Cell key={`d${d}`} bets={bets} chip={chip} onPlace={place} bet={{ kind: 'dozen', n: d as 1 | 2 | 3 }} label={`${d === 1 ? '1st' : d === 2 ? '2nd' : '3rd'} 12`} style={{ gridRow: 4, gridColumn: `${2 + (d - 1) * 4} / span 4`, background: '#0c4a28' }} />
            ))}
            {OUTSIDE.map(([bet, label], i) => (
              <Cell key={label + i} bets={bets} chip={chip} onPlace={place} bet={bet} label={label} cls={bet.kind === 'red' ? 'text-lg text-red-500' : bet.kind === 'black' ? 'text-lg text-black' : ''} style={{ gridRow: 5, gridColumn: `${2 + i * 2} / span 2`, background: '#0c4a28' }} />
            ))}
          </div>
        </div>

        {/* Phones: vertical layout */}
        <div className="pb-3 sm:hidden">
          <div className="grid grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,0.9fr)] gap-0">
            <Cell bets={bets} chip={chip} onPlace={place} bet={{ kind: 'straight', n: 0 }} label="0" cls="h-10 rounded-t-xl" style={{ background: '#15803d', gridColumn: '1 / span 3' }} />
            <div />
            {Array.from({ length: 12 }, (_, r) => (
              <Fragment key={r}>
                {[1, 2, 3].map((k) => {
                  const n = r * 3 + k;
                  return <Cell key={n} bets={bets} chip={chip} onPlace={place} bet={{ kind: 'straight', n }} label={String(n)} cls="h-9" style={{ background: numBg(n) }} />;
                })}
                {r % 4 === 0 ? (
                  <Cell bets={bets} chip={chip} onPlace={place} bet={{ kind: 'dozen', n: (r / 4 + 1) as 1 | 2 | 3 }} label={`${['1st', '2nd', '3rd'][r / 4]} 12`} style={{ gridRow: `span 4`, background: '#0c4a28' }} />
                ) : null}
              </Fragment>
            ))}
            {[1, 2, 3].map((col) => (
              <Cell key={`c${col}`} bets={bets} chip={chip} onPlace={place} bet={{ kind: 'column', n: col as 1 | 2 | 3 }} label="2:1" cls="h-9" style={{ background: '#0c4a28' }} />
            ))}
            <div />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-0">
            {OUTSIDE.map(([bet, label], i) => (
              <Cell key={label + i} bets={bets} chip={chip} onPlace={place} bet={bet} label={label} cls={`h-10 ${bet.kind === 'red' ? 'text-lg text-red-500' : bet.kind === 'black' ? 'text-lg text-black' : ''}`} style={{ background: '#0c4a28' }} />
            ))}
          </div>
        </div>
        <div className="mt-2 rounded-2xl bg-black/30 p-3">
          <div className="scrollbar-none flex items-center gap-2 overflow-x-auto py-1">
            {CHIPS.map((v) => (
              <Chip key={v} v={v} active={chip === v} onClick={() => setChip(v)} />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="text-sm text-white/70">
              Total bet: <span className="font-mono font-bold text-gold-400">{money(total)}</span>
            </div>
            <button className="chip ml-auto" disabled={spinning} onClick={() => setBets({})}>
              Clear
            </button>
            <button className="btn-primary px-8" disabled={!total || total > g.player.cash || spinning} onClick={spin}>
              Spin
            </button>
          </div>
          {total > g.player.cash && <div className="mt-1 text-xs text-red-200">Your bets exceed your cash.</div>}
        </div>
      </div>
    </div>
  );
}
