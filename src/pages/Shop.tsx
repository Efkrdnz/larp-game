import { memo, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CATEGORY_FACETS, CATEGORY_LABELS, CATEGORY_SORTS, type ShopCategory, type ShopItem } from '../engine/data/shopItems';
import { minuteOfDay } from '../engine/calendar';
import { useGameState } from '../store/useGame';
import ItemArt, { artBackdrop } from '../ui/art/ItemArt';
import { money } from '../ui/format';
import { IconX } from '../ui/icons';
import { BASE_SORTS, PAGE_SIZE, PRICE_STEPS, facetCounts, featuredGroups, itemsIn, parseQuery, runQuery, toParams, type ShopQuery } from '../ui/shopQuery';

const CATS = Object.keys(CATEGORY_LABELS) as ShopCategory[];
const CAT_COUNTS = Object.fromEntries(CATS.map((c) => [c, itemsIn(c).length])) as Record<ShopCategory, number>;
const CAT_ICONS: Record<ShopCategory, string> = { cars: '🏎️', watches: '⌚', homes: '🏛️', luxury: '🛥️' };

export default function Shop() {
  const g = useGameState();
  const [params, setParams] = useSearchParams();
  const q = parseQuery(params);
  const [sheet, setSheet] = useState(false);
  const cash = g.player.cash;
  const paramKey = params.toString();

  const update = (patch: Partial<ShopQuery>) => {
    const next = { ...q, ...patch };
    if (!('limit' in patch)) next.limit = PAGE_SIZE;
    setParams(toParams(next), { replace: true });
  };
  const setCat = (cat: ShopCategory) => setParams(toParams({ cat, q: '', facets: {}, min: null, max: null, sort: 'price-asc', affordable: q.affordable, limit: PAGE_SIZE }), { replace: true });
  const toggleFacet = (key: string, value: string) => {
    const cur = q.facets[key] ?? [];
    update({ facets: { ...q.facets, [key]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] } });
  };

  const cashKey = q.affordable ? Math.floor(cash) : 0;
  const results = useMemo(() => runQuery(q, cash), [paramKey, cashKey]);
  const counts = useMemo(() => facetCounts(q, cash), [paramKey, cashKey]);
  const groups = useMemo(() => featuredGroups(q.cat), [q.cat]);
  const owned = useMemo(() => new Set(g.inventory.map((o) => o.itemId)), [g.inventory.length]);
  const hour = Math.floor(minuteOfDay(g.time) / 60);
  const groupFacet = q.cat === 'homes' ? 'city' : 'brand';
  const activeCount = Object.values(q.facets).reduce((s, v) => s + v.length, 0) + (q.min !== null ? 1 : 0) + (q.max !== null ? 1 : 0) + (q.affordable ? 1 : 0);

  const panel = <FilterPanel q={q} counts={counts} update={update} toggleFacet={toggleFacet} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold">Luxury Mall</h1>
          <p className="text-sm text-ink-400">
            {Object.values(CAT_COUNTS).reduce((a, b) => a + b, 0)} items from the world’s top brands. Customise anything after you buy it.
          </p>
        </div>
      </div>

      <div className="scrollbar-none -mx-3 flex gap-2 overflow-x-auto px-3 sm:mx-0 sm:px-0">
        {CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`flex items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold ${q.cat === c ? 'border-gold-500 bg-gold-500/10 text-gold-400' : 'border-ink-700 bg-ink-850 text-ink-300'}`}>
            <span>{CAT_ICONS[c]}</span>
            {CATEGORY_LABELS[c]}
            <span className="rounded-full bg-ink-700 px-1.5 text-[10px] text-ink-300">{CAT_COUNTS[c]}</span>
          </button>
        ))}
      </div>

      {/* Brand / city strip */}
      <div className="scrollbar-none -mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:px-0">
        {groups.map((b) => {
          const active = (q.facets[groupFacet] ?? []).includes(b.key);
          return (
            <button
              key={b.key}
              onClick={() => toggleFacet(groupFacet, b.key)}
              className={`min-w-[132px] shrink-0 rounded-xl border px-3 py-2 text-left transition ${active ? 'border-gold-500 bg-gold-500/10' : 'border-ink-700 bg-ink-850 hover:border-ink-500'}`}
            >
              <div className={`truncate font-display text-sm font-bold uppercase tracking-wider ${active ? 'text-gold-400' : 'text-ink-100'}`}>{b.key}</div>
              <div className="text-[11px] text-ink-400">
                {b.count} {b.count === 1 ? 'item' : 'items'} · from {money(b.from, { compact: true })}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="panel panel-pad sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">{panel}</div>
        </aside>

        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <input className="input max-w-xs flex-1 py-2" placeholder={`Search ${CATEGORY_LABELS[q.cat].toLowerCase()}…`} value={q.q} onChange={(e) => update({ q: e.target.value })} />
            <button className="btn-ghost py-2 lg:hidden" onClick={() => setSheet(true)}>
              Filters{activeCount ? ` (${activeCount})` : ''}
            </button>
            <select className="input w-auto py-2 text-sm" value={q.sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort">
              {[...BASE_SORTS, ...CATEGORY_SORTS[q.cat]].map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <span className="ml-auto text-sm text-ink-400">
              <b className="text-ink-100">{results.length}</b> results
            </span>
          </div>

          <ActiveChips q={q} update={update} toggleFacet={toggleFacet} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {results.slice(0, q.limit).map((item) => (
              <ShopCard key={item.id} item={item} owned={owned.has(item.id)} canAfford={cash >= item.price} hour={hour} />
            ))}
          </div>
          {!results.length && (
            <div className="panel panel-pad py-14 text-center text-ink-400">
              Nothing matches those filters.{' '}
              <button className="text-gold-400" onClick={() => setCat(q.cat)}>
                Clear filters
              </button>
            </div>
          )}
          {results.length > q.limit && (
            <button className="btn-ghost w-full" onClick={() => update({ limit: q.limit + PAGE_SIZE })}>
              Show more ({results.length - q.limit} left)
            </button>
          )}
        </div>
      </div>

      {sheet && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setSheet(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="pb-safe absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-3xl border-t border-ink-600 bg-ink-850" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-ink-700 px-4 py-3">
              <span className="font-display font-bold">Filters</span>
              <button className="rounded-full p-2 hover:bg-ink-700" onClick={() => setSheet(false)} aria-label="Close filters">
                <IconX />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{panel}</div>
            <div className="border-t border-ink-700 p-3">
              <button className="btn-primary w-full" onClick={() => setSheet(false)}>
                Show {results.length} results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPanel({ q, counts, update, toggleFacet }: { q: ShopQuery; counts: Record<string, [string, number][]>; update: (p: Partial<ShopQuery>) => void; toggleFacet: (k: string, v: string) => void }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [brandSearch, setBrandSearch] = useState('');
  const steps = PRICE_STEPS;
  return (
    <div className="space-y-5 text-sm">
      <div>
        <div className="label">Price</div>
        <div className="grid grid-cols-2 gap-2">
          <select className="input py-2 text-sm" value={q.min ?? ''} onChange={(e) => update({ min: e.target.value === '' ? null : Number(e.target.value) })} aria-label="Minimum price">
            <option value="">No min</option>
            {steps.slice(1).map((s) => (
              <option key={s} value={s}>
                {money(s, { compact: true })}
              </option>
            ))}
          </select>
          <select className="input py-2 text-sm" value={q.max ?? ''} onChange={(e) => update({ max: e.target.value === '' ? null : Number(e.target.value) })} aria-label="Maximum price">
            <option value="">No max</option>
            {steps.slice(1).map((s) => (
              <option key={s} value={s}>
                {money(s, { compact: true })}
              </option>
            ))}
          </select>
        </div>
        <label className="mt-2 flex items-center gap-2 text-ink-300">
          <input type="checkbox" className="accent-yellow-500" checked={q.affordable} onChange={(e) => update({ affordable: e.target.checked })} />
          Only what I can afford
        </label>
      </div>

      {CATEGORY_FACETS[q.cat].map((f) => {
        let values = counts[f.key] ?? [];
        const searchable = values.length > 12;
        if (searchable && brandSearch && f.key === (q.cat === 'homes' ? 'city' : 'brand')) values = values.filter(([v]) => v.toLowerCase().includes(brandSearch.toLowerCase()));
        const open = expanded[f.key];
        const shown = open ? values : values.slice(0, 8);
        const selected = q.facets[f.key] ?? [];
        return (
          <div key={f.key}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="label mb-0">{f.label}</span>
              {selected.length > 0 && (
                <button className="text-[11px] text-gold-400" onClick={() => update({ facets: { ...q.facets, [f.key]: [] } })}>
                  Clear
                </button>
              )}
            </div>
            {searchable && f.key === (q.cat === 'homes' ? 'city' : 'brand') && (
              <input className="input mb-2 py-1.5 text-xs" placeholder={`Find ${f.label.toLowerCase()}…`} value={brandSearch} onChange={(e) => setBrandSearch(e.target.value)} />
            )}
            <ul className="space-y-0.5">
              {shown.map(([v, n]) => (
                <li key={v}>
                  <label className={`flex cursor-pointer items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-ink-800 ${n === 0 && !selected.includes(v) ? 'opacity-40' : ''}`}>
                    <input type="checkbox" className="accent-yellow-500" checked={selected.includes(v)} onChange={() => toggleFacet(f.key, v)} />
                    <span className="min-w-0 flex-1 truncate text-ink-200">{v}</span>
                    <span className="text-[11px] text-ink-400">{n}</span>
                  </label>
                </li>
              ))}
            </ul>
            {values.length > 8 && (
              <button className="mt-1 text-xs text-gold-400" onClick={() => setExpanded((e) => ({ ...e, [f.key]: !open }))}>
                {open ? 'Show less' : `Show all ${values.length}`}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ActiveChips({ q, update, toggleFacet }: { q: ShopQuery; update: (p: Partial<ShopQuery>) => void; toggleFacet: (k: string, v: string) => void }) {
  const chips: { label: string; clear: () => void }[] = [];
  for (const [k, vs] of Object.entries(q.facets)) for (const v of vs) chips.push({ label: v, clear: () => toggleFacet(k, v) });
  if (q.min !== null) chips.push({ label: `≥ ${money(q.min, { compact: true })}`, clear: () => update({ min: null }) });
  if (q.max !== null) chips.push({ label: `≤ ${money(q.max, { compact: true })}`, clear: () => update({ max: null }) });
  if (q.affordable) chips.push({ label: 'Affordable', clear: () => update({ affordable: false }) });
  if (q.q) chips.push({ label: `“${q.q}”`, clear: () => update({ q: '' }) });
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((c) => (
        <button key={c.label} onClick={c.clear} className="chip chip-active">
          {c.label}
          <IconX width={12} height={12} />
        </button>
      ))}
      <button className="ml-1 text-xs text-ink-400 hover:text-ink-100" onClick={() => update({ facets: {}, min: null, max: null, affordable: false, q: '' })}>
        Clear all
      </button>
    </div>
  );
}

const ShopCard = memo(function ShopCard({ item, owned, canAfford, hour }: { item: ShopItem; owned: boolean; canAfford: boolean; hour: number }) {
  const isWatch = item.art.kind === 'watch';
  return (
    <Link to={`/shop/${item.id}`} className="panel group overflow-hidden transition hover:border-gold-500/50">
      <div className={`relative ${artBackdrop(item)} ${isWatch ? 'flex h-52 justify-center py-3' : ''}`}>
        <ItemArt item={item} minuteOfDay={isWatch ? 610 : hour * 60} className={isWatch ? 'h-full w-auto' : 'h-auto w-full'} />
        {owned && <span className="absolute left-3 top-3 rounded-full bg-up px-2 py-0.5 text-[10px] font-bold uppercase text-ink-950">Owned</span>}
        <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-ink-200 backdrop-blur">{item.facets.body ?? item.facets.style ?? item.facets.type}</span>
      </div>
      <div className="p-4">
        <div className="truncate text-[11px] font-semibold uppercase tracking-widest text-ink-400">{item.brand}</div>
        <div className="truncate font-display text-lg font-bold leading-tight group-hover:text-gold-400">{item.model}</div>
        <div className="mt-1 truncate text-xs text-ink-400">{item.summary}</div>
        <div className="mt-3 flex items-center justify-between">
          <span className={`font-mono text-lg font-bold ${canAfford ? 'text-gold-400' : 'text-ink-300'}`}>{money(item.price)}</span>
          <span className="text-xs text-ink-400">+{item.reputation} rep</span>
        </div>
      </div>
    </Link>
  );
});
