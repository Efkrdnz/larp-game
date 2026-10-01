import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { COMPANY_BY_TICKER } from '../engine/data/companies';
import { SECTORS } from '../engine/data/sectors';
import { dayIndex, formatDateTime, isMarketOpen } from '../engine/calendar';
import { dayChange } from '../engine/market';
import { COMMISSION, cancelOrder, fillPrice, marketOrder, placeOrder } from '../engine/portfolio';
import type { Bar, OrderType, Side } from '../engine/types';
import { useGame, useGameState } from '../store/useGame';
import CandleChart from '../ui/charts/CandleChart';
import CompanyLogo from '../ui/CompanyLogo';
import { compactNum, money, pct, price, upDown } from '../ui/format';

const FRAMES = [
  { id: '1D', label: '1D' },
  { id: '5D', label: '5D' },
  { id: '3M', label: '3M' },
  { id: '1Y', label: '1Y' },
] as const;
type Frame = (typeof FRAMES)[number]['id'];

export default function StockPage() {
  const { ticker = '' } = useParams();
  const g = useGameState();
  const act = useGame((s) => s.act);
  const [frame, setFrame] = useState<Frame>('1D');
  const [mode, setMode] = useState<'candles' | 'line'>('candles');
  const [showSma, setShowSma] = useState(false);
  const [side, setSide] = useState<Side>('buy');
  const [type, setType] = useState<OrderType>('market');
  const [qty, setQty] = useState('10');
  const [trigger, setTrigger] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const company = COMPANY_BY_TICKER[ticker.toUpperCase()];
  const s = company ? g.stocks[company.ticker] : undefined;

  const bars: Bar[] = useMemo(() => {
    if (!s) return [];
    if (frame === '1D') {
      const last = s.intraday[s.intraday.length - 1];
      return last ? s.intraday.filter((b) => dayIndex(b.t) === dayIndex(last.t)) : [];
    }
    if (frame === '5D') return s.intraday;
    if (frame === '3M') return s.daily.slice(-63);
    return s.daily.slice(-252);
    // g.time forces recompute every tick; bars are mutated in place.
  }, [s, frame, g.time]);

  if (!company || !s) return <Navigate to="/market" replace />;

  const ch = dayChange(s);
  const holding = g.holdings[company.ticker];
  const q = Math.max(0, Math.floor(Number(qty) || 0));
  const est = q * fillPrice(g, company.ticker, side);
  const jailed = g.player.jailUntil !== null;
  const open = isMarketOpen(g.time);
  const tip = g.tips.find((t) => t.ticker === company.ticker && t.expiresAt > g.time);
  const yearBars = s.daily.slice(-252);
  const hi52 = Math.max(...yearBars.map((b) => b.h));
  const lo52 = Math.min(...yearBars.map((b) => b.l));
  const todayBar = s.daily[s.daily.length - 1];
  const news = g.news.filter((n) => n.tickers.includes(company.ticker) || n.sectors.includes(company.sector)).slice(0, 8);
  const myTrades = g.trades.filter((t) => t.ticker === company.ticker);
  const orders = g.orders.filter((o) => o.ticker === company.ticker);
  const maxBuy = Math.max(0, Math.floor((g.player.cash - COMMISSION) / fillPrice(g, company.ticker, 'buy')));

  const submit = () => {
    const err = act((gs, ev) => {
      if (type === 'market') return marketOrder(gs, company.ticker, side, q, ev);
      return placeOrder(gs, company.ticker, side, type, q, Number(trigger));
    });
    setMsg(err ? { ok: false, text: err } : { ok: true, text: type === 'market' ? `${side === 'buy' ? 'Bought' : 'Sold'} ${q} ${company.ticker}` : `${type} order placed` });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <CompanyLogo ticker={company.ticker} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="font-display text-xl font-bold sm:text-2xl">{company.name}</h1>
            <span className="chip">
              <span className="h-2 w-2 rounded-full" style={{ background: SECTORS[company.sector].color }} />
              {SECTORS[company.sector].name}
            </span>
          </div>
          <div className="font-mono text-sm text-ink-400">NYSX: {company.ticker}</div>
        </div>
        <div className="w-full sm:w-auto sm:text-right">
          <div className="font-mono text-3xl font-bold">{price(s.price)}</div>
          <div className={`font-mono text-sm ${upDown(ch)}`}>
            {money(s.price - s.prevClose, { cents: true, sign: true })} ({pct(ch)})
          </div>
        </div>
      </div>

      {tip && (
        <div className="rounded-xl border border-crime-500/60 bg-crime-500/10 px-4 py-3 text-sm text-red-200">
          🤫 <b>Insider tip:</b> {tip.hint} <span className="text-red-300/70">Trading on this is illegal and will raise SEC heat.</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="panel p-3 sm:p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg bg-ink-900 p-0.5">
              {FRAMES.map((f) => (
                <button key={f.id} onClick={() => setFrame(f.id)} className={`rounded-md px-3 py-1 font-mono text-xs font-semibold ${frame === f.id ? 'bg-ink-700 text-gold-400' : 'text-ink-400'}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg bg-ink-900 p-0.5">
              {(['candles', 'line'] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)} className={`rounded-md px-3 py-1 text-xs font-semibold capitalize ${mode === m ? 'bg-ink-700 text-ink-100' : 'text-ink-400'}`}>
                  {m}
                </button>
              ))}
            </div>
            <button onClick={() => setShowSma((v) => !v)} className={`chip ${showSma ? 'chip-active' : ''}`}>
              SMA 20
            </button>
            <span className="ml-auto text-[11px] text-ink-400">{open ? 'Live' : 'Market closed'}</span>
          </div>
          <CandleChart
            bars={bars}
            mode={mode}
            showSma={showSma}
            intraday={frame === '1D' || frame === '5D'}
            datasetKey={`${company.ticker}-${frame}`}
            slots={frame === '1D' ? 78 : undefined}
            markers={myTrades.slice(0, 30).map((t) => ({ t: t.t, up: t.side === 'buy', text: `${t.side === 'buy' ? 'B' : 'S'} ${t.qty}` }))}
          />
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Stat label="Open" value={price(s.dayOpen)} />
            <Stat label="Day range" value={todayBar ? `${price(todayBar.l)} – ${price(todayBar.h)}` : '—'} />
            <Stat label="52w range" value={`${price(lo52)} – ${price(hi52)}`} />
            <Stat label="Volume" value={todayBar ? compactNum(todayBar.v) : '—'} />
            <Stat label="Mkt cap" value={`$${compactNum(s.price * company.shares * 1e6)}`} />
            <Stat label="Volatility" value={`${Math.round(company.vol * 100)}%`} />
            <Stat label="CEO" value={company.ceo} />
            <Stat label="Prev close" value={price(s.prevClose)} />
          </div>
          <p className="mt-3 text-sm text-ink-300">{company.blurb}</p>
        </div>

        <div className="space-y-4">
          <div className="panel panel-pad">
            <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-ink-900 p-1">
              <button onClick={() => setSide('buy')} className={`rounded-lg py-2 text-sm font-bold ${side === 'buy' ? 'bg-up text-ink-950' : 'text-ink-300'}`}>
                Buy
              </button>
              <button onClick={() => setSide('sell')} className={`rounded-lg py-2 text-sm font-bold ${side === 'sell' ? 'bg-down text-white' : 'text-ink-300'}`}>
                Sell / Short
              </button>
            </div>
            <div className="mb-3 flex gap-1">
              {(['market', 'limit', 'stop'] as const).map((t) => (
                <button key={t} onClick={() => setType(t)} className={`chip flex-1 justify-center capitalize ${type === t ? 'chip-active' : ''}`}>
                  {t}
                </button>
              ))}
            </div>
            <label className="label">Shares</label>
            <input className="input font-mono" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/[^0-9]/g, ''))} />
            <div className="mt-2 flex gap-1">
              {[1, 10, 100].map((n) => (
                <button key={n} className="chip flex-1 justify-center" onClick={() => setQty(String(n))}>
                  {n}
                </button>
              ))}
              {side === 'buy' ? (
                <button className="chip flex-1 justify-center" onClick={() => setQty(String(maxBuy))}>
                  Max
                </button>
              ) : (
                <button className="chip flex-1 justify-center" onClick={() => setQty(String(Math.max(0, holding?.qty ?? 0)))}>
                  All
                </button>
              )}
            </div>
            {type !== 'market' && (
              <div className="mt-3">
                <label className="label">{type === 'limit' ? 'Limit price' : 'Stop price'}</label>
                <input className="input font-mono" inputMode="decimal" placeholder={price(s.price)} value={trigger} onChange={(e) => setTrigger(e.target.value.replace(/[^0-9.]/g, ''))} />
                <div className="mt-1 text-[11px] text-ink-400">
                  {type === 'limit' ? (side === 'buy' ? 'Buys when price drops to this level or lower.' : 'Sells when price rises to this level or higher.') : side === 'buy' ? 'Buys when price breaks above this level.' : 'Sells when price falls to this level (stop-loss).'}
                </div>
              </div>
            )}
            <div className="mt-3 space-y-1 rounded-xl bg-ink-900 p-3 text-xs">
              <Row k="Estimated" v={money(est, { cents: true })} />
              <Row k="Commission" v={money(COMMISSION, { cents: true })} />
              <Row k="Cash available" v={money(g.player.cash)} />
            </div>
            <button className={`${side === 'buy' ? 'btn-buy' : 'btn-sell'} mt-3 w-full py-3`} disabled={jailed || q <= 0} onClick={submit}>
              {jailed ? 'You are in jail' : `${type === 'market' ? '' : 'Place '}${side === 'buy' ? 'Buy' : 'Sell'} ${q} ${company.ticker}${type === 'market' ? '' : ` ${type}`}`}
            </button>
            {!open && type === 'market' && <div className="mt-2 text-center text-[11px] text-ink-400">Market closed — market orders unavailable. Use limit/stop or skip to the open.</div>}
            {msg && <div className={`mt-2 text-center text-sm ${msg.ok ? 'text-up' : 'text-down'}`}>{msg.text}</div>}
          </div>

          <div className="panel panel-pad">
            <div className="panel-title">Your position</div>
            {holding ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Stat label={holding.qty < 0 ? 'Short shares' : 'Shares'} value={String(holding.qty)} />
                <Stat label="Avg cost" value={price(holding.avgCost)} />
                <Stat label="Value" value={money(holding.qty * s.price)} />
                <Stat label="P&L" value={money((s.price - holding.avgCost) * holding.qty, { sign: true })} cls={upDown((s.price - holding.avgCost) * holding.qty)} />
              </div>
            ) : (
              <div className="text-sm text-ink-400">No position.</div>
            )}
            {orders.length > 0 && (
              <div className="mt-3 space-y-1">
                <div className="stat-label">Open orders</div>
                {orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-lg bg-ink-900 px-2 py-1.5 text-xs">
                    <span className="font-mono">
                      {o.side.toUpperCase()} {o.qty} @ {o.type} {price(o.trigger)}
                    </span>
                    <button className="text-down" onClick={() => act((gs) => cancelOrder(gs, o.id))}>
                      Cancel
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="panel panel-pad">
        <div className="panel-title">Related news</div>
        {news.length ? (
          <ul className="space-y-3">
            {news.map((n) => (
              <li key={n.id}>
                <div className="text-[11px] text-ink-400">
                  <span className="text-gold-500">{n.category}</span> · {formatDateTime(n.t)}
                </div>
                <div className="text-sm font-medium">{n.headline}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-ink-400">Nothing recent.</div>
        )}
        <Link to="/news" className="mt-3 inline-block text-xs text-gold-400">
          Newsroom →
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, cls = '' }: { label: string; value: string; cls?: string }) {
  return (
    <div className="min-w-0">
      <div className="stat-label">{label}</div>
      <div className={`truncate font-mono text-sm ${cls}`}>{value}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-400">{k}</span>
      <span className="font-mono text-ink-100">{v}</span>
    </div>
  );
}
