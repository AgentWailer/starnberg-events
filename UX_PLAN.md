# UX-Verbesserungsplan: Starnberg Events Desktop

**KERN-PROBLEM:** Wochenend-Highlights auf Desktop (1440px) sind unleserlich!

---

## ⚡ TL;DR - Quick Fix

```css
/* In deinem CSS: */
@media (min-width: 1024px) {
  .weekend-highlights .event-grid {
    grid-template-columns: repeat(3, 1fr); /* ← Ändere 4 zu 3 */
  }
}
```

**Resultat:** Titel von "Nä... W..." → vollständig lesbar in 5 Minuten! ✅

→ Für die beste Lösung lies weiter (45 Min Arbeit, perfekte UX)

---

## Problem
- 4 Spalten bei 1240px Content-Breite = ~310px/Card
- Card-intern: Datum (60px) + Body (210px) + Pfeil (40px)
- 210px Body → Titel unleserlich, Heart-Button überlappt

---

## ✅ Lösung 1A: 3-Spalten Grid (HOTFIX - 5 MINUTEN)

**Was ändern:**

```css
/* Bestehende Highlights-Grid anpassen */
.weekend-highlights .event-grid {
  grid-template-columns: repeat(2, 1fr); /* Mobile */
}

@media (min-width: 1024px) {
  .weekend-highlights .event-grid {
    grid-template-columns: repeat(3, 1fr); /* Desktop: 3 statt 4! */
    gap: 1.5rem;
  }
}

@media (min-width: 1600px) {
  /* Erst bei sehr großen Screens 4 Spalten */
  .weekend-highlights .event-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

**Rechnung:**
- Content: 1240px
- 3 Spalten + Gaps: (1240px - 2×24px) / 3 = **~397px pro Card**
- Card Body: 397px - 60px (Datum) - 40px (Pfeil) = **~297px** ✅
- **+87px mehr Platz** für Titel = Lesbarkeit wiederhergestellt

**Priorität: P1** (QUICK WIN - kritisch, sofort umsetzbar)

---

## ✨ Lösung 1B: Kompakte Highlight-Cards (BESTE UX - 45 MIN)

**Neue Card-Struktur nur für Highlights - Flexbox statt Grid:**

```html
<article class="weekend-card">
  <div class="weekend-card__header">
    <time>Sa<br>14:00</time>
    <span class="category-badge">Kultur</span>
  </div>
  <h3 class="weekend-card__title">VHS Gilching - Bairisch für Anfänger</h3>
  <div class="weekend-card__location">📍 Gilching, VHS</div>
  <button class="weekend-card__favorite">♡</button>
</article>
```

**Key CSS:**
```css
.weekend-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.weekend-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  position: relative;
  /* KEIN internes Grid! */
}

.weekend-card__title {
  /* KEIN line-clamp - volle Lesbarkeit! */
  min-height: 2.8em;
}

.weekend-card__favorite {
  position: absolute;
  top: 1rem;
  right: 1rem;
  /* Kein Overlap mehr! */
}
```

**Vorteile:**
- Titel voll lesbar (kein line-clamp)
- Heart-Button absolut positioniert (kein Overlap)
- Visuell distinct von normalen Cards
- Nur 3 Events zeigen (kuratiert)

**Aufwand:** Neue Component `WeekendHighlights.astro` (~45 Min)

---

## 🗑️ Lösung 1C: Highlights entfernen (FALLBACK)

- Gradient-Box komplett löschen
- Nur "Wochenende"-Filter behalten
- **Vorteil:** 0 Arbeit, keine Dopplungen
- **Nachteil:** Weniger prominent

**Priorität: P2** (nur wenn 1A/1B nicht passen)

---

## 2. Event-Liste: Tagesgruppen

**Problem:** 91 Events = flache Liste ohne Orientierung

**Lösung:** Sticky Day-Headers

```html
<div class="day-group">
  <h3 class="day-header">Heute • Mittwoch, 4. Feb</h3>
  <div class="day-events">
    <article class="event-card">...</article>
  </div>
</div>
```

```css
.day-header {
  position: sticky;
  top: 0;
  background: white;
  color: var(--color-primary);
  padding: 0.75rem 1rem;
  border-bottom: 2px solid var(--color-primary);
  z-index: 10;
}
```

**Astro:**
```js
const eventsByDay = events.reduce((acc, event) => {
  const day = formatDate(event.date, 'YYYY-MM-DD');
  if (!acc[day]) acc[day] = [];
  acc[day].push(event);
  return acc;
}, {});
```

**Priorität: P1** (massiver UX-Gewinn)

---

## 3. Event-Cards: Optimierung

### 3.1: Card-Body breiter

```css
.event-card__date {
  min-width: 50px; /* war 60px */
}
.event-card__arrow {
  width: 32px; /* war 40px */
}
```
**+18px für Body** = Titel besser lesbar  
**Priorität: P2**

### 3.2: Tag-Hierarchie

```css
/* Art-Tags dezenter */
.event-tags-secondary {
  opacity: 0.6;
  font-size: 0.75rem;
}

/* Desktop: Erst bei Hover */
@media (min-width: 1024px) {
  .event-card:not(:hover) .event-tags-secondary {
    display: none;
  }
}
```

**Weniger visueller Noise** = Titel dominiert  
**Priorität: P2**

---

## 4. Sidebar schmaler (Optional)

```css
.content-wrapper {
  grid-template-columns: 160px 1fr; /* war 200px */
}
```

**+40px für Event-Cards**, nur wenn Sidebar Whitespace verschwendet  
**Priorität: P3**

---

## Umsetzungs-Roadmap

### 🔥 Hotfix (5 Min)
```css
@media (min-width: 1024px) {
  .weekend-highlights .event-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Sprint 1 (2-3h) - Desktop-Fix
1. ✅ Kompakte Weekend-Cards (Lösung 1B)
2. ✅ Tagesgruppen (Lösung 2)
3. ✅ Dopplungen entfernen

### Sprint 2 (1-2h) - Polish
4. ✅ Card-Body breiter (3.1)
5. ✅ Tag-Hierarchie (3.2)
6. ⭕ Sidebar schmaler (4) - optional

---

## Testing-Checkliste

**Desktop (PRIORITÄT!):**
- [ ] 1440px: Weekend-Titel vollständig lesbar?
- [ ] Kein Heart-Button Overlap?
- [ ] 3-Spalten-Grid passt?
- [ ] 1920px: Nicht zu breit?

**Dark Mode:**
- [ ] Weekend-Gradient-Text lesbar?
- [ ] Kontraste OK?

---

## 🎯 Prioritäten

| Priorität | Was | Aufwand |
|-----------|-----|---------|
| 🔥 P1 | Lösung 1A (3 Spalten) | 5 Min |
| ⭐ P1 | Lösung 1B (Kompakte Cards) | 45 Min |
| ⭐ P1 | Lösung 2 (Tagesgruppen) | 1-2h |
| 📊 P2 | Lösung 3 (Card-Optimierung) | 30 Min |
| ✨ P3 | Lösung 4 (Sidebar) | 15 Min |

---

## 📋 Code-Snippet für Hotfix

**Datei:** `src/styles/events.css` (oder wo Weekend-Grid-Styles sind)

```css
/* VORHER */
@media (min-width: 1024px) {
  .weekend-highlights .event-grid {
    grid-template-columns: repeat(4, 1fr); /* ❌ Problem */
  }
}

/* NACHHER */
@media (min-width: 1024px) {
  .weekend-highlights .event-grid {
    grid-template-columns: repeat(3, 1fr); /* ✅ Fix */
    gap: 1.5rem;
  }
}

/* Optional: Erst bei sehr großen Screens 4 Spalten */
@media (min-width: 1600px) {
  .weekend-highlights .event-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

**Commit:** `fix(desktop): reduce weekend grid to 3 columns for readability`

**Test:** Browser auf 1440px → Weekend-Sektion checken → Titel lesbar? ✅

---

## Zusammenfassung

**Hauptproblem gelöst:**
Desktop 4-Spalten-Grid → Weekend-Card-Titel unleserlich ("Nä... W...")

**Empfohlener Weg:**

1. **JETZT (5 Min):** Hotfix 1A deployen → Sofort lesbar! ✅
2. **DANN (45 Min):** Lösung 1B → Perfekte UX ✨
3. **SPÄTER (1-2h):** Tagesgruppen → Scannability 📊

**Erwartete Verbesserungen:**
- 🖥️ **Desktop Lesbarkeit:** von "Nä... W..." zu vollen Titeln
- 📊 **Scannability:** von flacher 91-Event-Liste zu Tagesgruppen
- ✨ **Visuell:** Highlights distinct von Haupt-Liste

---

**Der Hotfix ist copy-paste-ready! 5 Minuten und das Problem ist gelöst.** 🚀
