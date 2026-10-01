import type { SectorId } from '../types';

export interface Company {
  ticker: string;
  name: string;
  sector: SectorId;
  price: number; // starting price
  shares: number; // millions of shares outstanding
  vol: number; // annualised volatility
  ceo: string;
  blurb: string;
  product: string; // used by news templates
}

// All companies are fictional. Any resemblance is satire.
export const COMPANIES: Company[] = [
  // Technology
  { ticker: 'NOVA', name: 'Novatek Systems', sector: 'tech', price: 312, shares: 2400, vol: 0.32, ceo: 'Elena Marsh', blurb: 'Consumer devices and the NovaPhone.', product: 'NovaPhone 9' },
  { ticker: 'QBIT', name: 'Qubitron', sector: 'tech', price: 48, shares: 800, vol: 0.7, ceo: 'Raj Venkatesan', blurb: 'Quantum computing moonshot. Has never turned a profit.', product: 'QX-1 quantum chip' },
  { ticker: 'SKYN', name: 'Skynex Cloud', sector: 'tech', price: 184, shares: 1600, vol: 0.36, ceo: 'Marcus Oyelaran', blurb: 'Cloud infrastructure and AI assistants.', product: 'SkyMind AI' },
  { ticker: 'PXL', name: 'Pixelforge Games', sector: 'tech', price: 76, shares: 600, vol: 0.45, ceo: 'Hana Kobayashi', blurb: 'Blockbuster video game studio.', product: 'Galactic Outlaws 4' },
  { ticker: 'HALO', name: 'Halo Semiconductors', sector: 'tech', price: 422, shares: 1100, vol: 0.42, ceo: 'Victor Lindqvist', blurb: 'Chips for everything with a battery.', product: 'H9 GPU' },
  // Finance
  { ticker: 'GSB', name: 'Goldstein Brothers', sector: 'finance', price: 389, shares: 340, vol: 0.27, ceo: 'Lloyd Pemberton', blurb: 'Investment bank. Does God\'s work, allegedly.', product: 'trading desk' },
  { ticker: 'FNB', name: 'First Nimbus Bank', sector: 'finance', price: 52, shares: 4100, vol: 0.24, ceo: 'Margaret Ellis', blurb: 'Retail bank with too many branches.', product: 'mortgage book' },
  { ticker: 'ARGO', name: 'Argo Capital', sector: 'finance', price: 128, shares: 520, vol: 0.33, ceo: 'Dmitri Volkov', blurb: 'Hedge fund manager that went public.', product: 'flagship fund' },
  { ticker: 'VLT', name: 'Vault Insurance', sector: 'finance', price: 94, shares: 900, vol: 0.2, ceo: 'Sandra Whitfield', blurb: 'Insures everything except your feelings.', product: 'hurricane policies' },
  { ticker: 'CRDX', name: 'Credix Payments', sector: 'finance', price: 215, shares: 1300, vol: 0.34, ceo: 'Tomás Rivera', blurb: 'Card network taking 3% of everything.', product: 'Credix Tap' },
  // Energy
  { ticker: 'PTRX', name: 'Petrex Oil', sector: 'energy', price: 108, shares: 4200, vol: 0.28, ceo: 'Hank Dawson', blurb: 'Big oil. Very big. Extremely oily.', product: 'Gulf platform' },
  { ticker: 'SOLR', name: 'Solaris Energy', sector: 'energy', price: 64, shares: 700, vol: 0.5, ceo: 'Amara Nwosu', blurb: 'Solar farms and grid batteries.', product: 'SunGrid battery' },
  { ticker: 'GRDX', name: 'GridX Utilities', sector: 'energy', price: 71, shares: 1800, vol: 0.16, ceo: 'Peter Holm', blurb: 'Boring, regulated, pays dividends.', product: 'power grid' },
  { ticker: 'BRNT', name: 'Brent & Sons Drilling', sector: 'energy', price: 23, shares: 900, vol: 0.55, ceo: 'Jake Brent III', blurb: 'Third-generation wildcatters.', product: 'shale wells' },
  { ticker: 'NUKE', name: 'Atomia Nuclear', sector: 'energy', price: 39, shares: 450, vol: 0.48, ceo: 'Irina Sokolova', blurb: 'Small modular reactors. Glows a little.', product: 'MiniCore reactor' },
  // Healthcare
  { ticker: 'MEDX', name: 'Medexa Pharma', sector: 'health', price: 156, shares: 2100, vol: 0.25, ceo: 'Dr. Paul Hartmann', blurb: 'Blockbuster drugs and patent lawyers.', product: 'Slimzepa weight-loss drug' },
  { ticker: 'GENO', name: 'Genomix Bio', sector: 'health', price: 31, shares: 380, vol: 0.75, ceo: 'Dr. Lucia Ferreira', blurb: 'Gene therapy biotech burning cash.', product: 'GX-12 gene therapy' },
  { ticker: 'CURA', name: 'Curalife Hospitals', sector: 'health', price: 88, shares: 760, vol: 0.22, ceo: 'Robert Kane', blurb: 'Hospital chain. Parking costs extra.', product: 'hospital network' },
  { ticker: 'VAXN', name: 'Vaxion Labs', sector: 'health', price: 57, shares: 520, vol: 0.52, ceo: 'Dr. Mei Chen', blurb: 'Vaccines and pandemic-preparedness.', product: 'universal flu vaccine' },
  { ticker: 'OPTI', name: 'Optimed Devices', sector: 'health', price: 133, shares: 410, vol: 0.3, ceo: 'Gregor Novak', blurb: 'Surgical robots and smart pacemakers.', product: 'RoboSurgeon 3' },
  // Consumer
  { ticker: 'BRGR', name: 'Burger Baron', sector: 'consumer', price: 142, shares: 1200, vol: 0.2, ceo: 'Chuck Malone', blurb: 'Fast food empire. Billions served, some twice.', product: 'Triple Baron burger' },
  { ticker: 'LUXE', name: 'Maison Luxe', sector: 'consumer', price: 690, shares: 500, vol: 0.27, ceo: 'Céline Arnaud', blurb: 'Handbags that cost more than cars.', product: 'Monogram handbag' },
  { ticker: 'FIZZ', name: 'Fizzco Beverages', sector: 'consumer', price: 61, shares: 4300, vol: 0.16, ceo: 'Diane Porter', blurb: 'Sugary drinks, globally.', product: 'Fizzco Zero' },
  { ticker: 'MART', name: 'MegaMart', sector: 'consumer', price: 168, shares: 2700, vol: 0.19, ceo: 'Walter Simms', blurb: 'Big-box retail and same-day delivery.', product: 'MegaMart Prime' },
  { ticker: 'STYL', name: 'Stylo Apparel', sector: 'consumer', price: 44, shares: 650, vol: 0.38, ceo: 'Bianca Russo', blurb: 'Fast fashion, faster lawsuits.', product: 'summer collection' },
  // Industrials
  { ticker: 'TITN', name: 'Titan Heavy Industries', sector: 'industrial', price: 247, shares: 980, vol: 0.26, ceo: 'Gunther Krause', blurb: 'Excavators, cranes and defense contracts.', product: 'Colossus excavator' },
  { ticker: 'AERO', name: 'Aerodyne Aviation', sector: 'industrial', price: 198, shares: 600, vol: 0.31, ceo: 'Claire Dubois', blurb: 'Jets, helicopters and the occasional door plug.', product: 'A900 airliner' },
  { ticker: 'RAIL', name: 'TransRail', sector: 'industrial', price: 117, shares: 870, vol: 0.21, ceo: 'Frank Morrison', blurb: 'Freight trains across the continent.', product: 'freight network' },
  { ticker: 'STEL', name: 'Steelcore', sector: 'industrial', price: 36, shares: 1500, vol: 0.37, ceo: 'Ivan Petrov', blurb: 'Steel mills and tariff lobbying.', product: 'steel output' },
  { ticker: 'BLDR', name: 'Bildr Construction', sector: 'industrial', price: 82, shares: 540, vol: 0.33, ceo: 'Tony Castellano', blurb: 'Builds towers. Some of them on time.', product: 'Skyline Tower project' },
  // Automotive
  { ticker: 'FERV', name: 'Ferrova Motors', sector: 'auto', price: 345, shares: 190, vol: 0.29, ceo: 'Luca Bellini', blurb: 'Italian supercars. Loud, red, expensive.', product: 'Rosso GT' },
  { ticker: 'VOLT', name: 'Voltara EV', sector: 'auto', price: 211, shares: 3100, vol: 0.62, ceo: 'Xavier Stone', blurb: 'Electric cars and an extremely online CEO.', product: 'Model V' },
  { ticker: 'BVRX', name: 'Bavarix Auto', sector: 'auto', price: 97, shares: 640, vol: 0.27, ceo: 'Klaus Richter', blurb: 'German engineering, German prices.', product: 'M5X sedan' },
  { ticker: 'TRKR', name: 'Trekker Trucks', sector: 'auto', price: 58, shares: 1400, vol: 0.3, ceo: 'Bill Hargrove', blurb: 'Pickups for people who never haul anything.', product: 'Ranger pickup' },
  { ticker: 'RIDE', name: 'Ridely', sector: 'auto', price: 41, shares: 2000, vol: 0.55, ceo: 'Kevin Tran', blurb: 'Ride-hailing and robotaxis. Mostly losses.', product: 'robotaxi fleet' },
  // Media
  { ticker: 'BUZZ', name: 'BuzzWire Media', sector: 'media', price: 18, shares: 900, vol: 0.6, ceo: 'Tiffany Lane', blurb: 'Clickbait at industrial scale.', product: 'BuzzWire app' },
  { ticker: 'STRM', name: 'Streamly', sector: 'media', price: 402, shares: 430, vol: 0.38, ceo: 'Jordan Hayes', blurb: 'Streaming service with 4,000 shows you never watch.', product: 'Streamly Originals' },
  { ticker: 'CHRP', name: 'Chirpr Social', sector: 'media', price: 27, shares: 1800, vol: 0.58, ceo: 'Max Sterling', blurb: 'Social network. Mostly arguments.', product: 'Chirpr feed' },
  { ticker: 'ECHO', name: 'Echo Records', sector: 'media', price: 66, shares: 350, vol: 0.34, ceo: 'Dee Washington', blurb: 'Record label owning half of all pop music.', product: 'superstar catalogue' },
  { ticker: 'LEDG', name: 'Daily Ledger Corp', sector: 'media', price: 29, shares: 260, vol: 0.29, ceo: 'Arthur Bloom', blurb: 'Publisher of the Daily Ledger newspaper.', product: 'Daily Ledger' },
];

export const COMPANY_BY_TICKER: Record<string, Company> = Object.fromEntries(COMPANIES.map((c) => [c.ticker, c]));
