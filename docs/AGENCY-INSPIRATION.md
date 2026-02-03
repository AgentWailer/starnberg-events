# Agency-Level Design Inspiration

## Das Problem mit "KI-generiertem" Design

Das typische KI-generierte Design hat folgende Erkennungsmerkmale:
- Alles perfekt symmetrisch und zentriert
- Standard Blau/Orange Farbkombinationen
- Montserrat oder Inter als einzige Font
- Zu viele Elemente, zu wenig Mut
- Alles sieht "sicher" aus - kein Risiko, kein Charakter

## Inspiration von echten Agenturen

### 1. Graubünden Tourismus (graubuenden.ch)
**Was macht es besonders:**
- Full-bleed Hero-Images die Emotionen wecken
- Gedämpfte, natürliche Farbpalette (Olive/Forest Greens)
- Serif-Typografie für Headlines - nicht der typische Sans-Serif
- Extrem großzügiger Whitespace
- Editorial-Layout statt Standard-Grid

**Übernommen für Starnberg:**
- Full-bleed Hero-Konzept
- Natürliche, zur Region passende Farben
- Großzügiges Spacing

### 2. Tirol Tourismus (tirol.at)
**Was macht es besonders:**
- Starke Markenfarbe (Rot) mutig eingesetzt
- Klare visuelle Hierarchie
- Card-basierte Inhaltsstruktur
- Dezente Iconografie
- Call-to-Actions die funktionieren

**Übernommen für Starnberg:**
- Mutige Primärfarbe
- Card-Design-Patterns
- Klare CTAs

### 3. Locomotive Agency (locomotive.ca)
**Was macht es besonders:**
- Typografische Experimente
- Unkonventionelle Layouts
- Micro-Interaktionen die Persönlichkeit zeigen
- Custom Cursor und kleine Überraschungen
- "Digital-First" Denken

**Übernommen für Starnberg:**
- Mutige Typografie
- Subtile Micro-Interaktionen
- Persönlichkeit im Detail

### 4. Visit Finland (visitfinland.com)
**Was macht es besonders:**
- Nordic Minimal - reduziert auf das Wesentliche
- Viel Weißraum als Designelement
- Fotografie als Hauptelement
- Sehr wenig UI-Chrome
- Storytelling durch Layout

**Übernommen für Starnberg:**
- Reduktion auf das Wesentliche
- Whitespace als aktives Element

## Der Starnberg Events "Vibe"

### Konzept: "ALPENSEE"
Die Region Starnberger See ist geprägt von:
- Klarem, tiefblauem See
- Alpenblick am Horizont
- Elegante, aber bodenständige Atmosphäre
- Natur trifft Kultur
- Familienfreundlich aber nicht kindisch

### Design-Prinzipien

1. **Farbe mit Bedeutung**
   - Primary: Tiefer See-Blau (#0d4a5c) - spiegelt den See wider
   - Background: Warmes Weiß (#faf8f6) - nicht kalt-weiß
   - Accent: Dezentes Gold (#c9a962) - Eleganz ohne Kitsch

2. **Mutige Typografie**
   - Headlines: Space Grotesk - modern, warm, charaktervoll
   - Body: System-Stack für Performance
   - Große Headlines, kleine Body - klare Hierarchie

3. **Großzügiges Spacing**
   - Doppelt so viel Whitespace wie man denkt
   - Elemente dürfen atmen
   - Weniger Komponenten pro Viewport

4. **Intentionale Asymmetrie**
   - Nicht alles zentriert
   - Text darf links stehen
   - Bilder dürfen angeschnitten sein

5. **Weniger ist mehr**
   - Widgets nur auf Demand (collapsible)
   - Filter versteckt bis gebraucht
   - Focus auf Events, nicht auf Features

## Konkrete Änderungen

### Header
- Volle Breite, keine Box
- Großer, mutiger Titel
- Subtiler Gradient statt hartem Farbblock
- Location-Badge dezenter integriert

### Event Cards
- Mehr vertikaler Rhythmus
- Kategorie-Farbe subtiler (nur Akzent, nicht Balken)
- Mehr Fokus auf Titel
- Datum prominenter

### Info-Widgets
- Collapsed by default
- Elegantere Icons
- Weniger visuelle Gewichtung
- "Bei Bedarf" statt "immer sichtbar"

### Footer
- Minimal, fast unsichtbar
- Nur das Nötigste

## Farb-Palette

```css
/* Primary - Der See */
--see-blau: #0d4a5c;
--see-blau-light: #1a6a82;
--see-blau-dark: #0a3a48;

/* Neutral - Warme Töne */
--warm-white: #faf8f6;
--warm-gray: #e8e4e0;
--stone: #a8a095;
--charcoal: #2d2a26;

/* Accent - Gold */
--gold: #c9a962;
--gold-muted: #d4be8a;

/* Semantic */
--kinder: #e67e22;
--familie: #27ae60;
--erwachsene: #8e44ad;
```

## Typography

```css
/* Headlines */
font-family: 'Space Grotesk', system-ui, sans-serif;
font-weight: 600;
letter-spacing: -0.03em;

/* Body */
font-family: system-ui, -apple-system, sans-serif;
font-weight: 400;
line-height: 1.6;
```

## Kern-Erkenntnis

> "Gutes Design ist nicht das Hinzufügen von Elementen, sondern das Weglassen von allem Unnötigen, bis nur noch das Wesentliche übrig bleibt."

Der wichtigste Unterschied zwischen KI-generiertem und Agentur-Design:
**Intention**. Jede Entscheidung hat einen Grund. Nichts ist "einfach so" da.
