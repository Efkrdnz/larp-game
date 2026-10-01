// Shop catalogue. Brands are fictional parodies; art is drawn procedurally (src/ui/art).

export type ShopCategory = 'cars' | 'homes' | 'watches' | 'luxury';

export type CarBody = 'hatch' | 'sedan' | 'suv' | 'sports' | 'super' | 'pickup' | 'limo';
export type HomeStyle = 'suburban' | 'loft' | 'villa' | 'mansion' | 'penthouse' | 'castle' | 'island';
export type WatchStyle = 'digital' | 'diver' | 'dress' | 'chrono' | 'gold' | 'skeleton' | 'diamond';

export type ArtSpec =
  | { kind: 'car'; body: CarBody; paint: string }
  | { kind: 'home'; style: HomeStyle; wall: string; roof: string }
  | { kind: 'watch'; style: WatchStyle; metal: string; dial: string }
  | { kind: 'yacht'; size: 'small' | 'super'; hull: string }
  | { kind: 'jet'; livery: string }
  | { kind: 'heli'; livery: string };

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
}

export const SHOP_ITEMS: ShopItem[] = [
  // ---------------- Cars ----------------
  { id: 'car-kompakt', category: 'cars', brand: 'Volkzig', model: 'Kompakt 1.2 (used)', price: 6500, tagline: 'It starts. Usually.', art: { kind: 'car', body: 'hatch', paint: '#9ca3af' }, specs: [['Power', '75 hp'], ['0-100', '13.9 s'], ['Mileage', '182,000 km']], appreciation: -0.12, upkeepPerDay: 8, reputation: 0 },
  { id: 'car-civa', category: 'cars', brand: 'Okami', model: 'Civa Sport', price: 26000, tagline: 'The sensible choice with a spoiler.', art: { kind: 'car', body: 'sedan', paint: '#1d4ed8' }, specs: [['Power', '180 hp'], ['0-100', '7.8 s'], ['Seats', '5']], appreciation: -0.14, upkeepPerDay: 15, reputation: 1 },
  { id: 'car-ranger', category: 'cars', brand: 'Trekker', model: 'Ranger XLT', price: 48000, tagline: 'Hauls nothing, looks tough doing it.', art: { kind: 'car', body: 'pickup', paint: '#7f1d1d' }, specs: [['Power', '400 hp'], ['Towing', '5,000 kg'], ['MPG', 'lol']], appreciation: -0.13, upkeepPerDay: 25, reputation: 2 },
  { id: 'car-modelv', category: 'cars', brand: 'Voltara', model: 'Model V', price: 55000, tagline: 'Silent, fast, and constantly updating.', art: { kind: 'car', body: 'sedan', paint: '#f8fafc' }, specs: [['Power', '510 hp'], ['Range', '560 km'], ['0-100', '3.9 s']], appreciation: -0.18, upkeepPerDay: 12, reputation: 3 },
  { id: 'car-m5x', category: 'cars', brand: 'Bavarix', model: 'M5X Competition', price: 112000, tagline: 'Indicators sold separately.', art: { kind: 'car', body: 'sedan', paint: '#0f172a' }, specs: [['Power', '625 hp'], ['0-100', '3.3 s'], ['Top speed', '305 km/h']], appreciation: -0.15, upkeepPerDay: 45, reputation: 5 },
  { id: 'car-carrera', category: 'cars', brand: 'Porsa', model: 'Carrera 9 GTS', price: 145000, tagline: 'The dentist\'s dream.', art: { kind: 'car', body: 'sports', paint: '#facc15' }, specs: [['Power', '480 hp'], ['0-100', '3.4 s'], ['Seats', '2+2']], appreciation: -0.08, upkeepPerDay: 55, reputation: 6 },
  { id: 'car-gclass', category: 'cars', brand: 'Mercer', model: 'G-Wagen 63', price: 180000, tagline: 'A brick that costs a house.', art: { kind: 'car', body: 'suv', paint: '#111827' }, specs: [['Power', '577 hp'], ['0-100', '4.5 s'], ['Weight', '2,560 kg']], appreciation: -0.1, upkeepPerDay: 60, reputation: 7 },
  { id: 'car-rosso', category: 'cars', brand: 'Ferrova', model: 'Rosso GT', price: 285000, tagline: 'Red is the only acceptable colour.', art: { kind: 'car', body: 'sports', paint: '#dc2626' }, specs: [['Power', '720 hp'], ['0-100', '2.9 s'], ['Top speed', '340 km/h']], appreciation: -0.05, upkeepPerDay: 110, reputation: 10 },
  { id: 'car-phantom', category: 'cars', brand: 'Regalis', model: 'Phantom LWB', price: 480000, tagline: 'You do not drive it. You are driven.', art: { kind: 'car', body: 'limo', paint: '#312e81' }, specs: [['Power', '563 hp'], ['Starlight roof', 'Yes'], ['Chauffeur', 'Not included']], appreciation: -0.09, upkeepPerDay: 160, reputation: 14 },
  { id: 'car-furia', category: 'cars', brand: 'Lambrino', model: 'Furia V12', price: 540000, tagline: 'Doors go up. Wallet goes down.', art: { kind: 'car', body: 'super', paint: '#65a30d' }, specs: [['Power', '1,001 hp'], ['0-100', '2.5 s'], ['Top speed', '350 km/h']], appreciation: -0.04, upkeepPerDay: 200, reputation: 16 },
  { id: 'car-veloce', category: 'cars', brand: 'Bugano', model: 'Veloce Hyper', price: 3200000, tagline: 'Faster than your accountant can scream.', art: { kind: 'car', body: 'super', paint: '#0c4a6e' }, specs: [['Power', '1,600 hp'], ['0-100', '2.2 s'], ['Top speed', '440 km/h']], appreciation: 0.02, upkeepPerDay: 900, reputation: 28 },

  // ---------------- Homes ----------------
  { id: 'home-suburban', category: 'homes', brand: 'Maple Grove', model: 'Suburban Starter Home', price: 320000, tagline: 'White picket fence. HOA rules apply.', art: { kind: 'home', style: 'suburban', wall: '#e5d3b3', roof: '#7c2d12' }, specs: [['Bedrooms', '3'], ['Size', '160 m²'], ['Garden', 'Yes']], appreciation: 0.04, upkeepPerDay: 35, reputation: 4, residence: true },
  { id: 'home-loft', category: 'homes', brand: 'Downtown', model: 'Industrial Loft', price: 690000, tagline: 'Exposed brick, exposed bank balance.', art: { kind: 'home', style: 'loft', wall: '#9a3412', roof: '#1f2937' }, specs: [['Bedrooms', '2'], ['Size', '140 m²'], ['Ceilings', '5 m']], appreciation: 0.05, upkeepPerDay: 60, reputation: 6, residence: true },
  { id: 'home-villa', category: 'homes', brand: 'Sierra Bay', model: 'Modern Glass Villa', price: 1850000, tagline: 'Architects cried when they saw it.', art: { kind: 'home', style: 'villa', wall: '#f1f5f9', roof: '#334155' }, specs: [['Bedrooms', '5'], ['Size', '420 m²'], ['View', 'Ocean']], appreciation: 0.05, upkeepPerDay: 180, reputation: 12, residence: true },
  { id: 'home-mansion', category: 'homes', brand: 'Port Aurum', model: 'Beachfront Mansion', price: 6500000, tagline: 'Columns. Lots of columns.', art: { kind: 'home', style: 'mansion', wall: '#fef3c7', roof: '#57534e' }, specs: [['Bedrooms', '9'], ['Size', '1,200 m²'], ['Staff quarters', 'Yes']], appreciation: 0.06, upkeepPerDay: 700, reputation: 20, residence: true },
  { id: 'home-penthouse', category: 'homes', brand: 'Skyline Tower', model: 'Sky Penthouse', price: 14000000, tagline: 'Look down on everyone. Literally.', art: { kind: 'home', style: 'penthouse', wall: '#1e293b', roof: '#0f172a' }, specs: [['Floor', '88'], ['Size', '900 m²'], ['Helipad', 'Shared']], appreciation: 0.05, upkeepPerDay: 1400, reputation: 26, residence: true },
  { id: 'home-castle', category: 'homes', brand: 'Valdoria', model: 'Hilltop Castle', price: 45000000, tagline: 'Comes with a moat and a ghost.', art: { kind: 'home', style: 'castle', wall: '#a8a29e', roof: '#44403c' }, specs: [['Rooms', '64'], ['Towers', '4'], ['Ghosts', '1']], appreciation: 0.03, upkeepPerDay: 4500, reputation: 34, residence: true },
  { id: 'home-island', category: 'homes', brand: 'Azure Cay', model: 'Private Island Estate', price: 120000000, tagline: 'Extradition treaties? Never heard of them.', art: { kind: 'home', style: 'island', wall: '#ffffff', roof: '#0e7490' }, specs: [['Land', '40 ha'], ['Beaches', '3'], ['Airstrip', 'Yes']], appreciation: 0.06, upkeepPerDay: 12000, reputation: 45, residence: true },

  // ---------------- Watches ----------------
  { id: 'watch-f91', category: 'watches', brand: 'Casiko', model: 'F-91 Classic', price: 25, tagline: 'Iconic. Indestructible. $25.', art: { kind: 'watch', style: 'digital', metal: '#1f2937', dial: '#a3b18a' }, specs: [['Movement', 'Quartz'], ['Battery', '7 years'], ['Alarm', 'Yes']], appreciation: 0, upkeepPerDay: 0, reputation: 0 },
  { id: 'watch-seikon', category: 'watches', brand: 'Seikon', model: 'Turtle Diver', price: 480, tagline: 'Honest steel for honest people.', art: { kind: 'watch', style: 'diver', metal: '#cbd5e1', dial: '#1e3a8a' }, specs: [['Movement', 'Automatic'], ['Water', '200 m'], ['Case', '44 mm']], appreciation: -0.02, upkeepPerDay: 0, reputation: 1 },
  { id: 'watch-tagg', category: 'watches', brand: 'Tagg Heuera', model: 'Carrera Chrono', price: 5600, tagline: 'For people who like cars more than watches.', art: { kind: 'watch', style: 'chrono', metal: '#e2e8f0', dial: '#111827' }, specs: [['Movement', 'Chronograph'], ['Water', '100 m'], ['Case', '42 mm']], appreciation: -0.03, upkeepPerDay: 1, reputation: 2 },
  { id: 'watch-sub', category: 'watches', brand: 'Rolax', model: 'Submarino', price: 13500, tagline: 'The default rich-person watch.', art: { kind: 'watch', style: 'diver', metal: '#e5e7eb', dial: '#0b0b0b' }, specs: [['Movement', 'Automatic'], ['Water', '300 m'], ['Waitlist', '3 years']], appreciation: 0.06, upkeepPerDay: 2, reputation: 4 },
  { id: 'watch-daytona', category: 'watches', brand: 'Rolax', model: 'Daytona 18k Gold', price: 52000, tagline: 'Says "I made it" from across the room.', art: { kind: 'watch', style: 'gold', metal: '#d4a017', dial: '#f5f5f4' }, specs: [['Movement', 'Chronograph'], ['Material', '18k gold'], ['Case', '40 mm']], appreciation: 0.07, upkeepPerDay: 5, reputation: 7 },
  { id: 'watch-nautile', category: 'watches', brand: 'Patrique', model: 'Nautile 5711', price: 145000, tagline: 'Quiet luxury that screams.', art: { kind: 'watch', style: 'dress', metal: '#d1d5db', dial: '#1e3a5f' }, specs: [['Movement', 'Automatic'], ['Thickness', '8.3 mm'], ['Resale', 'Above retail']], appreciation: 0.08, upkeepPerDay: 10, reputation: 11 },
  { id: 'watch-rm', category: 'watches', brand: 'Richard Mile', model: 'RM-027 Tourbillon', price: 1200000, tagline: 'Weighs less than a coin, costs more than a house.', art: { kind: 'watch', style: 'skeleton', metal: '#334155', dial: '#0f172a' }, specs: [['Movement', 'Tourbillon'], ['Weight', '19 g'], ['Made', '50 pieces']], appreciation: 0.05, upkeepPerDay: 60, reputation: 18 },
  { id: 'watch-billionaire', category: 'watches', brand: 'Jakob & Co', model: 'Billionaire IV', price: 18000000, tagline: '425 diamonds. Zero subtlety.', art: { kind: 'watch', style: 'diamond', metal: '#f1f5f9', dial: '#e0f2fe' }, specs: [['Diamonds', '425'], ['Carats', '216'], ['Subtle', 'No']], appreciation: 0.02, upkeepPerDay: 500, reputation: 30 },

  // ---------------- Luxury toys ----------------
  { id: 'lux-cruiser', category: 'luxury', brand: 'Sunseeker', model: 'Cruiser 45', price: 850000, tagline: 'Weekend boat. Weekday regret.', art: { kind: 'yacht', size: 'small', hull: '#f8fafc' }, specs: [['Length', '14 m'], ['Cabins', '2'], ['Speed', '34 knots']], appreciation: -0.1, upkeepPerDay: 450, reputation: 10 },
  { id: 'lux-heli', category: 'luxury', brand: 'Aerodyne', model: 'H3 Executive Helicopter', price: 3500000, tagline: 'Skip traffic. Skip neighbours\' sleep.', art: { kind: 'heli', livery: '#0f172a' }, specs: [['Range', '650 km'], ['Seats', '6'], ['Speed', '280 km/h']], appreciation: -0.08, upkeepPerDay: 1500, reputation: 18 },
  { id: 'lux-jet', category: 'luxury', brand: 'Gulfwing', model: 'G7 Private Jet', price: 65000000, tagline: 'Commercial is for poor people.', art: { kind: 'jet', livery: '#b45309' }, specs: [['Range', '13,000 km'], ['Seats', '16'], ['Speed', 'Mach 0.92']], appreciation: -0.07, upkeepPerDay: 22000, reputation: 32 },
  { id: 'lux-superyacht', category: 'luxury', brand: 'Azzurra', model: '78m Superyacht', price: 95000000, tagline: 'Has a smaller yacht inside it.', art: { kind: 'yacht', size: 'super', hull: '#0f172a' }, specs: [['Length', '78 m'], ['Crew', '28'], ['Helipad', 'Yes']], appreciation: -0.06, upkeepPerDay: 30000, reputation: 40 },
];

export const ITEM_BY_ID: Record<string, ShopItem> = Object.fromEntries(SHOP_ITEMS.map((i) => [i.id, i]));

export const CATEGORY_LABELS: Record<ShopCategory, string> = {
  cars: 'Cars',
  homes: 'Real Estate',
  watches: 'Watches',
  luxury: 'Yachts & Jets',
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
      return { paint: a.paint, rims: 'stock', wrap: 'none', tint: 'none', spoiler: false, lowered: false, plate: '' };
    case 'home':
      return { wall: a.wall, roof: a.roof, pool: false, garden: false, lights: false, gate: false };
    case 'watch':
      return { dial: a.dial, strap: a.style === 'gold' ? 'gold' : a.style === 'digital' ? 'rubber' : 'steel', iced: a.style === 'diamond', engraving: '' };
    case 'yacht':
      return { hull: a.hull, name: '', lights: false };
    case 'jet':
    case 'heli':
      return { livery: a.livery, tail: '' };
  }
}
