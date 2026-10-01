import { Link } from 'react-router-dom';
import { COMPANIES, COMPANY_BY_TICKER } from '../engine/data/companies';
import { formatClock, formatDateTime } from '../engine/calendar';
import { GIG_PAY, START_CASH } from '../engine/game';
import { dayChange, indexValue } from '../engine/market';
import { assetsValue, holdingsValue, netWorth } from '../engine/portfolio';
import { dailyUpkeep, hasResidence } from '../engine/shop';
import { useGame, useGameState } from '../store/useGame';
import AreaChart from '../ui/charts/AreaChart';
import Sparkline from '../ui/charts/Sparkline';
import CompanyLogo from '../ui/CompanyLogo';
import { money, pct, price, upDown } from '../ui/format';

export default function Dashboard() {
  const g = useGameState();
  const gig = useGame((s) => s.gig);
  const nw = netWorth(g);
  const idx = indexValue(g.stocks);
  const idxHist = g.indexHistory.slice(-24 * 5).map((p) => p.v);
  const movers = COMPANIES.map((c) => ({ c, ch: dayChange(g.stocks[c.ticker]) })).sort((a, b) => b.ch - a.ch);
  const gainers = movers.slice(0, 5);
  const losers = movers.slice(-5).reverse();
  const jailed = g.player.jailUntil !== null;
  const allTime = Math.round(nw - START_CASH - 6500);

  const board = [...g.rivals.map((r) => ({ id: r.id, name: r.name, title: r.title, nw: r.netWorth, me: false })), { id: 'me', name: g.player.name, title: 'You', nw, me: true }].sort((a, b) => b.nw - a.nw);

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="panel panel-pad lg:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <div className="stat-label">Net worth</div>
              <div className="font-mono text-3xl font-bold text-gold-400 sm:text-4xl">{money(nw)}</div>
              <div className={`font-mono text-sm ${upDown(allTime)}`}>{money(allTime, { sign: true })} all-time</div>
            </div>
            <div className="text-right text-xs text-ink-400">
              {g.player.job}
              <br />
              {g.player.salary > 0 ? `${money(g.player.salary)}/workday` : 'No salary'}
            </div>
          </div>
          <div className="mt-3">
            <AreaChart points={g.netWorthHistory.slice(-24 * 30)} height={170} />
          </div>
        </div>

        <div className="panel panel-pad">
          <div className="panel-title">Balance sheet</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Cash', g.player.cash],
              ['Securities', holdingsValue(g)],
              ['Assets', assetsValue(g)],
              ['Offshore', g.player.offshore],
            ].map(([l, v]) => (
              <div key={l as string} className="rounded-xl bg-ink-900 p-3">
                <div className="stat-label">{l}</div>
                <div className={`font-mono text-base font-semibold ${(v as number) < 0 ? 'text-down' : ''}`}>{money(v as number, { compact: true })}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <Meter label="Reputation" value={g.player.reputation} color="#f0b429" />
            <Meter label="Infamy" value={g.player.infamy} color="#dc2626" />
          </div>
          <div className="mt-4 rounded-xl bg-ink-900 p-3 text-xs text-ink-300">
            <div className="flex justify-between">
              <span>Daily upkeep {hasResidence(g) ? '' : '(incl. rent)'}</span>
              <span className="font-mono text-ink-100">{money(dailyUpkeep(g))}</span>
            </div>
            {!hasResidence(g) && <div className="mt-1 text-ink-400">You rent a tiny studio. Buy a home to stop paying rent.</div>}
          </div>
          <button className="btn-ghost mt-3 w-full" disabled={jailed || !!g.trial} onClick={gig}>
            🛵 Do a delivery gig (+{money(GIG_PAY)}, 4 hours)
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="panel panel-pad">
          <div className="panel-title">
            <span>CAP 500 Index</span>
            <Link to="/market" className="text-xs normal-case tracking-normal text-gold-400">
              Market →
            </Link>
          </div>
          <div className="flex items-end justify-between">
            <div className="font-mono text-2xl font-bold">{price(idx)}</div>
            <div className={`font-mono text-sm ${upDown(idx - (idxHist[0] ?? idx))}`}>{pct(idx / (idxHist[0] ?? idx) - 1)} 5d</div>
          </div>
          <Sparkline values={idxHist} width={320} height={70} className="mt-2 h-[70px] w-full" />
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <MoverList title="Top gainers" rows={gainers} />
            <MoverList title="Top losers" rows={losers} />
          </div>
        </div>

        <div className="panel panel-pad">
          <div className="panel-title">
            <span>Headlines</span>
            <Link to="/news" className="text-xs normal-case tracking-normal text-gold-400">
              All news →
            </Link>
          </div>
          <ul className="space-y-3">
            {g.news.slice(0, 6).map((n) => (
              <li key={n.id} className="border-b border-ink-700/60 pb-2 last:border-0">
                <div className="flex items-center gap-2 text-[11px] text-ink-400">
                  <span className={n.breaking ? 'font-bold text-down' : 'text-gold-500'}>{n.category}</span>
                  <span>{formatClock(n.t)}</span>
                  {n.tickers.map((t) => (
                    <Link key={t} to={`/stock/${t}`} className={`font-mono ${upDown(dayChange(g.stocks[t]))}`}>
                      {t} {pct(dayChange(g.stocks[t]), 1)}
                    </Link>
                  ))}
                </div>
                <div className="mt-0.5 text-sm font-medium leading-snug">{n.headline}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel panel-pad">
          <div className="panel-title">Rich list</div>
          <ol className="space-y-1.5">
            {board.map((r, i) => (
              <li key={r.id} className={`flex items-center gap-3 rounded-xl px-2 py-1.5 ${r.me ? 'bg-gold-500/10 ring-1 ring-gold-500/40' : ''}`}>
                <span className="w-5 text-right font-mono text-xs text-ink-400">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-sm font-medium ${r.me ? 'text-gold-400' : ''}`}>{r.name}</div>
                  <div className="truncate text-[11px] text-ink-400">{r.title}</div>
                </div>
                <span className="font-mono text-xs">{money(r.nw, { compact: true })}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="panel panel-pad">
        <div className="panel-title">
          <span>Inbox</span>
          <Link to="/inbox" className="text-xs normal-case tracking-normal text-gold-400">
            All →
          </Link>
        </div>
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {g.inbox.slice(0, 6).map((m) => (
            <li key={m.id} className="rounded-xl bg-ink-900 px-3 py-2">
              <div className="flex justify-between text-[11px] text-ink-400">
                <span className={m.kind === 'crime' || m.kind === 'bad' ? 'text-down' : m.kind === 'good' ? 'text-up' : 'text-gold-500'}>{m.title}</span>
                <span>{formatDateTime(m.t)}</span>
              </div>
              <div className="text-sm text-ink-200">{m.body}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-ink-300">{label}</span>
        <span className="font-mono">{Math.round(value)}/100</span>
      </div>
      <div className="h-2 rounded-full bg-ink-700">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

function MoverList({ title, rows }: { title: string; rows: { c: (typeof COMPANIES)[number]; ch: number }[] }) {
  return (
    <div>
      <div className="stat-label mb-1">{title}</div>
      {rows.map(({ c, ch }) => (
        <Link key={c.ticker} to={`/stock/${c.ticker}`} className="flex items-center justify-between rounded-lg px-1 py-1 hover:bg-ink-800">
          <span className="flex items-center gap-1.5">
            <CompanyLogo ticker={c.ticker} size={18} />
            <span className="font-mono font-semibold">{COMPANY_BY_TICKER[c.ticker].ticker}</span>
          </span>
          <span className={`font-mono ${upDown(ch)}`}>{pct(ch, 1)}</span>
        </Link>
      ))}
    </div>
  );
}
