import type { ShopItem, WatchStyle } from '../shopItems';
import { hash, reputationFor, slug } from './util';

type Material = 'steel' | 'gold' | 'rose' | 'plat' | 'ti' | 'ceramic' | 'resin' | 'carbon';
type Movement = 'Automatic' | 'Manual' | 'Quartz' | 'Solar' | 'Spring Drive' | 'Tourbillon' | 'Smart';
/** [model, style, price in $K, material, dial colour, movement, case mm, bezel colours?] */
type Row = [string, WatchStyle, number, Material, string, Movement, number, [string, string]?];

interface Maker {
  brand: string;
  country: string;
  /** Yearly value change for this brand's pieces. */
  appreciation: number;
  models: Row[];
}

const BLACK = '#0b0b0b';
const WHITE = '#f5f5f4';
const BLUE = '#1e3a8a';
const GREEN = '#14532d';
const SILVER = '#d4d4d8';
const ICE = '#cfe8f3';
const CHAMPAGNE = '#e7d7a8';
const SALMON = '#f3b7a0';
const BROWN = '#5b3a1e';

const MAKERS: Maker[] = [
  { brand: 'Rolex', country: 'Switzerland', appreciation: 0.07, models: [
    ['Oyster Perpetual 41', 'classic', 6.4, 'steel', '#0d9488', 'Automatic', 41],
    ['Explorer 40', 'classic', 7.7, 'steel', BLACK, 'Automatic', 40],
    ['Datejust 41', 'classic', 9.5, 'steel', BLUE, 'Automatic', 41],
    ['Submariner Date', 'diver', 10.6, 'steel', BLACK, 'Automatic', 41, [BLACK, BLACK]],
    ['Submariner "Starbucks"', 'diver', 11.1, 'steel', BLACK, 'Automatic', 41, ['#15803d', '#15803d']],
    ['Explorer II', 'classic', 10.5, 'steel', WHITE, 'Automatic', 42],
    ['GMT-Master II "Pepsi"', 'diver', 11.2, 'steel', BLACK, 'Automatic', 40, ['#1d4ed8', '#b91c1c']],
    ['GMT-Master II "Batman"', 'diver', 11.2, 'steel', BLACK, 'Automatic', 40, ['#1d4ed8', '#0b0b0b']],
    ['Sea-Dweller', 'diver', 13.4, 'steel', BLACK, 'Automatic', 43, [BLACK, BLACK]],
    ['Deepsea', 'diver', 14.6, 'steel', '#1e40af', 'Automatic', 44, [BLACK, BLACK]],
    ['Sky-Dweller', 'classic', 16.5, 'steel', BLUE, 'Automatic', 42],
    ['Daytona', 'chrono', 16, 'steel', WHITE, 'Automatic', 40],
    ['Yacht-Master 40', 'diver', 30, 'rose', BLACK, 'Automatic', 40, ['#1f2937', '#1f2937']],
    ['Day-Date 40', 'classic', 40, 'gold', CHAMPAGNE, 'Automatic', 40],
    ['Daytona Everose Gold', 'gold', 50, 'rose', BLACK, 'Automatic', 40],
    ['Day-Date 40 Platinum', 'classic', 62, 'plat', ICE, 'Automatic', 40],
    ['Daytona Platinum', 'chrono', 80, 'plat', ICE, 'Automatic', 40],
    ['Daytona "Rainbow"', 'diamond', 500, 'rose', BLACK, 'Automatic', 40],
  ] },
  { brand: 'Patek Philippe', country: 'Switzerland', appreciation: 0.06, models: [
    ['Twenty~4', 'square', 15, 'steel', '#334155', 'Quartz', 30],
    ['Aquanaut 5167A', 'dress', 25, 'steel', BLACK, 'Automatic', 40],
    ['Calatrava 5227G', 'classic', 33, 'gold', '#f8fafc', 'Automatic', 39],
    ['Nautilus 5811', 'dress', 75, 'gold', BLUE, 'Automatic', 41],
    ['Perpetual Calendar 5320G', 'classic', 90, 'gold', CHAMPAGNE, 'Automatic', 40],
    ['Nautilus 5711', 'dress', 140, 'steel', '#1e3a5f', 'Automatic', 40],
    ['Grand Complications 5270P', 'chrono', 200, 'plat', SALMON, 'Manual', 41],
    ['Grandmaster Chime 6300A', 'skeleton', 31000, 'steel', SALMON, 'Manual', 47],
  ] },
  { brand: 'Audemars Piguet', country: 'Switzerland', appreciation: 0.05, models: [
    ['Royal Oak 15510ST', 'octagon', 30, 'steel', BLUE, 'Automatic', 41],
    ['Royal Oak Offshore', 'octagon', 35, 'ceramic', BLACK, 'Automatic', 43],
    ['Royal Oak Jumbo Extra-Thin', 'octagon', 35, 'steel', '#1e3a5f', 'Automatic', 39],
    ['Code 11.59', 'classic', 32, 'rose', '#1e1b4b', 'Automatic', 41],
    ['Royal Oak Chronograph', 'octagon', 42, 'steel', ICE, 'Automatic', 41],
    ['Royal Oak Concept Tourbillon', 'skeleton', 300, 'ti', '#111827', 'Tourbillon', 44],
  ] },
  { brand: 'Vacheron Constantin', country: 'Switzerland', appreciation: 0.04, models: [
    ['Patrimony', 'classic', 22, 'rose', SILVER, 'Manual', 40],
    ['Overseas', 'octagon', 25, 'steel', BLUE, 'Automatic', 41],
    ['Traditionnelle Tourbillon', 'skeleton', 150, 'plat', '#cbd5e1', 'Tourbillon', 41],
  ] },
  { brand: 'Richard Mille', country: 'Switzerland', appreciation: 0.05, models: [
    ['RM 35-02 Rafael Nadal', 'skeleton', 180, 'carbon', '#111827', 'Automatic', 44],
    ['RM 011 Felipe Massa', 'skeleton', 190, 'ti', '#1f2937', 'Automatic', 50],
    ['RM 055 Bubba Watson', 'skeleton', 200, 'ceramic', '#f8fafc', 'Manual', 49],
    ['RM 67-02', 'skeleton', 250, 'carbon', '#14532d', 'Automatic', 38],
    ['RM 27-04', 'skeleton', 1200, 'ti', '#0f172a', 'Tourbillon', 47],
  ] },
  { brand: 'Cartier', country: 'France', appreciation: 0.02, models: [
    ['Tank Must', 'square', 3.1, 'steel', WHITE, 'Quartz', 34],
    ['Panthère', 'square', 5.2, 'steel', WHITE, 'Quartz', 27],
    ['Santos-Dumont', 'square', 6.1, 'steel', SILVER, 'Manual', 43],
    ['Ballon Bleu', 'classic', 7, 'steel', SILVER, 'Automatic', 42],
    ['Santos de Cartier', 'square', 7.6, 'steel', '#1e3a8a', 'Automatic', 40],
    ['Tank Louis Cartier', 'square', 12, 'gold', WHITE, 'Manual', 34],
    ['Crash', 'square', 70, 'gold', WHITE, 'Manual', 38],
  ] },
  { brand: 'Omega', country: 'Switzerland', appreciation: -0.02, models: [
    ['Seamaster Diver 300M', 'diver', 5.6, 'steel', BLUE, 'Automatic', 42, [BLUE, BLUE]],
    ['Constellation', 'classic', 6, 'steel', SILVER, 'Automatic', 39],
    ['Aqua Terra', 'classic', 6.5, 'steel', '#0d9488', 'Automatic', 41],
    ['Speedmaster Moonwatch', 'chrono', 7, 'steel', BLACK, 'Manual', 42],
    ['Seamaster Planet Ocean', 'diver', 7, 'steel', BLACK, 'Automatic', 43, ['#ea580c', '#ea580c']],
    ['Speedmaster Dark Side of the Moon', 'chrono', 13, 'ceramic', BLACK, 'Automatic', 44],
    ['Speedmaster Moonshine Gold', 'gold', 35, 'gold', BLACK, 'Manual', 42],
  ] },
  { brand: 'TAG Heuer', country: 'Switzerland', appreciation: -0.06, models: [
    ['Formula 1', 'diver', 1.8, 'steel', BLACK, 'Quartz', 43, ['#b91c1c', '#b91c1c']],
    ['Connected Calibre E4', 'smartround', 2, 'ti', BLACK, 'Smart', 45],
    ['Aquaracer Professional 300', 'diver', 3.4, 'steel', BLUE, 'Automatic', 43, [BLUE, BLUE]],
    ['Carrera Chronograph', 'chrono', 6, 'steel', BLACK, 'Automatic', 42],
    ['Monaco', 'square', 7.5, 'steel', BLUE, 'Automatic', 39],
  ] },
  { brand: 'Breitling', country: 'Switzerland', appreciation: -0.05, models: [
    ['Avenger', 'pilot', 4.5, 'steel', BLACK, 'Automatic', 44],
    ['Superocean', 'diver', 5, 'steel', '#ea580c', 'Automatic', 44, [BLACK, BLACK]],
    ['Premier B01', 'classic', 7.5, 'steel', GREEN, 'Automatic', 42],
    ['Chronomat B01', 'chrono', 8.5, 'steel', BLUE, 'Automatic', 42],
    ['Navitimer B01', 'chrono', 9, 'steel', BLUE, 'Automatic', 43],
  ] },
  { brand: 'IWC', country: 'Switzerland', appreciation: -0.03, models: [
    ['Pilot’s Watch Mark XX', 'pilot', 5.3, 'steel', BLACK, 'Automatic', 40],
    ['Portofino', 'classic', 5, 'steel', SILVER, 'Automatic', 40],
    ['Portugieser Chronograph', 'chrono', 8.5, 'steel', WHITE, 'Automatic', 41],
    ['Ingenieur 40', 'octagon', 12, 'steel', GREEN, 'Automatic', 40],
    ['Big Pilot’s Watch', 'pilot', 13, 'steel', BLACK, 'Automatic', 46],
  ] },
  { brand: 'Panerai', country: 'Italy', appreciation: -0.04, models: [
    ['Radiomir', 'classic', 7, 'steel', BROWN, 'Manual', 45],
    ['Luminor Marina', 'diver', 8, 'steel', BLACK, 'Automatic', 44, [SILVER, SILVER]],
    ['Submersible', 'diver', 11, 'ti', BLUE, 'Automatic', 44, [BLUE, BLUE]],
  ] },
  { brand: 'Hublot', country: 'Switzerland', appreciation: -0.08, models: [
    ['Classic Fusion', 'octagon', 9, 'ti', BLACK, 'Automatic', 42],
    ['Big Bang Unico', 'octagon', 22, 'ceramic', BLACK, 'Automatic', 44],
    ['Spirit of Big Bang', 'square', 25, 'ti', '#111827', 'Automatic', 42],
    ['Big Bang Full Diamonds', 'diamond', 120, 'gold', BLACK, 'Automatic', 44],
  ] },
  { brand: 'Tudor', country: 'Switzerland', appreciation: 0.0, models: [
    ['Royal', 'classic', 2.7, 'steel', SILVER, 'Automatic', 41],
    ['Ranger', 'pilot', 3.3, 'steel', BLACK, 'Automatic', 39],
    ['Black Bay 58', 'diver', 4.1, 'steel', BLACK, 'Automatic', 39, ['#7f1d1d', '#7f1d1d']],
    ['Pelagos', 'diver', 5, 'ti', BLUE, 'Automatic', 42, [BLUE, BLUE]],
    ['Black Bay Chrono', 'chrono', 5.5, 'steel', WHITE, 'Automatic', 41],
  ] },
  { brand: 'Seiko', country: 'Japan', appreciation: -0.04, models: [
    ['5 Sports', 'diver', 0.3, 'steel', BLACK, 'Automatic', 42, [BLACK, BLACK]],
    ['Presage Cocktail Time', 'classic', 0.45, 'steel', '#0e7490', 'Automatic', 40],
    ['Prospex Turtle', 'diver', 0.5, 'steel', BLUE, 'Automatic', 44, [BLUE, BLUE]],
    ['Prospex Alpinist', 'pilot', 0.75, 'steel', GREEN, 'Automatic', 39],
    ['Astron GPS Solar', 'pilot', 2, 'ti', BLACK, 'Solar', 43],
  ] },
  { brand: 'Grand Seiko', country: 'Japan', appreciation: 0.0, models: [
    ['Snowflake SBGA211', 'classic', 6.2, 'ti', '#f1f5f9', 'Spring Drive', 41],
    ['Spring Drive Diver', 'diver', 7, 'ti', BLACK, 'Spring Drive', 44, [BLACK, BLACK]],
    ['White Birch SLGH005', 'classic', 9.5, 'steel', '#f8fafc', 'Automatic', 40],
  ] },
  { brand: 'Casio', country: 'Japan', appreciation: 0.0, models: [
    ['F-91W', 'digital', 0.02, 'resin', '#a3b18a', 'Quartz', 35],
    ['A168 Gold', 'digital', 0.04, 'gold', '#a3b18a', 'Quartz', 36],
    ['G-Shock DW-5600', 'digital', 0.06, 'resin', '#9ca39a', 'Quartz', 43],
    ['G-Shock GA-2100 "CasiOak"', 'octagon', 0.1, 'resin', BLACK, 'Quartz', 45],
    ['Edifice Chronograph', 'chrono', 0.2, 'steel', BLUE, 'Quartz', 45],
    ['G-Shock Mudmaster', 'digital', 0.4, 'carbon', '#9ca39a', 'Solar', 53],
    ['G-Shock MR-G', 'octagon', 3.5, 'ti', BLACK, 'Solar', 49],
  ] },
  { brand: 'Citizen', country: 'Japan', appreciation: -0.05, models: [
    ['Eco-Drive Classic', 'classic', 0.2, 'steel', WHITE, 'Solar', 40],
    ['Promaster Diver', 'diver', 0.3, 'steel', BLACK, 'Solar', 44, [BLACK, BLACK]],
    ['Tsuyosa', 'classic', 0.45, 'steel', '#facc15', 'Automatic', 40],
  ] },
  { brand: 'Tissot', country: 'Switzerland', appreciation: -0.05, models: [
    ['PRX Powermatic 80', 'octagon', 0.7, 'steel', BLUE, 'Automatic', 40],
    ['Chrono XL', 'chrono', 0.45, 'steel', BLACK, 'Quartz', 45],
    ['Le Locle', 'classic', 0.65, 'steel', WHITE, 'Automatic', 39],
    ['Seastar 1000', 'diver', 0.75, 'steel', BLUE, 'Automatic', 43, [BLUE, BLUE]],
  ] },
  { brand: 'Longines', country: 'Switzerland', appreciation: -0.04, models: [
    ['HydroConquest', 'diver', 1.8, 'steel', GREEN, 'Automatic', 41, [GREEN, GREEN]],
    ['Master Collection', 'classic', 2.5, 'steel', SILVER, 'Automatic', 40],
    ['Spirit Zulu Time', 'pilot', 3.2, 'steel', BLACK, 'Automatic', 42],
    ['Legend Diver', 'diver', 3, 'steel', BLACK, 'Automatic', 42, [BLACK, BLACK]],
  ] },
  { brand: 'Hamilton', country: 'Switzerland', appreciation: -0.05, models: [
    ['Khaki Field Mechanical', 'pilot', 0.5, 'steel', '#3f3f1f', 'Manual', 38],
    ['Jazzmaster', 'classic', 0.9, 'steel', BLUE, 'Automatic', 40],
    ['Ventura', 'square', 1, 'steel', BLACK, 'Quartz', 32],
  ] },
  { brand: 'Jaeger-LeCoultre', country: 'Switzerland', appreciation: 0.01, models: [
    ['Reverso Classic', 'square', 7, 'steel', SILVER, 'Manual', 30],
    ['Master Ultra Thin', 'classic', 9, 'steel', SILVER, 'Automatic', 39],
    ['Polaris Date', 'diver', 9.5, 'steel', BLUE, 'Automatic', 42, [BLACK, BLACK]],
  ] },
  { brand: 'A. Lange & Söhne', country: 'Germany', appreciation: 0.04, models: [
    ['Odysseus', 'octagon', 35, 'steel', BLUE, 'Automatic', 40],
    ['Lange 1', 'classic', 40, 'gold', SILVER, 'Manual', 39],
    ['Datograph Up/Down', 'chrono', 100, 'plat', BLACK, 'Manual', 41],
  ] },
  { brand: 'Zenith', country: 'Switzerland', appreciation: -0.02, models: [
    ['Defy Skyline', 'octagon', 8, 'steel', BLUE, 'Automatic', 41],
    ['Chronomaster Sport', 'chrono', 11, 'steel', WHITE, 'Automatic', 41],
    ['Defy Extreme', 'skeleton', 20, 'ti', '#111827', 'Automatic', 45],
  ] },
  { brand: 'Blancpain', country: 'Switzerland', appreciation: 0.0, models: [
    ['Villeret Ultraplate', 'classic', 12, 'steel', WHITE, 'Automatic', 40],
    ['Fifty Fathoms', 'diver', 16, 'ti', BLACK, 'Automatic', 45, [BLACK, BLACK]],
  ] },
  { brand: 'Breguet', country: 'Switzerland', appreciation: 0.01, models: [
    ['Type XX', 'chrono', 17, 'steel', BLACK, 'Automatic', 42],
    ['Classique 7137', 'classic', 25, 'gold', SILVER, 'Automatic', 39],
    ['Tradition Tourbillon', 'skeleton', 120, 'plat', '#cbd5e1', 'Tourbillon', 41],
  ] },
  { brand: 'Chopard', country: 'Switzerland', appreciation: -0.02, models: [
    ['Happy Sport', 'diamond', 8, 'steel', WHITE, 'Automatic', 36],
    ['Alpine Eagle', 'octagon', 14, 'steel', BLUE, 'Automatic', 41],
  ] },
  { brand: 'Bulgari', country: 'Italy', appreciation: 0.0, models: [
    ['Serpenti Seduttori', 'diamond', 10, 'rose', '#f8fafc', 'Quartz', 33],
    ['Octo Finissimo', 'octagon', 15, 'ti', '#9ca3af', 'Automatic', 40],
  ] },
  { brand: 'Jacob & Co', country: 'United States', appreciation: 0.01, models: [
    ['Epic X', 'skeleton', 25, 'ti', '#111827', 'Manual', 44],
    ['Bugatti Chiron Tourbillon', 'skeleton', 280, 'ti', '#1e3a8a', 'Tourbillon', 52],
    ['Astronomia Sky', 'skeleton', 600, 'rose', '#0c4a6e', 'Tourbillon', 47],
    ['Billionaire Timeless Treasure', 'diamond', 20000, 'gold', '#fde68a', 'Tourbillon', 51],
  ] },
  { brand: 'Swatch', country: 'Switzerland', appreciation: -0.1, models: [
    ['Gent Originals', 'classic', 0.08, 'resin', WHITE, 'Quartz', 34],
    ['MoonSwatch Mission to Mars', 'chrono', 0.27, 'ceramic', BLACK, 'Quartz', 42],
  ] },
  { brand: 'Timex', country: 'United States', appreciation: -0.1, models: [
    ['Weekender', 'pilot', 0.05, 'steel', WHITE, 'Quartz', 38],
    ['Marlin Automatic', 'classic', 0.25, 'steel', SILVER, 'Automatic', 40],
  ] },
  { brand: 'Apple', country: 'United States', appreciation: -0.35, models: [
    ['Watch SE', 'smart', 0.25, 'steel', BLACK, 'Smart', 44],
    ['Watch Series 10', 'smart', 0.4, 'steel', BLACK, 'Smart', 46],
    ['Watch Ultra 2', 'smart', 0.8, 'ti', BLACK, 'Smart', 49],
    ['Watch Hermès Series 10', 'smart', 1.3, 'ti', BLACK, 'Smart', 46],
  ] },
  { brand: 'Garmin', country: 'United States', appreciation: -0.3, models: [
    ['Forerunner 965', 'smartround', 0.6, 'ti', BLACK, 'Smart', 47],
    ['Fenix 8', 'smartround', 1, 'ti', BLACK, 'Smart', 51],
  ] },
  { brand: 'Samsung', country: 'South Korea', appreciation: -0.4, models: [
    ['Galaxy Watch Ultra', 'smartround', 0.65, 'ti', BLACK, 'Smart', 47],
  ] },
];

const STYLE_LABEL: Record<WatchStyle, string> = {
  digital: 'Digital', diver: 'Diver', dress: 'Integrated bracelet', classic: 'Dress', chrono: 'Chronograph', gold: 'Chronograph',
  skeleton: 'Skeleton', diamond: 'Jewellery', pilot: 'Pilot', square: 'Rectangular', smart: 'Smartwatch', smartround: 'Smartwatch', octagon: 'Integrated bracelet',
};
const MATERIAL_LABEL: Record<Material, string> = {
  steel: 'Steel', gold: 'Yellow gold', rose: 'Rose gold', plat: 'Platinum', ti: 'Titanium', ceramic: 'Ceramic', resin: 'Resin', carbon: 'Carbon',
};
const MATERIAL_COLOR: Record<Material, string> = {
  steel: '#d1d5db', gold: '#d4a017', rose: '#d8957a', plat: '#e5e7eb', ti: '#9ca3af', ceramic: '#27272a', resin: '#18181b', carbon: '#3f3f46',
};
const WATER: Record<WatchStyle, string> = {
  digital: '50 m', diver: '300 m', dress: '120 m', classic: '50 m', chrono: '100 m', gold: '100 m', skeleton: '50 m', diamond: '30 m',
  pilot: '100 m', square: '30 m', smart: '50 m', smartround: '100 m', octagon: '100 m',
};

function strapFor(style: WatchStyle, material: Material): string {
  if (style === 'smart' || style === 'smartround' || style === 'digital' || material === 'resin' || material === 'carbon') return material === 'gold' ? 'gold' : 'rubber';
  if (style === 'classic' || style === 'pilot' || style === 'square') return 'leather';
  if (material === 'gold' || material === 'rose') return 'gold';
  if (style === 'skeleton') return 'rubber';
  return 'steel';
}

const TAGLINES = [
  'Tells time. Mostly tells everyone else how rich you are.',
  'An heirloom you will absolutely flip in two years.',
  'Wrist presence: maximum.',
  'The watch-forum favourite.',
  'Understated, until someone notices.',
  'For boardrooms and yacht decks alike.',
  'Engineering you can wear.',
  'Quiet luxury, loudly.',
];

function buildWatches(): ShopItem[] {
  const out: ShopItem[] = [];
  for (const mk of MAKERS) {
    for (const [model, style, priceK, material, dial, movement, size, bezel] of mk.models) {
      const price = Math.round(priceK * 1000);
      const h = hash(mk.brand + model);
      out.push({
        id: `watch-${slug(mk.brand, model)}`,
        category: 'watches',
        brand: mk.brand,
        model,
        price,
        tagline: TAGLINES[h % TAGLINES.length],
        art: { kind: 'watch', style, metal: MATERIAL_COLOR[material], dial, strap: strapFor(style, material), label: mk.brand, bezel },
        specs: [
          ['Movement', movement],
          ['Case', `${size} mm`],
          ['Material', MATERIAL_LABEL[material]],
          ['Water resistance', WATER[style]],
          ['Style', STYLE_LABEL[style]],
          ['Origin', mk.country],
        ],
        appreciation: mk.appreciation,
        upkeepPerDay: Math.round(price * 0.00004),
        reputation: reputationFor(price * 1.5),
        facets: { brand: mk.brand, style: STYLE_LABEL[style], movement, material: MATERIAL_LABEL[material], origin: mk.country },
        stats: { size },
        summary: `${movement} · ${size} mm · ${MATERIAL_LABEL[material]}`,
      });
    }
  }
  return out;
}

export const WATCHES = buildWatches();
