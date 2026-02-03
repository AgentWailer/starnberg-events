# Starnberg Events - Projekt-Dokumentation

**Version:** 0.0.1  
**Dokumentiert:** 2026-02-03  
**Stack:** Astro 5.x, TypeScript, Vanilla JS  
**URL:** https://starnberg-events.pages.dev

## Überblick

Starnberg Events ist eine regionale Event-Aggregator-Plattform für den Starnberger See und Umgebung. Die Seite sammelt Veranstaltungen aus 10+ Quellen, filtert sie nach Kategorien und Regionen, und zeigt lokale Informationen (Wetter, S-Bahn, Schifffahrt, Märkte).

### Kernfunktionen

- **Event-Aggregation:** 72+ Events aus 10 Quellen (beccult, starnbergammersee.de, muenchen.de, etc.)
- **Intelligente Filterung:** Nach Kategorie (Kinder/Familie/Kultur), Region und Ort
- **Live-Informationen:**
  - Wetter (Open-Meteo API)
  - S-Bahn Abfahrten Possenhofen (DB Fahrplan-API)
  - Schifffahrt Starnberger See (Statischer Fahrplan 2026)
  - Wochenmärkte (Dynamische Berechnung)
- **Mobile-First Design:** Responsive, optimiert für Touch-Geräte
- **Progressive Enhancement:** Funktioniert ohne JavaScript, optimiert mit JS

## Projekt-Struktur

```
starnberg-events/
├── src/
│   ├── components/       # 11 Astro-Komponenten
│   ├── layouts/          # Layout.astro (Global Styles)
│   ├── pages/            # index.astro (Hauptseite)
│   ├── data/             # events.json, sources.json
│   └── styles/           # (leer - alles in Layout.astro)
├── public/               # Static Assets
├── docs/                 # Diese Dokumentation
├── _bmad/                # BMAD Meta-Framework
├── astro.config.mjs      # Astro Config
└── package.json          # Dependencies
```

## Technologie-Stack

### Core
- **Astro 5.17.1** - Static Site Generator
- **TypeScript** - Typed JavaScript (inkludiert in .astro files)
- **Vanilla JS** - Client-Side Interaktivität (keine Frameworks)

### APIs (Client-Side)
- **Open-Meteo** - Wetterdaten (kostenlos, keine API-Key)
- **dbf.finalrewind.org** - DB S-Bahn Echtzeit-Abfahrten
- **Statischer Fahrplan** - Schifffahrt Starnberger See (Saison 2026)

### Hosting
- **Cloudflare Pages** - Static Hosting + CDN
- **Build:** `astro build` → Static HTML/CSS/JS

## Design-System

### Color Palette - "ALPENSEE"

Warmes, natürliches Farbschema inspiriert vom Starnberger See:

```css
/* Primary - Der See (Deep Teal-Blue) */
--color-primary: #0d4a5c;
--color-primary-light: #1a6a82;

/* Accent - Dezentes Gold */
--color-accent: #c9a962;

/* Kategorien */
--color-kinder: #d97706;      /* Orange */
--color-familie: #059669;      /* Grün */
--color-erwachsene: #7c3aed;   /* Lila */

/* Backgrounds - Warme Töne */
--color-bg: #faf8f6;           /* Off-White */
--color-card: #ffffff;         /* Pure White */
```

### Responsive Breakpoints

```css
/* Mobile-First */
Base: < 640px
Small: >= 640px
Medium: >= 768px
Large: >= 900px (max-width container)
```

### Typography

- **Headlines:** Space Grotesk (Google Fonts)
- **Body:** System Font Stack (SF Pro, Segoe UI, Roboto)

## Komponenten-Übersicht

| Komponente | Zweck | Client-JS |
|------------|-------|-----------|
| `Header.astro` | Hero mit Titel + Gradient | Nein |
| `EventCard.astro` | Event-Karte mit Datum, Kategorie, Link | Nein |
| `FilterBar.astro` | Kategorie-Pills + Erweiterte Filter | **Ja** |
| `WeatherWidget.astro` | Wetter-Strip (Desktop) | **Ja** |
| `InfoTicker.astro` | Swipeable Carousel (Mobile) | **Ja** |
| `TrainInfo.astro` | S-Bahn Abfahrten | **Ja** |
| `FerryInfo.astro` | Schifffahrt Fahrplan | **Ja** |
| `MarketInfo.astro` | Wochenmärkte (dynamisch) | Nein |
| `WebcamWidget.astro` | Webcam-Links | Nein |
| `CollapsibleSection.astro` | Kollabierbare Sektion (ungenutzt) | **Ja** |
| `SkeletonCard.astro` | Loading State Skeleton (ungenutzt) | Nein |

## Datenfluss

### Build-Time (SSG)

1. **Astro Build** liest `src/data/events.json`
2. **index.astro** sortiert Events nach Datum
3. **EventCard.astro** rendert für jedes Event eine Karte
4. **Output:** Static HTML mit inlined Styles

### Client-Side (Runtime)

1. **FilterBar.astro:** JavaScript filtert `.event-card` via `display: none`
2. **API-Widgets:** Fetch Weather/Train/Ferry on `DOMContentLoaded`
3. **InfoTicker:** Auto-rotate Carousel alle 4 Sekunden

## Performance-Patterns

### CSS Custom Properties
Alle Farben, Spacing, Animationen als CSS Variables → einfache Theme-Anpassung

### Inline Styles
Astro-Komponenten nutzen `<style>` Blocks → automatisch scoped + inlined

### Lazy Loading
APIs laden nur wenn Widget sichtbar (keine Prefetch-Strategie)

### Mobile Optimierung
- Touch-Target min 44px
- Swipe-Gesten (InfoTicker)
- Hide-Scrollbar Pattern
- Reduced Motion Support

## Nächste Schritte

### Quick Wins
- [ ] Skeleton Loading States aktivieren
- [ ] Service Worker für Offline-Nutzung
- [ ] Event-Favoriten (LocalStorage)

### Feature-Ideen
- [ ] Event-Suche (Fuse.js)
- [ ] Kalender-Export (.ics)
- [ ] Push-Notifications (neue Events)
- [ ] Dark Mode Toggle (aktuell nur System Preference)

## Links

- **Live-Site:** https://starnberg-events.pages.dev
- **Repo:** ~/clawd/starnberg-events
- **Detaillierte Docs:**
  - [Architektur](./architecture.md)
  - [Komponenten-Referenz](./components.md)
  - [API-Integrationen](./api-integrations.md)

---

**Für AI-Agents:** Diese Dokumentation ist optimiert für Code-Verständnis und schnelle Orientierung. Bei Fragen zur Implementierung: Komponenten sind self-contained, Styles sind inline, Logik ist in `<script>` Blocks.
