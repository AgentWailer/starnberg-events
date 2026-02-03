# Starnberg Events - Dokumentation

**Generiert:** 2026-02-03  
**BMAD Workflow:** document-project

Diese Dokumentation ist für **AI-Agents** und **menschliche Entwickler** optimiert.

## 📚 Dokumentations-Struktur

### Neu erstellt (BMAD)

1. **[index.md](./index.md)** - Hauptdokumentation
   - Projekt-Überblick
   - Technologie-Stack
   - Design-System
   - Komponenten-Übersicht
   - Performance-Patterns
   - Nächste Schritte

2. **[architecture.md](./architecture.md)** - Architektur-Übersicht
   - System-Architektur Diagramm
   - Rendering-Strategie (Astro SSG)
   - Daten-Modell (events.json)
   - Styling-Architektur (CSS Custom Properties)
   - Client-Side JavaScript Patterns
   - Performance-Optimierungen
   - Responsive Strategy
   - Deployment (Cloudflare Pages)

3. **[components.md](./components.md)** - Komponenten-Referenz
   - Alle 12 Komponenten dokumentiert
   - Props, Features, Usage Examples
   - Hover Effects, Grid Layouts
   - Client-Side Logic Details
   - Komponentenmatrix (JS/API/LocalStorage)

4. **[api-integrations.md](./api-integrations.md)** - API-Dokumentation
   - Open-Meteo (Wetter)
   - DB Fahrplan API (S-Bahn)
   - Schifffahrt (Statisch)
   - Webcams (Links)
   - Error Handling Patterns
   - Performance-Optimierungen
   - Future API-Integrationen

### Bestehende Docs (Design/Research)

- **[UX-RESEARCH.md](./UX-RESEARCH.md)** - User Research & Testing
- **[DESIGN-INSPIRATION.md](./DESIGN-INSPIRATION.md)** - Design System Rationale
- **[AGENCY-INSPIRATION.md](./AGENCY-INSPIRATION.md)** - Agency Naming Ideas

## 🎯 Für AI-Agents

### Quick Navigation

```bash
# Projekt verstehen
cat docs/index.md

# Architektur verstehen
cat docs/architecture.md

# Komponente finden
grep -A 20 "## ComponentName" docs/components.md

# API-Details
grep -A 30 "## N. API-Name" docs/api-integrations.md
```

### Code-Patterns

**Komponenten sind self-contained:**
- Props: `---` Frontmatter
- Styles: `<style>` Block (scoped)
- Client-JS: `<script>` Block

**Keine Build-Tools für JS:** Vanilla JavaScript, kein Bundler

**Styling:** CSS Custom Properties in `Layout.astro`, Komponenten nutzen diese

**APIs:** Client-side Fetches mit `AbortController` + Fallbacks

## 🚀 Workflow

### Änderungen vornehmen

1. **Komponente editieren:** `src/components/ComponentName.astro`
2. **Testen:** `npm run dev` → http://localhost:4321
3. **Build:** `npm run build`
4. **Deploy:** Git Push → Auto-Deploy auf Cloudflare Pages

### Neue Events hinzufügen

1. **Editiere:** `src/data/events.json`
2. **Format:**
   ```json
   {
     "id": 999,
     "title": "Event-Titel",
     "date": "2026-02-10",
     "time": "19:00",
     "location": "Starnberg",
     "category": "erwachsene",
     "url": "https://example.com",
     "region": "starnberg-ammersee"
   }
   ```
3. **Build + Deploy**

### API aktualisieren

- **Wetter/S-Bahn:** Keine Aktion nötig (Live-APIs)
- **Schifffahrt:** `src/components/FerryInfo.astro` → `schedule` Array editieren
- **Webcams:** `src/components/WebcamWidget.astro` → `webcams` Array editieren

## 📊 Statistiken

- **Dateien:** 2279 Zeilen Dokumentation
- **Komponenten:** 12 (11 genutzt, 1 unused)
- **APIs:** 2 Live-APIs (Open-Meteo, DB Fahrplan)
- **Events:** 72+ aus 10 Quellen
- **Stack:** Astro 5.x, Vanilla JS, CSS Custom Properties

## 🔗 Links

- **Live-Site:** https://starnberg-events.pages.dev
- **Repo:** ~/clawd/starnberg-events
- **BMAD Framework:** `_bmad/`

---

**Dokumentiert mit BMAD Workflow `document-project`**  
Bei Fragen: Diese Docs lesen → Code in `src/` prüfen → Testen mit `npm run dev`
