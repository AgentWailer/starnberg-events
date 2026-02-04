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
- **Cancellation detection** — IRIS `cs="c"` reliably catches train cancellations (transport.rest often drops them silently)
- **Punctuality analysis** — on-time rate, delay distribution, direction comparison
- **Weather correlation** — how weather affects S6 reliability (Open-Meteo)
- **Rush hour analysis** — morning vs evening vs off-peak
- **Historical trends** — daily, weekly, monthly breakdowns
- **Fine-grained delay tracking** — 1-minute buckets for 0–5 min range

### Local Info
- **Live S-Bahn departures** in navbar and mobile ticker — shows cancellations (red "Ausfall") and warnings (⚠)
- **Client-side time filter** — only upcoming departures shown, never stale data
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
- **Fallback:** transport.rest API (JSON) — used only when IRIS fails
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

### IRIS vs transport.rest

| Aspect | IRIS API | transport.rest |
|--------|----------|----------------|
| Source | DB infrastructure (official) | Community API wrapper |
| Format | XML (plan + fchg) | JSON |
| Cancellations | ✅ Reliable (`cs="c"` flag) | ❌ Often drops cancelled trains silently |
| Stability | High (DB backbone) | Variable (HTTP 500s, stale realtime) |
| Rate limit | Generous | Community fair-use |
| Role in project | **Primary** | Fallback only |

## Project Structure

```
starnberg-events/
├── src/
│   ├── pages/
│   │   ├── index.astro          # Main events page
│   │   └── s6.astro             # S6 punctuality dashboard
│   ├── components/
│   │   ├── Header.astro         # Hero header with S6 badges + punctuality
│   │   ├── InfoTicker.astro     # Mobile sticky ticker (S6 + weather)
│   │   ├── TrainInfo.astro      # Desktop S6 departures widget
│   │   ├── FilterBar.astro      # Sidebar filters + mobile filter sheet
│   │   ├── EventCard.astro      # Event list card (date + weekday badge)
│   │   ├── EventModal.astro     # Event detail modal
│   │   ├── MarketInfo.astro     # Wochenmarkt schedule
│   │   ├── WebcamWidget.astro   # Webcam links
│   │   └── WeatherWidget.astro  # Current weather
│   ├── data/
│   │   ├── events.json          # Event data (91+ events)
│   │   ├── restaurants.json     # Restaurant/Biergarten data
│   │   └── sources.json         # Event source definitions
│   └── layouts/
│       └── Layout.astro         # Base layout + Alpensee design tokens
├── workers/
│   └── train-tracker/
│       ├── src/index.ts         # Worker: IRIS XML parser, all API endpoints, cron
│       ├── schema.sql           # D1 schema
│       ├── migration-weather.sql # Weather columns migration
│       └── wrangler.toml        # Worker config (cron, D1 binding)
├── scraper/                     # Auto-scraper framework (GitHub Actions)
└── astro.config.mjs
```

## API Endpoints

The S6 Worker is deployed at `train-tracker.steffenvonlindern-be7.workers.dev`:

| Endpoint | Description |
|----------|-------------|
| `GET /api/live` | Real-time S6 departures (2 min cache, IRIS primary, client filters by time) |
| `GET /api/stats?period=today\|week\|month` | Aggregated punctuality stats (cancellations included in rate) |
| `GET /api/analysis?days=N` | Full analysis: direction, rush hour, weather, weekday, temperature |
| `GET /api/departures?date=YYYY-MM-DD` | Individual departure records for a date |
| `GET /api/history?days=N` | Daily trend data |

### Punctuality Calculation
- **Rate** = `on_time / (on_time + delayed + cancelled)` — cancellations count against punctuality
- **On time:** ≤5 min delay
- **Delayed:** >5 min delay  
- **Cancelled:** IRIS `cs="c"` or transport.rest `cancelled: true`
- `MAX(cancelled)` UPSERT: once a train is marked cancelled, it stays cancelled

## Data Sources

### Events
- [beccult Pöcking](https://www.beccult.de/veranstaltungen)
- [StarnbergAmmersee.de](https://www.starnbergammersee.de)
- [PFC Pöcking](https://www.pfc.de/veranstaltungen/)
- [muenchen.de](https://www.muenchen.de/veranstaltungen)
- [Olympiapark](https://www.olympiapark.de)
- [Deutsches Museum](https://www.deutsches-museum.de)
- [Hellabrunn Zoo](https://www.hellabrunn.de)
- [Tegernsee](https://www.tegernsee.com/veranstaltungen) (highlights)
- [Garmisch-Partenkirchen](https://www.gapa-tourismus.de) (highlights)
- and more...

### S6 Train Data
- **Primary:** [DB IRIS API](https://iris.noncd.db.de) — XML timetable (`/plan`) + realtime changes (`/fchg`)
  - Plan: `iris-tts/timetable/plan/{evaNo}/{yymmdd}/{hh}`
  - Changes: `iris-tts/timetable/fchg/{evaNo}`
  - Possenhofen: EVA `8004874`, station code `MPH`
- **Fallback:** [transport.rest](https://v6.db.transport.rest) — community REST API
- **Weather:** [Open-Meteo](https://open-meteo.com) — Starnberg coordinates (47.9983, 11.3397)

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

### IRIS Integration
The worker implements a regex-based XML parser for IRIS data (no DOMParser in Cloudflare Workers):
- `parsePlanXml()` — extracts planned stops from `/plan` hourly timetables
- `parseFchgXml()` — extracts realtime updates (delays, cancellations) from `/fchg`
- `fetchIrisDepartures()` — parallel fetch of plan XMLs + fchg, merge by stop ID
- `collectDepartures()` — IRIS primary → transport.rest fallback, weather in parallel
- Direction detection from IRIS `ppth` (departure path): last station determines direction

### Data Collection
- Cron runs every 10 minutes (UTC: `*/10 4-23 * * *` and `*/10 0-0 * * *`)
- IRIS plan (current + next hour) + realtime (fchg) fetched and merged
- Weather conditions recorded per departure via Open-Meteo
- UPSERT with tripId dedup — later readings update delay (most accurate)
- `cancelled = MAX(departures.cancelled, excluded.cancelled)` — once cancelled, stays cancelled

### Frontend Display
- **Cancelled trains:** Shown as red strikethrough with "Ausfall" label (TrainInfo) or ⚠ warning (Header/Ticker)
- **Client-side time filter:** All components filter by current time to prevent stale departures from cache
- **Next train logic:** Shows next *running* train per direction, with warning if another train in that direction is cancelled

---

Built for the Pöcking & Starnberger See community.
