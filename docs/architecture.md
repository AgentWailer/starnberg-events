# Architektur-Übersicht - Starnberg Events

## System-Architektur

### High-Level Diagramm

```
┌─────────────────────────────────────────────────────────────┐
│                     Build Time (SSG)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  events.json ──┬──> Astro Compiler ──> Static HTML/CSS/JS  │
│  sources.json ─┘                                            │
│                                                             │
│  - Sort events by date                                      │
│  - Render EventCards                                        │
│  - Inline scoped styles                                     │
│  - Inject client scripts                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Runtime (Client-Side)                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Interactions:                                         │
│  ├─ FilterBar.astro  ──> JavaScript Filter Logic           │
│  ├─ InfoTicker.astro ──> Swipe/Auto-rotate                 │
│  └─ CollapsibleSection ──> Toggle + localStorage           │
│                                                             │
│  API Fetches (on DOMContentLoaded):                         │
│  ├─ WeatherWidget  ──> Open-Meteo API                      │
│  ├─ TrainInfo      ──> DB Fahrplan API                     │
│  └─ FerryInfo      ──> Static Schedule (Client-Logic)      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Rendering-Strategie

### Astro SSG (Static Site Generation)

Astro kompiliert zur **Build-Zeit** alle `.astro` Dateien zu statischem HTML:

1. **Component Tree:**
   ```
   Layout.astro
   └── index.astro
       ├── Header.astro
       ├── InfoTicker.astro (mobile)
       ├── WeatherWidget.astro (desktop)
       ├── TrainInfo.astro (desktop)
       ├── FilterBar.astro
       ├── EventCard.astro (x72 für jedes Event)
       ├── MarketInfo.astro
       └── WebcamWidget.astro
   ```

2. **Style Inlining:**
   - Jede Komponente hat einen `<style>` Block
   - Astro scoped Styles automatisch (unique class names)
   - `Layout.astro` hat `<style is:global>` für globale Styles

3. **Script Handling:**
   - `<script>` Blocks werden gebündelt und in `<head>` injiziert
   - `define:vars` erlaubt SSR-Props in Client-Scripts
   - Kein Runtime Framework (keine React/Vue Overhead)

### Progressive Enhancement

- **Base:** HTML + CSS funktioniert ohne JavaScript
- **Enhanced:** JavaScript fügt Filterung, API-Daten, Animationen hinzu
- **Fallbacks:** Skeleton States, Error Handling, Timeout Aborts

## Daten-Modell

### events.json Struktur

```typescript
interface EventsData {
  lastUpdated: string;           // ISO Date "2026-02-03"
  sources: string[];             // ["beccult", "starnbergammersee", ...]
  regions: Record<string, {      // Region Metadata
    name: string;                // "Pöcking"
    emoji: string;               // "🏠"
  }>;
  eventCount: number;            // 72
  events: Event[];               // Sorted Array
}

interface Event {
  id: number;
  title: string;
  date: string;                  // "2026-02-03"
  time?: string;                 // "18:30" (optional)
  location: string;              // "Pöcking"
  address?: string;              // Full address (optional)
  description?: string;
  category: "kinder" | "familie" | "erwachsene";
  tags?: string[];               // ["kunst", "workshop"]
  url?: string;                  // External Link
  source?: string;               // "beccult"
  region?: string;               // "poecking"
  isHighlight?: boolean;
}
```

### Data Flow

```
Build Time:
  events.json
    │
    ├─> Astro.props.events (index.astro)
    │     ├─> .sort() by date/time
    │     └─> .map(event => <EventCard event={event} />)
    │
    └─> regions extracted
          └─> Passed to FilterBar

Runtime:
  User filters
    │
    └─> JavaScript reads data-attributes
          ├─ data-category="kinder"
          ├─ data-region="poecking"
          └─ data-location="Pöcking"
            │
            └─> Toggle display: none/block
```

## Styling-Architektur

### CSS Custom Properties Pattern

Alle Design-Tokens als CSS Variables in `Layout.astro`:

```css
:root {
  /* Colors */
  --color-primary: #0d4a5c;
  --color-bg: #faf8f6;
  
  /* Spacing Scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  /* ... bis space-24 */
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(45, 42, 38, 0.04);
  --shadow-md: 0 4px 12px rgba(45, 42, 38, 0.06);
  
  /* Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  
  /* Animation */
  --duration-fast: 120ms;
  --duration-normal: 200ms;
}

/* Dark Mode Override */
@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: #4db6d1;
    --color-bg: #1a1816;
    /* ... */
  }
}
```

### Component-Scoped Styles

Jede Komponente nutzt Astro's Scoped Styles:

```astro
---
// Component Logic
const { title } = Astro.props;
---

<div class="card">
  <h3>{title}</h3>
</div>

<style>
  /* Automatisch scoped zu: .card[data-astro-cid-xyz] */
  .card {
    background: var(--color-card);
    padding: var(--space-4);
  }
</style>
```

### Global Utility Classes

Wenige globale Utilities in `Layout.astro`:

- `.container` - Max-width wrapper
- `.sr-only` - Screen-reader only
- `.hide-scrollbar` - Scrollbar verstecken
- `.skeleton` - Loading shimmer animation

## Client-Side JavaScript Patterns

### Event Filtering (FilterBar.astro)

```javascript
// State Management
let activeCategory = 'all';
let activeRegion = 'all';
let activeLocation = 'all';

// Filter Logic
function filterEvents() {
  eventCards.forEach(card => {
    const matchCat = activeCategory === 'all' || 
                     card.dataset.category === activeCategory;
    const matchReg = activeRegion === 'all' || 
                     card.dataset.region === activeRegion;
    const matchLoc = activeLocation === 'all' || 
                     card.dataset.location === activeLocation;
    
    card.style.display = (matchCat && matchReg && matchLoc) ? '' : 'none';
  });
}
```

**Pattern:** Simple DOM Manipulation, kein State Framework nötig

### API Fetching Pattern

```javascript
async function fetchWeather() {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    
    const res = await fetch(API_URL, { signal: ctrl.signal });
    clearTimeout(timer);
    
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    
    // Render UI
    el.innerHTML = renderWeather(data);
  } catch {
    // Fallback UI
    el.innerHTML = renderFallback();
  }
}

document.addEventListener('DOMContentLoaded', fetchWeather);
```

**Pattern:** Fetch on Load + Timeout + Fallback

### LocalStorage Pattern (CollapsibleSection)

```javascript
const storageKey = `collapsible-${id}`;

// Load state
const savedState = localStorage.getItem(storageKey);
if (savedState !== null) {
  details.open = savedState === 'true';
}

// Save state
details.addEventListener('toggle', () => {
  localStorage.setItem(storageKey, details.open.toString());
});
```

**Pattern:** Persist UI State lokal

## Performance-Optimierungen

### 1. Minimal JavaScript

- **Kein Framework:** React/Vue Overhead eliminiert
- **Vanilla JS:** Nur wo nötig (Filter, API-Fetches)
- **No Build Tools:** Kein Webpack/Vite für Client-JS

### 2. CSS Performance

- **Scoped Styles:** Kein CSS-Bloat, nur genutzte Styles
- **No CSS Framework:** Tailwind/Bootstrap eliminiert
- **Custom Properties:** Schneller als Sass Variables (native CSS)

### 3. Image Optimization

- **SVG Icons:** Inline SVG statt Icon-Fonts
- **No External Images:** Aktuell keine Bilder (außer Webcams extern)

### 4. Network Efficiency

- **API Timeouts:** 6-8 Sekunden max
- **AbortController:** Request cancellation
- **No Prefetching:** Nur laden wenn Widget sichtbar

### 5. Mobile Optimizations

- **Touch Targets:** Min 44px für alle interaktiven Elemente
- **Tap Highlight:** `-webkit-tap-highlight-color: transparent`
- **Active States:** `:active { transform: scale(0.98) }`

## Responsive Strategy

### Mobile-First CSS

```css
/* Base (Mobile) */
.card {
  padding: var(--space-4);
}

/* Tablet+ */
@media (min-width: 640px) {
  .card {
    padding: var(--space-6);
  }
}
```

### Conditional Rendering

```astro
<!-- Mobile: InfoTicker Carousel -->
<div class="mobile-info-bar">
  <InfoTicker />
</div>

<!-- Desktop: Full Weather Strip -->
<section class="section-weather desktop-only">
  <WeatherWidget />
</section>

<style>
  .mobile-info-bar { display: block; }
  .desktop-only { display: none; }
  
  @media (min-width: 768px) {
    .mobile-info-bar { display: none; }
    .desktop-only { display: block; }
  }
</style>
```

## Deployment

### Build Process

```bash
# Development
npm run dev        # astro dev (Port 4321)

# Production Build
npm run build      # astro build → dist/
npm run preview    # astro preview (test build)
```

### Cloudflare Pages

1. **Build Command:** `npm run build`
2. **Output Directory:** `dist`
3. **Node Version:** 25.5.0
4. **Framework Preset:** Astro

### Git Workflow

- **Main Branch:** Auto-deploy to production
- **No Preview Branches:** Single-branch deployment

## Security

### API Keys

- **Open-Meteo:** Keine API-Key nötig (öffentlich)
- **DB Fahrplan:** Inoffizielle API (iris.noncd.db.de, dbf.finalrewind.org)
- **Keine Secrets:** Alle APIs client-side, keine ENV vars

### CORS

- Alle APIs unterstützen CORS
- Kein Proxy nötig

### Content Security

- Statischer Content (kein UGC)
- Externe Links: `rel="noopener"`

---

**Für AI-Agents:** Diese Architektur ist bewusst einfach gehalten. Keine Microservices, keine Backend, keine Datenbank. Alles Static Site Generation + Client-Side Enhancement. Bei Änderungen: Events in `events.json` editieren → Build → Deploy.
