// Faceted search over the shop catalogue. State lives in the URL so filters survive navigation.
import { CATEGORY_FACETS, CATEGORY_LABELS, SHOP_ITEMS, type ShopCategory, type ShopItem } from '../engine/data/shopItems';

export interface ShopQuery {
  cat: ShopCategory;
  q: string;
  facets: Record<string, string[]>;
  min: number | null;
  max: number | null;
  sort: string;
  affordable: boolean;
  limit: number;
}

export const PAGE_SIZE = 24;
export const PRICE_STEPS = [0, 100, 1_000, 10_000, 25_000, 50_000, 100_000, 250_000, 500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000, 50_000_000, 100_000_000, 500_000_000, 1_000_000_000];

export const BASE_SORTS = [
  { key: 'price-asc', label: 'Price: low to high' },
  { key: 'price-desc', label: 'Price: high to low' },
  { key: 'name', label: 'Brand A–Z' },
  { key: 'rep', label: 'Most prestigious' },
];

const CATS = Object.keys(CATEGORY_LABELS) as ShopCategory[];

export function parseQuery(p: URLSearchParams): ShopQuery {
  const cat = (CATS.includes(p.get('cat') as ShopCategory) ? p.get('cat') : 'cars') as ShopCategory;
  const facets: Record<string, string[]> = {};
  for (const f of CATEGORY_FACETS[cat]) {
    const v = p.get(`f_${f.key}`);
    if (v) facets[f.key] = v.split('|').filter(Boolean);
  }
  const num = (k: string) => {
    const v = p.get(k);
    return v !== null && v !== '' && Number.isFinite(Number(v)) ? Number(v) : null;
  };
  return {
    cat,
    q: p.get('q') ?? '',
    facets,
    min: num('min'),
    max: num('max'),
    sort: p.get('sort') ?? 'price-asc',
    affordable: p.get('aff') === '1',
    limit: Math.max(PAGE_SIZE, num('n') ?? PAGE_SIZE),
  };
}

export function toParams(q: ShopQuery): URLSearchParams {
  const p = new URLSearchParams();
  p.set('cat', q.cat);
  if (q.q) p.set('q', q.q);
  for (const [k, vs] of Object.entries(q.facets)) if (vs.length) p.set(`f_${k}`, vs.join('|'));
  if (q.min !== null) p.set('min', String(q.min));
  if (q.max !== null) p.set('max', String(q.max));
  if (q.sort !== 'price-asc') p.set('sort', q.sort);
  if (q.affordable) p.set('aff', '1');
  if (q.limit > PAGE_SIZE) p.set('n', String(q.limit));
  return p;
}

export function itemsIn(cat: ShopCategory): ShopItem[] {
  return SHOP_ITEMS.filter((i) => i.category === cat);
}

function matches(i: ShopItem, q: ShopQuery, cash: number, skipFacet?: string): boolean {
  if (q.affordable && i.price > cash) return false;
  if (q.min !== null && i.price < q.min) return false;
  if (q.max !== null && i.price > q.max) return false;
  for (const [k, vs] of Object.entries(q.facets)) {
    if (k === skipFacet || !vs.length) continue;
    if (!vs.includes(i.facets[k])) return false;
  }
  if (q.q) {
    const hay = `${i.brand} ${i.model} ${Object.values(i.facets).join(' ')}`.toLowerCase();
    for (const word of q.q.toLowerCase().split(/\s+/).filter(Boolean)) if (!hay.includes(word)) return false;
  }
  return true;
}

export function runQuery(q: ShopQuery, cash: number): ShopItem[] {
  const out = itemsIn(q.cat).filter((i) => matches(i, q, cash));
  const [key, dir] = q.sort.split('-');
  const cmp: Record<string, (a: ShopItem, b: ShopItem) => number> = {
    price: (a, b) => (dir === 'desc' ? b.price - a.price : a.price - b.price),
    name: (a, b) => a.brand.localeCompare(b.brand) || a.price - b.price,
    rep: (a, b) => b.reputation - a.reputation || b.price - a.price,
  };
  out.sort(cmp[key] ?? ((a, b) => (b.stats[key] ?? 0) - (a.stats[key] ?? 0) || b.price - a.price));
  return out;
}

/** Value counts for each facet, applying every other active filter (standard faceted search). */
export function facetCounts(q: ShopQuery, cash: number): Record<string, [string, number][]> {
  const all = itemsIn(q.cat);
  const out: Record<string, [string, number][]> = {};
  for (const f of CATEGORY_FACETS[q.cat]) {
    const counts = new Map<string, number>();
    for (const i of all) {
      if (!matches(i, q, cash, f.key)) continue;
      const v = i.facets[f.key];
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    // Keep selected values visible even when they have no matches.
    for (const v of q.facets[f.key] ?? []) if (!counts.has(v)) counts.set(v, 0);
    out[f.key] = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }
  return out;
}

/** Headline groups for the brand strip: brand (or city for homes) with model count and starting price. */
export function featuredGroups(cat: ShopCategory): { key: string; facet: string; count: number; from: number; top: number }[] {
  const facet = cat === 'homes' ? 'city' : 'brand';
  const map = new Map<string, { count: number; from: number; top: number }>();
  for (const i of itemsIn(cat)) {
    const k = i.facets[facet];
    const e = map.get(k) ?? { count: 0, from: Infinity, top: 0 };
    e.count += 1;
    e.from = Math.min(e.from, i.price);
    e.top = Math.max(e.top, i.price);
    map.set(k, e);
  }
  return [...map.entries()].map(([key, e]) => ({ key, facet, ...e })).sort((a, b) => b.top - a.top);
}
