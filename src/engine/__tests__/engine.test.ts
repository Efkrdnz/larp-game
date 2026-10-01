import { describe, expect, it } from 'vitest';
import { COMPANIES } from '../data/companies';
import { MIN_PER_DAY, OPEN_MIN, isMarketOpen, nextOpen } from '../calendar';
import { advance, migrateGame, newGame } from '../game';
import { ITEM_BY_ID, LEGACY_ITEM_IDS, SHOP_ITEMS, CATEGORY_FACETS } from '../data/shopItems';
import { bribeGuard, goToTrial, takePlea } from '../justice';
import { publishNews } from '../news';
import { executeTrade, marketOrder, netWorth, placeOrder, validateTrade } from '../portfolio';
import { nextRandom } from '../rng';
import { buyItem, customiseItem, sellItem } from '../shop';
import { payTax } from '../tax';
import { blackjackReturn, handValue, roulettePayout, settleBlackjack } from '../casino';
import type { GameState } from '../types';

function openMarket(g: GameState) {
  const t = nextOpen(g.time);
  advance(g, t - g.time + 1);
  expect(isMarketOpen(g.time)).toBe(true);
}

describe('rng', () => {
  it('is deterministic for a given seed', () => {
    const a = { rng: 42 };
    const b = { rng: 42 };
    for (let i = 0; i < 100; i++) expect(nextRandom(a)).toBe(nextRandom(b));
  });

  it('two games with the same seed evolve identically', () => {
    const a = newGame('A', 7);
    const b = newGame('B', 7);
    advance(a, 3000);
    advance(b, 3000);
    expect(a.stocks.NOVA.price).toBe(b.stocks.NOVA.price);
    expect(a.news[0].headline).toBe(b.news[0].headline);
  });
});

describe('market', () => {
  it('starts with history at listed prices', () => {
    const g = newGame('T', 1);
    for (const c of COMPANIES) {
      expect(g.stocks[c.ticker].price).toBe(c.price);
      expect(g.stocks[c.ticker].daily.length).toBeGreaterThanOrEqual(250);
      expect(g.stocks[c.ticker].intraday.length).toBeGreaterThan(0);
    }
  });

  it('prices stay positive and finite over a long run', () => {
    const g = newGame('T', 2);
    advance(g, 30 * MIN_PER_DAY);
    for (const c of COMPANIES) {
      const p = g.stocks[c.ticker].price;
      expect(Number.isFinite(p)).toBe(true);
      expect(p).toBeGreaterThan(0);
      expect(p / c.price).toBeLessThan(10);
    }
  });

  it('news moves the affected stock in the right direction', () => {
    const g = newGame('T', 3);
    openMarket(g);
    const before = g.stocks.QBIT.price;
    publishNews(
      g,
      { id: 'x', t: g.time, headline: 'h', body: 'b', scope: 'company', tickers: ['QBIT'], sectors: [], impact: 0.2, moves: { QBIT: Math.log(1.2) }, rumor: false, category: 'Test', breaking: true },
      [],
    );
    expect(g.stocks.QBIT.price).toBeGreaterThan(before * 1.05);
    advance(g, 120);
    expect(g.stocks.QBIT.price).toBeGreaterThan(before * 1.08);
  });

  it('overnight news becomes an opening gap', () => {
    const g = newGame('T', 4);
    expect(isMarketOpen(g.time)).toBe(false);
    publishNews(
      g,
      { id: 'y', t: g.time, headline: 'h', body: 'b', scope: 'company', tickers: ['GSB'], sectors: [], impact: -0.3, moves: { GSB: Math.log(0.7) }, rumor: false, category: 'Test', breaking: true },
      [],
    );
    expect(g.stocks.GSB.pendingGap).toBeLessThan(-0.3);
    advance(g, OPEN_MIN - (g.time % MIN_PER_DAY) + 1);
    expect(g.stocks.GSB.price).toBeLessThan(389 * 0.8);
  });
});

describe('trading', () => {
  it('buy then sell realises P&L and charges commission', () => {
    const g = newGame('T', 5);
    executeTrade(g, 'FNB', 'buy', 10, 50, false);
    expect(g.holdings.FNB.qty).toBe(10);
    executeTrade(g, 'FNB', 'sell', 10, 60, false);
    expect(g.holdings.FNB).toBeUndefined();
    expect(g.player.cash).toBeCloseTo(10000 - 500 - 4.95 + 600 - 4.95, 6);
  });

  it('short selling and covering', () => {
    const g = newGame('T', 6);
    executeTrade(g, 'BUZZ', 'sell', 100, 20, false);
    expect(g.holdings.BUZZ.qty).toBe(-100);
    executeTrade(g, 'BUZZ', 'buy', 100, 15, false);
    expect(g.holdings.BUZZ).toBeUndefined();
    expect(g.trades[0].realized).toBeCloseTo(500 - 4.95, 6);
  });

  it('rejects trades without enough cash and when the market is closed', () => {
    const g = newGame('T', 7);
    expect(validateTrade(g, 'LUXE', 'buy', 1000)).toMatch(/cash/);
    expect(marketOrder(g, 'FNB', 'buy', 1, [])).toMatch(/closed/);
  });

  it('limit orders fill when price crosses', () => {
    const g = newGame('T', 8);
    placeOrder(g, 'FNB', 'buy', 'limit', 5, 10_000);
    openMarket(g);
    expect(g.holdings.FNB?.qty).toBe(5);
    expect(g.orders.length).toBe(0);
  });
});

describe('shop', () => {
  it('buy, customise and sell an item', () => {
    const g = newGame('T', 9);
    g.player.cash = 1_000_000;
    expect(buyItem(g, 'car-ferrari-roma')).toBeNull();
    const owned = g.inventory.find((o) => o.itemId === 'car-ferrari-roma')!;
    const cash = g.player.cash;
    expect(customiseItem(g, owned.uid, { ...owned.custom, rims: 'gold', spoiler: true })).toBeNull();
    expect(g.player.cash).toBeLessThan(cash);
    expect(owned.custom.rims).toBe('gold');
    expect(sellItem(g, owned.uid)).toBeNull();
    expect(g.inventory.some((o) => o.itemId === 'car-ferrari-roma')).toBe(false);
  });
});

describe('crime & justice', () => {
  it('high heat eventually leads to an investigation and a trial', () => {
    const g = newGame('T', 10);
    g.heat.tax = 100;
    for (let d = 0; d < 60 && !g.trial; d++) {
      g.heat.tax = 100;
      advance(g, MIN_PER_DAY);
    }
    expect(g.trial).not.toBeNull();
    expect(g.speed).toBe(0);
  });

  it('jail blocks trading and releases after the sentence', () => {
    const g = newGame('T', 11);
    g.trial = { agency: 'tax', charges: ['Tax evasion'], evidence: 80, lawyerTier: 0, judgeBribed: false };
    const v = takePlea(g, [])!;
    expect(v.guilty).toBe(true);
    expect(g.player.jailUntil).not.toBeNull();
    expect(marketOrder(g, 'FNB', 'buy', 1, [])).toMatch(/jail/);
    advance(g, v.days * MIN_PER_DAY + 1);
    expect(g.player.jailUntil).toBeNull();
  });

  it('trial verdicts resolve the trial', () => {
    const g = newGame('T', 12);
    g.trial = { agency: 'sec', charges: ['Insider trading'], evidence: 50, lawyerTier: 2, judgeBribed: true };
    const v = goToTrial(g, [])!;
    expect(g.trial).toBeNull();
    expect(typeof v.guilty).toBe('boolean');
  });

  it('bribing a guard costs money either way', () => {
    const g = newGame('T', 13);
    g.player.cash = 1_000_000;
    g.player.jailUntil = g.time + 30 * MIN_PER_DAY;
    bribeGuard(g, []);
    expect(g.player.cash).toBeLessThan(1_000_000);
  });

  it('tax evasion raises tax heat', () => {
    const g = newGame('T', 14);
    g.tax.bill = { quarter: 1, issuedAt: g.time, dueAt: g.time + 7 * MIN_PER_DAY, taxable: 100000, owed: 25000 };
    g.player.cash = 100000;
    expect(payTax(g, 'underreport')).toBeNull();
    expect(g.heat.tax).toBeGreaterThan(10);
    expect(g.tax.evadedTotal).toBe(12500);
  });
});

describe('casino', () => {
  it('roulette payouts', () => {
    expect(roulettePayout({ kind: 'straight', n: 17 }, 10, 17)).toBe(360);
    expect(roulettePayout({ kind: 'red' }, 10, 1)).toBe(20);
    expect(roulettePayout({ kind: 'red' }, 10, 0)).toBe(0);
    expect(roulettePayout({ kind: 'dozen', n: 3 }, 10, 36)).toBe(30);
    expect(roulettePayout({ kind: 'column', n: 1 }, 10, 34)).toBe(30);
  });

  it('blackjack hand values and settlement', () => {
    expect(handValue([{ rank: 1, suit: 0 }, { rank: 13, suit: 1 }]).total).toBe(21);
    expect(handValue([{ rank: 1, suit: 0 }, { rank: 1, suit: 1 }, { rank: 9, suit: 2 }]).total).toBe(21);
    const bj = settleBlackjack([{ rank: 1, suit: 0 }, { rank: 12, suit: 0 }], [{ rank: 10, suit: 0 }, { rank: 9, suit: 0 }]);
    expect(bj).toBe('blackjack');
    expect(blackjackReturn(bj, 100)).toBe(250);
  });
});

describe('net worth', () => {
  it('includes cash, securities and assets', () => {
    const g = newGame('T', 15);
    expect(netWorth(g)).toBeCloseTo(10000 + 6500, 0);
  });
});

describe('catalogue', () => {
  it('has hundreds of items with unique ids', () => {
    expect(SHOP_ITEMS.length).toBeGreaterThan(400);
    expect(new Set(SHOP_ITEMS.map((i) => i.id)).size).toBe(SHOP_ITEMS.length);
    for (const c of ['cars', 'watches', 'homes', 'luxury'] as const) expect(SHOP_ITEMS.filter((i) => i.category === c).length).toBeGreaterThan(30);
  });

  it('every item has sane numbers and all filter facets', () => {
    for (const i of SHOP_ITEMS) {
      expect(i.price).toBeGreaterThan(0);
      expect(Number.isFinite(i.upkeepPerDay)).toBe(true);
      for (const f of CATEGORY_FACETS[i.category]) expect(i.facets[f.key], `${i.id} ${f.key}`).toBeTruthy();
    }
  });

  it('legacy item ids all map to real items', () => {
    for (const [oldId, newId] of Object.entries(LEGACY_ITEM_IDS)) expect(ITEM_BY_ID[newId], oldId).toBeDefined();
  });

  it('migrates an old save inventory', () => {
    const g = newGame('T', 16);
    g.inventory = [
      { uid: 'a', itemId: 'car-kompakt', boughtFor: 6500, boughtAt: 0, custom: { paint: '#000000' } },
      { uid: 'b', itemId: 'watch-daytona', boughtFor: 52000, boughtAt: 0, custom: {} },
      { uid: 'c', itemId: 'does-not-exist', boughtFor: 1, boughtAt: 0, custom: {} },
    ];
    migrateGame(g);
    expect(g.inventory.map((o) => o.itemId)).toEqual(['car-volkswagen-golf-mk5-2008-used', 'watch-rolex-daytona-everose-gold']);
    expect(g.inventory[0].custom.paint).toBe('#000000');
    expect(g.inventory[0].custom.rims).toBe('stock');
  });
});

describe('catalogue numbers', () => {
  it('homes have positive bedrooms and areas', () => {
    for (const i of SHOP_ITEMS.filter((x) => x.category === 'homes')) {
      expect(i.stats.size, i.id).toBeGreaterThan(0);
      expect(Number(i.specs[0][1]), i.id).toBeGreaterThan(0);
      expect(i.summary, i.id).not.toMatch(/-\d/);
    }
  });
});
