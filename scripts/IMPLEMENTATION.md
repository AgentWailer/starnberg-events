# Scraper Implementierungs-Guide

## 🎯 Schritt-für-Schritt: Einen Scraper bauen

### 1️⃣ Website analysieren

Bevor du einen Scraper implementierst:

```bash
# Browser DevTools öffnen (F12)
# → Elements Tab
# → Events-Seite inspizieren
```

**Was du herausfinden musst:**

- Wie heißt der Container mit allen Events? (z.B. `.event-list`, `#events`, etc.)
- Wie heißt ein einzelnes Event-Element? (z.B. `.event-item`, `.veranstaltung`, etc.)
- Welche Selektoren haben:
  - Titel
  - Datum/Zeit
  - Ort
  - Beschreibung
  - Link

### 2️⃣ HTML-Struktur verstehen

**Beispiel beccult.de** (hypothetisch):

```html
<div class="events">
  <article class="event-card">
    <h3 class="event-title">Willi live – Und wovon träumst du?</h3>
    <div class="event-date">07.02.2026</div>
    <div class="event-time">15:00 Uhr</div>
    <p class="event-desc">Die neue Show über Träume...</p>
    <a href="/event/123" class="event-link">Mehr Info</a>
  </article>
  ...
</div>
```

### 3️⃣ Datum-Parsing

**Wichtig**: Websites haben unterschiedliche Datumsformate!

```javascript
// Format: "07.02.2026" → "2026-02-07"
function parseGermanDate(dateStr) {
  const [day, month, year] = dateStr.split('.');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Format: "07. Februar 2026" → "2026-02-07"
function parseLongDate(dateStr) {
  const months = {
    'Januar': '01', 'Februar': '02', 'März': '03',
    'April': '04', 'Mai': '05', 'Juni': '06',
    'Juli': '07', 'August': '08', 'September': '09',
    'Oktober': '10', 'November': '11', 'Dezember': '12'
  };
  
  const match = dateStr.match(/(\d+)\.\s+(\w+)\s+(\d{4})/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${months[month]}-${day.padStart(2, '0')}`;
  }
  return null;
}

// Format: "2026-02-07T15:00:00" (ISO) → "2026-02-07"
function parseISODate(dateStr) {
  return dateStr.split('T')[0];
}
```

### 4️⃣ Zeit-Parsing

```javascript
// Format: "15:00 Uhr" → "15:00"
function parseTime(timeStr) {
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    const [, hours, minutes] = match;
    return `${hours.padStart(2, '0')}:${minutes}`;
  }
  return null;
}

// Format: "15 Uhr" → "15:00"
function parseShortTime(timeStr) {
  const match = timeStr.match(/(\d{1,2})\s*Uhr/);
  if (match) {
    return `${match[1].padStart(2, '0')}:00`;
  }
  return null;
}
```

### 5️⃣ Kompletter Scraper-Code

```javascript
import * as cheerio from 'cheerio';

/**
 * Scraper for beccult.de
 */
async function scrapeBeccult() {
  const BASE_URL = 'https://www.beccult.de';
  const EVENTS_URL = `${BASE_URL}/veranstaltungen`;
  
  try {
    const response = await fetch(EVENTS_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const events = [];
    
    // WICHTIG: Selektoren an echte HTML-Struktur anpassen!
    $('.event-card').each((i, elem) => {
      try {
        // Daten extrahieren
        const title = $(elem).find('.event-title').text().trim();
        const dateStr = $(elem).find('.event-date').text().trim();
        const timeStr = $(elem).find('.event-time').text().trim();
        const description = $(elem).find('.event-desc').text().trim();
        const relativeUrl = $(elem).find('.event-link').attr('href');
        
        // Validierung
        if (!title || !dateStr) {
          return; // Skip invalid events
        }
        
        // Datum/Zeit parsen
        const date = parseGermanDate(dateStr);
        const time = parseTime(timeStr);
        
        // Skip past events
        if (isPastEvent(date)) {
          return;
        }
        
        // URL bauen
        const url = relativeUrl?.startsWith('http') 
          ? relativeUrl 
          : `${BASE_URL}${relativeUrl}`;
        
        // Event-Objekt erstellen
        events.push({
          title,
          date,
          time: time || '',
          location: 'Pöcking',
          address: 'Weilheimer Str. 33, 82343 Pöcking', // beccult Adresse
          description: description || '',
          category: detectCategory(title, description),
          tags: detectTags(title, description),
          url,
          source: 'beccult',
          region: 'poecking',
          venue: 'beccult',
          isHighlight: false
        });
      } catch (err) {
        console.error(`   ⚠️  Error parsing event ${i}:`, err.message);
      }
    });
    
    return events;
    
  } catch (err) {
    console.error(`   ❌ Fetch error:`, err.message);
    return [];
  }
}

// Helper functions (put these in main scraper file)
function parseGermanDate(dateStr) {
  const [day, month, year] = dateStr.split('.');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function parseTime(timeStr) {
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    const [, hours, minutes] = match;
    return `${hours.padStart(2, '0')}:${minutes}`;
  }
  return null;
}

function isPastEvent(dateStr) {
  const eventDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate < today;
}
```

### 6️⃣ Testen

```bash
# Scraper testen
npm run scrape

# Ergebnis prüfen
git diff src/data/events.json
```

**Erwartetes Output:**

```
📡 Scraping: beccult Pöcking...
   ✅ Found 12 events

📊 Summary:
   • Added: 12 new events
   • Removed: 0 past/duplicate events
   • Total: 103 events
```

### 7️⃣ Debugging-Tipps

**Problem**: Keine Events gefunden

```javascript
// 1. HTML ausgeben
console.log(html.substring(0, 500)); // Erste 500 Zeichen

// 2. Selektoren testen
console.log('Event containers:', $('.event-card').length);

// 3. Einzelnes Event inspizieren
const firstEvent = $('.event-card').first();
console.log('Title:', firstEvent.find('.event-title').text());
console.log('Date:', firstEvent.find('.event-date').text());
```

**Problem**: Datum-Parsing schlägt fehl

```javascript
// Debug-Output hinzufügen
console.log('Original date string:', dateStr);
console.log('Parsed date:', date);
console.log('Is valid:', /^\d{4}-\d{2}-\d{2}$/.test(date));
```

**Problem**: Events sind doppelt

→ Das ist OK! Die Merge-Funktion entfernt Duplikate automatisch.

## 🎨 Erweiterte Features

### API statt HTML-Scraping

Manche Websites haben APIs:

```javascript
async function scrapeWithAPI() {
  const response = await fetch('https://example.com/api/events');
  const data = await response.json();
  
  return data.events.map(event => ({
    title: event.name,
    date: parseISODate(event.startDate),
    time: event.startTime,
    // ...
  }));
}
```

### Pagination (mehrere Seiten)

```javascript
async function scrapeMultiplePages() {
  const allEvents = [];
  
  for (let page = 1; page <= 5; page++) {
    const url = `https://example.com/events?page=${page}`;
    const pageEvents = await scrapePage(url);
    
    if (pageEvents.length === 0) break; // Keine Events mehr
    
    allEvents.push(...pageEvents);
  }
  
  return allEvents;
}
```

### Highlight-Erkennung

```javascript
function isHighlight(title, description, keywords) {
  const text = `${title} ${description}`.toLowerCase();
  
  // Bekannte Acts
  const famousActs = ['grönemeyer', 'ehrlich brothers', 'andré rieu'];
  if (famousActs.some(act => text.includes(act))) {
    return true;
  }
  
  // Festivals
  if (keywords?.includes('festival') || text.includes('fest')) {
    return true;
  }
  
  return false;
}
```

## 📚 Ressourcen

- **Cheerio Docs**: https://cheerio.js.org/
- **CSS Selektoren**: https://www.w3schools.com/cssref/css_selectors.asp
- **Datum-Parsing**: `new Date()` oder `Intl.DateTimeFormat`

## ⚠️ Rechtliches

- **robots.txt** beachten
- **Rate Limiting**: Nicht zu viele Requests (1-2 pro Sekunde max)
- **User-Agent** setzen (falls nötig)
- **Caching** nutzen (wiederholte Requests vermeiden)

## ✅ Checklist vor Commit

- [ ] Scraper läuft ohne Fehler
- [ ] Events haben korrekte Datumsformate (`YYYY-MM-DD`)
- [ ] Events haben korrekte Zeitformate (`HH:MM`)
- [ ] Kategorie und Tags werden erkannt
- [ ] Vergangene Events werden gefiltert
- [ ] Duplikate werden erkannt (nicht nötig, aber gut)
- [ ] URL ist vollständig (nicht relativ)
- [ ] Source-ID stimmt mit sources.json überein
