# UX Scroll-Proposal: 3-Spalten-Layout mit unabhängigem Scrolling

> **Analyse-Datum:** 5. Februar 2026  
> **Status:** Proposal  
> **Betrifft:** Desktop-Layout (≥1200px) auf starnberg-events.pages.dev

---

## 1. Problem-Analyse

### Ist-Zustand

```
┌─────────────────────────────────────────────────────┐
│  NAVBAR (fixed, 65px)  — Wetter, S6, Theme-Toggle   │
├─────────────────────────────────────────────────────┤
│  HERO HEADER (fixed, ~312px)  — Titel, Tagline      │
├────────────┬──────────────────┬──────────────────────┤
│  FILTER    │  EVENT-LISTE     │  S-BAHN / WEEKEND    │
│  (sticky)  │  (sticky+scroll) │  (sticky+scroll)     │
│            │                  │                      │
│  wenig     │  viel Content    │  mittl. Content      │
│  Content   │                  │                      │
└────────────┴──────────────────┴──────────────────────┘
  377px padding-top auf main, um Platz für fixed Header zu schaffen
```

**Aktuelle CSS-Architektur:**
- Navbar: `position: fixed; top: 0`
- Hero Header: `position: fixed; top: 65px`
- Alle 3 Spalten: `position: sticky; top: 382px; max-height: calc(100vh - 382px); overflow-y: auto; overscroll-behavior: contain`
- Main: `padding-top: 377px`

### Das Dilemma in 3 Sätzen

1. **Der Header ist fixed** → Er scrollt nie weg → **312px vertikaler Platz sind permanent verloren** (auf einem 1080p-Monitor bleiben nur ~640px für Content)
2. **Alle Spalten sind eigenständige Scroll-Container** → Es gibt nichts, was die Seite selbst scrollen würde → Der Footer ist unerreichbar oder springt rein
3. **Die Filter-Sidebar hat wenig Content** → Sie wird kein echter Scroll-Container → `overscroll-behavior: contain` greift nicht → Scroll-Events "fallen durch" zum nächsten scrollbaren Parent

### Root Cause

Das Grundproblem ist ein **architektonischer Widerspruch:**

| Anforderung | Braucht... |
|---|---|
| Header soll wegscrollbar sein | Page-Level Scroll (body scrollt) |
| Spalten sollen unabhängig scrollen | Column-Level Scroll (jede Spalte eigener Container) |
| Filter-Sidebar soll Scroll "schlucken" | Sidebar muss Scroll-Container sein (auch ohne Overflow) |

Diese drei Anforderungen schließen sich mit naivem CSS gegenseitig aus. Aber es gibt bewährte Lösungsmuster.

---

## 2. Wie lösen andere Apps das?

### Gmail / Google Drive
```
┌────────────────────────────────┐
│  FIXED Toolbar (56px)          │  ← Immer sichtbar
├──────────┬─────────────────────┤
│ Sidebar  │  Mail-Liste/Content │  ← Unabhängige Scroll-Container
│ (scroll) │  (scroll)           │
└──────────┴─────────────────────┘
```
**Ansatz:** "App Shell" — kein Page Scroll. `html, body { overflow: hidden; height: 100vh }`. Header immer sichtbar. Jedes Panel ist ein eigener Scroll-Container mit fester Höhe.  
**Nachteil:** Header nimmt permanent Platz weg. Bei Gmail ist das OK (56px), bei uns wären es 377px — zu viel.

### Twitter/X
```
┌──────────────────────────────────┐
│  PAGE SCROLLS (body)             │
│ ┌────────┬───────────┬─────────┐ │
│ │Sidebar │ Timeline  │ Trends  │ │
│ │(sticky)│ (in flow) │(sticky) │ │
│ └────────┴───────────┴─────────┘ │
└──────────────────────────────────┘
```
**Ansatz:** Body scrollt, Sidebars sind `position: sticky`. Die Timeline IST der Page-Scroll. Sidebars kleben am Viewport.  
**Nachteil:** Nur die Mittel-Spalte treibt den Scroll an. Die Sidebars scrollen nicht eigenständig — sie scrollen mit der Seite mit und "kleben" oben fest. Für uns problematisch: Die rechte Spalte hat mehr Content als der Viewport hergibt.

### Slack / Discord
```
┌────────────────────────────────┐
│  FIXED Header (48px)           │
├──────────┬─────────────────────┤
│ Channels │  Messages           │
│ (scroll) │  (scroll)           │
└──────────┴─────────────────────┘
```
**Ansatz:** Wie Gmail — App Shell, kein Page Scroll. Kompakter Header.  
**Relevant für uns:** Zeigt, dass App Shell mit kompaktem Header gut funktioniert.

### Notion
```
┌────────────────────────────────┐
│  PAGE SCROLLS                  │
│ ┌──────────┬───────────────┐   │
│ │ Sidebar  │  Content      │   │
│ │ (fixed)  │  (in flow)    │   │
│ └──────────┴───────────────┘   │
└────────────────────────────────┘
```
**Ansatz:** Sidebar ist fixed/absolut positioniert. Content-Bereich scrollt als Page Scroll. Kein eigenständiger Sidebar-Scroll nötig (Sidebar ist kompakt genug).

### YouTube
```
┌────────────────────────────────┐
│  FIXED Header (56px)           │
├────────────────────────────────┤
│  PAGE SCROLLS                  │
│ ┌──────────┬───────────────┐   │
│ │ Sidebar  │  Video Grid   │   │
│ │ (sticky) │  (in flow)    │   │
│ └──────────┴───────────────┘   │
└────────────────────────────────┘
```
**Ansatz:** Header fixed, Sidebar sticky. Content ist im Page Flow. Page scrollt den Content, Sidebar klebt.

### Synthese: Das Muster

| App | Header | Sidebars | Content | Page Scroll? |
|---|---|---|---|---|
| Gmail | Fixed (kompakt) | Eigene Scroll-Container | Eigener Scroll-Container | ❌ Nein |
| Twitter | Fixed (kompakt) | Sticky | Im Flow | ✅ Ja |
| Slack | Fixed (kompakt) | Eigene Scroll-Container | Eigener Scroll-Container | ❌ Nein |
| Notion | Keiner | Fixed | Im Flow | ✅ Ja |
| YouTube | Fixed (kompakt) | Sticky | Im Flow | ✅ Ja |

**Erkenntnis:** Kein erfolgreiches Produkt hat einen 312px hohen fixen Header UND unabhängig scrollende Spalten. Entweder:
- **App Shell** (kein Page Scroll) + **kompakter Header** (max 56-65px)
- **Page Scroll** + **sticky Sidebars** (die nicht eigenständig scrollen)

---

## 3. Lösungsvorschläge

### Ansatz A: "Sticky Columns + Flow Header" (CSS-fokussiert)

**Idee:** Header kommt aus `position: fixed` raus, wird normaler Flow-Content. Spalten werden sticky. Page scrollt den Header weg, dann "locken" die Spalten ein.

```
VORHER:                          NACHHER (gescrollt):
┌───────────────────────┐        ┌───────────────────────┐
│ NAVBAR (fixed 65px)   │        │ NAVBAR (fixed 65px)   │
├───────────────────────┤        ├────────┬───────┬──────┤
│ HERO (fixed 312px)    │        │ Filter │Events │Right │
├────────┬───────┬──────┤        │ sticky │scroll │scroll│
│ Filter │Events │Right │        │        │       │      │
│ sticky │scroll │scroll│        │        │       │      │
└────────┴───────┴──────┘        └────────┴───────┴──────┘
                                   ↑ Volle Viewport-Höhe minus Navbar!
```

**CSS-Pseudocode:**
```css
/* Navbar bleibt fixed */
.navbar {
  position: fixed;
  top: 0;
  height: 65px;
  z-index: 100;
}

/* Hero Header: NICHT MEHR FIXED — im Flow! */
.header {
  position: relative;          /* statt fixed */
  margin-top: 65px;            /* Platz für Navbar */
  /* kein z-index nötig */
}

/* Main braucht kein padding-top mehr */
.main {
  padding-top: 0;              /* statt 377px */
}

/* Spalten: sticky, docken unter Navbar an */
.column-left,
.column-center,
.column-right {
  position: sticky;
  top: 65px;                   /* Höhe der Navbar */
  max-height: calc(100vh - 65px);
  overflow-y: auto;
}

/* KRITISCH: Filter-Sidebar Scroll-Trap */
.column-left {
  overscroll-behavior-y: contain;
}

/* Scroll-Trap: Erzwinge Scrollbarkeit auch bei wenig Content */
.column-left .filter-sidebar::after {
  content: '';
  display: block;
  min-height: 1px;
  padding-bottom: calc(100vh);  /* Genug Platz, damit Container scrollbar wird */
}
```

**Scroll-Trap erklärt:** `overscroll-behavior: contain` wirkt NUR wenn das Element ein aktiver Scroll-Container ist (also `scrollHeight > clientHeight`). Durch das Pseudo-Element wird die Sidebar immer scrollbar → `contain` greift → Scroll-Events propagieren nicht zum Body.

**Vorteile:**
- ✅ Minimal-invasive Änderung am bestehenden Code
- ✅ Header scrollt elegant weg → +312px Content-Platz gewonnen
- ✅ Reines CSS, kein JavaScript nötig
- ✅ Native Scroll-Performance (kein `passive: false`)
- ✅ Footer ist erreichbar (ist im normalen Page Flow)
- ✅ Sticky-Positionen + overscroll-behavior haben [exzellenten Browser-Support](https://caniuse.com/css-overscroll-behavior)

**Nachteile:**
- ⚠️ Scroll-Trap per Pseudo-Element ist ein Hack (aber robuster als JS)
- ⚠️ Wenn man über dem Spalt zwischen Spalten scrollt (Grid-Gap), scrollt die Seite — kein Column-Scroll
- ⚠️ Beim Neuladen der Seite sieht man immer erst den Header, muss runterscrollen
- ⚠️ Day-Group Sticky Headings (`position: sticky`) brauchen ggf. angepasste `top`-Werte in der scrollenden Center-Spalte

---

### Ansatz B: "App Shell + kompakter Header" (Gmail-Stil)

**Idee:** Page scrollt nie. Alles ist in einer festen Viewport-Höhe. Header wird kompakt (Navbar absorbiert die Hero-Info). Jede Spalte ist ein eigenständiger Scroll-Container.

```
┌──────────────────────────────────────────────┐
│  NAVBAR (65px) — Titel + Wetter + S6         │  ← Immer sichtbar
├────────────┬──────────────────┬──────────────┤
│  FILTER    │  EVENT-LISTE     │  S-BAHN /    │
│  (scroll)  │  (scroll)        │  WEEKEND     │
│            │                  │  (scroll)    │
│  440px+    │  Events...       │              │
│            │                  │              │
│  contain   │  contain         │  contain     │
└────────────┴──────────────────┴──────────────┘
  html, body { height: 100vh; overflow: hidden }
```

**CSS-Pseudocode:**
```css
html, body {
  height: 100%;
  overflow: hidden;            /* Kein Page Scroll! */
}

/* App Shell Container */
.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* Navbar: Bleibt, aber enthält jetzt auch den Titel */
.navbar {
  position: relative;          /* Nicht mehr fixed — Teil des Flex-Layouts */
  flex-shrink: 0;
  height: 65px;
}

/* Hero Header: ENTFERNT oder in Navbar integriert */
/* Stattdessen: "Pöcking Events" ist schon in der Navbar */

/* Content Grid füllt den Rest */
.content-area {
  flex: 1;
  overflow: hidden;            /* Kein Scroll auf diesem Level */
  display: grid;
  grid-template-columns: 340px 1fr 340px;
  gap: 2rem;
}

/* Jede Spalte: Eigenständiger Scroll-Container */
.column-left,
.column-center,
.column-right {
  overflow-y: auto;
  overscroll-behavior-y: contain;  /* Kein Scroll-Chaining */
  /* Keine sticky/top nötig — Grid-Children füllen den Platz */
}
```

**Vorteile:**
- ✅ **Sauberstes Scroll-Verhalten** — jede Spalte ist isoliert, kein Chaining möglich
- ✅ `overscroll-behavior: contain` funktioniert IMMER (jede Spalte ist Scroll-Container)
- ✅ **Maximaler Content-Platz** — nur 65px Navbar, Rest ist Content
- ✅ Kein Scroll-Trap-Hack nötig
- ✅ Bewährtes Pattern (Gmail, Slack, VS Code, Figma)
- ✅ Einfacheres mentales Modell — keine Interaktion zwischen Page-Scroll und Column-Scroll

**Nachteile:**
- ⚠️ **Hero Header entfällt** — der "Wow-Faktor" beim Erstbesuch geht verloren
- ⚠️ Größerer Umbau: Header muss in Navbar integriert oder entfernt werden
- ⚠️ Footer muss entweder weg oder in eine Spalte wandern
- ⚠️ Auf Tablet (2 Spalten) und Mobile (1 Spalte) braucht man ein komplett anderes Scroll-Modell
- ⚠️ "Kein Page Scroll" fühlt sich auf einer Content-Site ungewöhnlich an (≠ Gmail als Tool)

---

### Ansatz C: "Collapsible Header → App Shell Transition" (Hybrid) ⭐

**Idee:** Beim Laden sieht man den vollen Hero Header. Beim ersten Scroll im Center-Column kollabiert der Header smooth in die Navbar. Danach verhält sich alles wie App Shell (Ansatz B). Kombiniert den Wow-Faktor mit optimalem Scroll-Verhalten.

```
INITIAL:                           NACH SCROLL:
┌───────────────────────┐          ┌──────────────────────┐
│ NAVBAR (65px)         │          │ NAVBAR (65px)        │
├───────────────────────┤          │ + "Pöcking Events"   │
│                       │          ├──────┬────────┬──────┤
│ HERO HEADER (312px)   │  ──→    │ Filt │ Events │Right │
│ "Was ist los in       │  scroll  │ (scr)│ (scr)  │(scr) │
│  und um Pöcking?"     │          │      │        │      │
├──────┬────────┬───────┤          │      │        │      │
│ Filt │ Events │ Right │          └──────┴────────┴──────┘
│      │        │       │            Voller Viewport für Content!
└──────┴────────┴───────┘
```

**Technische Umsetzung:**

```css
/* App Shell Basis */
html, body {
  height: 100%;
  overflow: hidden;
}

.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* Navbar (immer sichtbar) */
.navbar {
  flex-shrink: 0;
  height: 65px;
  z-index: 100;
}

/* Collapsible Hero */
.header {
  flex-shrink: 0;
  overflow: hidden;
  max-height: 312px;                 /* Volle Höhe initial */
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.25s ease,
              padding 0.35s ease;
}

.header.collapsed {
  max-height: 0;
  opacity: 0;
  padding: 0;
  pointer-events: none;
}

/* Content Grid füllt den Rest */
.content-area {
  flex: 1;
  min-height: 0;                     /* Kritisch für Flex-Kinder! */
  overflow: hidden;
  display: grid;
  grid-template-columns: 340px 1fr 340px;
  gap: 2rem;
}

/* Spalten als Scroll-Container */
.column-left,
.column-center,
.column-right {
  overflow-y: auto;
  overscroll-behavior-y: contain;
  min-height: 0;                     /* Flex/Grid child muss das haben */
}
```

```javascript
// Header-Collapse bei erstem Scroll in der Mittel-Spalte
const header = document.querySelector('.header');
const centerCol = document.querySelector('.column-center');
let headerCollapsed = false;

centerCol.addEventListener('scroll', () => {
  if (!headerCollapsed && centerCol.scrollTop > 20) {
    header.classList.add('collapsed');
    // Navbar-Brand einblenden (existiert bereits im Code!)
    document.querySelector('.navbar-brand').classList.add('visible');
    headerCollapsed = true;
  }
}, { passive: true });

// Optional: Header wieder einblenden wenn ganz nach oben gescrollt
centerCol.addEventListener('scroll', () => {
  if (headerCollapsed && centerCol.scrollTop === 0) {
    header.classList.remove('collapsed');
    document.querySelector('.navbar-brand').classList.remove('visible');
    headerCollapsed = false;
  }
}, { passive: true });
```

**Vorteile:**
- ✅ **Bestes aus beiden Welten** — Wow-Faktor beim Laden + maximaler Content-Platz beim Browsen
- ✅ Scroll-Isolation funktioniert perfekt (App Shell nach Collapse)
- ✅ Nutzt bereits vorhandene `.navbar-brand.visible` Logik
- ✅ Smooth Animation beim Collapse
- ✅ Kein Scroll-Trap-Hack nötig
- ✅ Reversibler Header (scroll to top → Header kommt zurück)

**Nachteile:**
- ⚠️ JavaScript erforderlich für Collapse-Trigger
- ⚠️ Mittlerer Umbau-Aufwand (Header aus fixed raus, in Flex-Flow rein)
- ⚠️ Übergangsanimation muss gut getestet werden (Layout-Shifts vermeiden)
- ⚠️ Mobile/Tablet braucht separates Handling (dort kein App Shell)

---

## 4. Vergleichsmatrix

| Kriterium | A: Sticky+Flow | B: App Shell | C: Hybrid ⭐ |
|---|---|---|---|
| **UX-Qualität** | ●●●○○ | ●●●●○ | ●●●●● |
| **Scroll-Isolation** | ●●●○○ | ●●●●● | ●●●●● |
| **Wow-Faktor** | ●●●●○ | ●●○○○ | ●●●●● |
| **Content-Platz** | ●●●●○ | ●●●●● | ●●●●● |
| **Implementierungs-Aufwand** | Gering | Mittel | Mittel |
| **Browser-Compat** | Exzellent | Exzellent | Exzellent |
| **Mobile-Kompatibilität** | Einfach | Komplex | Mittel |
| **Kein JS nötig** | ✅ | ✅ | ❌ (minimal) |

---

## 5. Empfehlung: Ansatz C (Hybrid)

### Warum?

1. **Ansatz A** löst das Problem nur teilweise — die Filter-Sidebar braucht einen Hack, und das Zusammenspiel von Page-Scroll und Column-Scroll bleibt fragil. Sobald ein User über dem Grid-Gap scrollt, scrollt die Seite statt einer Spalte.

2. **Ansatz B** ist technisch am saubersten, aber opfert den Hero Header komplett. Für eine Event-Discovery-Site (nicht ein Produktivitäts-Tool) ist der erste Eindruck wichtig.

3. **Ansatz C** vereint beide Stärken: Der Hero Header erzeugt beim ersten Besuch den emotionalen "Starnberger See"-Moment. Sobald der User anfängt zu browsen, verschwindet er elegant und macht Platz für maximalen Content. Die Scroll-Isolation ist perfekt, weil nach dem Collapse ein reines App-Shell-Layout entsteht.

### Implementierungsplan

```
Phase 1: Struktur umbauen (1-2h)
├── Header aus position:fixed → Flex-Child im App Shell
├── html/body → overflow:hidden, height:100%
├── Content-Grid → flex:1, min-height:0
└── Spalten → overflow-y:auto, overscroll-behavior:contain

Phase 2: Collapse-Logik (30min)
├── CSS-Transition auf .header (max-height, opacity)
├── JS: scroll-Listener auf .column-center
└── Navbar-Brand visible/hidden Toggle (existiert schon!)

Phase 3: Mobile/Tablet Fallback (1h)
├── < 768px: Normaler Page Scroll (wie jetzt), kein App Shell
├── 768-1199px: 2-Spalten App Shell oder Sticky-Hybrid
└── Breakpoint-Logik in CSS @media

Phase 4: Polish (30min)
├── Scroll-to-top → Header expand Animation
├── Reduced-motion: Sofortiger Collapse ohne Animation
├── Scrollbar-Styling (thin, themed)
└── Keyboard-Navigation testen
```

### Fallback für Ansatz A (wenn weniger Aufwand gewünscht)

Falls der Hybrid-Ansatz zu aufwändig erscheint, ist **Ansatz A** mit dem Scroll-Trap der pragmatischere Quick Fix:

```css
/* Quick Fix: Header in Flow + Scroll-Trap auf Sidebar */
.header {
  position: relative;  /* statt fixed */
  margin-top: 65px;
}
.main { padding-top: 0; }

.column-left, .column-center, .column-right {
  position: sticky;
  top: 65px;
  max-height: calc(100vh - 65px);
  overflow-y: auto;
  overscroll-behavior-y: contain;
}

/* Sidebar Scroll-Trap */
.filter-sidebar {
  min-height: calc(100vh - 65px + 1px);
}
```

Das löst 90% der Probleme mit ~30 Minuten Aufwand.

---

## 6. Zusätzliche UX-Empfehlungen

### Header-Höhe generell reduzieren
Der Hero Header mit 312px ist für eine wiederkehrend genutzte Event-Site sehr groß. Empfehlung:
- **Erstbesucher:** Voller Header (Ansatz C zeigt ihn)
- **Wiederkehrende Nutzer:** localStorage-Flag → Header startet collapsed
- **Oder:** Header grundsätzlich auf ~150px kürzen (Titel + Tagline, ohne viel Whitespace)

### Scrollbar-UX
- Center + Right Column: `scrollbar-width: thin` (existiert schon ✓)  
- Left Column: `scrollbar-width: none` (Sidebar braucht keinen sichtbaren Scrollbar)
- Scrollbar-Farben an Theme anpassen (hell/dunkel)

### Scroll-Indikatoren
- Dezenter Fade-Gradient am unteren Rand der Spalten, wenn mehr Content unten ist
- Signalisiert: "Hier gibt's noch mehr" — besonders wichtig bei der rechten Spalte

### Touch-Geräte (Tablet im Desktop-Modus)
- `overscroll-behavior: contain` funktioniert auch auf Touch
- Aber: Swipe-Gesten können trotzdem zur Browser-Navigation führen → `touch-action: pan-y` auf den Spalten setzen
