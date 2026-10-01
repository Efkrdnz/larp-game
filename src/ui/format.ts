export function money(v: number, opts: { compact?: boolean; cents?: boolean; sign?: boolean } = {}): string {
  const sign = v < 0 ? '-' : opts.sign && v > 0 ? '+' : '';
  const a = Math.abs(v);
  if (opts.compact && a >= 1000) {
    const units: [number, string][] = [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'K']];
    for (const [n, u] of units) if (a >= n) return `${sign}$${(a / n).toFixed(a / n >= 100 ? 0 : a / n >= 10 ? 1 : 2)}${u}`;
  }
  const digits = opts.cents ?? a < 1000 ? 2 : 0;
  return `${sign}$${a.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

export function price(v: number): string {
  return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function pct(v: number, digits = 2): string {
  return `${v > 0 ? '+' : ''}${(v * 100).toFixed(digits)}%`;
}

export const upDown = (v: number) => (v > 0 ? 'text-up' : v < 0 ? 'text-down' : 'text-ink-300');

export function num(v: number): string {
  return v.toLocaleString('en-US');
}

export function compactNum(v: number): string {
  const a = Math.abs(v);
  if (a >= 1e9) return `${(v / 1e9).toFixed(1)}B`;
  if (a >= 1e6) return `${(v / 1e6).toFixed(1)}M`;
  if (a >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  return String(Math.round(v));
}
