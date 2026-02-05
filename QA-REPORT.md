# QA-Report: starnberg-events.pages.dev

**Datum:** 2026-02-05, 10:31 CET  
**Tester:** Automatisierter QA-Agent (Browser: Headless Chrome)  
**URL:** https://starnberg-events.pages.dev  

---

## 1. Test-Ergebnisse nach Auflösung

### 1.1 Mobile Small (375×667) — iPhone SE

**Layout:** Einspaltiges Layout, alle Inhalte vertikal gestapelt.

| Kriterium | Ergebnis | Details |
|-----------|----------|---------|
| Elemente sichtbar | ✅ | Header, Weekend-Carousel, Event-Cards, Filter-Pills, Footer alles sichtbar |
| Überlappungen | ✅ | Keine Überlappungen erkannt |
| Text lesbar | ✅ | Schriftgrößen angemessen für mobiles Lesen |
| Filter funktionieren | ✅ | Mobile Filter-Bar am unteren Bildschirmrand mit Alle/Kinder/Familie/Erwachsene |
| Abstände Header↔Content | ✅ | Ausreichend Abstand zwischen Hero-Header und Content |
| Footer erreichbar | ✅ | Footer mit "Vor Ort", Wochenmärkte, Webcams und Quellenangabe sichtbar |

**Besonderheiten:**
- Weekend-Events als horizontaler Carousel (Swipe-Karten) über der Event-Liste
- "Weitere Events · 503 mehr" Button am Ende der Liste
- Info-Ticker (Marquee) zeigt Wetter, S-Bahn, Pünktlichkeit
- S-Bahn-Links verlinken korrekt auf DB IRIS

---

### 1.2 Mobile Large (414×896) — iPhone 11

**Layout:** Einspaltiges Layout, etwas mehr Platz als iPhone SE.

| Kriterium | Ergebnis | Details |
|-----------|----------|---------|
| Elemente sichtbar | ✅ | Identisch zu iPhone SE, alle Elemente korrekt dargestellt |
| Überlappungen | ✅ | Keine |
| Text lesbar | ✅ | Minimal größer durch breiteren Viewport |
| Filter funktionieren | ✅ | Mobile Filter-Bar identisch zu iPhone SE |
| Abstände Header↔Content | ✅ | Proportional korrekt |
| Footer erreichbar | ✅ | Alle Footer-Sektionen sichtbar |

**Besonderheiten:**
- Zweite Weekend-Karte im Carousel teilweise sichtbar (erwartetes Verhalten für Scroll-Hinweis)
- Mehr Platz für Event-Card-Beschreibungen

---

### 1.3 Tablet (768×1024) — iPad

**Layout:** Hybrid-Layout mit schmaler linker Spalte + breiter Mitte. Rechte Spalte hidden.

| Kriterium | Ergebnis | Details |
|-----------|----------|---------|
| Elemente sichtbar | ⚠️ | "Filter"-Label links sichtbar, aber Sidebar-Inhalt hidden (nur 47px Höhe) |
| Überlappungen | ✅ | Keine |
| Text lesbar | ✅ | Gut lesbar |
| Filter funktionieren | ✅ | Mobile Filter-Bar (fixed, bottom) aktiv |
| Abstände Header↔Content | ✅ | Korrekt |
| Footer erreichbar | ✅ | "Vor Ort" Sektion im Center-Column weit unten (y≈2540px) |

**Spalten-Analyse (768px):**
| Spalte | Sichtbar | Größe | Inhalt |
|--------|----------|-------|--------|
| `.column-left` | Ja | 240×47px | Nur "Filter"-Überschrift, Rest hidden |
| `.column-center` | Ja | 417×642px | Weekend-Carousel + Event-Liste |
| `.column-right` | **Nein** | 0×0px | Komplett `display: none` |

**Findings:**
- 🐛 **"Filter"-Label ohne Funktion:** Die linke Spalte zeigt "Filter" als H3, aber der Filter-Sidebar-Content (Suche, Zeitraum, Kategorie, Art, Region, Ort) ist hidden. Das Label nimmt 240px Breite weg, die dem Center-Column fehlen.
- ℹ️ S-Bahn-Info ist in der Top-Navbar kondensiert verfügbar ("S6 → Muc 10:50", "S6 → Tut 10:51 +2")
- ✅ Weekend-Events korrekt in Center-Column verschoben (nicht im hidden Right-Column)
- ✅ "Vor Ort" + Webcams ebenfalls in Center-Column verfügbar (weit unten)

---

### 1.4 Desktop Small (1280×800) — Laptop

**Layout:** Volles 3-Spalten-Layout.

| Kriterium | Ergebnis | Details |
|-----------|----------|---------|
| Elemente sichtbar | ✅ | Alle drei Spalten korrekt dargestellt |
| Überlappungen | ✅ | Keine |
| Text lesbar | ✅ | Optimale Schriftgrößen |
| Filter funktionieren | ✅ | Volle Filter-Sidebar links (Favoriten, Highlights, Suche, Zeitraum, Kategorie) |
| Abstände Header↔Content | ✅ | Headings aller 3 Spalten auf gleicher Höhe |
| Footer erreichbar | ✅ | Footer unterhalb der Spalten sichtbar |

**Spalten-Inhalte:**
- **Links:** Filter (Favoriten, Highlights 74, Suchfeld, Zeitraum, Kategorie mit Counts)
- **Mitte:** "Heute · Donnerstag, 5. Februar" mit Event-Cards
- **Rechts:** S-Bahn aktuell (Possenhofen, DB Live →, Abfahrten mit Gleisen) + Dieses Wochenende

---

### 1.5 Desktop Large (1440×900) — Desktop ⭐ Haupttest

**Layout:** Volles 3-Spalten-Layout mit mehr Breathing-Room.

| Kriterium | Ergebnis | Details |
|-----------|----------|---------|
| Elemente sichtbar | ✅ | Alle Elemente perfekt dargestellt |
| Überlappungen | ✅ | Keine |
| Text lesbar | ✅ | Optimale Lesbarkeit |
| Filter funktionieren | ✅ | Vollständige Filter-Sidebar inkl. Art-Expander, Region |
| Abstände Header↔Content | ✅ | Alle Spalten-Headings exakt aligned |
| Footer erreichbar | ✅ | Footer klar sichtbar |

**Heading-Alignment-Messung (JavaScript `getBoundingClientRect().top`):**

| Spalte | Heading | Top-Position |
|--------|---------|-------------|
| Links | "Filter" | **377px** |
| Mitte | "Heute · Donnerstag, 5. Februar" | **377px** |
| Rechts | "S-Bahn aktuell" | **377px** |

✅ **Alle drei Spalten-Headings exakt auf 377px aligned — perfekt!**

---

### 1.6 Desktop XL (1920×1080) — Full HD

**Layout:** Volles 3-Spalten-Layout, maximaler Whitespace.

| Kriterium | Ergebnis | Details |
|-----------|----------|---------|
| Elemente sichtbar | ✅ | Alle Elemente sichtbar, mehr Filter-Optionen im Viewport |
| Überlappungen | ✅ | Keine |
| Text lesbar | ✅ | Sehr gut lesbar |
| Filter funktionieren | ✅ | Sidebar zeigt Art, Region, Ort-Dropdown — alle sichtbar ohne Scroll |
| Abstände Header↔Content | ✅ | Proportional korrekt |
| Footer erreichbar | ✅ | Footer sichtbar |

**Besonderheiten:**
- Filter-Sidebar zeigt mehr Optionen: Art (expandierbar), Region (expandierbar), Ort-Dropdown
- Event-Cards haben mehr horizontalen Platz
- 4 S-Bahn-Abfahrten sichtbar (vs. 3-4 bei 1440px)

---

## 2. Scroll-Tests (Desktop 1440×900)

### 2.1 Sticky Day-Headings in Event-Liste

| Heading | Position | Sticky | z-index | Ergebnis |
|---------|----------|--------|---------|----------|
| "Heute · Donnerstag, 5. Februar" | sticky | ✅ | 5 | Bleibt oben fixiert |
| "Freitag, 6. Februar" | sticky | ✅ | 5 | Löst "Heute" korrekt ab |
| Alle weiteren Tage (bis Dez. 2026) | sticky | ✅ | 5 | Alle korrekt sticky |

**Verhalten beim Scrollen:**
- ✅ Day-Headings bleiben am oberen Rand der `.column-center` fixiert
- ✅ Event-Cards scrollen sauber hinter dem Heading durch
- ✅ Heading hat korrekte `background-color: rgb(26, 24, 22)` — kein Durchscheinen
- ✅ z-index: 5 sorgt dafür, dass Cards dahinter verschwinden

### 2.2 Sticky Headings in rechter Sidebar

| Heading | Sticky | Details |
|---------|--------|---------|
| "S-Bahn aktuell" | ✅ sticky, top: 0 | Bleibt fixiert beim Sidebar-Scroll |
| "Dieses Wochenende" | ❌ static | Scrollt mit dem Content mit |
| "Vor Ort" | ❌ static | Scrollt mit |

### 2.3 Sticky Heading in linker Sidebar

| Heading | Sticky | Details |
|---------|--------|---------|
| "Filter" | ❌ static | Scrollt weg wenn Filter-Sidebar lang ist |

### 2.4 Cards hinter Headings

✅ **Kein Overlap.** Event-Cards ragen NICHT über die Sticky-Headings hinaus. Das ist korrekt implementiert durch:
- Heading: `position: sticky; top: 0; z-index: 5; background-color: rgb(26, 24, 22)`
- Cards: `position: relative; z-index: auto`

### 2.5 Spalten-Konfiguration

Alle drei Spalten haben:
- `overflow-y: auto` (eigener Scroll-Container)
- `max-height: 518px` / `height: 518px`

---

## 3. Interaktions-Tests (Desktop 1440×900)

### 3.1 Filter "Familie"

| Schritt | Ergebnis | Details |
|---------|----------|---------|
| Klick auf "Familie 184" | ✅ | Button wird aktiv (grün mit ✔️) |
| Event-Liste filtert sich | ✅ | Nur FAMILIE-Events angezeigt |
| Weekend-Events filtern sich | ✅ | Rechte Sidebar zeigt nur FAMILIE Weekend-Events |
| Event-Counts aktuell | ✅ | "Kinder 29", "Familie 184", "Erwachsene 300" |
| Zurück zu "Alle" | ✅ | Alle Events wieder sichtbar |

### 3.2 Weekend-Event → Modal

| Schritt | Ergebnis | Details |
|---------|----------|---------|
| Klick auf "Willi live" Karte | ✅ | Modal öffnet sich |
| Modal-Inhalt | ✅ | Titel, KINDER-Badge, Datum, Ort, Google Maps Embed, KI-Bewertung |
| Action-Buttons | ✅ | 📅 Kalender, 📤 Teilen, "Event-Seite ↗" (extern) |
| Close-Button (X) | ✅ | Modal schließt korrekt |
| URL-Update | ✅ | URL wird zu `?event=45` aktualisiert |
| Backdrop | ✅ | Hintergrund korrekt abgedunkelt |

**Modal-Inhalt (Willi live):**
- Titel: "Willi live – Und wovon träumst du?"
- Kategorie: KINDER
- Datum: Samstag, 07. Februar 2026, 15:00 Uhr
- Ort: BecCult (mit Google Maps Pin)
- KI-Bewertung: Detaillierte Beschreibung
- 3 Action-Buttons am unteren Rand

### 3.3 "X weitere anzeigen" Button

| Schritt | Ergebnis | Details |
|---------|----------|---------|
| Initial-Zustand | ✅ | Button zeigt "15 weitere anzeigen" |
| Klick | ✅ | Weekend-Liste expandiert |
| Nach Expansion | ✅ | Button-Text wechselt zu "Weniger anzeigen" |
| Erneuter Klick | ✅ | Liste kollabiert wieder |
| Toggle funktioniert | ✅ | Beliebig oft umschaltbar |

---

## 4. Bug-Liste

### 🔴 Critical — keine gefunden

### 🟠 Major — keine gefunden

### 🟡 Minor

| # | Bug | Auflösung | Beschreibung | Empfehlung |
|---|-----|-----------|-------------|------------|
| M1 | "Filter"-Label ohne Funktion auf Tablet | 768×1024 | Die linke Spalte (`.column-left`) zeigt die H3-Überschrift "Filter" (240×47px), aber der Filter-Sidebar-Content ist hidden. Nimmt 240px Breite weg, die der Event-Liste fehlen. | Entweder `.column-left` auf Tablet komplett hidden setzen (`display: none`) oder Filter-Sidebar responsiv anpassen. |
| M2 | "Filter"-Heading nicht sticky | ≥1280px | Im Gegensatz zu den Center- und Right-Column-Headings ist das "Filter"-Heading `position: static`. Beim Scrollen in der Filter-Sidebar verschwindet es. | `position: sticky; top: 0` hinzufügen, analog zu den anderen Spalten-Headings. |

### 🔵 Cosmetic

| # | Bug | Auflösung | Beschreibung |
|---|-----|-----------|-------------|
| C1 | "Dieses Wochenende" nicht sticky | ≥1280px | Das Heading "Dieses Wochenende" in der rechten Sidebar ist `position: static`, während "S-Bahn aktuell" darüber sticky ist. Beim Scrollen in der rechten Sidebar verschwindet "Dieses Wochenende". |
| C2 | S-Bahn Detailinfo auf Tablet hidden | 768×1024 | Die detaillierte S-Bahn-Box (Gleise, 4+ Abfahrten) ist im hidden `.column-right`. Nur die kondensierte Top-Navbar zeigt "S6 → Muc 10:50". Kein großes Problem, aber Desktop-User sehen mehr. |

---

## 5. Zusammenfassung

### ✅ Was funktioniert gut

1. **Responsive Layout-Transitions:** Nahtloser Übergang von 1-Spalte (Mobile) → 2+Spalte (Tablet) → 3-Spalte (Desktop)
2. **Heading-Alignment:** Alle drei Desktop-Spaltenheadings exakt auf derselben Y-Position (377px) — pixel-perfect
3. **Sticky Day-Headings:** Korrekt implementiert mit z-index: 5 und passender Hintergrundfarbe — Cards scrollen sauber dahinter
4. **Filter-System:** Kategorie-Filter funktioniert sofort und korrekt in Event-Liste UND Weekend-Sidebar
5. **Event-Modal:** Vollständig implementiert mit Karte, KI-Bewertung, Action-Buttons, Deep-Link (URL-Param)
6. **Weekend-Expand:** Toggle "X weitere anzeigen / Weniger anzeigen" funktioniert einwandfrei
7. **Informationsarchitektur:** Wetter, S-Bahn (Verspätungen!), Pünktlichkeit, Sonnenauf/-untergang elegant im Ticker
8. **Textlesbarkeit:** An allen Breakpoints gut — kein zu kleiner oder zu großer Text
9. **Event-Counts:** Filterzahlen korrekt (Kinder 29, Familie 184, Erwachsene 300)
10. **Content-Reflow:** Weekend-Events und "Vor Ort"-Sektion werden auf kleineren Screens korrekt ins Center-Column umverteilt

### ⚠️ Was gefixt werden sollte

1. **M1 — Tablet "Filter"-Label:** Sinnloses "Filter"-Label auf Tablet entfernen oder mit Funktion füllen (Priorität: mittel)
2. **M2 — "Filter"-Heading sticky machen:** Konsistenz mit den anderen Spalten herstellen (Priorität: niedrig)

### 📊 Gesamtbewertung

| Aspekt | Bewertung |
|--------|-----------|
| Layout & Responsiveness | ⭐⭐⭐⭐½ |
| Funktionalität | ⭐⭐⭐⭐⭐ |
| Konsistenz | ⭐⭐⭐⭐ |
| Barrierefreiheit | ⭐⭐⭐⭐ (aria-labels auf Filtern, Skip-Link vorhanden) |
| Performance | ⭐⭐⭐⭐ (513 Events geladen, kein Lazy-Loading sichtbar) |
| **Gesamt** | **⭐⭐⭐⭐½** |

Die Website ist in einem sehr guten Zustand. Keine kritischen oder schwerwiegenden Bugs gefunden. Die zwei Minor-Issues betreffen ausschließlich das Tablet-Breakpoint und die Sticky-Konsistenz. Alle interaktiven Features (Filter, Modal, Expand) funktionieren einwandfrei.

---

*Report generiert am 2026-02-05 um 10:31 CET*
