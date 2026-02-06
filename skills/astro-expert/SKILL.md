# Astro Expert Playbook

> Fortgeschrittene Patterns für Event-Websites mit 500+ Seiten

## Inhaltsverzeichnis
1. [Content Collections](#1-content-collections)
2. [View Transitions](#2-view-transitions)
3. [Islands Architecture](#3-islands-architecture)
4. [Astro + Cloudflare](#4-astro--cloudflare)
5. [SSG vs SSR vs Hybrid](#5-ssg-vs-ssr-vs-hybrid)
6. [Performance](#6-performance)

---

## 1. Content Collections

Content Collections sind der beste Weg, strukturierte Inhalte in Astro zu verwalten. Seit Astro v5.0 gibt es die Content Layer API, die speziell für skalierbare Projekte mit tausenden Einträgen optimiert ist.

### 1.1 Projekt-Struktur

```
src/
├── content.config.ts      # Collection-Definitionen
├── data/
│   ├── events/           # Markdown-Files für Events
│   │   ├── 2025-01-15-konzert.md
│   │   └── 2025-02-20-theater.md
│   ├── venues/           # JSON für Venues
│   │   └── venues.json
│   └── categories/       # YAML für Kategorien
│       └── categories.yaml
```

### 1.2 TypeScript-Konfiguration

```json
// tsconfig.json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "strictNullChecks": true,
    "allowJs": true
  }
}
```

### 1.3 Schema-Definition mit Zod

```typescript
// src/content.config.ts
import { defineCollection, reference } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { z } from 'astro/zod';

// Event Collection mit komplexem Schema
const events = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/events" }),
  schema: ({ image }) => z.object({
    title: z.string().max(100),
    slug: z.string().optional(), // Custom ID überschreibt Dateiname
    description: z.string().max(300),
    
    // Datum-Handling
    date: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    
    // Referenzen zu anderen Collections
    venue: reference('venues'),
    categories: z.array(reference('categories')),
    relatedEvents: z.array(reference('events')).optional(),
    
    // Bilder mit Astro Image Optimization
    image: image().optional(),
    gallery: z.array(image()).optional(),
    
    // Enums für Type-Safety
    status: z.enum(['upcoming', 'ongoing', 'past', 'cancelled']),
    priceRange: z.enum(['free', 'low', 'medium', 'high']).default('medium'),
    
    // Strukturierte Daten
    pricing: z.object({
      currency: z.string().default('EUR'),
      min: z.number().optional(),
      max: z.number().optional(),
      ticketUrl: z.string().url().optional(),
    }).optional(),
    
    // SEO
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      noindex: z.boolean().default(false),
    }).optional(),
    
    // Metadaten
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    updatedAt: z.coerce.date().optional(),
  }),
});

// Venue Collection aus JSON
const venues = defineCollection({
  loader: file("src/data/venues/venues.json"),
  schema: ({ image }) => z.object({
    id: z.string(),
    name: z.string(),
    address: z.object({
      street: z.string(),
      city: z.string(),
      postalCode: z.string(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
      }).optional(),
    }),
    capacity: z.number().optional(),
    image: image().optional(),
    website: z.string().url().optional(),
    accessibility: z.object({
      wheelchair: z.boolean().default(false),
      parking: z.boolean().default(false),
    }).optional(),
  }),
});

// Kategorien aus YAML
const categories = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/data/categories" }),
  schema: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    icon: z.string().optional(),
    parent: reference('categories').optional(),
  }),
});

export const collections = { events, venues, categories };
```

### 1.4 Nested JSON laden

```typescript
// Wenn venues.json verschachtelt ist: { "venues": [...], "archivedVenues": [...] }
const venues = defineCollection({
  loader: file("src/data/venues.json", { 
    parser: (text) => JSON.parse(text).venues 
  }),
  schema: z.object({ /* ... */ }),
});
```

### 1.5 Query-Patterns für 500+ Events

```typescript
// src/pages/events/index.astro
---
import { getCollection, getEntry } from 'astro:content';

// Alle Events holen und filtern
const allEvents = await getCollection('events', ({ data }) => {
  // Keine Drafts in Production
  if (import.meta.env.PROD && data.draft) return false;
  // Nur zukünftige Events
  return data.date >= new Date();
});

// Sortieren nach Datum
const upcomingEvents = allEvents.sort(
  (a, b) => a.data.date.valueOf() - b.data.date.valueOf()
);

// Featured Events zuerst
const featuredFirst = allEvents.sort((a, b) => {
  if (a.data.featured && !b.data.featured) return -1;
  if (!a.data.featured && b.data.featured) return 1;
  return a.data.date.valueOf() - b.data.date.valueOf();
});

// Nach Kategorie filtern
const konzerte = await getCollection('events', ({ data }) => 
  data.categories.some(cat => cat.id === 'konzert')
);

// Nach Monat gruppieren
const byMonth = allEvents.reduce((acc, event) => {
  const month = event.data.date.toLocaleString('de-DE', { month: 'long', year: 'numeric' });
  (acc[month] = acc[month] || []).push(event);
  return acc;
}, {} as Record<string, typeof allEvents>);
---
```

### 1.6 Referenzen auflösen

```typescript
// src/pages/events/[id].astro
---
import { getEntry, getEntries, render } from 'astro:content';

const { id } = Astro.params;
const event = await getEntry('events', id);
if (!event) return Astro.redirect('/404');

// Einzelne Referenz auflösen
const venue = await getEntry(event.data.venue);

// Array von Referenzen auflösen
const categories = await getEntries(event.data.categories);
const relatedEvents = event.data.relatedEvents 
  ? await getEntries(event.data.relatedEvents) 
  : [];

// Markdown rendern
const { Content, headings } = await render(event);
---

<article>
  <h1>{event.data.title}</h1>
  <p>📍 {venue?.data.name}</p>
  <div class="categories">
    {categories.map(cat => (
      <span style={`background: ${cat.data.color}`}>{cat.data.name}</span>
    ))}
  </div>
  <Content />
</article>
```

### 1.7 Performance bei 500+ Einträgen

**Best Practices:**

1. **Content Layer API nutzen** (Astro 5+): Daten werden zwischen Builds gecacht
2. **Pagination implementieren**: Nie alle Events auf einer Seite laden
3. **Statische Pfade generieren**: Nutze `getStaticPaths()` mit Pagination

```typescript
// src/pages/events/page/[page].astro
---
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const events = await getCollection('events');
  const pageSize = 24;
  const totalPages = Math.ceil(events.length / pageSize);
  
  return Array.from({ length: totalPages }, (_, i) => ({
    params: { page: String(i + 1) },
    props: { 
      events: events.slice(i * pageSize, (i + 1) * pageSize),
      currentPage: i + 1,
      totalPages,
    },
  }));
}

const { events, currentPage, totalPages } = Astro.props;
---

<ul>
  {events.map(event => (
    <li><a href={`/events/${event.id}`}>{event.data.title}</a></li>
  ))}
</ul>

<nav>
  {currentPage > 1 && <a href={`/events/page/${currentPage - 1}`}>← Zurück</a>}
  <span>Seite {currentPage} von {totalPages}</span>
  {currentPage < totalPages && <a href={`/events/page/${currentPage + 1}`}>Weiter →</a>}
</nav>
```

### 1.8 JSON Schema für IDE-Support

Astro generiert automatisch JSON-Schemas in `.astro/collections/`:

```json
// .vscode/settings.json
{
  "json.schemas": [
    {
      "fileMatch": ["/src/data/venues/**/*.json"],
      "url": "./.astro/collections/venues.schema.json"
    }
  ],
  "yaml.schemas": {
    "./.astro/collections/categories.schema.json": "/src/data/categories/*.yaml"
  }
}
```

---

## 2. View Transitions

Astro bietet zwei Ansätze für Seitenübergänge:
1. **Native Browser View Transitions** (MPA, kein JS nötig)
2. **ClientRouter** (SPA-Modus, mehr Kontrolle)

### 2.1 ClientRouter aktivieren (SPA-Modus)

```astro
<!-- src/layouts/BaseLayout.astro -->
---
import { ClientRouter } from 'astro:transitions';
---

<html>
  <head>
    <ClientRouter />
  </head>
  <body>
    <slot />
  </body>
</html>
```

### 2.2 Transition Directives

```astro
<!-- Element-Paarung über Seiten hinweg -->
<header transition:name="main-header">
  ...
</header>

<!-- Animation-Typ wählen -->
<main transition:animate="slide">
  <slot />
</main>

<!-- Persistente Elemente (behalten State) -->
<video controls transition:persist>
  <source src="/video.mp4" type="video/mp4" />
</video>

<!-- Interaktive Komponente persistent halten -->
<AudioPlayer client:load transition:persist />

<!-- Auch Props persistieren (nicht nur State) -->
<Counter client:load transition:persist transition:persist-props />
```

### 2.3 Built-in Animationen

```astro
---
import { fade, slide } from 'astro:transitions';
---

<!-- Standard Fade (default) -->
<div transition:animate="fade">

<!-- Slide (links raus, rechts rein) -->
<main transition:animate="slide">

<!-- Keine Animation -->
<aside transition:animate="none">

<!-- Fade mit Custom Duration -->
<header transition:animate={fade({ duration: '0.4s' })}>
```

### 2.4 Custom Animations

```astro
<!-- src/layouts/BaseLayout.astro -->
---
const customSlideUp = {
  forwards: {
    old: { name: 'slideOutUp', duration: '0.3s', easing: 'ease-in' },
    new: { name: 'slideInUp', duration: '0.3s', easing: 'ease-out' },
  },
  backwards: {
    old: { name: 'slideOutDown', duration: '0.3s', easing: 'ease-in' },
    new: { name: 'slideInDown', duration: '0.3s', easing: 'ease-out' },
  },
};
---

<main transition:animate={customSlideUp}>
  <slot />
</main>

<style is:global>
  @keyframes slideOutUp {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-20px); }
  }
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideOutDown {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(20px); }
  }
  @keyframes slideInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
```

### 2.5 Programmatische Navigation

```astro
<script>
  import { navigate } from 'astro:transitions/client';
  
  // Select-Navigation
  document.querySelector('select')?.addEventListener('change', (e) => {
    navigate(e.target.value);
  });
  
  // Mit History-Optionen
  navigate('/dashboard', { history: 'replace' }); // Ersetzt aktuellen Eintrag
</script>
```

### 2.6 Client-side Navigation verhindern

```astro
<!-- Vollständiger Page Reload für diesen Link -->
<a href="/external-app" data-astro-reload>Externe App</a>

<!-- History-Eintrag ersetzen statt pushen -->
<a href="/main" data-astro-history="replace">Zurück zur Hauptseite</a>
```

### 2.7 Lifecycle Events

```astro
<script>
  // Vor dem Laden der neuen Seite
  document.addEventListener('astro:before-preparation', (e) => {
    // Loading Spinner anzeigen
    document.body.classList.add('loading');
  });
  
  // Nach dem Laden, vor dem Swap
  document.addEventListener('astro:before-swap', (e) => {
    // DOM manipulieren vor dem Swap
  });
  
  // Nach dem Swap (DOM ist neu)
  document.addEventListener('astro:after-swap', () => {
    // Dark Mode Theme anwenden BEVOR Paint
    if (localStorage.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    document.body.classList.remove('loading');
  });
  
  // Navigation komplett abgeschlossen
  document.addEventListener('astro:page-load', () => {
    // Scripts initialisieren die auf DOM angewiesen sind
    initializeEventHandlers();
  });
</script>
```

### 2.8 Scripts bei View Transitions

**Problem:** Bundled Scripts laufen nur einmal, nicht bei Navigation.

```astro
<!-- Option 1: Event Listener nutzen -->
<script>
  document.addEventListener('astro:page-load', () => {
    // Wird bei jeder Navigation ausgeführt
    document.querySelector('.hamburger')?.addEventListener('click', () => {
      document.querySelector('.nav-links')?.classList.toggle('expanded');
    });
  });
</script>

<!-- Option 2: data-astro-rerun für Inline-Scripts -->
<script is:inline data-astro-rerun>
  console.log('Läuft bei jeder Navigation');
</script>

<!-- Option 3: Globaler State Check -->
<script is:inline>
  if (!window.myAppInitialized) {
    window.myAppInitialized = true;
    // Einmalige Initialisierung
  }
</script>
```

### 2.9 Fallback für ältere Browser

```astro
---
import { ClientRouter } from 'astro:transitions';
---

<!-- animate (default): Simuliert View Transitions -->
<ClientRouter fallback="animate" />

<!-- swap: Sofortiger Seitenwechsel ohne Animation -->
<ClientRouter fallback="swap" />

<!-- none: Voller Page Reload -->
<ClientRouter fallback="none" />
```

### 2.10 prefers-reduced-motion

Astro respektiert automatisch `prefers-reduced-motion`. Bei aktivierter Einstellung werden Animationen übersprungen.

---

## 3. Islands Architecture

Islands = Interaktive UI-Komponenten in einem Meer von statischem HTML.

### 3.1 Client Directives im Überblick

| Directive | Priorität | Wann laden? | Use Case |
|-----------|-----------|-------------|----------|
| `client:load` | Hoch | Sofort bei Page Load | Hero-Slider, Navigation, wichtige CTA |
| `client:idle` | Mittel | Nach `requestIdleCallback` | Formulare, Newsletter-Signup |
| `client:visible` | Niedrig | Beim Scrollen in Viewport | Bildergalerie, Kommentare, Footer-Widgets |
| `client:media` | Bedingt | Bei Media Query Match | Mobile Navigation |
| `client:only` | Speziell | Nur Client, kein SSR | Maps, Charts (SSR-inkompatibel) |

### 3.2 Entscheidungsbaum

```
Braucht die Komponente JavaScript?
├── Nein → Kein client: Directive (statisches HTML)
└── Ja → Muss sofort interaktiv sein?
    ├── Ja → client:load
    └── Nein → Ist es above-the-fold?
        ├── Ja → client:idle
        └── Nein → Ist es sichtbar beim Scrollen?
            ├── Ja → client:visible
            └── Nein → Ist es nur auf bestimmten Screens?
                ├── Ja → client:media="(max-width: 768px)"
                └── Funktioniert SSR nicht?
                    └── Ja → client:only="react"
```

### 3.3 Praktische Beispiele

```astro
<!-- SOFORT: Header-Navigation mit Dropdown -->
<HeaderNav client:load />

<!-- IDLE: Such-Input (Priorität niedriger) -->
<SearchBox client:idle />

<!-- IDLE mit Timeout: Maximal 500ms warten -->
<ChatWidget client:idle={{ timeout: 500 }} />

<!-- VISIBLE: Event-Kalender weiter unten -->
<EventCalendar client:visible />

<!-- VISIBLE mit Margin: 200px vorher laden -->
<ImageGallery client:visible={{ rootMargin: "200px" }} />

<!-- MEDIA: Mobile Menu nur auf kleinen Screens -->
<MobileMenu client:media="(max-width: 768px)" />

<!-- ONLY: Google Maps (funktioniert nicht mit SSR) -->
<GoogleMap client:only="react" apiKey={import.meta.env.MAPS_KEY} />
```

### 3.4 Framework-Integration

```astro
---
// React, Vue, Svelte, Solid nebeneinander nutzen
import ReactCounter from '../components/ReactCounter.jsx';
import VueCalendar from '../components/VueCalendar.vue';
import SvelteForm from '../components/SvelteForm.svelte';
---

<ReactCounter client:load initialCount={5} />
<VueCalendar client:visible events={events} />
<SvelteForm client:idle />
```

### 3.5 Fallback Content für client:only

```astro
<GoogleMap client:only="react">
  <div slot="fallback">
    <p>Karte wird geladen...</p>
    <noscript>JavaScript wird für die Karte benötigt.</noscript>
  </div>
</GoogleMap>
```

### 3.6 Server Islands (Astro 5+)

Für personalisierte/dynamische Server-Inhalte ohne die ganze Seite zu blocken:

```astro
---
import Avatar from '../components/Avatar.astro';
import RecentEvents from '../components/RecentEvents.astro';
---

<!-- Seite wird sofort gerendert, Avatar kommt nach -->
<header>
  <nav>...</nav>
  <Avatar server:defer />
</header>

<!-- Fallback während Server Island lädt -->
<RecentEvents server:defer>
  <div slot="fallback">
    <div class="skeleton-loader">Lade Events...</div>
  </div>
</RecentEvents>
```

### 3.7 Performance-Optimierung

```astro
---
// Schwere Komponenten nur bei Bedarf importieren
const HeavyChart = Astro.slots.has('chart') 
  ? (await import('../components/HeavyChart.jsx')).default 
  : null;
---

{HeavyChart && <HeavyChart client:visible data={chartData} />}
```

---

## 4. Astro + Cloudflare

### 4.1 Adapter installieren

```bash
npx astro add cloudflare
```

```typescript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server', // oder 'hybrid'
  adapter: cloudflare({
    imageService: 'cloudflare', // Cloudflare Image Resizing nutzen
    platformProxy: {
      enabled: true, // Lokale Entwicklung mit Bindings
    },
  }),
});
```

### 4.2 Wrangler-Konfiguration

```jsonc
// wrangler.jsonc
{
  "name": "starnberg-events",
  "main": "dist/_worker.js/index.js",
  "compatibility_date": "2025-02-01",
  "compatibility_flags": ["nodejs_compat"],
  
  "assets": {
    "binding": "ASSETS",
    "directory": "./dist"
  },
  
  // D1 Datenbank
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "starnberg-events-db",
      "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    }
  ],
  
  // KV Storage
  "kv_namespaces": [
    {
      "binding": "CACHE",
      "id": "xxxxxxxx"
    },
    {
      "binding": "SESSION",
      "id": "xxxxxxxx"
    }
  ],
  
  // Environment Variables
  "vars": {
    "PUBLIC_SITE_URL": "https://starnberg-events.de",
    "ENVIRONMENT": "production"
  }
}
```

### 4.3 .assetsignore erstellen

```
# public/.assetsignore
_worker.js
_routes.json
```

### 4.4 Environment Variables & Secrets

```typescript
// Zugriff auf Cloudflare Bindings
---
export const prerender = false;

const { env } = Astro.locals.runtime;

// Environment Variables
const siteUrl = env.PUBLIC_SITE_URL;

// D1 Database Query
const events = await env.DB.prepare(
  "SELECT * FROM events WHERE date >= ? ORDER BY date LIMIT 10"
).bind(new Date().toISOString()).all();

// KV Cache
const cached = await env.CACHE.get('featured-events', 'json');
---
```

### 4.5 D1 Database Integration

```typescript
// src/lib/db.ts
import type { D1Database } from '@cloudflare/workers-types';

export async function getUpcomingEvents(db: D1Database, limit = 10) {
  const { results } = await db.prepare(`
    SELECT e.*, v.name as venue_name 
    FROM events e
    JOIN venues v ON e.venue_id = v.id
    WHERE e.date >= datetime('now')
    ORDER BY e.date
    LIMIT ?
  `).bind(limit).all();
  
  return results;
}

// src/pages/api/events.ts
export const prerender = false;

export async function GET(context) {
  const { env } = context.locals.runtime;
  const events = await getUpcomingEvents(env.DB);
  
  return new Response(JSON.stringify(events), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

### 4.6 Sessions mit KV

```typescript
// astro.config.mjs
export default defineConfig({
  adapter: cloudflare({
    sessionKVBindingName: 'SESSION', // KV Namespace für Sessions
  }),
});

// src/pages/dashboard.astro
---
export const prerender = false;

const user = await Astro.session?.get('user');
if (!user) {
  return Astro.redirect('/login');
}
---
```

### 4.7 TypeScript Types generieren

```bash
npx wrangler types
```

```typescript
// src/env.d.ts
type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    user?: { id: string; name: string };
  }
}
```

### 4.8 Custom Worker Entry (Durable Objects, Queues)

```typescript
// src/worker.ts
import type { SSRManifest } from 'astro';
import { App } from 'astro/app';
import { handle } from '@astrojs/cloudflare/handler';
import { DurableObject } from 'cloudflare:workers';

export class EventCounter extends DurableObject<Env> {
  async increment(eventId: string) {
    const count = (await this.ctx.storage.get<number>(eventId)) || 0;
    await this.ctx.storage.put(eventId, count + 1);
    return count + 1;
  }
}

export function createExports(manifest: SSRManifest) {
  const app = new App(manifest);
  return {
    default: {
      async fetch(request, env, ctx) {
        return handle(manifest, app, request, env, ctx);
      },
    },
    EventCounter,
  };
}
```

```typescript
// astro.config.mjs
export default defineConfig({
  adapter: cloudflare({
    workerEntryPoint: {
      path: 'src/worker.ts',
      namedExports: ['EventCounter'],
    },
  }),
});
```

---

## 5. SSG vs SSR vs Hybrid

### 5.1 Output Modes

| Mode | Config | Default Prerender | Use Case |
|------|--------|-------------------|----------|
| **Static (SSG)** | `output: 'static'` | Alles | Blogs, Docs, Marketing |
| **Server (SSR)** | `output: 'server'` | Nichts | Dashboards, E-Commerce |
| **Hybrid** | `output: 'hybrid'` | Alles | Mix aus statisch + dynamisch |

### 5.2 Hybrid Mode (Empfohlen für Event-Sites)

```typescript
// astro.config.mjs
export default defineConfig({
  output: 'hybrid', // Default: prerender = true
  adapter: cloudflare(),
});
```

```astro
<!-- src/pages/events/index.astro - STATISCH (default) -->
---
// Wird bei Build-Zeit generiert
const events = await getCollection('events');
---

<!-- src/pages/events/[id].astro - STATISCH (default) -->
---
export async function getStaticPaths() {
  const events = await getCollection('events');
  return events.map(event => ({
    params: { id: event.id },
    props: { event },
  }));
}
---

<!-- src/pages/api/search.ts - DYNAMISCH -->
---
export const prerender = false; // Explizit SSR

export async function GET(context) {
  const query = context.url.searchParams.get('q');
  const { env } = context.locals.runtime;
  // Suche in D1...
}
---

<!-- src/pages/dashboard.astro - DYNAMISCH -->
---
export const prerender = false;
// Session-basierte Inhalte
---
```

### 5.3 Wann was nutzen?

**Statisch (prerender = true):**
- Event-Detailseiten (Inhalt ändert sich selten)
- Kategorie-Übersichten
- Venue-Seiten
- About, Impressum, Datenschutz

**Dynamisch (prerender = false):**
- Suche
- User Dashboard
- Warenkorb
- Personalisierte Empfehlungen
- Echtzeit-Verfügbarkeit

### 5.4 Incremental Static Regeneration (ISR)

Astro hat kein natives ISR, aber Patterns:

**Option 1: Stale-While-Revalidate Header**
```typescript
// src/pages/events/[id].astro
---
export const prerender = false;

// Cache für 1 Stunde, danach revalidieren
Astro.response.headers.set(
  'Cache-Control', 
  'public, s-maxage=3600, stale-while-revalidate=86400'
);
---
```

**Option 2: Cloudflare Cache API**
```typescript
export async function GET(context) {
  const cacheKey = new Request(context.url.toString());
  const cache = caches.default;
  
  let response = await cache.match(cacheKey);
  if (response) return response;
  
  // Daten holen und Response bauen
  const data = await fetchEventData();
  response = new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=3600',
    },
  });
  
  // In Cache speichern
  context.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}
```

**Option 3: On-Demand Rebuild**
```typescript
// src/pages/api/revalidate.ts
export const prerender = false;

export async function POST(context) {
  const { secret, path } = await context.request.json();
  
  if (secret !== context.locals.runtime.env.REVALIDATE_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Trigger Cloudflare Pages rebuild via API
  await fetch('https://api.cloudflare.com/client/v4/...', {
    method: 'POST',
    headers: { Authorization: `Bearer ${context.locals.runtime.env.CF_API_TOKEN}` },
  });
  
  return new Response('Revalidation triggered');
}
```

---

## 6. Performance

### 6.1 Image Optimization mit astro:assets

```astro
---
import { Image, Picture } from 'astro:assets';
import eventImage from '../assets/event-hero.jpg';
---

<!-- Einfaches optimiertes Bild -->
<Image 
  src={eventImage} 
  alt="Event Bild"
  width={800}
  height={600}
/>

<!-- Responsive mit mehreren Formaten -->
<Picture 
  src={eventImage}
  formats={['avif', 'webp']}
  alt="Event Bild"
  widths={[400, 800, 1200]}
  sizes="(max-width: 768px) 100vw, 800px"
/>

<!-- Remote Image (muss in config authorisiert sein) -->
<Image 
  src="https://cdn.example.com/event.jpg"
  alt="Remote Event"
  width={600}
  height={400}
/>
```

### 6.2 Responsive Images (Astro 5.10+)

```typescript
// astro.config.mjs
export default defineConfig({
  image: {
    // Global responsive behavior aktivieren
    layout: 'constrained', // oder 'full-width', 'fixed'
    
    // Responsive styles aktivieren
    responsiveStyles: true,
    
    // Remote Domains
    domains: ['cdn.example.com', 'images.unsplash.com'],
    remotePatterns: [{ protocol: 'https' }],
  },
});
```

```astro
<!-- Überschreibt globales Layout pro Bild -->
<Image 
  src={heroImage} 
  alt="Hero"
  layout="full-width"
  fit="cover"
  position="center"
/>
```

### 6.3 Font Loading

```astro
<!-- src/layouts/BaseLayout.astro -->
<head>
  <!-- Preconnect für Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  
  <!-- Font mit display=swap -->
  <link 
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" 
    rel="stylesheet"
  />
</head>

<style is:global>
  /* Fallback Font Stack */
  :root {
    --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  }
  
  body {
    font-family: var(--font-sans);
  }
</style>
```

**Besser: Self-hosted Fonts**

```astro
<!-- public/fonts/inter-var.woff2 -->
<style is:global>
  @font-face {
    font-family: 'Inter';
    src: url('/fonts/inter-var.woff2') format('woff2');
    font-weight: 100 900;
    font-display: swap;
  }
</style>
```

### 6.4 CSS Strategies

```astro
<!-- Scoped Styles (default) -->
<style>
  .event-card {
    /* Nur in dieser Komponente gültig */
  }
</style>

<!-- Global Styles -->
<style is:global>
  :root {
    --color-primary: #2563eb;
  }
</style>

<!-- Inline Styles (kein Processing) -->
<style is:inline>
  /* Wird 1:1 ausgegeben */
</style>

<!-- CSS Variables aus Frontmatter -->
<style define:vars={{ primaryColor: '#2563eb', spacing: '1rem' }}>
  .card {
    background: var(--primaryColor);
    padding: var(--spacing);
  }
</style>
```

### 6.5 Bundle Splitting

Astro macht automatisch Code-Splitting. Manuelle Kontrolle:

```astro
---
// Lazy Import für große Komponenten
const HeavyChart = (await import('../components/HeavyChart.jsx')).default;

// Conditional Import
const AdminPanel = import.meta.env.DEV 
  ? (await import('../components/AdminPanel.astro')).default 
  : null;
---
```

### 6.6 Performance-Checkliste für 500+ Seiten

```
□ Content Collections mit Content Layer API (Astro 5+)
□ Pagination statt alle Events auf einer Seite
□ client:visible für below-the-fold Komponenten
□ client:idle für nicht-kritische Interaktionen
□ Image Optimization mit <Picture> und AVIF/WebP
□ Responsive Images mit layout="constrained"
□ Self-hosted Fonts mit font-display: swap
□ Preconnect für externe Ressourcen
□ Hybrid Mode: Statisch wo möglich, SSR wo nötig
□ Cloudflare Image Resizing für Remote Images
□ Cache-Header für SSR-Seiten
□ View Transitions für smoother UX ohne Layout Shift
```

### 6.7 Build-Optimierung für große Sites

```typescript
// astro.config.mjs
export default defineConfig({
  build: {
    // Inlines CSS unter 4KB
    inlineStylesheets: 'auto',
  },
  
  vite: {
    build: {
      // Chunk-Größe optimieren
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
          },
        },
      },
    },
  },
});
```

---

## Quick Reference

### Content Collections
```typescript
// Query
const events = await getCollection('events', filter);
const event = await getEntry('events', id);
const venue = await getEntry(event.data.venue); // Referenz auflösen
const { Content } = await render(event); // Markdown rendern
```

### View Transitions
```astro
<ClientRouter fallback="animate" />
<div transition:name="hero" transition:animate={slide()} transition:persist>
```

### Islands
```astro
<Component client:load />      <!-- Sofort -->
<Component client:idle />      <!-- Wenn idle -->
<Component client:visible />   <!-- Wenn sichtbar -->
<Component client:only="react" /> <!-- Nur Client -->
<Component server:defer />     <!-- Server Island -->
```

### Cloudflare
```typescript
const { env } = Astro.locals.runtime;
await env.DB.prepare('SELECT...').all();
await env.CACHE.get('key');
```

### Rendering Mode
```typescript
export const prerender = false; // SSR
export const prerender = true;  // SSG (default in hybrid)
```
