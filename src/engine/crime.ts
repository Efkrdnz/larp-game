import { COMPANY_BY_TICKER } from './data/companies';
import { MIN_PER_DAY, formatDateTime } from './calendar';
import { AGENCY_NAMES, addHeat, addRecord, isJailed } from './justice';
import { netWorth } from './portfolio';
import { chance, pick } from './rng';
import type { Agency, GameEvent, GameState } from './types';

const nw = (g: GameState) => Math.max(0, netWorth(g));

export const OFFSHORE_FEE = 25000;
export const TRANSFER_FEE = 0.03;

export function openOffshore(g: GameState): string | null {
  if (isJailed(g)) return 'You are in jail.';
  if (g.player.hasOffshore) return 'You already have an account in the Azure Cay Islands.';
  if (g.player.cash < OFFSHORE_FEE) return `Opening a shell company costs $${OFFSHORE_FEE.toLocaleString()}.`;
  g.player.cash -= OFFSHORE_FEE;
  g.player.hasOffshore = true;
  g.player.infamy = Math.min(100, g.player.infamy + 5);
  addHeat(g, 'tax', 5);
  addRecord(g, 'Opened an anonymous offshore account');
  return null;
}

export function moveOffshore(g: GameState, amount: number, direction: 'out' | 'in'): string | null {
  if (isJailed(g)) return 'You are in jail.';
  if (!g.player.hasOffshore) return 'Open an offshore account first.';
  if (!(amount > 0)) return 'Enter an amount.';
  if (direction === 'out') {
    if (g.player.cash < amount) return 'Not enough cash.';
    g.player.cash -= amount;
    g.player.offshore += amount * (1 - TRANSFER_FEE);
    addHeat(g, 'tax', Math.min(20, amount / 20000));
  } else {
    if (g.player.offshore < amount) return 'Not enough offshore funds.';
    g.player.offshore -= amount;
    g.player.cash += amount * (1 - TRANSFER_FEE);
    addHeat(g, 'tax', Math.min(15, amount / 25000));
  }
  return null;
}

export const BRIBE_TARGETS: Record<Agency, { who: string; mult: number }> = {
  tax: { who: 'a tax inspector', mult: 1.5 },
  sec: { who: 'a market regulator', mult: 2 },
  police: { who: 'a police captain', mult: 1 },
};

export function bribeCost(g: GameState, a: Agency) {
  return Math.round((5000 + nw(g) * 0.01) * BRIBE_TARGETS[a].mult);
}

export function bribeOfficial(g: GameState, a: Agency, events: GameEvent[]): string | null {
  if (isJailed(g)) return 'You are in jail.';
  const cost = bribeCost(g, a);
  if (g.player.cash < cost) return 'Not enough cash for the envelope.';
  g.player.cash -= cost;
  g.stats.bribesPaid += cost;
  const sting = chance(g, Math.max(0.04, 0.14 - g.player.infamy * 0.001));
  if (sting) {
    addHeat(g, 'police', 30);
    if (g.investigation) g.investigation.evidence = Math.min(100, g.investigation.evidence + 20);
    addRecord(g, `Caught on camera bribing ${BRIBE_TARGETS[a].who}`);
    events.push({ kind: 'bad', title: 'It was a sting!', body: `${BRIBE_TARGETS[a].who[0].toUpperCase()}${BRIBE_TARGETS[a].who.slice(1)} was an undercover agent. Police heat +30.`, toast: true });
  } else {
    addHeat(g, a, -35);
    g.player.infamy = Math.min(100, g.player.infamy + 3);
    events.push({ kind: 'crime', title: 'Envelope delivered', body: `${AGENCY_NAMES[a]} heat -35. Nobody saw anything.`, toast: true });
  }
  return null;
}

export function tipCost(g: GameState) {
  return Math.round(2500 + nw(g) * 0.005);
}

const DIRECTION_HINTS_UP = ['is about to explode upward', 'has very good news coming', 'will rip higher', 'is going to make some people very rich'];
const DIRECTION_HINTS_DOWN = ['is about to fall off a cliff', 'has very bad news coming', 'is going to get crushed', 'is a ticking time bomb'];

export function buyInsiderTip(g: GameState, events: GameEvent[]): string | null {
  if (isJailed(g)) return 'You are in jail.';
  const cost = tipCost(g);
  if (g.player.cash < cost) return 'Not enough cash.';
  const tipped = new Set(g.tips.map((t) => t.newsId));
  const candidates = g.scheduled.filter(
    (n) => n.scope === 'company' && !tipped.has(n.id) && n.t > g.time + 60 && n.t < g.time + 3 * MIN_PER_DAY && Math.abs(n.impact) >= 0.03,
  );
  if (!candidates.length) return 'Your contact has nothing right now. Try again later.';
  g.player.cash -= cost;
  const item = pick(g, candidates);
  const ticker = item.tickers[0];
  const company = COMPANY_BY_TICKER[ticker];
  const hint = `${company.name} (${ticker}) ${pick(g, item.impact > 0 ? DIRECTION_HINTS_UP : DIRECTION_HINTS_DOWN)}. News drops before ${formatDateTime(item.t)}.`;
  g.tips.push({ newsId: item.id, ticker, hint, boughtAt: g.time, expiresAt: item.t, up: item.impact > 0 });
  g.player.infamy = Math.min(100, g.player.infamy + 2);
  addHeat(g, 'sec', 3);
  events.push({ kind: 'crime', title: 'Psst… got a tip for you', body: hint, link: `/stock/${ticker}`, toast: true });
  return null;
}
