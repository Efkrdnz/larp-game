import type { SectorId } from '../types';

export interface Sector {
  id: SectorId;
  name: string;
  color: string;
  beta: number; // sensitivity to the overall market
}

export const SECTORS: Record<SectorId, Sector> = {
  tech: { id: 'tech', name: 'Technology', color: '#60a5fa', beta: 1.25 },
  finance: { id: 'finance', name: 'Finance', color: '#34d399', beta: 1.1 },
  energy: { id: 'energy', name: 'Energy', color: '#fbbf24', beta: 0.9 },
  health: { id: 'health', name: 'Healthcare', color: '#f472b6', beta: 0.7 },
  consumer: { id: 'consumer', name: 'Consumer', color: '#a78bfa', beta: 0.8 },
  industrial: { id: 'industrial', name: 'Industrials', color: '#94a3b8', beta: 1.0 },
  auto: { id: 'auto', name: 'Automotive', color: '#fb7185', beta: 1.2 },
  media: { id: 'media', name: 'Media', color: '#22d3ee', beta: 1.05 },
};

export const SECTOR_IDS = Object.keys(SECTORS) as SectorId[];
