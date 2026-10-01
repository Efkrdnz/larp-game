# CAPITAL — Game Design & Roadmap

## Vision

The ultimate capitalism LARP: a single web app (phone + PC, hosted on GitHub Pages) where you can get rich through trading, investing, running companies, gambling, politics — or crime. Everything is visual: charts, newspapers, cars, houses, courtrooms, prison cells. Anything can happen, including getting caught and going to jail.

**Pillars**

1. **Everything is connected.** News moves markets; your purchases make headlines; laws you lobby for move sectors; scandals tank your reputation; prison freezes your trading.
2. **Legal is slow but safe, illegal is fast but compounding risk.** Every shortcut adds heat; heat turns into investigations; investigations turn into trials.
3. **Show, don't tell.** Every system has a visual: candlestick charts, a newspaper front page, a garage of customisable cars, an animated roulette wheel, a jail cell with tally marks.
4. **Satire, not simulation-of-real-brands.** All companies, brands and people are fictional parodies.

## Core loop

Start with $10,000, a rusty hatchback, a rented studio and a junior job → earn (salary, gigs, trading, casino) → invest and buy status (reputation) → bend the rules for speed (heat) → grow, get caught, or both → climb the rich list past AI tycoons.

## Systems

| System | Status | Notes |
|---|---|---|
| Game clock | ✅ MVP | 1 real second = 1 game minute at 1×; speeds up to 240×; market 09:30–16:00 weekdays; skip to open; offline catch-up (max 8 game days). |
| Stock market | ✅ MVP | 40 tickers / 8 sectors. Per-minute log-returns = market factor × sector beta + sector factor + idiosyncratic noise, mean reversion toward a fundamental value, news drift. 250 days of generated history. Market/limit/stop orders, shorts (≤50% of equity), margin call at 30% cover, commission + spread. |
| News | ✅ MVP | Templates with company/sector/macro scope, sentiment ranges and rumour probability; scheduled 3 days ahead (enables insider tips); real news moves fair value, rumours fade; player headlines for arrests, verdicts and huge purchases. |
| Shop & customisation | ✅ MVP | Cars, homes, watches, yachts/jets/helicopters; procedural SVG art; customisation priced by item tier; appreciation/depreciation, upkeep, resale haircut, reputation. |
| Casino | ✅ MVP | Blackjack, European roulette. Gambling taxable. |
| Crime | ✅ MVP | Offshore shell + transfers, insider tips, bribing officials (sting risk), tax evasion. |
| Heat & justice | ✅ MVP | 3 agencies, daily investigation rolls, evidence growth, bribe/lawyer/shred actions, trial with lawyer tiers, judge bribes, plea deals, fines, offshore seizure, prison with work/bribe/appeal. |
| Taxes | ✅ MVP | Quarterly 25% bill; pay / under-report / offshore; late penalty. |
| Rivals | ✅ MVP | 8 AI tycoons whose net worth tracks the index with their own beta. |
| Forex & crypto | 🔜 M2 | Fictional currency pairs with leverage and central-bank news; volatile coins, rug pulls, launching your own memecoin, pump-and-dumps (illegal). |
| Companies | 🔜 M3 | Found a business (café → chain, startup, factory, bank, media outlet); strategy sliders (price, quality, marketing, R&D, wages); quarterly P&L; competitors; IPO onto the in-game exchange; hostile takeovers; embezzlement. |
| Real estate & consortiums | 🔜 M4 | Isometric city map of land plots; buy shares of a large plot with up to 20 participants (AI now, real players later); vote on what to build (mall, tower, stadium, casino); construction phases with delays, cost overruns and bribe-able permits; rental income split by share. |
| Politics | 🔜 M5 | Donations, lobbying (laws change tax rates, regulation, tariffs → move sectors), run for council → mayor → governor → president, polls and election nights, government contracts (corruption). |
| Deeper justice | 🔜 M5 | Lawyers with track records, witnesses, appeals courts, prison economy (contraband, favours), escape attempts, parole. |
| More casino & betting | 🔜 M6 | Poker vs AI, slots, crash; sportsbook on simulated leagues with live match sims, parlays and match fixing; casino money laundering. |
| More lifestyle | 🔜 M6 | House interior room editor, art collection, garage view, achievements, "flex" profile card. |
| Multiplayer | 🔜 M7 | `MultiplayerAdapter` seam with a Supabase backend: shared leaderboard, real consortiums, player-to-player trades, real elections. Single-player keeps working offline. |

## Balance notes (current tuning)

- Index daily volatility ≈ 1.2–1.7%, ~6 headlines per game day; sector/macro news damped ×0.3.
- Investigation chance per day per agency = (heat/100)² × 0.3; heat decays ~1.5%/day − 0.6.
- Charges filed if evidence ≥ 35 at the investigation deadline.
- Conviction chance = evidence/100 + 0.25 − 0.18 × lawyer tier − 0.45 if judge bribed + 0.05 per extra charge (clamped 3–97%).
- Bribe/lawyer costs scale with net worth so they stay meaningful for billionaires.

## Technical architecture

- **Vite + React 18 + TypeScript**, Tailwind CSS, `HashRouter` (GitHub Pages friendly), `vite-plugin-pwa`.
- **Engine** (`src/engine`) is pure TypeScript that mutates a single serialisable `GameState`; deterministic seeded RNG stored in the state. Covered by Vitest.
- **Store** (`src/store/useGame.ts`): zustand; a 250 ms loop advances `speed/4` game minutes per tick; components re-render on a tick counter. Autosave to IndexedDB every 15 s and on tab hide.
- **Charts**: TradingView `lightweight-charts` for candles; small custom SVG charts elsewhere.
- **Art**: procedural SVG components in `src/ui/art` (no image assets, fully customisable, tiny download).
- **Deploy**: `.github/workflows/deploy.yml` builds and publishes `dist/` to GitHub Pages on push to `main`.
