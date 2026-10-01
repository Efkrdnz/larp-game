import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../store/useGame';
import { IconX } from '../icons';

const TONE = {
  info: 'border-ink-500 bg-ink-800',
  good: 'border-up/50 bg-[#0f2418]',
  bad: 'border-down/60 bg-[#2a1012]',
  crime: 'border-crime-500/70 bg-crime-900',
  news: 'border-gold-500/50 bg-[#2a2210]',
};

export default function Toasts() {
  const toasts = useGame((s) => s.toasts);
  const dismiss = useGame((s) => s.dismissToast);
  const nav = useNavigate();

  useEffect(() => {
    if (!toasts.length) return;
    const t = window.setTimeout(() => dismiss(toasts[0].id), 6000);
    return () => window.clearTimeout(t);
  }, [toasts, dismiss]);

  return (
    <div className="pointer-events-none fixed inset-x-3 top-3 z-[60] flex flex-col items-end gap-2 sm:left-auto sm:right-4 sm:w-96">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-in pointer-events-auto w-full cursor-pointer rounded-xl border px-4 py-3 shadow-2xl ${TONE[t.kind]}`}
          onClick={() => {
            if (t.link) nav(t.link);
            dismiss(t.id);
          }}
        >
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold uppercase tracking-wider text-ink-200">{t.title}</div>
              <div className="mt-0.5 text-sm text-ink-100">{t.body}</div>
            </div>
            <button
              className="-mr-1 -mt-1 rounded p-1 text-ink-400 hover:text-ink-100"
              onClick={(e) => {
                e.stopPropagation();
                dismiss(t.id);
              }}
              aria-label="Dismiss"
            >
              <IconX width={14} height={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
