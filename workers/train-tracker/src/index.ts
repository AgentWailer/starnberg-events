/**
 * S6 Pünktlichkeits-Tracker — Cloudflare Worker
 *
 * Primary source: DB IRIS API (XML)
 * Fallback: transport.rest API (JSON)
 *
 * Cron: pollt alle 10 Min
 * HTTP:  /api/stats?period=today|week|month  → Aggregierte Statistiken
 *        /api/history?days=30               → Tagesverlauf
 *        /api/departures?date=YYYY-MM-DD    → Einzelne Abfahrten
 *        /api/analysis?days=30              → Umfassende Analyse
 *        /api/live                          → Echtzeit S6-Abfahrten (2 min Cache)
 */

interface Env {
  DB: D1Database;
  AI: any;  // Workers AI binding
}

// ── Types ──────────────────────────────────────────────────────────

// transport.rest types (for fallback)
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

interface WeatherData {
  weather_code: number | null;
  temperature: number | null;
  precipitation: number | null;
  wind_speed: number | null;
}

// IRIS types
interface IrisPlanStop {
  id: string;
  line: string;
  plannedDep: string;   // YYMMDDHHMM
  platform: string;
  dpPath: string;       // future stations pipe-separated
}

interface IrisRealtimeUpdate {
  depChangedTime: string | null; // YYMMDDHHMM
  depCancelled: boolean;
}

interface MergedIrisDeparture {
  id: string;
  line: string;
  plannedDep: string;     // YYMMDDHHMM
  actualDep: string | null; // YYMMDDHHMM
  delay: number;          // seconds
  cancelled: boolean;
  platform: string;
  direction: 'muenchen' | 'tutzing';
  directionName: string;  // last station in path
}

// ── Constants ──────────────────────────────────────────────────────

const POSSENHOFEN_ID = '8004874';
const API_BASE = 'https://v6.db.transport.rest';
const IRIS_BASE = 'https://iris.noncd.db.de/iris-tts/timetable';
const EVA_NO = '8004874';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast?latitude=47.9983&longitude=11.3397&current=temperature_2m,precipitation,rain,snowfall,weather_code,wind_speed_10m';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=300', // 5 min cache
};

// ── Generic Helpers ────────────────────────────────────────────────

/**
 * Richtung: Tutzing/Feldafing/südlich = 'tutzing', alles andere = 'muenchen'
 */
function classifyDirection(dir: string): 'muenchen' | 'tutzing' {
  return /tutzing|feldafing|bernried|seeshaupt|weilheim|penzberg/i.test(dir)
    ? 'tutzing'
    : 'muenchen';
}

/** Extrahiert die Stunde (0-23) aus einem ISO-Timestamp */
function extractHour(isoStr: string): number {
  const match = isoStr.match(/T(\d{2}):/);
  return match ? parseInt(match[1], 10) : 0;
}

/** Betriebstag aus ISO-Timestamp (Fahrten nach Mitternacht zählen zum Vortag) */
function extractDate(isoStr: string): string {
  const hour = extractHour(isoStr);
  const d = new Date(isoStr);
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

/**
 * WMO Weather Code → Kategorie für Gruppierung
 */
function weatherCategory(code: number | null): string {
  if (code === null || code === undefined) return 'unbekannt';
  if (code === 0) return 'klar';
  if (code <= 3) return 'bewölkt';
  if (code === 45 || code === 48) return 'nebel';
  if (code >= 51 && code <= 67) return 'regen';   // 51-57 drizzle, 61-67 rain
  if (code >= 71 && code <= 77) return 'schnee';   // snowfall
  if (code >= 80 && code <= 82) return 'regen';    // rain showers
  if (code >= 85 && code <= 86) return 'schnee';   // snow showers
  if (code >= 95) return 'gewitter';
  return 'bewölkt'; // fallback for codes 4-44, 49-50, 68-70, 78-79, 83-84, 87-94
}

function json(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

// ── IRIS XML Helpers ───────────────────────────────────────────────

/** Parse attributes from an XML tag string */
function parseAttrs(s: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([\w-]+)="([^"]*)"/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

/**
 * Determine German timezone offset (CET +01:00 / CEST +02:00)
 * DST: last Sunday of March 02:00 CET → last Sunday of October 03:00 CEST
 */
function germanOffset(year: number, month: number, day: number): string {
  if (month < 3 || month > 10) return '+01:00';
  if (month > 3 && month < 10) return '+02:00';
  if (month === 3) {
    const lastSun = 31 - new Date(year, 2, 31).getDay();
    return day >= lastSun ? '+02:00' : '+01:00';
  }
  // October
  const lastSun = 31 - new Date(year, 9, 31).getDay();
  return day < lastSun ? '+02:00' : '+01:00';
}

/** Current German timezone offset in hours (1 or 2) */
function getCurrentGermanOffsetHours(): number {
  const now = new Date();
  const month = now.getUTCMonth() + 1;
  const year = now.getUTCFullYear();
  if (month < 3 || month > 10) return 1;
  if (month > 3 && month < 10) return 2;
  if (month === 3) {
    const lastSun = 31 - new Date(year, 2, 31).getDay();
    return now.getUTCDate() >= lastSun ? 2 : 1;
  }
  const lastSun = 31 - new Date(year, 9, 31).getDay();
  return now.getUTCDate() < lastSun ? 2 : 1;
}

/** Convert IRIS time (YYMMDDHHMM) to ISO 8601 with German timezone */
function irisToISO(t: string): string {
  const yy = t.substring(0, 2);
  const mm = t.substring(2, 4);
  const dd = t.substring(4, 6);
  const hh = t.substring(6, 8);
  const min = t.substring(8, 10);
  const year = 2000 + parseInt(yy);
  const offset = germanOffset(year, parseInt(mm), parseInt(dd));
  return `${year}-${mm}-${dd}T${hh}:${min}:00${offset}`;
}

/** Convert IRIS time to milliseconds (for delay calculation) */
function irisToMs(t: string): number {
  const yy = parseInt(t.substring(0, 2));
  const mm = parseInt(t.substring(2, 4)) - 1;
  const dd = parseInt(t.substring(4, 6));
  const hh = parseInt(t.substring(6, 8));
  const min = parseInt(t.substring(8, 10));
  return new Date(2000 + yy, mm, dd, hh, min, 0).getTime();
}

/** Calculate delay in seconds between two IRIS timestamps */
function irisDelay(planned: string, actual: string): number {
  return Math.round((irisToMs(actual) - irisToMs(planned)) / 1000);
}

/** Format IRIS time as HH:MM */
function irisToHHMM(t: string): string {
  return `${t.substring(6, 8)}:${t.substring(8, 10)}`;
}

/**
 * Get IRIS plan URL parameters for current + next hour (and optionally previous hour)
 */
function getIrisPlanHours(includePrev: boolean = false): { yymmdd: string; hh: string }[] {
  const offsetMs = getCurrentGermanOffsetHours() * 3600000;
  const now = new Date(Date.now() + offsetMs);

  const yy = String(now.getUTCFullYear()).substring(2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const hh = now.getUTCHours();

  const yymmdd = `${yy}${mm}${dd}`;
  const hours: { yymmdd: string; hh: string }[] = [];

  // Helper to compute yymmdd/hh for an offset in hours
  const addHour = (offsetH: number) => {
    const t = new Date(now.getTime() + offsetH * 3600000);
    const y = String(t.getUTCFullYear()).substring(2);
    const m = String(t.getUTCMonth() + 1).padStart(2, '0');
    const d = String(t.getUTCDate()).padStart(2, '0');
    const h = String(t.getUTCHours()).padStart(2, '0');
    hours.push({ yymmdd: `${y}${m}${d}`, hh: h });
  };

  if (includePrev) addHour(-1);
  addHour(0);  // current
  addHour(1);  // next

  return hours;
}

// ── IRIS XML Parsing ───────────────────────────────────────────────

/** Parse IRIS plan XML into an array of S6 departure stops */
function parsePlanXml(xml: string): IrisPlanStop[] {
  const stops: IrisPlanStop[] = [];
  const stopRe = /<s\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/s>/g;
  let match;

  while ((match = stopRe.exec(xml)) !== null) {
    const id = match[1];
    const body = match[2];

    // Get departure attributes (self-closing or with children)
    const dpMatch = body.match(/<dp\s+([^>]*?)\/?>/);
    if (!dpMatch) continue; // no departure → skip

    const dpAttrs = parseAttrs(dpMatch[1]);
    const line = dpAttrs.l || '';

    // Only S6
    if (line !== 'S6') continue;

    stops.push({
      id,
      line,
      plannedDep: dpAttrs.pt || '',
      platform: dpAttrs.pp || '',
      dpPath: dpAttrs.ppth || '',
    });
  }

  return stops;
}

/** Parse IRIS realtime (fchg) XML into a map of updates keyed by stop ID */
function parseFchgXml(xml: string): Map<string, IrisRealtimeUpdate> {
  const updates = new Map<string, IrisRealtimeUpdate>();
  const stopRe = /<s\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/s>/g;
  let match;

  while ((match = stopRe.exec(xml)) !== null) {
    const id = match[1];
    const body = match[2];

    // Get departure realtime attributes
    const dpMatch = body.match(/<dp\s+([^>]*?)\/?>/);
    if (!dpMatch) continue;

    const dpAttrs = parseAttrs(dpMatch[1]);

    updates.set(id, {
      depChangedTime: dpAttrs.ct || null,
      depCancelled: dpAttrs.cs === 'c',
    });
  }

  return updates;
}

// ── IRIS Fetch & Merge ─────────────────────────────────────────────

/**
 * Fetch S6 departures from IRIS (plan + realtime).
 * Returns null on failure (caller should fall back to transport.rest).
 */
async function fetchIrisDepartures(
  hours: { yymmdd: string; hh: string }[]
): Promise<MergedIrisDeparture[] | null> {
  try {
    // Parallel: plan XMLs + fchg
    const planPromises = hours.map(({ yymmdd, hh }) =>
      fetch(`${IRIS_BASE}/plan/${EVA_NO}/${yymmdd}/${hh}`, {
        headers: { 'User-Agent': 'StarnbergEvents-TrainTracker/1.0' },
      })
    );

    const fchgPromise = fetch(`${IRIS_BASE}/fchg/${EVA_NO}`, {
      headers: { 'User-Agent': 'StarnbergEvents-TrainTracker/1.0' },
    });

    const [fchgResp, ...planResps] = await Promise.all([fchgPromise, ...planPromises]);

    // Verify plan responses
    for (const resp of planResps) {
      if (!resp.ok) {
        console.error(`IRIS plan error: ${resp.status} ${resp.statusText}`);
        return null;
      }
    }

    // Parse all plan XMLs → deduplicated by stop ID
    const planStops = new Map<string, IrisPlanStop>();
    for (const resp of planResps) {
      const xml = await resp.text();
      for (const stop of parsePlanXml(xml)) {
        planStops.set(stop.id, stop);
      }
    }

    // Parse fchg (non-fatal if it fails — we just won't have realtime data)
    let realtimeUpdates = new Map<string, IrisRealtimeUpdate>();
    if (fchgResp.ok) {
      const fchgXml = await fchgResp.text();
      realtimeUpdates = parseFchgXml(fchgXml);
    } else {
      console.warn(`IRIS fchg error: ${fchgResp.status} — proceeding without realtime`);
    }

    // Merge plan + realtime
    const departures: MergedIrisDeparture[] = [];

    for (const [id, plan] of planStops) {
      const rt = realtimeUpdates.get(id);
      const cancelled = rt?.depCancelled ?? false;
      const actualDep = rt?.depChangedTime ?? null;
      const delay = actualDep ? irisDelay(plan.plannedDep, actualDep) : 0;

      // Direction from departure path (last station)
      const pathStations = plan.dpPath.split('|').filter(Boolean);
      const directionName = pathStations[pathStations.length - 1] || 'Unbekannt';

      departures.push({
        id,
        line: plan.line,
        plannedDep: plan.plannedDep,
        actualDep,
        delay,
        cancelled,
        platform: plan.platform,
        direction: classifyDirection(plan.dpPath),
        directionName,
      });
    }

    // Sort by planned departure
    departures.sort((a, b) => a.plannedDep.localeCompare(b.plannedDep));

    console.log(`[iris] Parsed ${departures.length} S6 departures from ${hours.length} plan hours`);
    return departures;
  } catch (err) {
    console.error('IRIS fetch failed:', err);
    return null;
  }
}

// ── Weather (with D1 cache to avoid rate limits) ──────────────────

const WEATHER_CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes – Open-Meteo free tier has shared IP limits on CF Workers

async function fetchWeatherRaw(): Promise<WeatherData> {
  try {
    const resp = await fetch(WEATHER_API, {
      headers: { 'User-Agent': 'StarnbergEvents-TrainTracker/1.0' },
    });
    if (!resp.ok) {
      console.error(`Weather API error: ${resp.status} ${resp.statusText}`);
      return { weather_code: null, temperature: null, precipitation: null, wind_speed: null };
    }
    const data: any = await resp.json();
    const c = data.current;
    return {
      weather_code: c?.weather_code ?? null,
      temperature: c?.temperature_2m ?? null,
      precipitation: c?.precipitation ?? null,
      wind_speed: c?.wind_speed_10m ?? null,
    };
  } catch (e) {
    console.error('Weather fetch failed:', e);
    return { weather_code: null, temperature: null, precipitation: null, wind_speed: null };
  }
}

/**
 * Get weather with D1 cache. Only calls the API if cache is older than 30 min.
 * This avoids hitting Open-Meteo's daily rate limit (shared Cloudflare IPs).
 */
async function fetchWeather(db?: D1Database): Promise<WeatherData> {
  const nullWeather: WeatherData = { weather_code: null, temperature: null, precipitation: null, wind_speed: null };

  if (!db) return fetchWeatherRaw();

  try {
    // Check cache
    const cached = await db.prepare(
      `SELECT weather_code, temperature, precipitation, wind_speed, fetched_at FROM weather_cache WHERE id = 1`
    ).first<{ weather_code: number | null; temperature: number | null; precipitation: number | null; wind_speed: number | null; fetched_at: string }>();

    if (cached && cached.fetched_at) {
      const age = Date.now() - new Date(cached.fetched_at).getTime();
      if (age < WEATHER_CACHE_TTL_MS) {
        console.log(`[weather] Using cached data (${Math.round(age / 60000)} min old)`);
        return {
          weather_code: cached.weather_code,
          temperature: cached.temperature,
          precipitation: cached.precipitation,
          wind_speed: cached.wind_speed,
        };
      }
    }

    // Fetch fresh
    const fresh = await fetchWeatherRaw();

    // Only update cache if we got valid data
    if (fresh.weather_code !== null) {
      await db.prepare(
        `INSERT INTO weather_cache (id, weather_code, temperature, precipitation, wind_speed, fetched_at)
         VALUES (1, ?, ?, ?, ?, ?)
         ON CONFLICT (id) DO UPDATE SET
           weather_code = excluded.weather_code,
           temperature = excluded.temperature,
           precipitation = excluded.precipitation,
           wind_speed = excluded.wind_speed,
           fetched_at = excluded.fetched_at`
      ).bind(fresh.weather_code, fresh.temperature, fresh.precipitation, fresh.wind_speed, new Date().toISOString()).run();
      console.log(`[weather] Fresh data cached: code=${fresh.weather_code} temp=${fresh.temperature}°`);
    } else {
      console.warn('[weather] API returned null, using stale cache if available');
      // Return stale cache if available
      if (cached && cached.weather_code !== null) {
        return {
          weather_code: cached.weather_code,
          temperature: cached.temperature,
          precipitation: cached.precipitation,
          wind_speed: cached.wind_speed,
        };
      }
    }

    return fresh;
  } catch (e) {
    console.error('Weather cache error:', e);
    return fetchWeatherRaw();
  }
}

// ── Cron: Daten sammeln ────────────────────────────────────────────

/**
 * Fallback: fetch departures from transport.rest (existing logic)
 */
async function fetchTransportRestDepartures(): Promise<ApiDeparture[]> {
  const resp = await fetch(
    `${API_BASE}/stops/${POSSENHOFEN_ID}/departures?duration=30&suburban=true`,
    {
      headers: { 'Accept': 'application/json', 'User-Agent': 'StarnbergEvents-TrainTracker/1.0' },
    }
  );

  if (!resp.ok) {
    console.error(`transport.rest API error: ${resp.status} ${resp.statusText}`);
    return [];
  }

  const data: ApiResponse = await resp.json();
  return data.departures.filter(
    (d) => d.line?.product === 'suburban' && /S6/i.test(d.line?.name || '')
  );
}

async function collectDepartures(env: Env): Promise<{ inserted: number; updated: number; source: string }> {
  const now = new Date().toISOString();

  // Parallel: IRIS + Weather (with D1 cache)
  const hours = getIrisPlanHours(false); // current + next hour
  const [irisDeps, weather] = await Promise.all([
    fetchIrisDepartures(hours),
    fetchWeather(env.DB),
  ]);

  console.log(`[weather] code=${weather.weather_code} temp=${weather.temperature}° precip=${weather.precipitation}mm wind=${weather.wind_speed}km/h`);

  // ── Backfill: update today's departures that have no weather data ──
  if (weather.weather_code !== null) {
    const today = todayStr();
    const backfill = await env.DB.prepare(`
      UPDATE departures SET
        weather_code = ?,
        temperature = ?,
        precipitation = ?,
        wind_speed = ?
      WHERE date = ? AND weather_code IS NULL
    `).bind(weather.weather_code, weather.temperature, weather.precipitation, weather.wind_speed, today).run();
    if (backfill.meta.changes > 0) {
      console.log(`[weather] Backfilled ${backfill.meta.changes} departures with weather data`);
    }
  }

  // ── Try IRIS first ──
  if (irisDeps && irisDeps.length > 0) {
    let inserted = 0;
    let updated = 0;

    for (const dep of irisDeps) {
      const isoPlanned = irisToISO(dep.plannedDep);
      const date = extractDate(isoPlanned);
      const hour = extractHour(isoPlanned);
      const isCancelled = dep.cancelled ? 1 : 0;

      const result = await env.DB.prepare(`
        INSERT INTO departures (trip_id, date, planned_when, planned_hour, delay, cancelled, direction, line, recorded_at, weather_code, temperature, precipitation, wind_speed)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (trip_id, date) DO UPDATE SET
          delay = excluded.delay,
          cancelled = MAX(departures.cancelled, excluded.cancelled),
          recorded_at = excluded.recorded_at,
          weather_code = COALESCE(excluded.weather_code, departures.weather_code),
          temperature = COALESCE(excluded.temperature, departures.temperature),
          precipitation = COALESCE(excluded.precipitation, departures.precipitation),
          wind_speed = COALESCE(excluded.wind_speed, departures.wind_speed)
      `).bind(
        dep.id, date, isoPlanned, hour,
        dep.delay, isCancelled, dep.direction, dep.line, now,
        weather.weather_code, weather.temperature, weather.precipitation, weather.wind_speed
      ).run();

      if (result.meta.changes > 0) updated++;
      inserted++;
    }

    return { inserted: irisDeps.length, updated, source: 'iris' };
  }

  // ── Fallback: transport.rest ──
  console.warn('[cron] IRIS failed or empty, falling back to transport.rest');

  let s6: ApiDeparture[];
  try {
    s6 = await fetchTransportRestDepartures();
  } catch (err) {
    console.error('transport.rest fallback also failed:', err);
    return { inserted: 0, updated: 0, source: 'none' };
  }

  if (s6.length === 0) {
    return { inserted: 0, updated: 0, source: 'transport.rest' };
  }

  let inserted = 0;
  let updated = 0;

  for (const dep of s6) {
    const date = extractDate(dep.plannedWhen);
    const hour = extractHour(dep.plannedWhen);
    const direction = classifyDirection(dep.direction);
    const isCancelled = dep.cancelled === true || (dep.when === null && dep.remarks?.some(
      r => r.type === 'status' && /fällt aus|cancelled|Ausfall/i.test(r.text || '')
    )) ? 1 : 0;

    const result = await env.DB.prepare(`
      INSERT INTO departures (trip_id, date, planned_when, planned_hour, delay, cancelled, direction, line, recorded_at, weather_code, temperature, precipitation, wind_speed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT (trip_id, date) DO UPDATE SET
        delay = excluded.delay,
        cancelled = MAX(departures.cancelled, excluded.cancelled),
        recorded_at = excluded.recorded_at,
        weather_code = COALESCE(excluded.weather_code, departures.weather_code),
        temperature = COALESCE(excluded.temperature, departures.temperature),
        precipitation = COALESCE(excluded.precipitation, departures.precipitation),
        wind_speed = COALESCE(excluded.wind_speed, departures.wind_speed)
    `).bind(
      dep.tripId, date, dep.plannedWhen, hour,
      dep.delay, isCancelled, direction, dep.line.name, now,
      weather.weather_code, weather.temperature, weather.precipitation, weather.wind_speed
    ).run();

    if (result.meta.changes > 0) updated++;
    inserted++;
  }

  return { inserted: s6.length, updated, source: 'transport.rest' };
}

// ── /api/live: Echtzeit-Abfahrten ──────────────────────────────────

async function handleLive(request: Request): Promise<Response> {
  // Try Cloudflare Cache API (2 min TTL)
  const cache = caches.default;
  const cacheKey = new Request(new URL('/api/live', request.url).toString(), request);
  const cachedResp = await cache.match(cacheKey);
  if (cachedResp) return cachedResp;

  // Fetch IRIS data (prev + current + next hour for comprehensive view)
  const hours = getIrisPlanHours(true);
  let departures: MergedIrisDeparture[] | null = null;
  let source: 'iris' | 'transport.rest' = 'iris';

  departures = await fetchIrisDepartures(hours);

  // Fallback to transport.rest
  if (!departures || departures.length === 0) {
    source = 'transport.rest';
    try {
      const s6 = await fetchTransportRestDepartures();
      departures = s6.map(dep => ({
        id: dep.tripId,
        line: dep.line.name,
        plannedDep: '', // not in IRIS format
        actualDep: null,
        delay: dep.delay ?? 0,
        cancelled: dep.cancelled ?? false,
        platform: '',
        direction: classifyDirection(dep.direction),
        directionName: dep.direction,
        // Store ISO times for transport.rest path
        _plannedWhen: dep.plannedWhen,
        _actualWhen: dep.when,
      })) as any[];
    } catch (err) {
      console.error('Live: all sources failed:', err);
      return json({ station: 'Possenhofen', departures: [], source: 'error', cachedAt: new Date().toISOString() });
    }
  }

  // Filter to upcoming departures (past 5 min to +120 min)
  const offsetMs = getCurrentGermanOffsetHours() * 3600000;
  const nowLocal = new Date(Date.now() + offsetMs);
  const nowMinutes = nowLocal.getUTCHours() * 60 + nowLocal.getUTCMinutes();

  const formatted = (departures || [])
    .filter(dep => {
      if (source === 'transport.rest') return true; // transport.rest already filters by duration
      // For IRIS: filter by time window
      const depTime = dep.cancelled
        ? dep.plannedDep
        : (dep.actualDep || dep.plannedDep);
      if (!depTime || depTime.length < 10) return true;
      const depHH = parseInt(depTime.substring(6, 8));
      const depMM = parseInt(depTime.substring(8, 10));
      const depMinutes = depHH * 60 + depMM;
      // Show trains from -1 min to +120 min (tight window to avoid stale entries)
      const diff = depMinutes - nowMinutes;
      return diff >= -1 && diff <= 120;
    })
    .map(dep => {
      if (source === 'transport.rest') {
        const d = dep as any;
        const pw = d._plannedWhen ? new Date(d._plannedWhen) : null;
        const aw = d._actualWhen ? new Date(d._actualWhen) : null;
        return {
          line: dep.line,
          direction: dep.directionName,
          plannedTime: pw ? `${String(pw.getHours()).padStart(2, '0')}:${String(pw.getMinutes()).padStart(2, '0')}` : '--:--',
          actualTime: aw ? `${String(aw.getHours()).padStart(2, '0')}:${String(aw.getMinutes()).padStart(2, '0')}` : null,
          delay: Math.round(dep.delay / 60),
          cancelled: dep.cancelled,
          platform: dep.platform || null,
        };
      }
      return {
        line: dep.line,
        direction: dep.directionName,
        plannedTime: irisToHHMM(dep.plannedDep),
        actualTime: dep.actualDep ? irisToHHMM(dep.actualDep) : null,
        delay: Math.round(dep.delay / 60),
        cancelled: dep.cancelled,
        platform: dep.platform || null,
      };
    });

  const cachedAt = new Date().toISOString();
  const body = {
    station: 'Possenhofen',
    departures: formatted,
    source,
    cachedAt,
  };

  const response = new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
      ...CORS,
      'Cache-Control': 'public, max-age=120', // 2 min
    },
  });

  // Store in cache (non-blocking)
  const cacheResp = response.clone();
  await cache.put(cacheKey, cacheResp);

  return response;
}

// ── HTTP: Stats API ────────────────────────────────────────────────

async function handleStats(db: D1Database, url: URL): Promise<Response> {
  const period = url.searchParams.get('period') || 'today';

  let dateFrom: string;
  const today = todayStr();

  switch (period) {
    case 'week':  dateFrom = daysAgo(7); break;
    case 'month': dateFrom = daysAgo(30); break;
    default:      dateFrom = today; break;
  }

  const isToday = period === 'today';
  const where = isToday ? 'date = ?1' : 'date >= ?1';

  const overall = await db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN cancelled = 1 THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 300 THEN 1 ELSE 0 END) as on_time,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 0 THEN 1 ELSE 0 END) as on_time_exact,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 0 AND delay <= 300 THEN 1 ELSE 0 END) as minor_delay,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 300 THEN 1 ELSE 0 END) as delayed,
      SUM(CASE WHEN cancelled = 0 AND delay IS NULL THEN 1 ELSE 0 END) as no_data,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END), 0) as avg_delay,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 300 THEN delay END), 0) as avg_delay_late,
      MAX(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END) as max_delay,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 0 THEN delay END), 0) as avg_positive_delay
    FROM departures WHERE ${where}
  `).bind(dateFrom).first();

  const byDirection = await db.prepare(`
    SELECT
      direction,
      COUNT(*) as total,
      SUM(CASE WHEN cancelled = 1 THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 300 THEN 1 ELSE 0 END) as on_time,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 0 THEN 1 ELSE 0 END) as on_time_exact,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 0 AND delay <= 300 THEN 1 ELSE 0 END) as minor_delay,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 300 THEN 1 ELSE 0 END) as delayed,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END), 0) as avg_delay
    FROM departures WHERE ${where}
    GROUP BY direction
  `).bind(dateFrom).all();

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

  const overall = await db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN cancelled = 1 THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 300 THEN 1 ELSE 0 END) as on_time,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 0 THEN 1 ELSE 0 END) as on_time_exact,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 0 AND delay <= 300 THEN 1 ELSE 0 END) as minor_delay,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 300 THEN 1 ELSE 0 END) as delayed,
      SUM(CASE WHEN cancelled = 0 AND delay IS NULL THEN 1 ELSE 0 END) as no_data,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END), 0) as avg_delay,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 300 THEN delay END), 0) as avg_delay_late,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 0 THEN delay END), 0) as avg_positive_delay,
      MAX(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END) as max_delay,
      MIN(date) as first_date,
      MAX(date) as last_date
    FROM departures WHERE date >= ?1
  `).bind(since).first();

  const todayStats = await db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN cancelled = 1 THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 300 THEN 1 ELSE 0 END) as on_time,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 300 THEN 1 ELSE 0 END) as delayed,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END), 0) as avg_delay
    FROM departures WHERE date = ?1
  `).bind(today).first();

  const byDirection = (await db.prepare(`
    SELECT direction,
      COUNT(*) as total,
      SUM(CASE WHEN cancelled = 1 THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 300 THEN 1 ELSE 0 END) as on_time,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 0 THEN 1 ELSE 0 END) as on_time_exact,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 0 AND delay <= 300 THEN 1 ELSE 0 END) as minor_delay,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 300 THEN 1 ELSE 0 END) as delayed,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END), 0) as avg_delay
    FROM departures WHERE date >= ?1 GROUP BY direction
  `).bind(since).all()).results;

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

  const delayDistribution = (await db.prepare(`
    SELECT
      CASE
        WHEN delay IS NULL THEN 'no_data'
        WHEN delay <= 0 THEN 'exact'
        WHEN delay <= 60 THEN '0-1min'
        WHEN delay <= 120 THEN '1-2min'
        WHEN delay <= 180 THEN '2-3min'
        WHEN delay <= 240 THEN '3-4min'
        WHEN delay <= 300 THEN '4-5min'
        WHEN delay <= 600 THEN '5-10min'
        WHEN delay <= 1200 THEN '10-20min'
        ELSE '20min+'
      END as bucket,
      COUNT(*) as count,
      SUM(CASE WHEN cancelled = 1 THEN 1 ELSE 0 END) as cancelled_count
    FROM departures WHERE date >= ?1
    GROUP BY bucket
  `).bind(since).all()).results;

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

  const rushHour = (await db.prepare(`
    SELECT
      CASE
        WHEN planned_hour BETWEEN 7 AND 9 THEN 'morning_rush'
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

  const worstDelays = (await db.prepare(`
    SELECT planned_when, delay, direction, date, cancelled
    FROM departures
    WHERE date >= ?1 AND delay IS NOT NULL AND delay > 300
    ORDER BY delay DESC LIMIT 10
  `).bind(since).all()).results;

  const todayDepartures = (await db.prepare(`
    SELECT planned_when, planned_hour, delay, cancelled, direction, weather_code, temperature, precipitation
    FROM departures WHERE date = ?1
    ORDER BY planned_when
  `).bind(today).all()).results;

  const byWeather = (await db.prepare(`
    SELECT
      CASE
        WHEN weather_code IS NULL THEN 'unbekannt'
        WHEN weather_code = 0 THEN 'klar'
        WHEN weather_code <= 3 THEN 'bewölkt'
        WHEN weather_code IN (45, 48) THEN 'nebel'
        WHEN weather_code BETWEEN 51 AND 67 THEN 'regen'
        WHEN weather_code BETWEEN 71 AND 77 THEN 'schnee'
        WHEN weather_code BETWEEN 80 AND 82 THEN 'regen'
        WHEN weather_code BETWEEN 85 AND 86 THEN 'schnee'
        WHEN weather_code >= 95 THEN 'gewitter'
        ELSE 'bewölkt'
      END as weather,
      COUNT(*) as total,
      SUM(CASE WHEN cancelled = 1 THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 300 THEN 1 ELSE 0 END) as on_time,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 300 THEN 1 ELSE 0 END) as delayed,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END), 0) as avg_delay,
      MAX(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END) as max_delay,
      ROUND(AVG(temperature), 1) as avg_temp,
      ROUND(AVG(precipitation), 2) as avg_precip,
      ROUND(AVG(wind_speed), 1) as avg_wind
    FROM departures WHERE date >= ?1
    GROUP BY weather
    ORDER BY total DESC
  `).bind(since).all()).results;

  const byTemperature = (await db.prepare(`
    SELECT
      CASE
        WHEN temperature IS NULL THEN 'unbekannt'
        WHEN temperature < -5 THEN 'unter -5°'
        WHEN temperature < 0 THEN '-5 bis 0°'
        WHEN temperature < 5 THEN '0 bis 5°'
        WHEN temperature < 10 THEN '5 bis 10°'
        WHEN temperature < 15 THEN '10 bis 15°'
        WHEN temperature < 20 THEN '15 bis 20°'
        WHEN temperature < 25 THEN '20 bis 25°'
        ELSE 'über 25°'
      END as temp_range,
      COUNT(*) as total,
      SUM(CASE WHEN cancelled = 1 THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 300 THEN 1 ELSE 0 END) as on_time,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 300 THEN 1 ELSE 0 END) as delayed,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END), 0) as avg_delay
    FROM departures WHERE date >= ?1 AND temperature IS NOT NULL
    GROUP BY temp_range
    ORDER BY MIN(temperature)
  `).bind(since).all()).results;

  return json({
    days, since, generatedAt: new Date().toISOString(),
    overall, today: todayStats,
    byDirection, byHour, byWeekday,
    delayDistribution, daily, rushHour,
    worstDelays, todayDepartures,
    byWeather, byTemperature
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
    SELECT trip_id, planned_when, planned_hour, delay, cancelled, direction, line, recorded_at,
           weather_code, temperature, precipitation, wind_speed
    FROM departures
    WHERE date = ?1
    ORDER BY planned_when
  `).bind(date).all();

  return json({ date, count: deps.results.length, departures: deps.results });
}

// ── AI Insight ─────────────────────────────────────────────────────

async function handleAiInsight(env: Env, url: URL): Promise<Response> {
  const days = Math.min(parseInt(url.searchParams.get('days') || '30', 10), 90);
  const since = daysAgo(days);

  // Ensure cache table exists
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS ai_insights (
      id INTEGER PRIMARY KEY,
      period_days INTEGER NOT NULL,
      insight_text TEXT NOT NULL,
      data_hash TEXT NOT NULL,
      generated_at TEXT NOT NULL
    )
  `).run();

  // Fetch analysis data (reuse same queries as /api/analysis)
  const overall = await env.DB.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN cancelled = 1 THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 300 THEN 1 ELSE 0 END) as on_time,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 0 THEN 1 ELSE 0 END) as on_time_exact,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay > 300 THEN 1 ELSE 0 END) as delayed,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END), 0) as avg_delay,
      MAX(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END) as max_delay
    FROM departures WHERE date >= ?1
  `).bind(since).first();

  if (!overall || !overall.total || (overall.total as number) === 0) {
    return json({ insight: null, generatedAt: null, periodDays: days, dataPoints: 0, cached: false });
  }

  const total = overall.total as number;
  const onTime = (overall.on_time || 0) as number;
  const cancelled = (overall.cancelled || 0) as number;
  const delayed = (overall.delayed || 0) as number;
  const avgDelay = (overall.avg_delay || 0) as number;
  const maxDelay = (overall.max_delay || 0) as number;
  const rate = total > 0 ? Math.round((onTime / total) * 100) : 0;
  const cancelRate = total > 0 ? ((cancelled / total) * 100).toFixed(1) : '0.0';

  // Direction stats
  const byDirection = (await env.DB.prepare(`
    SELECT direction,
      COUNT(*) as total,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 300 THEN 1 ELSE 0 END) as on_time,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END), 0) as avg_delay
    FROM departures WHERE date >= ?1 GROUP BY direction
  `).bind(since).all()).results;

  const muc = byDirection.find((d: any) => d.direction === 'muenchen') as any;
  const tut = byDirection.find((d: any) => d.direction === 'tutzing') as any;
  const mucTotal = muc ? (muc.total as number) : 0;
  const mucOnTime = muc ? (muc.on_time as number) : 0;
  const mucAvg = muc ? (muc.avg_delay as number) : 0;
  const tutTotal = tut ? (tut.total as number) : 0;
  const tutOnTime = tut ? (tut.on_time as number) : 0;
  const tutAvg = tut ? (tut.avg_delay as number) : 0;

  // Rush hour stats
  const rushHour = (await env.DB.prepare(`
    SELECT
      CASE
        WHEN planned_hour BETWEEN 7 AND 9 THEN 'morning_rush'
        WHEN planned_hour BETWEEN 16 AND 18 THEN 'evening_rush'
        ELSE 'off_peak'
      END as period,
      COUNT(*) as total,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 300 THEN 1 ELSE 0 END) as on_time
    FROM departures WHERE date >= ?1
    GROUP BY period
  `).bind(since).all()).results;

  const morning = rushHour.find((r: any) => r.period === 'morning_rush') as any;
  const evening = rushHour.find((r: any) => r.period === 'evening_rush') as any;
  const offPeak = rushHour.find((r: any) => r.period === 'off_peak') as any;
  const rushPct = (item: any) => item && item.total > 0 ? Math.round(((item.on_time || 0) / item.total) * 100) : 0;

  // Weather correlation
  const byWeather = (await env.DB.prepare(`
    SELECT
      CASE
        WHEN weather_code IS NULL THEN 'unbekannt'
        WHEN weather_code = 0 THEN 'klar'
        WHEN weather_code <= 3 THEN 'bewoelkt'
        WHEN weather_code IN (45, 48) THEN 'nebel'
        WHEN weather_code BETWEEN 51 AND 67 THEN 'regen'
        WHEN weather_code BETWEEN 71 AND 77 THEN 'schnee'
        WHEN weather_code BETWEEN 80 AND 82 THEN 'regen'
        WHEN weather_code BETWEEN 85 AND 86 THEN 'schnee'
        WHEN weather_code >= 95 THEN 'gewitter'
        ELSE 'bewoelkt'
      END as weather,
      COUNT(*) as total,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 300 THEN 1 ELSE 0 END) as on_time,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END), 0) as avg_delay
    FROM departures WHERE date >= ?1
    GROUP BY weather ORDER BY total DESC
  `).bind(since).all()).results;

  const weatherLines = byWeather
    .filter((w: any) => w.weather !== 'unbekannt' && (w.total as number) > 0)
    .map((w: any) => {
      const wTotal = w.total as number;
      const wRate = wTotal > 0 ? Math.round(((w.on_time as number || 0) / wTotal) * 100) : 0;
      const wAvg = Math.round((w.avg_delay as number || 0) / 60);
      return `- ${w.weather}: ${wRate}% puenktlich, Ø ${wAvg} Min (${wTotal} Zuege)`;
    }).join('\n');

  // Weekday stats
  const byWeekday = (await env.DB.prepare(`
    SELECT
      CAST(strftime('%w', date) AS INTEGER) as weekday,
      COUNT(*) as total,
      SUM(CASE WHEN cancelled = 0 AND delay IS NOT NULL AND delay <= 300 THEN 1 ELSE 0 END) as on_time,
      ROUND(AVG(CASE WHEN cancelled = 0 AND delay IS NOT NULL THEN delay END), 0) as avg_delay
    FROM departures WHERE date >= ?1
    GROUP BY weekday ORDER BY weekday
  `).bind(since).all()).results;

  const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const weekdayLines = byWeekday.map((w: any) => {
    const wTotal = w.total as number;
    const wRate = wTotal > 0 ? Math.round(((w.on_time as number || 0) / wTotal) * 100) : 0;
    const wAvg = Math.round((w.avg_delay as number || 0) / 60);
    return `- ${dayNames[w.weekday as number]}: ${wRate}% puenktlich, Ø ${wAvg} Min (${wTotal} Zuege)`;
  }).join('\n');

  // Create data hash for cache invalidation
  const hashInput = `${days}|${total}|${onTime}|${cancelled}|${rate}|${avgDelay}|${maxDelay}`;
  // Simple hash: convert to base36 checksum
  let hash = 0;
  for (let i = 0; i < hashInput.length; i++) {
    hash = ((hash << 5) - hash + hashInput.charCodeAt(i)) | 0;
  }
  const dataHash = Math.abs(hash).toString(36);

  // Check cache
  const cached = await env.DB.prepare(`
    SELECT insight_text, data_hash, generated_at FROM ai_insights WHERE period_days = ?1
  `).bind(days).first<{ insight_text: string; data_hash: string; generated_at: string }>();

  if (cached && cached.data_hash === dataHash) {
    const age = Date.now() - new Date(cached.generated_at).getTime();
    if (age < 24 * 60 * 60 * 1000) {
      console.log(`[ai-insight] Returning cached insight for ${days}d (${Math.round(age / 3600000)}h old)`);
      return json({
        insight: cached.insight_text,
        generatedAt: cached.generated_at,
        periodDays: days,
        dataPoints: total,
        cached: true,
      });
    }
  }

  // Build prompt
  const mucRate = mucTotal > 0 ? Math.round((mucOnTime / mucTotal) * 100) : 0;
  const tutRate = tutTotal > 0 ? Math.round((tutOnTime / tutTotal) * 100) : 0;

  const prompt = `Du bist ein Datenanalyst fuer den S-Bahn-Verkehr. Analysiere die folgenden Statistiken der S6 am Bahnhof Possenhofen und erstelle eine kurze, praegnante Analyse auf Deutsch. Keine Emojis verwenden.

Zeitraum: ${days} Tage
Gesamtzuege: ${total}
Puenktlichkeitsrate: ${rate}%
Ausfallrate: ${cancelRate}%
Durchschnittliche Verspaetung: ${Math.round(avgDelay / 60)} Min
Maximale Verspaetung: ${Math.round(maxDelay / 60)} Min

Richtungsvergleich:
- Muenchen: ${mucRate}% puenktlich, Ø ${Math.round(mucAvg / 60)} Min (${mucTotal} Zuege)
- Tutzing: ${tutRate}% puenktlich, Ø ${Math.round(tutAvg / 60)} Min (${tutTotal} Zuege)

Rush Hour:
- Morning Rush (7-10): ${rushPct(morning)}%
- Evening Rush (16-19): ${rushPct(evening)}%
- Nebenzeit: ${rushPct(offPeak)}%

Wetter-Korrelation:
${weatherLines || 'Keine Wetterdaten verfuegbar'}

Wochentag-Muster:
${weekdayLines || 'Keine Wochentagdaten verfuegbar'}

Schreibe eine Analyse in 3-5 Absaetzen:
1. Gesamtbewertung der Zuverlaessigkeit
2. Auffaellige Muster (Richtung, Tageszeit, Wochentag)
3. Wetter-Einfluss (falls erkennbar)
4. Fazit und Einordnung

Halte dich an die Fakten. Sei direkt und sachlich. Keine Floskeln. Keine Emojis. Antworte nur mit der Analyse, ohne Ueberschriften oder Nummerierung.`;

  // Call Workers AI
  try {
    const aiResponse = await env.AI.run('@cf/openai/gpt-oss-120b', {
      input: prompt,
      reasoning: { effort: 'low' },
    });

    // Responses API: extract text from output_text or response field
    let insightText = aiResponse?.output_text || aiResponse?.response || '';
    if (typeof insightText !== 'string') insightText = '';
    insightText = insightText.trim();

    if (!insightText) {
      console.error('[ai-insight] Empty response from AI');
      return json({ insight: null, generatedAt: null, periodDays: days, dataPoints: total, cached: false });
    }

    const generatedAt = new Date().toISOString();

    // Store in cache (upsert by period_days)
    await env.DB.prepare(`
      INSERT INTO ai_insights (id, period_days, insight_text, data_hash, generated_at)
      VALUES (?1, ?2, ?3, ?4, ?5)
      ON CONFLICT (id) DO UPDATE SET
        period_days = excluded.period_days,
        insight_text = excluded.insight_text,
        data_hash = excluded.data_hash,
        generated_at = excluded.generated_at
    `).bind(days, days, insightText, dataHash, generatedAt).run();

    console.log(`[ai-insight] Generated new insight for ${days}d (${insightText.length} chars)`);

    return json({
      insight: insightText,
      generatedAt,
      periodDays: days,
      dataPoints: total,
      cached: false,
    });
  } catch (err) {
    console.error('[ai-insight] AI call failed:', err);
    // Return stale cache if available
    if (cached) {
      return json({
        insight: cached.insight_text,
        generatedAt: cached.generated_at,
        periodDays: days,
        dataPoints: total,
        cached: true,
      });
    }
    return json({ insight: null, generatedAt: null, periodDays: days, dataPoints: total, cached: false });
  }
}

// ── Export ──────────────────────────────────────────────────────────

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    const result = await collectDepartures(env);
    console.log(`[cron] Collected ${result.inserted} S6 departures via ${result.source}`);
  },

  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);

    try {
      switch (url.pathname) {
        case '/api/stats':       return handleStats(env.DB, url);
        case '/api/history':     return handleHistory(env.DB, url);
        case '/api/departures':  return handleDepartures(env.DB, url);
        case '/api/analysis':    return handleAnalysis(env.DB, url);
        case '/api/live':        return handleLive(request);
        case '/api/ai-insight':  return handleAiInsight(env, url);
        default:
          return new Response(
            JSON.stringify({
              name: 'S6 Train Tracker',
              endpoints: ['/api/stats', '/api/history', '/api/departures', '/api/analysis', '/api/live', '/api/ai-insight'],
              station: 'Possenhofen',
              source: 'IRIS + transport.rest fallback',
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
