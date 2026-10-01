import type { ArtSpec, ShopItem } from '../shopItems';
import { hash, reputationFor, slug } from './util';

type Kind = 'yacht' | 'jet' | 'heli';
/** [brand, model, kind, size class, price in $M, length/size metric, seats/guests, range km or speed knots] */
type Row = [string, string, Kind, string, number, number, number, number];

const ROWS: Row[] = [
  // Yachts: size metric = length (m), seats = guests, last = top speed (knots)
  ['Sea-Doo', 'RXP-X 325', 'yacht', 'small', 0.02, 3.4, 3, 67],
  ['Boston Whaler', '380 Outrage', 'yacht', 'small', 0.9, 11.6, 10, 50],
  ['Sea Ray', 'Sundancer 370', 'yacht', 'small', 0.6, 11.5, 6, 37],
  ['Riva', 'Iseo 27', 'yacht', 'small', 0.6, 8.3, 8, 40],
  ['Sunseeker', 'Predator 55', 'yacht', 'mid', 2.5, 17, 8, 36],
  ['Princess', 'V65', 'yacht', 'mid', 3.6, 20, 8, 39],
  ['Riva', '76 Perseo Super', 'yacht', 'mid', 6, 23, 8, 40],
  ['Sunseeker', '76 Yacht', 'yacht', 'mid', 5, 23, 8, 30],
  ['Azimut', 'Grande 27M', 'yacht', 'mid', 9, 27, 10, 27],
  ['Princess', 'X95', 'yacht', 'super', 11, 29, 10, 22],
  ['Ferretti', 'Custom Line Navetta 50', 'yacht', 'super', 18, 50, 12, 16],
  ['Benetti', 'Oasis 40M', 'yacht', 'super', 20, 41, 10, 16],
  ['Heesen', '50m Steel', 'yacht', 'super', 40, 50, 12, 17],
  ['Feadship', '70m Custom', 'yacht', 'super', 100, 70, 12, 17],
  ['Lürssen', '90m Custom', 'yacht', 'mega', 200, 90, 16, 18],
  ['Oceanco', '109m Custom', 'yacht', 'mega', 300, 109, 18, 19],
  ['Lürssen', '180m Gigayacht', 'yacht', 'mega', 600, 180, 36, 31],
  // Jets: size = cabin length (m), seats, last = range (km)
  ['Cirrus', 'Vision Jet G2+', 'jet', 'light', 3.3, 3.5, 5, 2300],
  ['HondaJet', 'Elite II', 'jet', 'light', 7, 5.4, 6, 2660],
  ['Embraer', 'Phenom 300E', 'jet', 'light', 10.5, 5.2, 9, 3720],
  ['Cessna', 'Citation CJ4 Gen2', 'jet', 'light', 11, 5.3, 9, 4010],
  ['Cessna', 'Citation Latitude', 'jet', 'mid', 18, 6.6, 9, 5000],
  ['Embraer', 'Praetor 600', 'jet', 'mid', 21, 7.4, 12, 7440],
  ['Bombardier', 'Challenger 3500', 'jet', 'mid', 27, 7.7, 10, 6300],
  ['Gulfstream', 'G500', 'jet', 'large', 45, 12.6, 19, 9800],
  ['Dassault', 'Falcon 6X', 'jet', 'large', 47, 12.3, 16, 10200],
  ['Gulfstream', 'G650ER', 'jet', 'large', 70, 14, 19, 13900],
  ['Bombardier', 'Global 7500', 'jet', 'large', 75, 16.6, 19, 14260],
  ['Gulfstream', 'G700', 'jet', 'large', 78, 17.4, 19, 13890],
  ['Bombardier', 'Global 8000', 'jet', 'large', 78, 16.6, 19, 14800],
  ['Boeing', 'BBJ 737 MAX 8', 'jet', 'airliner', 100, 31, 50, 11500],
  ['Airbus', 'ACJ320neo', 'jet', 'airliner', 110, 27.5, 40, 11100],
  ['Boeing', 'BBJ 787-9', 'jet', 'airliner', 250, 54, 100, 17000],
  ['Airbus', 'ACJ350-1000', 'jet', 'airliner', 330, 58, 120, 18000],
  // Helicopters: size = length (m), seats, last = range (km)
  ['Robinson', 'R44 Raven II', 'heli', 'light', 0.55, 11.7, 4, 560],
  ['Robinson', 'R66 Turbine', 'heli', 'light', 1.3, 11.8, 5, 600],
  ['Bell', '505 Jet Ranger X', 'heli', 'light', 1.5, 12.9, 5, 560],
  ['Airbus', 'H125', 'heli', 'light', 3.5, 12.9, 6, 630],
  ['Leonardo', 'AW109 Trekker', 'heli', 'twin', 7, 12.9, 7, 830],
  ['Bell', '429', 'heli', 'twin', 8, 12.7, 7, 760],
  ['Airbus', 'H145', 'heli', 'twin', 10, 13.6, 9, 650],
  ['Sikorsky', 'S-76D', 'heli', 'twin', 13, 16, 12, 830],
  ['Leonardo', 'AW139', 'heli', 'twin', 15, 16.7, 15, 1060],
  ['Airbus', 'ACH160', 'heli', 'twin', 17, 15.7, 10, 850],
];

const KIND_LABEL: Record<Kind, string> = { yacht: 'Yacht', jet: 'Private jet', heli: 'Helicopter' };
const CLASS_LABEL: Record<string, string> = {
  'yacht-small': 'Day boat', 'yacht-mid': 'Motor yacht', 'yacht-super': 'Superyacht', 'yacht-mega': 'Megayacht',
  'jet-light': 'Light jet', 'jet-mid': 'Midsize jet', 'jet-large': 'Long-range jet', 'jet-airliner': 'VIP airliner',
  'heli-light': 'Single-engine', 'heli-twin': 'Twin-engine',
};
const HULLS = ['#f8fafc', '#0f172a', '#1e3a8a', '#e5e7eb', '#334155'];
const LIVERIES = ['#b45309', '#1e3a8a', '#0f172a', '#7f1d1d', '#065f46', '#6b21a8'];
const TAGLINES: Record<Kind, string[]> = {
  yacht: ['Has a smaller boat inside it.', 'Monaco Grand Prix parking spot not included.', 'Fuel bill: yes.', 'Weekend boat. Weekday regret.'],
  jet: ['Commercial is for poor people.', 'Wheels up whenever you feel like it.', 'Your own airport lounge, at 45,000 ft.'],
  heli: ['Skip traffic. Skip the neighbours’ sleep.', 'Rooftop to runway in minutes.', 'The commute, solved.'],
};

function buildLuxury(): ShopItem[] {
  return ROWS.map(([brand, model, kind, size, priceM, metric, seats, perf]) => {
    const price = Math.round(priceM * 1_000_000);
    const h = hash(brand + model);
    const art: ArtSpec =
      kind === 'yacht'
        ? { kind: 'yacht', size: size as 'small' | 'mid' | 'super' | 'mega', hull: HULLS[h % HULLS.length] }
        : kind === 'jet'
          ? { kind: 'jet', size: size as 'light' | 'mid' | 'large' | 'airliner', livery: LIVERIES[h % LIVERIES.length] }
          : { kind: 'heli', size: size as 'light' | 'twin', livery: LIVERIES[(h >>> 3) % LIVERIES.length] };
    const cls = CLASS_LABEL[`${kind}-${size}`];
    const specs: [string, string][] =
      kind === 'yacht'
        ? [['Length', `${metric} m`], ['Guests', String(seats)], ['Top speed', `${perf} knots`], ['Class', cls]]
        : [[kind === 'jet' ? 'Cabin length' : 'Length', `${metric} m`], ['Seats', String(seats)], ['Range', `${perf.toLocaleString('en-US')} km`], ['Class', cls]];
    return {
      id: `lux-${slug(brand, model)}`,
      category: 'luxury',
      brand,
      model,
      price,
      tagline: TAGLINES[kind][h % TAGLINES[kind].length],
      art,
      specs,
      appreciation: kind === 'yacht' ? -0.08 : kind === 'jet' ? -0.06 : -0.07,
      upkeepPerDay: Math.round(price * (kind === 'yacht' ? 0.00028 : 0.00025)),
      reputation: reputationFor(price),
      facets: { type: KIND_LABEL[kind], brand, class: cls },
      stats: { size: metric },
      summary: kind === 'yacht' ? `${metric} m · ${seats} guests · ${perf} kn` : `${seats} seats · ${perf.toLocaleString('en-US')} km range`,
    };
  });
}

export const LUXURY = buildLuxury();
