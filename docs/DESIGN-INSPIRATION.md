# Design Inspiration - Starnberg Events

## Top 10 Event/Lifestyle Web Designs

### 1. Fever (feverup.com) ⭐⭐⭐⭐⭐
**Warum es gut ist:**
- **Hero:** Großes "Experience your city" mit prominentem City-Selector
- **Typografie:** Clean, serifenlose Font mit klarer Hierarchie
- **Cards:** Video-Preview Cards mit Overlay-Text, minimale Borders
- **Farbpalette:** Weiß/Schwarz dominant, Akzentfarbe nur für CTAs
- **Spacing:** Großzügiger Whitespace, atmende Layouts

**Key Takeaways:**
- Einfache, klare Navigation
- "Find your city" als primärer CTA
- Vertrauen durch App-Store Ratings
- Video-Previews für Engagement

---

### 2. Time Out (timeout.com) ⭐⭐⭐⭐⭐
**Warum es gut ist:**
- **Editorial Style:** Magazin-artige Layouts mit starker Typografie
- **Farbpalette:** Rot (#E61E14) als starke Akzentfarbe auf Weiß
- **Cards:** Image-first Cards mit Category-Tags
- **Grid:** Asymmetrisches Grid für visuelles Interesse

**Key Takeaways:**
- Category-Badges oben links
- Starke Headlines
- "Trending" Sections
- Clean Footer mit klarer Struktur

---

### 3. Eventbrite (eventbrite.com) ⭐⭐⭐⭐
**Warum es gut ist:**
- **Tabs:** "All / For you / Today / This weekend" für schnelle Filter
- **Card Design:** Konsistente Cards mit Image, Title, Date, Location, Price
- **Status Badges:** "Almost full", "Going fast" für Urgency
- **Category Icons:** Farbige Icons für Music, Nightlife, Arts etc.

**Key Takeaways:**
- Location-based Browsing prominent
- "Promoted" Badge für gesponserte Events
- Price Range Display (From €X)
- Horizontale Category-Scroll

---

### 4. Airbnb Experiences ⭐⭐⭐⭐⭐
**Warum es gut ist:**
- **Rating System:** Sterne + Numerische Bewertung (4.96)
- **Price Display:** "Ab X € pro Gast/Gruppe"
- **Category Labels:** "Kulturelle Touren", "Outdoor", "Kochen"
- **Host Info:** "Private:r Gastgeber:in" Badge
- **Carousel:** Horizontales Scrollen mit "Beliebt" Badge

**Key Takeaways:**
- Soft, rounded corners (16px)
- Wishlist Heart-Button
- Duration-Info direkt sichtbar
- "Beliebt" Badge für Social Proof

---

### 5. Godly.website ⭐⭐⭐⭐⭐
**Warum es gut ist:**
- **Minimalism:** Extreme Reduktion auf das Wesentliche
- **Grid:** Masonry-style Grid für Variety
- **Hover Effects:** Subtile Scale + Shadow on Hover
- **Typography:** Kleine, elegante Labels

**Key Takeaways:**
- Schwarz/Weiß Basis, Farbe durch Content
- Sehr kleine Border-Radii oder keine
- Consistent Card-Format
- Focus auf Bildmaterial

---

### 6. Stripe Sessions ⭐⭐⭐⭐
**Warum es gut ist:**
- **Gradient Backgrounds:** Subtile Verläufe
- **Premium Feel:** Dunkle Themes mit Glow-Effekten
- **Spacing:** Sehr großzügig
- **Micro-interactions:** Smooth Transitions

---

### 7. Linear ⭐⭐⭐⭐
**Warum es gut ist:**
- **Dark Mode:** Elegantes dunkles Design
- **Glassmorphism:** Subtle blur effects
- **Spacing Scale:** Konsistentes 8px Grid
- **Shadows:** Mehrschichtige, weiche Schatten

---

### 8. Notion ⭐⭐⭐⭐
**Warum es gut ist:**
- **Clarity:** Extrem klar und lesbar
- **Whitespace:** Viel Raum zum Atmen
- **Typography:** Serifenschrift für Headlines
- **Illustrations:** Friendly, warm illustrations

---

### 9. Amie (amie.so) ⭐⭐⭐⭐
**Warum es gut ist:**
- **Playful:** Lebhafte, einladende Ästhetik
- **Rounded:** Konsequent abgerundete Elemente
- **Colors:** Warme, einladende Farbpalette
- **Animation:** Delightful micro-animations

---

### 10. Height ⭐⭐⭐⭐
**Warum es gut ist:**
- **Clean:** Sehr aufgeräumt
- **Functional:** Form follows function
- **Spacing:** Perfekte Proportionen
- **Typography:** Ausgezeichnete Lesbarkeit

---

## Extrahierte Design-Prinzipien

### Farbpalette (Warm & Einladend)
```css
/* Primary - Tiefes Blau mit Wärme */
--color-primary: #1a365d;
--color-primary-light: #2a4a7f;

/* Accent - Warmes Koralle/Orange */
--color-accent: #e85d04;
--color-accent-light: #ff8534;

/* Kategorien */
--color-kinder: #f59e0b;    /* Warm Amber */
--color-familie: #059669;   /* Emerald Green */
--color-erwachsene: #7c3aed; /* Purple */

/* Neutrals - Warm Grays */
--color-bg: #fafaf9;
--color-card: #ffffff;
--color-text: #1c1917;
--color-text-secondary: #57534e;
--color-muted: #a8a29e;
--color-border: #e7e5e4;
```

### Typography Scale
```css
/* Headings */
--font-size-h1: clamp(2rem, 5vw, 3rem);
--font-size-h2: clamp(1.5rem, 4vw, 2rem);
--font-size-h3: 1.125rem;

/* Body */
--font-size-base: 1rem;
--font-size-sm: 0.875rem;
--font-size-xs: 0.75rem;

/* Font Weights */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### Spacing Scale (8px base)
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### Border Radii (Soft, nicht zu rund)
```css
--radius-sm: 8px;    /* Kleine Elemente */
--radius-md: 12px;   /* Cards, Buttons */
--radius-lg: 16px;   /* Große Cards, Modals */
--radius-xl: 24px;   /* Hero-Elemente */
--radius-full: 9999px; /* Pills, Avatare */
```

### Shadows (Subtil & Elegant)
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 
             0 2px 4px -2px rgba(0, 0, 0, 0.05);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 
             0 4px 6px -4px rgba(0, 0, 0, 0.04);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 
             0 8px 10px -6px rgba(0, 0, 0, 0.04);
```

### Transitions
```css
--transition-fast: 150ms ease;
--transition-normal: 250ms ease;
--transition-slow: 350ms ease;
--transition-bounce: 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
```

---

## Implementation Guidelines

### Cards
- Border-Radius: 12-16px
- Schatten: Subtil, verstärkt bei Hover
- Padding: 16-24px
- Image Aspect Ratio: 16:9 oder 4:3
- Hover: translateY(-4px) + stärkerer Schatten

### Buttons
- Border-Radius: 8-12px für normale, full für Pills
- Min-Height: 44px (Touch Target)
- Padding: 12px 24px
- Font-Weight: 600

### Filter Chips
- Border-Radius: full (9999px)
- Padding: 8px 16px
- Active State: Filled mit Primary-Farbe

### Hero Section
- Großzügiges Padding: 64-80px vertikal
- Headline: Große, bold Typography
- Subtile Dekoration möglich (Gradients, Patterns)

---

## Vorher vs. Nachher

### Vorher (Aktuell)
- ❌ Keine Border-Radien (radius: 0)
- ❌ Minimale Schatten
- ❌ Scharfe, technische Anmutung
- ❌ Wenig visuelles Interesse

### Nachher (Ziel)
- ✅ Soft Border-Radien (8-16px)
- ✅ Elegante, mehrschichtige Schatten
- ✅ Einladende, warme Farbpalette
- ✅ Professionell & modern
- ✅ Bessere visuelle Hierarchie
- ✅ Delightful Hover-States
