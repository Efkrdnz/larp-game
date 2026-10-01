import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORY_LABELS, SHOP_ITEMS, type ShopCategory } from '../engine/data/shopItems';
import { minuteOfDay } from '../engine/calendar';
import { useGameState } from '../store/useGame';
import ItemArt, { artBackdrop } from '../ui/art/ItemArt';
import { money } from '../ui/format';

const CATS = Object.keys(CATEGORY_LABELS) as ShopCategory[];

export default function Shop() {
  const g = useGameState();
  const [cat, setCat] = useState<ShopCategory>('cars');
  const [affordable, setAffordable] = useState(false);
  const owned = new Set(g.inventory.map((o) => o.itemId));
  const items = SHOP_ITEMS.filter((i) => i.category === cat && (!affordable || i.price <= g.player.cash)).sort((a, b) => a.price - b.price);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold">Luxury Mall</h1>
          <p className="text-sm text-ink-400">Everything money can buy. Customise after purchase in My Stuff.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-300">
          <input type="checkbox" className="accent-yellow-500" checked={affordable} onChange={(e) => setAffordable(e.target.checked)} />
          Only what I can afford
        </label>
      </div>

      <div className="scrollbar-none flex gap-2 overflow-x-auto">
        {CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold ${cat === c ? 'border-gold-500 bg-gold-500/10 text-gold-400' : 'border-ink-700 bg-ink-850 text-ink-300'}`}>
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const can = g.player.cash >= item.price;
          return (
            <Link key={item.id} to={`/shop/${item.id}`} className="panel group overflow-hidden transition hover:border-gold-500/50">
              <div className={`relative ${artBackdrop(item)} ${item.art.kind === 'watch' ? 'flex h-56 justify-center py-3' : ''}`}>
                <ItemArt item={item} minuteOfDay={minuteOfDay(g.time)} className={item.art.kind === 'watch' ? 'h-full w-auto' : 'h-auto w-full'} />
                {owned.has(item.id) && <span className="absolute left-3 top-3 rounded-full bg-up px-2 py-0.5 text-[10px] font-bold uppercase text-ink-950">Owned</span>}
              </div>
              <div className="p-4">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-ink-400">{item.brand}</div>
                <div className="font-display text-lg font-bold leading-tight group-hover:text-gold-400">{item.model}</div>
                <div className="mt-1 line-clamp-1 text-sm text-ink-400">{item.tagline}</div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`font-mono text-lg font-bold ${can ? 'text-gold-400' : 'text-ink-300'}`}>{money(item.price)}</span>
                  <span className="text-xs text-ink-400">+{item.reputation} rep</span>
                </div>
              </div>
            </Link>
          );
        })}
        {!items.length && <div className="col-span-full py-16 text-center text-ink-400">Nothing you can afford here. Yet.</div>}
      </div>
    </div>
  );
}
