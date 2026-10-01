import { ITEM_BY_ID } from './data/shopItems';
import { MIN_PER_DAY } from './calendar';
import { isMarketOpen } from './calendar';
import type { GameEvent, GameState, OrderType, Side, Trade } from './types';

export const COMMISSION = 4.95;
export const HALF_SPREAD = 0.0005;
const TRADES_KEEP = 200;

export function holdingsValue(g: GameState): number {
  let v = 0;
  for (const [t, h] of Object.entries(g.holdings)) v += h.qty * g.stocks[t].price;
  return v;
}

export function shortExposure(g: GameState): number {
  let v = 0;
  for (const [t, h] of Object.entries(g.holdings)) if (h.qty < 0) v += -h.qty * g.stocks[t].price;
  return v;
}

export function itemValue(g: GameState, itemId: string, boughtFor: number, boughtAt: number): number {
  const item = ITEM_BY_ID[itemId];
  const years = Math.max(0, g.time - boughtAt) / (365 * MIN_PER_DAY);
  return boughtFor * Math.exp(item.appreciation * years);
}

export function assetsValue(g: GameState): number {
  return g.inventory.reduce((s, o) => s + itemValue(g, o.itemId, o.boughtFor, o.boughtAt), 0);
}

/** Liquid equity: cash + securities. */
export function equity(g: GameState): number {
  return g.player.cash + holdingsValue(g);
}

export function netWorth(g: GameState): number {
  return g.player.cash + g.player.offshore + holdingsValue(g) + assetsValue(g);
}

export function fillPrice(g: GameState, ticker: string, side: Side): number {
  const p = g.stocks[ticker].price;
  return side === 'buy' ? p * (1 + HALF_SPREAD) : p * (1 - HALF_SPREAD);
}

/** Returns an error message, or null if the trade is allowed. */
export function validateTrade(g: GameState, ticker: string, side: Side, qty: number): string | null {
  if (!Number.isInteger(qty) || qty <= 0) return 'Quantity must be a positive whole number.';
  if (!g.stocks[ticker]) return 'Unknown ticker.';
  const price = fillPrice(g, ticker, side);
  const held = g.holdings[ticker]?.qty ?? 0;
  if (side === 'buy') {
    if (g.player.cash < qty * price + COMMISSION) return 'Not enough cash.';
    return null;
  }
  const newShort = Math.max(0, qty - Math.max(0, held));
  if (newShort > 0) {
    const exposureAfter = shortExposure(g) + newShort * price;
    if (exposureAfter > 0.5 * Math.max(0, equity(g))) return 'Short limit: total shorts may not exceed 50% of your equity.';
  }
  return null;
}

/** Execute a fill at `price`. Assumes validation already happened. */
export function executeTrade(g: GameState, ticker: string, side: Side, qty: number, price: number, insider: boolean): Trade {
  const h = g.holdings[ticker] ?? { qty: 0, avgCost: 0 };
  let realized = 0;
  if (side === 'buy') {
    g.player.cash -= qty * price + COMMISSION;
    if (h.qty >= 0) {
      h.avgCost = (h.qty * h.avgCost + qty * price) / (h.qty + qty);
      h.qty += qty;
    } else {
      const cover = Math.min(qty, -h.qty);
      realized += (h.avgCost - price) * cover;
      h.qty += cover;
      const rest = qty - cover;
      if (rest > 0) {
        h.qty = rest;
        h.avgCost = price;
      }
    }
  } else {
    g.player.cash += qty * price - COMMISSION;
    if (h.qty > 0) {
      const sold = Math.min(qty, h.qty);
      realized += (price - h.avgCost) * sold;
      h.qty -= sold;
      const rest = qty - sold;
      if (rest > 0) {
        h.qty = -rest;
        h.avgCost = price;
      }
    } else {
      h.avgCost = (-h.qty * h.avgCost + qty * price) / (-h.qty + qty);
      h.qty -= qty;
    }
  }
  realized -= COMMISSION;
  if (h.qty === 0) delete g.holdings[ticker];
  else g.holdings[ticker] = h;

  g.tax.quarterGains += realized;
  g.stats.tradesMade += 1;
  g.idCounter += 1;
  const trade: Trade = { id: `t${g.idCounter}`, t: g.time, ticker, side, qty, price, realized, insider };
  g.trades.unshift(trade);
  if (g.trades.length > TRADES_KEEP) g.trades.length = TRADES_KEEP;
  return trade;
}

/** Insider trading: trading a ticker while holding an unreleased tip about it. */
function insiderCheck(g: GameState, ticker: string, notional: number, events: GameEvent[]): boolean {
  const tip = g.tips.find((x) => x.ticker === ticker && x.expiresAt > g.time);
  if (!tip) return false;
  const add = Math.min(30, 6 + notional / 15000);
  g.heat.sec = Math.min(100, g.heat.sec + add);
  if (g.investigation?.agency === 'sec') g.investigation.evidence = Math.min(100, g.investigation.evidence + add);
  events.push({ kind: 'crime', title: 'Unusual trading flagged', body: `Exchange surveillance noticed your ${ticker} trade ahead of news. SEC heat +${add.toFixed(0)}.`, toast: true });
  return true;
}

export function marketOrder(g: GameState, ticker: string, side: Side, qty: number, events: GameEvent[]): string | null {
  if (g.player.jailUntil !== null) return 'You are in jail. Your broker does not take calls from prison.';
  if (!isMarketOpen(g.time)) return 'Market is closed. Use a limit or stop order, or wait for the open.';
  const err = validateTrade(g, ticker, side, qty);
  if (err) return err;
  const price = fillPrice(g, ticker, side);
  const insider = insiderCheck(g, ticker, qty * price, events);
  executeTrade(g, ticker, side, qty, price, insider);
  return null;
}

export function placeOrder(g: GameState, ticker: string, side: Side, type: OrderType, qty: number, trigger: number): string | null {
  if (g.player.jailUntil !== null) return 'You are in jail.';
  if (type === 'market') return 'Use marketOrder for market orders.';
  if (!Number.isInteger(qty) || qty <= 0) return 'Quantity must be a positive whole number.';
  if (!(trigger > 0)) return 'Enter a valid trigger price.';
  if (g.orders.length >= 30) return 'Too many open orders.';
  g.idCounter += 1;
  g.orders.push({ id: `o${g.idCounter}`, ticker, side, type, qty, trigger, placedAt: g.time });
  return null;
}

export function cancelOrder(g: GameState, id: string): void {
  g.orders = g.orders.filter((o) => o.id !== id);
}

export function processOrders(g: GameState, events: GameEvent[]): void {
  if (!g.orders.length || !isMarketOpen(g.time)) return;
  const keep = [];
  for (const o of g.orders) {
    const p = g.stocks[o.ticker].price;
    const hit =
      o.type === 'limit' ? (o.side === 'buy' ? p <= o.trigger : p >= o.trigger) : o.side === 'buy' ? p >= o.trigger : p <= o.trigger;
    if (!hit) {
      keep.push(o);
      continue;
    }
    const err = validateTrade(g, o.ticker, o.side, o.qty);
    if (err) {
      events.push({ kind: 'bad', title: `Order cancelled: ${o.side.toUpperCase()} ${o.qty} ${o.ticker}`, body: err, toast: true });
      continue;
    }
    const price = fillPrice(g, o.ticker, o.side);
    const insider = insiderCheck(g, o.ticker, o.qty * price, events);
    executeTrade(g, o.ticker, o.side, o.qty, price, insider);
    events.push({ kind: 'good', title: `Order filled: ${o.side.toUpperCase()} ${o.qty} ${o.ticker}`, body: `${o.type} order filled at $${price.toFixed(2)}`, link: `/stock/${o.ticker}`, toast: true });
  }
  g.orders = keep;
}

/** Forced cover when shorts blow up. */
export function marginCheck(g: GameState, events: GameEvent[]): void {
  const exposure = shortExposure(g);
  if (exposure <= 0 || !isMarketOpen(g.time)) return;
  if (equity(g) >= 0.3 * exposure) return;
  for (const [ticker, h] of Object.entries(g.holdings)) {
    if (h.qty < 0) executeTrade(g, ticker, 'buy', -h.qty, fillPrice(g, ticker, 'buy'), false);
  }
  g.player.reputation = Math.max(0, g.player.reputation - 3);
  events.push({ kind: 'bad', title: 'MARGIN CALL', body: 'Your broker force-closed all short positions to cover losses.', link: '/portfolio', toast: true });
}

/** Sell long positions to cover a negative cash balance (after fines, upkeep...). */
export function coverNegativeCash(g: GameState, events: GameEvent[]): void {
  if (g.player.cash >= 0) return;
  for (const [ticker, h] of Object.entries(g.holdings)) {
    if (g.player.cash >= 0) break;
    if (h.qty <= 0) continue;
    const price = g.stocks[ticker].price;
    const need = Math.ceil((-g.player.cash + COMMISSION) / price);
    const qty = Math.min(h.qty, need);
    executeTrade(g, ticker, 'sell', qty, price, false);
    events.push({ kind: 'bad', title: 'Forced liquidation', body: `Sold ${qty} ${ticker} to cover your negative balance.`, toast: true });
  }
}
