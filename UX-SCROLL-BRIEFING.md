# UX Briefing: Desktop Scroll-Verhalten

**Stand:** 2026-02-05 | **Tag:** `v1.0-desktop-scroll-fix`  
**Live:** https://starnberg-events.pages.dev

## Architektur: App Shell Layout (Desktop ≥1200px)

```
┌─────────────────────────────────────────────┐
│  Navbar (sticky, z:100)  — Wetter, S-Bahn   │
├─────────────────────────────────────────────┤
│  Header (z:2) — "Was ist los in Pöcking?"   │  ← gleitet unter Navbar
├───────────┬─────────────┬───────────────────┤
│  Filter   │  Events     │  Sidebar          │
│  (340px)  │  (flex)     │  (340px)          │
│           │  overflow-y │                   │
│           │  auto       │  S-Bahn, Weekend  │
│           │             │  Highlights,      │
│           │  ┌───────┐  │  Vor Ort          │
│           │  │Event  │  │                   │
│           │  │Cards  │  │                   │
│           │  │...    │  │                   │
│           │  └───────┘  │                   │
├───────────┴─────────────┴───────────────────┤
│  Footer (flex-shrink:0) — Quellenangaben     │
└─────────────────────────────────────────────┘
```

- `html/body`: `height: 100%; overflow: hidden` (kein Page-Scroll)
- **Nur die mittlere Spalte** (Events) scrollt intern (`overflow-y: auto`)
- Links/Rechts: kein interner Scroll

## Aktuelles Scroll-Verhalten

### Drei Zonen, zwei Verhaltensweisen

| Cursor-Position | Scroll-Verhalten |
|---|---|
| **Mitte (Events)** | Events scrollen intern ↕ + Header collapst als Nebeneffekt |
| **Links (Filter) / Rechts (Sidebar) / Ränder / Header** | "Page-Level": Header gleitet unter Navbar, danach Events scrollen |

### Header Collapse Animation

- **Mechanik:** `margin-top: -scrollAmount` (negative margin schiebt Header hoch)
- **Z-Layering:** Navbar (z:100) > Header (z:2) > Main (kein z-index)
- **Opacity:** 100% bis 65% gescrollt, dann Fade bis 0%
- **Navbar-Brand:** "Pöcking Events" Text erscheint wenn Header verschwunden
- **Rückwärts:** Header kommt zurück wenn Events/edgeOffset auf 0

### Page-Level Scroll (Links/Rechts/Ränder)

Zwei Phasen:
1. **Runter Phase 1:** Header collapst (`edgeOffset` 0 → headerHeight)
2. **Runter Phase 2:** Header weg → Center Column scrollt weiter
3. **Hoch Phase 1:** Center Column scrollt zurück
4. **Hoch Phase 2:** Center oben → Header expandiert wieder

## Offene UX-Fragen für Review

### 1. Scroll-Smoothness
- Aktuell: Wheel-Events werden **1:1** in `margin-top` / `scrollTop` übersetzt (kein Easing)
- Optionen:
  - **CSS `scroll-behavior: smooth`** auf Center Column?
  - **JS-Easing** (requestAnimationFrame + Lerp) für Header-Collapse?
  - **`transition: margin-top 100ms ease-out`** auf Header? (Risiko: kann bei schnellem Scroll laggy wirken)
  - Momentum/Inertia bei Page-Level-Scroll simulieren?

### 2. Übergang Phase 1 → Phase 2
- Aktuell: Harter Wechsel — Header-Collapse stoppt, Events starten sofort
- Fühlt sich das natürlich an oder braucht es einen weicheren Übergang?

### 3. Rechte Sidebar Scroll
- Aktuell: Sidebar scrollt nicht intern, alles geht an Page-Level
- Problem: Wenn viele Weekend-Events → Sidebar-Inhalt kann abgeschnitten sein
- Option: Sidebar intern scrollen lassen wenn Content überläuft?

### 4. Header Parallax / Slide-Effekt
- Aktuell: Header verschwindet via negativem Margin + Opacity-Fade
- Alternativen:
  - **Parallax:** Header-Content bewegt sich langsamer als der Scroll (0.5x Speed)
  - **Blur:** Header wird unscharf bevor er verschwindet
  - **Scale:** Header schrumpft leicht zusammen

### 5. Scrollbar-Sichtbarkeit
- Aktuell: Alle Scrollbars auf Desktop **versteckt**
- Ist das OK für Accessibility? (Maus-User sehen keinen Scroll-Hinweis)
- Option: Scrollbar nur beim Scrollen kurz einblenden (macOS-Style)?

### 6. Footer Position
- Aktuell: Immer sichtbar am unteren Viewport-Rand (Flex-Child)
- Nimmt ~84px vom Event-Sichtfenster weg
- Alternative: Footer erst sichtbar nach komplettem Event-Scroll?

## Technische Constraints

- **Kein Page-Scroll** möglich (App Shell mit overflow:hidden)
- **Wheel-Events** werden via JS abgefangen und umgeleitet
- **`passive: true`** auf Wheel-Listener (Performance), daher kein `preventDefault()`
- Header-Animation läuft synchron im Wheel-Handler (kein RAF-Loop)
- Drei unabhängige Scroll-Kontexte (Columns) + ein virtueller (edgeOffset)
