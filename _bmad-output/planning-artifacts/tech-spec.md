# Tech-Spec: Starnberg Events Optimierungen

**Projekt:** Starnberg Events (https://starnberg-events.pages.dev/)
**Stack:** Astro 5.x, TypeScript, Vanilla JS
**Erstellt:** 2026-02-03
**Status:** Empfehlungen zur Prüfung

---

## Executive Summary

Die Codebase ist solide aufgebaut mit guten Grundlagen:
- Kleine Bundle-Größen (22KB CSS, 4KB JS)
- Moderne Astro 5.x Static Site Generation
- Gute Accessibility-Grundlagen (ARIA, focus-visible, reduced-motion)

**Hauptverbesserungspotential:**
1. Performance: API-Caching, Lazy Loading
2. Code-Qualität: TypeScript für Client-Scripts, Error Handling
3. UX: URL-basierte Filter, Accessibility-Vervollständigung

---

## 1. Performance-Optimierungen

### 1.1 API Response Caching (Hoch)

**Problem:** Weather- und Train-APIs werden bei jedem Seitenaufruf neu abgefragt.

**Lösung:** LocalStorage-Cache mit TTL

```typescript
// src/utils/api-cache.ts
interface CacheEntry<T> {
  data: T;
  expires: number;
}

export function getCached<T>(key: string): T | null {
  const entry = localStorage.getItem(key);
  if (!entry) return null;
  const { data, expires } = JSON.parse(entry) as CacheEntry<T>;
  return Date.now() < expires ? data : null;
}

export function setCache<T>(key: string, data: T, ttlMinutes: number): void {
  const entry: CacheEntry<T> = {
    data,
    expires: Date.now() + ttlMinutes * 60 * 1000
  };
  localStorage.setItem(key, JSON.stringify(entry));
}
```

**Empfohlene TTLs:**
- Wetter: 30 Minuten
- S-Bahn: 2 Minuten
- Fähre: 5 Minuten

**Dateien:** `WeatherWidget.astro:98-183`, `TrainInfo.astro:149-207`, `InfoTicker.astro:180-222`

---

### 1.2 Resource Hints (Mittel)

**Problem:** Keine DNS-Prefetch für externe APIs.

**Lösung in `Layout.astro` nach Zeile 18:**

```html
<link rel="dns-prefetch" href="https://api.open-meteo.com">
<link rel="dns-prefetch" href="https://dbf.finalrewind.org">
<link rel="preconnect" href="https://api.open-meteo.com" crossorigin>
```

**Geschätzte Verbesserung:** 100-300ms bei ersten API-Calls

---

### 1.3 Lazy Loading für Widgets (Mittel)

**Problem:** Weather/Train-APIs laden sofort bei DOMContentLoaded.

**Lösung:** IntersectionObserver für below-fold Widgets

```javascript
// In WeatherWidget.astro, TrainInfo.astro
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      fetchData();
      observer.disconnect();
    }
  });
}, { rootMargin: '100px' });

observer.observe(container);
```

**Alternativ für Mobile:** InfoTicker lädt erst nach User-Interaktion

---

### 1.4 Interval Cleanup (Niedrig)

**Problem:** setInterval-Timer werden bei Navigation nicht aufgeräumt.

**Betroffene Stellen:**
- `InfoTicker.astro:168` (4s Carousel)
- `TrainInfo.astro:215` (60s Refresh)
- `FerryInfo.astro:204` (60s Refresh)

**Lösung:**
```javascript
// Cleanup bei Page-Unload
window.addEventListener('pagehide', () => {
  clearInterval(autoplayInterval);
  clearInterval(refreshInterval);
});
```

---

## 2. Code-Qualität

### 2.1 TypeScript für Client-Side Scripts (Hoch)

**Problem:** Inline-Scripts nutzen kein TypeScript, keine Type-Safety für DOM-Manipulation.

**Betroffene Dateien:**
- `FilterBar.astro:217-267`
- `InfoTicker.astro:139-267`
- `WeatherWidget.astro:98-183`

**Empfehlung:** Scripts in separate `.ts`-Dateien auslagern

```
src/
├── scripts/
│   ├── filter.ts
│   ├── carousel.ts
│   └── weather.ts
```

**Astro-Integration:**
```astro
<script src="../scripts/filter.ts"></script>
```

---

### 2.2 API Response Types (Hoch)

**Problem:** API-Responses sind `any`-typed.

**Lösung:** Interface-Definitionen

```typescript
// src/types/api.ts
export interface WeatherResponse {
  current: {
    temperature_2m: number;
    weather_code: number;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_sum: number[];
  };
}

export interface TrainDeparture {
  train: string;
  scheduledDeparture: string;
  destination: string;
  platform: string;
  delayDeparture?: number;
  isCancelled?: boolean;
}
```

---

### 2.3 Error Handling Patterns (Mittel)

**Problem:** Silent failures, nur console.error

**Aktuell (`WeatherWidget.astro:166`):**
```javascript
} catch (error) {
  console.error('Weather fetch error:', error);
  container.innerHTML = fallbackHTML;
}
```

**Besser:**
```javascript
} catch (error) {
  reportError('weather-fetch', error);
  showUserError(container, 'Wetterdaten nicht verfügbar');
}

function reportError(context: string, error: unknown) {
  // Optional: Sentry oder eigenes Logging
  console.error(`[${context}]`, error);
}
```

---

### 2.4 Magic Numbers extrahieren (Niedrig)

**Problem:** Verstreute numerische Konstanten

**Lösung:** Zentrale Konfiguration

```typescript
// src/config/constants.ts
export const TIMING = {
  CAROUSEL_INTERVAL: 4000,
  TRAIN_REFRESH: 60000,
  WEATHER_TIMEOUT: 6000,
  SWIPE_THRESHOLD: 50,
} as const;

export const API = {
  WEATHER_URL: 'https://api.open-meteo.com/v1/forecast',
  TRAIN_URL: 'https://dbf.finalrewind.org',
} as const;
```

---

### 2.5 Shared Components (Niedrig)

**Problem:** Spinner-Animation 3x dupliziert

**Betroffene Dateien:**
- `WeatherWidget.astro:39-50`
- `TrainInfo.astro:84-95`
- `FerryInfo.astro:71-82`

**Lösung:** Shared Spinner Component

```astro
// src/components/shared/Spinner.astro
---
interface Props {
  size?: 'sm' | 'md';
}
const { size = 'md' } = Astro.props;
---
<div class:list={['spinner', `spinner--${size}`]} />

<style>
  .spinner {
    border: 2px solid rgba(255,255,255,0.2);
    border-top-color: var(--color-text);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  .spinner--sm { width: 12px; height: 12px; }
  .spinner--md { width: 18px; height: 18px; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
```

---

## 3. UX-Verbesserungen

### 3.1 URL-basierte Filter State (Hoch)

**Problem:** Filter-Zustand geht bei Refresh/Bookmark verloren

**Lösung:**

```typescript
// In FilterBar.astro script
function updateURL() {
  const params = new URLSearchParams();
  if (activeCategory !== 'alle') params.set('cat', activeCategory);
  if (activeRegion !== 'alle') params.set('region', activeRegion);
  if (activeSource !== 'alle') params.set('source', activeSource);

  const url = params.toString()
    ? `${location.pathname}?${params}`
    : location.pathname;
  history.replaceState(null, '', url);
}

function restoreFromURL() {
  const params = new URLSearchParams(location.search);
  // ... restore filter state
}

// Init
document.addEventListener('DOMContentLoaded', restoreFromURL);
```

**Vorteile:**
- Bookmarkable filtered views
- Shareable URLs
- Browser back/forward funktioniert

---

### 3.2 Skip Link für Accessibility (Hoch)

**Problem:** Kein "Skip to content" Link

**Lösung in `Layout.astro` nach `<body>`:**

```html
<a href="#main-content" class="skip-link">
  Zum Hauptinhalt springen
</a>

<style>
  .skip-link {
    position: absolute;
    top: -100%;
    left: 0;
    background: var(--color-primary);
    color: white;
    padding: var(--space-2) var(--space-4);
    z-index: 100;
  }
  .skip-link:focus {
    top: 0;
  }
</style>
```

Und `id="main-content"` auf den Haupt-Container.

---

### 3.3 Carousel Pause-Control (Hoch)

**Problem:** InfoTicker auto-advance ohne Pause verletzt WCAG 2.2.2

**Lösung:**

```javascript
let isPaused = false;

carousel.addEventListener('mouseenter', () => isPaused = true);
carousel.addEventListener('mouseleave', () => isPaused = false);

// Im Interval:
if (!isPaused && !prefersReducedMotion) {
  nextSlide();
}
```

**Oder:** Explicit Pause-Button hinzufügen

---

### 3.4 Filter Clear Button (Mittel)

**Problem:** Kein schnelles Zurücksetzen aller Filter

**Lösung in FilterBar.astro:**

```html
<button
  class="clear-filters"
  style="display: none;"
  onclick="clearAllFilters()"
>
  Filter zurücksetzen
</button>
```

```javascript
function clearAllFilters() {
  activeCategory = 'alle';
  activeRegion = 'alle';
  activeSource = 'alle';
  // Reset UI
  applyFilter();
}
```

---

### 3.5 Touch Targets verbessern (Mittel)

**Problem:** InfoTicker-Dots zu klein (6px)

**Aktuell (`InfoTicker.astro:119`):**
```css
.carousel-dot { width: 6px; height: 6px; }
```

**Besser:**
```css
.carousel-dot {
  width: 8px;
  height: 8px;
  padding: 8px; /* Touch area */
  margin: -8px; /* Visual size bleibt */
}
```

---

### 3.6 Live Region für Filter Count (Niedrig)

**Problem:** Screen Reader bekommen Filter-Änderungen nicht mit

**Lösung:**

```html
<div
  id="filter-status"
  aria-live="polite"
  class="visually-hidden"
></div>
```

```javascript
function updateFilterStatus(count) {
  document.getElementById('filter-status').textContent =
    `${count} Veranstaltungen gefunden`;
}
```

---

## 4. Priorisierte Roadmap

### Phase 1: Quick Wins (1-2h)

| Task | Impact | Aufwand |
|------|--------|---------|
| Resource Hints hinzufügen | Mittel | 5 min |
| Skip Link | Hoch | 15 min |
| Filter Clear Button | Mittel | 20 min |
| Carousel Pause bei Hover | Hoch | 15 min |

### Phase 2: Core Improvements (3-4h)

| Task | Impact | Aufwand |
|------|--------|---------|
| API Caching implementieren | Hoch | 1h |
| URL-basierte Filter State | Hoch | 1.5h |
| API Type Definitions | Mittel | 30 min |

### Phase 3: Code Quality (4-6h)

| Task | Impact | Aufwand |
|------|--------|---------|
| Scripts in .ts auslagern | Mittel | 2h |
| Error Handling Pattern | Mittel | 1h |
| Shared Components extrahieren | Niedrig | 1h |
| Constants zentralisieren | Niedrig | 30 min |

---

## 5. Nicht empfohlen (Over-Engineering)

Diese Punkte wurden bewusst **nicht** empfohlen:

- **Service Worker**: Für eine Event-Seite mit täglichen Updates nicht sinnvoll
- **Event Pagination**: Mit 72 Events ist die aktuelle Lösung performant genug
- **Virtualization**: DOM-Performance ist bei aktueller Größe kein Problem
- **Framework für State**: Vanilla JS reicht für die Filter-Komplexität

---

## Anhang: Betroffene Dateien

```
src/
├── layouts/Layout.astro        # Skip Link, Resource Hints
├── pages/index.astro           # main-content ID
├── components/
│   ├── FilterBar.astro         # URL State, Clear Button, Types
│   ├── InfoTicker.astro        # Pause Control, Touch Targets
│   ├── WeatherWidget.astro     # Caching, Types, Lazy Load
│   ├── TrainInfo.astro         # Caching, Types, Cleanup
│   └── FerryInfo.astro         # Caching, Cleanup
└── (neu) scripts/
    ├── api-cache.ts
    ├── filter.ts
    └── types/api.ts
```
