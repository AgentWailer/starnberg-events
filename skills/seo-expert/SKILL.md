# SEO-Experte für Lokale Event-Websites

> Experten-Playbook für maximale Sichtbarkeit lokaler Veranstaltungen in der Google-Suche

---

## 🎯 Kernprinzipien (Die 7 goldenen Regeln)

### 1. **Event-First Structured Data**
Jedes Event braucht vollständiges Schema.org Event-Markup. Google zeigt Events in Rich Results nur mit korrektem JSON-LD an.

### 2. **Lokale Relevanz vor allem**
NAP-Konsistenz (Name, Address, Phone) ist Pflicht. Die gleichen Kontaktdaten auf Website, Google Business Profile und allen Verzeichnissen.

### 3. **Mobile-First ist Standard**
Google indexiert die mobile Version. Wenn es auf Mobile nicht funktioniert, existiert es nicht.

### 4. **Core Web Vitals einhalten**
- **LCP ≤ 2,5s** (gut) | >4s (schlecht)
- **INP ≤ 200ms** (gut) | >500ms (schlecht)  
- **CLS ≤ 0,1** (gut) | >0,25 (schlecht)

### 5. **Eine URL = Ein Event**
Jedes Event braucht seine eigene, dedizierte Seite mit einzigartigem Content und Markup.

### 6. **Datum und Ort im Title**
Event-Titel müssen scanbar sein: `[Event-Name] | [Datum] | [Ort]`

### 7. **Aktualität zeigt Relevanz**
Vergangene Events archivieren oder entfernen. Nichts signalisiert "tot" wie ein Kalender voller alter Termine.

---

## ✅ Technische SEO-Checkliste

### Core Web Vitals Zielwerte

| Metrik | Gut | Verbesserung nötig | Schlecht |
|--------|-----|-------------------|----------|
| **LCP** (Largest Contentful Paint) | ≤ 2,5s | 2,5-4s | > 4s |
| **INP** (Interaction to Next Paint) | ≤ 200ms | 200-500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0,1 | 0,1-0,25 | > 0,25 |

**Praktische Maßnahmen:**
```
✓ Bilder mit width/height Attributen (verhindert CLS)
✓ Lazy Loading für Bilder unterhalb des Folds
✓ Kritisches CSS inline, Rest async
✓ Fonts mit font-display: swap
✓ Server Response Time < 200ms
```

### Mobile-First Indexing

```
✓ Responsive Design (keine separate m. Subdomain)
✓ Viewport Meta-Tag: <meta name="viewport" content="width=device-width, initial-scale=1">
✓ Touch-Targets mindestens 48x48px
✓ Keine horizontal scrollbaren Elemente
✓ Gleicher Content auf Mobile wie Desktop
```

### robots.txt

```txt
User-agent: *
Allow: /

# Event-Seiten explizit erlauben
Allow: /events/
Allow: /veranstaltungen/

# Admin/System blockieren
Disallow: /admin/
Disallow: /api/
Disallow: /wp-admin/

# Sitemap verlinken
Sitemap: https://starnberg-events.de/sitemap.xml
```

### Sitemap für Events

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://starnberg-events.de/events/sommerfest-2026</loc>
    <lastmod>2026-02-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

**Best Practices:**
- Max. 50.000 URLs pro Sitemap
- Max. 50MB (unkomprimiert)
- Bei mehr URLs: Sitemap-Index verwenden
- `lastmod` nur setzen wenn tatsächlich geändert (Google ignoriert Fake-Daten)

### Interne Verlinkung

```
Homepage
├── /events/ (Übersichtsseite)
│   ├── /events/konzerte/
│   │   └── /events/konzerte/sommernachtskonzert-2026/
│   ├── /events/maerkte/
│   └── /events/sport/
├── /orte/ (Locations)
│   └── /orte/schloss-starnberg/
└── /veranstalter/
```

**Regeln:**
- Jede Seite max. 3 Klicks von der Homepage entfernt
- Breadcrumbs mit Schema.org Markup
- Kontextuelle interne Links im Content
- Kategorie-Hubs für Themenseiten

---

## 📝 Content-SEO für Events

### Title-Tag Struktur

**Formel:** `[Event-Name] | [Datum/Zeitraum] | [Ort] - [Brand]`

**Beispiele:**
```html
<!-- Einzelevent -->
<title>Weinfest am See | 15. Juni 2026 | Starnberg - StarnbergEvents</title>

<!-- Kategorie -->
<title>Konzerte in Starnberg | Alle Termine 2026 - StarnbergEvents</title>

<!-- Übersicht -->
<title>Events in Starnberg | Veranstaltungskalender 2026</title>
```

**Länge:** 50-60 Zeichen optimal (Google schneidet bei ~60 ab)

### Meta-Descriptions die klicken

**Formel:** [Was] + [Wann] + [Besonderheit] + [CTA]

```html
<meta name="description" content="Das Weinfest am Starnberger See am 15. Juni 2026 - 
über 30 Winzer, Live-Musik & Feuerwerk. Tickets jetzt sichern! Eintritt ab 12€.">
```

**Länge:** 150-160 Zeichen
**Must-haves:**
- Datum konkret nennen
- Unique Selling Point
- Call-to-Action (Tickets, Mehr erfahren)
- Bei Preisen: Konkreten Betrag nennen

### Heading-Hierarchie

```html
<h1>Weinfest am Starnberger See 2026</h1>
  <h2>Programm & Highlights</h2>
    <h3>Samstag, 15. Juni</h3>
    <h3>Sonntag, 16. Juni</h3>
  <h2>Tickets & Preise</h2>
  <h2>Anfahrt & Parken</h2>
  <h2>Die Winzer</h2>
```

**Regeln:**
- Nur EIN H1 pro Seite
- H1 enthält Event-Namen + Jahr
- H2 für Hauptsektionen
- Keine Heading-Ebenen überspringen

### URL-Struktur

**Schema:** `/events/[kategorie]/[event-slug]/`

```
✅ Gut:
/events/konzerte/sommernachtskonzert-2026/
/events/maerkte/weihnachtsmarkt-starnberg-2026/

❌ Schlecht:
/event?id=12345
/events/konzerte/sommernachtskonzert-starnberg-am-see-mit-feuerwerk-2026/
/events/KonzertSommernacht2026/
```

**Regeln:**
- Kleinschreibung
- Bindestriche statt Unterstriche
- Jahr im Slug für wiederkehrende Events
- Keine Sonderzeichen, keine Umlaute (siehe DACH-Besonderheiten)
- Max. 60 Zeichen nach Domain

---

## 🏷️ Schema.org Markup für Events

### Vollständiges Event-Markup

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Weinfest am Starnberger See 2026",
  "description": "Das traditionelle Weinfest am Starnberger See mit über 30 Winzern aus der Region, Live-Musik und Feuerwerk.",
  "startDate": "2026-06-15T14:00:00+02:00",
  "endDate": "2026-06-16T22:00:00+02:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": "Seepromenade Starnberg",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Seepromenade 1",
      "addressLocality": "Starnberg",
      "postalCode": "82319",
      "addressRegion": "BY",
      "addressCountry": "DE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 47.9991,
      "longitude": 11.3409
    }
  },
  "image": [
    "https://starnberg-events.de/images/weinfest-1x1.jpg",
    "https://starnberg-events.de/images/weinfest-4x3.jpg",
    "https://starnberg-events.de/images/weinfest-16x9.jpg"
  ],
  "offers": {
    "@type": "Offer",
    "url": "https://starnberg-events.de/events/weinfest-2026/tickets",
    "price": 12,
    "priceCurrency": "EUR",
    "availability": "https://schema.org/InStock",
    "validFrom": "2026-01-15T00:00:00+01:00"
  },
  "organizer": {
    "@type": "Organization",
    "name": "Stadt Starnberg",
    "url": "https://www.starnberg.de"
  },
  "performer": {
    "@type": "MusicGroup",
    "name": "Die Starnberger Musikanten"
  }
}
```

### Pflichtfelder für Google Rich Results

| Feld | Erforderlich | Empfohlen |
|------|-------------|-----------|
| `name` | ✅ | - |
| `startDate` | ✅ | Mit Uhrzeit |
| `location` | ✅ | Mit GeoCoordinates |
| `image` | ✅ | 3 Formate (1:1, 4:3, 16:9) |
| `description` | - | ✅ |
| `endDate` | - | ✅ |
| `offers` | - | ✅ (wenn Tickets) |
| `eventStatus` | - | ✅ |
| `organizer` | - | ✅ |

### Event-Status Markups

```json
// Planmäßig
"eventStatus": "https://schema.org/EventScheduled"

// Verschoben (mit neuem Datum)
"eventStatus": "https://schema.org/EventRescheduled",
"previousStartDate": "2026-06-15T14:00:00+02:00"

// Abgesagt
"eventStatus": "https://schema.org/EventCancelled"

// Online
"eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
"location": {
  "@type": "VirtualLocation",
  "url": "https://zoom.us/j/123456789"
}

// Hybrid
"eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode"
```

### LocalBusiness + Event kombiniert

Für regelmäßige Veranstaltungsorte:

```json
{
  "@context": "https://schema.org",
  "@type": "EventVenue",
  "name": "Schloss Starnberg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Schlossbergstraße 1",
    "addressLocality": "Starnberg",
    "postalCode": "82319",
    "addressCountry": "DE"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 47.9991,
    "longitude": 11.3409
  },
  "event": [
    {
      "@type": "Event",
      "name": "Klassik im Schloss",
      "startDate": "2026-07-20T19:30:00+02:00"
    }
  ]
}
```

---

## 🇩🇪🇦🇹🇨🇭 DACH-Besonderheiten

### Google.de vs. Google.com

- **Google.de** zeigt primär deutschsprachige Ergebnisse
- Standort des Servers spielt kaum noch eine Rolle
- Entscheidend: Sprache des Contents + hreflang

### Umlaute in URLs

```
❌ Schlecht: /events/frühlingsmarkt/
❌ Auch schlecht: /events/fr%C3%BChlingsmarkt/

✅ Richtig: /events/fruehlingsmarkt/
✅ Auch ok: /events/fruhlingsmarkt/
```

**Regel:** Umlaute in URLs immer auflösen:
- ä → ae
- ö → oe
- ü → ue
- ß → ss

### hreflang für DE/AT/CH

Wenn du länderspezifische Inhalte hast (z.B. unterschiedliche Ticketpreise):

```html
<link rel="alternate" hreflang="de-DE" href="https://starnberg-events.de/event/" />
<link rel="alternate" hreflang="de-AT" href="https://starnberg-events.at/event/" />
<link rel="alternate" hreflang="de-CH" href="https://starnberg-events.ch/event/" />
<link rel="alternate" hreflang="de" href="https://starnberg-events.de/event/" />
<link rel="alternate" hreflang="x-default" href="https://starnberg-events.de/event/" />
```

**Wichtig:**
- Bidirektionale Verlinkung (jede Seite verlinkt alle anderen)
- `x-default` für Fallback/Sprachauswahl
- Codes: ISO 639-1 (Sprache) + ISO 3166-1 Alpha-2 (Land)

### Lokale Keywords DACH

**Deutschland:**
- "Veranstaltungen [Stadt]"
- "Events [Stadt] heute/morgen/Wochenende"
- "Was ist los in [Stadt]"
- "[Event-Typ] [Stadt] [Jahr]"

**Österreich spezifisch:**
- "Veranstaltungen" statt "Events" bevorzugt
- "Heurigen" statt "Weinfest"

**Schweiz spezifisch:**
- Kombination DE/FR möglich
- "Anlässe" als Alternative zu "Events"

---

## 🛠️ Tools und Ressourcen

### Prüfung & Validierung

| Tool | Zweck | URL |
|------|-------|-----|
| **Rich Results Test** | Schema.org prüfen | search.google.com/test/rich-results |
| **Schema Markup Validator** | JSON-LD validieren | validator.schema.org |
| **PageSpeed Insights** | Core Web Vitals | pagespeed.web.dev |
| **Mobile-Friendly Test** | Mobile-Optimierung | search.google.com/test/mobile-friendly |
| **Search Console** | Indexierung & Performance | search.google.com/search-console |

### Monitoring

| Tool | Zweck |
|------|-------|
| **Google Search Console** | Impressionen, Klicks, Position |
| **Google Analytics 4** | Traffic, Conversions |
| **Chrome UX Report (CrUX)** | Echte Nutzerdaten CWV |
| **web.dev/measure** | Lighthouse-Score |

### Schema.org Generatoren

- **Merkle Schema Generator**: technicalseo.com/tools/schema-markup-generator
- **JSON-LD Generator**: jsonld.com
- **Hall Analysis**: hallanalysis.com/json-ld-generator

---

## 📊 Konkrete Beispiele für Starnberg-Events

### Event-Seite Vorlage

```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  
  <title>Weinfest am Starnberger See | 15.-16. Juni 2026 | Starnberg</title>
  <meta name="description" content="Das traditionelle Weinfest am Starnberger See mit 30+ Winzern, Live-Musik & Feuerwerk. 15.-16. Juni 2026. Tickets ab 12€ jetzt sichern!">
  
  <link rel="canonical" href="https://starnberg-events.de/events/weinfest-2026/">
  
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Weinfest am Starnberger See 2026",
    "startDate": "2026-06-15T14:00:00+02:00",
    "endDate": "2026-06-16T22:00:00+02:00",
    "location": {
      "@type": "Place",
      "name": "Seepromenade Starnberg",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Seepromenade 1",
        "addressLocality": "Starnberg",
        "postalCode": "82319",
        "addressCountry": "DE"
      }
    },
    "image": ["https://starnberg-events.de/images/weinfest.jpg"],
    "description": "Das traditionelle Weinfest am Starnberger See",
    "offers": {
      "@type": "Offer",
      "price": 12,
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "url": "https://starnberg-events.de/events/weinfest-2026/tickets"
    }
  }
  </script>
</head>
<body>
  <nav aria-label="Breadcrumb">
    <ol itemscope itemtype="https://schema.org/BreadcrumbList">
      <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <a itemprop="item" href="/"><span itemprop="name">Home</span></a>
        <meta itemprop="position" content="1">
      </li>
      <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <a itemprop="item" href="/events/"><span itemprop="name">Events</span></a>
        <meta itemprop="position" content="2">
      </li>
      <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
        <span itemprop="name">Weinfest 2026</span>
        <meta itemprop="position" content="3">
      </li>
    </ol>
  </nav>

  <main>
    <h1>Weinfest am Starnberger See 2026</h1>
    
    <section>
      <h2>Datum & Uhrzeit</h2>
      <p><time datetime="2026-06-15T14:00">Samstag, 15. Juni 2026, 14:00 Uhr</time> – 
         <time datetime="2026-06-16T22:00">Sonntag, 16. Juni 2026, 22:00 Uhr</time></p>
    </section>
    
    <section>
      <h2>Veranstaltungsort</h2>
      <address>
        Seepromenade Starnberg<br>
        Seepromenade 1<br>
        82319 Starnberg
      </address>
    </section>
    
    <section>
      <h2>Programm-Highlights</h2>
      <h3>Samstag, 15. Juni</h3>
      <!-- Content -->
      <h3>Sonntag, 16. Juni</h3>
      <!-- Content -->
    </section>
    
    <section>
      <h2>Tickets & Preise</h2>
      <!-- Pricing info -->
    </section>
  </main>
</body>
</html>
```

### Keyword-Targeting für lokale Events

| Seite | Primary Keyword | Secondary Keywords |
|-------|-----------------|-------------------|
| Homepage | events starnberg | veranstaltungen starnberg, was ist los starnberg |
| Konzerte | konzerte starnberg | live musik starnberg, open air starnberg |
| Märkte | maerkte starnberg | wochenmarkt starnberg, flohmarkt starnberger see |
| Einzelevent | weinfest starnberg 2026 | weinfest starnberger see, weinfest juni 2026 |

### Typische Longtails für Event-Websites

```
✓ "events [stadt] heute abend"
✓ "veranstaltungen [stadt] dieses wochenende"
✓ "kostenlose events [stadt]"
✓ "[event-typ] [stadt] [monat] [jahr]"
✓ "was kann man in [stadt] machen"
✓ "familienausflug [region]"
✓ "[event-name] tickets kaufen"
✓ "[event-name] programm"
✓ "[event-name] anfahrt parken"
```

---

## 🔄 Quick Wins Checkliste

### Sofort umsetzbar (< 1 Tag)

- [ ] Schema.org Event-Markup auf allen Event-Seiten
- [ ] Title-Tags nach Formel: Event | Datum | Ort
- [ ] Meta-Descriptions mit Datum, USP, CTA
- [ ] Bilder mit width/height (CLS-Fix)
- [ ] robots.txt mit Sitemap-Verweis
- [ ] Canonical URLs setzen

### Diese Woche

- [ ] XML-Sitemap erstellen und einreichen
- [ ] Google Search Console einrichten
- [ ] Breadcrumbs mit Markup
- [ ] Interne Verlinkungsstruktur prüfen
- [ ] Mobile-Friendly Test durchführen

### Diesen Monat

- [ ] Core Web Vitals optimieren (PageSpeed Insights)
- [ ] Google Business Profile einrichten/optimieren
- [ ] Alte Events archivieren/weiterleiten
- [ ] NAP-Konsistenz über alle Plattformen prüfen
- [ ] Lokale Verzeichnisse eintragen

---

## 📚 Weiterführende Ressourcen

- **Google Search Central:** developers.google.com/search
- **Schema.org Event:** schema.org/Event
- **Web Vitals:** web.dev/vitals
- **hreflang Guide:** developers.google.com/search/docs/specialty/international/localized-versions

---

*Letzte Aktualisierung: Februar 2026*
