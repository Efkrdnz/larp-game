import { CUSTOM_OPTIONS, ITEM_BY_ID, defaultCustom, tierMultiplier, type CustomOption } from './data/shopItems';
import { isJailed } from './justice';
import { playerHeadline } from './news';
import { itemValue } from './portfolio';
import type { GameState, OwnedItem } from './types';

export const SELL_HAIRCUT = 0.05;
export const RENT_PER_DAY = 45;

export function optionCost(opt: CustomOption, value: string | number | boolean, price: number): number {
  const mult = tierMultiplier(price);
  if (opt.type === 'choice') return Math.round((opt.choices?.find((c) => c.value === value)?.cost ?? 0) * mult);
  return Math.round((opt.cost ?? 0) * mult);
}

/** Cost of changing `from` into `to` (only changed options are charged). */
export function customisationCost(itemId: string, from: OwnedItem['custom'], to: OwnedItem['custom']): number {
  const item = ITEM_BY_ID[itemId];
  let total = 0;
  for (const opt of CUSTOM_OPTIONS[item.art.kind]) {
    const a = from[opt.key];
    const b = to[opt.key];
    if (a === b) continue;
    if (opt.type === 'toggle' && !b) continue; // removing is free
    if (opt.type === 'text' && !b) continue;
    total += optionCost(opt, b, item.price);
  }
  return total;
}

export function buyItem(g: GameState, itemId: string, custom?: OwnedItem['custom']): string | null {
  if (isJailed(g)) return 'Prison commissary only sells ramen.';
  const item = ITEM_BY_ID[itemId];
  if (!item) return 'Unknown item.';
  const base = defaultCustom(item);
  const finalCustom = { ...base, ...(custom ?? {}) };
  const total = item.price + customisationCost(itemId, base, finalCustom);
  if (g.player.cash < total) return `You need $${Math.ceil(total).toLocaleString()} in cash.`;
  g.player.cash -= total;
  g.idCounter += 1;
  g.inventory.push({ uid: `i${g.idCounter}`, itemId, boughtFor: item.price, boughtAt: g.time, custom: finalCustom });
  g.player.reputation = Math.min(100, g.player.reputation + item.reputation);
  if (item.price >= 5_000_000) {
    playerHeadline(g, `${g.player.name} splashes out on a $${(item.price / 1e6).toFixed(1)}M ${item.model}`, `Sources close to ${g.player.name} confirm the purchase of a ${item.brand} ${item.model}. Critics call it "obscene"; fans call it "goals".`, 'Lifestyle');
  }
  return null;
}

export function customiseItem(g: GameState, uid: string, to: OwnedItem['custom']): string | null {
  if (isJailed(g)) return 'You are in jail.';
  const owned = g.inventory.find((o) => o.uid === uid);
  if (!owned) return 'Item not found.';
  const cost = customisationCost(owned.itemId, owned.custom, to);
  if (g.player.cash < cost) return `Mods cost $${cost.toLocaleString()}.`;
  g.player.cash -= cost;
  owned.custom = { ...owned.custom, ...to };
  if (cost > 0) g.player.reputation = Math.min(100, g.player.reputation + 0.5);
  return null;
}

export function saleValue(g: GameState, o: OwnedItem): number {
  return Math.round(itemValue(g, o.itemId, o.boughtFor, o.boughtAt) * (1 - SELL_HAIRCUT));
}

export function sellItem(g: GameState, uid: string): string | null {
  if (isJailed(g)) return 'You are in jail.';
  const idx = g.inventory.findIndex((o) => o.uid === uid);
  if (idx < 0) return 'Item not found.';
  const o = g.inventory[idx];
  g.player.cash += saleValue(g, o);
  g.player.reputation = Math.max(0, g.player.reputation - ITEM_BY_ID[o.itemId].reputation / 2);
  g.inventory.splice(idx, 1);
  return null;
}

export function hasResidence(g: GameState): boolean {
  return g.inventory.some((o) => ITEM_BY_ID[o.itemId].residence);
}

export function dailyUpkeep(g: GameState): number {
  let total = g.inventory.reduce((s, o) => s + ITEM_BY_ID[o.itemId].upkeepPerDay, 0);
  if (!hasResidence(g) && !isJailed(g)) total += RENT_PER_DAY;
  return total;
}
