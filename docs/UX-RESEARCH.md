# UX Research: Mobile Web Best Practices 2024/2025

> Tiefe Recherche für Starnberg Events Website
> Erstellt: 2026-02-03

## Quellen

Diese Erkenntnisse basieren auf echten Artikeln von:
- **Nielsen Norman Group** (nngroup.com) - Mobile UX, Touch Targets, Skeleton Screens, Dark Mode, Cards, Hamburger Menus
- **Google Web.dev** - Core Web Vitals, LCP, CLS, INP
- **Apple Human Interface Guidelines**
- **Material Design 3**

---

## 1. Touch-Interaktionen

### Touch Target Sizes (NNGroup)
**Quelle:** "Touch Targets on Touchscreens" - nngroup.com

> "Interactive elements must be at least 1cm × 1cm (0.4in × 0.4in) to support adequate selection time and prevent fat-finger errors."

**Wichtige Erkenntnisse:**
- **Minimum: 1cm × 1cm** (physisch!) ≈ **44-48px** auf typischen Bildschirmen
- Durchschnittliche Fingerkuppe: 1.6–2cm breit
- Durchschnittlicher Daumen: 2.5cm breit
- **Fitts' Law:** Kleinere Targets = längere Erreichungszeit + mehr Fehler

**Thumb Zones:**
- Unterer Bildschirmbereich ist am einfachsten erreichbar mit dem Daumen
- Obere Ecken sind "stretch zones" - schwer erreichbar
- FAB (Floating Action Button) unten mittig = optimale Position ✅

**Spacing zwischen Targets:**
- Mindestens 8px zwischen interaktiven Elementen
- Bei gegensätzlichen Aktionen (Accept/Decline): noch mehr Abstand

### View-Tap Asymmetry
> "View–tap asymmetry occurs when elements are large enough to be seen but too small or densely packed to select without struggling."

**Problem:** Desktop-Designs werden oft 1:1 auf Mobile übertragen - funktioniert nicht!

---

## 2. Navigation

### Hamburger Menus (NNGroup)
**Quelle:** "Hamburger Menus and Hidden Navigation Hurt UX Metrics"

**Fakten aus der Studie:**
- Versteckte Navigation wird **27%** der Zeit genutzt (Desktop)
- Sichtbare Navigation wird **48-50%** der Zeit genutzt
- **Discoverability sinkt um fast 50%** bei versteckter Navigation
- Task-Schwierigkeit steigt um **21%**

**Empfehlung:**
- Auf Mobile: Bottom Navigation oder sichtbare Tab Bars bevorzugen
- Hamburger nur für sekundäre Navigation
- Kombination: Wichtigste Items sichtbar + "Mehr" Button für Rest

### Mobile-First vs Mobile-Only
> "Mobile-first should not equal mobile-only."

---

## 3. Loading & Performance

### Core Web Vitals (Google)
**Quelle:** web.dev/articles/vitals

**Die 3 Metriken:**
| Metrik | Gut | Beschreibung |
|--------|-----|--------------|
| **LCP** | ≤ 2.5s | Largest Contentful Paint - Hauptinhalt geladen |
| **INP** | ≤ 200ms | Interaction to Next Paint - Reaktionszeit |
| **CLS** | ≤ 0.1 | Cumulative Layout Shift - Visuelle Stabilität |

### LCP Optimierung
**Die 4 Subparts:**
1. **TTFB** (~40%) - Time to First Byte
2. **Resource Load Delay** (<10%) - Zeit bis LCP-Resource lädt
3. **Resource Load Duration** (~40%) - Ladezeit der Resource
4. **Element Render Delay** (<10%) - Zeit bis Rendering

**Empfehlungen:**
- LCP-Resource sollte **im HTML entdeckbar** sein (nicht erst per JS laden)
- `<link rel="preload">` für wichtige Ressourcen
- Bilder mit Dimensionen angeben (verhindert CLS)

### Skeleton Screens (NNGroup)
**Quelle:** "Skeleton Screens 101"

> "Skeleton screens help the user understand that the page is loading, while also communicating what the page will look like."

**Wann verwenden:**
- Ladezeit 2-10 Sekunden
- Ganzseitige Loads
- NICHT für schnelle Loads (<1s) - nervt nur

**Typen:**
1. **Static Content Skeleton:** Graue Boxen die Layout zeigen ✅ Best
2. **Animated Skeleton:** Shimmer-Effekt (links→rechts pulsieren)
3. **Frame Display:** Nur Header/Footer - **NICHT empfohlen**

**Vorteile:**
- Verhindert "ist kaputt?" Gefühl
- Schafft Illusion kürzerer Wartezeit
- Reduziert kognitive Last

### CLS (Cumulative Layout Shift)
**Quelle:** web.dev/articles/cls

**Ursachen:**
- Bilder ohne Dimensionen
- Ads/Embeds die nachladen
- Dynamisch eingefügter Content
- Web Fonts (FOIT/FOUT)

**Vermeidung:**
```css
/* CSS transform statt position ändern */
transform: translateY(-2px); /* ✅ Kein Layout Shift */
top: -2px; /* ❌ Layout Shift */
```

---

## 4. Mikrointeraktionen

### Touch Feedback
**Best Practices:**
- **Immediate visual feedback** bei Touch (opacity change, scale)
- Feedback innerhalb **100ms** nach Interaktion
- Subtil aber wahrnehmbar

**CSS Beispiel:**
```css
.button {
  transition: transform 0.1s ease, opacity 0.1s ease;
}
.button:active {
  transform: scale(0.97);
  opacity: 0.9;
}
```

### Animations
- **Dauer:** 150-300ms für UI-Animationen
- **Easing:** `ease-out` für Entrance, `ease-in` für Exit
- **Respect `prefers-reduced-motion`**

---

## 5. Typografie

### Mobile-optimierte Schriftgrößen
- **Body text:** Minimum 16px (iOS default)
- **Headlines:** Proportional größer, aber nicht übertreiben
- **Line-height:** 1.4-1.6 für Lesbarkeit
- **Touch-Links in Text:** Ausreichend Padding

### Kontrast
- WCAG AA: **4.5:1** für normalen Text
- WCAG AA: **3:1** für großen Text (18pt+)
- Besonders wichtig bei hellem Außenlicht

---

## 6. Dark Mode

### NNGroup Erkenntnisse
**Quelle:** "Dark Mode vs. Light Mode: Which Is Better?"

**Fakten:**
- **Light Mode ist besser** für visuelle Performanz bei normalem Sehen
- Kleinere Schrift → Light Mode noch wichtiger
- Nachts/bei wenig Umgebungslicht: Unterschied geringer
- Langzeit-Nutzung von Light Mode möglicherweise mit Myopie verbunden

**Empfehlung:**
> "We strongly recommend that designers allow users to switch to dark mode."

**Implementation:**
- System-Präferenz respektieren: `prefers-color-scheme`
- Manuellen Toggle anbieten
- Speichern der Präferenz in localStorage

---

## 7. Cards & Listen

### Cards (NNGroup)
**Quelle:** "Cards: UI-Component Definition"

**Wann Cards verwenden:**
✅ Heterogene Inhalte (verschiedene Typen gemischt)
✅ Browsing-Verhalten (Entdecken)
✅ Dashboards mit verschiedenen Widgets
✅ Größere Touch-Targets benötigt

**Wann NICHT:**
❌ Wenn Nutzer nach spezifischem Item suchen
❌ Wenn Vergleiche zwischen Items wichtig sind
❌ Bei homogenen Listen (alle Items gleich)

**Card Design Best Practices:**
- Gesamte Card klickbar (großes Touch-Target)
- Visuell deutlich abgegrenzt (Border, Shadow, Background)
- Sekundäre Actions klar getrennt

### Infinite Scroll vs. Pagination
**Quelle:** "Infinite Scrolling: When to Use It, When to Avoid It"

**Infinite Scroll Vorteile:**
- Weniger Unterbrechung
- Geringere Interaktionskosten
- Gut für Mobile (Swiping ist natürlich)

**Infinite Scroll Nachteile:**
- Schwer, Content wiederzufinden
- Footer unerreichbar
- Illusion of Completeness
- Accessibility-Probleme
- Langsame Page Loads

**Beste Lösung: "Load More" Button**
- Kombiniert Vorteile beider Ansätze
- User hat Kontrolle
- Footer erreichbar
- Position wird gespeichert

---

## 8. Overlays & Bottom Sheets

### Bottom Sheets für Mobile
- Besser als zentrierte Modals (näher am Daumen)
- Swipe-to-dismiss (natürliche Geste)
- Teil des Screens sichtbar (Kontext bleibt)

### Modal Best Practices (NNGroup)
**Quelle:** "Overuse of Overlays"

- **Expliziter Close-Button** (nicht nur Overlay-Klick)
- **Escape-Taste** muss funktionieren
- Bei Formularen: Daten speichern bei versehentlichem Schließen
- **Back-Button** sollte Modal schließen, nicht navigieren

---

## 9. Accessibility

### Touch Accessibility
- Touch Targets: 44×44px minimum (Apple HIG)
- Genug Abstand zwischen Targets
- Keine hover-only Interaktionen
- Focus states deutlich sichtbar

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Screen Reader Support
- Semantisches HTML
- ARIA labels für Icon-only Buttons
- Live regions für dynamische Updates

---

## 10. Zusammenfassung: Prioritäten

### High Impact, Low Effort
1. **Touch Targets ≥ 44px** überall
2. **Touch Feedback** (scale/opacity on active)
3. **System Dark Mode** Support
4. **Font Sizes** ≥ 16px für Body

### High Impact, Medium Effort
5. **Skeleton Screens** für Listen/Cards
6. **prefers-reduced-motion** respektieren
7. **CLS vermeiden** (feste Dimensionen)

### Nice to Have
8. Custom Dark Mode Toggle
9. Haptic Feedback (wo verfügbar)
10. Animierte Skeleton Screens (Shimmer)

---

## Angewandt auf Starnberg Events

### Aktuelle Stärken ✅
- Bottom Sheet für Mobile Filter (optimal!)
- FAB Position unten mittig (perfekt für Thumb Zone)
- Card-basiertes Layout (gut für heterogene Events)
- Collapsible Sections mit State-Persistence
- Weather Widget mit Loading State

### Verbesserungspotential 🔧
1. **Touch Targets:** Einige Chips/Icons unter 44px
2. **Skeleton Screens:** Keine - Event-Liste hat keinen Loading State
3. **Dark Mode:** Nicht implementiert
4. **Touch Feedback:** Nur hover, kein :active State
5. **Reduced Motion:** Nicht berücksichtigt
6. **CLS:** Event Cards haben keine feste Höhe

### Implementierungsplan
1. Touch Targets auf 44px erhöhen
2. :active States mit scale/opacity hinzufügen  
3. Skeleton Screens für Event-Liste
4. Dark Mode mit System-Preference
5. prefers-reduced-motion Media Query
6. min-height für Cards (CLS Prevention)
