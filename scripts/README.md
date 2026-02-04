# Auto-Update System für Events

Dieses System automatisiert die Aktualisierung der Events auf der Starnberg-Events-Website.

## 🏗️ Architektur

```
┌─────────────────────────────────────────────────┐
│  GitHub Actions (täglich 6:00 Uhr)             │
├─────────────────────────────────────────────────┤
│  1. Scraper läuft (scripts/scrape-events.mjs)  │
│  2. Events von allen Quellen fetchen           │
│  3. Merge + Deduplizierung                     │
│  4. Speichern in events.json                   │
│  5. Commit + Push (wenn Änderungen)            │
├─────────────────────────────────────────────────┤
│  Cloudflare Pages rebuildet automatisch        │
└─────────────────────────────────────────────────┘
```

## 📋 Lokaler Test

```bash
# Dependencies installieren
npm install

# Scraper lokal ausführen
npm run scrape

# Ergebnis prüfen
git diff src/data/events.json
```

## 🔧 Funktionen

### ✅ Implementiert

- **Grundgerüst**: Event-Scraping-System mit Deduplizierung
- **Merge-Logik**: 
  - Behält manuell hinzugefügte Events (mit `"manual": true`)
  - Entfernt vergangene Events automatisch
  - Dedupliziert basierend auf Titel + Datum
  - Sortiert Events chronologisch
- **Auto-Kategorisierung**: Versucht automatisch Kategorie zu erkennen
- **Auto-Tagging**: Weist Tags basierend auf Keywords zu
- **GitHub Actions**: Workflow läuft täglich + manuell auslösbar

### ⚠️ TODO: Scraper implementieren

Alle Scraper sind aktuell **Stubs**. Jeder muss individuell implementiert werden:

| Quelle | Priorität | Schwierigkeit | Status |
|--------|-----------|---------------|--------|
| **beccult** | 🔴 Hoch | ⭐ Mittel | ❌ TODO |
| **starnbergammersee** | 🔴 Hoch | ⭐⭐ Mittel-Hoch | ❌ TODO |
| **PFC Pöcking** | 🔴 Hoch | ⭐ Einfach | ❌ TODO |
| **Olympiapark** | 🟡 Mittel | ⭐⭐ Mittel-Hoch | ❌ TODO |
| **Deutsches Museum** | 🟡 Mittel | ⭐⭐ Mittel | ❌ TODO |
| **Hellabrunn** | 🟡 Mittel | ⭐⭐ Mittel | ❌ TODO |
| **Tegernsee** | 🟢 Niedrig | ⭐⭐ Mittel | ❌ TODO |
| **Garmisch** | 🟢 Niedrig | ⭐⭐ Mittel | ❌ TODO |
| **muenchen.de** | 🟢 Niedrig | ⭐⭐⭐ Schwer | ❌ TODO (sehr komplex, evtl. API?) |

## 🛠️ Scraper implementieren

### Beispiel-Template:

```javascript
import * as cheerio from 'cheerio';

async function scrapeExampleSource() {
  const response = await fetch('https://example.com/events');
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const events = [];
  
  // Selektoren anpassen!
  $('.event-item').each((i, elem) => {
    const title = $(elem).find('.title').text().trim();
    const dateStr = $(elem).find('.date').text().trim();
    const time = $(elem).find('.time').text().trim();
    const location = $(elem).find('.location').text().trim();
    const url = $(elem).find('a').attr('href');
    
    // Datum parsen (Format anpassen!)
    const date = parseDate(dateStr); // Eigene Funktion
    
    // Event erstellen
    events.push({
      title,
      date,
      time,
      location,
      address: '',
      description: '',
      category: detectCategory(title, ''),
      tags: detectTags(title, ''),
      url,
      source: 'example-source',
      region: 'starnberg-ammersee',
      venue: null,
      isHighlight: false
    });
  });
  
  return events;
}
```

### Wichtige Regeln:

1. **Datum-Format**: `YYYY-MM-DD` (ISO 8601)
2. **Zeit-Format**: `HH:MM` (24h)
3. **Deduplizierung**: Scraper müssen keine Duplikate prüfen (macht die Merge-Funktion)
4. **Fehlerbehandlung**: Scraper sollten bei Fehlern leere Arrays zurückgeben, nicht crashen
5. **Highlights**: Nur echte Highlights markieren (große Events, bekannte Acts)
6. **Kategorie**: `kinder`, `familie`, oder `erwachsene`
7. **Tags**: Aus der Liste: `musik`, `theater`, `kunst`, `sport`, `natur`, `markt`, `bildung`, `fest`, `show`, `indoor`

### Spezielle Anforderungen:

- **Gasteig/München.de**: NUR Top-Events (sonst 2000+ Events) → Highlights filtern
- **Tegernsee/Garmisch**: Fokus auf Highlights (Festivals, große Events)

## 📊 Output

Der Scraper schreibt nach `src/data/events.json`:

```json
{
  "lastUpdated": "2026-02-04",
  "sources": ["beccult", "starnbergammersee", ...],
  "regions": { ... },
  "eventCount": 91,
  "events": [ ... ]
}
```

## 🔄 GitHub Actions

**Workflow**: `.github/workflows/update-events.yml`

- **Trigger**: Täglich um 6:00 Uhr morgens (Europe/Berlin)
- **Manuell**: Via GitHub UI → Actions → "Auto-Update Events" → "Run workflow"
- **Commit**: Nur wenn sich `events.json` ändert
- **Commit Message**: `chore: auto-update events [skip ci]`
- **Auto-Deploy**: Cloudflare Pages rebuildet bei jedem Push auf `main`

## 🚨 Wichtig

- **NICHT committen/pushen** während lokaler Tests!
- **Backup**: Vor größeren Änderungen `events.json` sichern
- **Testing**: Immer erst `npm run scrape` lokal testen
- **Scraper-Qualität**: Lieber 10 korrekte Events als 100 fehlerhafte

## 🎯 Nächste Schritte

1. **Beccult-Scraper** implementieren (lokale Quelle, wichtig!)
2. **StarnbergAmmersee-Scraper** implementieren (Hauptquelle)
3. **PFC-Scraper** implementieren (lokale Quelle)
4. Testen und weitere Quellen hinzufügen

## 📝 Logs & Debugging

```bash
# Scraper-Output zeigt:
# - Welche Quellen gescraped wurden
# - Wie viele Events gefunden wurden
# - Anzahl hinzugefügter/entfernter Events

npm run scrape

# GitHub Actions Logs:
# GitHub → Actions → Workflow → Run Details
```
