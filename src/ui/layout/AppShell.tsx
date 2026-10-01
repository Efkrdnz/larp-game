import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { formatDuration } from '../../engine/calendar';
import { useGame, useGameState } from '../../store/useGame';
import { money } from '../format';
import { IconBag, IconChart, IconDice, IconHome, IconKey, IconMore, IconNews, IconReceipt, IconSkull, IconWallet, IconGear, IconX, IconBell } from '../icons';
import TopBar from './TopBar';
import NewsTicker from './NewsTicker';
import Toasts from './Toasts';
import { netWorth } from '../../engine/portfolio';

const NAV = [
  { to: '/', label: 'Home', icon: IconHome },
  { to: '/market', label: 'Market', icon: IconChart },
  { to: '/news', label: 'News', icon: IconNews },
  { to: '/portfolio', label: 'Portfolio', icon: IconWallet },
  { to: '/shop', label: 'Shop', icon: IconBag },
  { to: '/garage', label: 'My Stuff', icon: IconKey },
  { to: '/casino', label: 'Casino', icon: IconDice },
  { to: '/underworld', label: 'Underworld', icon: IconSkull },
  { to: '/taxes', label: 'Taxes', icon: IconReceipt },
  { to: '/inbox', label: 'Inbox', icon: IconBell },
  { to: '/settings', label: 'Settings', icon: IconGear },
];

const MOBILE_MAIN = ['/', '/market', '/shop', '/casino'];
const JAIL_BLOCKED = ['/shop', '/garage', '/casino', '/underworld'];

export default function AppShell({ children }: { children: ReactNode }) {
  const g = useGameState();
  const loc = useLocation();
  const nav = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const jailed = g.player.jailUntil !== null;

  useEffect(() => {
    if (g.trial && loc.pathname !== '/court') nav('/court');
    else if (jailed && JAIL_BLOCKED.some((p) => loc.pathname.startsWith(p))) nav('/jail');
  }, [g.trial, jailed, loc.pathname, nav]);

  useEffect(() => {
    setMoreOpen(false);
    window.scrollTo({ top: 0 });
  }, [loc.pathname]);

  return (
    <div className="noise-bg min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-ink-700/60 bg-ink-950/60 lg:flex">
        <Link to="/" className="flex items-center gap-2 px-5 pb-4 pt-5">
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" className="h-8 w-8" />
          <span className="font-display text-xl font-bold tracking-[0.25em] text-gold-500">CAPITAL</span>
        </Link>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-gold-500/10 text-gold-400' : 'text-ink-300 hover:bg-ink-800 hover:text-ink-100'} ${n.to === '/underworld' ? 'mt-3' : ''}`
              }
            >
              <n.icon />
              {n.label}
              {n.to === '/taxes' && g.tax.bill && <span className="ml-auto h-2 w-2 rounded-full bg-gold-500" />}
              {n.to === '/underworld' && g.investigation && <span className="ml-auto h-2 w-2 rounded-full bg-crime-500" />}
            </NavLink>
          ))}
        </nav>
        <div className="m-3 rounded-xl border border-ink-700 bg-ink-850 p-3">
          <div className="truncate text-sm font-semibold">{g.player.name}</div>
          <div className="truncate text-xs text-ink-400">{jailed ? 'Inmate #' + (40000 + g.player.jailTerms * 137) : g.player.job}</div>
          <div className="mt-2 font-mono text-sm text-gold-400">{money(netWorth(g), { compact: true })}</div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <TopBar />
        <NewsTicker />
        <StatusBanners />
        <main className="mx-auto max-w-7xl px-3 pb-28 pt-4 sm:px-5 lg:pb-10">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-ink-700 bg-ink-950/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5">
          {NAV.filter((n) => MOBILE_MAIN.includes(n.to)).map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${isActive ? 'text-gold-400' : 'text-ink-400'}`}>
              <n.icon />
              {n.label}
            </NavLink>
          ))}
          <button onClick={() => setMoreOpen(true)} className="relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-ink-400">
            <IconMore />
            More
            {(g.tax.bill || g.investigation) && <span className="absolute right-[30%] top-2 h-2 w-2 rounded-full bg-crime-500" />}
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="pb-safe absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-ink-600 bg-ink-850 p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-sm font-bold uppercase tracking-widest text-ink-300">Menu</span>
              <button onClick={() => setMoreOpen(false)} className="rounded-full p-2 text-ink-300 hover:bg-ink-700" aria-label="Close menu">
                <IconX />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {NAV.filter((n) => !MOBILE_MAIN.includes(n.to)).map((n) => (
                <NavLink key={n.to} to={n.to} className={({ isActive }) => `flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-xs font-medium ${isActive ? 'border-gold-500/50 bg-gold-500/10 text-gold-400' : 'border-ink-700 bg-ink-800 text-ink-200'} ${n.to === '/underworld' ? 'border-crime-500/40 text-red-300' : ''}`}>
                  <n.icon width={24} height={24} />
                  {n.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      <Toasts />
      <AwayModal />
    </div>
  );
}

function StatusBanners() {
  const g = useGameState();
  const items: { to: string; text: string; tone: string }[] = [];
  if (g.player.jailUntil !== null)
    items.push({ to: '/jail', text: `🔒 You are in prison — ${formatDuration(g.player.jailUntil - g.time)} left`, tone: 'border-crime-500/50 bg-crime-500/15 text-red-200' });
  if (g.investigation)
    items.push({ to: '/underworld', text: `🕵️ Under investigation by the ${g.investigation.agency === 'tax' ? 'Revenue Service' : g.investigation.agency === 'sec' ? 'Securities Commission' : 'Federal Police'} — evidence ${Math.round(g.investigation.evidence)}%`, tone: 'border-crime-500/40 bg-crime-500/10 text-red-200' });
  if (g.tax.bill)
    items.push({ to: '/taxes', text: `🧾 Tax bill: ${money(g.tax.bill.owed)} due in ${formatDuration(g.tax.bill.dueAt - g.time)}`, tone: 'border-gold-500/40 bg-gold-500/10 text-gold-400' });
  if (!items.length) return null;
  return (
    <div className="mx-auto max-w-7xl space-y-2 px-3 pt-3 sm:px-5">
      {items.map((i) => (
        <Link key={i.to} to={i.to} className={`block rounded-xl border px-4 py-2 text-sm font-medium ${i.tone}`}>
          {i.text}
        </Link>
      ))}
    </div>
  );
}

function AwayModal() {
  const away = useGame((s) => s.awaySummary);
  const clear = useGame((s) => s.clearAway);
  if (!away) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={clear}>
      <div className="panel panel-pad w-full max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
        <div className="font-display text-xs font-bold uppercase tracking-widest text-ink-400">While you were away</div>
        <div className="mt-2 text-2xl font-bold">{formatDuration(away.minutes)} passed</div>
        <div className="mt-1 text-sm text-ink-300">The market kept moving without you.</div>
        <div className={`mt-4 font-mono text-3xl font-bold ${away.netWorthDelta >= 0 ? 'text-up' : 'text-down'}`}>{money(away.netWorthDelta, { sign: true })}</div>
        <div className="text-xs text-ink-400">net worth change</div>
        <button className="btn-primary mt-5 w-full" onClick={clear}>
          Back to work
        </button>
      </div>
    </div>
  );
}
