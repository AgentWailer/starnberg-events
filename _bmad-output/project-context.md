# Starnberg Events — Project Context für AI-Agents

**Stack:** Astro 5.x • TypeScript • Vanilla JS (Zero Dependencies)  
**Build:** Static Site Generation (SSG)

---

## 🚨 KRITISCHE REGELN

### Astro-spezifische Patterns

**1. Client-Side Interaktivity**
```astro
<!-- ✅ RICHTIG: Script NACH den Elementen -->
<div id="my-element"></div>

<script>
  document.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById('my-element');
    // Interaktivität hier
  });
</script>
```
- **NIEMALS** `client:load` oder andere Hydration-Direktiven (keine Frameworks!)
- Vanilla `<script>` Tags für alle Interaktionen
- Events IMMER via `DOMContentLoaded` oder direkt im Script nach dem Element
- TypeScript in Scripts erlaubt: `async function fetchData(): Promise<void> {}`

**2. Dynamisch erzeugte Klassen**
```css
/* ✅ RICHTIG: :global() für via JS eingefügte Klassen */
:global(.train-row) {
  display: grid;
}

/* ❌ FALSCH: Normale Klassen werden von Astro nicht auf dynamische Elemente gemappt */
.train-row {
  display: grid; /* Funktioniert NICHT wenn via innerHTML eingefügt! */
}
```

**3. SVG Icons**
- **Inline SVG** direkt im Markup (keine externe Icon-Library)
- `stroke="currentColor"` für Farb-Vererbung
- `stroke-width="2"` als Standard
- Größe via `.icon { width: 14px; height: 14px; }`

---

## 🎨 CSS Custom Properties System

### NIEMALS Magic Numbers!

**✅ RICHTIG:**
```css
padding: var(--space-4);
gap: var(--space-3);
border-radius: var(--radius-md);
color: var(--color-text-secondary);
```

**❌ FALSCH:**
```css
padding: 16px;
gap: 12px;
border-radius: 10px;
color: #666;
```

### Verfügbare Token

**Spacing Scale:**
- `--space-1` bis `--space-24` (0.25rem bis 6rem)
- Standard-Gaps: `--space-3`, `--space-4`, `--space-5`

**Colors:**
- Text: `--color-text`, `--color-text-secondary`, `--color-muted`
- Backgrounds: `--color-bg`, `--color-bg-secondary`, `--color-card`
- Borders: `--color-border`, `--color-border-light`
- Primary: `--color-primary`, `--color-primary-light`, `--color-primary-dark`
- Accent: `--color-accent`, `--color-accent-light`
- Kategorien: `--color-kinder`, `--color-familie`, `--color-erwachsene`

**Border Radius:**
- `--radius-sm` (6px), `--radius-md` (10px), `--radius-lg` (14px), `--radius-xl` (20px), `--radius-full` (9999px)

**Shadows:**
- `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`

**Transitions:**
- `--duration-fast` (120ms), `--duration-normal` (200ms), `--duration-slow` (300ms)

### Dark Mode
```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #1a1816;
    /* Automatisch via Media Query überschrieben */
  }
}
```
- **NIEMALS** manuelle Dark-Mode Toggle
- System-Preference respektieren

---

## 📱 Responsive Design

### Breakpoints
```css
@media (min-width: 480px) { /* Small tablets */ }
@media (min-width: 640px) { /* Tablets */ }
@media (min-width: 768px) { /* Desktop */ }
```

### Mobile-First Typography
```css
/* ✅ clamp() für fluid scaling */
h1 {
  font-size: clamp(2rem, 6vw, 3.5rem);
}

h2 {
  font-size: clamp(1.25rem, 3vw, 1.75rem);
}
```

### Conditional Rendering
```astro
<!-- Desktop only -->
<div class="desktop-only">...</div>

<style>
  .desktop-only {
    display: none;
  }
  
  @media (min-width: 768px) {
    .desktop-only {
      display: block;
    }
  }
</style>
```

---

## ♿️ Accessibility Patterns

### 1. Focus States
```css
/* ✅ Alle interaktiven Elemente */
button:focus-visible,
a:focus-visible,
[tabindex]:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

:focus:not(:focus-visible) {
  outline: none; /* Kein Outline bei Mouse-Click */
}
```

### 2. Touch Targets
```css
/* Minimum 44px für mobile Buttons/Links */
button {
  min-height: var(--touch-target-min); /* 44px */
}
```

### 3. Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 4. ARIA Labels
```astro
<div role="group" aria-label="Filter nach Kategorie">
  <button aria-pressed="true">Alle</button>
</div>

<!-- Screen-reader only Text -->
<span class="sr-only">Weitere Informationen</span>
```

### 5. Semantic HTML
```astro
<!-- ✅ RICHTIG -->
<article>
  <h3>Event Title</h3>
  <time datetime="2026-02-15">15. Feb</time>
</article>

<!-- ❌ FALSCH -->
<div>
  <div class="title">Event Title</div>
  <div>15. Feb</div>
</div>
```

---

## 🔌 API-Calls & Error Handling

### Vanilla Fetch Pattern
```typescript
async function fetchData(): Promise<void> {
  const container = document.getElementById('container');
  if (!container) return;

  try {
    // 1️⃣ Timeout via AbortController
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    
    // 2️⃣ Fetch mit Signal
    const res = await fetch('https://api.example.com/data', { 
      signal: ctrl.signal 
    });
    clearTimeout(timer);
    
    // 3️⃣ HTTP Error prüfen
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const data = await res.json();
    
    // 4️⃣ Rendering
    container.innerHTML = data.items.map(item => `
      <div class="item">${item.name}</div>
    `).join('');
    
  } catch (error) {
    // 5️⃣ Graceful Fallback
    container.innerHTML = `
      <div class="error">
        Daten nicht verfügbar
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', fetchData);
```

**Wichtig:**
- **IMMER** Timeout (6-8 Sekunden Standard)
- **IMMER** Fallback-UI bei Fehler
- **NIEMALS** unbehandelte Promise Rejections

---

## 🧩 Komponenten-Struktur

### Typisches Astro-Komponenten-Layout
```astro
---
// 1️⃣ Props Interface
interface Props {
  title: string;
  optional?: number;
}

const { title, optional = 42 } = Astro.props;

// 2️⃣ Server-side Logic (runs at build)
const data = await fetch('...').then(r => r.json());
---

<!-- 3️⃣ Markup -->
<div class="component">
  <h2>{title}</h2>
  <slot /> <!-- Für nested content -->
</div>

<!-- 4️⃣ Scoped Styles -->
<style>
  .component {
    padding: var(--space-4);
  }
</style>

<!-- 5️⃣ Client-side Script -->
<script>
  document.addEventListener('DOMContentLoaded', () => {
    // Interactive code here
  });
</script>
```

### FilterBar Pattern (Events filtern)
```typescript
// State
let activeCategory = 'all';
let activeRegion = 'all';

function filterEvents() {
  const cards = document.querySelectorAll('.event-card');
  let count = 0;
  
  cards.forEach(card => {
    const el = card as HTMLElement;
    const matchCat = activeCategory === 'all' 
      || el.dataset.category === activeCategory;
    const matchReg = activeRegion === 'all' 
      || el.dataset.region === activeRegion;
    
    if (matchCat && matchReg) {
      el.style.display = '';
      count++;
    } else {
      el.style.display = 'none';
    }
  });
  
  // Counter aktualisieren
  const countEl = document.getElementById('visible-count');
  if (countEl) countEl.textContent = String(count);
}
```

---

## 🚫 ANTI-PATTERNS

### ❌ NIEMALS tun

**1. Keine Dependencies hinzufügen**
```bash
# ❌ VERBOTEN
npm install react
npm install tailwindcss
npm install axios
npm install lodash
```
→ **Vanilla JS only!** Das Projekt ist absichtlich Zero-Dependency.

**2. Keine globalen CSS-Overrides**
```css
/* ❌ FALSCH: Body/HTML styles überschreiben */
body {
  background: #fff; /* Layout.astro managed das! */
}
```

**3. Keine Magic Numbers**
```css
/* ❌ FALSCH */
margin-bottom: 24px;

/* ✅ RICHTIG */
margin-bottom: var(--space-6);
```

**4. Keine !important (außer Accessibility)**
```css
/* ❌ FALSCH */
.button {
  color: red !important;
}

/* ✅ RICHTIG (nur für a11y) */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
  }
}
```

**5. Keine Inline Styles in Templates**
```astro
<!-- ❌ FALSCH -->
<div style="color: red; padding: 10px;">

<!-- ✅ RICHTIG -->
<div class="error-box">

<style>
  .error-box {
    color: var(--color-error);
    padding: var(--space-3);
  }
</style>
```

---

## 🧪 Testing & Validation

### Vor jedem Commit

**1. Build-Test**
```bash
npm run build
```
→ Muss OHNE Fehler durchlaufen!

**2. Dev Server**
```bash
npm run dev
```
→ Visuell testen in Browser

**3. Responsive Check**
- Chrome DevTools: Mobile (375px), Tablet (768px), Desktop (1280px)

**4. Accessibility Check**
- Tab-Navigation funktioniert?
- Focus States sichtbar?
- Screen Reader Labels vorhanden?

### Edge Cases

**API Failures:**
- Was passiert bei Timeout? → Fallback-UI
- Was wenn API 404 zurückgibt? → Graceful degradation
- Was wenn JSON invalid? → try/catch

**Empty States:**
- Keine Events gefunden? → Hilfreicher Text zeigen
- Alle gefiltert? → Filter zurücksetzen-Button

**Long Content:**
- Langer Event-Titel? → `text-overflow: ellipsis` oder `-webkit-line-clamp`
- Viele Events? → Performance beachten (keine Animation bei >100 Items)

---

## 📁 Projektstruktur

```
starnberg-events/
├── src/
│   ├── components/          # Wiederverwendbare Komponenten
│   │   ├── EventCard.astro
│   │   ├── FilterBar.astro
│   │   ├── WeatherWidget.astro
│   │   └── ...
│   ├── layouts/
│   │   └── Layout.astro     # Global Styles & HTML
│   ├── pages/
│   │   └── index.astro      # Homepage (Routing = File-based)
│   └── data/
│       └── events.json      # Static data
├── public/                  # Static assets
├── astro.config.mjs
└── package.json
```

---

## 🎯 Wichtigste Learnings für AI-Agents

1. **Vanilla JS ist Pflicht** — keine npm-Pakete außer Astro selbst
2. **CSS Custom Properties nutzen** — keine Magic Numbers
3. **:global() für dynamische Klassen** — innerHTML-erzeugte Elemente brauchen das
4. **AbortController bei Fetches** — immer mit Timeout
5. **Graceful Degradation** — API-Fehler dürfen UI nicht brechen
6. **Accessibility first** — focus-visible, ARIA, reduced-motion
7. **Mobile-first Design** — clamp() für Typo, min-width Media Queries
8. **Dark Mode via prefers-color-scheme** — automatisch, kein Toggle

---

**Letzte Aktualisierung:** 2026-02-03  
**Astro Version:** 5.17.1
