import { normal } from './rng';
import type { GameState, Rival } from './types';

export const RIVALS: Rival[] = [
  { id: 'r1', name: 'Bernard Arnot', title: 'Luxury conglomerate king', netWorth: 4.2e9, beta: 0.8, color: '#a78bfa' },
  { id: 'r2', name: 'Xavier Stone', title: 'Voltara EV founder', netWorth: 2.9e9, beta: 1.6, color: '#fb7185' },
  { id: 'r3', name: 'Lloyd Pemberton', title: 'Goldstein Brothers CEO', netWorth: 6.5e8, beta: 1.1, color: '#34d399' },
  { id: 'r4', name: 'Victoria Kane', title: 'Hedge fund legend', netWorth: 1.8e8, beta: 1.3, color: '#60a5fa' },
  { id: 'r5', name: 'Tony "The Shark" Castellano', title: 'Construction & "waste management"', netWorth: 4.5e7, beta: 0.9, color: '#fbbf24' },
  { id: 'r6', name: 'Chad Bennett', title: 'Crypto influencer', netWorth: 3.2e6, beta: 2.2, color: '#22d3ee' },
  { id: 'r7', name: 'Priya Raman', title: 'Startup founder', netWorth: 7.5e5, beta: 1.4, color: '#f472b6' },
  { id: 'r8', name: 'Gary from Accounting', title: 'Index fund enjoyer', netWorth: 1.2e5, beta: 1.0, color: '#94a3b8' },
];

export function updateRivals(g: GameState, indexReturn: number): void {
  for (const r of g.rivals) {
    r.netWorth *= Math.exp(r.beta * indexReturn + 0.012 * normal(g) + 0.0002);
  }
}
