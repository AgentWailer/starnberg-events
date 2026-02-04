# S6 Pünktlichkeits-Tracker

Cloudflare Worker, der alle 10 Minuten die S6-Abfahrten an Possenhofen pollt und in einer D1-Datenbank speichert.

## Architektur

```
transport.rest API  ──(cron 10min)──>  Worker  ──>  D1 (SQLite)
                                         │
                     Frontend  <──(HTTP)──┘
                    /api/stats
                   /api/history
                  /api/departures
```

## Setup

### 1. Voraussetzungen

```bash
npm install -g wrangler
wrangler login
```

### 2. Abhängigkeiten installieren

```bash
cd workers/train-tracker
npm install
```

### 3. D1 Datenbank erstellen

```bash
npx wrangler d1 create train-stats
```

Die Ausgabe enthält eine `database_id`. Diese in `wrangler.toml` eintragen:

```toml
[[d1_databases]]
database_id = "HIER_EINTRAGEN"
```

### 4. Schema anlegen

```bash
npx wrangler d1 execute train-stats --remote --file=schema.sql
```

### 5. Worker deployen

```bash
npx wrangler deploy
```

Die Ausgabe zeigt die Worker-URL, z.B.: `https://train-tracker.xyz.workers.dev`

### 6. Frontend konfigurieren

In `src/pages/s6.astro` die `WORKER_URL` Konstante anpassen:

```javascript
const WORKER_URL = 'https://train-tracker.xyz.workers.dev';
```

## API Endpoints

### `GET /api/stats?period=today|week|month`

Aggregierte Statistiken:
- Scorecard (pünktlich / verspätet / ausgefallen)
- Pünktlichkeitsrate
- Durchschnittliche Verspätung
- Nach Richtung (München / Tutzing)
- Nach Stunde (nur bei `period=today`)

### `GET /api/history?days=30`

Tagesverlauf für Charts. Max 90 Tage.

### `GET /api/departures?date=2026-02-04`

Alle erfassten Abfahrten eines Tages (Rohdaten).

## Datenmodell

| Feld | Beschreibung |
|------|-------------|
| `trip_id` | Eindeutige Fahrt-ID (von DB API) |
| `date` | Betriebstag (YYYY-MM-DD) |
| `planned_when` | Geplante Abfahrt (ISO) |
| `planned_hour` | Stunde (0-23) für Analyse |
| `delay` | Verspätung in Sekunden (NULL = keine Daten) |
| `cancelled` | 1 = ausgefallen |
| `direction` | `muenchen` oder `tutzing` |

## Pünktlichkeitsdefinition

- **Pünktlich**: Verspätung ≤ 5 Minuten (300 Sekunden)
- **Verspätet**: Verspätung > 5 Minuten
- **Ausgefallen**: `cancelled = 1`

## Kosten

Alles im Cloudflare Free Tier:
- ~120 Cron-Trigger/Tag
- ~300-500 D1 Writes/Tag
- D1 Read Queries nur bei Frontend-Aufruf
