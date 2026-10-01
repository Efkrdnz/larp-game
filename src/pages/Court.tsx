import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AGENCY_NAMES, LAWYERS, bribeJudge, convictionChance, goToTrial, hireTrialLawyer, judgeBribeCost, lawyerCost, sentenceDays, takePlea, type Verdict } from '../engine/justice';
import { useGame, useGameState } from '../store/useGame';
import { Courtroom } from '../ui/art/Scenes';
import { money } from '../ui/format';

export default function Court() {
  const g = useGameState();
  const act = useGame((s) => s.act);
  const nav = useNavigate();
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [deliberating, setDeliberating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const t = g.trial;

  if (!t && !verdict) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <Courtroom className="mx-auto w-full rounded-2xl" />
        <p className="mt-4 text-ink-400">No court dates on your calendar. Keep it that way.</p>
      </div>
    );
  }

  if (verdict) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Courtroom className="w-full rounded-2xl border border-ink-700" verdict={verdict.guilty ? 'guilty' : 'innocent'} />
        <div className={`panel panel-pad text-center ${verdict.guilty ? 'border-down/50' : 'border-up/50'}`}>
          <div className={`font-display text-3xl font-bold ${verdict.guilty ? 'text-down' : 'text-up'}`}>{verdict.guilty ? (verdict.plea ? 'Plea accepted' : 'Guilty on all counts') : 'Not guilty!'}</div>
          {verdict.guilty ? (
            <div className="mt-3 space-y-1 text-sm text-ink-200">
              <div>
                Sentence: <b>{verdict.days} days</b> in Kingsbridge Federal Penitentiary
              </div>
              <div>Fine: {money(verdict.fine)}</div>
              {verdict.seizedOffshore > 0 && <div>Offshore funds seized: {money(verdict.seizedOffshore)}</div>}
              <div className="text-ink-400">You were also fired from your job. Your reputation is in tatters.</div>
            </div>
          ) : (
            <div className="mt-2 text-sm text-ink-300">You walk out the front door to a crowd of photographers. Heat halved.</div>
          )}
          <button className="btn-primary mt-5 w-full" onClick={() => nav(verdict.guilty ? '/jail' : '/')}>
            {verdict.guilty ? 'Report to prison' : 'Go home'}
          </button>
        </div>
      </div>
    );
  }

  if (!t) return null;
  const p = convictionChance(t);
  const plea = Math.max(5, Math.round(sentenceDays(t) * 0.6));

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="text-center">
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-down">The People v. {g.player.name}</div>
        <h1 className="font-display text-3xl font-bold">You are on trial</h1>
        <p className="text-sm text-ink-400">Prosecuted by the {AGENCY_NAMES[t.agency]}. The world is paused until the verdict.</p>
      </div>
      <Courtroom className="w-full rounded-2xl border border-ink-700" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="panel panel-pad">
          <div className="panel-title">Charges</div>
          <ul className="space-y-1">
            {t.charges.map((c) => (
              <li key={c} className="rounded-lg bg-down/10 px-3 py-1.5 text-sm text-red-200">
                {c}
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-ink-900 p-3">
              <div className="stat-label">Evidence</div>
              <div className="font-mono text-2xl font-bold">{Math.round(t.evidence)}%</div>
            </div>
            <div className="rounded-xl bg-ink-900 p-3">
              <div className="stat-label">Conviction odds</div>
              <div className={`font-mono text-2xl font-bold ${p > 0.5 ? 'text-down' : 'text-up'}`}>{Math.round(p * 100)}%</div>
            </div>
          </div>
          <div className="mt-2 text-center text-xs text-ink-400">If convicted: ~{sentenceDays(t)} days + 10–30% of net worth</div>
        </div>

        <div className="panel panel-pad">
          <div className="panel-title">Defence</div>
          <div className="space-y-2">
            {LAWYERS.map((l) => (
              <button
                key={l.tier}
                disabled={l.tier < t.lawyerTier}
                onClick={() => setMsg(act((gs) => hireTrialLawyer(gs, l.tier)))}
                className={`w-full rounded-xl border p-3 text-left ${t.lawyerTier === l.tier ? 'border-gold-500 bg-gold-500/10' : 'border-ink-600 bg-ink-900 hover:border-ink-500'} disabled:opacity-40`}
              >
                <div className="flex justify-between">
                  <span className="font-semibold">{l.name}</span>
                  <span className="font-mono text-sm">{l.tier === 0 ? 'Free' : money(lawyerCost(g, l.tier))}</span>
                </div>
                <div className="text-xs text-ink-400">{l.blurb}</div>
              </button>
            ))}
            <button className="btn-crime w-full justify-between" disabled={t.judgeBribed} onClick={() => setMsg(act((gs, ev) => bribeJudge(gs, ev)))}>
              <span>{t.judgeBribed ? '🤝 Judge has been "persuaded"' : '💼 Slip the judge an envelope'}</span>
              {!t.judgeBribed && <span className="font-mono text-xs">{money(judgeBribeCost(g), { compact: true })}</span>}
            </button>
          </div>
        </div>
      </div>
      {msg && <div className="text-center text-sm text-down">{msg}</div>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          className="btn-ghost flex-col py-4"
          disabled={deliberating}
          onClick={() => {
            const v = act((gs, ev) => takePlea(gs, ev));
            if (v) setVerdict(v);
          }}
        >
          <span className="text-base">Take the plea deal</span>
          <span className="text-xs text-ink-400">Guaranteed: {plea} days + 15% of net worth</span>
        </button>
        <button
          className="btn-primary flex-col py-4"
          disabled={deliberating}
          onClick={() => {
            setDeliberating(true);
            window.setTimeout(() => {
              const v = act((gs, ev) => goToTrial(gs, ev));
              setDeliberating(false);
              if (v) setVerdict(v);
            }, 2200);
          }}
        >
          <span className="text-base">{deliberating ? 'The jury is deliberating…' : 'Go to trial'}</span>
          <span className="text-xs opacity-70">{Math.round((1 - p) * 100)}% chance to walk free</span>
        </button>
      </div>
    </div>
  );
}
