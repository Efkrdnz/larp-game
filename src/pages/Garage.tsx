import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ITEM_BY_ID } from '../engine/data/shopItems';
import { minuteOfDay, formatDate } from '../engine/calendar';
import { itemValue } from '../engine/portfolio';
import { customisationCost, customiseItem, dailyUpkeep, hasResidence, saleValue, sellItem } from '../engine/shop';
import type { OwnedItem } from '../engine/types';
import { useGame, useGameState } from '../store/useGame';
import ItemArt, { artBackdrop } from '../ui/art/ItemArt';
import Customizer from '../ui/Customizer';
import { money, upDown } from '../ui/format';
import { IconX } from '../ui/icons';

export default function Garage() {
  const g = useGameState();
  const act = useGame((s) => s.act);
  const [editing, setEditing] = useState<OwnedItem | null>(null);
  const [confirmSell, setConfirmSell] = useState<string | null>(null);
  const total = g.inventory.reduce((s, o) => s + itemValue(g, o.itemId, o.boughtFor, o.boughtAt), 0);
  const residence = g.inventory.find((o) => ITEM_BY_ID[o.itemId].residence);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">My Stuff</h1>
          <p className="text-sm text-ink-400">
            {g.inventory.length} items · worth {money(total)} · upkeep {money(dailyUpkeep(g))}/day
          </p>
        </div>
        <Link to="/shop" className="btn-primary">
          Go shopping
        </Link>
      </div>

      <div className="panel panel-pad flex flex-wrap items-center gap-4">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gold-500/15 text-3xl">{residence ? '🏡' : '🛏️'}</div>
        <div className="min-w-0 flex-1">
          <div className="stat-label">Residence</div>
          <div className="text-lg font-semibold">{residence ? ITEM_BY_ID[residence.itemId].model : 'Rented studio apartment (12 m², shared bathroom)'}</div>
          <div className="text-xs text-ink-400">{hasResidence(g) ? 'You own your home. No rent.' : 'Rent: $45/day. Buy a home to move out.'}</div>
        </div>
        <div className="text-right">
          <div className="stat-label">Reputation</div>
          <div className="font-mono text-2xl font-bold text-gold-400">{Math.round(g.player.reputation)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {g.inventory.map((o) => {
          const item = ITEM_BY_ID[o.itemId];
          const value = itemValue(g, o.itemId, o.boughtFor, o.boughtAt);
          const pl = value - o.boughtFor;
          const isWatch = item.art.kind === 'watch';
          return (
            <div key={o.uid} className="panel overflow-hidden">
              <div className={`${artBackdrop(item)} ${isWatch ? 'flex h-56 justify-center py-3' : ''}`}>
                <ItemArt item={item} custom={o.custom} minuteOfDay={minuteOfDay(g.time)} className={isWatch ? 'h-full w-auto' : 'h-auto w-full'} />
              </div>
              <div className="p-4">
                <div className="text-[11px] font-semibold uppercase tracking-widest text-ink-400">{item.brand}</div>
                <div className="font-display text-lg font-bold">{item.model}</div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="stat-label">Value</div>
                    <div className="font-mono">{money(value, { compact: true })}</div>
                  </div>
                  <div>
                    <div className="stat-label">P&L</div>
                    <div className={`font-mono ${upDown(pl)}`}>{money(pl, { compact: true, sign: true })}</div>
                  </div>
                  <div>
                    <div className="stat-label">Since</div>
                    <div>{formatDate(o.boughtAt).slice(4)}</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button className="btn-ghost py-2" onClick={() => setEditing({ ...o, custom: { ...o.custom } })}>
                    Customise
                  </button>
                  {confirmSell === o.uid ? (
                    <button
                      className="btn-sell py-2"
                      onClick={() => {
                        act((gs) => sellItem(gs, o.uid));
                        setConfirmSell(null);
                      }}
                    >
                      Sell {money(saleValue(g, o), { compact: true })}?
                    </button>
                  ) : (
                    <button className="btn-ghost py-2" onClick={() => setConfirmSell(o.uid)}>
                      Sell
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {!g.inventory.length && <div className="col-span-full py-16 text-center text-ink-400">You own nothing. Very minimalist.</div>}
      </div>

      {editing && <EditModal owned={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function EditModal({ owned, onClose }: { owned: OwnedItem; onClose: () => void }) {
  const g = useGameState();
  const act = useGame((s) => s.act);
  const item = ITEM_BY_ID[owned.itemId];
  const current = g.inventory.find((o) => o.uid === owned.uid);
  const [custom, setCustom] = useState(owned.custom);
  const [err, setErr] = useState<string | null>(null);
  if (!current) return null;
  const cost = customisationCost(item.id, current.custom, custom);
  const isWatch = item.art.kind === 'watch';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl border border-ink-600 bg-ink-850 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-700 bg-ink-850/95 px-5 py-3 backdrop-blur">
          <div className="font-display font-bold">Customise {item.model}</div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-ink-700" aria-label="Close">
            <IconX />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
          <div className={`overflow-hidden rounded-2xl ${artBackdrop(item)} ${isWatch ? 'flex justify-center py-4' : ''} h-fit md:sticky md:top-20`}>
            <ItemArt item={item} custom={custom} minuteOfDay={minuteOfDay(g.time)} className={isWatch ? 'h-72 w-auto' : 'h-auto w-full'} />
          </div>
          <div>
            <Customizer item={item} value={custom} base={current.custom} onChange={setCustom} />
            <button
              className="btn-primary mt-5 w-full py-3"
              disabled={g.player.cash < cost}
              onClick={() => {
                const e = act((gs) => customiseItem(gs, owned.uid, custom));
                if (e) setErr(e);
                else onClose();
              }}
            >
              {cost > 0 ? `Apply mods for ${money(cost)}` : 'Apply (free)'}
            </button>
            {err && <div className="mt-2 text-sm text-down">{err}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
