import { CUSTOM_OPTIONS, PAINT_COLORS, type ShopItem } from '../engine/data/shopItems';
import { optionCost } from '../engine/shop';
import { money } from './format';

type Custom = Record<string, string | number | boolean>;

/** Option controls for customising an item. Costs are shown relative to `base`. */
export default function Customizer({ item, value, base, onChange }: { item: ShopItem; value: Custom; base: Custom; onChange: (c: Custom) => void }) {
  const opts = CUSTOM_OPTIONS[item.art.kind];
  const set = (k: string, v: string | boolean) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-4">
      {opts.map((o) => {
        const changed = value[o.key] !== base[o.key];
        const cost = optionCost(o, value[o.key], item.price);
        return (
          <div key={o.key}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-medium">{o.label}</span>
              <span className={`font-mono text-xs ${changed && cost > 0 ? 'text-gold-400' : 'text-ink-400'}`}>
                {o.type === 'choice' ? '' : `${money(optionCost(o, true, item.price))}`}
                {changed && o.type === 'choice' && cost > 0 ? `+${money(cost)}` : ''}
              </span>
            </div>
            {o.type === 'color' && (
              <div className="flex flex-wrap gap-2">
                {PAINT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => set(o.key, c)}
                    className={`h-8 w-8 rounded-full border-2 transition ${value[o.key] === c ? 'scale-110 border-gold-400' : 'border-ink-600'}`}
                    style={{ background: c }}
                    aria-label={`Colour ${c}`}
                  />
                ))}
                <label className="relative h-8 w-8 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-ink-500" title="Custom colour">
                  <input type="color" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" value={String(value[o.key])} onChange={(e) => set(o.key, e.target.value)} />
                  <span className="grid h-full w-full place-items-center text-xs text-ink-300">+</span>
                </label>
              </div>
            )}
            {o.type === 'choice' && (
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {o.choices!.map((c) => (
                  <button key={c.value} onClick={() => set(o.key, c.value)} className={`rounded-xl border px-2 py-2 text-xs ${value[o.key] === c.value ? 'border-gold-500 bg-gold-500/10 text-gold-400' : 'border-ink-600 bg-ink-900 text-ink-200'}`}>
                    <div className="font-semibold">{c.label}</div>
                    <div className="font-mono text-[10px] text-ink-400">{c.cost ? money(optionCost(o, c.value, item.price)) : 'Free'}</div>
                  </button>
                ))}
              </div>
            )}
            {o.type === 'toggle' && (
              <button onClick={() => set(o.key, !value[o.key])} className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm ${value[o.key] ? 'border-gold-500 bg-gold-500/10' : 'border-ink-600 bg-ink-900'}`}>
                <span>{value[o.key] ? 'Installed' : 'Not installed'}</span>
                <span className={`relative h-5 w-9 rounded-full transition ${value[o.key] ? 'bg-gold-500' : 'bg-ink-600'}`}>
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${value[o.key] ? 'left-[18px]' : 'left-0.5'}`} />
                </span>
              </button>
            )}
            {o.type === 'text' && <input className="input font-mono uppercase" maxLength={o.maxLength} value={String(value[o.key] ?? '')} placeholder="Leave empty for none" onChange={(e) => set(o.key, e.target.value)} />}
          </div>
        );
      })}
    </div>
  );
}
