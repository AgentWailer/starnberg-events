# Stacking Context Audit — Starnberg Events

**Datum:** 2026-02-05  
**Problem:** Event-Cards und Content "bluten" über sticky Section-Headings trotz mehrfacher Patches.  
**Ziel:** Vollständige Stacking-Context-Map und dauerhafte Lösung.

---

## 🏗️ Vollständige Stacking-Context-Hierarchie

```
html
└─ body
   ├─ .skip-link (z-index: 9999)
   ├─ .navbar (z-index: 100) — STACKING CONTEXT
   │  └─ .navbar-brand (opacity transition) — STACKING CONTEXT
   ├─ .mobile-info-bar (z-index: 100) — STACKING CONTEXT
   ├─ main.main (z-index: 1) — STACKING CONTEXT
   │  └─ .container
   │     └─ .content-grid (Desktop: Grid-Container)
   │        ├─ .column-left (Desktop: overflow-y: auto) — SCROLL PORT
   │        │  └─ .filter-sidebar
   │        │     ├─ .toggle-pill (transition: all)
   │        │     ├─ .chip (transition: all)
   │        │     └─ ...
   │        ├─ .column-center (Desktop: overflow-y: auto) — SCROLL PORT
   │        │  ├─ .events-list
   │        │  │  └─ .day-group (multiple)
   │        │  │     ├─ .section-heading (sticky, z-index: 2 mobile / 5 desktop) — STACKING CONTEXT
   │        │  │     │  ├─ ::before (absolute, opaque background extension)
   │        │  │     │  └─ ::after (absolute, fade gradient)
   │        │  │     └─ .day-events (z-index: 1) — STACKING CONTEXT
   │        │  │        └─ .event-card (overflow: clip + transition: transform) — STACKING CONTEXT!
   │        │  │           ├─ .favorite-btn (absolute, z-index: 10) — STACKING CONTEXT
   │        │  │           └─ .card-link
   │        │  ├─ .wk-carousel-section
   │        │  │  └─ .wk-card (transition: all) — STACKING CONTEXT
   │        │  └─ #load-more-btn (transition)
   │        └─ .column-right (Desktop: overflow-y: auto) — SCROLL PORT
   │           └─ .section-heading (sticky, z-index: 5) — STACKING CONTEXT
   │              └─ ::after (fade gradient)
   ├─ .mobile-filter-bar (fixed, z-index: 200) — STACKING CONTEXT
   ├─ .filter-sheet-backdrop (fixed, z-index: 299) — STACKING CONTEXT
   └─ .filter-sheet (fixed, z-index: 300) — STACKING CONTEXT
```

---

## 🔍 Stacking Context Erzeuger (vollständige Liste)

### 1. **Root-Level (Body-Kinder)**
- ✅ `.skip-link` → `z-index: 9999` + `position: fixed`
- ✅ `.navbar` → `z-index: 100` + `position: fixed` (Desktop) / `position: relative` (Tablet/Mobile)
- ✅ `.mobile-info-bar` → `z-index: 100` + `position: sticky`
- ✅ `main.main` → `z-index: 1` + `position: relative`
- ✅ `.mobile-filter-bar` → `z-index: 200` + `position: fixed`
- ✅ `.filter-sheet-backdrop` → `z-index: 299` + `position: fixed`
- ✅ `.filter-sheet` → `z-index: 300` + `position: fixed`

### 2. **Inside Navbar**
- ✅ `.navbar-brand` → `opacity: 0/1` transition (impliziter Stacking Context)

### 3. **Inside .column-center (Scroll Container)**
- ✅ `.section-heading` (DayGroup) → `position: sticky` + `z-index: 2` (mobile) / `z-index: 5` (desktop)
  - **Pseudo-Elemente:**
    - `::before` → `position: absolute` (opaker Background-Extender)
    - `::after` → `position: absolute` (fade gradient)
- ✅ `.day-events` → `z-index: 1` + `position: relative`
- ⚠️ **`.event-card`** → `overflow: clip` + `transition: transform` → **IMPLIZITER STACKING CONTEXT!**
  - ✅ `.favorite-btn` → `position: absolute` + `z-index: 10`

### 4. **Inside .column-right (Scroll Container)**
- ✅ `.section-heading` → `position: sticky` + `z-index: 5`
  - `::after` → `position: absolute` (fade gradient)

### 5. **Weekend Highlights**
- ⚠️ `.wk-card` → `transition: all` → **IMPLIZITER STACKING CONTEXT**
- ⚠️ `.wh-card` → `transition: all` → **IMPLIZITER STACKING CONTEXT**

### 6. **Filter Sidebar**
- ⚠️ `.toggle-pill` → `transition: all` → **IMPLIZITER STACKING CONTEXT**
- ⚠️ `.chip` → `transition: all` → **IMPLIZITER STACKING CONTEXT**

---

## 🐛 Identifizierte Probleme

### **Problem #1: EventCard erzeugt impliziten Stacking Context**

**Location:** `src/components/EventCard.astro`

```css
.event-card {
  overflow: clip;  /* ❌ Erzeugt Stacking Context! */
  transition: 
    transform var(--duration-normal) ease,
    box-shadow var(--duration-normal) ease;  /* ❌ Auch transform-transition! */
}
```

**Warum ist das ein Problem?**

1. **`overflow: clip`** erzeugt einen **Stacking Context** (CSS Spec)
2. **`transition: transform`** erzeugt einen **Stacking Context** während der Transition
3. Dadurch wird `.event-card` zu einem **eigenständigen Stacking Context**
4. Dieser Context ist auf **derselben Ebene** wie `.day-events` (z-index: 1)
5. Das sticky `.section-heading` (z-index: 5) ist **nicht im gleichen Stacking Context** wie die Cards!

**DOM-Hierarchie:**
```
.column-center (scroll container)
├─ .day-group
│  ├─ .section-heading (sticky, z-index: 5) ← In Parent-Stacking-Context
│  └─ .day-events (z-index: 1)
│     └─ .event-card (overflow: clip) ← NEUER Stacking Context!
│        └─ Inhalt "entkommt" dem z-index: 1 Limit
```

**CSS Spec Referenz:**
> "Elements with `overflow: clip` establish a containing block for positioned descendants and **create a new stacking context**."

---

### **Problem #2: Sticky Heading Background nicht durchgängig**

**Location:** `src/components/DayGroup.astro`

```css
.section-heading {
  position: sticky;
  top: 50px; /* Mobile */
  background: var(--color-bg);
  z-index: 2;
  padding-top: var(--space-3);
  padding-bottom: var(--space-3);
  margin-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
}
```

**Probleme:**

1. **`margin-bottom: var(--space-4)`** schiebt das nächste Element nach unten, aber der **Background** der sticky Heading endet bei `padding-bottom`
2. In dieser **Lücke (margin)** kann Content durchscheinen!
3. Das `::before` Pseudo-Element versucht das zu covern, aber nur bis `bottom: 100%` — nicht durch die margin-zone

**Visualisierung:**
```
┌─────────────────────────────┐
│ .section-heading            │ ← sticky, opaker BG
│ "Heute · Donnerstag, 6. Feb"│
├─────────────────────────────┤ ← border-bottom
│                             │ ← padding-bottom (covered)
└─────────────────────────────┘
  ↓ margin-bottom (12px)       ← ❌ KEINE Background-Abdeckung!
┌─────────────────────────────┐
│ .day-events                 │
│   .event-card               │ ← Kann hier durchbluten
└─────────────────────────────┘
```

---

### **Problem #3: ::after Fade Gradient ist nicht ausreichend hoch**

**Location:** `src/components/DayGroup.astro`

```css
.section-heading::after {
  content: '';
  position: absolute;
  left: -20px;
  right: -20px;
  top: 100%;
  height: 24px;  /* ❌ Nur 24px, aber margin-bottom ist größer! */
  background: linear-gradient(to bottom, var(--color-bg), transparent);
  pointer-events: none;
  z-index: 1;
}
```

**Problem:**
- Der Fade-Gradient ist nur **24px hoch**
- Das `margin-bottom` der Heading ist **var(--space-4) = 16px** (1rem)
- Wenn Event-Cards einen **eigenen Stacking Context** haben, können sie **hinter** dem Fade durchscheinen, aber **über** dem sticky Background

---

### **Problem #4: Desktop padding-top auf falscher Ebene**

**Location:** `src/pages/index.astro`

```css
@media (min-width: 1200px) {
  .content-grid {
    padding-top: var(--space-6);
  }
}
```

**Gut!** Das ist **korrekt** umgesetzt. Das Padding ist auf `.content-grid`, **nicht** auf den einzelnen Spalten.

**Warum wichtig?**
- Sticky `top: 0` referenziert die **Padding-Box** des Scroll-Containers
- Wenn Padding auf `.column-center` wäre, würde `sticky top: 0` **innerhalb** des Paddings kleben
- Content könnte dann **über** dem Sticky-Element scrollen

✅ **Dieses Problem existiert NICHT mehr** (wurde korrekt gefixt).

---

### **Problem #5: Mobile sticky top: 50px vs InfoTicker height**

**Location:** `src/components/DayGroup.astro`

```css
@media (max-width: 767px) {
  .section-heading {
    top: 50px; /* Annahme: InfoTicker ist ~51px hoch */
  }
}
```

**Potentielles Problem:**
- Wenn der InfoTicker **tatsächlich nur 48px** hoch ist, gibt es eine **2px Lücke**
- Wenn er **52px** hoch ist, überlappt er die Heading

**Lösung:** Exakte Höhe messen und als CSS Custom Property definieren.

---

## 🎯 Root Cause Analysis

**Der Haupt-Bug:** Event-Cards erzeugen durch `overflow: clip` + `transition: transform` einen **eigenen Stacking Context**, der **nicht** von `.day-events` (z-index: 1) kontrolliert wird.

**Warum kehrt das Problem zurück?**

1. Jemand fügt `overflow: clip` hinzu (z.B. um border-radius zu erzwingen)
2. Jemand fügt `transition: transform` hinzu (für hover-Animationen)
3. Beide Eigenschaften erzeugen **implizit** einen Stacking Context
4. Der z-index der Event-Card wird **ignoriert**, weil sie ihren eigenen Context hat
5. Sticky Headings können nicht mehr "darüber" sein

**CSS Stacking Context Trigger (vollständige Liste):**
- `position: relative/absolute/fixed/sticky` + `z-index: <integer>`
- `opacity < 1`
- `transform` (beliebig)
- `filter` (beliebig)
- `perspective`
- `clip-path`
- `mask` / `mask-image` / `mask-border`
- `mix-blend-mode` (außer `normal`)
- `isolation: isolate`
- **`overflow: clip`** ← **DAS WAR'S!**
- `will-change` mit bestimmten Werten
- `contain: layout/paint/strict/content`

---

## ✅ Fixes

### **Fix #1: EventCard Stacking Context entfernen**

**Datei:** `src/components/EventCard.astro`

**Änderung:**

```css
.event-card {
  position: relative;
  background: var(--color-card);
  border-radius: var(--radius-lg);
  overflow: visible; /* ❌ NICHT clip! */
  transition: 
    box-shadow var(--duration-normal) ease;
    /* ❌ KEIN transform in transition! */
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border-light);
}

@media (hover: hover) {
  .event-card:hover {
    /* ✅ Transform OHNE transition ist OK */
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

.event-card:active {
  /* ✅ Scale ohne transition */
  transform: scale(0.99);
}
```

**Warum funktioniert das?**

1. **`overflow: visible`** erzeugt **keinen** Stacking Context
2. **Kein `transition: transform`** → keine implizite Stacking Context während Hover
3. `transform` nur bei `:hover` / `:active` → kurzzeitiger Stacking Context ist OK
4. `.event-card` bleibt im Stacking Context von `.day-events` (z-index: 1)
5. Sticky Heading (z-index: 5) "gewinnt"

**Was ist mit border-radius Clipping?**

- Border-radius funktioniert **auch ohne `overflow: clip`**
- Nur **Kind-Elemente** (Bilder, etc.) würden außerhalb des Radius ragen
- Aktuell hat EventCard keine Kinder die clippen müssen
- Falls doch: `overflow: hidden` auf ein **inneres Wrapper-Element**, nicht auf `.event-card` selbst

---

### **Fix #2: Sticky Heading Background durchgängig machen**

**Datei:** `src/components/DayGroup.astro`

**Änderung:**

```css
.section-heading {
  position: sticky;
  top: 50px;
  background: var(--color-bg);
  z-index: 2;
  padding-top: var(--space-3);
  padding-bottom: var(--space-3);
  margin-bottom: 0; /* ❌ KEIN margin-bottom! */
  border-bottom: 1px solid var(--color-border-light);
}

/* ✅ Abstand über padding auf day-events */
.day-events {
  position: relative;
  z-index: 1;
  padding-top: var(--space-4); /* Abstand NACH dem Heading */
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
```

**Warum?**

- **Margin auf Heading** = Lücke ohne Background
- **Padding auf day-events** = Heading Background erstreckt sich durchgängig
- Sticky Element "schwebt" über dem padding der day-events

---

### **Fix #3: ::after Fade höher und z-index korrigieren**

**Datei:** `src/components/DayGroup.astro`

```css
.section-heading::after {
  content: '';
  position: absolute;
  left: -20px;
  right: -20px;
  top: 100%;
  height: 32px; /* ✅ Höher als jedes padding */
  background: linear-gradient(to bottom, var(--color-bg), transparent);
  pointer-events: none;
  z-index: inherit; /* ✅ Erbt z-index: 2/5 vom Parent */
}
```

**Wichtig:** `z-index: inherit` stellt sicher, dass der Fade **genauso hoch** ist wie das Sticky Heading selbst.

---

### **Fix #4: Mobile InfoTicker Höhe als Custom Property**

**Datei:** `src/layouts/Layout.astro`

```css
:root {
  --mobile-ticker-height: 51px; /* ✅ Exakte Höhe messen! */
}
```

**Datei:** `src/components/DayGroup.astro`

```css
@media (max-width: 767px) {
  .section-heading {
    top: var(--mobile-ticker-height);
    background: var(--color-bg);
    z-index: 2;
    padding-top: var(--space-3);
  }
}
```

---

### **Fix #5: Alle anderen Transitions prüfen**

**Verdächtige Elemente mit `transition: all`:**

1. `.wk-card` (Weekend Carousel)
2. `.wh-card` (Weekend Highlights Sidebar)
3. `.toggle-pill` (FilterBar)
4. `.chip` (FilterBar)

**Regel:** `transition: all` ist **gefährlich** → explizit nur die Eigenschaften transitionieren, die sich ändern.

**Beispiel Fix:**

```css
/* ❌ VORHER */
.chip {
  transition: all var(--duration-fast) ease;
}

/* ✅ NACHHER */
.chip {
  transition: 
    background-color var(--duration-fast) ease,
    border-color var(--duration-fast) ease,
    color var(--duration-fast) ease;
  /* KEIN transform, opacity, oder andere Stacking-Context-Trigger! */
}
```

---

## 📜 Dauerhafte Regeln (NIE WIEDER!)

### **Golden Rules für Sticky Headings + Scroll Containers**

1. **Scroll-Container Padding:**
   - Padding **nur** auf dem Grid/Flex-Container (`.content-grid`)
   - **NIE** auf den scrollbaren Spalten selbst (`.column-center`)
   - **Warum:** Sticky `top: 0` ist relativ zur Padding-Box

2. **Sticky Heading Spacing:**
   - **NIE** `margin-bottom` auf sticky Headings
   - **IMMER** `padding-top` auf dem folgenden Element (`.day-events`)
   - **Warum:** Margin erzeugt Lücken ohne Background

3. **Event-Cards DÜRFEN NICHT:**
   - ❌ `overflow: clip` (erzeugt Stacking Context)
   - ❌ `transition: transform` (erzeugt Stacking Context)
   - ❌ `opacity < 1` als Default (erzeugt Stacking Context)
   - ❌ `will-change: transform` (erzeugt Stacking Context)

4. **Event-Cards DÜRFEN:**
   - ✅ `transform` nur bei `:hover` / `:active` (ohne Transition)
   - ✅ `transition: box-shadow, background-color, border-color` (sicher!)
   - ✅ `overflow: visible` (Standard)

5. **Z-Index Hierarchie (festgelegt):**
   ```
   Skip-Link:         9999  (fixed, höchste Ebene)
   Filter Sheet:       300  (mobile modal)
   Filter Backdrop:    299  (mobile modal backdrop)
   Mobile Filter Bar:  200  (fixed bottom)
   Navbar:             100  (fixed top)
   Mobile Ticker:      100  (sticky top)
   Sticky Headings:      5  (desktop) / 2 (mobile)
   Day Events:           1  (event card container)
   Main:                 1  (scroll content)
   ```

6. **Transition Regel:**
   - **NIE** `transition: all`
   - **IMMER** explizit nur sichere Properties:
     - `background-color`, `color`, `border-color`
     - `box-shadow`, `opacity` (nur wenn kontrolliert)
     - `transform` nur wenn **kein** Stacking Context bereits existiert

7. **::after Fade Gradients:**
   - **IMMER** `z-index: inherit` (erbt vom Parent)
   - **IMMER** Höhe ≥ padding/margin des folgenden Elements
   - `pointer-events: none` nicht vergessen

8. **Debugging Checklist:**
   - Bei "Content blutet durch" → DevTools: Element inspizieren
   - Computed Tab → "Stacking Context" Property checken
   - Wenn "New stacking context: Yes" → Ursache finden:
     - `overflow: clip/hidden`?
     - `transform` property?
     - `transition` mit transform/opacity?
     - `position + z-index`?
   - Fix: Property entfernen oder auf sicheres Element verschieben

---

## 🧪 Test-Szenarien

### **Manueller Test nach jedem Fix:**

1. **Desktop (≥1200px):**
   - Öffne Page, scrolle in `.column-center`
   - Sticky Heading "Heute · ..." bleibt oben (top: 0)
   - Event-Cards scrollen **hinter** dem Heading weg
   - **KEIN** Durchbluten von Card-Content über das Heading
   - Fade-Gradient weich und durchgängig

2. **Tablet (768px - 1199px):**
   - Scrolle die Page (normaler Scroll, kein overflow-Container)
   - Sticky Headings bleiben bei `top: 0`
   - Event-Cards scrollen darunter weg

3. **Mobile (<768px):**
   - InfoTicker oben sticky (z-index: 100)
   - Sticky Headings bei `top: var(--mobile-ticker-height)`
   - Event-Cards scrollen **unter** InfoTicker UND Heading weg
   - Kein Overlap, keine Lücken

4. **Hover/Active (Desktop):**
   - Hover über Event-Card → translateY(-2px) sofort sichtbar
   - Kein "Springen" oder "Flackern"
   - Box-Shadow smooth transition
   - Card bleibt **unter** Sticky Heading

5. **Dark Mode:**
   - Alle Background-Farben passen
   - Fade-Gradients verwenden `var(--color-bg)` → automatisch korrekt

---

## 📊 Vorher/Nachher

### **Vorher (Bug):**

```
Stacking Context Hierarchie:
  .column-center (scroll container)
  ├─ .section-heading (z-index: 5) — Stacking Context A
  └─ .day-events (z-index: 1)
     └─ .event-card (overflow: clip) — Stacking Context B ❌
        └─ Inhalt "entkommt" und ist auf gleicher Ebene wie Heading
```

**Problem:** Stacking Context B ist **nicht** in Context A → z-index nutzlos.

---

### **Nachher (Fix):**

```
Stacking Context Hierarchie:
  .column-center (scroll container)
  ├─ .section-heading (z-index: 5) — Stacking Context A
  └─ .day-events (z-index: 1)
     └─ .event-card (overflow: visible) — KEIN eigener Context ✅
        └─ Inhalt ist IN day-events → z-index: 1 gilt
```

**Lösung:** Event-Cards haben **keinen** eigenen Stacking Context → Heading z-index: 5 "gewinnt".

---

## 🔧 Implementierungs-Reihenfolge

1. **EventCard.astro:** `overflow: clip` → `visible` + `transition` korrigieren
2. **DayGroup.astro:** `margin-bottom` → 0, padding auf `.day-events`
3. **DayGroup.astro:** `::after` height erhöhen + `z-index: inherit`
4. **Layout.astro:** `--mobile-ticker-height` Custom Property
5. **DayGroup.astro:** `top: var(--mobile-ticker-height)` nutzen
6. **FilterBar.astro, EventCard.astro, index.astro:** Alle `transition: all` ersetzen

---

## 📝 Code Review Checklist

Vor jedem Merge/Deploy:

- [ ] Kein `overflow: clip` auf Event-Cards
- [ ] Kein `transition: transform` auf Event-Cards
- [ ] Kein `margin-bottom` auf Sticky Headings
- [ ] Alle `transition: all` ersetzt durch explizite Properties
- [ ] Z-Index Werte entsprechen der definierten Hierarchie
- [ ] Sticky `top` Werte passen zu Layout-Höhen
- [ ] Desktop: Padding nur auf `.content-grid`, nicht auf Spalten
- [ ] ::after Fade Gradients haben `z-index: inherit`

---

## 🎓 Lessons Learned

1. **`overflow: clip` ist gefährlich** → erzeugt Stacking Context, auch ohne z-index
2. **`transition: all` ist gefährlich** → kann implizite Stacking Contexts erzeugen
3. **Sticky + Scroll Containers sind tricky:**
   - Padding auf falsche Ebene = Bug
   - Margin statt Padding = Lücken
4. **Z-Index funktioniert nur innerhalb des gleichen Stacking Contexts**
5. **Debugging:** DevTools → Computed Tab → "Stacking Context" Property ist Gold wert

---

**Ende des Audits. Implementiere diese Fixes und der Bug sollte nie wieder zurückkehren.**
