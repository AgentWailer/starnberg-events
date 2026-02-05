# DESIGN.md — Design-Richtlinien

Verbindliche Gestaltungsregeln für die Starnberg Events Website. Jede Änderung muss diesen Prinzipien folgen.

## 1. Einheitlichkeit

**Oberstes Prinzip:** Alle gleichartigen Elemente sehen immer gleich aus. Keine Sonderlocken, keine Ausnahmen.

### Sektionsüberschriften (`.section-heading`)

Jede Sektion der Seite erhält **exakt dieselbe** Überschrift:

- **Klasse:** `.section-heading` (global definiert in `Layout.astro`)
- **Schrift:** `1rem`, `font-weight: 600`, `color: var(--color-text)`
- **Trennlinie:** `border-bottom: 1px solid var(--color-border-light)`
- **Abstände:** `padding-bottom: var(--space-3)`, `margin-bottom: var(--space-4)`

**Gilt für:** Filter, Tagesgruppen, S-Bahn aktuell, Dieses Wochenende, Vor Ort — überall.

### Keine Emojis in Überschriften

Sektionsüberschriften enthalten **niemals** Emojis. Text only. Emojis gehören in Inhalte, Badges oder Metadaten — nicht in Titel.

## 2. Komponenten-Konsistenz

### Event-Cards

- Einheitlicher Aufbau: Datum-Block | Kategorie-Badge + Uhrzeit | Titel | Ort
- Gleiche Border-Radien, Abstände, Hover-Effekte
- Favoriten-Heart immer rechts oben

### Weekend-Highlight-Cards

- **Desktop-Sidebar (`.wh-card`):** Horizontal, Score-Kreis links, Content rechts
- **Mobile-Karussell (`.wk-card`):** Vertikal, Score-Badge oben, Content darunter
- Beide teilen: gleiche Farbcodierung, gleiche Datenfelder, gleicher Modal-Click

### Score-Badges

Farbcodierung konsistent:
- **≥ 8:** Grün (`#10b981`)
- **6–7:** Gelb/Amber (`#f59e0b`)
- **< 6:** Lila (`#6366f1`)

### Kategorie-Badges

- `kinder` → Gelb/Amber
- `familie` → Grün
- `erwachsene` → Lila/Indigo

## 3. Responsive Verhalten

### Breakpoints

| Breakpoint | Layout | Bemerkung |
|---|---|---|
| < 768px | Single Column | Kein Filter-Sidebar, sticky Ticker oben |
| 768px–1199px | 2 Spalten | Filter links, Events rechts |
| ≥ 1200px | 3 Spalten | Filter links, Events Mitte, Context rechts |

### Sichtbarkeit

- **Weekend-Karussell:** Mobile + Tablet (< 1200px), horizontal scrollbar
- **Weekend-Sidebar:** Nur Desktop (≥ 1200px), vertikal im rechten Sidebar
- **Vor-Ort-Sektion:** Mobile/Tablet unten, Desktop im rechten Sidebar
- **S-Bahn-Ticker:** Mobile oben (sticky), Desktop im rechten Sidebar

## 4. Dark/Light Mode

Alle Farben über CSS Custom Properties (`var(--color-*)`). Niemals hartcodierte Farben verwenden. Beide Modi müssen identisch strukturiert sein.

## 5. Typografie

- **Headlines:** System-Font-Stack
- **Zahlen/Scores:** `Space Grotesk` (falls verfügbar, Fallback system-ui)
- **Keine Markdown-artigen Formatierungen** in der UI (keine `#`, `**`, etc.)

## 6. Abstände & Radien

Immer Design-Tokens verwenden:
- Abstände: `var(--space-1)` bis `var(--space-16)`
- Radien: `var(--radius-sm)`, `var(--radius-md)`, `var(--radius-lg)`, `var(--radius-xl)`, `var(--radius-full)`

**Keine magischen Zahlen.** Wenn ein neuer Abstand nötig ist, als Token definieren.

## 7. Interaktivität

- **Hover:** `translateY(-2px)` + `box-shadow` (Cards), `border-color: var(--color-primary)` 
- **Active:** `scale(0.98)` oder `scale(0.99)`
- **Transitions:** `var(--duration-normal)` für Cards, `var(--duration-fast)` für kleine Elemente
- **Focus-visible:** `2px solid var(--color-primary)`, `outline-offset: 2px`

---

*Regel: Bei Zweifeln → bestehende Komponenten anschauen und exakt gleich machen.*
