import type { CarBody, ShopItem } from '../shopItems';
import { hash, reputationFor, slug } from './util';

type Fuel = 'P' | 'H' | 'E' | 'D';
type Tier = 'budget' | 'mainstream' | 'premium' | 'luxury' | 'exotic' | 'hyper';
/** [model, body, price in $K, hp, 0-100 km/h (s), top speed (km/h), fuel, paint override?] */
type Row = [string, CarBody, number, number, number, number, Fuel, string?];

interface Make {
  brand: string;
  country: string;
  tier: Tier;
  colors: string[];
  models: Row[];
}

const MAKES: Make[] = [
  // ---------------- Japan ----------------
  { brand: 'Toyota', country: 'Japan', tier: 'mainstream', colors: ['#f8fafc', '#b91c1c', '#9ca3af', '#1e3a8a'], models: [
    ['Yaris', 'hatch', 18, 120, 9.7, 175, 'H'],
    ['Corolla', 'sedan', 23, 169, 8.9, 180, 'P'],
    ['Corolla Hatchback', 'hatch', 24, 169, 8.4, 180, 'P'],
    ['Prius', 'hatch', 28, 196, 7.2, 180, 'H'],
    ['Camry', 'sedan', 28, 225, 7.6, 210, 'H'],
    ['RAV4', 'crossover', 30, 219, 8.1, 180, 'H'],
    ['GR86', 'coupe', 30, 228, 6.3, 226, 'P', '#dc2626'],
    ['Tacoma', 'pickup', 32, 278, 7.4, 180, 'P'],
    ['Hilux', 'pickup', 35, 201, 10.0, 175, 'D'],
    ['GR Supra', 'coupe', 47, 382, 4.1, 250, 'P', '#facc15'],
    ['Land Cruiser', 'suv', 58, 326, 6.7, 180, 'H'],
    ['Century', 'limo', 190, 425, 6.0, 200, 'H', '#0b0b0b'],
  ] },
  { brand: 'Honda', country: 'Japan', tier: 'mainstream', colors: ['#f8fafc', '#1d4ed8', '#7f1d1d', '#374151'], models: [
    ['Jazz', 'hatch', 20, 121, 9.4, 175, 'H'],
    ['Civic', 'sedan', 25, 158, 8.2, 200, 'P'],
    ['Accord', 'sedan', 28, 204, 7.6, 210, 'H'],
    ['CR-V', 'crossover', 30, 190, 8.3, 190, 'H'],
    ['Civic Type R', 'hatch', 45, 315, 5.4, 275, 'P', '#f8fafc'],
    ['NSX Type S', 'super', 170, 600, 2.9, 307, 'H', '#ea580c'],
  ] },
  { brand: 'Nissan', country: 'Japan', tier: 'mainstream', colors: ['#f8fafc', '#9ca3af', '#b91c1c', '#0f172a'], models: [
    ['Micra', 'hatch', 17, 92, 12.1, 170, 'P'],
    ['Leaf', 'hatch', 29, 147, 7.9, 150, 'E'],
    ['Altima', 'sedan', 27, 188, 7.7, 210, 'P'],
    ['Qashqai', 'crossover', 30, 158, 9.2, 200, 'H'],
    ['Navara', 'pickup', 34, 187, 10.8, 175, 'D'],
    ['Z', 'coupe', 42, 400, 4.5, 250, 'P', '#facc15'],
    ['Patrol', 'suv', 52, 400, 6.6, 210, 'P'],
    ['GT-R Nismo', 'coupe', 220, 600, 2.7, 315, 'P', '#e5e7eb'],
  ] },
  { brand: 'Mazda', country: 'Japan', tier: 'mainstream', colors: ['#991b1b', '#e5e7eb', '#374151', '#1e3a8a'], models: [
    ['Mazda3', 'hatch', 24, 191, 7.9, 210, 'P'],
    ['MX-5 Miata', 'convertible', 29, 181, 5.7, 220, 'P', '#991b1b'],
    ['CX-5', 'crossover', 28, 187, 8.8, 200, 'P'],
    ['CX-90', 'suv', 40, 340, 6.3, 210, 'H'],
  ] },
  { brand: 'Subaru', country: 'Japan', tier: 'mainstream', colors: ['#1e40af', '#e5e7eb', '#166534', '#374151'], models: [
    ['Impreza', 'hatch', 23, 152, 9.6, 190, 'P'],
    ['WRX', 'sedan', 33, 271, 5.5, 240, 'P', '#1e40af'],
    ['Outback', 'wagon', 30, 182, 8.7, 200, 'P'],
    ['Forester', 'crossover', 28, 180, 9.0, 190, 'P'],
  ] },
  { brand: 'Lexus', country: 'Japan', tier: 'premium', colors: ['#e5e7eb', '#0f172a', '#7f1d1d', '#94a3b8'], models: [
    ['IS 350', 'sedan', 42, 311, 5.6, 230, 'P'],
    ['ES 300h', 'sedan', 44, 215, 8.1, 180, 'H'],
    ['RX 500h', 'crossover', 50, 366, 6.0, 210, 'H'],
    ['LX 600', 'suv', 95, 409, 6.9, 210, 'P'],
    ['LS 500', 'limo', 80, 416, 4.8, 250, 'P'],
    ['LC 500', 'coupe', 100, 471, 4.4, 270, 'P', '#ca8a04'],
    ['LFA', 'super', 900, 553, 3.6, 325, 'P', '#f8fafc'],
  ] },
  // ---------------- Korea ----------------
  { brand: 'Hyundai', country: 'South Korea', tier: 'mainstream', colors: ['#e5e7eb', '#1e3a8a', '#9ca3af', '#0f766e'], models: [
    ['i20', 'hatch', 18, 99, 11.2, 185, 'P'],
    ['Elantra', 'sedan', 22, 147, 9.3, 200, 'P'],
    ['Tucson', 'crossover', 29, 187, 8.7, 200, 'H'],
    ['Santa Fe', 'suv', 34, 277, 7.0, 210, 'H'],
    ['Ioniq 5', 'crossover', 43, 320, 5.1, 185, 'E'],
    ['Ioniq 5 N', 'crossover', 67, 641, 3.5, 260, 'E', '#38bdf8'],
  ] },
  { brand: 'Kia', country: 'South Korea', tier: 'mainstream', colors: ['#e5e7eb', '#374151', '#7f1d1d', '#065f46'], models: [
    ['Picanto', 'hatch', 15, 84, 13.8, 170, 'P'],
    ['Ceed Sportswagon', 'wagon', 25, 158, 9.4, 205, 'P'],
    ['Sportage', 'crossover', 28, 227, 8.0, 200, 'H'],
    ['EV6', 'crossover', 43, 320, 5.1, 185, 'E'],
    ['EV9', 'suv', 56, 379, 5.3, 200, 'E'],
    ['Stinger GT', 'sedan', 50, 368, 4.7, 270, 'P', '#b91c1c'],
  ] },
  { brand: 'Genesis', country: 'South Korea', tier: 'premium', colors: ['#0f172a', '#e5e7eb', '#064e3b'], models: [
    ['G70', 'sedan', 42, 300, 5.6, 240, 'P'],
    ['G80', 'sedan', 55, 375, 5.1, 250, 'P'],
    ['GV80', 'suv', 60, 375, 5.5, 240, 'P'],
  ] },
  // ---------------- Germany ----------------
  { brand: 'Volkswagen', country: 'Germany', tier: 'mainstream', colors: ['#e5e7eb', '#1e3a8a', '#9ca3af', '#111827'], models: [
    ['Golf Mk5 2008 (used)', 'hatch', 6.5, 102, 11.3, 185, 'P', '#9ca3af'],
    ['Polo', 'hatch', 20, 95, 10.8, 187, 'P'],
    ['Golf', 'hatch', 26, 148, 8.5, 224, 'P'],
    ['Golf GTI', 'hatch', 33, 241, 6.2, 250, 'P', '#dc2626'],
    ['Golf R', 'hatch', 46, 315, 4.7, 270, 'P', '#1e3a8a'],
    ['ID.4', 'crossover', 40, 282, 6.7, 180, 'E'],
    ['Tiguan', 'crossover', 30, 184, 8.1, 210, 'P'],
    ['Passat Variant', 'wagon', 36, 201, 7.8, 230, 'D'],
    ['Arteon', 'sedan', 45, 296, 5.6, 250, 'P'],
    ['Touareg', 'suv', 60, 335, 5.9, 250, 'P'],
    ['Amarok', 'pickup', 45, 238, 7.9, 190, 'D'],
  ] },
  { brand: 'BMW', country: 'Germany', tier: 'premium', colors: ['#0f172a', '#f8fafc', '#1e40af', '#9ca3af', '#3f6212'], models: [
    ['3 Series E90 2007 (used)', 'sedan', 9, 218, 7.1, 245, 'P', '#0f172a'],
    ['1 Series', 'hatch', 35, 178, 7.9, 230, 'P'],
    ['3 Series', 'sedan', 45, 255, 5.6, 250, 'P'],
    ['M2', 'coupe', 63, 453, 4.1, 285, 'P', '#38bdf8'],
    ['Z4 M40i', 'convertible', 54, 382, 4.5, 250, 'P', '#2563eb'],
    ['i4 M50', 'sedan', 70, 536, 3.9, 225, 'E'],
    ['5 Series', 'sedan', 58, 335, 4.9, 250, 'P'],
    ['M3 Competition', 'sedan', 80, 503, 3.5, 290, 'P', '#65a30d'],
    ['M4 Competition', 'coupe', 82, 523, 3.4, 290, 'P', '#f97316'],
    ['M4 Convertible', 'convertible', 92, 523, 3.7, 280, 'P'],
    ['X3', 'crossover', 49, 255, 6.2, 230, 'P'],
    ['iX', 'crossover', 87, 516, 4.6, 200, 'E'],
    ['X5', 'suv', 66, 375, 5.3, 250, 'P'],
    ['X7', 'suv', 80, 375, 5.8, 250, 'P'],
    ['7 Series', 'limo', 95, 375, 5.2, 250, 'P'],
    ['i7', 'limo', 106, 536, 4.5, 240, 'E'],
    ['M5', 'sedan', 120, 717, 3.5, 305, 'H', '#0f172a'],
    ['X5 M Competition', 'suv', 125, 617, 3.8, 290, 'P'],
    ['XM Label', 'suv', 185, 738, 3.8, 290, 'H', '#7c2d12'],
  ] },
  { brand: 'Mercedes-Benz', country: 'Germany', tier: 'premium', colors: ['#0f172a', '#f8fafc', '#9ca3af', '#475569'], models: [
    ['C-Class W204 2009 (used)', 'sedan', 11, 204, 7.8, 237, 'P', '#9ca3af'],
    ['A-Class', 'hatch', 36, 188, 7.3, 240, 'P'],
    ['C-Class', 'sedan', 47, 255, 6.0, 250, 'P'],
    ['GLC', 'crossover', 48, 255, 6.2, 240, 'P'],
    ['E-Class', 'sedan', 60, 375, 4.9, 250, 'H'],
    ['E-Class Estate', 'wagon', 68, 375, 5.1, 250, 'H'],
    ['GLE', 'suv', 62, 375, 5.3, 250, 'H'],
    ['GLS', 'suv', 88, 375, 5.9, 250, 'P'],
    ['EQS', 'sedan', 105, 516, 4.1, 210, 'E'],
    ['S-Class', 'limo', 115, 429, 4.9, 250, 'P'],
    ['G 550', 'suv', 145, 443, 5.6, 210, 'P'],
  ] },
  { brand: 'Mercedes-AMG', country: 'Germany', tier: 'luxury', colors: ['#0f172a', '#e5e7eb', '#facc15', '#334155'], models: [
    ['C 63 S E Performance', 'sedan', 85, 671, 3.4, 280, 'H'],
    ['GT 63 Coupe', 'coupe', 175, 577, 3.2, 315, 'P', '#facc15'],
    ['SL 63', 'convertible', 180, 577, 3.6, 315, 'P', '#b91c1c'],
    ['G 63', 'suv', 180, 577, 4.5, 240, 'P', '#111827'],
    ['ONE', 'super', 2700, 1063, 2.9, 352, 'H', '#0f172a'],
  ] },
  { brand: 'Mercedes-Maybach', country: 'Germany', tier: 'luxury', colors: ['#1e1b4b', '#e5e7eb', '#0f172a'], models: [
    ['S 680', 'limo', 230, 621, 4.5, 250, 'P', '#1e1b4b'],
    ['GLS 600', 'suv', 175, 550, 4.9, 250, 'P'],
  ] },
  { brand: 'Audi', country: 'Germany', tier: 'premium', colors: ['#e5e7eb', '#111827', '#9ca3af', '#1e3a8a', '#065f46'], models: [
    ['A3 Sportback', 'hatch', 36, 201, 6.8, 240, 'P'],
    ['A4', 'sedan', 42, 261, 5.6, 250, 'P'],
    ['Q3', 'crossover', 38, 228, 7.0, 220, 'P'],
    ['Q5', 'crossover', 46, 261, 5.9, 237, 'P'],
    ['A6 Avant', 'wagon', 60, 335, 5.1, 250, 'P'],
    ['Q7', 'suv', 60, 335, 5.6, 250, 'P'],
    ['Q8', 'suv', 75, 335, 5.6, 250, 'P'],
    ['A8 L', 'limo', 90, 335, 5.6, 250, 'P'],
    ['TT RS', 'coupe', 75, 394, 3.6, 280, 'P', '#facc15'],
    ['e-tron GT', 'sedan', 106, 523, 4.1, 245, 'E'],
    ['RS 6 Avant', 'wagon', 125, 621, 3.4, 305, 'P', '#6b7280'],
    ['RS Q8', 'suv', 125, 631, 3.6, 305, 'P'],
    ['RS e-tron GT', 'sedan', 145, 912, 2.5, 250, 'E', '#1e3a8a'],
    ['R8 V10 Performance', 'sports', 160, 602, 3.1, 331, 'P', '#16a34a'],
  ] },
  { brand: 'Porsche', country: 'Germany', tier: 'luxury', colors: ['#facc15', '#f8fafc', '#0f172a', '#9ca3af', '#dc2626', '#16a34a'], models: [
    ['Macan', 'crossover', 65, 375, 4.8, 260, 'P'],
    ['718 Cayman', 'coupe', 70, 300, 4.9, 275, 'P'],
    ['718 Boxster', 'convertible', 72, 300, 5.1, 275, 'P'],
    ['Cayenne', 'suv', 85, 348, 5.9, 248, 'P'],
    ['Taycan', 'sedan', 95, 402, 5.4, 230, 'E'],
    ['Panamera', 'sedan', 105, 348, 5.1, 272, 'P'],
    ['911 Carrera', 'sports', 115, 388, 4.1, 294, 'P'],
    ['718 Cayman GT4 RS', 'coupe', 160, 493, 3.4, 315, 'P', '#f97316'],
    ['Cayenne Turbo GT', 'suv', 200, 650, 3.3, 305, 'P'],
    ['Taycan Turbo S', 'sedan', 210, 938, 2.4, 260, 'E'],
    ['911 Turbo S', 'sports', 230, 640, 2.7, 330, 'P', '#9ca3af'],
    ['911 GT3 RS', 'sports', 240, 518, 3.2, 296, 'P', '#16a34a'],
    ['918 Spyder', 'super', 1600, 887, 2.6, 345, 'H', '#e5e7eb'],
  ] },
  // ---------------- Europe (rest) ----------------
  { brand: 'Skoda', country: 'Czechia', tier: 'mainstream', colors: ['#065f46', '#e5e7eb', '#1e3a8a'], models: [
    ['Fabia', 'hatch', 19, 95, 10.6, 195, 'P'],
    ['Octavia Combi', 'wagon', 28, 148, 8.9, 225, 'D'],
    ['Superb', 'sedan', 38, 201, 7.4, 245, 'P'],
    ['Kodiaq', 'suv', 40, 201, 7.8, 220, 'P'],
  ] },
  { brand: 'Cupra', country: 'Spain', tier: 'mainstream', colors: ['#78716c', '#0f172a', '#e5e7eb'], models: [
    ['Born', 'hatch', 38, 228, 6.6, 160, 'E'],
    ['Formentor VZ5', 'crossover', 55, 385, 4.2, 250, 'P'],
  ] },
  { brand: 'Dacia', country: 'Romania', tier: 'budget', colors: ['#e5e7eb', '#9ca3af', '#c2410c', '#065f46'], models: [
    ['Sandero', 'hatch', 13, 90, 12.2, 175, 'P'],
    ['Jogger', 'wagon', 19, 110, 11.2, 183, 'P'],
    ['Duster', 'crossover', 20, 130, 10.5, 180, 'P'],
  ] },
  { brand: 'Renault', country: 'France', tier: 'mainstream', colors: ['#facc15', '#e5e7eb', '#1e3a8a', '#b91c1c'], models: [
    ['Clio', 'hatch', 19, 90, 12.2, 180, 'P'],
    ['Megane E-Tech', 'hatch', 38, 218, 7.4, 160, 'E'],
    ['Captur', 'crossover', 25, 140, 9.6, 190, 'H'],
    ['Austral', 'crossover', 35, 200, 8.4, 175, 'H'],
  ] },
  { brand: 'Alpine', country: 'France', tier: 'premium', colors: ['#1d4ed8', '#e5e7eb', '#0f172a'], models: [
    ['A110', 'coupe', 70, 300, 4.2, 275, 'P', '#1d4ed8'],
    ['A290', 'hatch', 40, 220, 6.4, 170, 'E'],
  ] },
  { brand: 'Peugeot', country: 'France', tier: 'mainstream', colors: ['#e5e7eb', '#1e40af', '#111827', '#9ca3af'], models: [
    ['208', 'hatch', 21, 100, 10.2, 188, 'P'],
    ['308', 'hatch', 28, 130, 9.7, 210, 'P'],
    ['508 SW', 'wagon', 42, 225, 8.1, 240, 'H'],
    ['3008', 'crossover', 34, 136, 10.0, 200, 'H'],
  ] },
  { brand: 'Citroën', country: 'France', tier: 'mainstream', colors: ['#e5e7eb', '#f97316', '#334155'], models: [
    ['C3', 'hatch', 18, 83, 13.9, 170, 'P'],
    ['C5 Aircross', 'crossover', 32, 130, 10.4, 200, 'H'],
  ] },
  { brand: 'Fiat', country: 'Italy', tier: 'budget', colors: ['#f8fafc', '#b91c1c', '#38bdf8', '#facc15'], models: [
    ['Punto 2007 (used)', 'hatch', 3, 77, 13.2, 165, 'P', '#9ca3af'],
    ['Panda', 'hatch', 15, 69, 14.7, 164, 'P'],
    ['500', 'hatch', 18, 69, 12.9, 167, 'P'],
    ['500e', 'hatch', 30, 118, 9.0, 150, 'E'],
    ['Tipo', 'sedan', 20, 100, 11.1, 190, 'P'],
  ] },
  { brand: 'Abarth', country: 'Italy', tier: 'mainstream', colors: ['#b91c1c', '#f8fafc', '#111827'], models: [
    ['695', 'hatch', 28, 180, 6.7, 225, 'P'],
  ] },
  { brand: 'Alfa Romeo', country: 'Italy', tier: 'premium', colors: ['#b91c1c', '#e5e7eb', '#0f172a', '#065f46'], models: [
    ['Tonale', 'crossover', 42, 268, 6.0, 206, 'H'],
    ['Giulia', 'sedan', 45, 280, 5.2, 240, 'P'],
    ['Stelvio', 'crossover', 50, 280, 5.7, 230, 'P'],
    ['Giulia Quadrifoglio', 'sedan', 82, 505, 3.8, 307, 'P', '#b91c1c'],
    ['33 Stradale', 'super', 2000, 620, 3.0, 333, 'P', '#991b1b'],
  ] },
  { brand: 'Maserati', country: 'Italy', tier: 'luxury', colors: ['#1e3a8a', '#f8fafc', '#0f172a', '#7f1d1d'], models: [
    ['Grecale', 'crossover', 70, 296, 5.6, 240, 'H'],
    ['Ghibli', 'sedan', 80, 345, 5.5, 255, 'P'],
    ['Levante', 'suv', 90, 345, 5.2, 264, 'P'],
    ['Quattroporte', 'limo', 110, 424, 4.8, 288, 'P'],
    ['GranTurismo Trofeo', 'coupe', 175, 542, 3.5, 320, 'P'],
    ['MC20', 'super', 240, 621, 2.9, 325, 'P', '#1e40af'],
  ] },
  { brand: 'Ferrari', country: 'Italy', tier: 'exotic', colors: ['#dc2626', '#dc2626', '#facc15', '#0f172a', '#f8fafc'], models: [
    ['Roma', 'coupe', 250, 612, 3.4, 320, 'P'],
    ['Roma Spider', 'convertible', 280, 612, 3.4, 320, 'P'],
    ['F8 Tributo', 'super', 280, 710, 2.9, 340, 'P'],
    ['296 GTB', 'sports', 330, 819, 2.9, 330, 'H'],
    ['296 GTS', 'convertible', 360, 819, 2.9, 330, 'H'],
    ['Purosangue', 'suv', 400, 715, 3.3, 310, 'P', '#7f1d1d'],
    ['12Cilindri', 'coupe', 420, 819, 2.9, 340, 'P'],
    ['SF90 Stradale', 'super', 525, 986, 2.5, 340, 'H'],
    ['812 Competizione', 'super', 600, 819, 2.85, 340, 'P'],
    ['Daytona SP3', 'super', 2300, 829, 2.85, 340, 'P'],
    ['F40', 'super', 2800, 471, 4.1, 324, 'P'],
    ['LaFerrari', 'super', 4000, 950, 2.4, 350, 'H'],
  ] },
  { brand: 'Lamborghini', country: 'Italy', tier: 'exotic', colors: ['#65a30d', '#f97316', '#facc15', '#7c3aed', '#0f172a'], models: [
    ['Urus S', 'suv', 240, 657, 3.5, 305, 'P'],
    ['Huracán Tecnica', 'super', 240, 631, 3.2, 325, 'P'],
    ['Urus Performante', 'suv', 270, 657, 3.3, 306, 'P'],
    ['Huracán Sterrato', 'super', 280, 602, 3.4, 260, 'P'],
    ['Huracán STO', 'super', 330, 631, 3.0, 310, 'P'],
    ['Aventador SVJ', 'super', 520, 759, 2.8, 350, 'P'],
    ['Revuelto', 'super', 610, 1001, 2.5, 350, 'H'],
    ['Countach LPI 800-4', 'super', 3000, 803, 2.8, 355, 'H', '#f8fafc'],
  ] },
  { brand: 'Pagani', country: 'Italy', tier: 'hyper', colors: ['#0c4a6e', '#334155', '#f8fafc'], models: [
    ['Utopia', 'super', 2500, 852, 2.8, 350, 'P'],
    ['Huayra', 'super', 3000, 791, 2.8, 383, 'P'],
    ['Zonda R', 'super', 6000, 739, 2.7, 350, 'P'],
  ] },
  { brand: 'Volvo', country: 'Sweden', tier: 'premium', colors: ['#e5e7eb', '#1e3a8a', '#374151', '#64748b'], models: [
    ['EX30', 'crossover', 36, 422, 3.6, 180, 'E'],
    ['XC40', 'crossover', 40, 247, 6.2, 180, 'P'],
    ['V60', 'wagon', 48, 247, 6.4, 180, 'P'],
    ['XC60', 'crossover', 48, 247, 6.4, 180, 'H'],
    ['S90', 'sedan', 58, 455, 4.6, 180, 'H'],
    ['XC90', 'suv', 58, 455, 5.3, 180, 'H'],
  ] },
  { brand: 'Polestar', country: 'Sweden', tier: 'premium', colors: ['#e5e7eb', '#0f172a', '#facc15'], models: [
    ['Polestar 2', 'sedan', 50, 421, 4.2, 205, 'E'],
    ['Polestar 3', 'suv', 74, 517, 4.7, 210, 'E'],
  ] },
  { brand: 'Koenigsegg', country: 'Sweden', tier: 'hyper', colors: ['#f8fafc', '#f97316', '#0f172a', '#facc15'], models: [
    ['Gemera', 'super', 1700, 1700, 1.9, 400, 'H'],
    ['Regera', 'super', 2500, 1500, 2.8, 410, 'H'],
    ['Jesko', 'super', 3000, 1600, 2.5, 480, 'P'],
    ['CC850', 'super', 3650, 1385, 2.6, 450, 'P'],
  ] },
  { brand: 'Rimac', country: 'Croatia', tier: 'hyper', colors: ['#1e3a8a', '#0f172a', '#e5e7eb'], models: [
    ['Nevera', 'super', 2200, 1914, 1.85, 412, 'E'],
  ] },
  // ---------------- UK ----------------
  { brand: 'Mini', country: 'United Kingdom', tier: 'mainstream', colors: ['#14532d', '#b91c1c', '#e5e7eb', '#0f172a'], models: [
    ['Cooper', 'hatch', 30, 201, 6.6, 242, 'P'],
    ['John Cooper Works', 'hatch', 40, 228, 6.1, 250, 'P', '#b91c1c'],
    ['Countryman', 'crossover', 40, 241, 6.4, 225, 'P'],
  ] },
  { brand: 'Jaguar', country: 'United Kingdom', tier: 'premium', colors: ['#14532d', '#0f172a', '#e5e7eb', '#7f1d1d'], models: [
    ['XF', 'sedan', 50, 247, 6.5, 240, 'P'],
    ['F-Pace', 'crossover', 58, 395, 5.1, 250, 'H'],
    ['F-Type R', 'coupe', 80, 575, 3.5, 300, 'P', '#14532d'],
  ] },
  { brand: 'Land Rover', country: 'United Kingdom', tier: 'luxury', colors: ['#14532d', '#e5e7eb', '#0f172a', '#78716c'], models: [
    ['Range Rover Evoque', 'crossover', 50, 247, 7.6, 230, 'P'],
    ['Defender 110', 'suv', 60, 296, 7.0, 191, 'P', '#78716c'],
    ['Range Rover Velar', 'crossover', 63, 247, 7.5, 217, 'P'],
    ['Range Rover Sport', 'suv', 85, 395, 5.7, 242, 'H'],
    ['Range Rover', 'suv', 110, 523, 4.4, 250, 'P'],
    ['Defender Octa', 'suv', 155, 626, 4.0, 250, 'P', '#57534e'],
  ] },
  { brand: 'Lotus', country: 'United Kingdom', tier: 'luxury', colors: ['#facc15', '#14532d', '#f8fafc', '#0f172a'], models: [
    ['Emira', 'coupe', 100, 400, 4.3, 290, 'P'],
    ['Eletre', 'suv', 110, 603, 4.5, 258, 'E'],
    ['Evija', 'super', 2100, 1973, 2.0, 350, 'E'],
  ] },
  { brand: 'McLaren', country: 'United Kingdom', tier: 'exotic', colors: ['#f97316', '#f8fafc', '#0f172a', '#0ea5e9'], models: [
    ['GTS', 'coupe', 210, 626, 3.2, 326, 'P'],
    ['Artura', 'sports', 240, 671, 3.0, 330, 'H'],
    ['750S', 'super', 330, 740, 2.8, 332, 'P'],
    ['765LT', 'super', 380, 755, 2.8, 330, 'P'],
    ['Senna', 'super', 1500, 789, 2.8, 335, 'P'],
    ['P1', 'super', 1600, 903, 2.8, 350, 'H'],
    ['Speedtail', 'super', 2500, 1035, 2.9, 403, 'H'],
  ] },
  { brand: 'Aston Martin', country: 'United Kingdom', tier: 'exotic', colors: ['#14532d', '#9ca3af', '#0f172a', '#e5e7eb'], models: [
    ['Vantage', 'sports', 190, 656, 3.5, 325, 'P'],
    ['DBX707', 'suv', 240, 697, 3.3, 310, 'P'],
    ['DB12', 'coupe', 245, 671, 3.6, 325, 'P'],
    ['Vanquish', 'coupe', 430, 824, 3.3, 345, 'P'],
    ['Valkyrie', 'super', 3500, 1139, 2.5, 350, 'H'],
  ] },
  { brand: 'Bentley', country: 'United Kingdom', tier: 'luxury', colors: ['#0f172a', '#14532d', '#e5e7eb', '#7f1d1d'], models: [
    ['Bentayga', 'suv', 200, 542, 4.4, 290, 'P'],
    ['Flying Spur', 'limo', 230, 771, 3.5, 285, 'H'],
    ['Continental GT', 'coupe', 240, 771, 3.2, 335, 'H'],
    ['Continental GTC', 'convertible', 270, 771, 3.4, 335, 'H'],
    ['Bacalar', 'convertible', 2000, 650, 3.5, 320, 'P', '#ca8a04'],
  ] },
  { brand: 'Rolls-Royce', country: 'United Kingdom', tier: 'luxury', colors: ['#0f172a', '#f8fafc', '#312e81', '#7f1d1d'], models: [
    ['Ghost', 'limo', 350, 563, 4.8, 250, 'P'],
    ['Dawn', 'convertible', 360, 563, 4.9, 250, 'P'],
    ['Cullinan', 'suv', 390, 563, 5.2, 250, 'P'],
    ['Spectre', 'coupe', 420, 577, 4.5, 250, 'E'],
    ['Phantom', 'limo', 480, 563, 5.3, 250, 'P'],
  ] },
  // ---------------- USA ----------------
  { brand: 'Ford', country: 'United States', tier: 'mainstream', colors: ['#1e3a8a', '#e5e7eb', '#b91c1c', '#111827', '#ea580c'], models: [
    ['Fiesta 2010 (used)', 'hatch', 4, 82, 13.3, 168, 'P', '#b91c1c'],
    ['Focus', 'hatch', 24, 155, 8.9, 210, 'P'],
    ['Bronco', 'suv', 40, 300, 6.8, 180, 'P', '#ea580c'],
    ['Explorer', 'suv', 40, 300, 6.5, 210, 'P'],
    ['F-150', 'pickup', 38, 400, 6.1, 180, 'P'],
    ['Mustang GT', 'coupe', 43, 480, 4.3, 250, 'P', '#b91c1c'],
    ['Mustang GT Convertible', 'convertible', 50, 480, 4.6, 250, 'P'],
    ['Mustang Mach-E', 'crossover', 45, 480, 3.7, 200, 'E'],
    ['F-150 Lightning', 'pickup', 55, 580, 4.0, 180, 'E'],
    ['F-150 Raptor R', 'pickup', 110, 720, 4.0, 180, 'P', '#f97316'],
    ['GT', 'super', 1000, 660, 3.0, 348, 'P', '#1e3a8a'],
  ] },
  { brand: 'Chevrolet', country: 'United States', tier: 'mainstream', colors: ['#e5e7eb', '#b91c1c', '#111827', '#facc15'], models: [
    ['Malibu', 'sedan', 26, 160, 8.0, 210, 'P'],
    ['Silverado', 'pickup', 40, 355, 6.6, 180, 'P'],
    ['Tahoe', 'suv', 58, 355, 6.8, 180, 'P'],
    ['Suburban', 'suv', 62, 355, 7.0, 180, 'P'],
    ['Camaro ZL1', 'coupe', 72, 650, 3.5, 318, 'P', '#facc15'],
    ['Corvette Stingray', 'sports', 68, 495, 2.9, 312, 'P', '#b91c1c'],
    ['Corvette Z06', 'sports', 112, 670, 2.6, 312, 'P', '#f8fafc'],
    ['Corvette ZR1', 'sports', 175, 1064, 2.3, 375, 'P', '#0f172a'],
  ] },
  { brand: 'Dodge', country: 'United States', tier: 'mainstream', colors: ['#111827', '#b91c1c', '#65a30d', '#7c3aed'], models: [
    ['Charger', 'sedan', 40, 300, 6.1, 230, 'P'],
    ['Durango SRT', 'suv', 70, 475, 4.4, 290, 'P'],
    ['Challenger SRT Hellcat', 'coupe', 72, 717, 3.6, 320, 'P', '#65a30d'],
  ] },
  { brand: 'Ram', country: 'United States', tier: 'mainstream', colors: ['#111827', '#e5e7eb', '#7f1d1d'], models: [
    ['1500', 'pickup', 42, 395, 6.4, 180, 'P'],
    ['1500 TRX', 'pickup', 95, 702, 3.7, 190, 'P'],
  ] },
  { brand: 'Jeep', country: 'United States', tier: 'mainstream', colors: ['#14532d', '#e5e7eb', '#facc15', '#0f172a'], models: [
    ['Compass', 'crossover', 30, 200, 8.3, 200, 'P'],
    ['Wrangler', 'suv', 35, 270, 7.0, 180, 'P'],
    ['Grand Cherokee', 'suv', 45, 293, 7.2, 200, 'P'],
  ] },
  { brand: 'GMC', country: 'United States', tier: 'premium', colors: ['#111827', '#e5e7eb', '#78716c'], models: [
    ['Sierra Denali', 'pickup', 70, 420, 5.9, 180, 'P'],
    ['Hummer EV', 'pickup', 98, 1000, 3.0, 170, 'E', '#e5e7eb'],
  ] },
  { brand: 'Cadillac', country: 'United States', tier: 'premium', colors: ['#0f172a', '#e5e7eb', '#7f1d1d'], models: [
    ['Lyriq', 'crossover', 60, 500, 4.9, 200, 'E'],
    ['Escalade', 'suv', 85, 420, 6.1, 210, 'P'],
    ['CT5-V Blackwing', 'sedan', 95, 668, 3.7, 320, 'P', '#1e40af'],
  ] },
  { brand: 'Lincoln', country: 'United States', tier: 'premium', colors: ['#0f172a', '#e5e7eb'], models: [
    ['Navigator', 'suv', 90, 440, 6.0, 200, 'P'],
  ] },
  { brand: 'Tesla', country: 'United States', tier: 'premium', colors: ['#f8fafc', '#b91c1c', '#0f172a', '#9ca3af', '#1d4ed8'], models: [
    ['Model 3', 'sedan', 40, 283, 5.8, 201, 'E'],
    ['Model Y', 'crossover', 45, 384, 5.0, 217, 'E'],
    ['Model 3 Performance', 'sedan', 55, 510, 3.1, 262, 'E'],
    ['Model X Plaid', 'suv', 95, 1020, 2.6, 262, 'E'],
    ['Model S Plaid', 'sedan', 90, 1020, 2.1, 322, 'E'],
    ['Cybertruck', 'pickup', 80, 600, 4.1, 180, 'E', '#9ca3af'],
  ] },
  { brand: 'Rivian', country: 'United States', tier: 'premium', colors: ['#14532d', '#e5e7eb', '#1e3a8a'], models: [
    ['R1T', 'pickup', 70, 600, 3.5, 177, 'E'],
    ['R1S', 'suv', 76, 600, 3.5, 177, 'E'],
  ] },
  { brand: 'Lucid', country: 'United States', tier: 'luxury', colors: ['#e5e7eb', '#0f172a', '#ca8a04'], models: [
    ['Air', 'sedan', 70, 430, 4.0, 200, 'E'],
    ['Gravity', 'suv', 95, 828, 3.4, 250, 'E'],
    ['Air Sapphire', 'sedan', 250, 1234, 1.9, 330, 'E', '#1e3a8a'],
  ] },
  { brand: 'Hennessey', country: 'United States', tier: 'hyper', colors: ['#f97316', '#0f172a'], models: [
    ['Venom F5', 'super', 2100, 1817, 2.6, 437, 'P'],
  ] },
  // ---------------- France: Bugatti ----------------
  { brand: 'Bugatti', country: 'France', tier: 'hyper', colors: ['#1e3a8a', '#0f172a', '#e5e7eb', '#0c4a6e'], models: [
    ['Veyron 16.4 (used)', 'super', 1800, 1001, 2.5, 407, 'P'],
    ['Chiron', 'super', 3300, 1479, 2.4, 420, 'P'],
    ['Chiron Super Sport', 'super', 3900, 1578, 2.4, 440, 'P'],
    ['Tourbillon', 'super', 4100, 1800, 2.0, 445, 'H'],
    ['Mistral', 'convertible', 5000, 1578, 2.5, 420, 'P'],
    ['Divo', 'super', 5800, 1479, 2.4, 380, 'P'],
  ] },
];

const BODY_LABEL: Record<CarBody, string> = {
  hatch: 'Hatchback', sedan: 'Sedan', coupe: 'Coupé', wagon: 'Wagon', crossover: 'Crossover', suv: 'SUV',
  convertible: 'Convertible', sports: 'Sports car', super: 'Supercar', pickup: 'Pickup', limo: 'Limousine',
};
const FUEL_LABEL: Record<Fuel, string> = { P: 'Petrol', H: 'Hybrid', E: 'Electric', D: 'Diesel' };
const TIER_DEPRECIATION: Record<Tier, number> = { budget: -0.16, mainstream: -0.14, premium: -0.15, luxury: -0.12, exotic: -0.05, hyper: 0.03 };

const TAGLINES: Record<CarBody, string[]> = {
  hatch: ['Parks anywhere. Impresses no one.', 'A sensible little runabout.', 'Small car, big ambitions.'],
  sedan: ['Four doors, zero drama.', 'The grown-up choice.', 'Business class on wheels.'],
  coupe: ['Two doors, one ego.', 'Sleek, sporty and slightly impractical.', 'For people who rarely have passengers.'],
  wagon: ['Room for the dog and the golf bags.', 'The thinking person’s performance car.', 'Practical with a secret.'],
  crossover: ['Sits high, drives easy.', 'The car everyone buys.', 'Almost an SUV.'],
  suv: ['Command the road.', 'Built for the school run and the Sahara.', 'Big, tall and unapologetic.'],
  convertible: ['Roof down, prices up.', 'Sunshine not included.', 'Hair: ruined. Mood: excellent.'],
  sports: ['Weekend weapon.', 'Corners like it is on rails.', 'Your midlife crisis, perfected.'],
  super: ['Turns heads, empties wallets.', 'Speed bumps are now your enemy.', 'Pure automotive theatre.'],
  pickup: ['Hauls anything. Mostly groceries.', 'Truck yeah.', 'Tow it, haul it, park it badly.'],
  limo: ['Rear seat is the best seat.', 'Arrive like a head of state.', 'You do not drive it. You are driven.'],
};

/** Track-focused models that come with a rear wing and sport rims. */
const TRACK_CARS = /GT3|GT4|STO|SVJ|Senna|765LT|Performante|Z06|ZR1|Valkyrie|Jesko|Type R|Nismo|Huayra|Zonda|CC850|Venom|Countach|^ONE$|Hellcat|ZL1|WRX|Raptor/;

function buildCars(): ShopItem[] {
  const out: ShopItem[] = [];
  for (const m of MAKES) {
    for (const [model, body, priceK, hp, accel, top, fuel, paint] of m.models) {
      const price = Math.round(priceK * 1000);
      const used = model.includes('(used)');
      const h = hash(m.brand + model);
      const collectible = price >= 1_000_000;
      const appreciation = used ? -0.08 : collectible ? 0.04 + (h % 5) / 100 : TIER_DEPRECIATION[m.tier] + (fuel === 'E' ? -0.04 : 0);
      out.push({
        id: `car-${slug(m.brand, model)}`,
        category: 'cars',
        brand: m.brand,
        model,
        price,
        tagline: TAGLINES[body][h % TAGLINES[body].length],
        art: { kind: 'car', body, paint: paint ?? m.colors[h % m.colors.length], wing: TRACK_CARS.test(model) },
        specs: [
          ['Power', `${hp.toLocaleString('en-US')} hp`],
          ['0–100 km/h', `${accel} s`],
          ['Top speed', `${top} km/h`],
          ['Powertrain', FUEL_LABEL[fuel]],
          ['Body', BODY_LABEL[body]],
          ['Origin', m.country],
        ],
        appreciation,
        upkeepPerDay: Math.round(5 + price * 0.00035),
        reputation: reputationFor(price),
        facets: { brand: m.brand, body: BODY_LABEL[body], fuel: FUEL_LABEL[fuel], origin: m.country, condition: used ? 'Used' : 'New' },
        stats: { power: hp, speed: top, accel },
        summary: `${hp.toLocaleString('en-US')} hp · 0–100 in ${accel}s · ${BODY_LABEL[body]}`,
      });
    }
  }
  return out;
}

export const CARS = buildCars();
export const STARTER_CAR_ID = 'car-volkswagen-golf-mk5-2008-used';
