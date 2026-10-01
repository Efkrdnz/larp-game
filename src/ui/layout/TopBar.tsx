import { Link } from 'react-router-dom';
import { formatClock, formatDate } from '../../engine/calendar';
import { minutesToOpen } from '../../engine/game';
import { marketStatus } from '../../engine/market';
import { netWorth } from '../../engine/portfolio';
import { useGame, useGameState } from '../../store/useGame';
import { money } from '../format';
import { IconFire, IconPause, IconPlay, IconFast } from '../icons';

const SPEEDS = [
  { v: 1, label: '1×' },
  { v: 10, label: '10×' },
  { v: 60, label: '60×' },
  { v: 240, label: '240×' },
];

const STATUS_STYLE = {
  open: 'bg-up/15 text-up border-up/40',
  pre: 'bg-gold-500/10 text-gold-400 border-gold-500/40',
  closed: 'bg-ink-700 text-ink-300 border-ink-600',
  weekend: 'bg-ink-700 text-ink-300 border-ink-600',
};

export default function TopBar() {
  const g = useGameState();
  const setSpeed = useGame((s) => s.setSpeed);
  const step = useGame((s) => s.step);
  const status = marketStatus(g.time);
  const heat = Math.max(g.heat.tax, g.heat.sec, g.heat.police);
  const toOpen = minutesToOpen(g);
  const nw = netWorth(g);

  return (
    <header className="sticky top-0 z-30 border-b border-ink-700/70 bg-ink-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2 sm:px-5">
        <Link to="/" className="font-display text-lg font-bold tracking-[0.25em] text-gold-500 lg:hidden">
          CAPITAL
        </Link>
        <div className="flex items-center gap-2">
          <div className="leading-tight">
            <div className="font-mono text-base font-semibold sm:text-lg">{formatClock(g.time)}</div>
            <div className="text-[11px] text-ink-400">{formatDate(g.time)}</div>
          </div>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[status]}`}>
            {status === 'open' ? '● Open' : status === 'pre' ? 'Pre-market' : status === 'weekend' ? 'Weekend' : 'Closed'}
          </span>
        </div>

        <div className="order-3 flex w-full items-center gap-1 sm:order-none sm:w-auto">
          <button
            className={`rounded-lg p-2 ${g.speed === 0 ? 'bg-gold-500 text-ink-950' : 'bg-ink-800 text-ink-200 hover:bg-ink-700'}`}
            onClick={() => setSpeed(g.speed === 0 ? 1 : 0)}
            aria-label={g.speed === 0 ? 'Resume' : 'Pause'}
          >
            {g.speed === 0 ? <IconPlay width={16} height={16} /> : <IconPause width={16} height={16} />}
          </button>
          {SPEEDS.map((s) => (
            <button
              key={s.v}
              onClick={() => setSpeed(s.v)}
              className={`rounded-lg px-2.5 py-1.5 font-mono text-xs font-semibold ${g.speed === s.v ? 'bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/50' : 'bg-ink-800 text-ink-300 hover:bg-ink-700'}`}
            >
              {s.label}
            </button>
          ))}
          {toOpen > 0 && !g.trial && (
            <button onClick={() => step(toOpen)} className="ml-1 flex items-center gap-1 rounded-lg bg-ink-800 px-2.5 py-1.5 text-xs font-semibold text-ink-200 hover:bg-ink-700" title="Skip to the opening bell">
              <IconFast width={14} height={14} /> Open
            </button>
          )}
        </div>

        <div className="ml-auto flex items-center gap-3 sm:gap-5">
          <div className="text-right leading-tight">
            <div className="stat-label">Cash</div>
            <div className={`font-mono text-sm font-semibold sm:text-base ${g.player.cash < 0 ? 'text-down' : ''}`}>{money(g.player.cash, { compact: true })}</div>
          </div>
          <div className="text-right leading-tight">
            <div className="stat-label">Net worth</div>
            <div className="font-mono text-sm font-semibold text-gold-400 sm:text-base">{money(nw, { compact: true })}</div>
          </div>
          <Link to="/underworld" className="flex items-center gap-1 rounded-lg px-1.5 py-1 hover:bg-ink-800" title="Heat (how much the authorities are watching you)">
            <IconFire className={heat > 60 ? 'text-down' : heat > 30 ? 'text-gold-500' : 'text-ink-400'} />
            <span className={`font-mono text-xs font-semibold ${heat > 60 ? 'text-down' : heat > 30 ? 'text-gold-400' : 'text-ink-400'}`}>{Math.round(heat)}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
