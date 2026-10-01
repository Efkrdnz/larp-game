import { Link } from 'react-router-dom';
import { COMPANIES } from '../../engine/data/companies';
import { dayChange } from '../../engine/market';
import { useGameState } from '../../store/useGame';
import { pct, price } from '../format';

export default function NewsTicker() {
  const g = useGameState();
  const headlines = g.news.slice(0, 6);
  const quotes = COMPANIES.slice(0, 40);
  const content = (
    <>
      {headlines.map((n) => (
        <Link key={n.id} to="/news" className="mx-5 whitespace-nowrap text-ink-200 hover:text-gold-400">
          <span className={`mr-2 font-bold ${n.breaking ? 'text-down' : 'text-gold-500'}`}>{n.breaking ? 'BREAKING' : n.category.toUpperCase()}</span>
          {n.headline}
        </Link>
      ))}
      {quotes.map((c) => {
        const s = g.stocks[c.ticker];
        const ch = dayChange(s);
        return (
          <Link key={c.ticker} to={`/stock/${c.ticker}`} className="mx-3 whitespace-nowrap font-mono">
            <span className="font-semibold text-ink-200">{c.ticker}</span> <span className="text-ink-300">{price(s.price)}</span>{' '}
            <span className={ch >= 0 ? 'text-up' : 'text-down'}>{pct(ch)}</span>
          </Link>
        );
      })}
    </>
  );
  return (
    <div className="overflow-hidden border-b border-ink-700/60 bg-ink-950/70 py-1.5 text-xs">
      <div className="ticker-track flex w-max">
        <div className="flex">{content}</div>
        <div className="flex" aria-hidden>
          {content}
        </div>
      </div>
    </div>
  );
}
