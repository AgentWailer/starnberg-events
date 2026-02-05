# SEO Audit — starnberg-events.pages.dev

**Datum:** 2026-02-06  
**Status:** Abgeschlossen

---

## Zusammenfassung

| Bereich | Status | Priorität |
|---------|--------|-----------|
| robots.txt | ❌ Fehlt | P1 |
| sitemap.xml | ❌ Fehlt | P1 |
| Open Graph / Twitter Cards | ❌ Fehlt | P1 |
| Canonical URLs | ❌ Fehlt | P1 |
| Strukturierte Daten (JSON-LD) | ❌ Fehlt | P2 |
| Heading-Hierarchie (index) | ⚠️ H1→H3 (kein H2) | P2 |
| meta description | ✅ Vorhanden | — |
| lang="de" | ✅ Vorhanden | — |
| Self-hosted Fonts | ✅ DSGVO-konform | — |
| Skip-Link | ✅ Vorhanden | — |
| Favicon | ✅ SVG + ICO | — |
| Semantic HTML (main) | ✅ index.astro | — |
| `<main>` auf s6 | ✅ Vorhanden | — |
| Bilder (img-Tags) | ✅ Keine → kein alt-Problem | — |
| S6 Heading-Hierarchie | ✅ H1→H2→H3 korrekt | — |
| Impressum/Datenschutz | ✅ Heading-Hierarchie korrekt | — |
| site config in astro.config.mjs | ✅ Gesetzt | — |
| Custom Domain | ⚠️ pages.dev Subdomain | P3 |

---

## P1 — Sofort umsetzen

### 1. robots.txt
Fehlt komplett. Suchmaschinen crawlen zwar ohne, aber es ist Best Practice.
- `/analytics` sollte explizit blockiert werden (privat, passwortgeschützt)

### 2. sitemap.xml
Fehlt. Astro kann Sitemaps automatisch generieren mit `@astrojs/sitemap`.
- 5 Seiten: `/`, `/s6`, `/impressum`, `/datenschutz`, `/analytics` (analytics ausschließen)

### 3. Open Graph & Twitter Card Meta Tags
Keine OG- oder Twitter-Tags vorhanden. Links zu der Seite in Social Media / Messengers zeigen nur den Seitentitel ohne Vorschaubild oder Beschreibung.

Benötigt in Layout.astro:
- `og:title`, `og:description`, `og:url`, `og:type`, `og:locale`, `og:site_name`
- `og:image` (braucht ein Vorschaubild — kann generisch sein)
- `twitter:card`, `twitter:title`, `twitter:description`

### 4. Canonical URLs
Keine `<link rel="canonical">` Tags. Wichtig für Duplicate-Content-Vermeidung (z.B. mit/ohne trailing slash).

---

## P2 — Bald umsetzen

### 5. Strukturierte Daten (JSON-LD)
Keine Schema.org-Markup. Möglichkeiten:
- **WebSite** Schema auf Hauptseite
- **Event** Schema für Events (Google zeigt Rich Results für Events!)
- **WebPage** auf Unterseiten

Event-Schema wäre der größte SEO-Hebel — Google hat spezielle Event-Rich-Results.

### 6. Heading-Hierarchie auf index.astro
- Header.astro hat `<h1>` ✅
- Aber danach springt es direkt zu `<h3>` (section-heading, DayGroup, FilterBar)
- Kein `<h2>` auf der Hauptseite
- FilterBar nutzt `<h3>` und `<h4>` für Filter-Sections (semantisch fragwürdig — eher `<legend>` oder `<p>`)

**Fix:** Mindestens eine `<h2>` Ebene einführen oder section-headings auf `<h2>` ändern.

---

## P3 — Nice to have

### 7. Custom Domain
`starnberg-events.pages.dev` ist funktional, aber eine eigene Domain (z.B. `poecking-events.de`) würde:
- SEO-Ranking verbessern (Keyword in Domain)
- Professioneller wirken
- Branding ermöglichen

### 8. Performance
- Keine `<img>` Tags → kein Lazy-Loading-Problem
- Self-hosted Fonts ✅
- `dns-prefetch` und `preconnect` ✅
- Kein Above-the-fold CSS-Splitting (alles inline in Layout.astro — bei der Seitengröße OK)

### 9. OG Image
Idealerweise ein statisches Vorschaubild (1200×630px) für Social Sharing.
Kann als einfaches Branded-Bild in `public/og-image.png` liegen.

---

## Umsetzungsplan

1. **robots.txt** erstellen → `public/robots.txt`
2. **@astrojs/sitemap** installieren + konfigurieren
3. **OG/Twitter Meta Tags** in Layout.astro
4. **Canonical URL** in Layout.astro
5. **Heading-Hierarchie** auf index.astro fixen (H3→H2)
6. **JSON-LD WebSite Schema** auf Hauptseite
7. (Optional) Event-Schema für einzelne Events
8. (Optional) OG-Image erstellen
