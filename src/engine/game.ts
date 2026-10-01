import { MIN_PER_DAY, OPEN_MIN, isWeekday, minuteOfDay, nextOpen } from './calendar';
import { dailyJustice, isJailed, releaseIfDue } from './justice';
import { indexAtIntraday, indexValue, initStocks, stepMarketMinute } from './market';
import { releaseDueNews, scheduleNews } from './news';
import { coverNegativeCash, marginCheck, netWorth, processOrders } from './portfolio';
import { RIVALS, updateRivals } from './rivals';
import { dailyUpkeep } from './shop';
import { checkTaxDeadline, quarterlyTax } from './tax';
import type { GameEvent, GameState, InboxMessage } from './types';

export const SAVE_VERSION = 1;
export const START_CASH = 10000;
export const SALARY = 220;
const HISTORY_KEEP = 24 * 90;
const INBOX_KEEP = 80;

export function newGame(name: string, seed = (Math.random() * 2 ** 31) | 0): GameState {
  const g: GameState = {
    version: SAVE_VERSION,
    seed,
    rng: seed,
    time: 8 * 60, // Monday 08:00, an hour and a half before the opening bell
    speed: 1,
    lastSavedReal: Date.now(),
    idCounter: 0,
    player: {
      name: name.trim() || 'Anonymous Tycoon',
      cash: START_CASH,
      offshore: 0,
      hasOffshore: false,
      reputation: 5,
      infamy: 0,
      jailUntil: null,
      jailTerms: 0,
      salary: SALARY,
      job: 'Junior Analyst at Goldstein Brothers',
    },
    stocks: {},
    holdings: {},
    orders: [],
    trades: [],
    news: [],
    scheduled: [],
    inventory: [],
    heat: { tax: 0, sec: 0, police: 0 },
    investigation: null,
    trial: null,
    record: [],
    tips: [],
    tax: { quarterGains: 0, quarterGambling: 0, quarterSalary: 0, evadedTotal: 0, bill: null, lastQuarter: 0 },
    netWorthHistory: [],
    indexHistory: [],
    rivals: RIVALS.map((r) => ({ ...r })),
    inbox: [],
    stats: { casinoWagered: 0, casinoNet: 0, bribesPaid: 0, tradesMade: 0 },
  };
  g.stocks = initStocks(g);
  g.inventory.push({ uid: 'i0', itemId: 'car-kompakt', boughtFor: 6500, boughtAt: g.time, custom: { paint: '#9ca3af', rims: 'stock', wrap: 'none', tint: 'none', spoiler: false, lowered: false, plate: '' } });
  // A few days of back-news so the feed is not empty.
  g.time -= 2 * MIN_PER_DAY;
  scheduleNews(g);
  g.news = g.scheduled.filter((n) => n.t <= g.time + 2 * MIN_PER_DAY).reverse();
  g.scheduled = g.scheduled.filter((n) => n.t > g.time + 2 * MIN_PER_DAY);
  g.time += 2 * MIN_PER_DAY;
  scheduleNews(g);
  // Seed the hourly index history from the pre-game intraday bars.
  g.stocks.NOVA.intraday.forEach((b, i) => {
    if ((b.t + 5) % 60 === 0) g.indexHistory.push({ t: b.t + 5, v: indexAtIntraday(g.stocks, i) });
  });
  g.netWorthHistory.push({ t: g.time - 60, v: netWorth(g) });
  g.netWorthHistory.push({ t: g.time, v: netWorth(g) });
  g.indexHistory.push({ t: g.time, v: indexValue(g.stocks) });
  g.inbox.push({
    id: 'welcome',
    t: g.time,
    kind: 'info',
    title: 'Welcome to CAPITAL',
    body: `You have $${START_CASH.toLocaleString()}, a rusty hatchback and a junior job at Goldstein Brothers. The market opens at 09:30. Make it count.`,
  });
  return g;
}

function onNewDay(g: GameState, events: GameEvent[]) {
  const upkeep = dailyUpkeep(g);
  g.player.cash -= upkeep;
  coverNegativeCash(g, events);
  if (g.player.cash < -1000 && g.inventory.length) {
    // Repossess the most expensive asset.
    const worst = [...g.inventory].sort((a, b) => b.boughtFor - a.boughtFor)[0];
    g.inventory = g.inventory.filter((o) => o !== worst);
    g.player.cash += worst.boughtFor * 0.6;
    events.push({ kind: 'bad', title: 'Repossessed!', body: 'The bank took one of your assets to cover your debts.', link: '/garage', toast: true });
  }
  dailyJustice(g, events);
  quarterlyTax(g, events);
  const idx = indexValue(g.stocks);
  const prev = g.indexHistory.length ? g.indexHistory[Math.max(0, g.indexHistory.length - 25)].v : idx;
  updateRivals(g, Math.log(idx / prev));
}

/** Run the simulation forward `minutes` game minutes. Mutates `g`, returns notable events. */
export function advance(g: GameState, minutes: number): GameEvent[] {
  const events: GameEvent[] = [];
  for (let i = 0; i < minutes; i++) {
    if (g.trial) break; // the world waits for your court date
    g.time += 1;
    const t = g.time;
    stepMarketMinute(g, t);
    releaseDueNews(g, events);
    processOrders(g, events);
    if (t % 15 === 0) marginCheck(g, events);
    const mod = minuteOfDay(t);
    if (mod === 0) onNewDay(g, events);
    if (mod === 17 * 60 && isWeekday(t) && g.player.salary > 0 && !isJailed(g)) {
      g.player.cash += g.player.salary;
      g.tax.quarterSalary += g.player.salary;
    }
    if (t % 60 === 0) {
      g.netWorthHistory.push({ t, v: netWorth(g) });
      g.indexHistory.push({ t, v: indexValue(g.stocks) });
      if (g.netWorthHistory.length > HISTORY_KEEP) g.netWorthHistory.splice(0, g.netWorthHistory.length - HISTORY_KEEP);
      if (g.indexHistory.length > HISTORY_KEEP) g.indexHistory.splice(0, g.indexHistory.length - HISTORY_KEEP);
      scheduleNews(g);
      checkTaxDeadline(g, events);
    }
    releaseIfDue(g, events);
  }
  for (const e of events) pushInbox(g, e);
  return events;
}

export function pushInbox(g: GameState, e: GameEvent) {
  g.idCounter += 1;
  const msg: InboxMessage = { id: `m${g.idCounter}`, t: g.time, kind: e.kind, title: e.title, body: e.body, link: e.link };
  g.inbox.unshift(msg);
  if (g.inbox.length > INBOX_KEEP) g.inbox.length = INBOX_KEEP;
}

/** Minutes until the next opening bell (0 if open). */
export function minutesToOpen(g: GameState): number {
  const m = minuteOfDay(g.time);
  if (isWeekday(g.time) && m >= OPEN_MIN && m < 16 * 60) return 0;
  return nextOpen(g.time) - g.time;
}

export const GIG_MINUTES = 240;
export const GIG_PAY = 160;

/** Do a delivery-app gig: costs 4 game hours, pays a little. */
export function workGig(g: GameState): GameEvent[] {
  const events = advance(g, GIG_MINUTES);
  if (!g.trial && !isJailed(g)) {
    g.player.cash += GIG_PAY;
    g.tax.quarterSalary += GIG_PAY;
  }
  return events;
}

export function recordGamble(g: GameState, wagered: number, returned: number) {
  g.stats.casinoWagered += wagered;
  g.stats.casinoNet += returned - wagered;
  g.tax.quarterGambling += returned - wagered;
}

/** Catch up on time that passed while the tab was closed (at 1x speed, capped). */
export function offlineMinutes(g: GameState, nowMs = Date.now()): number {
  const elapsedSec = Math.max(0, (nowMs - g.lastSavedReal) / 1000);
  return Math.min(8 * MIN_PER_DAY, Math.floor(elapsedSec));
}
