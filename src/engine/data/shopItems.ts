// Shop catalogue: types, customisation rules and the merged item list.
// Brand and model names are real products used for flavour; all art is drawn procedurally (src/ui/art).

import { CARS } from './catalog/cars';
import { HOMES } from './catalog/homes';
import { LUXURY } from './catalog/luxury';
import { WATCHES } from './catalog/watches';

export type ShopCategory = 'cars' | 'homes' | 'watches' | 'luxury';

export type CarBody = 'hatch' | 'sedan' | 'coupe' | 'wagon' | 'crossover' | 'suv' | 'convertible' | 'sports' | 'super' | 'pickup' | 'limo';
export type HomeStyle = 'apartment' | 'suburban' | 'loft' | 'villa' | 'chalet' | 'mansion' | 'penthouse' | 'castle' | 'island';
export type WatchStyle = 'digital' | 'diver' | 'dress' | 'classic' | 'chrono' | 'gold' | 'skeleton' | 'diamond' | 'pilot' | 'square' | 'smart' | 'smartround' | 'octagon';

export type ArtSpec =
  | { kind: 'car'; body: CarBody; paint: string; wing?: boolean }
  | { kind: 'home'; style: HomeStyle; wall: string; roof: string }
  | { kind: 'watch'; style: WatchStyle; metal: string; dial: string; strap: string; label: string; bezel?: [string, string] }
  | { kind: 'yacht'; size: 'small' | 'mid' | 'super' | 'mega'; hull: string }
  | { kind: 'jet'; size: 'light' | 'mid' | 'large' | 'airliner'; livery: string }
  | { kind: 'heli'; size: 'light' | 'twin'; livery: string };

export interface ShopItem {
  id: string;
  category: ShopCategory;
  brand: string;
  model: string;
  price: number;
  tagline: string;
  art: ArtSpec;
  specs: [string, string][];
  appreciation: number; // yearly value change, e.g. -0.15
  upkeepPerDay: number;
  reputation: number; // reputation gained when bought
  residence?: boolean; // homes: removes rent
  /** Filterable attributes, e.g. { brand: 'Ferrari', body: 'Supercar', fuel: 'Hybrid' }. */
  facets: Record<string, string>;
  /** Numeric attributes used for sorting (e.g. power). */
  stats: Record<string, number>;
  /** One-line summary shown on catalogue cards. */
  summary: string;
}

export const SHOP_ITEMS: ShopItem[] = [...CARS, ...WATCHES, ...HOMES, ...LUXURY];

export const ITEM_BY_ID: Record<string, ShopItem> = Object.fromEntries(SHOP_ITEMS.map((i) => [i.id, i]));

export const CATEGORY_LABELS: Record<ShopCategory, string> = {
  cars: 'Cars',
  watches: 'Watches',
  homes: 'Real Estate',
  luxury: 'Yachts & Aircraft',
};

/** Facets shown as filters for each category, in display order. */
export const CATEGORY_FACETS: Record<ShopCategory, { key: string; label: string }[]> = {
  cars: [
    { key: 'brand', label: 'Brand' },
    { key: 'body', label: 'Body style' },
    { key: 'fuel', label: 'Powertrain' },
    { key: 'origin', label: 'Country' },
    { key: 'condition', label: 'Condition' },
  ],
  watches: [
    { key: 'brand', label: 'Brand' },
    { key: 'style', label: 'Style' },
    { key: 'movement', label: 'Movement' },
    { key: 'material', label: 'Case material' },
    { key: 'origin', label: 'Country' },
  ],
  homes: [
    { key: 'country', label: 'Country' },
    { key: 'city', label: 'City' },
    { key: 'type', label: 'Property type' },
  ],
  luxury: [
    { key: 'type', label: 'Type' },
    { key: 'brand', label: 'Manufacturer' },
    { key: 'class', label: 'Class' },
  ],
};

/** Extra sort options per category (beyond price / name). */
export const CATEGORY_SORTS: Record<ShopCategory, { key: string; label: string }[]> = {
  cars: [
    { key: 'power', label: 'Most powerful' },
    { key: 'speed', label: 'Fastest top speed' },
  ],
  watches: [{ key: 'size', label: 'Largest case' }],
  homes: [{ key: 'size', label: 'Largest' }],
  luxury: [{ key: 'size', label: 'Largest' }],
};

/** Old item ids (v0.1 catalogue) mapped to their replacements, for save migration. */
export const LEGACY_ITEM_IDS: Record<string, string> = {
  'car-kompakt': 'car-volkswagen-golf-mk5-2008-used',
  'car-civa': 'car-honda-civic',
  'car-ranger': 'car-ford-f-150',
  'car-modelv': 'car-tesla-model-3',
  'car-m5x': 'car-bmw-m5',
  'car-carrera': 'car-porsche-911-carrera',
  'car-gclass': 'car-mercedes-amg-g-63',
  'car-rosso': 'car-ferrari-296-gtb',
  'car-phantom': 'car-rolls-royce-phantom',
  'car-furia': 'car-lamborghini-revuelto',
  'car-veloce': 'car-bugatti-chiron',
  'home-suburban': 'home-austin-suburban-house-zilker',
  'home-loft': 'home-new-york-loft-soho',
  'home-villa': 'home-los-angeles-villa-hollywood-hills',
  'home-mansion': 'home-miami-mansion-star-island',
  'home-penthouse': 'home-new-york-penthouse-billionaires-row',
  'home-castle': 'home-loire-valley-castle-amboise',
  'home-island': 'home-bahamas-private-island-exuma-cays',
  'watch-f91': 'watch-casio-f-91w',
  'watch-seikon': 'watch-seiko-prospex-turtle',
  'watch-tagg': 'watch-tag-heuer-carrera-chronograph',
  'watch-sub': 'watch-rolex-submariner-date',
  'watch-daytona': 'watch-rolex-daytona-everose-gold',
  'watch-nautile': 'watch-patek-philippe-nautilus-5711',
  'watch-rm': 'watch-richard-mille-rm-27-04',
  'watch-billionaire': 'watch-jacob-co-billionaire-timeless-treasure',
  'lux-cruiser': 'lux-sunseeker-predator-55',
  'lux-heli': 'lux-airbus-h125',
  'lux-jet': 'lux-gulfstream-g650er',
  'lux-superyacht': 'lux-feadship-70m-custom',
};

// ---------------- Customisation ----------------

export interface CustomChoice {
  value: string;
  label: string;
  cost: number; // base cost; scaled by item tier
}

export interface CustomOption {
  key: string;
  label: string;
  type: 'color' | 'choice' | 'toggle' | 'text';
  choices?: CustomChoice[];
  cost?: number; // for color / toggle / text
  maxLength?: number;
}

export const PAINT_COLORS = ['#dc2626', '#f97316', '#facc15', '#65a30d', '#0d9488', '#0284c7', '#1d4ed8', '#7c3aed', '#db2777', '#f8fafc', '#9ca3af', '#111827', '#d4a017', '#7f1d1d', '#312e81', '#0c4a6e'];

export const CUSTOM_OPTIONS: Record<ArtSpec['kind'], CustomOption[]> = {
  car: [
    { key: 'paint', label: 'Paint', type: 'color', cost: 2500 },
    { key: 'rims', label: 'Rims', type: 'choice', choices: [{ value: 'stock', label: 'Stock', cost: 0 }, { value: 'sport', label: 'Sport', cost: 1800 }, { value: 'chrome', label: 'Chrome', cost: 4000 }, { value: 'gold', label: 'Gold-plated', cost: 25000 }] },
    { key: 'wrap', label: 'Wrap', type: 'choice', choices: [{ value: 'none', label: 'None', cost: 0 }, { value: 'stripes', label: 'Racing stripes', cost: 900 }, { value: 'flames', label: 'Flames', cost: 1500 }, { value: 'carbon', label: 'Carbon hood', cost: 4500 }] },
    { key: 'tint', label: 'Window tint', type: 'choice', choices: [{ value: 'none', label: 'None', cost: 0 }, { value: 'light', label: 'Light', cost: 250 }, { value: 'limo', label: 'Limo black', cost: 600 }] },
    { key: 'spoiler', label: 'Rear spoiler', type: 'toggle', cost: 2200 },
    { key: 'lowered', label: 'Lowered suspension', type: 'toggle', cost: 3000 },
    { key: 'plate', label: 'Vanity plate', type: 'text', cost: 500, maxLength: 8 },
  ],
  home: [
    { key: 'wall', label: 'Facade colour', type: 'color', cost: 12000 },
    { key: 'roof', label: 'Roof / trim colour', type: 'color', cost: 8000 },
    { key: 'pool', label: 'Swimming pool', type: 'toggle', cost: 60000 },
    { key: 'garden', label: 'Landscaped garden', type: 'toggle', cost: 18000 },
    { key: 'lights', label: 'Party lights', type: 'toggle', cost: 4000 },
    { key: 'gate', label: 'Security gate', type: 'toggle', cost: 25000 },
  ],
  watch: [
    { key: 'dial', label: 'Dial colour', type: 'color', cost: 900 },
    { key: 'strap', label: 'Strap', type: 'choice', choices: [{ value: 'steel', label: 'Steel bracelet', cost: 0 }, { value: 'leather', label: 'Leather', cost: 350 }, { value: 'rubber', label: 'Rubber', cost: 200 }, { value: 'gold', label: 'Gold bracelet', cost: 9000 }] },
    { key: 'iced', label: 'Diamond bezel', type: 'toggle', cost: 15000 },
    { key: 'engraving', label: 'Engraving', type: 'text', cost: 300, maxLength: 12 },
  ],
  yacht: [
    { key: 'hull', label: 'Hull colour', type: 'color', cost: 40000 },
    { key: 'name', label: 'Boat name', type: 'text', cost: 2000, maxLength: 14 },
    { key: 'lights', label: 'Underwater lights', type: 'toggle', cost: 15000 },
  ],
  jet: [
    { key: 'livery', label: 'Livery colour', type: 'color', cost: 150000 },
    { key: 'tail', label: 'Tail number', type: 'text', cost: 5000, maxLength: 7 },
  ],
  heli: [
    { key: 'livery', label: 'Livery colour', type: 'color', cost: 30000 },
    { key: 'tail', label: 'Tail number', type: 'text', cost: 2000, maxLength: 7 },
  ],
};

/** Customisation cost multiplier: pricier items have pricier mods. */
export function tierMultiplier(price: number): number {
  return Math.max(0.5, Math.min(40, Math.sqrt(price / 100000)));
}

export function defaultCustom(item: ShopItem): Record<string, string | number | boolean> {
  const a = item.art;
  switch (a.kind) {
    case 'car':
      return { paint: a.paint, rims: a.wing ? 'sport' : 'stock', wrap: 'none', tint: 'none', spoiler: a.wing ?? false, lowered: false, plate: '' };
    case 'home':
      return { wall: a.wall, roof: a.roof, pool: false, garden: false, lights: false, gate: false };
    case 'watch':
      return { dial: a.dial, strap: a.strap, iced: a.style === 'diamond', engraving: '' };
    case 'yacht':
      return { hull: a.hull, name: '', lights: false };
    case 'jet':
    case 'heli':
      return { livery: a.livery, tail: '' };
  }
}
