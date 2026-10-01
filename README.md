# CAPITAL — The Capitalism LARP

A browser game about getting rich by any means necessary. Trade stocks on a news-driven market, buy and customise supercars, mansions, watches and yachts, gamble at the casino, and — if you're feeling brave — bribe officials, dodge taxes and trade on insider tips. Get caught and you'll face an investigation, a trial and maybe a prison cell.

Runs entirely in the browser (no server), works on phones and desktops, installs as a PWA, and is hosted on GitHub Pages.

> Satire. All companies, brands and people are fictional. No real money, no financial advice.

## Features (MVP)

- **Stock market** — 40 fictional companies in 8 sectors, a correlated random-walk price engine with sector betas and mean reversion, real candlestick charts (1D / 5D / 3M / 1Y, line or candles, SMA), volume, market/limit/stop orders, short selling, margin calls, a cap-weighted CAP 500 index and a sector heatmap.
- **News engine** — ~40 headline templates (earnings, scandals, recalls, takeovers, rate hikes, wars…). News moves prices; overnight news gaps the open; rumours spike prices but fade (and get stamped *Debunked*).
- **Luxury mall** — 30 items across cars, real estate, watches and yachts/jets, all drawn procedurally in SVG with live customisation (paint, rims, wraps, tint, spoilers, plates, pools, gardens, party lights, diamond bezels, boat names…). Items appreciate or depreciate, cost upkeep and raise your reputation. Homes end your rent. Watches show the in-game time; houses switch to night.
- **Casino** — Blackjack (6-deck shoe, 3:2, double down) and European roulette with an animated wheel. Winnings are taxable.
- **Underworld** — offshore shell accounts, insider tips, bribing tax inspectors / regulators / police (watch out for stings), and a criminal record.
- **Heat & justice** — three agencies track your heat; high heat triggers investigations (bribe the investigator, lawyer up, or shred documents). Charges lead to a trial (public defender → star lawyer, bribe the judge, plea deal) and prison (laundry shifts, bribing guards, appeals). Your positions keep moving while you're inside.
- **Taxes** — quarterly bills on gains, gambling and wages: pay, under-report, or route through your offshore shell.
- **Rich list** — climb past eight AI tycoons.
- Real-time clock with speeds 1×–240×, skip-to-open, autosave to IndexedDB, offline catch-up, export/import save codes.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173/larp-game/
npm test           # engine unit tests (Vitest)
npm run build      # production build into dist/
```

## Deploy to GitHub Pages

1. In the repository settings, open **Settings → Pages** and set **Source** to **GitHub Actions** (one-time).
2. Push to `main` (or run the *Deploy to GitHub Pages* workflow manually). The site is published at `https://<user>.github.io/<repo>/`.

## Project layout

```
src/engine/   pure, deterministic game simulation (no React) + unit tests
src/store/    zustand store, real-time loop, persistence
src/ui/       layout, charts, procedural art (cars, homes, watches, yachts, scenes)
src/pages/    one file per screen
docs/         game design document & roadmap
```

See [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md) for the full design and roadmap.
