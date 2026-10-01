// Game calendar. Minute 0 = Monday 2026-01-05 00:00.

export const MIN_PER_DAY = 1440;
export const OPEN_MIN = 9 * 60 + 30;
export const CLOSE_MIN = 16 * 60;
export const EPOCH_MS = Date.UTC(2026, 0, 5, 0, 0, 0);
export const QUARTER_DAYS = 91;

export const dayIndex = (t: number) => Math.floor(t / MIN_PER_DAY);
export const minuteOfDay = (t: number) => ((t % MIN_PER_DAY) + MIN_PER_DAY) % MIN_PER_DAY;
export const weekday = (t: number) => ((dayIndex(t) % 7) + 7) % 7; // 0 = Monday
export const isWeekday = (t: number) => weekday(t) < 5;

export function isMarketOpen(t: number): boolean {
  const m = minuteOfDay(t);
  return isWeekday(t) && m >= OPEN_MIN && m < CLOSE_MIN;
}

export function toDate(t: number): Date {
  return new Date(EPOCH_MS + t * 60_000);
}

/** Seconds timestamp for lightweight-charts (UTC so the chart shows game time). */
export const chartTime = (t: number) => Math.floor((EPOCH_MS + t * 60_000) / 1000);

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatClock(t: number): string {
  const m = minuteOfDay(t);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export function formatDate(t: number): string {
  const d = toDate(t);
  return `${DAYS[weekday(t)]} ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function formatDateTime(t: number): string {
  return `${formatDate(t)} ${formatClock(t)}`;
}

export function formatDuration(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  const d = Math.floor(m / MIN_PER_DAY);
  const h = Math.floor((m % MIN_PER_DAY) / 60);
  if (d > 0) return `${d}d ${h}h`;
  return `${h}h ${m % 60}m`;
}

/** Next minute at which the market opens, strictly after t if closed. */
export function nextOpen(t: number): number {
  let day = dayIndex(t);
  if (minuteOfDay(t) >= OPEN_MIN) day += 1;
  for (;;) {
    const candidate = day * MIN_PER_DAY + OPEN_MIN;
    if (isWeekday(candidate)) return candidate;
    day += 1;
  }
}

export const quarterOf = (t: number) => Math.floor(dayIndex(t) / QUARTER_DAYS);
