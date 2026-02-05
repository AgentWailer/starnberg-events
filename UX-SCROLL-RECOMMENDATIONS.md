# UX Scroll-Empfehlungen: Desktop (≥1200px)

**Erstellt:** 2026-02-05  
**Reviewer:** UX-Designer (Subagent)  
**Basis:** Live-Test auf https://starnberg-events.pages.dev @ 1440×900  
**Bezug:** UX-SCROLL-BRIEFING.md (6 offene Fragen)

---

## Executive Summary

Die App Shell-Architektur ist grundsätzlich solide — das Drei-Spalten-Layout mit internem Scroll fühlt sich modern an und erinnert an Slack/Discord. **Drei kritische Probleme** fallen sofort auf:

1. **Header-Animation nutzt `margin-top` → Layout-Thrashing** (Performance-Killer)
2. **Rechte Sidebar hat 771px versteckten Content** ohne jede Scroll-Indikation
3. **Footer frisst 86px** vom ohnehin begrenzten Event-Viewport

---

## Gemessene Layout-Metriken (1440×900)

| Element | Höhe | Bemerkung |
|---|---|---|
| Navbar | 65px | position: relative (lt. Briefing sticky) |
| Header | 296px | z-index: 2, kein will-change |
| Content-Area | ~397px | Sichtfenster für Events (initial) |
| Footer | 86px | flex-shrink: 0, immer sichtbar |
| **Verfügbar nach Header-Collapse** | **~693px** | |

| Spalte | scrollHeight | clientHeight | Overflow |
|---|---|---|---|
| Links (Filter) | 665px → 693px* | 397px → 693px* | minimal bis keiner |
| Mitte (Events) | 1746px | 397px → 693px* | 1053px versteckt |
| Rechts (Sidebar) | 1464px | 397px → 693px* | **771px versteckt!** |

*nach Header-Collapse

---

## Frage 1: Scroll-Smoothness

### Ist-Zustand
- Wheel-Events werden 1:1 in `margin-top` und `scrollTop` übersetzt
- **Kein Easing**, kein Momentum, kein `requestAnimationFrame`-Loop
- Header-Animation nutzt `margin-top` (= Layout-Reflow bei jedem Frame!)
- `will-change: auto` auf Header — keine GPU-Layer-Promotion
- `transition: all` auf Header — viel zu unspezifisch
- `scroll-behavior: auto` auf Center Column

### Empfehlung: **`transform: translateY()` statt `margin-top`** ⭐

**Priorität: P1 (kritisch)**

Die wichtigste einzelne Änderung: **Weg von `margin-top`, hin zu `transform`.**

`margin-top` triggert Layout → Paint → Composite bei jedem Frame.  
`transform: translateY()` triggert nur Composite und läuft auf der GPU.

```css
/* Header */
header {
  will-change: transform, opacity;
  transform: translateY(0);
  transition: none; /* Wird per JS gesteuert */
}

/* Wenn Header collapst: */
header.collapsing {
  transform: translateY(calc(-1 * var(--scroll-offset)));
  /* NICHT margin-top: -296px; */
}
```

```js
// Im Wheel-Handler (vereinfacht):
const headerEl = document.querySelector('header');
let edgeOffset = 0;
const HEADER_H = headerEl.offsetHeight;

function onWheel(e) {
  const delta = e.deltaY;
  
  if (edgeOffset < HEADER_H) {
    // Phase 1: Header collapsen
    edgeOffset = Math.min(HEADER_H, Math.max(0, edgeOffset + delta));
    
    // GPU-beschleunigt:
    headerEl.style.transform = `translateY(${-edgeOffset}px)`;
    
    // Opacity ab 65% Progress
    const progress = edgeOffset / HEADER_H;
    const opacity = progress < 0.65 ? 1 : 1 - ((progress - 0.65) / 0.35);
    headerEl.style.opacity = opacity;
  } else {
    // Phase 2: Events scrollen
    centerCol.scrollTop += delta;
  }
}
```

**Zusätzliche Smoothness-Optionen (absteigend empfohlen):**

| Option | Empfehlung | Risiko |
|---|---|---|
| `transform` statt `margin-top` | ✅ **Machen** | Keines |
| `will-change: transform, opacity` auf Header | ✅ **Machen** | Minimal (extra Layer) |
| `scroll-behavior: smooth` auf Center | ⚠️ **Nicht machen** | Konflikte mit manuellem scrollTop |
| JS-Easing (Lerp in rAF) | 🤔 Optional, P3 | Komplexität, Latenz-Gefühl |
| `transition: margin-top 100ms` | ❌ **Nicht machen** | Laggy bei schnellem Scroll |
| Momentum/Inertia Simulation | ❌ **Nicht machen** | Kämpft gegen OS-Momentum |

**Begründung:** Die 1:1-Übersetzung von Wheel-Delta zu Position ist eigentlich **korrekt** — so fühlen sich native Apps an. Das Problem ist nicht fehlende Easing, sondern fehlende Performance. Mit `transform` statt `margin-top` sollte der Scroll butterweich sein, weil Composite-Only-Animationen bei 60fps laufen.

Momentum simulieren ist **kontraproduktiv** auf macOS, weil das OS bereits Inertia-Scrolling liefert. Doppeltes Momentum = unkontrollierbar.

---

## Frage 2: Übergang Phase 1 → Phase 2

### Ist-Zustand
- Harter Wechsel: Header-Collapse endet → Events-Scroll beginnt sofort
- Zwei-Phasen-Modell (Edge-Offset + Center-ScrollTop)

### Empfehlung: **Kein Easing nötig, aber "Scroll Spill" implementieren**

**Priorität: P2 (wichtig)**

Der harte Wechsel ist **prinzipiell OK** — iOS macht das bei Safari's Collapsing-Address-Bar genauso. Was fehlt, ist "Scroll Spill": Wenn ein einzelner Wheel-Event mehr Delta hat als der verbleibende Header-Collapse-Raum, sollte der **Rest** an die Events weitergegeben werden.

```js
function onWheel(e) {
  const delta = e.deltaY;
  
  if (delta > 0 && edgeOffset < HEADER_H) {
    const remaining = HEADER_H - edgeOffset;
    
    if (delta <= remaining) {
      // Gesamter Delta geht in Header-Collapse
      edgeOffset += delta;
      updateHeader(edgeOffset);
    } else {
      // Header fertig collapsen + REST an Events
      edgeOffset = HEADER_H;
      updateHeader(edgeOffset);
      const spill = delta - remaining;
      centerCol.scrollTop += spill;  // ← Scroll Spill!
    }
  } else if (edgeOffset >= HEADER_H) {
    centerCol.scrollTop += delta;
  }
  
  // Rückwärts analog
  if (delta < 0 && centerCol.scrollTop === 0 && edgeOffset > 0) {
    const absD = Math.abs(delta);
    const remaining = edgeOffset;
    
    if (absD <= remaining) {
      edgeOffset -= absD;
    } else {
      edgeOffset = 0;
      // Kein Spill nötig — Header ist schon expanded
    }
    updateHeader(edgeOffset);
  }
}
```

**Begründung:** Ohne Scroll Spill fühlt es sich an, als würde ein Frame "verloren gehen" am Übergang. Bei Trackpads mit hoher Scroll-Geschwindigkeit (große deltaY-Werte) kann das spürbar sein. Mit Scroll Spill ist der Übergang nahtlos ohne zusätzliches Easing.

**KEIN Blur/Fade/Überblend-Effekt nötig.** Das wäre Over-Engineering und würde den Übergang nicht natürlicher, sondern "gewollter" machen.

---

## Frage 3: Rechte Sidebar Scroll

### Ist-Zustand
- `overflow-y: auto` + `scrollbar-width: none`
- **1464px Content in 693px Container = 771px versteckt!**
- Enthält: S-Bahn, Wochenende-Highlights (Willi live, Montgolfiade, Future Box...), "35 weitere anzeigen"-Button, Wochenmärkte, Webcams
- **Kein visueller Hinweis**, dass die Sidebar scrollbar ist

### Empfehlung: **Sidebar muss scrollbar sein UND es muss sichtbar sein**

**Priorität: P1 (kritisch)**

771px versteckter Content = über **die Hälfte** des Sidebar-Inhalts ist unsichtbar. Die "Dieses Wochenende"-Cards, die "35 weitere anzeigen"-Button, Wochenmärkte und Webcams — alles abgeschnitten.

**Zwei Maßnahmen:**

**A) Scrollbar einblenden (macOS-Style):**
```css
.column-right {
  overflow-y: auto;
  overscroll-behavior: contain;
  
  /* Dünne Scrollbar, nur beim Scrollen sichtbar */
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.2) transparent;
}

/* Webkit-Fallback */
.column-right::-webkit-scrollbar {
  width: 6px;
}
.column-right::-webkit-scrollbar-track {
  background: transparent;
}
.column-right::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.15);
  border-radius: 3px;
}
.column-right:hover::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.25);
}
```

**B) Fade-Gradient am unteren Rand als Scroll-Hint:**
```css
.column-right::after {
  content: '';
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: linear-gradient(to top, var(--color-bg), transparent);
  pointer-events: none;
  display: block;
  transition: opacity 300ms ease;
}

/* Per JS: opacity: 0 wenn am Ende gescrollt */
.column-right[data-scrolled-end]::after {
  opacity: 0;
}
```

**Begründung:** Dies ist der gravierendste UX-Bug im aktuellen Design. User, die die Wochenend-Highlights oder Webcams sehen wollen, finden sie nicht. Das widerspricht dem Grundprinzip von "Information Scent" — der User muss wissen, dass mehr Content da ist.

**Referenz:** Notion (Sidebar), Linear (Side Panels), Figma (Properties Panel) — alle zeigen dünne Scrollbars in Sidebars.

---

## Frage 4: Header Parallax / Slide-Effekt

### Ist-Zustand
- Negativer Margin schiebt Header hoch
- Opacity-Fade ab 65% Scroll-Progress
- Header gleitet hinter Navbar (z-index Layering)

### Empfehlung: **Aktueller Effekt beibehalten, nur technisch optimieren**

**Priorität: P3 (nice-to-have)**

Der aktuelle "Slide under Navbar + Fade" ist **der richtige Effekt**. Er ist:
- Vertraut (iOS Safari Collapsing Bar-Pattern)
- Performant (wenn auf `transform` umgestellt)
- Unauffällig (lenkt nicht vom Content ab)

**Was ich NICHT empfehle:**

| Effekt | Begründung |
|---|---|
| Parallax (0.5x Speed) | Erzeugt Disconnect zwischen Scroll-Input und visueller Reaktion. Fühlt sich "schwammig" an. Parallax passt zu Marketing-Pages, nicht zu Utility-Apps. |
| Blur | Performance-teuer (`backdrop-filter`), visuell unruhig, lenkt ab. |
| Scale (Zusammenschrumpfen) | Typografisch problematisch — Text wird unleserlich in Zwischenzuständen. |

**Einzige Verbesserung:** Den Opacity-Fade etwas früher starten (ab 50% statt 65%):

```js
// Statt:
const opacity = progress < 0.65 ? 1 : 1 - ((progress - 0.65) / 0.35);

// Besser:
const opacity = progress < 0.5 ? 1 : 1 - ((progress - 0.5) / 0.5);
```

**Begründung:** Der Header-Text wird bei 50-65% Collapse bereits von der Navbar abgeschnitten. Der Text ist dort nicht mehr sinnvoll lesbar, also sollte er auch visuell verblassen. Ein früherer Fade vermeidet den "abgeschnittenen Text"-Moment.

---

## Frage 5: Scrollbar-Sichtbarkeit

### Ist-Zustand
- **Alle** Desktop-Scrollbars versteckt:
  - `html { overflow-y: hidden; scrollbar-width: none }`
  - `.column-left { scrollbar-width: none }`
  - `.column-center` — vermutlich auch versteckt (über `.hide-scrollbar`)
  - `.column-right { scrollbar-width: none }`

### Empfehlung: **Scrollbars in der Center-Column zeigen, Rest je nach Overflow**

**Priorität: P2 (wichtig)**

Die Center-Column hat 1746px Content in 693px — das ist eine Event-Liste mit 500+ Events. Nutzer MÜSSEN wissen, dass sie scrollen können und WO sie im Scroll-Progress sind.

**Differenziertes Konzept:**

| Spalte | Scrollbar | Begründung |
|---|---|---|
| **Center (Events)** | ✅ Thin, immer sichtbar | Hauptinhalt, lange Liste, Scroll-Position relevant |
| **Right (Sidebar)** | ✅ Thin, on hover | Viel versteckter Content (siehe Frage 3) |
| **Left (Filter)** | ❌ Versteckt | Passt nach Header-Collapse komplett, kein Overflow |
| **html/body** | ❌ Versteckt | Korrekt — App Shell hat keinen Page-Scroll |

```css
/* Center Column - Dünne Scrollbar, immer sichtbar */
.column-center {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.15) transparent;
}

.column-center::-webkit-scrollbar {
  width: 6px;
}
.column-center::-webkit-scrollbar-track {
  background: transparent;
}
.column-center::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.12);
  border-radius: 3px;
}
.column-center:hover::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.25);
}

/* Right Column - Thin, on hover */
.column-right::-webkit-scrollbar-thumb {
  background: transparent;
}
.column-right:hover::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
}
```

**Accessibility-Aspekt:** WCAG 2.1 SC 1.4.13 erfordert, dass scrollbare Bereiche erkennbar sind. Versteckte Scrollbars allein sind kein WCAG-Verstoß, aber in Kombination mit fehlendem Scroll-Hint ein Usability-Problem. Keyboard-User können über Fokus in den Container tabben und dann mit Pfeiltasten scrollen — das funktioniert. Aber **entdeckbar** ist es nicht.

---

## Frage 6: Footer Position

### Ist-Zustand
- `flex-shrink: 0`, `height: 86.4px`, immer sichtbar am Viewport-Boden
- Inhalt: "513 Events aus 58 Quellen · beccult, starnbergammersee.de, muenchen.de"
- Nimmt 86px vom Event-Sichtfenster weg

### Empfehlung: **Footer deutlich verkleinern oder in den Scroll-Flow verschieben**

**Priorität: P2 (wichtig)**

86px für eine einzeilige Quellenangabe ist **zu viel**. Auf 900px Viewport-Höhe sind das 9.5% der Fläche für Meta-Information, die kein Nutzer aktiv sucht.

**Option A (empfohlen): Footer auf 40px verkleinern**
```css
.footer {
  padding: 8px 52px;     /* statt ~32px 52px */
  font-size: 0.75rem;    /* statt 0.875rem */
  min-height: 40px;
  flex-shrink: 0;
}
```
→ Gewinnt **46px** für Events = ca. eine halbe Event-Card mehr sichtbar.

**Option B (aggressiver): Footer ans Ende des Event-Scrolls**
```css
/* Footer als letztes Element IN der Center-Column */
.footer {
  position: sticky;
  bottom: 0;
  /* oder: ganz ans Ende der Event-Liste */
}
```
→ Gewinnt **86px** volle Event-Fläche. Footer nur sichtbar, wenn man ganz runter scrollt.

**Option C (Kompromiss): Footer nur sichtbar, wenn Header collapsed**
```css
.footer {
  transition: transform 200ms ease, opacity 200ms ease;
}
.footer.hidden {
  transform: translateY(100%);
  opacity: 0;
}
```
→ Bei Header sichtbar: Footer versteckt. Bei Header collapsed: Footer einblenden.
Netto-Effekt: Immer dieselbe Content-Area-Höhe egal ob Header sichtbar oder nicht.

**Empfohlene Option: A**

Option B klingt verlockend, ist aber strukturell schwierig (Footer gehört nicht in eine einzelne Spalte). Option C ist clever, aber die Animation könnte beim schnellen Scrollen irritieren. Option A ist simpel, effektiv und low-risk.

**Begründung:** Jeder Pixel zählt in einem App-Shell-Layout. 86px sind fast eine Event-Card-Höhe (~130px). Die Quellenangabe hat niedrigste Informationspriorität und verdient kein Premium-Viewport-Real-Estate.

---

## Bonus-Empfehlungen (nicht im Briefing)

### GPU-Layer-Promotion für Columns
```css
.column-left,
.column-center,
.column-right {
  contain: strict;      /* Layout-Isolation */
  will-change: scroll-position;  /* Scroll-Performance */
}
```
**Priorität: P2** — `contain: strict` verhindert, dass Repaints in einer Spalte die anderen triggern.

### Navbar sollte `position: sticky` sein (nicht relative)
Aktuell: `position: relative`. Wenn der Briefing "sticky" sagt, aber die CSS `relative` zeigt, fehlt möglicherweise `position: sticky; top: 0` auf der Navbar.
**Priorität: Prüfen** — Kann sein, dass der aktuelle JS-basierte Ansatz die Navbar als Teil des statischen Layouts behandelt. Falls so intendiert, ist es OK.

### `overscroll-behavior: contain` auf allen Columns ✅
Bereits implementiert — gute Arbeit! Verhindert Scroll-Chaining zum Parent.

### `passive: true` auf Wheel-Listener ✅
Bereits implementiert — korrekt für Performance.

### Focus-Trap bei Scroll
Wenn der User mit Tab in einen scrollbaren Container kommt, sollte der Container mit Pfeiltasten scrollbar sein:
```css
.column-center:focus-within {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}
```
**Priorität: P3** — Nice-to-have für Accessibility.

---

## Prioritäten-Matrix

| # | Maßnahme | Priorität | Aufwand | Impact |
|---|---|---|---|---|
| 1 | `transform` statt `margin-top` für Header | **P1** | Mittel | Hoch (60fps) |
| 2 | Sidebar scrollbar machen + Scroll-Hint | **P1** | Klein | Hoch (771px Content) |
| 3 | Scrollbar in Center-Column zeigen | **P2** | Klein | Mittel |
| 4 | Scroll Spill am Phase-Übergang | **P2** | Klein | Mittel (Smoothness) |
| 5 | Footer verkleinern (86→40px) | **P2** | Trivial | Mittel |
| 6 | `contain: strict` auf Columns | **P2** | Trivial | Mittel (Performance) |
| 7 | Opacity-Fade früher starten (50% statt 65%) | **P3** | Trivial | Gering |
| 8 | Focus-Styles für Scroll-Container | **P3** | Klein | Gering (A11y) |

**Empfohlene Reihenfolge:** 1 → 2 → 4 → 3 → 5 → 6 → 7 → 8

---

## Gesamtbewertung

| Kriterium | Bewertung | Kommentar |
|---|---|---|
| Natürlichkeit | 6/10 | Phase-Übergang abrupt, `margin-top` kann ruckeln |
| Visuelle Konsistenz | 7/10 | Dark Theme stimmig, aber Scrollbar-Inkonsistenz |
| Performance | 5/10 | `margin-top`-Animation = Layout-Thrashing |
| Accessibility | 4/10 | Versteckte Scrollbars, kein Scroll-Hint, 771px unsichtbar |
| Best Practices | 6/10 | App Shell gut, aber GPU-Hints und `contain` fehlen |
| **Gesamt** | **5.6/10** | Solides Fundament, aber P1-Issues drücken den Score |

**Nach Umsetzung der P1+P2 Empfehlungen: erwarteter Score ~8/10.**
