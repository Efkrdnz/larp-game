import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime, formatDuration } from '../engine/calendar';
import { BRIBE_TARGETS, OFFSHORE_FEE, TRANSFER_FEE, bribeCost, bribeOfficial, buyInsiderTip, moveOffshore, openOffshore, tipCost } from '../engine/crime';
import { AGENCY_NAMES, bribeInvestigator, bribeInvestigatorCost, destroyEvidence, hireLawyer, lawyerRetainerCost } from '../engine/justice';
import type { Agency } from '../engine/types';
import { useGame, useGameState } from '../store/useGame';
import HeatMeter from '../ui/HeatMeter';
import { Silhouette } from '../ui/art/Scenes';
import { money } from '../ui/format';

export default function Underworld() {
  const g = useGameState();
  const act = useGame((s) => s.act);
  const [amount, setAmount] = useState('10000');
  const [msg, setMsg] = useState<string | null>(null);
  const run = (fn: Parameters<typeof act>[0]) => {
    const e = act(fn) as string | null;
    setMsg(e);
  };
  const inv = g.investigation;
  const tips = g.tips.filter((t) => t.expiresAt > g.time);

  return (
    <div className="-mx-3 -mt-4 min-h-screen bg-[radial-gradient(ellipse_at_top,#2a0b0e_0%,#0b0e14_60%)] px-3 pb-6 pt-4 sm:-mx-5 sm:px-5">
      <div className="mx-auto max-w-6xl space-y-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-red-100">The Underworld</h1>
          <p className="text-sm text-red-200/60">Where fortunes are made faster. And lost faster. Everything here raises heat — the attention of the authorities.</p>
        </div>

        {msg && <div className="rounded-xl border border-down/50 bg-down/10 px-4 py-2 text-sm text-red-200">{msg}</div>}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="panel panel-pad border-crime-500/30 bg-crime-900/60">
            <div className="panel-title text-red-200/80">Heat</div>
            <div className="space-y-4">
              {(Object.keys(g.heat) as Agency[]).map((a) => (
                <HeatMeter key={a} label={AGENCY_NAMES[a]} value={g.heat[a]} sub={g.heat[a] > 60 ? 'They are watching you closely.' : g.heat[a] > 30 ? 'You are on their radar.' : 'Clean. For now.'} />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-black/30 p-2">
                <div className="stat-label">Infamy</div>
                <div className="font-mono text-base text-red-300">{Math.round(g.player.infamy)}</div>
              </div>
              <div className="rounded-lg bg-black/30 p-2">
                <div className="stat-label">Bribes paid</div>
                <div className="font-mono text-base">{money(g.stats.bribesPaid, { compact: true })}</div>
              </div>
            </div>
            <p className="mt-3 text-[11px] text-ink-400">Heat cools a little every day. High heat triggers investigations. Infamy makes bribes land more often.</p>
          </div>

          <div className={`panel panel-pad lg:col-span-2 ${inv ? 'pulse-red border-crime-500/60' : 'border-crime-500/20'} bg-crime-900/40`}>
            <div className="panel-title text-red-200/80">Active investigation</div>
            {inv ? (
              <div>
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <div className="text-lg font-bold text-red-100">{AGENCY_NAMES[inv.agency]}</div>
                    <div className="text-xs text-red-200/70">Suspected: {inv.charges.join(', ')}</div>
                  </div>
                  <div className="text-right text-xs text-ink-300">Decision in {formatDuration(inv.endsAt - g.time)}</div>
                </div>
                <div className="mt-3">
                  <HeatMeter label="Evidence against you" value={inv.evidence} sub="Above ~35% at the deadline, charges get filed." />
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <button className="btn-crime flex-col py-3" onClick={() => run((gs, ev) => bribeInvestigator(gs, ev))}>
                    💰 Bribe investigator
                    <span className="font-mono text-xs opacity-70">{money(bribeInvestigatorCost(g))} · ~{Math.round((0.5 + g.player.infamy * 0.003) * 100)}%</span>
                  </button>
                  <button className="btn-ghost flex-col py-3" disabled={inv.lawyer} onClick={() => run((gs) => hireLawyer(gs))}>
                    👔 {inv.lawyer ? 'Lawyer retained' : 'Retain a lawyer'}
                    <span className="font-mono text-xs opacity-70">{inv.lawyer ? 'Evidence grows 50% slower' : money(lawyerRetainerCost(g))}</span>
                  </button>
                  <button className="btn-crime flex-col py-3" onClick={() => run((gs, ev) => destroyEvidence(gs, ev))}>
                    🗑️ Shred documents
                    <span className="text-xs opacity-70">60% works · 40% obstruction</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-ink-400">No one is investigating you. Yet.</div>
            )}
          </div>
        </div>

        <h2 className="pt-2 font-display text-lg font-bold text-red-100">Your contacts</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Contact name="“The Accountant”" role="Offshore banking, Azure Cay Islands" avatar={<Silhouette glasses color="#1e293b" className="h-16 w-16" />}>
            {g.player.hasOffshore ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-400">Offshore balance</span>
                  <span className="font-mono text-gold-400">{money(g.player.offshore)}</span>
                </div>
                <input className="input py-2 font-mono" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))} />
                <div className="grid grid-cols-2 gap-2">
                  <button className="btn-crime py-2" onClick={() => run((gs) => moveOffshore(gs, Number(amount), 'out'))}>
                    Hide it
                  </button>
                  <button className="btn-ghost py-2" onClick={() => run((gs) => moveOffshore(gs, Number(amount), 'in'))}>
                    Bring back
                  </button>
                </div>
                <p className="text-[11px] text-ink-400">{TRANSFER_FEE * 100}% fee each way. Offshore money is safe from most fines — unless you're convicted of tax evasion. Lets you hide tax bills.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-ink-300">“A shell company, a nominee director and a numbered account. Nobody needs to know.”</p>
                <button className="btn-crime w-full" onClick={() => run((gs) => openOffshore(gs))}>
                  Open account — {money(OFFSHORE_FEE)}
                </button>
              </div>
            )}
          </Contact>

          <Contact name="“Deep Throat”" role="Knows things before the news does" avatar={<Silhouette hat color="#27272a" className="h-16 w-16" />}>
            <p className="text-sm text-ink-300">“A board member owes me. For a fee, I'll tell you what hits the wires before it hits the wires.”</p>
            <button className="btn-crime mt-2 w-full" onClick={() => run((gs, ev) => buyInsiderTip(gs, ev))}>
              Buy a tip — {money(tipCost(g))}
            </button>
            <p className="mt-2 text-[11px] text-ink-400">Trading the tipped stock before the news drops is insider trading: SEC heat rises with the size of your trade.</p>
            {tips.length > 0 && (
              <ul className="mt-3 space-y-2">
                {tips.map((t) => (
                  <li key={t.newsId}>
                    <Link to={`/stock/${t.ticker}`} className="block rounded-lg border border-crime-500/30 bg-black/30 p-2 text-xs text-red-100 hover:border-crime-500/70">
                      <span className={t.up ? 'text-up' : 'text-down'}>{t.up ? '▲' : '▼'}</span> {t.hint}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Contact>

          <Contact name="“The Fixer”" role="Makes problems disappear" avatar={<Silhouette color="#3f1d1d" className="h-16 w-16" />}>
            <p className="text-sm text-ink-300">“Everyone has a price. Some of them are even wearing wires.”</p>
            <div className="mt-2 space-y-2">
              {(Object.keys(BRIBE_TARGETS) as Agency[]).map((a) => (
                <button key={a} className="btn-crime w-full justify-between py-2" onClick={() => run((gs, ev) => bribeOfficial(gs, a, ev))}>
                  <span>Pay off {BRIBE_TARGETS[a].who}</span>
                  <span className="font-mono text-xs opacity-80">{money(bribeCost(g, a), { compact: true })}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-ink-400">Cuts that agency's heat by 35. ~{Math.round(Math.max(0.04, 0.14 - g.player.infamy * 0.001) * 100)}% chance it's a sting.</p>
          </Contact>
        </div>

        <div className="panel panel-pad border-crime-500/20 bg-crime-900/30">
          <div className="panel-title text-red-200/80">Criminal record</div>
          {g.record.length ? (
            <ul className="max-h-72 space-y-1 overflow-y-auto text-sm">
              {g.record.map((r, i) => (
                <li key={i} className="flex justify-between gap-3 border-b border-ink-700/40 py-1.5 last:border-0">
                  <span className="text-red-100">{r.text}</span>
                  <span className="shrink-0 text-xs text-ink-400">{formatDateTime(r.t)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-ink-400">Spotless. How boring.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Contact({ name, role, avatar, children }: { name: string; role: string; avatar: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="panel panel-pad border-crime-500/20 bg-[#120b0d]">
      <div className="mb-3 flex items-center gap-3">
        {avatar}
        <div>
          <div className="font-display text-lg font-bold text-red-100">{name}</div>
          <div className="text-xs text-ink-400">{role}</div>
        </div>
      </div>
      {children}
    </div>
  );
}
