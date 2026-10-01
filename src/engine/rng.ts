// Deterministic PRNG (mulberry32). State lives inside GameState so a save
// replays identically, which also keeps the engine unit-testable.

export interface RngHolder {
  rng: number;
}

export function nextRandom(h: RngHolder): number {
  h.rng = (h.rng + 0x6d2b79f5) | 0;
  let t = h.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function normal(h: RngHolder): number {
  let u = 0;
  while (u === 0) u = nextRandom(h);
  const v = nextRandom(h);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function range(h: RngHolder, min: number, max: number): number {
  return min + (max - min) * nextRandom(h);
}

export function int(h: RngHolder, min: number, maxInclusive: number): number {
  return Math.floor(range(h, min, maxInclusive + 1));
}

export function pick<T>(h: RngHolder, arr: readonly T[]): T {
  return arr[Math.floor(nextRandom(h) * arr.length)];
}

export function chance(h: RngHolder, p: number): boolean {
  return nextRandom(h) < p;
}

/** Non-deterministic holder for UI-only randomness (casino animations etc.). */
export function liveRng(): RngHolder {
  return { rng: (Math.random() * 2 ** 32) | 0 };
}
