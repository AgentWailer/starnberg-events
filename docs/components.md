# Komponenten-Referenz - Starnberg Events

Alle Komponenten in `src/components/` und `src/layouts/`.

---

## Layout.astro

**Zweck:** Root-Layout mit globalem Styling und Meta-Tags

### Props
```typescript
interface Props {
  title: string;
  description?: string; // Default: "Events & Veranstaltungen am Starnberger See"
}
```

### Features
- **HTML Boilerplate:** `<html>`, `<head>`, `<body>`
- **Google Fonts:** Space Grotesk (Headlines)
- **Global Styles:** CSS Custom Properties, Reset, Typography
- **Dark Mode:** `@media (prefers-color-scheme: dark)` Support
- **Reduced Motion:** Accessibility für `prefers-reduced-motion`
- **Slot:** `<slot />` für Page Content

### Key Styles
- **Color System:** ALPENSEE Palette (Teal, Gold, Warm Neutrals)
- **Typography:** Space Grotesk (Headings), System Fonts (Body)
- **Spacing Scale:** `--space-1` bis `--space-24`
- **Shadows:** `--shadow-sm` bis `--shadow-xl`
- **Utilities:** `.container`, `.sr-only`, `.hide-scrollbar`, `.skeleton`

### Usage
```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="Meine Seite">
  <main>Content</main>
</Layout>
```

---

## Header.astro

**Zweck:** Hero-Header mit Titel und Gradient-Background

### Props
```typescript
interface Props {
  lastUpdated?: string; // Optional, nicht genutzt im Render
}
```

### Design
- **Gradient Background:** `linear-gradient(165deg, ...)` mit Primary Color Tint
- **Decorative Visual:** Radial Gradient (Rechts oben)
- **Typography:** Large responsive Heading `clamp(2.5rem, 8vw, 4.5rem)`
- **Location Badge:** "Starnberger See" mit Prefix-Line

### Structure
```html
<header class="header">
  <div class="header-inner">
    <p class="location">Starnberger See</p>
    <h1 class="title">
      Was ist los<br/>
      <span class="title-accent">in Pöcking?</span>
    </h1>
    <p class="tagline">Events & Veranstaltungen für die ganze Familie</p>
  </div>
  <div class="header-visual" aria-hidden="true"></div>
</header>
```

### Responsive
- Mobile: Padding `var(--space-16)` top
- Desktop (≥640px): Padding `var(--space-20)` top

---

## EventCard.astro

**Zweck:** Event-Karte mit Datum, Kategorie, Titel, Location

### Props
```typescript
interface Props {
  event: {
    id: number;
    title: string;
    date: string;        // "2026-02-03"
    time?: string;       // "18:30"
    location: string;
    category: "kinder" | "familie" | "erwachsene";
    url?: string;
    region?: string;
  };
  regions?: Record<string, { name: string; emoji: string }>;
}
```

### Features
- **Date Display:** Tag + Monat formatiert (Deutsch)
- **Category Badge:** Farbcodiert (Kinder=Orange, Familie=Grün, Kultur=Lila)
- **Time:** Optional mit "Uhr" Suffix
- **Location Icon:** Inline SVG Pin-Icon
- **External Link:** Arrow-Icon (Desktop Hover, Mobile always visible)
- **Data Attributes:** `data-category`, `data-region`, `data-location` für Filterung

### Hover Effects
```css
@media (hover: hover) {
  .event-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}
```

### Grid Layout
```css
.card-link {
  display: grid;
  grid-template-columns: auto 1fr auto;
  /* [Date] [Body] [Arrow] */
}
```

---

## FilterBar.astro

**Zweck:** Client-Side Event-Filterung

### Props
```typescript
interface Props {
  events: any[];    // Alle Events
  regions: Record<string, { name: string; emoji: string }>;
}
```

### Features
- **Category Pills:** Alle/Kinder/Familie/Kultur (Horizontal Scroll)
- **Expandable Filters:** `<details>` mit Region + Ort Selects
- **Count Display:** Aktualisiert `#visible-count` nach Filter

### Client-Side Logic
```javascript
// State
let activeCategory = 'all';
let activeRegion = 'all';
let activeLocation = 'all';

// Filter Events
function filterEvents() {
  eventCards.forEach(card => {
    const match = 
      (activeCategory === 'all' || card.dataset.category === activeCategory) &&
      (activeRegion === 'all' || card.dataset.region === activeRegion) &&
      (activeLocation === 'all' || card.dataset.location === activeLocation);
    
    card.style.display = match ? '' : 'none';
  });
  countEl.textContent = visibleCount;
}
```

### UI States
- **Active Pill:** `.pill.active` (Primary Background)
- **Hover:** Border-Color Change
- **Details Open:** Chevron rotation `transform: rotate(180deg)`

---

## WeatherWidget.astro

**Zweck:** Desktop Weather Strip mit Live-Daten

### Props
Keine Props (static)

### Features
- **Open-Meteo API:** Fetch Temp + Weather Code + Sunrise/Sunset
- **Display Items:**
  - Aktuelles Wetter (Icon + Temp)
  - Wassertemperatur (Statisch 4°)
  - Sonnenaufgang
  - Sonnenuntergang
- **Timeout:** 6 Sekunden `AbortController`
- **Fallback:** Zeigt "—" bei Fehler

### Icons
Inline SVG Icons (Sun, Cloud, Rain, Droplet, Sunrise, Sunset, Temp)

### API Call
```javascript
const API = 'https://api.open-meteo.com/v1/forecast?latitude=47.9983&longitude=11.3397&current=temperature_2m,weather_code&daily=sunrise,sunset&timezone=Europe%2FBerlin&forecast_days=1';

async function fetchWeather() {
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), 6000);
  
  const res = await fetch(API, { signal: ctrl.signal });
  const data = await res.json();
  
  // Render weather items
}
```

### Loading State
```html
<div class="weather-loading">
  <span class="spinner"></span>
  <span class="loading-text">Wetter laden...</span>
</div>
```

---

## TrainInfo.astro

**Zweck:** S-Bahn Abfahrten Possenhofen (Live)

### Props
```typescript
interface Props {
  station?: string;      // Default: "Possenhofen"
  stationCode?: string;  // Default: "MPH"
}
```

### Features
- **DB Fahrplan API:** `dbf.finalrewind.org/{station}.json`
- **Filter:** Nur S-Bahn (nicht ICE/RE), nicht cancelled
- **Display:** Abfahrtszeit, Ziel (gekürzt), Gleis, Verspätung
- **Auto-Refresh:** Alle 60 Sekunden
- **Timeout:** 8 Sekunden

### Destination Shortening
```javascript
function shortDest(dest) {
  return dest
    .replace(/\s*\([^)]*\)/g, '')    // "(Gleis 5)" entfernen
    .replace(/ Hbf$/, '')            // "Hbf" suffix
    .replace(/ Bahnhof$/, '')
    .replace(/^München /, 'M-');     // "München Ost" → "M-Ost"
}
```

### Fallback UI
```html
<div class="train-empty">
  <p><strong>S6</strong> Tutzing ↔ München Hbf</p>
  <p>ca. alle 20 Min · ~35 Min</p>
  <a href="https://iris.noncd.db.de/wbt/js/index.html?bhf=MPH" target="_blank">→ Live bei DB</a>
</div>
```

---

## FerryInfo.astro

**Zweck:** Schifffahrt Fahrplan Possenhofen (Statisch, Client-Logic)

### Props
Keine Props

### Features
- **Statischer Fahrplan:** Hardcoded Schedule für Saison 2026 (05.04. – 18.10.)
- **Season Detection:** `isSeason()` prüft aktuelles Datum
- **Upcoming Departures:** Zeigt nächste 3 Abfahrten
- **Auto-Refresh:** Alle 60 Sekunden (filtert upcoming)

### Schedule Format
```javascript
const schedule = [
  { time: '10:50', dest: 'Tutzing', arrival: '11:14', dir: '↓' },
  { time: '11:30', dest: 'Starnberg', arrival: '12:05', dir: '↑' },
  // ...
];
```

### Winterpause UI
```html
<div class="ferry-notice">
  <strong>Winterpause</strong>
  Saison 2026: 05.04. – 18.10.
  <br><a href="https://www.seenschifffahrt.de" target="_blank">seenschifffahrt.de</a>
</div>
```

---

## InfoTicker.astro

**Zweck:** Mobile Swipeable Carousel (Wetter, Wasser, Sonne, S-Bahn)

### Props
Keine Props

### Features
- **4 Slides:**
  1. Wetter (Temp + Ort)
  2. Wassertemperatur (4°)
  3. Sonnenzeiten (Sunrise/Sunset)
  4. S-Bahn (Nächste Abfahrt)
- **Auto-Rotate:** Alle 4 Sekunden
- **Swipe Gestures:** `touchstart`/`touchend` für prev/next
- **Dots Navigation:** 4 Buttons für direkte Slide-Auswahl
- **API Fetches:** Weather (Open-Meteo) + Train (DB Fahrplan)

### Slide Structure
```html
<div class="carousel-slide active" data-slide="0">
  <span class="slide-icon">☀️</span>
  <span class="slide-content">
    <span class="slide-value">--°</span>
    <span class="slide-label">Starnberg</span>
  </span>
</div>
```

### Autoplay Logic
```javascript
let currentSlide = 0;

function nextSlide() {
  showSlide((currentSlide + 1) % totalSlides);
}

function startAutoplay() {
  clearInterval(autoplayInterval);
  autoplayInterval = setInterval(nextSlide, 4000);
}
```

---

## MarketInfo.astro

**Zweck:** Wochenmärkte mit dynamischer "Nächster Markt" Berechnung

### Props
Keine Props (Statische Daten)

### Features
- **Markets:** Starnberg (Do 7-13h, Sa 7-13h), Söcking (Fr vormittags)
- **Next Market Calculation:** Basierend auf aktuellem Wochentag
- **Dynamic Labels:** "heute", "morgen", "in X Tagen"

### Logic
```javascript
const dayMap = { Do: 4, Fr: 5, Sa: 6 };
const today = new Date().getDay();

for (const market of markets) {
  for (const dayInfo of market.days) {
    const targetDay = dayMap[dayInfo.split(' ')[0]];
    let diff = targetDay - today;
    if (diff <= 0) diff += 7; // Next week
    
    if (diff < daysUntil) {
      daysUntil = diff;
      nextMarket = `${day} · ${market.name}`;
    }
  }
}
```

---

## WebcamWidget.astro

**Zweck:** Webcam-Links mit Online-Status

### Props
Keine Props (Statische Daten)

### Features
- **Webcams:**
  - BYC Starnberg (Online)
  - DTYC Tutzing (Offline)
- **Online Count:** Badge mit Anzahl live Cams
- **Status Indicator:** "● Live" / "Offline"
- **External Links:** Target `_blank`

### Structure
```typescript
const webcams = [
  { 
    name: 'BYC Starnberg', 
    location: 'Yachthafen', 
    url: 'https://www.byc.de/webcams-wetter/',
    online: true
  },
  // ...
];
```

---

## CollapsibleSection.astro

**Zweck:** Generische kollabierbare Sektion (aktuell ungenutzt)

### Props
```typescript
interface Props {
  id: string;           // Unique ID
  title: string;
  icon: string;         // Emoji
  defaultOpen?: boolean;
}
```

### Features
- **HTML `<details>`:** Native Browser-Implementierung
- **LocalStorage:** State Persistence `collapsible-{id}`
- **Chevron Animation:** Rotate on open
- **Slot:** Content via `<slot />`

### Usage
```astro
<CollapsibleSection id="faq" title="FAQ" icon="❓">
  <p>Content hier</p>
</CollapsibleSection>
```

### LocalStorage Logic
```javascript
const storageKey = `collapsible-${id}`;
const savedState = localStorage.getItem(storageKey);

if (savedState !== null) {
  details.open = savedState === 'true';
}

details.addEventListener('toggle', () => {
  localStorage.setItem(storageKey, details.open.toString());
});
```

---

## SkeletonCard.astro

**Zweck:** Loading State Skeleton (aktuell ungenutzt)

### Props
Keine Props

### Features
- **Shimmer Animation:** `skeleton-shimmer` Keyframe
- **Mimic EventCard:** Gleiche Grid-Layout
- **Accessible:** `role="status"`, `aria-live="polite"`
- **Reduced Motion:** Animation aus bei `prefers-reduced-motion`

### Structure
```html
<article class="skeleton-card" role="status" aria-live="polite">
  <div class="skeleton skeleton-date"></div>
  <div class="skeleton-body">
    <div class="skeleton skeleton-category"></div>
    <div class="skeleton skeleton-title"></div>
    <div class="skeleton skeleton-location"></div>
  </div>
</article>
```

---

## Komponentenmatrix

| Komponente | Client-JS | API | LocalStorage | Mobile-Only | Desktop-Only |
|------------|-----------|-----|--------------|-------------|--------------|
| Layout | ❌ | ❌ | ❌ | ❌ | ❌ |
| Header | ❌ | ❌ | ❌ | ❌ | ❌ |
| EventCard | ❌ | ❌ | ❌ | ❌ | ❌ |
| FilterBar | ✅ | ❌ | ❌ | ❌ | ❌ |
| WeatherWidget | ✅ | ✅ Open-Meteo | ❌ | ❌ | ✅ |
| TrainInfo | ✅ | ✅ DB Fahrplan | ❌ | ❌ | ✅ |
| FerryInfo | ✅ | ❌ | ❌ | ❌ | ❌ |
| InfoTicker | ✅ | ✅ Weather+Train | ❌ | ✅ | ❌ |
| MarketInfo | ❌ | ❌ | ❌ | ❌ | ❌ |
| WebcamWidget | ❌ | ❌ | ❌ | ❌ | ❌ |
| CollapsibleSection | ✅ | ❌ | ✅ | ❌ | ❌ |
| SkeletonCard | ❌ | ❌ | ❌ | ❌ | ❌ |

---

**Für AI-Agents:** Jede Komponente ist self-contained. Props werden in `---` Frontmatter definiert, Styles in `<style>` Blocks, Client-JS in `<script>` Blocks. Kein Build-Tool für JS, alles Vanilla. Bei Änderungen: Komponente editieren → `npm run build` → Deploy.
