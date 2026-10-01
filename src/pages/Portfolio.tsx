import { Link } from 'react-router-dom';
import { COMPANY_BY_TICKER } from '../engine/data/companies';
import { SECTORS } from '../engine/data/sectors';
import { formatDateTime } from '../engine/calendar';
import { cancelOrder, equity, holdingsValue, shortExposure } from '../engine/portfolio';
import { useGame, useGameState } from '../store/useGame';
import CompanyLogo from '../ui/CompanyLogo';
import { money, pct, price, upDown } from '../ui/format';

function Donut({ slices }: { slices: { label: string; value: number; color: string }[] }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  if (total <= 0) return <div className="grid h-40 place-items-center text-sm text-ink-400">Nothing invested yet.</div>;
  let acc = 0;
  const R = 60;
  const C = 2 * Math.PI * R;
  return (
    <div className="flex flex-wrap items-center gap-4">
      <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90">
        <circle cx="80" cy="80" r={R} fill="none" stroke="#1b2230" strokeWidth="22" />
        {slices.map((s) => {
          const len = (s.value / total) * C;
          const el = <circle key={s.label} cx="80" cy="80" r={R} fill="none" stroke={s.color} strokeWidth="22" strokeDasharray={`${Math.max(0, len - 1.5)} ${C}`} strokeDashoffset={-acc} />;
          acc += len;
          return el;
        })}
      </svg>
      <ul className="space-y-1 text-xs">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="w-24 text-ink-300">{s.label}</span>
            <span className="font-mono">{((s.value / total) * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Portfolio() {
  const g = useGameState();
  const act = useGame((s) => s.act);
  const positions = Object.entries(g.holdings).map(([t, h]) => {
    const p = g.stocks[t].price;
    return { t, h, p, value: h.qty * p, pnl: (p - h.avgCost) * h.qty, pnlPct: h.qty > 0 ? p / h.avgCost - 1 : h.avgCost / p - 1 };
  });
  const unreal = positions.reduce((s, x) => s + x.pnl, 0);
  const bySector: Record<string, number> = {};
  for (const x of positions) if (x.h.qty > 0) {
    const sec = COMPANY_BY_TICKER[x.t].sector;
    bySector[sec] = (bySector[sec] ?? 0) + x.value;
  }
  const slices = [
    { label: 'Cash', value: Math.max(0, g.player.cash), color: '#5d6b82' },
    ...Object.entries(bySector).map(([k, v]) => ({ label: SECTORS[k as keyof typeof SECTORS].name, value: v, color: SECTORS[k as keyof typeof SECTORS].color })),
  ];

  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Portfolio</h1>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ['Equity', money(equity(g))],
          ['Cash', money(g.player.cash)],
          ['Securities', money(holdingsValue(g))],
          ['Unrealised P&L', money(unreal, { sign: true }), upDown(unreal)],
          ['Realised (quarter)', money(g.tax.quarterGains, { sign: true }), upDown(g.tax.quarterGains)],
        ].map(([l, v, c]) => (
          <div key={l} className="panel p-4">
            <div className="stat-label">{l}</div>
            <div className={`stat-value ${c ?? ''}`}>{v}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wider text-ink-400">
              <tr className="border-b border-ink-700">
                <th className="px-4 py-2">Position</th>
                <th className="px-2 py-2 text-right">Qty</th>
                <th className="px-2 py-2 text-right">Avg</th>
                <th className="px-2 py-2 text-right">Price</th>
                <th className="px-2 py-2 text-right">Value</th>
                <th className="px-4 py-2 text-right">P&L</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((x) => (
                <tr key={x.t} className="border-b border-ink-700/50 last:border-0 hover:bg-ink-800">
                  <td className="px-4 py-2">
                    <Link to={`/stock/${x.t}`} className="flex items-center gap-2">
                      <CompanyLogo ticker={x.t} size={28} />
                      <span className="font-mono font-bold">{x.t}</span>
                      {x.h.qty < 0 && <span className="rounded bg-down/20 px-1.5 text-[10px] font-bold text-down">SHORT</span>}
                    </Link>
                  </td>
                  <td className="px-2 py-2 text-right font-mono">{x.h.qty}</td>
                  <td className="px-2 py-2 text-right font-mono">{price(x.h.avgCost)}</td>
                  <td className="px-2 py-2 text-right font-mono">{price(x.p)}</td>
                  <td className="px-2 py-2 text-right font-mono">{money(x.value)}</td>
                  <td className={`px-4 py-2 text-right font-mono ${upDown(x.pnl)}`}>
                    {money(x.pnl, { sign: true })}
                    <div className="text-[11px]">{pct(x.pnlPct)}</div>
                  </td>
                </tr>
              ))}
              {!positions.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-ink-400">
                    No positions. <Link to="/market" className="text-gold-400">Find something to buy →</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="panel panel-pad">
          <div className="panel-title">Allocation</div>
          <Donut slices={slices} />
          {shortExposure(g) > 0 && <div className="mt-3 text-xs text-ink-400">Short exposure: {money(shortExposure(g))} (margin call below 30% equity cover)</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="panel panel-pad">
          <div className="panel-title">Open orders</div>
          {g.orders.length ? (
            <ul className="space-y-1.5">
              {g.orders.map((o) => (
                <li key={o.id} className="flex items-center justify-between rounded-lg bg-ink-900 px-3 py-2 text-sm">
                  <span className="font-mono">
                    <span className={o.side === 'buy' ? 'text-up' : 'text-down'}>{o.side.toUpperCase()}</span> {o.qty} {o.ticker} · {o.type} @ {price(o.trigger)}
                  </span>
                  <button className="text-xs text-down" onClick={() => act((gs) => cancelOrder(gs, o.id))}>
                    Cancel
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-ink-400">No open orders.</div>
          )}
        </div>
        <div className="panel panel-pad">
          <div className="panel-title">Trade history</div>
          {g.trades.length ? (
            <ul className="max-h-80 space-y-1 overflow-y-auto">
              {g.trades.slice(0, 50).map((t) => (
                <li key={t.id} className="flex items-center justify-between rounded-lg bg-ink-900 px-3 py-1.5 text-xs">
                  <span className="font-mono">
                    <span className={t.side === 'buy' ? 'text-up' : 'text-down'}>{t.side.toUpperCase()}</span> {t.qty} {t.ticker} @ {price(t.price)}
                    {t.insider && <span className="ml-1 text-down">⚠ insider</span>}
                  </span>
                  <span className="text-right">
                    <span className={`font-mono ${upDown(t.realized)}`}>{Math.abs(t.realized) > 5 ? money(t.realized, { sign: true }) : ''}</span>
                    <span className="ml-2 text-ink-400">{formatDateTime(t.t)}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-ink-400">No trades yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
