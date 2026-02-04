/**
 * S6 Pünktlichkeits-Tracker — Cloudflare Worker
 *
 * Cron: pollt alle 10 Min die transport.rest API für Possenhofen
 * HTTP:  /api/stats?period=today|week|month  → Aggregierte Statistiken
 *        /api/history?days=30               → Tagesverlauf
 *        /api/departures?date=YYYY-MM-DD    → Einzelne Abfahrten
 */

interface Env {
  DB: D1Database;
}

// ── Types ──────────────────────────────────────────────────────────

interface ApiDeparture {
  tripId: string;
  when: string | null;
  plannedWhen: string;
  delay: number | null;
  cancelled?: boolean;
  direction: string;
  line: {
    type: string;
    id: string;
    name: string;
    product: string;
  };
  remarks: Array<{ type: string; code?: string; text?: string }>;
}

interface ApiResponse {
  departures: ApiDeparture[];
}

// ── Helpers ────────────────────────────────────────────────────────

const POSSENHOFEN_ID = '8004874';
const API_BASE = 'https://v6.db.transport.rest';
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=300', // 5 min cache
};

/**
 * Richtung: Tutzing/Feldafing/südlich = 'tutzing', alles andere = 'muenchen'
 * Identische Logik wie im Frontend (Header, InfoTicker)
 */
function classifyDirection(dir: string): 'muenchen' | 'tutzing' {
  return /tutzing|feldafing|bernried|seeshaupt|weilheim|penzberg/i.test(dir)
    ? 'tutzing'
    : 'muenchen';
}

/** Extrahiert die Stunde (0-23) aus einem ISO-Timestamp mit Timezone */
function extractHour(isoStr: string): number {
  // Format: 2026-02-04T14:37:00+01:00
  const match = isoStr.match(/T(\d{2}):/);
  return match ? parseInt(match[1], 10) : 0;
}

/** Betriebstag aus ISO-Timestamp (Fahrten nach Mitternacht zählen zum Vortag) */
function extractDate(isoStr: string): string {
  const hour = extractHour(isoStr);
  const d = new Date(isoStr);
  // Fahrten 0:00-3:59 zählen zum Vortag (Betriebstag)
  if (hour < 4) {
    d.setDate(d.getDate() - 1);
  }
  return d.toISOString().split('T')[0];
}

/** Datum-String für N Tage zurück */
function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400000).toISOString().split('T')[0];
}

/** Heute als YYYY-MM-DD (UTC+1 approximation) */
function todayStr(): string {
  const now = new Date(Date.now() + 3600000); // ~CET
  return now.toISOString().split('T')[0];
}

// ── Cron: Daten sammeln ────────────────────────────────────────────

async function collectDepartures(env: Env): Promise<{ inserted: number; updated: number }> {
  const url = `${API_BASE}/stops/${POSSENHOFEN_ID}/departures?duration=30&suburban=true`;

  const resp = await fetch(url, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'StarnbergEvents-TrainTracker/1.0' },
  });

  if (!resp.ok) {
    console.error(`API error: ${resp.status} ${resp.statusText}`);
    return { inserted: 0, updated: 0 };
  }

  const data: ApiResponse = await resp.json();
  const now = new Date().toISOString();

  // Nur S-Bahn (suburban) — an Possenhofen fährt nur S6, aber sicher ist sicher
  const s6 = data.departures.filter(
    (d) => d.line?.product === 'suburban' && /S6/i.test(d.line?.name || '')
  );

  let inserted = 0;
  let updated = 0;

  for (const dep of s6) {
    const date = extractDate(dep.plannedWhen);
    const hour = extractHour(dep.plannedWhen);
    const direction = classifyDirection(dep.direction);
    const cancelled = dep.cancelled ? 1 : (dep.when === null && dep.delay === null ? 0 : 0);
    // Manche APIs setzen when=null bei Ausfall ohne cancelled-Flag
    const isCancelled = dep.cancelled === true || (dep.when === null && dep.remarks?.some(
      r => r.type === 'status' && /fällt aus|cancelled|Ausfall/i.test(r.text || '')
    )) ? 1 : 0;

    const result = await env.DB.prepare(`
      INSERT INTO departures (trip_id, date, planned_when, planned_hour, delay, cancelled, direction, line, recorded_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (trip_id, date) DO UPDATE SET
        delay = excluded.delay,
        cancelled = MAX(departures.cancelled, excluded.cancelled),
        recorded_at = excluded.recorded_at
    `).bind(
      dep.tripId, date, dep.plannedWhen, hour,
      dep.delay, isCancelled, direction, dep.line.name, now
    ).run();

    if (result.meta.changes > 0) {
      // Heuristic: if rows_written > rows_read it's an insert
      updated++;
    }
    inserted++;
  }

  return { inserted: s6.length, updated };
}

// ── HTTP: Stats API ────────────────────────────────────────────────

async function handleStats(db: D1Database, url: URL): Promise<Response> {
  const period = url.searchParams.get('period') || 'today';

  let dateFrom: string;
  const today = todayStr();

  switch (period) {
    case 'week':  dateFrom = daysAgo(7); break;
    case 'month': dateFrom = daysAgo(30); break;
    default:      dateFrom = today; break; // 'today'
  }

  const isToday = period === 'today';
  const where = isToday ? 'date = ?1' : 'date >= ?1';

  // Gesamt-Statistik
  const overall = await db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN cancelled = 1 THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 300 THEN 1 ELSE 0 END) as on_time,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 300 THEN 1 ELSE 0 END) as delayed,
      SUM(CASE WHEN cancelled = 0 AND delay IS NULL THEN 1 ELSE 0 END) as no_data,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END), 0) as avg_delay,
      MAX(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END) as max_delay
    FROM departures WHERE ${where}
  `).bind(dateFrom).first();

  // Nach Richtung
  const byDirection = await db.prepare(`
    SELECT
      direction,
      COUNT(*) as total,
      SUM(CASE WHEN cancelled = 1 THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 300 THEN 1 ELSE 0 END) as on_time,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 300 THEN 1 ELSE 0 END) as delayed,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END), 0) as avg_delay
    FROM departures WHERE ${where}
    GROUP BY direction
  `).bind(dateFrom).all();

  // Nach Stunde (für alle Perioden)
  const byHour = (await db.prepare(`
    SELECT
      planned_hour as hour,
      COUNT(*) as total,
      SUM(CASE WHEN cancelled = 1 THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 300 THEN 1 ELSE 0 END) as on_time,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 300 THEN 1 ELSE 0 END) as delayed,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END), 0) as avg_delay
    FROM departures WHERE ${where}
    GROUP BY planned_hour ORDER BY planned_hour
  `).bind(dateFrom).all()).results;

  return json({ period, since: dateFrom, overall, byDirection: byDirection.results, byHour });
}

// ── Umfassende Analyse ─────────────────────────────────────────────

async function handleAnalysis(db: D1Database, url: URL): Promise<Response> {
  const days = Math.min(parseInt(url.searchParams.get('days') || '30', 10), 90);
  const since = daysAgo(days);
  const today = todayStr();

  // 1) Gesamt (gesamter Zeitraum)
  const overall = await db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN cancelled = 1 THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 300 THEN 1 ELSE 0 END) as on_time,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 300 THEN 1 ELSE 0 END) as delayed,
      SUM(CASE WHEN cancelled = 0 AND delay IS NULL THEN 1 ELSE 0 END) as no_data,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END), 0) as avg_delay,
      MAX(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END) as max_delay,
      MIN(date) as first_date,
      MAX(date) as last_date
    FROM departures WHERE date >= ?1
  `).bind(since).first();

  // 2) Heute separat
  const todayStats = await db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN cancelled = 1 THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 300 THEN 1 ELSE 0 END) as on_time,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 300 THEN 1 ELSE 0 END) as delayed,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END), 0) as avg_delay
    FROM departures WHERE date = ?1
  `).bind(today).first();

  // 3) Nach Richtung
  const byDirection = (await db.prepare(`
    SELECT direction,
      COUNT(*) as total,
      SUM(CASE WHEN cancelled = 1 THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 300 THEN 1 ELSE 0 END) as on_time,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 300 THEN 1 ELSE 0 END) as delayed,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END), 0) as avg_delay
    FROM departures WHERE date >= ?1 GROUP BY direction
  `).bind(since).all()).results;

  // 4) Nach Stunde (Tagesprofil)
  const byHour = (await db.prepare(`
    SELECT planned_hour as hour,
      COUNT(*) as total,
      SUM(CASE WHEN cancelled = 1 THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 300 THEN 1 ELSE 0 END) as on_time,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 300 THEN 1 ELSE 0 END) as delayed,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END), 0) as avg_delay
    FROM departures WHERE date >= ?1
    GROUP BY planned_hour ORDER BY planned_hour
  `).bind(since).all()).results;

  // 5) Nach Wochentag
  const byWeekday = (await db.prepare(`
    SELECT
      CAST(strftime('%w', date) AS INTEGER) as weekday,
      COUNT(*) as total,
      SUM(CASE WHEN cancelled = 1 THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 300 THEN 1 ELSE 0 END) as on_time,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 300 THEN 1 ELSE 0 END) as delayed,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END), 0) as avg_delay
    FROM departures WHERE date >= ?1
    GROUP BY weekday ORDER BY weekday
  `).bind(since).all()).results;

  // 6) Verspätungsverteilung
  const delayDistribution = (await db.prepare(`
    SELECT
      CASE
        WHEN cancelled = 1 THEN 'cancelled'
        WHEN delay IS NULL THEN 'no_data'
        WHEN delay <= 0 THEN 'early'
        WHEN delay <= 120 THEN '0-2min'
        WHEN delay <= 300 THEN '2-5min'
        WHEN delay <= 600 THEN '5-10min'
        WHEN delay <= 1200 THEN '10-20min'
        ELSE '20min+'
      END as bucket,
      COUNT(*) as count
    FROM departures WHERE date >= ?1
    GROUP BY bucket
  `).bind(since).all()).results;

  // 7) Tagesverlauf
  const daily = (await db.prepare(`
    SELECT date,
      COUNT(*) as total,
      SUM(CASE WHEN cancelled = 1 THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 300 THEN 1 ELSE 0 END) as on_time,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 300 THEN 1 ELSE 0 END) as delayed,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END), 0) as avg_delay
    FROM departures WHERE date >= ?1
    GROUP BY date ORDER BY date
  `).bind(since).all()).results;

  // 8) Rush-Hour-Analyse (HVZ: 6-9 + 16-19 vs Rest)
  const rushHour = (await db.prepare(`
    SELECT
      CASE
        WHEN planned_hour BETWEEN 6 AND 8 THEN 'morning_rush'
        WHEN planned_hour BETWEEN 16 AND 18 THEN 'evening_rush'
        ELSE 'off_peak'
      END as period,
      COUNT(*) as total,
      SUM(CASE WHEN cancelled = 1 THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 300 THEN 1 ELSE 0 END) as on_time,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 300 THEN 1 ELSE 0 END) as delayed,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END), 0) as avg_delay
    FROM departures WHERE date >= ?1
    GROUP BY period
  `).bind(since).all()).results;

  // 9) Top 10 schlimmste Verspätungen
  const worstDelays = (await db.prepare(`
    SELECT planned_when, delay, direction, date
    FROM departures
    WHERE date >= ?1 AND cancelled = 0 AND delay IS NOT NULL AND delay > 300
    ORDER BY delay DESC LIMIT 10
  `).bind(since).all()).results;

  // 10) Heutige Abfahrten
  const todayDepartures = (await db.prepare(`
    SELECT planned_when, planned_hour, delay, cancelled, direction
    FROM departures WHERE date = ?1
    ORDER BY planned_when
  `).bind(today).all()).results;

  return json({
    days, since, generatedAt: new Date().toISOString(),
    overall, today: todayStats,
    byDirection, byHour, byWeekday,
    delayDistribution, daily, rushHour,
    worstDelays, todayDepartures
  });
}

async function handleHistory(db: D1Database, url: URL): Promise<Response> {
  const days = Math.min(parseInt(url.searchParams.get('days') || '30', 10), 90);
  const since = daysAgo(days);

  const daily = await db.prepare(`
    SELECT
      date,
      COUNT(*) as total,
      SUM(CASE WHEN cancelled = 1 THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 300 THEN 1 ELSE 0 END) as on_time,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 300 THEN 1 ELSE 0 END) as delayed,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END), 0) as avg_delay
    FROM departures
    WHERE date >= ?1
    GROUP BY date ORDER BY date
  `).bind(since).all();

  return json({ days, since, daily: daily.results });
}

async function handleDepartures(db: D1Database, url: URL): Promise<Response> {
  const date = url.searchParams.get('date') || todayStr();

  const deps = await db.prepare(`
    SELECT trip_id, planned_when, planned_hour, delay, cancelled, direction, line, recorded_at
    FROM departures
    WHERE date = ?1
    ORDER BY planned_when
  `).bind(date).all();

  return json({ date, count: deps.results.length, departures: deps.results });
}

function json(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

// ── Export ──────────────────────────────────────────────────────────

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    const result = await collectDepartures(env);
    console.log(`[cron] Collected ${result.inserted} S6 departures`);
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);

    try {
      switch (url.pathname) {
        case '/api/stats':      return handleStats(env.DB, url);
        case '/api/history':    return handleHistory(env.DB, url);
        case '/api/departures': return handleDepartures(env.DB, url);
        case '/api/analysis':   return handleAnalysis(env.DB, url);
        default:
          return new Response(
            JSON.stringify({
              name: 'S6 Train Tracker',
              endpoints: ['/api/stats', '/api/history', '/api/departures'],
              station: 'Possenhofen',
            }),
            { headers: { 'Content-Type': 'application/json', ...CORS } }
          );
      }
    } catch (err) {
      console.error(err);
      return new Response(JSON.stringify({ error: 'Internal error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS },
      });
    }
  },
} satisfies ExportedHandler<Env>;
