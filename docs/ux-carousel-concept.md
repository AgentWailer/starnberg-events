# UX Konzept: Horizontales Info-Karussell (Mobile)

## 1. Analyse Status Quo

### Aktuelle Implementierung
Das bestehende `InfoTicker.astro` nutzt ein **Fade-Karussell**:
- 4 Slides übereinander positioniert (`position: absolute`)
- Wechsel durch Opacity-Animation (300ms ease)
- Auto-Rotation alle 4 Sekunden
- Dots als Indikator + Navigation
- Basic Swipe-Erkennung (threshold: 50px)

### Probleme
1. **Kein räumliches Modell** - User versteht nicht, dass weitere Infos "neben" dem aktuellen Slide liegen
2. **Keine visuelle Kontinuität** - Fade suggeriert Ersetzung, nicht Navigation
3. **Swipe fühlt sich falsch an** - Physische Geste ohne physische Reaktion
4. **S-Bahn zeigt nur eine Richtung** - User braucht beide (München + Tutzing)

---

## 2. Neues Konzept: Endlos-Scroll-Karussell

### 2.1 Grundprinzip

```
┌──────────────────────────────────────────────┐
│  [◀]   ┌────────┐ ┌────────┐ ┌────────┐  [▶] │
│        │  Card  │ │  Card  │ │  Card  │      │
│        │   1    │ │   2    │ │   3    │      │
│        └────────┘ └────────┘ └────────┘      │
│                                              │
│              ← swipe / auto-scroll →         │
└──────────────────────────────────────────────┘
```

**Physisches Modell:** Cards schieben sich horizontal durch ein Viewport-Fenster. Der User sieht immer ~1.3 Cards (aktive Card + Anschnitt der nächsten).

### 2.2 Cards (5 Stück)

| # | Icon | Titel | Inhalt | API-Quelle |
|---|------|-------|--------|------------|
| 1 | ☀️ | Wetter | `8°` + Kondition | Open-Meteo |
| 2 | 💧 | Wassertemperatur | `4°` Starnberger See | GKD Bayern (scrape) |
| 3 | 🌅 | Sonnenzeiten | `07:28 – 17:45` | Open-Meteo |
| 4 | 🚆 | S-Bahn → München | `14:32` S6 Pasing | DB API |
| 5 | 🚆 | S-Bahn → Tutzing | `14:48` S6 Tutzing | DB API |

**Änderung:** S-Bahn wird in zwei separate Cards aufgeteilt (Richtung München + Richtung Tutzing).

---

## 3. Visuelle Gestaltung

### 3.1 Card-Dimensionen

```css
/* Mobile (< 768px) - RESPONSIVE */
.carousel-card {
  width: min(140px, calc((100vw - 60px) / 2));  /* ~2 Cards sichtbar */
  min-height: 64px;
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--color-card);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

/* Abstände */
.carousel-track {
  gap: 12px;              /* Zwischen Cards */
  padding: 0 20px;        /* Rand links/rechts für Peek-Effekt */
}
```

### 3.2 Card-Aufbau

```
┌─────────────────────────┐
│  ☀️  8°                 │  ← Icon + Value (prominent)
│  Starnberg              │  ← Label (sekundär)
└─────────────────────────┘
```

**Typografie:**
- Icon: 24px (Emoji)
- Value: 18px, font-weight 600, `--color-text`
- Label: 11px, uppercase, letter-spacing 0.5px, `--color-text-secondary`

### 3.3 Farbvarianten pro Card-Typ

| Card | Akzentfarbe (subtle) |
|------|----------------------|
| Wetter | `--color-accent` (Gold) |
| Wasser | `#0ea5e9` (Sky Blue) |
| Sonne | `#f59e0b` (Amber) |
| S-Bahn München | `#16a34a` (S-Bahn Grün) |
| S-Bahn Tutzing | `#16a34a` (S-Bahn Grün) |

Akzent wird als dezenter Left-Border (3px) oder Icon-Hintergrund eingesetzt.

---

## 4. Interaction Patterns

### 4.1 Auto-Rotation

```
┌─────────────────────────────────────────────┐
│  Verhalten                                  │
├─────────────────────────────────────────────┤
│  • Kontinuierliche Bewegung (Marquee-Stil)  │
│  • Geschwindigkeit: 30px/Sekunde            │
│  • Oder: Diskrete Schritte alle 4s          │
│  • Pausiert bei Hover/Touch                 │
│  • Respektiert prefers-reduced-motion       │
└─────────────────────────────────────────────┘
```

**Empfehlung:** Diskrete Schritte (card-by-card) statt kontinuierlicher Marquee. Gründe:
- Bessere Lesbarkeit
- Einfachere Swipe-Interaktion
- Weniger Motion Sickness

### 4.2 Tap zum Anhalten

```
User Action          System Response
─────────────────────────────────────────────
Tap auf Karussell    → Auto-Rotation pausiert
                     → Pause-Icon erscheint (⏸)
                     → Nach 8s ohne Input: Resume

Tap auf Pause-Icon   → Toggle Pause/Play
                     → Icon wechselt (⏸ ↔ ▶)
```

### 4.3 Swipe-Navigation

```
Swipe Left (←)       → Nächste Card gleitet rein
                     → Aktuelle Card gleitet nach links raus
                     → Easing: ease-out, 300ms
                     → Auto-Rotation resettet Timer

Swipe Right (→)      → Vorherige Card gleitet rein
                     → Aktuelle Card gleitet nach rechts raus
                     → Loop: Nach Card 1 kommt Card 5
```

**Touch-Feedback:**
- Cards folgen dem Finger während Drag (1:1 Mapping)
- Threshold für Commit: 40px oder 30% der Card-Breite
- Bei Abbruch: Snap-back mit elastic ease

### 4.4 Endlos-Loop

```
Logisches Modell:
[5] [1] [2] [3] [4] [5] [1]
     ↑
  Viewport

Bei Erreichen der Grenze:
• Instant-Jump ohne Animation
• User merkt den Reset nicht
```

Technische Umsetzung: 3 Kopien der Cards oder CSS scroll-snap mit JavaScript-Reset.

---

## 5. Technische Spezifikation

### 5.1 HTML-Struktur

```html
<div class="info-carousel" role="region" aria-label="Aktuelle Informationen">
  <button class="carousel-control pause" aria-label="Pausieren">
    <svg><!-- Pause/Play Icon --></svg>
  </button>

  <div class="carousel-viewport">
    <div class="carousel-track" id="carousel-track">
      <!-- Cards werden hier horizontal angeordnet -->
      <article class="carousel-card" data-type="weather">
        <span class="card-icon">☀️</span>
        <div class="card-content">
          <span class="card-value" id="weather-temp">--°</span>
          <span class="card-label">Starnberg</span>
        </div>
      </article>

      <article class="carousel-card" data-type="water">
        <span class="card-icon">💧</span>
        <div class="card-content">
          <span class="card-value">4°</span>
          <span class="card-label">Wassertemperatur</span>
        </div>
      </article>

      <article class="carousel-card" data-type="sun">
        <span class="card-icon">🌅</span>
        <div class="card-content">
          <span class="card-value" id="sun-times">--:-- – --:--</span>
          <span class="card-label">Sonne</span>
        </div>
      </article>

      <article class="carousel-card" data-type="train-munich">
        <span class="card-icon">🚆</span>
        <div class="card-content">
          <span class="card-value" id="train-munich">--:--</span>
          <span class="card-label">→ München</span>
        </div>
      </article>

      <article class="carousel-card" data-type="train-tutzing">
        <span class="card-icon">🚆</span>
        <div class="card-content">
          <span class="card-value" id="train-tutzing">--:--</span>
          <span class="card-label">→ Tutzing</span>
        </div>
      </article>
    </div>
  </div>

  <!-- Optional: Dot-Indikatoren -->
  <div class="carousel-dots" role="tablist">
    <button role="tab" aria-selected="true" aria-label="Wetter"></button>
    <button role="tab" aria-label="Wassertemperatur"></button>
    <button role="tab" aria-label="Sonnenzeiten"></button>
    <button role="tab" aria-label="S-Bahn München"></button>
    <button role="tab" aria-label="S-Bahn Tutzing"></button>
  </div>
</div>
```

### 5.2 CSS-Kernkonzept

```css
.info-carousel {
  display: none;  /* Nur mobile */
  position: relative;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-3) 0;
}

@media (max-width: 767px) {
  .info-carousel { display: block; }
}

.carousel-viewport {
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;  /* Firefox */
}

.carousel-viewport::-webkit-scrollbar {
  display: none;  /* Chrome/Safari */
}

.carousel-track {
  display: flex;
  gap: 12px;
  padding: var(--space-2) var(--space-5);
  width: max-content;
}

.carousel-card {
  scroll-snap-align: center;
  width: 140px;
  min-height: 64px;
  padding: 12px 16px;

  display: flex;
  align-items: center;
  gap: var(--space-3);

  background: var(--color-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);

  flex-shrink: 0;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
}

.carousel-card:active {
  cursor: grabbing;
}

.card-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;  /* Allow text truncation */
}

.card-value {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
}

.card-label {
  font-size: 0.6875rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### 5.3 JavaScript-Logik

```javascript
// Pseudo-Code für Kernfunktionalität

class InfoCarousel {
  constructor(element) {
    this.track = element.querySelector('.carousel-track');
    this.cards = [...this.track.querySelectorAll('.carousel-card')];
    this.currentIndex = 0;
    this.isPaused = false;
    this.autoplayInterval = null;
    this.AUTOPLAY_DELAY = 4000;

    this.initTouchHandling();
    this.initAutoplay();
    this.loadData();
  }

  // Scroll zu bestimmter Card
  scrollToCard(index) {
    const card = this.cards[index];
    if (!card) return;

    card.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });

    this.currentIndex = index;
    this.updateDots();
  }

  // Nächste Card (mit Loop)
  next() {
    const nextIndex = (this.currentIndex + 1) % this.cards.length;
    this.scrollToCard(nextIndex);
  }

  // Vorherige Card (mit Loop)
  prev() {
    const prevIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
    this.scrollToCard(prevIndex);
  }

  // Autoplay mit Reduced Motion Check
  initAutoplay() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return; // Kein Autoplay bei reduced motion
    }

    this.autoplayInterval = setInterval(() => {
      if (!this.isPaused) this.next();
    }, this.AUTOPLAY_DELAY);
  }

  // Touch/Swipe Handling
  initTouchHandling() {
    let startX = 0;
    let startScrollLeft = 0;

    this.track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].pageX;
      startScrollLeft = this.track.parentElement.scrollLeft;
      this.pause();
    }, { passive: true });

    this.track.addEventListener('touchend', (e) => {
      const diff = startX - e.changedTouches[0].pageX;

      if (Math.abs(diff) > 40) {
        diff > 0 ? this.next() : this.prev();
      }

      // Resume nach 8s
      this.resumeAfterDelay(8000);
    }, { passive: true });
  }

  pause() {
    this.isPaused = true;
    // UI Update...
  }

  resume() {
    this.isPaused = false;
    // UI Update...
  }

  resumeAfterDelay(ms) {
    setTimeout(() => {
      if (!this.userPaused) this.resume();
    }, ms);
  }
}
```

---

## 6. S-Bahn Daten-Handling

### 6.1 API-Abfrage für beide Richtungen

```javascript
async function loadTrainData() {
  const API = 'https://dbf.finalrewind.org/Possenhofen.json?version=3';

  try {
    const res = await fetch(API);
    const data = await res.json();
    const departures = data.departures || [];

    // Nur S-Bahnen, nicht gecancelt
    const sBahns = departures.filter(d =>
      !d.isCancelled &&
      d.train &&
      d.train.startsWith('S ')
    );

    // Richtung München (enthält "München" im Ziel)
    const toMunich = sBahns.find(d =>
      d.destination.includes('München') ||
      d.destination.includes('Pasing')
    );

    // Richtung Tutzing (alle anderen S-Bahnen)
    const toTutzing = sBahns.find(d =>
      d.destination.includes('Tutzing') ||
      d.destination.includes('Starnberg') ||
      !d.destination.includes('München')
    );

    return { toMunich, toTutzing };
  } catch (e) {
    console.error('Train API error:', e);
    return { toMunich: null, toTutzing: null };
  }
}
```

### 6.2 Anzeige-Format

```
┌─────────────────────────┐
│  🚆  14:32 +2           │  ← Zeit + Verspätung (falls > 0)
│  → München Pasing       │  ← Ziel (gekürzt)
└─────────────────────────┘

┌─────────────────────────┐
│  🚆  14:48              │
│  → Tutzing              │
└─────────────────────────┘
```

---

## 7. Accessibility

### 7.1 ARIA-Rollen

```html
<div role="region" aria-label="Aktuelle Informationen" aria-roledescription="Karussell">
  <div role="group" aria-label="Slide 1 von 5: Wetter">
    <!-- Card Content -->
  </div>
</div>
```

### 7.2 Keyboard-Navigation

| Taste | Aktion |
|-------|--------|
| `←` / `→` | Vorherige / Nächste Card |
| `Home` | Erste Card |
| `End` | Letzte Card |
| `Space` | Toggle Pause |

### 7.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .carousel-viewport {
    scroll-behavior: auto;
  }

  .carousel-card {
    transition: none;
  }

  /* Kein Autoplay via JS */
}
```

### 7.4 Screen Reader

- Live-Region für aktuelle Card: `aria-live="polite"`
- Pause-Status wird angesagt
- Dots als echte Tab-Navigation

---

## 8. Animationen & Timing

### 8.1 Scroll-Animation

```css
.carousel-viewport {
  scroll-behavior: smooth;
  /* Browser-native smooth scroll, ca. 300ms */
}
```

### 8.2 Card-Hover/Active States

```css
.carousel-card {
  transition:
    transform var(--duration-fast) ease,
    box-shadow var(--duration-fast) ease;
}

.carousel-card:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-md);
}
```

### 8.3 Timing-Konstanten

| Konstante | Wert | Verwendung |
|-----------|------|------------|
| `AUTOPLAY_DELAY` | 4000ms | Zeit zwischen Auto-Scrolls |
| `RESUME_DELAY` | 8000ms | Zeit bis Auto-Resume nach Touch |
| `SCROLL_DURATION` | ~300ms | Browser smooth scroll |
| `SWIPE_THRESHOLD` | 40px | Minimum für Swipe-Commit |

---

## 9. Edge Cases

### 9.1 Nur 1-2 Cards sichtbar

Falls Viewport sehr schmal:
- Cards behalten feste Breite (140px)
- Mehr Anschnitt der Nachbar-Cards

### 9.2 API-Fehler

```
┌─────────────────────────┐
│  ☀️  –                  │
│  Laden fehlgeschlagen   │
└─────────────────────────┘
```

- Graceful degradation: Statische Fallback-Werte
- Keine leeren Cards anzeigen

### 9.3 Landscape Mode

```css
@media (max-width: 767px) and (orientation: landscape) {
  .carousel-card {
    min-height: 56px;  /* Kompakter */
    padding: 8px 14px;
  }
}
```

---

## 10. Zusammenfassung

### Was ändert sich?

| Vorher | Nachher |
|--------|---------|
| Fade-Animation | Horizontales Scrollen |
| 4 Slides | 5 Cards (S-Bahn aufgeteilt) |
| Absolute Position | Flexbox + scroll-snap |
| Nur München-S-Bahn | München + Tutzing |
| Dots als Haupt-Nav | Swipe als Haupt-Nav |

### Implementierungs-Priorität

1. **P0:** Horizontales Scroll-Layout mit Cards
2. **P0:** S-Bahn beide Richtungen
3. **P1:** Auto-Rotation mit Tap-to-Pause
4. **P1:** Swipe-Navigation
5. **P2:** Endlos-Loop
6. ~~**P2:** Dots-Indikator~~ → ENTSCHIEDEN: Keine Dots

---

## 11. Entscheidungen (03.02.2026)

### ✅ Geklärt:

1. **Dots:** ~~Weglassen~~ → Keine Dots. Cards sind selbst sichtbar, Swipe ist primary navigation.

2. **Card-Breite:** **Responsive** → `calc((100vw - 60px) / 2)` zeigt ~2 Cards pro Screen, oder `min(140px, calc(100vw - 80px))` für flexible Anpassung.

3. **Wassertemperatur-API:** ✅ **GKD Bayern**
   - **URL:** `https://www.gkd.bayern.de/de/seen/wassertemperatur/isar/starnberg-16663002/messwerte/tabelle`
   - **Station-ID:** Starnberg `16663002`
   - **Format:** HTML-Tabelle (scrapen, kein JSON-API)
   - **Update-Intervall:** Alle 15 Minuten neue Messwerte
   - **Parsing:** Erste Zeile der Tabelle = aktuellster Wert
   - **Lizenz:** CC BY 4.0 (Namensnennung erforderlich)

### Offen:

4. **Wetter-Kondition anzeigen?** Aktuell nur Temperatur. Optional: "Sonnig", "Bewölkt" etc. als Text.
