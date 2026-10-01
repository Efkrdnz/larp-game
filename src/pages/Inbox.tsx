import { Link } from 'react-router-dom';
import { formatDateTime } from '../engine/calendar';
import { useGameState } from '../store/useGame';

const TONE = { info: 'text-gold-500', good: 'text-up', bad: 'text-down', crime: 'text-red-400', news: 'text-gold-400' };

export default function Inbox() {
  const g = useGameState();
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="font-display text-2xl font-bold">Inbox</h1>
      <ul className="space-y-2">
        {g.inbox.map((m) => {
          const inner = (
            <>
              <div className="flex justify-between gap-2 text-xs">
                <span className={`font-bold uppercase tracking-wider ${TONE[m.kind]}`}>{m.title}</span>
                <span className="shrink-0 text-ink-400">{formatDateTime(m.t)}</span>
              </div>
              <div className="mt-0.5 text-sm text-ink-200">{m.body}</div>
            </>
          );
          return (
            <li key={m.id}>
              {m.link ? (
                <Link to={m.link} className="panel block p-3 hover:border-ink-500">
                  {inner}
                </Link>
              ) : (
                <div className="panel p-3">{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
