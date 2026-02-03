# API-Integrationen - Starnberg Events

Alle APIs werden **client-side** aufgerufen (kein Backend/Proxy). CORS-fähig, keine API-Keys erforderlich.

---

## 1. Open-Meteo Weather API

**Zweck:** Wetterdaten für Starnberg

### Endpoint
```
https://api.open-meteo.com/v1/forecast
```

### Request
```javascript
const params = {
  latitude: 47.9983,
  longitude: 11.3397,
  current: 'temperature_2m,weather_code',
  daily: 'sunrise,sunset',
  timezone: 'Europe/Berlin',
  forecast_days: 1
};

const url = `https://api.open-meteo.com/v1/forecast?${new URLSearchParams(params)}`;
const res = await fetch(url);
const data = await res.json();
```

### Response Structure
```json
{
  "current": {
    "time": "2026-02-03T23:00",
    "temperature_2m": 2.8,
    "weather_code": 3
  },
  "daily": {
    "time": ["2026-02-03"],
    "sunrise": ["2026-02-03T07:42"],
    "sunset": ["2026-02-03T17:28"]
  }
}
```

### Weather Codes
```javascript
// WMO Weather interpretation codes
0:  Klarer Himmel
1-3: Bewölkt (teilweise, überwiegend, bedeckt)
45-48: Nebel
51-67: Regen (verschiedene Intensitäten)
71-77: Schnee
80-82: Regenschauer
85-86: Schneeschauer
95-99: Gewitter
```

### Icon Mapping
```javascript
function getWeatherIcon(code) {
  if (code === 0) return icons.sun;           // ☀️
  if (code <= 3) return icons.cloudSun;       // ⛅
  if (code <= 48) return icons.cloud;         // ☁️
  if (code <= 82) return icons.rain;          // 🌧️
  return icons.cloud;
}
```

### Usage in Components
- **WeatherWidget.astro** - Desktop Widget (volle Ansicht)
- **InfoTicker.astro** - Mobile Carousel (Slide 1 + Slide 3)

### Error Handling
```javascript
try {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  
  const res = await fetch(url, { signal: ctrl.signal });
  clearTimeout(timer);
  
  if (!res.ok) throw new Error('API error');
  const data = await res.json();
  
  renderWeather(data);
} catch {
  // Fallback: Zeige "—" oder statische Daten
  renderFallback();
}
```

### Rate Limits
- **Kostenlos:** 10.000 Requests/Tag
- **Keine API-Key:** Öffentlich verfügbar
- **Aktuell:** ~100-200 Requests/Tag (Client-Side nur bei Page Load)

---

## 2. DB Fahrplan API (inoffiziell)

**Zweck:** S-Bahn Echtzeit-Abfahrten für Possenhofen

### Endpoint
```
https://dbf.finalrewind.org/{STATION}.json?version=3
```

### Request
```javascript
const station = 'Possenhofen';
const url = `https://dbf.finalrewind.org/${encodeURIComponent(station)}.json?version=3`;

const ctrl = new AbortController();
setTimeout(() => ctrl.abort(), 8000);

const res = await fetch(url, { signal: ctrl.signal });
const data = await res.json();
```

### Response Structure
```json
{
  "departures": [
    {
      "train": "S 6",
      "destination": "München Hbf",
      "scheduledDeparture": "23:15",
      "delayDeparture": 2,
      "platform": "1",
      "isCancelled": false
    },
    {
      "train": "S 6",
      "destination": "Tutzing",
      "scheduledDeparture": "23:42",
      "delayDeparture": 0,
      "platform": "2",
      "isCancelled": false
    }
  ]
}
```

### Fields
- `train` - Zugnummer (String, z.B. "S 6", "RE 12345")
- `destination` - Endhaltestelle
- `scheduledDeparture` - Planabfahrt (HH:MM)
- `delayDeparture` - Verspätung in Minuten (Number)
- `platform` - Gleisnummer (String)
- `isCancelled` - Zugausfall (Boolean)

### Filtering Logic
```javascript
const sBahn = data.departures
  .filter(d => !d.isCancelled)           // Keine Ausfälle
  .filter(d => d.train.startsWith('S ')) // Nur S-Bahn
  .slice(0, 4);                          // Max 4 Abfahrten
```

### Destination Shortening
```javascript
function shortDest(dest) {
  return dest
    .replace(/\s*\([^)]*\)/g, '')    // "(Gleis 5)" entfernen
    .replace(/ Hbf$/, '')            // "Hauptbahnhof" → ""
    .replace(/ Bahnhof$/, '')        // "Bahnhof" → ""
    .replace(/^München /, 'M-');     // "München Ost" → "M-Ost"
}

// Beispiele:
// "München Hbf (tief)" → "München"
// "Tutzing" → "Tutzing"
// "München Marienplatz" → "M-Marienplatz"
```

### Usage in Components
- **TrainInfo.astro** - Desktop Widget (4 Abfahrten)
- **InfoTicker.astro** - Mobile Carousel (Slide 4, nächste Abfahrt)

### Auto-Refresh
```javascript
document.addEventListener('DOMContentLoaded', () => {
  loadTrain();
  setInterval(loadTrain, 60000); // Alle 60 Sekunden
});
```

### Fallback UI
```html
<div class="train-empty">
  <p><strong>S6</strong> Tutzing ↔ München Hbf</p>
  <p>ca. alle 20 Min · ~35 Min</p>
  <a href="https://iris.noncd.db.de/wbt/js/index.html?bhf=MPH" target="_blank">→ Live bei DB</a>
</div>
```

### Alternative API (Backup)
**Deutsche Bahn IRIS (Web Interface):**
```
https://iris.noncd.db.de/wbt/js/index.html?bhf=MPH
```
- `bhf=MPH` - Stationscode Possenhofen
- Nur Browser-UI, keine JSON API
- Wird als Fallback-Link genutzt

### Stationscodes (Umgebung)
```javascript
const stations = {
  'Possenhofen': 'MPH',
  'Starnberg': 'STA',
  'Tutzing': 'TUT',
  'Gauting': 'GAU',
  'München Hbf': 'MH'
};
```

---

## 3. Schifffahrt Starnberger See (Statisch)

**Zweck:** Fahrplan für Possenhofen (Saison 2026)

### Keine API
Fahrplan ist **hardcoded** in `FerryInfo.astro`:

```javascript
const schedule = [
  { time: '10:50', dest: 'Tutzing', arrival: '11:14', dir: '↓' },
  { time: '11:30', dest: 'Starnberg', arrival: '12:05', dir: '↑' },
  { time: '12:10', dest: 'Tutzing', arrival: '12:34', dir: '↓' },
  { time: '13:55', dest: 'Tutzing', arrival: '14:19', dir: '↓' },
  { time: '14:25', dest: 'Starnberg', arrival: '15:00', dir: '↑' },
  { time: '15:05', dest: 'Tutzing', arrival: '15:29', dir: '↓' },
  { time: '15:35', dest: 'Starnberg', arrival: '16:10', dir: '↑' },
  { time: '16:30', dest: 'Starnberg', arrival: '17:05', dir: '↑' },
  { time: '17:50', dest: 'Starnberg', arrival: '18:25', dir: '↑' }
];
```

### Saison-Check (Client-Side)
```javascript
function isSeason() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  // Saison 2026: 05.04. – 18.10.
  if (month < 4 || month > 10) return false;
  if (month === 4 && day < 5) return false;
  if (month === 10 && day > 18) return false;
  
  return true;
}
```

### Upcoming Departures Logic
```javascript
function getUpcoming() {
  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  
  const upcoming = schedule.filter(s => {
    const [h, m] = s.time.split(':').map(Number);
    return h * 60 + m > currentMins;
  });
  
  return upcoming.length ? upcoming.slice(0, 3) : schedule.slice(0, 3);
}
```

### Warum kein API-Call?
- **Seenschifffahrt.de** hat keine öffentliche API
- Fahrplan ist fix (saisonal, keine Echtzeit-Verspätungen)
- Update einmal jährlich ausreichend

### Update-Prozess (Manuell)
1. Fahrplan auf https://www.seenschifffahrt.de/de/starnberger-see/fahrplan/ prüfen
2. `FerryInfo.astro` editieren → `schedule` Array aktualisieren
3. Saison-Daten anpassen (Start-/Enddatum in `isSeason()`)
4. Build + Deploy

---

## 4. Webcams (Keine API)

**Zweck:** Externe Webcam-Links

### Keine Integration
Webcams sind **statische Links** in `WebcamWidget.astro`:

```javascript
const webcams = [
  { 
    name: 'BYC Starnberg', 
    location: 'Yachthafen', 
    url: 'https://www.byc.de/webcams-wetter/',
    online: true
  },
  { 
    name: 'DTYC Tutzing', 
    location: 'Seestraße', 
    url: 'https://www.dtyc.de/webcam',
    online: false
  }
];
```

### Online-Status
- **Manuell gepflegt:** `online: true/false`
- Keine automatische Verfügbarkeits-Prüfung
- Future Enhancement: Ping via `fetch()` + CORS check

---

## API-Übersicht Matrix

| API | Provider | Zweck | Rate Limit | Auth | CORS | Timeout |
|-----|----------|-------|------------|------|------|---------|
| Open-Meteo | open-meteo.com | Wetter | 10k/Tag | ❌ | ✅ | 6s |
| DB Fahrplan | dbf.finalrewind.org | S-Bahn | Unbekannt | ❌ | ✅ | 8s |
| Schifffahrt | — | Ferry | — | — | — | — |
| Webcams | — | Links | — | — | — | — |

---

## Error Handling Patterns

### 1. AbortController Pattern
```javascript
async function fetchWithTimeout(url, timeoutMs = 6000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('Request timeout');
    }
    throw err;
  }
}
```

### 2. Graceful Degradation
```javascript
try {
  const data = await fetchWeather();
  renderWeather(data);
} catch {
  // Zeige statische Fallback-Daten
  renderFallback({
    temp: '—',
    condition: 'Nicht verfügbar',
    sunrise: '07:30',
    sunset: '17:20'
  });
}
```

### 3. Retry Strategy (Aktuell nicht implementiert)
```javascript
// Future Enhancement
async function fetchWithRetry(url, retries = 2) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url);
    } catch (err) {
      if (i === retries - 1) throw err;
      await sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

---

## Performance-Optimierungen

### 1. Lazy Loading
APIs laden nur wenn Widget im Viewport:

```javascript
// Future Enhancement: IntersectionObserver
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadWeather();
      observer.unobserve(entry.target);
    }
  });
});

observer.observe(document.querySelector('.weather-widget'));
```

### 2. Caching (Aktuell nicht implementiert)
```javascript
// Future Enhancement: Cache API
const CACHE_KEY = 'weather-data';
const CACHE_DURATION = 5 * 60 * 1000; // 5 Minuten

async function getCachedWeather() {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  
  const data = await fetchWeather();
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
  
  return data;
}
```

### 3. Request Deduplication
Verhindert parallele Requests zum selben Endpoint:

```javascript
let weatherPromise = null;

async function getWeather() {
  if (!weatherPromise) {
    weatherPromise = fetchWeather().finally(() => {
      weatherPromise = null;
    });
  }
  return weatherPromise;
}
```

---

## Future API-Integrationen

### Potenzielle Erweiterungen

1. **Google Calendar API**
   - Event-Export als .ics
   - "In Kalender speichern" Button

2. **OpenStreetMap Overpass API**
   - POI-Daten (Restaurants, Parkplätze)
   - Map-Integration

3. **MVG API (München)**
   - Erweiterte ÖPNV-Infos
   - U-Bahn, Tram, Bus

4. **Webcam Image Fetching**
   - Aktuelles Webcam-Bild einbetten
   - Refresh alle X Minuten

5. **Push Notifications API**
   - Neue Events benachrichtigen
   - Service Worker + Push API

---

**Für AI-Agents:** Alle APIs sind client-side, keine Secrets im Code. CORS muss vom API-Provider aktiviert sein. Bei neuen APIs: AbortController Pattern nutzen, Fallback UI vorsehen, Timeout 6-8 Sekunden. Keine API-Keys in Frontend-Code committen!
