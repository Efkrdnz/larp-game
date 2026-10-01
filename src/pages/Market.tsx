import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { COMPANIES } from '../engine/data/companies';
import { SECTORS, SECTOR_IDS } from '../engine/data/sectors';
import { dayChange, sessionBars } from '../engine/market';
import type { SectorId } from '../engine/types';
import { useGameState } from '../store/useGame';
import Sparkline from '../ui/charts/Sparkline';
import CompanyLogo from '../ui/CompanyLogo';
import { compactNum, money, pct, price, upDown } from '../ui/format';

type Sort = 'cap' | 'change' | 'name';

function heatColor(ch: number): string {
  const a = Math.min(1, Math.abs(ch) / 0.04);
  return ch >= 0 ? `rgba(34,197,94,${0.15 + a * 0.7})` : `rgba(239,68,68,${0.15 + a * 0.7})`;
}

export default function Market() {
  const g = useGameState();
  const [view, setView] = useState<'list' | 'heatmap'>('list');
  const [sector, setSector] = useState<SectorId | 'all'>('all');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('cap');

  const rows = useMemo(() => {
    const list = COMPANIES.filter((c) => (sector === 'all' || c.sector === sector) && (`${c.ticker} ${c.name}`.toLowerCase().includes(q.toLowerCase())));
    return list
      .map((c) => ({ c, s: g.stocks[c.ticker], ch: dayChange(g.stocks[c.ticker]), cap: g.stocks[c.ticker].price * c.shares * 1e6 }))
      .sort((a, b) => (sort === 'cap' ? b.cap - a.cap : sort === 'change' ? b.ch - a.ch : a.c.ticker.localeCompare(b.c.ticker)));
  }, [g, g.time, sector, q, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="mr-auto font-display text-2xl font-bold">Stock Market</h1>
        <div className="flex rounded-xl border border-ink-700 bg-ink-850 p-1">
          {(['list', 'heatmap'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold capitalize ${view === v ? 'bg-ink-700 text-ink-100' : 'text-ink-400'}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <input className="input max-w-xs py-2" placeholder="Search ticker or company…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="scrollbar-none flex gap-1.5 overflow-x-auto">
          <button className={`chip ${sector === 'all' ? 'chip-active' : ''}`} onClick={() => setSector('all')}>
            All
          </button>
          {SECTOR_IDS.map((s) => (
            <button key={s} className={`chip whitespace-nowrap ${sector === s ? 'chip-active' : ''}`} onClick={() => setSector(s)}>
              <span className="h-2 w-2 rounded-full" style={{ background: SECTORS[s].color }} />
              {SECTORS[s].name}
            </button>
          ))}
        </div>
      </div>

      {view === 'list' ? (
        <div className="panel overflow-hidden">
          <div className="hidden grid-cols-[minmax(0,2.2fr)_1fr_1fr_1fr_1fr] gap-3 border-b border-ink-700 px-4 py-2 text-[11px] uppercase tracking-wider text-ink-400 md:grid">
            <button className="text-left" onClick={() => setSort('name')}>Company</button>
            <span>Today</span>
            <span className="text-right">Price</span>
            <button className="text-right" onClick={() => setSort('change')}>Change</button>
            <button className="text-right" onClick={() => setSort('cap')}>Mkt cap</button>
          </div>
          {rows.map(({ c, s, ch, cap }) => (
            <Link key={c.ticker} to={`/stock/${c.ticker}`} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-ink-700/50 px-4 py-2.5 last:border-0 hover:bg-ink-800 md:grid-cols-[minmax(0,2.2fr)_1fr_1fr_1fr_1fr]">
              <div className="flex min-w-0 items-center gap-3">
                <CompanyLogo ticker={c.ticker} />
                <div className="min-w-0">
                  <div className="font-mono text-sm font-bold">{c.ticker}</div>
                  <div className="truncate text-xs text-ink-400">{c.name}</div>
                </div>
              </div>
              <Sparkline values={sessionBars(s).map((b) => b.c)} baseline={s.prevClose} width={90} height={30} className="hidden sm:block" />
              <div className="text-right font-mono text-sm md:order-none">
                {price(s.price)}
                <div className={`text-xs md:hidden ${upDown(ch)}`}>{pct(ch)}</div>
              </div>
              <div className={`hidden text-right font-mono text-sm md:block ${upDown(ch)}`}>{pct(ch)}</div>
              <div className="hidden text-right font-mono text-sm text-ink-300 md:block">${compactNum(cap)}</div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {SECTOR_IDS.filter((s) => sector === 'all' || s === sector).map((sid) => {
            const list = rows.filter((r) => r.c.sector === sid);
            if (!list.length) return null;
            const avg = list.reduce((a, r) => a + r.ch * r.cap, 0) / list.reduce((a, r) => a + r.cap, 0);
            return (
              <div key={sid} className="panel p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-ink-300">{SECTORS[sid].name}</span>
                  <span className={`font-mono ${upDown(avg)}`}>{pct(avg)}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {list.map(({ c, s, ch, cap }) => (
                    <Link
                      key={c.ticker}
                      to={`/stock/${c.ticker}`}
                      className="flex min-h-[64px] min-w-[84px] flex-col justify-center rounded-lg p-2 text-center transition hover:brightness-125"
                      style={{ background: heatColor(ch), flexGrow: Math.sqrt(cap / 1e9) }}
                    >
                      <div className="font-mono text-sm font-bold">{c.ticker}</div>
                      <div className="font-mono text-xs">{pct(ch)}</div>
                      <div className="font-mono text-[10px] text-ink-200/70">{money(s.price, { cents: true })}</div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
