import { COMPANIES, COMPANY_BY_TICKER } from './data/companies';
import { SECTORS, SECTOR_IDS } from './data/sectors';
import { CLOSE_MIN, MIN_PER_DAY, OPEN_MIN, dayIndex, isMarketOpen, minuteOfDay, weekday } from './calendar';
import { normal, nextRandom, range, type RngHolder } from './rng';
import type { Bar, GameState, SectorId, StockState } from './types';

export const MINUTES_PER_YEAR = 252 * 390;
const KAPPA = Math.LN2 / (5 * 390); // deviations from fair value halve every ~5 trading days
const DRIFT_RELEASE = 0.06; // fraction of pending news drift applied per minute
const FAIR_GROWTH = 0.09 / MINUTES_PER_YEAR;
const INTRADAY_KEEP = 78 * 5; // five trading days of 5-minute bars
const DAILY_KEEP = 400;
export const INDEX_BASE = 5000;

const TOTAL_CAP = COMPANIES.reduce((s, c) => s + c.price * c.shares, 0);

/** Cap-weighted "CAP 500" index of all listed companies. */
export function indexValue(stocks: Record<string, StockState>): number {
  let cap = 0;
  for (const c of COMPANIES) cap += stocks[c.ticker].price * c.shares;
  return (cap / TOTAL_CAP) * INDEX_BASE;
}

/** Index value at intraday bar `i` (all stocks share the same intraday timeline). */
export function indexAtIntraday(stocks: Record<string, StockState>, i: number): number {
  let cap = 0;
  for (const c of COMPANIES) cap += stocks[c.ticker].intraday[i].c * c.shares;
  return (cap / TOTAL_CAP) * INDEX_BASE;
}

function factorDraws(h: RngHolder) {
  const zm = normal(h);
  const zs = {} as Record<SectorId, number>;
  for (const s of SECTOR_IDS) zs[s] = normal(h);
  return { zm, zs };
}

function shockFor(h: RngHolder, ticker: string, zm: number, zs: Record<SectorId, number>): number {
  const c = COMPANY_BY_TICKER[ticker];
  const beta = SECTORS[c.sector].beta;
  const z = 0.36 * beta * zm + 0.4 * zs[c.sector] + 0.83 * normal(h);
  return (c.vol / Math.sqrt(MINUTES_PER_YEAR)) * z;
}

function baseVolume(ticker: string): number {
  return (COMPANY_BY_TICKER[ticker].shares * 1e6 * 0.004) / 390;
}

function touchBar(bars: Bar[], t: number, open: number, price: number, vol: number, keep: number) {
  const last = bars[bars.length - 1];
  if (last && last.t === t) {
    last.h = Math.max(last.h, price);
    last.l = Math.min(last.l, price);
    last.c = price;
    last.v += vol;
  } else {
    bars.push({ t, o: open, h: Math.max(open, price), l: Math.min(open, price), c: price, v: vol });
    if (bars.length > keep) bars.splice(0, bars.length - keep);
  }
}

/**
 * Build the starting market with ~250 trading days of history so charts are
 * full on day one. The path is simulated at 5-minute resolution and then
 * rescaled so the final close equals the company's listed starting price.
 */
export function initStocks(h: RngHolder): Record<string, StockState> {
  const days: number[] = [];
  for (let d = -1; days.length < 250; d--) {
    if (((d % 7) + 7) % 7 < 5) days.unshift(d);
  }
  const stepsPerDay = 78;
  const dtScale = Math.sqrt(5); // a 5-minute step has sqrt(5) minute-vols
  const raw: Record<string, { daily: Bar[]; intraday: Bar[]; p: number }> = {};
  for (const c of COMPANIES) raw[c.ticker] = { daily: [], intraday: [], p: 100 };

  days.forEach((d, di) => {
    const keepIntraday = di >= days.length - 3;
    const gap = factorDraws(h);
    for (const c of COMPANIES) {
      const r = raw[c.ticker];
      r.p *= Math.exp(shockFor(h, c.ticker, gap.zm, gap.zs) * 4); // overnight gap
      if (nextRandom(h) < 0.012) r.p *= Math.exp(range(h, -0.12, 0.12)); // old news jump
      r.daily.push({ t: d * MIN_PER_DAY + OPEN_MIN, o: r.p, h: r.p, l: r.p, c: r.p, v: 0 });
    }
    for (let s = 0; s < stepsPerDay; s++) {
      const f = factorDraws(h);
      const t = d * MIN_PER_DAY + OPEN_MIN + s * 5;
      for (const c of COMPANIES) {
        const r = raw[c.ticker];
        const o = r.p;
        const ret = shockFor(h, c.ticker, f.zm, f.zs) * dtScale + FAIR_GROWTH * 5;
        r.p = Math.max(0.5, r.p * Math.exp(ret));
        const v = baseVolume(c.ticker) * 5 * (1 + 30 * Math.abs(ret)) * range(h, 0.6, 1.4);
        const wig = Math.abs(normal(h)) * (c.vol / Math.sqrt(MINUTES_PER_YEAR)) * o;
        const bar = r.daily[r.daily.length - 1];
        const hi = Math.max(o, r.p) + wig;
        const lo = Math.min(o, r.p) - wig;
        bar.h = Math.max(bar.h, hi);
        bar.l = Math.min(bar.l, lo);
        bar.c = r.p;
        bar.v += v;
        if (keepIntraday) r.intraday.push({ t, o, h: hi, l: lo, c: r.p, v });
      }
    }
  });

  const stocks: Record<string, StockState> = {};
  for (const c of COMPANIES) {
    const r = raw[c.ticker];
    const k = c.price / r.p;
    const scale = (b: Bar): Bar => ({ t: b.t, o: b.o * k, h: b.h * k, l: b.l * k, c: b.c * k, v: Math.round(b.v) });
    const daily = r.daily.map(scale);
    const price = c.price;
    stocks[c.ticker] = {
      ticker: c.ticker,
      price,
      fair: Math.log(price),
      prevClose: price,
      dayOpen: price,
      intraday: r.intraday.map(scale),
      daily,
      pendingGap: 0,
      drift: 0,
    };
  }
  return stocks;
}

/** Advance every stock by one market minute. `t` is the minute being simulated. */
export function stepMarketMinute(g: GameState, t: number): void {
  if (!isMarketOpen(t)) return;
  const mod = minuteOfDay(t);
  const isOpen = mod === OPEN_MIN;
  const barT = t - (t % 5);
  const dayBarT = dayIndex(t) * MIN_PER_DAY + OPEN_MIN;
  const { zm, zs } = factorDraws(g);

  for (const c of COMPANIES) {
    const s = g.stocks[c.ticker];
    if (isOpen) {
      // Opening auction: apply overnight news as a gap.
      s.prevClose = s.daily.length ? s.daily[s.daily.length - 1].c : s.price;
      s.price = Math.max(0.5, s.price * Math.exp(s.pendingGap));
      s.pendingGap = 0;
      s.dayOpen = s.price;
      s.daily.push({ t: dayBarT, o: s.price, h: s.price, l: s.price, c: s.price, v: 0 });
      if (s.daily.length > DAILY_KEEP) s.daily.splice(0, s.daily.length - DAILY_KEEP);
    }
    const before = s.price;
    const shock = shockFor(g, c.ticker, zm, zs);
    const sigmaM = c.vol / Math.sqrt(MINUTES_PER_YEAR);
    const step = s.drift * DRIFT_RELEASE;
    s.drift -= step;
    s.fair += shock + FAIR_GROWTH;
    let lp = Math.log(before) + shock + step + 0.3 * sigmaM * normal(g);
    lp += KAPPA * (s.fair - lp);
    s.price = Math.max(0.5, Math.exp(lp));
    const ret = Math.log(s.price / before);
    const vol = Math.round(baseVolume(c.ticker) * (1 + 40 * Math.abs(ret)) * range(g, 0.5, 1.5));
    touchBar(s.intraday, barT, before, s.price, vol, INTRADAY_KEEP);
    touchBar(s.daily, dayBarT, s.dayOpen, s.price, vol, DAILY_KEEP);
  }
}

/** Apply a log-return move (from news) to a stock. Real news also moves fair value. */
export function applyMove(g: GameState, ticker: string, move: number, permanent: boolean): void {
  const s = g.stocks[ticker];
  if (!s) return;
  if (permanent) s.fair += move;
  if (isMarketOpen(g.time)) {
    const jump = move * 0.45;
    const before = s.price;
    s.price = Math.max(0.5, s.price * Math.exp(jump));
    s.drift += move - jump;
    const barT = g.time - (g.time % 5);
    touchBar(s.intraday, barT, before, s.price, 0, INTRADAY_KEEP);
    const db = s.daily[s.daily.length - 1];
    if (db) {
      db.h = Math.max(db.h, s.price);
      db.l = Math.min(db.l, s.price);
      db.c = s.price;
    }
  } else {
    s.pendingGap += move;
  }
}

export function dayChange(s: StockState): number {
  return s.prevClose ? s.price / s.prevClose - 1 : 0;
}

/** Bars of the current (or most recent) session, for sparklines. */
export function sessionBars(s: StockState): Bar[] {
  const last = s.intraday[s.intraday.length - 1];
  if (!last) return [];
  const day = dayIndex(last.t);
  return s.intraday.filter((b) => dayIndex(b.t) === day);
}

export function marketStatus(t: number): 'open' | 'pre' | 'closed' | 'weekend' {
  if (weekday(t) >= 5) return 'weekend';
  const m = minuteOfDay(t);
  if (m >= OPEN_MIN && m < CLOSE_MIN) return 'open';
  if (m < OPEN_MIN) return 'pre';
  return 'closed';
}
