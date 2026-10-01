import { COMPANIES } from './data/companies';
import { CITIES, COUNTRIES, NEWS_TEMPLATES, type NewsTemplate } from './data/newsTemplates';
import { SECTORS } from './data/sectors';
import { MIN_PER_DAY, minuteOfDay } from './calendar';
import { applyMove } from './market';
import { chance, nextRandom, pick, range } from './rng';
import type { GameEvent, GameState, NewsItem } from './types';

const SCHEDULE_AHEAD = 3 * MIN_PER_DAY;
const MEAN_GAP = 240; // minutes between headlines on average
// Sector/macro templates hit many stocks at once; damp them so the index moves realistically.
const BROAD_DAMPING = 0.3;
const NEWS_KEEP = 120;

const TOTAL_WEIGHT = NEWS_TEMPLATES.reduce((s, t) => s + t.weight, 0);

function pickTemplate(g: GameState): NewsTemplate {
  let r = nextRandom(g) * TOTAL_WEIGHT;
  for (const t of NEWS_TEMPLATES) {
    r -= t.weight;
    if (r <= 0) return t;
  }
  return NEWS_TEMPLATES[0];
}

function fill(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? `{${k}}`);
}

export function generateNews(g: GameState, t: number, template = pickTemplate(g)): NewsItem {
  const pool = template.scope === 'company' && template.sectors ? COMPANIES.filter((c) => template.sectors!.includes(c.sector)) : COMPANIES;
  const company = pick(g, pool);
  const rumor = chance(g, template.rumorChance);

  const moves: Record<string, number> = {};
  let headlineMove = 0;
  for (const eff of template.effects) {
    const base = range(g, eff.range[0], eff.range[1]) * (eff.target === 'company' ? 1 : BROAD_DAMPING);
    if (Math.abs(base) > Math.abs(headlineMove)) headlineMove = base;
    const targets =
      eff.target === 'company' ? [company] : eff.target === 'all' ? COMPANIES : COMPANIES.filter((c) => c.sector === eff.target);
    for (const c of targets) {
      const beta = eff.target === 'all' ? SECTORS[c.sector].beta : 1;
      const jitter = eff.target === 'company' ? 1 : range(g, 0.6, 1.4);
      moves[c.ticker] = (moves[c.ticker] ?? 0) + Math.log(1 + base * beta * jitter);
    }
  }

  const vars = {
    name: company.name,
    ticker: company.ticker,
    ceo: company.ceo,
    product: company.product,
    sector: SECTORS[company.sector].name,
    pct: String(Math.max(1, Math.round(Math.abs(headlineMove) * 100))),
    city: pick(g, CITIES),
    country: pick(g, COUNTRIES),
  };
  const sectorTargets = template.effects.map((e) => e.target).filter((x) => x !== 'company' && x !== 'all');
  g.idCounter += 1;
  return {
    id: `n${g.idCounter}`,
    t,
    headline: fill(pick(g, template.headlines), vars),
    body: fill(template.body, vars),
    scope: template.scope,
    tickers: template.scope === 'company' ? [company.ticker] : [],
    sectors: sectorTargets as NewsItem['sectors'],
    impact: headlineMove,
    moves,
    rumor,
    category: template.category,
    breaking: template.scope === 'macro' || Math.abs(headlineMove) >= 0.1,
  };
}

/** Keep the future news queue filled a few days ahead (insider tips peek into it). */
export function scheduleNews(g: GameState): void {
  let last = g.scheduled.length ? g.scheduled[g.scheduled.length - 1].t : g.time;
  while (last < g.time + SCHEDULE_AHEAD) {
    last += Math.max(5, Math.round(-Math.log(1 - nextRandom(g)) * MEAN_GAP));
    // Fewer headlines in the dead of night.
    if (minuteOfDay(last) < 6 * 60 && chance(g, 0.7)) continue;
    g.scheduled.push(generateNews(g, last));
  }
}

export function publishNews(g: GameState, item: NewsItem, events: GameEvent[]): void {
  for (const [ticker, move] of Object.entries(item.moves)) applyMove(g, ticker, move, !item.rumor);
  g.news.unshift(item);
  if (g.news.length > NEWS_KEEP) g.news.length = NEWS_KEEP;
  if (item.breaking) {
    events.push({ kind: 'news', title: 'BREAKING', body: item.headline, link: `/news`, toast: true });
  }
  const tip = g.tips.find((x) => x.newsId === item.id);
  if (tip) {
    events.push({ kind: 'crime', title: 'Your tip just hit the wires', body: item.headline, link: `/stock/${tip.ticker}`, toast: true });
  }
  g.tips = g.tips.filter((x) => x.newsId !== item.id);
}

export function releaseDueNews(g: GameState, events: GameEvent[]): void {
  while (g.scheduled.length && g.scheduled[0].t <= g.time) {
    publishNews(g, g.scheduled.shift()!, events);
  }
}

/** A non-market headline about the player (arrests, verdicts, big purchases). */
export function playerHeadline(g: GameState, headline: string, body: string, category = 'Society'): void {
  g.idCounter += 1;
  g.news.unshift({
    id: `n${g.idCounter}`,
    t: g.time,
    headline,
    body,
    scope: 'macro',
    tickers: [],
    sectors: [],
    impact: 0,
    moves: {},
    rumor: false,
    category,
    breaking: true,
  });
  if (g.news.length > NEWS_KEEP) g.news.length = NEWS_KEEP;
}
