# 📊 Implementation Status

Stand: **2026-02-04**

## ✅ Fertiggestellt

### System-Infrastruktur

- [x] **Scraper-Framework** (`scripts/scrape-events.mjs`)
  - Event-Loading und -Saving
  - Merge-Logik mit Deduplizierung
  - Auto-Kategorisierung (Keyword-basiert)
  - Auto-Tagging (Keyword-basiert)
  - Vergangene Events werden automatisch entfernt
  - Manuell hinzugefügte Events (mit `"manual": true`) bleiben erhalten
  - Events werden chronologisch sortiert
  - IDs werden neu zugewiesen

- [x] **GitHub Actions Workflow** (`.github/workflows/update-events.yml`)
  - Läuft täglich um 6:00 Uhr (Europe/Berlin)
  - Manuell auslösbar via GitHub UI
  - Installiert Dependencies
  - Führt Scraper aus
  - Commitet nur bei Änderungen
  - Commit Message: `chore: auto-update events [skip ci]`
  - Triggert automatisch Cloudflare Pages Rebuild

- [x] **Package.json Updates**
  - `cheerio` als Dependency hinzugefügt
  - `npm run scrape` Script hinzugefügt

- [x] **Dokumentation**
  - `README.md` - Übersicht und Architektur
  - `IMPLEMENTATION.md` - Schritt-für-Schritt Guide
  - `STATUS.md` - Dieser Status-Report

## ⚠️ TODO: Scraper implementieren

### Priorität 1: Lokale Quellen (wichtigste)

| Quelle | Status | Notizen |
|--------|--------|---------|
| **beccult** | ❌ STUB | Lokales Kulturzentrum, sehr wichtig |
| **PFC Pöcking** | ❌ STUB | Pöckinger Faschings Club, lokal wichtig |

### Priorität 2: Regionale Haupt-Quellen

| Quelle | Status | Notizen |
|--------|--------|---------|
| **StarnbergAmmersee** | ❌ STUB | Hauptquelle für Region, viele Events |
| **Olympiapark** | ❌ STUB | Große Venue, wichtige Konzerte/Events |

### Priorität 3: Familie/Kinder

| Quelle | Status | Notizen |
|--------|--------|---------|
| **Deutsches Museum** | ❌ STUB | Familienfreundlich, Workshops |
| **Tierpark Hellabrunn** | ❌ STUB | Familie, Kinder |

### Priorität 4: Highlights only

| Quelle | Status | Notizen |
|--------|--------|---------|
| **Tegernsee** | ❌ STUB | Nur Highlights (Filter!) |
| **Garmisch-Partenkirchen** | ❌ STUB | Nur Highlights (Filter!) |

### Priorität 5: Optional/Komplex

| Quelle | Status | Notizen |
|--------|--------|---------|
| **muenchen.de** | ❌ STUB | SEHR KOMPLEX - 2000+ Events, evtl. API nötig |

## 🚀 Nächste Schritte

### Sofort (heute/morgen):

1. **beccult-Scraper implementieren**
   - Website öffnen: https://www.beccult.de/veranstaltungen
   - HTML-Struktur analysieren
   - Scraper-Funktion schreiben (siehe `IMPLEMENTATION.md`)
   - Testen: `npm run scrape`

2. **StarnbergAmmersee-Scraper implementieren**
   - Website öffnen: https://www.starnbergammersee.de/entdecken-erleben/veranstaltungskalender
   - Prüfen ob API vorhanden (DevTools → Network)
   - Falls keine API: HTML scrapen

3. **PFC-Scraper implementieren**
   - Website: https://www.pfc.de/veranstaltungen/
   - Meist einfache Struktur

### Diese Woche:

4. **Olympiapark-Scraper**
5. **Deutsches Museum-Scraper**
6. **Hellabrunn-Scraper**

### Später:

7. Tegernsee (Highlights filtern!)
8. Garmisch (Highlights filtern!)
9. München.de (komplexer, evtl. API)

## 🧪 Testing Checklist

Für jeden neuen Scraper:

- [ ] Scraper findet Events (> 0)
- [ ] Datumsformat korrekt (`YYYY-MM-DD`)
- [ ] Zeitformat korrekt (`HH:MM`)
- [ ] URL vollständig (nicht relativ)
- [ ] Kategorisierung funktioniert
- [ ] Tags werden erkannt
- [ ] Keine Fehler im Console-Output
- [ ] `npm run scrape` läuft ohne Crash
- [ ] Events erscheinen in `events.json`
- [ ] Keine Duplikate (wird automatisch geprüft)

## 📝 Implementierungs-Notizen

### Bekannte Herausforderungen:

1. **Datum-Parsing**: Jede Website hat eigenes Format
   - Lösung: Helper-Funktionen für verschiedene Formate

2. **Pagination**: Manche Sites haben mehrere Seiten
   - Lösung: Loop über Pages bis leer

3. **JavaScript-rendered Content**: Cheerio kann nur static HTML
   - Lösung: Wenn nötig, API finden oder anders vorgehen

4. **Rate Limiting**: Nicht zu viele Requests
   - Lösung: `await` zwischen Fetches, max 1-2 req/sec

5. **Gasteig/München**: 2000+ Events
   - Lösung: NUR Highlights filtern (bekannte Acts, Festivals)

### Best Practices:

- **Error Handling**: `try/catch` um jeden Scraper
- **Validation**: Prüfe ob Pflichtfelder vorhanden (title, date)
- **Logging**: Console-Output für Debugging
- **Incremental**: Ein Scraper nach dem anderen
- **Testing**: Erst lokal testen, dann committen

## 🎯 Erfolgs-Kriterien

Das System ist erfolgreich wenn:

- [x] Grundgerüst funktioniert ✅
- [ ] Mind. 3 Scraper implementiert (beccult, starnbergammersee, pfc)
- [ ] Events werden täglich automatisch aktualisiert
- [ ] Keine vergangenen Events in events.json
- [ ] Keine Duplikate
- [ ] Manuelle Events bleiben erhalten
- [ ] Website baut automatisch nach Update

## 📊 Metriken

Aktuell:
- **Events gesamt**: 91
- **Implementierte Scraper**: 0/9
- **Manuell gepflegte Events**: ~91 (alle)

Ziel (nach vollständiger Implementierung):
- **Events gesamt**: 150-300
- **Implementierte Scraper**: 6-9/9
- **Automatisch gescrapte Events**: ~80%
- **Manuell gepflegte Events**: ~20%

---

**Letzte Aktualisierung**: 2026-02-04
**Nächstes Review**: Nach Implementierung erster 3 Scraper
