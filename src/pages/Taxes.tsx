import { useState } from 'react';
import { formatDuration, QUARTER_DAYS, MIN_PER_DAY, quarterOf } from '../engine/calendar';
import { TAX_RATE, payTax, type TaxChoice } from '../engine/tax';
import { useGame, useGameState } from '../store/useGame';
import { money } from '../ui/format';

export default function Taxes() {
  const g = useGameState();
  const act = useGame((s) => s.act);
  const [msg, setMsg] = useState<string | null>(null);
  const bill = g.tax.bill;
  const accrued = Math.max(0, g.tax.quarterGains) + Math.max(0, g.tax.quarterGambling) + g.tax.quarterSalary;
  const nextQuarterAt = (quarterOf(g.time) + 1) * QUARTER_DAYS * MIN_PER_DAY;

  const choose = (c: TaxChoice) => setMsg(act((gs) => payTax(gs, c)) ?? 'Done. The paperwork has been filed… one way or another.');

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="font-display text-2xl font-bold">Revenue Service</h1>
        <p className="text-sm text-ink-400">Flat {TAX_RATE * 100}% on trading gains, gambling winnings and wages. Bills arrive every quarter (91 days).</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {[
          ['Trading gains', g.tax.quarterGains],
          ['Gambling', g.tax.quarterGambling],
          ['Wages', g.tax.quarterSalary],
          ['Estimated tax', accrued * TAX_RATE],
        ].map(([l, v]) => (
          <div key={l as string} className="panel p-4">
            <div className="stat-label">{l}</div>
            <div className="stat-value">{money(v as number)}</div>
          </div>
        ))}
      </div>
      <div className="text-xs text-ink-400">Quarter closes in {formatDuration(nextQuarterAt - g.time)}. Lifetime taxes evaded: {money(g.tax.evadedTotal)}.</div>

      {bill ? (
        <div className="overflow-hidden rounded-2xl border border-stone-300 bg-[#faf7f0] text-stone-900 shadow-xl">
          <div className="flex items-center justify-between border-b-2 border-stone-800 px-5 py-3">
            <div className="font-serif text-xl font-black">FORM 1040-Q</div>
            <div className="text-right text-xs">
              Quarter {bill.quarter}
              <br />
              Due in <b>{formatDuration(bill.dueAt - g.time)}</b>
            </div>
          </div>
          <div className="space-y-1 px-5 py-4 font-mono text-sm">
            <div className="flex justify-between">
              <span>Taxable income</span>
              <span>{money(bill.taxable)}</span>
            </div>
            <div className="flex justify-between">
              <span>Rate</span>
              <span>{TAX_RATE * 100}%</span>
            </div>
            <div className="flex justify-between border-t border-stone-400 pt-1 text-base font-bold">
              <span>Amount owed</span>
              <span>{money(bill.owed)}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 bg-stone-100 p-4 sm:grid-cols-3">
            <button className="rounded-xl bg-stone-900 px-3 py-3 text-left text-sm text-white hover:bg-stone-700" onClick={() => choose('full')}>
              <div className="font-bold">Pay in full</div>
              <div className="font-mono text-xs opacity-80">{money(bill.owed)}</div>
              <div className="mt-1 text-[11px] opacity-70">Honest. Lowers tax heat.</div>
            </button>
            <button className="rounded-xl border-2 border-amber-600 bg-amber-50 px-3 py-3 text-left text-sm hover:bg-amber-100" onClick={() => choose('underreport')}>
              <div className="font-bold text-amber-800">"Forget" some income</div>
              <div className="font-mono text-xs">{money(bill.owed * 0.5)}</div>
              <div className="mt-1 text-[11px] text-amber-900/80">Saves 50%. Tax heat rises.</div>
            </button>
            <button className="rounded-xl border-2 border-red-700 bg-red-50 px-3 py-3 text-left text-sm hover:bg-red-100 disabled:opacity-40" disabled={!g.player.hasOffshore} onClick={() => choose('offshore')}>
              <div className="font-bold text-red-800">Route via offshore shell</div>
              <div className="font-mono text-xs">{money(bill.owed * 0.1)}</div>
              <div className="mt-1 text-[11px] text-red-900/80">{g.player.hasOffshore ? 'Saves 90%. Lots of heat.' : 'Needs an offshore account.'}</div>
            </button>
          </div>
          <div className="px-5 pb-3 pt-2 text-[11px] text-stone-500">Ignoring the bill: the full amount plus a 25% penalty is garnished at the deadline.</div>
        </div>
      ) : (
        <div className="panel panel-pad text-center text-ink-400">No bill outstanding. Enjoy it while it lasts.</div>
      )}
      {msg && <div className="text-center text-sm text-gold-400">{msg}</div>}
    </div>
  );
}
