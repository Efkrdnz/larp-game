import type { HomeStyle, ShopItem } from '../shopItems';
import { hash, reputationFor, slug } from './util';

interface City {
  city: string;
  country: string;
  mult: number; // price multiplier vs. a typical market
  growth: number; // yearly appreciation
  listings: [string, HomeStyle][]; // [neighbourhood, style]
}

const CITIES: City[] = [
  { city: 'Detroit', country: 'United States', mult: 0.35, growth: 0.03, listings: [['Corktown', 'suburban'], ['Midtown', 'loft'], ['Downtown', 'apartment']] },
  { city: 'Austin', country: 'United States', mult: 0.9, growth: 0.05, listings: [['Zilker', 'suburban'], ['East Austin', 'loft'], ['Westlake', 'villa']] },
  { city: 'Miami', country: 'United States', mult: 1.4, growth: 0.06, listings: [['Brickell', 'apartment'], ['Coconut Grove', 'villa'], ['Sunny Isles', 'penthouse'], ['Fisher Island', 'villa'], ['Star Island', 'mansion']] },
  { city: 'Los Angeles', country: 'United States', mult: 2.0, growth: 0.05, listings: [['Silver Lake', 'suburban'], ['Downtown LA', 'penthouse'], ['Hollywood Hills', 'villa'], ['Beverly Hills', 'mansion'], ['Bel Air', 'mansion']] },
  { city: 'Malibu', country: 'United States', mult: 2.6, growth: 0.05, listings: [['Carbon Beach', 'villa'], ['Point Dume', 'mansion']] },
  { city: 'New York', country: 'United States', mult: 2.4, growth: 0.04, listings: [['Brooklyn', 'apartment'], ['Upper East Side', 'apartment'], ['SoHo', 'loft'], ['Tribeca', 'loft'], ['Billionaires’ Row', 'penthouse'], ['The Hamptons', 'mansion']] },
  { city: 'Aspen', country: 'United States', mult: 2.5, growth: 0.05, listings: [['Snowmass', 'chalet'], ['Red Mountain', 'chalet']] },
  { city: 'London', country: 'United Kingdom', mult: 2.0, growth: 0.03, listings: [['Shoreditch', 'loft'], ['Kensington', 'apartment'], ['One Hyde Park', 'penthouse'], ['Mayfair', 'mansion'], ['The Cotswolds', 'suburban']] },
  { city: 'Scottish Highlands', country: 'United Kingdom', mult: 0.5, growth: 0.02, listings: [['Inverness-shire', 'castle']] },
  { city: 'Paris', country: 'France', mult: 1.8, growth: 0.03, listings: [['Le Marais', 'apartment'], ['Saint-Germain', 'apartment'], ['Avenue Montaigne', 'penthouse']] },
  { city: 'Loire Valley', country: 'France', mult: 0.7, growth: 0.02, listings: [['Amboise', 'castle'], ['Chenonceau', 'castle']] },
  { city: 'Monaco', country: 'Monaco', mult: 4.0, growth: 0.06, listings: [['Monte Carlo', 'apartment'], ['Larvotto', 'penthouse'], ['Cap-d’Ail', 'villa']] },
  { city: 'Lake Como', country: 'Italy', mult: 1.5, growth: 0.04, listings: [['Bellagio', 'villa'], ['Cernobbio', 'mansion']] },
  { city: 'Swiss Alps', country: 'Switzerland', mult: 2.6, growth: 0.04, listings: [['St. Moritz', 'chalet'], ['Gstaad', 'chalet'], ['Verbier', 'chalet']] },
  { city: 'Dubai', country: 'United Arab Emirates', mult: 1.3, growth: 0.07, listings: [['Dubai Marina', 'apartment'], ['Downtown Burj', 'penthouse'], ['Palm Jumeirah', 'villa'], ['Emirates Hills', 'mansion'], ['The World Islands', 'island']] },
  { city: 'Istanbul', country: 'Türkiye', mult: 0.8, growth: 0.08, listings: [['Kadıköy', 'apartment'], ['Nişantaşı', 'apartment'], ['Bebek', 'villa'], ['Bosphorus Yalı', 'mansion'], ['Zorlu Center', 'penthouse']] },
  { city: 'Bodrum', country: 'Türkiye', mult: 1.0, growth: 0.07, listings: [['Yalıkavak', 'villa'], ['Türkbükü', 'mansion']] },
  { city: 'Tokyo', country: 'Japan', mult: 1.5, growth: 0.03, listings: [['Setagaya', 'suburban'], ['Shibuya', 'apartment'], ['Roppongi Hills', 'penthouse']] },
  { city: 'Hong Kong', country: 'China', mult: 2.2, growth: 0.02, listings: [['Central', 'penthouse'], ['The Peak', 'mansion']] },
  { city: 'Sydney', country: 'Australia', mult: 1.6, growth: 0.05, listings: [['Bondi', 'apartment'], ['Vaucluse', 'mansion']] },
  { city: 'Rio de Janeiro', country: 'Brazil', mult: 0.6, growth: 0.04, listings: [['Ipanema', 'apartment'], ['Leblon', 'penthouse']] },
  { city: 'Bali', country: 'Indonesia', mult: 0.4, growth: 0.05, listings: [['Canggu', 'villa'], ['Uluwatu', 'villa'], ['Nusa Lembongan', 'island']] },
  { city: 'Bahamas', country: 'Bahamas', mult: 1.2, growth: 0.04, listings: [['Nassau', 'villa'], ['Exuma Cays', 'island']] },
  { city: 'Maldives', country: 'Maldives', mult: 1.5, growth: 0.04, listings: [['North Malé Atoll', 'island']] },
];

const STYLE: Record<HomeStyle, { label: string; base: number; beds: [number, number]; m2: [number, number]; walls: string[]; roofs: string[] }> = {
  apartment: { label: 'Apartment', base: 450_000, beds: [1, 3], m2: [55, 140], walls: ['#e7e5e4', '#d6d3d1', '#fde68a', '#bfdbfe'], roofs: ['#44403c', '#1f2937'] },
  suburban: { label: 'Suburban house', base: 420_000, beds: [3, 5], m2: [140, 260], walls: ['#e5d3b3', '#f8fafc', '#bfdbfe', '#fecaca'], roofs: ['#7c2d12', '#374151', '#1e3a8a'] },
  loft: { label: 'Loft', base: 750_000, beds: [1, 3], m2: [110, 240], walls: ['#9a3412', '#7c2d12', '#57534e'], roofs: ['#1f2937', '#0f172a'] },
  villa: { label: 'Villa', base: 1_900_000, beds: [4, 6], m2: [320, 650], walls: ['#f1f5f9', '#fafaf9', '#e7e5e4'], roofs: ['#334155', '#1f2937', '#78716c'] },
  chalet: { label: 'Chalet', base: 2_600_000, beds: [4, 7], m2: [300, 700], walls: ['#92400e', '#78350f', '#a16207'], roofs: ['#292524', '#44403c'] },
  mansion: { label: 'Mansion', base: 5_500_000, beds: [7, 12], m2: [900, 2200], walls: ['#fef3c7', '#f5f5f4', '#e7e5e4', '#fde68a'], roofs: ['#57534e', '#1f2937', '#7c2d12'] },
  penthouse: { label: 'Penthouse', base: 8_000_000, beds: [3, 6], m2: [400, 1100], walls: ['#1e293b', '#334155', '#0f172a'], roofs: ['#0f172a', '#ca8a04'] },
  castle: { label: 'Castle', base: 12_000_000, beds: [15, 40], m2: [2500, 8000], walls: ['#a8a29e', '#d6d3d1', '#78716c'], roofs: ['#44403c', '#1e3a8a', '#7f1d1d'] },
  island: { label: 'Private island', base: 35_000_000, beds: [6, 14], m2: [20000, 600000], walls: ['#ffffff', '#fef3c7'], roofs: ['#0e7490', '#b45309', '#334155'] },
};

const TAGLINES: Record<HomeStyle, string[]> = {
  apartment: ['Lock up and leave.', 'City living, doorman included.', 'Small footprint, big postcode.'],
  suburban: ['White picket fence. HOA rules apply.', 'Room for a trampoline.', 'Quiet street, nosy neighbours.'],
  loft: ['Exposed brick, exposed bank balance.', 'Ceilings for days.', 'Former factory, current flex.'],
  villa: ['Architects cried when they saw it.', 'Infinity views, infinite envy.', 'Glass walls, no secrets.'],
  chalet: ['Ski-in, champagne-out.', 'Fireplace in every room.', 'Après-ski headquarters.'],
  mansion: ['Columns. Lots of columns.', 'The staff have staff.', 'Has a wing. Possibly two.'],
  penthouse: ['Look down on everyone. Literally.', 'The top floor of the top floor.', 'Private elevator to your ego.'],
  castle: ['Comes with a moat and a ghost.', 'Heating bills: medieval.', 'Every room is a throne room.'],
  island: ['Extradition treaties? Never heard of them.', 'Your own postcode. Your own rules.', 'Bring your own helicopter.'],
};

function between(h: number, [a, b]: [number, number]) {
  return a + (h % (b - a + 1));
}

function buildHomes(): ShopItem[] {
  const out: ShopItem[] = [];
  for (const c of CITIES) {
    for (const [hood, style] of c.listings) {
      const s = STYLE[style];
      const h = hash(c.city + hood + style);
      const vary = 0.8 + ((h >>> 3) % 41) / 100; // 0.80 – 1.20
      const price = Math.round((s.base * c.mult * vary) / 5000) * 5000;
      const beds = between(h >>> 5, s.beds);
      const m2 = Math.round(between(h >>> 9, s.m2) / 10) * 10;
      const area = style === 'island' ? `${(m2 / 10000).toFixed(1)} ha` : `${m2.toLocaleString('en-US')} m²`;
      out.push({
        id: `home-${slug(c.city, s.label, hood)}`,
        category: 'homes',
        brand: `${hood}, ${c.city}`,
        model: `${s.label} in ${hood}`,
        price,
        tagline: TAGLINES[style][h % TAGLINES[style].length],
        art: { kind: 'home', style, wall: s.walls[h % s.walls.length], roof: s.roofs[(h >>> 2) % s.roofs.length] },
        specs: [
          [style === 'castle' ? 'Rooms' : 'Bedrooms', String(beds)],
          [style === 'island' ? 'Land' : 'Living area', area],
          ['City', c.city],
          ['Country', c.country],
          ['Market growth', `${Math.round(c.growth * 100)}% / yr`],
        ],
        appreciation: c.growth,
        upkeepPerDay: Math.round(price * 0.00012),
        reputation: reputationFor(price),
        residence: true,
        facets: { country: c.country, city: c.city, type: s.label },
        stats: { size: m2 },
        summary: `${beds} ${style === 'castle' ? 'rooms' : 'bd'} · ${area} · ${c.city}`,
      });
    }
  }
  return out;
}

export const HOMES = buildHomes();
