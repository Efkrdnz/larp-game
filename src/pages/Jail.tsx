import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MIN_PER_DAY, formatDuration } from '../engine/calendar';
import { APPEAL_COST, bribeGuard, fileAppeal, jailBribeGuardCost, prisonWork } from '../engine/justice';
import { netWorth } from '../engine/portfolio';
import { useGame, useGameState } from '../store/useGame';
import { JailCell } from '../ui/art/Scenes';
import { money } from '../ui/format';

export default function Jail() {
  const g = useGameState();
  const act = useGame((s) => s.act);
  const setSpeed = useGame((s) => s.setSpeed);
  const step = useGame((s) => s.step);
  const [msg, setMsg] = useState<string | null>(null);
  const [lastShift, setLastShift] = useState(-Infinity);
  const until = g.player.jailUntil;

  if (until === null) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <JailCell daysServed={0} daysTotal={0} className="mx-auto w-full rounded-2xl opacity-60" />
        <p className="mt-4 text-ink-400">You are a free {g.player.jailTerms ? 'ex-con' : 'citizen'}. {g.player.jailTerms ? `Prison terms served: ${g.player.jailTerms}.` : ''}</p>
        <Link to="/" className="btn-primary mt-4">
          Back to business
        </Link>
      </div>
    );
  }

  const record = g.record.find((r) => r.text.startsWith('Convicted') || r.text.startsWith('Pleaded'));
  const total = record ? Math.round((until - record.t) / MIN_PER_DAY) : 0;
  const served = record ? (g.time - record.t) / MIN_PER_DAY : 0;
  const canWork = g.time - lastShift >= 60 * 8;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="text-center">
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-ink-400">Kingsbridge Federal Penitentiary · Inmate #{40000 + g.player.jailTerms * 137}</div>
        <h1 className="font-display text-3xl font-bold">Behind bars</h1>
        <p className="font-mono text-lg text-gold-400">{formatDuration(until - g.time)} left</p>
      </div>
      <JailCell daysServed={served} daysTotal={total} className="w-full rounded-2xl border-4 border-ink-700" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <button
          className="btn-ghost flex-col py-4"
          disabled={!canWork}
          onClick={() => {
            act((gs) => prisonWork(gs));
            step(60 * 8);
            setLastShift(g.time);
            setMsg('You folded 400 towels in the laundry. +$35.');
          }}
        >
          🧺 Laundry shift
          <span className="text-xs text-ink-400">+$35 · 8 hours</span>
        </button>
        <button className="btn-crime flex-col py-4" onClick={() => setMsg(act((gs, ev) => bribeGuard(gs, ev)))}>
          🤫 Bribe a guard
          <span className="font-mono text-xs opacity-70">{money(jailBribeGuardCost(g), { compact: true })} · ~{Math.round((0.35 + g.player.infamy * 0.002) * 100)}%</span>
        </button>
        <button className="btn-ghost flex-col py-4" onClick={() => setMsg(act((gs, ev) => fileAppeal(gs, ev)))}>
          ⚖️ File an appeal
          <span className="font-mono text-xs text-ink-400">{money(APPEAL_COST)} · 30% chance</span>
        </button>
        <button className="btn-primary flex-col py-4" onClick={() => setSpeed(240)}>
          ⏩ Serve time
          <span className="text-xs opacity-70">Fast-forward (240×)</span>
        </button>
      </div>
      {msg && <div className="text-center text-sm text-gold-400">{msg}</div>}

      <div className="panel panel-pad grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <div className="stat-label">Net worth (frozen accounts)</div>
          <div className="font-mono text-lg">{money(netWorth(g))}</div>
        </div>
        <div>
          <div className="stat-label">Cash</div>
          <div className="font-mono text-lg">{money(g.player.cash)}</div>
        </div>
        <div>
          <div className="stat-label">Open positions</div>
          <div className="font-mono text-lg">{Object.keys(g.holdings).length}</div>
        </div>
        <p className="text-xs text-ink-400 sm:col-span-3">Your positions keep moving with the market while you are inside, but you cannot trade, shop or gamble. Upkeep on your assets is still due.</p>
      </div>
    </div>
  );
}
