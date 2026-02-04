# Was ist los in und um Pöcking? 🏔️

A local events aggregator and S-Bahn tracker for Pöcking am Starnberger See.

🔗 **Live:** [starnberg-events.pages.dev](https://starnberg-events.pages.dev)
📊 **S6 Tracker:** [starnberg-events.pages.dev/s6](https://starnberg-events.pages.dev/s6)

## Features

### Events
- **91+ curated events** from 10+ sources across the Starnberg-Ammersee region
- **Smart filters** — by category (Kinder/Familie/Erwachsene), time period, region, art tags
- **Full-text search** across titles, locations, and descriptions
- **Favorites** with localStorage persistence
- **Weekend highlights** — balanced 3 Saturday + 3 Sunday picks
- **Event modals** with full details, addresses, and external links
- **Apple Calendar integration** — add events directly to your calendar
- **Mobile-optimized** with load-more pagination (10 at a time)

### S6 Pünktlichkeits-Tracker
- **Real-time departures** from Possenhofen station via DB IRIS API
- **Punctuality analysis** — on-time rate, delay distribution, direction comparison
- **Weather correlation** — how weather affects S6 reliability (Open-Meteo)
- **Rush hour analysis** — morning vs evening vs off-peak
- **Historical trends** — daily, weekly, monthly breakdowns
- **Fine-grained delay tracking** — 1-minute buckets for 0–5 min range

### Local Info
- **Live S-Bahn departures** in navbar and mobile ticker
- **Wochenmarkt** schedule (Starnberg, Söcking)
- **Webcam** links (BYC Starnberg, DTYC Tutzing)
- **Weather** widget with current conditions

## Tech Stack

### Website (Astro)
- **Framework:** [Astro](https://astro.build) v5 — static site, zero JS by default
- **Styling:** Custom CSS with Alpensee design system (dark mode supported)
- **Hosting:** Cloudflare Pages (auto-deploy on push)
- **Fonts:** Space Grotesk (headings), system fonts (body)

### S6 Tracker (Cloudflare Worker)
- **Runtime:** Cloudflare Workers with Cron Triggers (every 10 min)
- **Database:** Cloudflare D1 (SQLite)
- **Primary data source:** DB IRIS API (XML) — direct from DB infrastructure
- **Fallback:** transport.rest API (JSON)
- **Weather:** Open-Meteo API (free, no key required)

## Architecture

```
┌─────────────────────┐     ┌──────────────────────┐
│   Astro Website     │     │  S6 Worker (CF)      │
│   (Cloudflare Pages)│     │                      │
│                     │────►│  /api/live           │
│   - index.astro     │     │  /api/stats          │
│   - s6.astro        │     │  /api/analysis       │
│                     │     │  /api/departures     │
└─────────────────────┘     │  /api/history        │
                            │                      │
                            │  Cron (*/10 min):    │
                            │  IRIS → D1 + Weather │
                            └──────┬───────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
              DB IRIS API    Open-Meteo     Cloudflare D1
              (primary)      (weather)      (storage)
              transport.rest
              (fallback)
```

## Project Structure

```
starnberg-events/
├── src/
│   ├── pages/
│   │   ├── index.astro          # Main events page
│   │   └── s6.astro             # S6 punctuality dashboard
│   ├── components/
│   │   ├── Header.astro         # Hero header with title
│   │   ├── InfoTicker.astro     # Mobile sticky ticker (S6 + weather)
│   │   ├── TrainInfo.astro      # Desktop S6 departures widget
│   │   ├── FilterBar.astro      # Sidebar filters + mobile filter sheet
│   │   ├── EventCard.astro      # Event list card
│   │   ├── EventModal.astro     # Event detail modal
│   │   ├── MarketInfo.astro     # Wochenmarkt schedule
│   │   ├── WebcamWidget.astro   # Webcam links
│   │   └── WeatherWidget.astro  # Current weather
│   ├── data/
│   │   ├── events.json          # Event data (91+ events)
│   │   ├── restaurants.json     # Restaurant/Biergarten data
│   │   └── sources.json         # Event source definitions
│   └── layouts/
│       └── Layout.astro         # Base layout + design tokens
├── workers/
│   └── train-tracker/
│       ├── src/index.ts         # Worker: IRIS parser, API endpoints, cron
│       ├── schema.sql           # D1 schema
│       ├── migration-weather.sql
│       └── wrangler.toml        # Worker config
├── scraper/                     # Auto-scraper framework (GitHub Actions)
└── astro.config.mjs
```

## API Endpoints

The S6 Worker is deployed at `train-tracker.steffenvonlindern-be7.workers.dev`:

| Endpoint | Description |
|----------|-------------|
| `GET /api/live` | Real-time S6 departures (2 min cache, IRIS primary) |
| `GET /api/stats?period=today\|week\|month` | Aggregated punctuality statistics |
| `GET /api/analysis?days=N` | Comprehensive analysis (direction, rush hour, weather, weekday) |
| `GET /api/departures?date=YYYY-MM-DD` | Individual departure records |
| `GET /api/history?days=N` | Daily trend data |

## Data Sources

### Events
- [beccult Pöcking](https://www.beccult.de/veranstaltungen)
- [StarnbergAmmersee.de](https://www.starnbergammersee.de)
- [PFC Pöcking](https://www.pfc.de/veranstaltungen/)
- [muenchen.de](https://www.muenchen.de/veranstaltungen)
- [Olympiapark](https://www.olympiapark.de)
- [Deutsches Museum](https://www.deutsches-museum.de)
- [Hellabrunn Zoo](https://www.hellabrunn.de)
- and more...

### S6 Train Data
- **Primary:** [DB IRIS API](https://iris.noncd.db.de) — XML timetable + realtime changes
- **Fallback:** [transport.rest](https://v6.db.transport.rest) — community REST API
- **Weather:** [Open-Meteo](https://open-meteo.com) — free weather API

## Design System

The site uses the **Alpensee** design system:
- **Primary:** `#0d4a5c` (deep teal)
- **Accent:** `#c9a962` (warm gold)
- **Palette:** Warm neutrals with dark mode support
- **Typography:** Space Grotesk for headings, system fonts for body
- **Cards:** White backgrounds, subtle shadows, rounded corners

## Development

```bash
# Install dependencies
npm install

# Dev server
npm run dev

# Build
npm run build

# Deploy S6 Worker
cd workers/train-tracker
npx wrangler deploy
```

## S6 Tracker Details

### Punctuality Rules
- **On time (pünktlich):** ≤5 min delay (matching DB's official 5-minute rule)
- **Delayed (verspätet):** >5 min delay
- **Cancelled (ausgefallen):** Detected via IRIS `cs="c"` attribute
- **Fine-grained:** Exact (0 delay) and minor (1–5 min) tracked separately

### Data Collection
- Cron runs every 10 minutes (UTC: `*/10 4-23 * * *` and `*/10 0-0 * * *`)
- IRIS plan + realtime (fchg) fetched and merged
- Weather conditions recorded per departure
- UPSERT with tripId dedup — later readings update delay (most accurate)

---

Built for the Pöcking & Starnberger See community.
