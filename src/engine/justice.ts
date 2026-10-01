import { MIN_PER_DAY, formatDate } from './calendar';
import { playerHeadline } from './news';
import { assetsValue, coverNegativeCash, holdingsValue, netWorth } from './portfolio';
import { chance, int, range } from './rng';
import type { Agency, GameEvent, GameState, Trial } from './types';

export const AGENCY_NAMES: Record<Agency, string> = {
  tax: 'Revenue Service',
  sec: 'Securities Commission',
  police: 'Federal Police',
};

const CHARGES: Record<Agency, string[]> = {
  tax: ['Tax evasion', 'Filing a false return'],
  sec: ['Insider trading', 'Securities fraud'],
  police: ['Bribery of a public official', 'Corruption'],
};

export const LAWYERS = [
  { tier: 0 as const, name: 'Public defender', blurb: 'Overworked. Has 140 other cases. Free.', base: 0, pct: 0 },
  { tier: 1 as const, name: 'Hartley & Associates', blurb: 'Solid firm, good suits, decent odds.', base: 50000, pct: 0.01 },
  { tier: 2 as const, name: 'Saul Goodmore, Esq.', blurb: '"Better call Saul-oodmore." Gets guilty people off. Often.', base: 400000, pct: 0.03 },
];

export const addHeat = (g: GameState, a: Agency, amount: number) => {
  g.heat[a] = Math.max(0, Math.min(100, g.heat[a] + amount));
};

export const isJailed = (g: GameState) => g.player.jailUntil !== null;

export function addRecord(g: GameState, text: string) {
  g.record.unshift({ t: g.time, text });
}

const nwScale = (g: GameState) => Math.max(0, netWorth(g));

// ---------------- Daily checks ----------------

export function dailyJustice(g: GameState, events: GameEvent[]): void {
  for (const a of Object.keys(g.heat) as Agency[]) g.heat[a] = Math.max(0, g.heat[a] * 0.985 - 0.6);

  const inv = g.investigation;
  if (inv) {
    const growth = (g.heat[inv.agency] * 0.08 + range(g, 0, 3)) * (inv.lawyer ? 0.5 : 1);
    inv.evidence = Math.min(100, inv.evidence + growth);
    if (g.time >= inv.endsAt) {
      if (inv.evidence >= 35) {
        startTrial(g, inv.agency, inv.charges, inv.evidence, events);
      } else {
        events.push({ kind: 'good', title: 'Investigation closed', body: `The ${AGENCY_NAMES[inv.agency]} closed its case for lack of evidence.`, toast: true });
        g.heat[inv.agency] *= 0.5;
      }
      g.investigation = null;
    }
    return;
  }
  if (g.trial || isJailed(g)) return;

  for (const a of Object.keys(g.heat) as Agency[]) {
    const p = (g.heat[a] / 100) ** 2 * 0.3;
    if (chance(g, p)) {
      g.investigation = {
        agency: a,
        openedAt: g.time,
        endsAt: g.time + int(g, 5, 10) * MIN_PER_DAY,
        evidence: g.heat[a] * 0.45,
        lawyer: false,
        charges: [CHARGES[a][0]],
      };
      events.push({ kind: 'crime', title: `${AGENCY_NAMES[a]} opened an investigation`, body: 'Agents are looking into your affairs. Lay low, lawyer up, or make it go away…', link: '/underworld', toast: true });
      addRecord(g, `${AGENCY_NAMES[a]} opened an investigation`);
      return;
    }
  }
}

// ---------------- Investigation actions ----------------

export function bribeInvestigatorCost(g: GameState) {
  return Math.round(20000 + nwScale(g) * 0.02);
}

export function bribeInvestigator(g: GameState, events: GameEvent[]): string | null {
  const inv = g.investigation;
  if (!inv) return 'No active investigation.';
  const cost = bribeInvestigatorCost(g);
  if (g.player.cash < cost) return 'Not enough cash for the envelope.';
  g.player.cash -= cost;
  g.stats.bribesPaid += cost;
  if (chance(g, 0.5 + g.player.infamy * 0.003)) {
    events.push({ kind: 'crime', title: 'Case closed', body: 'The lead investigator suddenly found "no wrongdoing". Funny how that works.', toast: true });
    addRecord(g, `Bribed a ${AGENCY_NAMES[inv.agency]} investigator ($${cost.toLocaleString()})`);
    g.heat[inv.agency] = Math.max(0, g.heat[inv.agency] - 40);
    g.player.infamy = Math.min(100, g.player.infamy + 4);
    g.investigation = null;
  } else {
    inv.evidence = Math.min(100, inv.evidence + 30);
    if (!inv.charges.includes('Bribery of a public official')) inv.charges.push('Bribery of a public official');
    addHeat(g, 'police', 25);
    events.push({ kind: 'bad', title: 'Bribe refused!', body: 'The investigator was wearing a wire. Bribery added to your charges.', toast: true });
    addRecord(g, 'Attempted to bribe an investigator (on tape)');
  }
  return null;
}

export function lawyerRetainerCost(g: GameState) {
  return Math.round(15000 + nwScale(g) * 0.005);
}

export function hireLawyer(g: GameState): string | null {
  const inv = g.investigation;
  if (!inv) return 'No active investigation.';
  if (inv.lawyer) return 'You already have counsel.';
  const cost = lawyerRetainerCost(g);
  if (g.player.cash < cost) return 'Not enough cash for the retainer.';
  g.player.cash -= cost;
  inv.lawyer = true;
  inv.evidence = Math.max(0, inv.evidence - 10);
  return null;
}

export function destroyEvidence(g: GameState, events: GameEvent[]): string | null {
  const inv = g.investigation;
  if (!inv) return 'No active investigation.';
  if (chance(g, 0.6)) {
    inv.evidence = Math.max(0, inv.evidence - 25);
    events.push({ kind: 'crime', title: 'Shredder go brrr', body: 'Boxes of documents quietly disappeared.', toast: true });
  } else {
    inv.evidence = Math.min(100, inv.evidence + 20);
    if (!inv.charges.includes('Obstruction of justice')) inv.charges.push('Obstruction of justice');
    events.push({ kind: 'bad', title: 'Caught shredding', body: 'Agents raided your office mid-shred. Obstruction of justice added.', toast: true });
  }
  return null;
}

// ---------------- Trial ----------------

function startTrial(g: GameState, agency: Agency, charges: string[], evidence: number, events: GameEvent[]) {
  g.trial = { agency, charges: [...charges], evidence, lawyerTier: 0, judgeBribed: false };
  g.speed = 0;
  addRecord(g, `Arrested and charged with ${charges.join(', ')}`);
  playerHeadline(g, `Tycoon ${g.player.name} arrested on ${charges[0].toLowerCase()} charges`, `Agents of the ${AGENCY_NAMES[agency]} led ${g.player.name} out in handcuffs on ${formatDate(g.time)}.`, 'Crime');
  g.player.reputation = Math.max(0, g.player.reputation - 10);
  events.push({ kind: 'crime', title: 'YOU ARE UNDER ARREST', body: `Charged with ${charges.join(', ')}. Time to face the judge.`, link: '/court', toast: true });
}

export function lawyerCost(g: GameState, tier: 0 | 1 | 2) {
  const l = LAWYERS[tier];
  return Math.round(l.base + nwScale(g) * l.pct);
}

export function judgeBribeCost(g: GameState) {
  return Math.round(100000 + nwScale(g) * 0.05);
}

export function convictionChance(t: Trial): number {
  const p = t.evidence / 100 + 0.25 - t.lawyerTier * 0.18 - (t.judgeBribed ? 0.45 : 0) + (t.charges.length - 1) * 0.05;
  return Math.max(0.03, Math.min(0.97, p));
}

export function sentenceDays(t: Trial): number {
  const base = { tax: 30, sec: 45, police: 20 }[t.agency];
  return Math.round(base * (0.5 + t.evidence / 100) + 10 * (t.charges.length - 1));
}

export function hireTrialLawyer(g: GameState, tier: 0 | 1 | 2): string | null {
  const t = g.trial;
  if (!t) return 'No trial.';
  if (tier <= t.lawyerTier) return null;
  const cost = lawyerCost(g, tier);
  if (g.player.cash < cost) return 'Not enough cash for that lawyer.';
  g.player.cash -= cost;
  t.lawyerTier = tier;
  return null;
}

export function bribeJudge(g: GameState, events: GameEvent[]): string | null {
  const t = g.trial;
  if (!t) return 'No trial.';
  if (t.judgeBribed) return 'The judge is already "persuaded".';
  const cost = judgeBribeCost(g);
  if (g.player.cash < cost) return 'Not enough cash.';
  g.player.cash -= cost;
  g.stats.bribesPaid += cost;
  if (chance(g, 0.5 + g.player.infamy * 0.004)) {
    t.judgeBribed = true;
    events.push({ kind: 'crime', title: 'The judge winked', body: 'Your "campaign donation" was gratefully received.', toast: true });
  } else {
    t.evidence = Math.min(100, t.evidence + 25);
    t.charges.push('Bribing a judge');
    events.push({ kind: 'bad', title: 'The judge reported you', body: 'Bribing a judge has been added to your charges. Bold move.', toast: true });
  }
  return null;
}

export interface Verdict {
  guilty: boolean;
  days: number;
  fine: number;
  seizedOffshore: number;
  plea: boolean;
}

function sentence(g: GameState, t: Trial, days: number, finePct: number, plea: boolean): Verdict {
  const fine = Math.round(Math.max(5000, nwScale(g) * finePct));
  g.player.cash -= fine;
  let seized = 0;
  if (t.agency === 'tax' && g.player.offshore > 0) {
    seized = g.player.offshore;
    g.player.offshore = 0;
    g.player.hasOffshore = false;
  }
  g.player.jailUntil = g.time + days * MIN_PER_DAY;
  g.player.jailTerms += 1;
  g.player.reputation = Math.max(0, g.player.reputation - 25);
  g.player.infamy = Math.min(100, g.player.infamy + 15);
  if (g.player.salary > 0) {
    g.player.salary = 0;
    g.player.job = 'Unemployed (fired)';
  }
  for (const a of Object.keys(g.heat) as Agency[]) g.heat[a] *= 0.3;
  g.orders = [];
  addRecord(g, `${plea ? 'Pleaded guilty' : 'Convicted'}: ${t.charges.join(', ')}. ${days} days, $${fine.toLocaleString()} fine`);
  playerHeadline(g, `${g.player.name} sentenced to ${days} days behind bars`, `${plea ? 'In a plea deal, ' : ''}${g.player.name} was ordered to pay $${fine.toLocaleString()} for ${t.charges.join(', ').toLowerCase()}.`, 'Crime');
  g.trial = null;
  return { guilty: true, days, fine, seizedOffshore: seized, plea };
}

export function takePlea(g: GameState, events: GameEvent[]): Verdict | null {
  const t = g.trial;
  if (!t) return null;
  const v = sentence(g, t, Math.max(5, Math.round(sentenceDays(t) * 0.6)), 0.15, true);
  coverNegativeCash(g, events);
  return v;
}

export function goToTrial(g: GameState, events: GameEvent[]): Verdict | null {
  const t = g.trial;
  if (!t) return null;
  if (chance(g, convictionChance(t))) {
    const v = sentence(g, t, sentenceDays(t), range(g, 0.1, 0.3), false);
    coverNegativeCash(g, events);
    return v;
  }
  for (const a of Object.keys(g.heat) as Agency[]) g.heat[a] *= 0.5;
  g.player.reputation = Math.max(0, g.player.reputation - 5);
  g.player.infamy = Math.min(100, g.player.infamy + 8);
  addRecord(g, `Acquitted of ${t.charges.join(', ')}`);
  playerHeadline(g, `${g.player.name} walks free after shock acquittal`, `Jurors found ${g.player.name} not guilty on all counts. Prosecutors are "reviewing options".`, 'Crime');
  g.trial = null;
  return { guilty: false, days: 0, fine: 0, seizedOffshore: 0, plea: false };
}

// ---------------- Jail ----------------

export function releaseIfDue(g: GameState, events: GameEvent[]): void {
  if (g.player.jailUntil !== null && g.time >= g.player.jailUntil) {
    g.player.jailUntil = null;
    addRecord(g, 'Released from prison');
    events.push({ kind: 'good', title: 'You are free!', body: 'You walk out of the gates with a plastic bag of belongings and a burning desire for revenge on the market.', link: '/', toast: true });
  }
}

export function jailBribeGuardCost(g: GameState) {
  return Math.round(50000 + nwScale(g) * 0.02);
}

export function bribeGuard(g: GameState, events: GameEvent[]): string | null {
  if (g.player.jailUntil === null) return 'You are not in jail.';
  const cost = jailBribeGuardCost(g);
  if (g.player.cash < cost) return 'Not enough cash (and the guard does not take IOUs).';
  g.player.cash -= cost;
  g.stats.bribesPaid += cost;
  if (chance(g, 0.35 + g.player.infamy * 0.002)) {
    g.player.jailUntil = g.time;
    addRecord(g, 'Released early after "paperwork error"');
    events.push({ kind: 'crime', title: 'Paperwork error!', body: 'A clerical "mistake" sets you free early.', toast: true });
    releaseIfDue(g, events);
  } else {
    g.player.jailUntil += 10 * MIN_PER_DAY;
    events.push({ kind: 'bad', title: 'Snitched on', body: 'The guard took the money and reported you. +10 days.', toast: true });
  }
  return null;
}

export const APPEAL_COST = 80000;

export function fileAppeal(g: GameState, events: GameEvent[]): string | null {
  if (g.player.jailUntil === null) return 'You are not in jail.';
  if (g.player.cash < APPEAL_COST) return 'Appeals lawyers cost $80,000.';
  g.player.cash -= APPEAL_COST;
  if (chance(g, 0.3)) {
    const left = g.player.jailUntil - g.time;
    g.player.jailUntil = g.time + Math.round(left * 0.3);
    events.push({ kind: 'good', title: 'Appeal granted', body: 'Your sentence was cut by 70%.', toast: true });
  } else {
    events.push({ kind: 'bad', title: 'Appeal denied', body: 'The appeals court was not impressed.', toast: true });
  }
  return null;
}

export function prisonWork(g: GameState): number {
  const pay = 35;
  g.player.cash += pay;
  return pay;
}

export function wealthBreakdown(g: GameState) {
  return { cash: g.player.cash, offshore: g.player.offshore, securities: holdingsValue(g), assets: assetsValue(g) };
}
