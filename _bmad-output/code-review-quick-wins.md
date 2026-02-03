# Code-Review: Starnberg Events Quick Wins

**Projekt:** starnberg-events  
**Reviewer:** BMAD Adversarial Code-Review  
**Datum:** 2026-02-03  
**Commit:** HEAD vs HEAD~1

---

## Executive Summary

**Geänderte Dateien:** 4 Core-Files (+ 277 BMAD-Config)
- `src/components/FilterBar.astro` - Clear Button
- `src/components/InfoTicker.astro` - Pause on Hover
- `src/layouts/Layout.astro` - Skip Link + Resource Hints
- `src/pages/index.astro` - main-content ID

**Gefundene Issues:** 12 (3 KRITISCH, 6 WARNUNG, 3 HINWEIS)

**Compliance-Status:**
- ✅ Resource Hints korrekt implementiert
- ✅ Skip Link grundsätzlich richtig
- ⚠️ **REGEL-VERSTÖSSE:** `!important` & Inline Styles
- ⚠️ **WCAG-VERSTÖSSE:** Touch Targets, Carousel Pause, Keyboard Access

---

## KRITISCH: Muss gefixt werden

### 1. ❌ `!important` Nutzung in FilterBar (REGEL-VERSTOSS)

**Datei:** `FilterBar.astro:168-170`

```css
.clear-filters[style*="display: flex"] {
  display: flex !important;
}
```

**Problem:**  
- **project-context.md Regel:** "Keine !important (außer Accessibility)"
- Hier wird `!important` für Layout-Logic genutzt, nicht für A11y
- Dirty Hack um Inline-Style zu überschreiben

**Root Cause:**  
Der eigentliche Fehler ist Zeile 35 - inline `style="display: none;"`

**Fix:**  
```astro
<!-- HTML: Keine inline styles -->
<button class="clear-filters" id="clear-filters">

<style>
  .clear-filters {
    display: none; /* Default hidden */
  }
  
  .clear-filters.visible {
    display: flex; /* Toggled via class */
  }
</style>

<script>
  function updateClearButton() {
    const hasActiveFilters = ...;
    clearBtn?.classList.toggle('visible', hasActiveFilters);
  }
</script>
```

**Severity:** KRITISCH - Verletzt Core-Regel des Projekts

---

### 2. ❌ InfoTicker Dots - Touch Target zu klein (WCAG 2.5.5)

**Datei:** `InfoTicker.astro:119-131`

```css
.dot {
  width: 6px;
  height: 6px;
  /* ... */
}
```

**Problem:**  
- **project-context.md Regel:** "Touch Targets min 44px"
- **WCAG 2.5.5:** Minimum 44x44 CSS pixels
- Aktuelle Size: 6x6px = nicht nutzbar auf Touch-Geräten!

**Lösung aus Tech-Spec (Sektion 3.5):**
```css
.dot {
  width: 8px;
  height: 8px;
  padding: 18px; /* Touch area = 44px */
  margin: -18px var(--space-1); /* Visual spacing erhalten */
  border-radius: 50%;
  /* ... */
}
```

**Severity:** KRITISCH - WCAG Violation, unbrauchbar auf Mobile

---

### 3. ❌ Memory Leak: Interval nicht aufgeräumt

**Datei:** `InfoTicker.astro:146` & `TrainInfo.astro` & `FerryInfo.astro`

**Problem:**  
```javascript
let autoplayInterval = null;

function startAutoplay() {
  if (autoplayInterval) clearInterval(autoplayInterval);
  autoplayInterval = setInterval(nextSlide, 4000);
}

// ❌ FEHLT: Cleanup bei Navigation!
```

**Fehlender Code:**
```javascript
window.addEventListener('pagehide', () => {
  if (autoplayInterval) clearInterval(autoplayInterval);
});
```

**Impact:**  
- Bei SPA-Navigation oder Prefetch läuft Interval weiter
- Multiple Intervals bei schnellem Back/Forward
- Browser-Ressourcen werden nicht freigegeben

**Severity:** KRITISCH - Memory Leak in Production

---

## WARNUNG: Sollte gefixt werden

### 4. ⚠️ Inline Styles in HTML (REGEL-VERSTOSS)

**Datei:** `FilterBar.astro:35`

```html
<button class="clear-filters" id="clear-filters" style="display: none;">
```

**Problem:**  
- **project-context.md Anti-Pattern #5:** "Keine Inline Styles in Templates"
- Sollte via CSS-Klasse gesteuert werden (siehe Fix bei Issue #1)

**Severity:** WARNUNG - Code-Style Violation

---

### 5. ⚠️ Carousel Pause fehlt für Touch Users (WCAG 2.2.2)

**Datei:** `InfoTicker.astro:237-247`

```javascript
// Pause on hover
carousel.addEventListener('mouseenter', function() {
  isPaused = true;
});
```

**Problem:**  
- **WCAG 2.2.2:** "Moving content must be pausable by user"
- Hover funktioniert nur auf Desktop mit Maus
- **Touch Users haben KEINE Möglichkeit zu pausieren!**

**Lösung (aus Tech-Spec 3.3):**
```javascript
// Option A: Pause bei Touch/Long-press
carousel.addEventListener('touchstart', handleTouchStart);
carousel.addEventListener('touchend', handleTouchEnd);

// Option B: Explicit Pause-Button (besser!)
<button class="carousel-pause" aria-label="Automatisches Wechseln pausieren">
  <svg><!-- Pause Icon --></svg>
</button>
```

**Current Workaround:** User kann Dots manuell bedienen  
**Aber:** Das erfüllt WCAG nicht!

**Severity:** WARNUNG - WCAG 2.2.2 Level A Violation

---

### 6. ⚠️ Keine focus-visible für Clear Button

**Datei:** `FilterBar.astro:149-176`

**Problem:**  
Clear Button hat keine `:focus-visible` Styles definiert

**project-context.md Regel:**
```css
button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

**Aktuell:** Nur `:hover` und `:active`, kein `:focus-visible`

**Fix:**
```css
.clear-filters:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.clear-filters:focus:not(:focus-visible) {
  outline: none;
}
```

**Severity:** WARNUNG - Keyboard Navigation beeinträchtigt

---

### 7. ⚠️ Keine ARIA Live Region für Filter-Count

**Datei:** `FilterBar.astro` - Script Zeile 307

```javascript
if (countEl) countEl.textContent = String(count);
updateClearButton();
```

**Problem:**  
Screen Reader bekommen Filter-Änderungen nicht mit

**Tech-Spec Empfehlung (3.6):**
```html
<div id="filter-status" aria-live="polite" class="sr-only"></div>
```

```javascript
function filterEvents() {
  // ... count logic ...
  if (countEl) countEl.textContent = String(count);
  
  // ✅ Screen Reader Feedback
  const statusEl = document.getElementById('filter-status');
  if (statusEl) {
    statusEl.textContent = `${count} Veranstaltungen gefunden`;
  }
  
  updateClearButton();
}
```

**Severity:** WARNUNG - Screen Reader Support fehlt

---

### 8. ⚠️ SVG Icons ohne aria-hidden

**Datei:** `FilterBar.astro:37-39`

```html
<svg class="clear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <path d="M3 6h18M19 6v14..."/>
</svg>
```

**Problem:**  
Decorative SVGs sollten `aria-hidden="true"` haben

**Fix:**
```html
<svg aria-hidden="true" class="clear-icon" viewBox="0 0 24 24">
```

**Severity:** WARNUNG - Screen Reader verbosity

---

### 9. ⚠️ reduced-motion wird nicht konsequent umgesetzt

**Datei:** `InfoTicker.astro:163`

```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!isPaused && !prefersReducedMotion) {
  showSlide((currentSlide + 1) % totalSlides);
}
```

**Problem:**  
Auto-Advance wird verhindert, ABER:

```css
.carousel-slide {
  /* ❌ Animation läuft trotzdem! */
  transition: opacity 0.3s ease, transform 0.3s ease;
}
```

**Fix in CSS:**
```css
@media (prefers-reduced-motion: reduce) {
  .carousel-slide {
    transition: none;
  }
}
```

**Severity:** WARNUNG - reduced-motion unvollständig

---

## HINWEIS: Nice-to-have

### 10. 💡 ESC-Key für Clear Filters

**Datei:** `FilterBar.astro` - Script

**Empfehlung:**
```javascript
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && hasActiveFilters) {
    clearAllFilters();
  }
});
```

**Benefit:** Power-User Shortcut

**Severity:** HINWEIS - UX Enhancement

---

### 11. 💡 Skip Link position bei kleinen Viewports

**Datei:** `Layout.astro:291-312`

```css
.skip-link {
  top: calc(-1 * var(--touch-target-min)); /* -44px */
}

.skip-link:focus {
  top: var(--space-4); /* 16px */
}
```

**Problem:**  
Bei sehr kleinen Viewports (<320px) könnte Overlap mit Header entstehen

**Verbesserung:**
```css
.skip-link:focus {
  top: env(safe-area-inset-top, var(--space-4));
}
```

**Severity:** HINWEIS - Edge Case

---

### 12. 💡 Swipe-Threshold als Konstante

**Datei:** `InfoTicker.astro:265`

```javascript
if (Math.abs(diff) > 50) { // Magic Number!
```

**project-context.md:** "NIEMALS Magic Numbers"

**Fix:**
```javascript
const SWIPE_THRESHOLD = 50; // px minimum für swipe recognition

if (Math.abs(diff) > SWIPE_THRESHOLD) {
```

**Severity:** HINWEIS - Code-Style

---

## ✅ Was gut gemacht wurde

1. **Resource Hints korrekt implementiert**  
   - `dns-prefetch` + `preconnect` für externe APIs
   - Performance-Verbesserung 100-300ms (Tech-Spec 1.2)

2. **Skip Link funktioniert**  
   - Semantisch korrekt mit `<a href="#main-content">`
   - Focus-State gut sichtbar
   - Keyboard-accessible

3. **main-content ID hinzugefügt**  
   - Sauberer Landmark für Skip Link
   - Semantic HTML

4. **Pause on Hover funktioniert**  
   - `isPaused` State korrekt implementiert
   - reduced-motion wird geprüft (wenn auch unvollständig)

5. **Clear Button UX**  
   - Zeigt sich nur bei aktiven Filtern (conditional rendering)
   - Icon + Text kombiniert (gut für Verständnis)

6. **CSS Custom Properties konsequent genutzt**  
   - Kein hardcodiertes Padding/Spacing
   - `var(--space-*)` durchgängig verwendet

---

## Zusammenfassung: Fix-Priorität

### 🔴 Phase 1: KRITISCH (sofort)
1. `!important` + Inline Styles entfernen → CSS-Klassen
2. Touch Targets für Dots auf 44px erhöhen
3. Memory Leak: Interval Cleanup hinzufügen

### 🟡 Phase 2: WARNUNG (vor Production)
4. Carousel Pause für Touch Users (Button hinzufügen)
5. focus-visible für Clear Button
6. ARIA live region für Filter-Status
7. SVG icons mit aria-hidden
8. reduced-motion CSS hinzufügen

### 🔵 Phase 3: HINWEIS (wenn Zeit)
9. ESC-Key Shortcut
10. Skip Link safe-area-inset
11. Magic Number in Konstante

---

## Test-Plan

**Vor Merge:**
- [ ] Browser DevTools: Button hat 44px min height
- [ ] Mobile Device: Dots sind klickbar
- [ ] Tab-Navigation: Clear Button bekommt Focus-Ring
- [ ] Screen Reader: Filter-Änderungen werden angesagt
- [ ] Slow 3G: Interval läuft nicht ins Leere bei Navigation

**Build-Test:**
```bash
cd ~/clawd/starnberg-events && npm run build
```
→ Muss ohne Warnings durchlaufen

---

**Review abgeschlossen:** 2026-02-03 23:09 CET  
**Next Steps:** Issues beheben, dann Merge in main
