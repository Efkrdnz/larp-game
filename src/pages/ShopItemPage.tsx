import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { CATEGORY_LABELS, ITEM_BY_ID, defaultCustom } from '../engine/data/shopItems';
import { minuteOfDay } from '../engine/calendar';
import { buyItem, customisationCost } from '../engine/shop';
import { useGame, useGameState } from '../store/useGame';
import ItemArt, { artBackdrop } from '../ui/art/ItemArt';
import Customizer from '../ui/Customizer';
import { money, pct } from '../ui/format';

export default function ShopItemPage() {
  const { id = '' } = useParams();
  const g = useGameState();
  const act = useGame((s) => s.act);
  const nav = useNavigate();
  const item = ITEM_BY_ID[id];
  const [custom, setCustom] = useState(() => (item ? defaultCustom(item) : {}));
  const [err, setErr] = useState<string | null>(null);
  if (!item) return <Navigate to="/shop" replace />;

  const base = defaultCustom(item);
  const mods = customisationCost(item.id, base, custom);
  const total = item.price + mods;
  const isWatch = item.art.kind === 'watch';

  const buy = () => {
    const e = act((gs) => buyItem(gs, item.id, custom));
    if (e) setErr(e);
    else nav('/garage');
  };

  return (
    <div className="space-y-4">
      <Link to="/shop" className="text-sm text-ink-400 hover:text-ink-100">
        ← {CATEGORY_LABELS[item.category]}
      </Link>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className={`panel overflow-hidden ${artBackdrop(item)} ${isWatch ? 'flex justify-center py-6' : ''}`}>
            <ItemArt item={item} custom={custom} minuteOfDay={minuteOfDay(g.time)} className={isWatch ? 'h-80 w-auto sm:h-96' : 'h-auto w-full'} />
          </div>
          <div className="panel panel-pad">
            <div className="text-xs font-semibold uppercase tracking-widest text-ink-400">{item.brand}</div>
            <h1 className="font-display text-3xl font-bold">{item.model}</h1>
            <p className="mt-1 text-ink-300">{item.tagline}</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {item.specs.map(([k, v]) => (
                <div key={k} className="rounded-xl bg-ink-900 p-3">
                  <div className="stat-label">{k}</div>
                  <div className="text-sm font-semibold">{v}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div>
                <div className="stat-label">Value / year</div>
                <div className={item.appreciation >= 0 ? 'text-up' : 'text-down'}>{pct(item.appreciation, 0)}</div>
              </div>
              <div>
                <div className="stat-label">Upkeep</div>
                <div>{money(item.upkeepPerDay)}/day</div>
              </div>
              <div>
                <div className="stat-label">Reputation</div>
                <div className="text-gold-400">+{item.reputation}</div>
              </div>
            </div>
            {item.residence && <div className="mt-3 rounded-xl bg-up/10 px-3 py-2 text-xs text-up">Buying a home ends your rent payments.</div>}
          </div>
        </div>

        <div className="panel panel-pad h-fit lg:sticky lg:top-24">
          <div className="panel-title">Configure</div>
          <Customizer item={item} value={custom} base={base} onChange={setCustom} />
          <div className="mt-5 space-y-1 rounded-xl bg-ink-900 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-400">Base price</span>
              <span className="font-mono">{money(item.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-400">Options</span>
              <span className="font-mono">{money(mods)}</span>
            </div>
            <div className="flex justify-between border-t border-ink-700 pt-1 text-base font-semibold">
              <span>Total</span>
              <span className="font-mono text-gold-400">{money(total)}</span>
            </div>
            <div className="flex justify-between text-xs text-ink-400">
              <span>Your cash</span>
              <span className="font-mono">{money(g.player.cash)}</span>
            </div>
          </div>
          <button className="btn-primary mt-3 w-full py-3 text-base" disabled={g.player.cash < total} onClick={buy}>
            {g.player.cash < total ? `Need ${money(total - g.player.cash)} more` : `Buy for ${money(total)}`}
          </button>
          {err && <div className="mt-2 text-center text-sm text-down">{err}</div>}
          <div className="mt-2 text-center text-[11px] text-ink-400">Options do not increase resale value. Resale is current value minus 5%.</div>
        </div>
      </div>
    </div>
  );
}
