// Helpers shared by the catalogue data files.

export function slug(...parts: string[]): string {
  return parts
    .join(' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Status points for owning something that costs `price`. $10K → 0, $1M → 18, $100M → 36. */
export function reputationFor(price: number): number {
  return Math.max(0, Math.min(50, Math.round((Math.log10(Math.max(1, price)) - 4) * 9)));
}

/** Small deterministic hash used to vary colours/prices without randomness. */
export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function money(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M`;
  if (n >= 1e3) return `$${Math.round(n / 1e3)}K`;
  return `$${n}`;
}
