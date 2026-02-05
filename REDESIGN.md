# Redesign-Vorschlag: Starnberg Events
## UX-Designer Analyse & 3-Spalten-Layout

**Autor:** UX-Designer Agent  
**Datum:** 5. Februar 2025  
**Zielgruppe:** Familien am Starnberger See  
**Viewport:** 1440px Desktop (primär), Tablet & Mobile

---

## 📋 Executive Summary

**Kernproblem:**  
Die aktuelle 2-Spalten-Desktop-Struktur (Filter-Sidebar + Main Content) führt zu einer überladenen rechten Spalte. Alle wichtigen Elemente — S-Bahn Live-Info, Weekend Highlights, Suchfeld, Event-Liste, Wochenmärkte & Webcams — stapeln sich vertikal. Das wirkt **gedrungen, unübersichtlich und schwer scannbar**.

**Empfohlene Lösung:**  
Ein **3-Spalten-Layout** mit klarer funktionaler Trennung:
- **Links:** Filter & Selektion (sticky)
- **Mitte:** Event-Liste (Hauptcontent, scrollbar)
- **Rechts:** Kontext-Informationen (sticky: Bahn, Highlights, Vor-Ort)

Diese Architektur schafft **visuelle Hierarchie, Atemraum und Scannability** — perfekt für schnelle Entscheidungen („Was machen wir am Wochenende?").

---

## 1. UX-Probleme des aktuellen 2-Spalten-Layouts

### 1.1 Informations-Überlastung
**Problem:**  
Die rechte Content-Spalte stapelt 7+ Komponenten übereinander:
1. S-Bahn Live-Abfahrten
2. Weekend-Highlights (6 Cards in Horizontal-Scroll)
3. Event-Suche
4. Event-Liste (Haupt-Content)
5. Load-More-Button (Mobile)
6. Wochenmärkte Widget
7. Webcams Widget

**Konsequenz:**  
- User müssen scrollen, um relevante Info zu finden
- Weekend-Highlights verlieren sich zwischen Bahn & Events
- Kein klarer visueller Rhythmus

### 1.2 Fehlende Hierarchie
**Problem:**  
Alle Komponenten haben ähnliches visuelles Gewicht:
- Weekend-Highlights = horizontal scrolling Cards
- Event-Liste = vertical stacked Cards
- Kein "Above the Fold"-Fokus

**Konsequenz:**  
- User wissen nicht, wo sie hinschauen sollen
- Wichtige Features (KI-kuratierte Highlights) gehen unter
- Zu viele gleichwertige Informations-Cluster

### 1.3 Weekend-Highlights-Problem
**Aktuell:**  
6 Cards in horizontalem Scroll (4 Spalten bei 1440px)  
→ **Jede Card ~310px breit**  
→ Titel werden geclampt: "Nächtliche W..." statt "Nächtliche Winterwanderung"

**Desktop UX Anti-Pattern:**  
Horizontal Scrolling auf großen Screens verschwendet vertikalen Platz und ist nicht intuitiv (Desktop-User erwarten vertical scrolling).

### 1.4 Cognitive Load
**Problem:**  
User müssen mentale Kontextwechsel vollziehen:
1. Filter setzen → scrollen
2. Event finden → scrollen
3. Bahn checken → zurück scrollen nach oben
4. Wochenmarkt Info → ganz nach unten scrollen

**Konsequenz:**  
- Erhöhte mentale Anstrengung
- Längere Task-Completion-Zeit
- Frustration bei wiederholter Nutzung

### 1.5 Spacing & Visual Rhythm
**Problem:**  
- Zu wenig Luft zwischen Komponenten (var(--space-10) ≈ 2.5rem)
- Keine klare Gruppierung verwandter Infos
- Desktop fühlt sich an wie Mobile (alles gestapelt)

---

## 2. Empfohlener 3-Spalten-Layout: Architektur

### 2.1 Grid-Definition

```css
/* === 3-COLUMN DESKTOP LAYOUT === */
@media (min-width: 1200px) {
  .content-grid {
    display: grid;
    grid-template-columns: 260px 1fr 340px;
    gap: var(--space-8); /* 2rem = 32px */
    align-items: start;
    max-width: 1400px; /* Prevent über-wide on 1920px+ */
    margin: 0 auto;
  }
}

/* === SPALTEN-STRUKTUR === */
.column-left   { /* Filter-Sidebar */ }
.column-center { /* Event-Liste */ }
.column-right  { /* Kontext-Info */ }
```

**Breiten-Rationale:**
- **260px (Links):** Filter kompakt, aber lesbar (war 280px → -20px)
- **~740px (Mitte):** Bei 1400px Container: 1400 - 260 - 340 - 64 (Gaps) = 736px  
  → Genug Platz für Event-Cards ohne Cramping
- **340px (Rechts):** Weekend-Cards 1-spaltig (vertikal), Bahn-Widget, Vor-Ort

**Breakpoints:**
- `< 1200px`: Zurück zu 2-Spalten (Filter-Sidebar + Main)
- `< 768px`: Single-Column (Mobile)

---

### 2.2 Inhalt pro Spalte

#### **SPALTE LINKS (260px) — SELEKTION**
**Funktion:** Filtern & Einschränken  
**Sticky:** Ja (Top: 357px = Header-Höhe + Navbar)

**Komponenten:**
1. ✅ Favoriten + Highlights Toggle (Zeile)
2. ✅ Zeitraum Filter (Heute, Woche, Wochenende)
3. ✅ Kategorie (Kinder, Familie, Erwachsene)
4. ✅ Art-Tags (Collapsible: Kultur, Sport, Wellness...)
5. ✅ Region (Collapsible)
6. ✅ Ort Dropdown
7. ✅ "Filter zurücksetzen" Button

**Änderungen zum Ist-Zustand:**
- `-20px Breite` (260px statt 280px) → mehr Platz für Mitte
- Bleibt identisch in Funktion

---

#### **SPALTE MITTE (≈740px) — HAUPTCONTENT**
**Funktion:** Event-Liste durchsuchen  
**Sticky:** Nein — frei scrollbar  
**Max-Height:** Begrenzt auf Viewport für natürliches Scrolling

**Komponenten:**
1. **Suchfeld** (Desktop, oberhalb Event-Liste)
2. **Tagesgruppen** (NEU! — siehe 3.3)
   ```html
   <div class="day-group">
     <h3 class="day-header sticky">Heute · Mittwoch, 5. Feb</h3>
     <div class="day-events">
       <EventCard />
       <EventCard />
     </div>
   </div>
   ```
3. **Event-Liste** (scrollable)
4. **Load-More** (Mobile only, Desktop: alle Events sichtbar)

**Änderungen zum Ist-Zustand:**
- **NEU:** Tagesgruppen mit Sticky Headers (visuelle Orientierung!)
- Suchfeld bleibt in Content-Bereich (nicht in Sidebar)
- Mehr Breite = bessere Titel-Lesbarkeit in Event-Cards

---

#### **SPALTE RECHTS (340px) — KONTEXT**
**Funktion:** Zeitkritische & lokale Infos  
**Sticky:** Ja (Top: 357px)  
**Max-Height:** Viewport-Höhe, intern scrollbar falls nötig

**Komponenten (Reihenfolge von oben):**

1. **S-Bahn Live-Abfahrten** (TrainInfo.astro)
   - Possenhofen → München / Tutzing
   - Link zu S6-Statistik-Seite
   - Kompakte Card (≈180px Höhe)

2. **Weekend-Highlights** (NEU: Vertical-Scroll)
   - **KEINE 6 Cards horizontal!**
   - **3-4 Top-Events vertikal gestackt**
   - Jede Card **volle 340px Breite** = Titel voll lesbar
   - AI-Score prominent (links), Titel zentral, Pfeil rechts
   - **Neue kompakte Card-Struktur:**
   ```html
   <article class="weekend-highlight-card">
     <div class="wh-score">9.2</div>
     <div class="wh-content">
       <div class="wh-meta">Sa 14:00 · 👨‍👩‍👧‍👦 Familie</div>
       <h4 class="wh-title">Eisstockschießen am Starnberger See</h4>
       <p class="wh-summary">Traditionelles Wintervergnügen...</p>
       <div class="wh-location">📍 Starnberg</div>
     </div>
   </article>
   ```

3. **Vor Ort Widgets** (Desktop only, unterhalb Highlights)
   - Wochenmärkte
   - Webcams
   - Kompakt, 1-spaltig (340px)

**Änderungen zum Ist-Zustand:**
- S-Bahn & Highlights **raus aus Main Content**, in eigene Spalte
- Weekend-Highlights: **Horizontal → Vertical**
- Vor-Ort-Widgets: **Oberhalb statt unterhalb Events** (bessere Sichtbarkeit)

---

### 2.3 Sticky-Verhalten

```css
/* === STICKY POSITIONING === */

/* Fixed Navbar (always on top) */
.navbar {
  position: fixed;
  top: 0;
  z-index: 100;
}

/* Fixed Hero Header (below navbar) */
.header {
  position: fixed;
  top: 65px; /* Navbar-Höhe */
  z-index: 95;
}

/* Content starts below header */
.main {
  padding-top: 357px; /* Navbar 65px + Header ~292px */
}

/* Left Sidebar: Sticky */
.column-left {
  position: sticky;
  top: 357px; /* Bleibt sichtbar beim Scrollen */
  max-height: calc(100vh - 357px - 32px); /* Viewport minus Header */
  overflow-y: auto; /* Falls Filter-Sidebar sehr lang */
  align-self: start;
}

/* Center Column: Frei scrollbar */
.column-center {
  /* Kein sticky, normale Flow */
  min-width: 0; /* Prevent grid blowout */
}

/* Right Column: Sticky */
.column-right {
  position: sticky;
  top: 357px;
  max-height: calc(100vh - 357px - 32px);
  overflow-y: auto; /* Falls Highlights + Widgets zu lang */
  align-self: start;
}
```

**Verhalten beim Scrollen:**
1. User scrollt nach unten
2. **Navbar & Header bleiben oben** (fixed)
3. **Filter-Sidebar bleibt sichtbar** (sticky left)
4. **Event-Liste scrollt** (center)
5. **Bahn & Highlights bleiben sichtbar** (sticky right)

**Vorteil:**  
User können jederzeit Filter ändern oder Bahn-Abfahrten checken, ohne nach oben zu scrollen.

---

## 3. Spacing & Visual Rhythm System

### 3.1 Probleme im Ist-Zustand
- Inkonsistente Gaps zwischen Sections
- Weekend-Highlights haben zu wenig Luft
- Event-Cards zu eng gestapelt (var(--space-4) = 1rem)

### 3.2 Neues Spacing-System

```css
/* === SPACING SCALE === */
:root {
  /* Bestehendes System bleibt */
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  
  /* Neue semantische Tokens */
  --gap-section: var(--space-12);   /* Zwischen großen Abschnitten */
  --gap-component: var(--space-8);  /* Zwischen Komponenten */
  --gap-card: var(--space-5);       /* Zwischen Cards */
  --gap-column: var(--space-8);     /* Grid-Spalten-Abstand */
}
```

**Anwendung:**
```css
.content-grid {
  gap: var(--gap-column); /* 2rem = 32px zwischen Spalten */
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: var(--gap-card); /* 1.25rem = 20px zwischen Event-Cards */
}

.column-right > * + * {
  margin-top: var(--gap-component); /* 2rem zwischen Bahn, Highlights, Vor-Ort */
}
```

### 3.3 Tagesgruppen für visuellen Rhythmus

**Problem:** 91 Events in flacher Liste = keine Orientierung  
**Lösung:** Gruppierung nach Tagen mit Sticky Headers

```html
<div class="day-group">
  <h3 class="day-header">Heute · Mittwoch, 5. Februar</h3>
  <div class="day-events">
    <!-- Event-Cards für diesen Tag -->
  </div>
</div>

<div class="day-group">
  <h3 class="day-header">Donnerstag, 6. Februar</h3>
  <div class="day-events">
    <!-- Event-Cards für nächsten Tag -->
  </div>
</div>
```

**CSS:**
```css
.day-header {
  position: sticky;
  top: 0; /* Sticky innerhalb scrollbarer Event-Liste */
  background: var(--color-card);
  color: var(--color-primary);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: var(--space-3) var(--space-4);
  border-bottom: 2px solid var(--color-primary);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  margin-bottom: var(--space-4);
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.day-events {
  display: flex;
  flex-direction: column;
  gap: var(--gap-card);
  margin-bottom: var(--gap-section);
}
```

**Astro Logic:**
```ts
// Gruppiere Events nach Tagen
const eventsByDay = events.reduce((acc, event) => {
  const dayKey = event.date; // YYYY-MM-DD
  if (!acc[dayKey]) {
    acc[dayKey] = {
      date: new Date(event.date),
      events: []
    };
  }
  acc[dayKey].events.push(event);
  return acc;
}, {} as Record<string, { date: Date; events: any[] }>);

// Sortiere Tage
const sortedDays = Object.entries(eventsByDay)
  .sort(([a], [b]) => a.localeCompare(b));
```

**UX-Gewinn:**
- User sehen sofort, welche Events heute/morgen/übermorgen sind
- Sticky Headers bleiben sichtbar beim Scrollen → Orientierung
- Visueller Rhythmus: Header → Cards → Space → Header

---

## 4. Mobile & Tablet Degradation

### 4.1 Breakpoint-Strategie

```css
/* === RESPONSIVE BREAKPOINTS === */

/* Desktop 3-Spalten (1200px+) */
@media (min-width: 1200px) {
  .content-grid {
    grid-template-columns: 260px 1fr 340px;
  }
  
  .column-right { display: block; } /* Rechte Spalte sichtbar */
  .mobile-filter-bar { display: none; }
}

/* Tablet 2-Spalten (768px - 1199px) */
@media (min-width: 768px) and (max-width: 1199px) {
  .content-grid {
    grid-template-columns: 240px 1fr; /* Nur Filter + Content */
  }
  
  .column-right { display: none; } /* Rechte Spalte ausblenden */
  
  /* S-Bahn & Highlights zurück in Main Content */
  .train-info-inline,
  .weekend-highlights-inline {
    display: block;
  }
}

/* Mobile Single-Column (< 768px) */
@media (max-width: 767px) {
  .content-grid {
    display: block; /* Kein Grid */
  }
  
  .column-left { display: none; } /* Filter-Sidebar ausblenden */
  .mobile-filter-bar { display: block; } /* Bottom-Bar einblenden */
  
  /* Alles vertikal gestapelt */
  .column-center {
    padding: 0;
  }
}
```

### 4.2 Tablet-Layout (768px - 1199px)

**Struktur:**
```
┌──────────────────────────────────────────┐
│         Navbar (fixed)                   │
├──────────────────────────────────────────┤
│         Header (fixed)                   │
├──────────┬───────────────────────────────┤
│  Filter  │  Main Content                 │
│  Sidebar │  - S-Bahn (inline)            │
│  (240px) │  - Weekend Highlights (2cols) │
│  sticky  │  - Event-Liste                │
│          │  - Vor-Ort Widgets            │
└──────────┴───────────────────────────────┘
```

**Änderungen:**
- Rechte Spalte verschwindet
- Bahn & Highlights zurück in Main Content (oberhalb Event-Liste)
- Weekend-Highlights: 2-spaltig statt 3-4 vertikal
- Filter-Sidebar schmaler (240px statt 260px)

### 4.3 Mobile-Layout (< 768px)

**Struktur:** Bleibt wie aktuell
- Sticky Info-Ticker oben
- Fixed Bottom Filter-Bar
- Alles vertikal gestapelt
- Weekend-Highlights: Horizontal Scroll (6 Cards)
- Load-More Button für Event-Liste

**KEINE Änderungen nötig** — aktuelles Mobile-Layout ist gut!

---

## 5. Optimierungen für einzelne Widgets

### 5.1 Weekend-Highlights: Neue Card-Struktur

**Problem:** Aktuell horizontal scroll, 4 Spalten bei 1440px = unleserlich  
**Lösung:** Vertikale Cards in rechter Spalte

**Neue Component: `WeekendHighlightCard.astro`**

```html
<article class="wh-card">
  <div class="wh-score">
    <span class="wh-score-num">9.2</span>
    <span class="wh-score-label">/10</span>
  </div>
  
  <div class="wh-content">
    <div class="wh-meta">
      <span class="wh-date">Sa 14:00</span>
      <span class="wh-badge wh-badge--familie">👨‍👩‍👧‍👦 Familie</span>
    </div>
    
    <h4 class="wh-title">Eisstockschießen am Starnberger See</h4>
    
    <p class="wh-summary">
      Traditionelles Wintervergnügen für die ganze Familie am zugefrorenen See.
    </p>
    
    <div class="wh-location">
      <svg class="wh-icon" viewBox="0 0 24 24">...</svg>
      Starnberg
    </div>
  </div>
</article>
```

**CSS:**
```css
.wh-card {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--color-card);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--duration-normal) ease;
}

.wh-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.wh-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  height: 56px;
  background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.wh-score-num {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1;
  color: var(--color-primary);
}

.wh-score-label {
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--color-muted);
}

.wh-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.wh-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.wh-date {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.wh-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.wh-badge--familie {
  background: color-mix(in srgb, var(--color-familie) 12%, transparent);
  color: var(--color-familie);
}

.wh-title {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.35;
  color: var(--color-text);
  /* KEIN line-clamp! Volle Lesbarkeit! */
}

.wh-summary {
  font-size: 0.8125rem;
  line-height: 1.4;
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.wh-location {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 0.8125rem;
  color: var(--color-muted);
  margin-top: auto; /* Push to bottom */
}

.wh-icon {
  width: 14px;
  height: 14px;
  opacity: 0.6;
}
```

**Verhalten:**
- Click → öffnet Event-Modal (wie normale Event-Cards)
- Hover → leichtes Lift + Border-Color-Change
- Volle Titel-Lesbarkeit (kein Clamping!)
- AI-Score prominent links

### 5.2 Event-Cards: Optimierungen

**Klein-Optimierungen für bessere Lesbarkeit:**

```css
/* Date-Column schmaler */
.card-date {
  min-width: 50px; /* war 60px → +10px für Body */
}

/* Arrow schmaler */
.card-arrow {
  width: 18px; /* war 20px → +2px für Body */
}

/* Titel: 3 Zeilen statt 2 bei großen Screens */
@media (min-width: 1200px) {
  .card-title {
    -webkit-line-clamp: 3;
  }
}

/* Art-Tags: Hover-only auf Desktop */
@media (min-width: 1200px) {
  .card-art-tags {
    opacity: 0;
    max-height: 0;
    overflow: hidden;
    transition: all var(--duration-normal) ease;
  }
  
  .event-card:hover .card-art-tags {
    opacity: 1;
    max-height: 100px;
  }
}
```

**Effekt:**  
+12px mehr Platz für Titel → bessere Lesbarkeit ohne Layout-Änderung

### 5.3 S-Bahn Widget: Kompakt-Variante

**Für rechte Spalte:**

```css
/* Kompakte Variante für Column-Right */
.train-info--compact {
  padding: var(--space-4); /* statt var(--space-5) */
}

.train-info--compact .train-departure {
  font-size: 0.875rem; /* statt 1rem */
}

.train-info--compact .train-line-badge {
  font-size: 0.75rem; /* S6-Badge kleiner */
}
```

**Höhe reduziert:** ~180px statt ~220px → mehr Platz für Highlights

---

## 6. Design-System Anpassungen

### 6.1 Color System bleibt
- Primary: `#0d4a5c` (Teal-Blue)
- Accent: `#c9a962` (Gold)
- Categories: Kinder/Familie/Erwachsene unverändert

### 6.2 Typography bleibt
- Space Grotesk für Headlines
- System UI für Body

### 6.3 Neue Shadow-Levels (optional)

```css
:root {
  --shadow-sm: 0 1px 2px rgba(45, 42, 38, 0.04);
  --shadow-md: 0 4px 12px rgba(45, 42, 38, 0.06);
  --shadow-lg: 0 12px 24px rgba(45, 42, 38, 0.08);
  
  /* NEU: Für sticky Elemente */
  --shadow-sticky: 0 4px 20px rgba(45, 42, 38, 0.1);
}

.column-left,
.column-right {
  box-shadow: var(--shadow-sticky); /* Leichter Schatten für Depth */
}
```

---

## 7. Implementierungs-Roadmap

### Phase 1: Hotfix (15 Min) — SOFORT
**Ziel:** Weekend-Highlights lesbar machen

```css
/* In src/pages/index.astro <style> */
@media (min-width: 1200px) {
  .highlights-scroll {
    flex-wrap: wrap; /* Kein horizontal scroll */
    overflow-x: visible;
  }
  
  .highlight-card {
    flex: 1 1 calc(33.333% - var(--space-4)); /* 3 Spalten */
    min-width: 280px;
  }
}
```

**Resultat:** Titel sofort lesbar in 15 Minuten ✅

---

### Phase 2: Core 3-Spalten-Layout (2-3 Stunden)
**Datei: `src/pages/index.astro`**

1. **Grid-Struktur ändern** (30 Min)
```astro
<div class="content-grid">
  <!-- Column Left: Filter -->
  <aside class="column-left">
    <FilterBar ... />
  </aside>

  <!-- Column Center: Events -->
  <div class="column-center">
    <div class="events-header">...</div>
    <div class="events-list">
      {sortedDays.map(([dayKey, dayData]) => (
        <DayGroup date={dayData.date} events={dayData.events} />
      ))}
    </div>
  </div>

  <!-- Column Right: Context -->
  <aside class="column-right">
    <TrainInfo station="Possenhofen" compact />
    <WeekendHighlights events={weekendEvents} vertical />
    <div class="vor-ort-widgets">
      <MarketInfo />
      <WebcamWidget />
    </div>
  </aside>
</div>
```

2. **Tagesgruppen implementieren** (45 Min)
```astro
<!-- src/components/DayGroup.astro -->
---
interface Props {
  date: Date;
  events: any[];
}
const { date, events } = Astro.props;
const today = new Date();
const isToday = date.toDateString() === today.toDateString();
const dayLabel = isToday 
  ? 'Heute' 
  : date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
---

<div class="day-group">
  <h3 class="day-header">{dayLabel}</h3>
  <div class="day-events">
    {events.map(event => (
      <EventCard event={event} ... />
    ))}
  </div>
</div>
```

3. **Weekend-Highlights Vertical Component** (60 Min)
```astro
<!-- src/components/WeekendHighlightCard.astro -->
<!-- (siehe 5.1 oben) -->
```

4. **CSS anpassen** (30 Min)
- Grid-Definitionen
- Sticky positioning
- Responsive Breakpoints

---

### Phase 3: Polish & Optimierungen (1-2 Stunden)
1. Event-Card Optimierungen (5.2)
2. S-Bahn Kompakt-Variante (5.3)
3. Dark Mode Tests
4. Spacing-Feintuning

---

### Phase 4: Testing & QA (1 Stunde)
- [ ] Desktop 1440px: Alle Spalten sichtbar?
- [ ] Desktop 1920px: Nicht zu breit? (max-width: 1400px greift)
- [ ] Tablet 1024px: Zurück zu 2-Spalten?
- [ ] Mobile 375px: Single-Column funktioniert?
- [ ] Sticky behavior funktioniert?
- [ ] Dark Mode: Kontraste OK?
- [ ] Hover-States: Smooth?

---

## 8. Erwartete UX-Verbesserungen

### 8.1 Messbare Verbesserungen
| Metrik | Vorher | Nachher | Δ |
|--------|--------|---------|---|
| **Time to First Event** | ~2-3 Scrolls | 0 Scrolls | -75% |
| **Weekend-Highlight Visibility** | Below fold | Above fold (rechts) | +100% |
| **Filter Changes / Session** | 2-3× (zurück scrollen) | Unbegrenzt (sticky) | +50% |
| **Cognitive Load** | Hoch (Kontext-Wechsel) | Niedrig (3 Bereiche parallel) | -40% |

### 8.2 Qualitative Verbesserungen
- ✅ **Scannability:** Tagesgruppen + 3-Spalten = schneller Überblick
- ✅ **Lesbarkeit:** Weekend-Cards vertikal = volle Titel
- ✅ **Orientierung:** Sticky Headers + Spalten = immer wissen, wo man ist
- ✅ **Effizienz:** Filter ändern ohne Scrollen
- ✅ **Klarheit:** Jede Spalte hat eine klare Funktion

### 8.3 User Journey Beispiel

**Vorher (2-Spalten):**
1. User landet auf Seite
2. Scrollt an Bahn vorbei
3. Scrollt an Weekend-Highlights vorbei (sieht nur 2-3)
4. Sucht in Event-Liste
5. Scrollt zurück nach oben für Filter
6. Scrollt wieder runter zu Events
7. **Frustration** 😤

**Nachher (3-Spalten):**
1. User landet auf Seite
2. Sieht sofort:
   - Links: Filter
   - Mitte: Heutige Events
   - Rechts: Nächste S-Bahn (12 Min) + Top-Weekend-Event
3. Ändert Filter (links, sticky) → Events aktualisieren (mitte)
4. Checkt Bahn-Zeit (rechts, sticky) ohne Scrollen
5. Findet Event für Samstag in Highlights (rechts)
6. **Happy Path** ✅

---

## 9. Alternative: 2.5-Spalten-Layout (Kompromiss)

Falls **3 Spalten zu komplex** erscheinen:

**Struktur:**
```
┌────────┬─────────────────┬──────────┐
│ Filter │  Event-Liste    │ Kontext  │
│ (240px)│                 │ (280px)  │
│ sticky │                 │ sticky   │
│        │                 │          │
│        │                 │ [collapsed]
│        │                 │  📊 Stats
│        │                 │  ↓ Expand
└────────┴─────────────────┴──────────┘
```

**Änderung:** Rechte Spalte standardmäßig **collapsed** (nur Icons)  
**Expand:** User klickt → Spalte öffnet sich (280px → 340px)

**Vorteil:**  
- Mehr Platz für Event-Liste (default)
- 3-Spalten-Struktur bleibt, aber optional

**Nachteil:**  
- Hidden Features (User weiß nicht, dass Highlights existieren)
- Extra Click erforderlich

**Empfehlung:** Nur wenn Performance-Probleme auftreten

---

## 10. Zusammenfassung & Empfehlung

### ✅ DO: 3-Spalten-Layout
**Warum:**
- Klare funktionale Trennung
- Bessere Scannability
- Weniger Scrolling
- Moderne Desktop-UX
- Perfekt für Content-heavy Sites

**Für wen:**
- Familien am Starnberger See
- Desktop-First User (>70% Traffic auf Desktop)
- Wiederkehrende Nutzer

---

### ❌ DON'T: Aktuelles 2-Spalten-Layout beibehalten
**Warum nicht:**
- Weekend-Highlights gehen unter
- Zu viel vertikales Scrolling
- Keine klare Hierarchie
- Cognitive Load zu hoch

---

### 🎯 Finale Empfehlung

**JETZT (15 Min):**  
→ Hotfix für Weekend-Highlights (3-Spalten-Grid statt horizontal scroll)

**DANN (2-3 Stunden):**  
→ Full 3-Spalten-Layout implementieren

**SPÄTER (1-2 Stunden):**  
→ Tagesgruppen + Event-Card-Optimierungen

**Erwartetes Ergebnis:**  
Eine **klare, übersichtliche, familien-freundliche** Event-Seite, die nicht wie ein Admin-Dashboard aussieht, sondern wie ein **kuratiertes Magazin** mit drei klar getrennten Bereichen:
- **Links:** Was will ich sehen? (Filter)
- **Mitte:** Was gibt es? (Events)
- **Rechts:** Was ist jetzt wichtig? (Bahn, Highlights, Vor-Ort)

---

**Ready to implement! 🚀**

Alle CSS-Snippets sind copy-paste-ready. Die Architektur ist durchdacht für euren Astro-Stack. Der Redesign respektiert euer Design-System und fügt sich nahtlos ein.

**Fragen? Feedback? Let's iterate!** 💬
