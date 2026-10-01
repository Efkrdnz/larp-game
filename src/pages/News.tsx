import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatClock, formatDate, MIN_PER_DAY } from '../engine/calendar';
import { SECTORS } from '../engine/data/sectors';
import { dayChange } from '../engine/market';
import type { NewsItem } from '../engine/types';
import { useGameState } from '../store/useGame';
import { pct, upDown } from '../ui/format';

export default function News() {
  const g = useGameState();
  const [cat, setCat] = useState<string>('All');
  const cats = ['All', ...Array.from(new Set(g.news.map((n) => n.category)))];
  const list = g.news.filter((n) => cat === 'All' || n.category === cat);
  const [top, ...rest] = list;

  const tickers = (n: NewsItem) => (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {n.tickers.map((t) => {
        const ch = dayChange(g.stocks[t]);
        return (
          <Link key={t} to={`/stock/${t}`} className="chip font-mono">
            {t} <span className={upDown(ch)}>{pct(ch, 1)}</span>
          </Link>
        );
      })}
      {n.sectors.map((s) => (
        <span key={s} className="chip">
          <span className="h-2 w-2 rounded-full" style={{ background: SECTORS[s].color }} />
          {SECTORS[s].name}
        </span>
      ))}
    </div>
  );

  const stamp = (n: NewsItem) =>
    n.rumor && g.time - n.t > MIN_PER_DAY ? (
      <span className="ml-2 rotate-[-4deg] rounded border-2 border-down px-1.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-down">Debunked</span>
    ) : null;

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="rounded-2xl border border-ink-700 bg-[#f4efe4] px-4 py-5 text-center text-ink-950 sm:px-8">
        <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-500">
          {formatDate(g.time)} · Late edition · $2.00
        </div>
        <div className="my-1 border-y-4 border-double border-stone-800 py-2 font-serif text-4xl font-black tracking-tight sm:text-6xl">The Daily Ledger</div>
        <div className="text-[11px] italic text-stone-600">“All the news that moves the market”</div>

        {top ? (
          <article className="mt-5 text-left">
            <div className="text-xs font-bold uppercase tracking-widest text-red-700">
              {top.breaking ? 'Breaking · ' : ''}
              {top.category} · {formatClock(top.t)}
            </div>
            <h1 className="mt-1 font-serif text-3xl font-black leading-tight sm:text-4xl">
              {top.headline}
              {stamp(top)}
            </h1>
            <p className="mt-2 font-serif text-base leading-relaxed text-stone-700">{top.body}</p>
            <div className="[&_.chip]:border-stone-300 [&_.chip]:bg-white [&_.chip]:text-stone-800">
              {tickers(top)}
            </div>
          </article>
        ) : (
          <div className="mt-6 text-stone-500">No news yet.</div>
        )}
      </div>

      <div className="scrollbar-none flex gap-1.5 overflow-x-auto">
        {cats.map((c) => (
          <button key={c} className={`chip whitespace-nowrap ${cat === c ? 'chip-active' : ''}`} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {rest.map((n) => (
          <article key={n.id} className="panel panel-pad">
            <div className="flex items-center gap-2 text-[11px] text-ink-400">
              <span className={n.breaking ? 'font-bold text-down' : 'font-semibold text-gold-500'}>{n.breaking ? 'BREAKING' : n.category.toUpperCase()}</span>
              <span>
                {formatDate(n.t)} {formatClock(n.t)}
              </span>
            </div>
            <h2 className="mt-1 font-serif text-lg font-bold leading-snug">
              {n.headline}
              {stamp(n)}
            </h2>
            <p className="mt-1 text-sm text-ink-300">{n.body}</p>
            {tickers(n)}
          </article>
        ))}
      </div>
    </div>
  );
}
