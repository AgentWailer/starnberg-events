# Visual Designer Skill

> Experten-Playbook für AI-generierte Bilder, visuelle Konsistenz und lokale Authentizität im Raum Starnberger See.

---

## 1. Flux Prompt Engineering

### Grundstruktur eines erfolgreichen Prompts

Flux verarbeitet natürliche Sprache besser als Midjourney. Die optimale Struktur:

```
[Subjekt] + [Aktion/Zustand] + [Umgebung] + [Stil/Ästhetik] + [Technische Parameter]
```

**Beispiel:**
```
A family enjoying a picnic by Lake Starnberg, summer afternoon, with the Bavarian Alps visible in the background, 
soft golden hour lighting, editorial travel photography style, shallow depth of field, Canon EOS R5, 85mm lens
```

### Wichtige Stil-Keywords

#### Fotografische Stile
| Keyword | Effekt |
|---------|--------|
| `editorial photography` | Magazin-Look, natürlich |
| `documentary style` | Authentisch, ungestellt |
| `lifestyle photography` | Entspannt, modern |
| `travel photography` | Einladend, atmosphärisch |
| `cinematic` | Filmisch, dramatische Beleuchtung |
| `food photography` | Appetitlich, detail-orientiert |
| `architectural photography` | Klare Linien, Perspektive |

#### Beleuchtungs-Keywords
| Keyword | Wann nutzen |
|---------|-------------|
| `golden hour` | Outdoor-Events, romantische Stimmung |
| `blue hour` | Abendveranstaltungen, mystisch |
| `soft natural light` | Menschen, Portraits |
| `overcast lighting` | Gleichmäßig, keine harten Schatten |
| `backlit` | Dramatik, Silhouetten |
| `ambient lighting` | Innenräume, Gemütlichkeit |

#### Qualitäts-Booster
```
high resolution, detailed, professional quality, 8k, sharp focus, 
award-winning photography, National Geographic style
```

### Negative Prompts (bei Flux weniger kritisch)

Flux benötigt seltener explizite Negative Prompts als SDXL/Midjourney, aber hilfreich bei:

```
Vermeiden: blurry, low quality, distorted faces, artificial looking, oversaturated, 
plastic skin, unnatural poses, stock photo aesthetic, watermark, text overlay
```

### Konsistenz über mehrere Bilder

**1. Seed-Kontrolle:**
- Gleichen Seed für ähnliche Bilder verwenden
- Bei Flux Pro: `seed` Parameter nutzen

**2. Style-Locking durch konsistente Keywords:**
```
# Style-Block für alle Event-Bilder
STYLE_BASE = """
soft natural lighting, authentic atmosphere, documentary style, 
slightly desaturated colors, warm undertones, German countryside aesthetic
"""
```

**3. Aspect Ratios konsistent halten:**
- Hero-Images: `16:9` oder `3:2`
- Event-Kacheln: `4:3` oder `1:1`
- Story/Vertical: `9:16`

---

## 2. Bildsprache für lokale Websites

### Authentizität vs Stock-Look

#### ❌ Stock-Look vermeiden
- Überstrahlende, künstliche Beleuchtung
- Übertrieben perfekte Models
- Generische Hintergründe
- Gestellte, unnatürliche Posen
- Übersättigte Farben

#### ✅ Authentizität erreichen
- Natürliches Licht bevorzugen
- Echte Situationen darstellen
- Lokale Landmarken einbeziehen
- Realistische Kleidung für Region/Jahreszeit
- Leicht entsättigte, warme Farbpalette

### Menschen in Bildern: Dos & Don'ts

#### ✅ Do
- Diverse Altersgruppen (Familien, Senioren, junge Erwachsene)
- Authentische Interaktionen zeigen
- Menschen im Kontext der Aktivität
- Gesichter teilweise abgewandt (weniger KI-Artefakte)
- Gruppen statt Einzelpersonen

#### ❌ Don't
- Perfekte Model-Gesichter
- Direkt in die Kamera starren
- Zu viele Personen (>5-6)
- Anatomisch problematische Posen
- Hände prominent im Fokus (KI-Schwachstelle)

### Lokale Identität: Starnberger See Region

**Landschaftselemente:**
- Der See mit charakteristischem Blau-Grün
- Alpenpanorama im Hintergrund
- Seeufer mit Schilfgürtel
- Historische Villen und Bootsanlegestellen
- Bayerische Architektur (Holzbalkone, Lüftlmalerei)

**Kulturelle Marker:**
- Tracht (dezent, nicht folkloristisch)
- Biergärten mit Kastanienbäumen
- Segelboote und Ruderboote
- Historische Dampfer (z.B. MS Starnberg)
- Lokale Küche (Steckerlfisch, Brezen)

**Prompt-Beispiel Starnberg:**
```
A scenic view of Lake Starnberg with the Bavarian Alps in the background, 
traditional boat house in the foreground, late afternoon light, 
soft colors with blue-green water tones, authentic German landscape photography
```

### Saisonale Anpassungen

| Saison | Farbpalette | Stimmung | Typische Elemente |
|--------|-------------|----------|-------------------|
| **Frühling** | Zart grün, Pastelltöne | Aufbruch, frisch | Blühende Obstbäume, Magnolien |
| **Sommer** | Satt grün, Blau | Lebhaft, warm | Badestellen, Segelboote, Biergärten |
| **Herbst** | Gold, Orange, Braun | Gemütlich, nostalgisch | Nebel über dem See, Weinlaub |
| **Winter** | Weiß, Grau-Blau | Ruhig, festlich | Verschneite Alpen, Weihnachtsmärkte |

---

## 3. Technische Anforderungen Web

### Bildformate

| Format | Einsatz | Vorteile | Browser-Support |
|--------|---------|----------|-----------------|
| **WebP** | Standard für Web | 25-35% kleiner als JPEG, Transparenz | Alle modernen Browser |
| **AVIF** | Zukunft, progressiv | 50% kleiner als JPEG | Chrome, Firefox, Safari 16+ |
| **JPEG** | Fallback | Universal kompatibel | Alle |
| **PNG** | Logos, Transparenz | Verlustfrei, Alpha | Alle |
| **SVG** | Icons, Logos | Skalierbar, tiny | Alle |

### Optimale Bildgrößen

```
Hero/Banner:       1920x1080 (max), 150-300 KB
Event-Kacheln:     800x600, 50-100 KB  
Thumbnails:        400x300, 20-40 KB
Event-Detail:      1200x800, 100-200 KB
Social Preview:    1200x630 (OG), 100-150 KB
```

### Responsive Images (srcset)

```html
<picture>
  <!-- AVIF für moderne Browser -->
  <source 
    type="image/avif"
    srcset="
      event-400.avif 400w,
      event-800.avif 800w,
      event-1200.avif 1200w
    "
    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
  >
  <!-- WebP als Fallback -->
  <source 
    type="image/webp"
    srcset="
      event-400.webp 400w,
      event-800.webp 800w,
      event-1200.webp 1200w
    "
    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 33vw"
  >
  <!-- JPEG als Ultimate-Fallback -->
  <img 
    src="event-800.jpg" 
    alt="Seefest am Starnberger See mit Blick auf die Alpen"
    loading="lazy"
    decoding="async"
    width="800"
    height="600"
  >
</picture>
```

### Lazy Loading

```html
<!-- Native Lazy Loading -->
<img src="event.webp" loading="lazy" alt="..." width="800" height="600">

<!-- Mit Intersection Observer für mehr Kontrolle -->
<img data-src="event.webp" class="lazy" alt="...">
```

**Best Practices:**
- Erste 2-3 Bilder im Viewport: **NICHT** lazy-loaden (LCP!)
- Immer `width` und `height` angeben (Layout Shift vermeiden)
- `decoding="async"` für bessere Performance

### Alt-Text Best Practices

#### Struktur für Event-Bilder

```
[Was + Wo + Kontext]
```

**Beispiele:**

| Bild | Alt-Text |
|------|----------|
| Konzert | "Klassikkonzert im Schloss Berg am Starnberger See, Publikum im festlichen Saal" |
| Wanderung | "Wandergruppe auf dem Panoramaweg mit Blick auf den Starnberger See und die Alpen" |
| Seefest | "Besucher am Starnberger Seefest bei Sonnenuntergang, bunte Lampions am Ufer" |

#### Richtlinien

1. **Informativ:** Beschreibe Inhalt, nicht Dateiname
2. **Kontextbezogen:** Was ist für diesen Event relevant?
3. **Kurz & präzise:** 80-125 Zeichen optimal
4. **Keine Redundanz:** Nicht "Bild von..." oder "Foto zeigt..."
5. **Dekorativ = leer:** `alt=""` für reine Deko-Bilder

---

## 4. Farbwelt und Konsistenz

### Visuellen Stil definieren

**Starnberg Events Farbwelt:**

```css
:root {
  /* Primär - See & Himmel */
  --color-lake: #2B6777;        /* Tiefes Seeblau */
  --color-sky: #7AB8C9;         /* Helles Himmelblau */
  
  /* Sekundär - Natur */
  --color-alpine: #52796F;      /* Alpengrün */
  --color-meadow: #84A98C;      /* Wiesengrün */
  
  /* Akzent - Wärme */
  --color-sunset: #C9A86C;      /* Sonnenuntergang Gold */
  --color-bark: #8B7355;        /* Holz/Bootshaus */
  
  /* Neutral */
  --color-mist: #CAD2C5;        /* Morgennebel */
  --color-stone: #6B7280;       /* Steingrau */
}
```

### Color Grading für Konsistenz

**LUT/Filter-Empfehlungen für Starnberg-Ästhetik:**

1. **Leicht entsättigt** (Saturation -10-15%)
2. **Warme Schatten** (Schatten → Orange/Braun)
3. **Kühle Highlights** (Highlights → leichtes Cyan)
4. **Angehobene Schwarzwerte** (Crushed Blacks vermeiden)
5. **Dezenter Vintage-Look** (leichtes Fading)

**In Prompts umsetzen:**
```
slightly desaturated colors, warm shadows, cool highlights, 
soft contrast, natural film grain, nostalgic color grading
```

### Overlay-Techniken

**Gradient Overlays für Text-Lesbarkeit:**

```css
/* Dunkler Gradient von unten */
.event-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60%;
  background: linear-gradient(
    to top, 
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    transparent 100%
  );
}

/* Farbiger Brand-Overlay */
.hero-image::before {
  background: linear-gradient(
    135deg,
    rgba(43, 103, 119, 0.4) 0%,
    rgba(122, 184, 201, 0.2) 100%
  );
}
```

### Brand Colors einbinden

**Strategie:**
1. **Farbharmonie prüfen:** Generierte Bilder auf Palette abstimmen
2. **Akzentfarben durch UI:** Buttons, Icons, Text-Highlights
3. **Farbige Overlays:** Dezent, nicht dominierend
4. **Rahmen/Borders:** Brand Color als Akzent

---

## 5. Event-Kategorie → Bildstil Mapping

### Stilmatrix

| Kategorie | Bildstil | Stimmung | Beleuchtung | Besonderheiten |
|-----------|----------|----------|-------------|----------------|
| **Kultur** | Editorial, elegant | Anspruchsvoll, festlich | Warm, ambient | Innenräume, Architektur |
| **Sport** | Dynamisch, action | Energetisch, aktiv | Natürlich, hell | Bewegung, Weitwinkel |
| **Familie** | Lifestyle, warm | Entspannt, fröhlich | Golden hour, soft | Interaktionen, Natur |
| **Natur** | Landschaft, documentary | Ruhig, inspirierend | Alle Tageszeiten | Panoramen, Details |
| **Musik** | Konzert, stimmungsvoll | Emotional, lebendig | Bühnenlichter, low light | Künstler, Publikum |
| **Kulinarik** | Food photography | Appetitlich, gemütlich | Soft, direkt | Close-ups, Texturen |
| **Markt** | Street photography | Lebhaft, authentisch | Natürlich | Menschen, Produkte |

### Tageszeit und Stimmung

| Uhrzeit | Stimmung | Für Events |
|---------|----------|------------|
| **Morgen (6-9)** | Frisch, ruhig, neblig | Yoga, Wanderungen, Märkte |
| **Vormittag (9-12)** | Aktiv, klar | Sport, Outdoor, Familien |
| **Mittag (12-15)** | Hell, energisch | Festivals, Messen |
| **Nachmittag (15-18)** | Warm, einladend | Biergarten, Kultur |
| **Golden Hour (18-20)** | Romantisch, magisch | Konzerte, Seefeste |
| **Abend (20-23)** | Stimmungsvoll, festlich | Kino, Theater, Feste |
| **Nacht (23+)** | Mystisch, intim | Nachtwanderungen, Partys |

---

## 6. Flux Prompt-Templates

### 🎭 Kultur-Events

```
# Klassikkonzert
A classical music concert in a historic Bavarian venue near Lake Starnberg, 
string quartet on stage, elegant audience, warm ambient lighting from chandeliers, 
refined atmosphere, editorial photography style, shallow depth of field

# Theateraufführung
Open-air theater performance at sunset by Lake Starnberg, 
actors on a wooden stage, audience seated on the lawn, 
Bavarian Alps visible in the background, dramatic golden hour lighting, 
documentary style photography

# Kunstausstellung
Art gallery opening in a traditional Bavarian villa, 
visitors viewing contemporary paintings, large windows with lake view, 
soft natural light mixed with gallery spotlights, 
lifestyle photography, slightly desaturated colors
```

### ⚽ Sport-Events

```
# Segelregatta
Sailing regatta on Lake Starnberg, multiple sailboats with colorful sails, 
action shot with water spray, Bavarian Alps in background, 
bright summer day, dynamic sports photography, telephoto lens effect

# Wanderung/Bergwandern
Hiking group on a trail above Lake Starnberg, panoramic view of the lake 
and Alps, early morning light with mist in the valley, 
outdoor adventure photography, wide angle, authentic gear and clothing

# Radtour
Cyclists on a scenic bike path along Lake Starnberg shore, 
summer afternoon, traditional Bavarian buildings in background, 
lifestyle sports photography, motion blur on wheels, natural colors
```

### 👨‍👩‍👧‍👦 Familien-Events

```
# Kinderfest
Family festival in a Bavarian village near Lake Starnberg, 
children playing traditional games, parents watching, colorful decorations, 
joyful atmosphere, soft afternoon light, lifestyle photography, 
warm color palette, authentic German countryside setting

# Picknick am See
Multi-generational family picnic on the shores of Lake Starnberg, 
checkered blanket, local Bavarian food, children playing nearby, 
golden hour lighting, Alps visible across the lake, 
relaxed and natural poses, documentary style

# Bauernmarkt
Family visiting a farmers market in Starnberg town center, 
fresh produce stalls, local vendors, cobblestone street, 
morning light, authentic German market atmosphere, 
lifestyle photography with warm undertones
```

### 🌲 Natur-Events

```
# Sonnenuntergang-Wanderung
Sunset hike viewing point overlooking Lake Starnberg, 
silhouettes of hikers against orange and purple sky, 
dramatic alpine panorama, landscape photography, 
wide angle, saturated warm colors for sky only

# Vogelbeobachtung
Bird watching group at Lake Starnberg nature reserve, 
reeds and wetlands, early morning mist rising from water, 
person with binoculars, peaceful atmosphere, 
nature documentary style, soft natural lighting

# Waldspaziergang
Forest walk in the woods near Lake Starnberg, 
dappled sunlight through leaves, hikers on a leaf-covered path, 
autumn colors, Bavarian mixed forest, 
contemplative mood, natural photography style
```

### 🎵 Musik-Events

```
# Open-Air Konzert
Outdoor summer concert by Lake Starnberg at dusk, 
band on stage with string lights, crowd enjoying music, 
warm atmosphere, Bavarian Alps silhouette in background, 
concert photography, warm ambient lighting with stage lights

# Jazz im Biergarten
Jazz performance in a traditional Bavarian beer garden, 
chestnut trees overhead, intimate audience at wooden tables, 
evening atmosphere with fairy lights, 
lifestyle music photography, warm nostalgic colors

# Volksmusik
Traditional Bavarian folk music performance at a village festival, 
musicians in traditional dress, wooden stage decorated with flowers, 
daytime outdoor setting, authentic cultural event,
documentary style, natural daylight
```

### 🍺 Kulinarik-Events

```
# Weinfest
Wine tasting event at a lakeside vineyard near Starnberg, 
elegant guests sampling wine, scenic lake view, 
late afternoon golden light, sophisticated atmosphere,
food and lifestyle photography, shallow depth of field on glasses

# Biergarten
Traditional Bavarian beer garden under chestnut trees, 
friends toasting with beer steins, pretzel and sausages on table, 
late afternoon sun filtering through leaves, 
authentic German atmosphere, lifestyle photography

# Fischerfest
Fish festival at Starnberg harbor, grilled Steckerlfisch on sticks, 
rustic wooden stalls, families enjoying food by the water, 
festive decorations, afternoon light, 
food festival photography, warm authentic colors
```

### 🎪 Märkte & Feste

```
# Weihnachtsmarkt
Christmas market in Starnberg old town, 
wooden huts with handcrafted goods, warm lights and decorations, 
light snow falling, visitors with mulled wine, 
evening atmosphere, festive and cozy mood,
holiday photography, warm golden lighting

# Seefest
Lake festival at Starnberger See at dusk, 
colorful boats decorated with lights on the water, 
crowds along the shore, fireworks reflecting in the lake, 
festive summer atmosphere, event photography

# Handwerkermarkt
Artisan market in a historic Bavarian courtyard, 
craftspeople demonstrating their work, curious visitors, 
stone archways and wooden stalls, 
documentary style, natural daylight, authentic atmosphere
```

---

## 7. Workflow-Checkliste

### Vor der Bildgenerierung
- [ ] Event-Kategorie identifizieren
- [ ] Passendes Prompt-Template wählen
- [ ] Jahreszeit/Tageszeit berücksichtigen
- [ ] Aspect Ratio festlegen
- [ ] Style-Keywords überprüfen

### Nach der Generierung
- [ ] Qualität prüfen (keine KI-Artefakte)
- [ ] Anatomie checken (Hände, Gesichter)
- [ ] Farbharmonie mit Brand überprüfen
- [ ] Multiple Sizes generieren (srcset)
- [ ] WebP/AVIF konvertieren
- [ ] Dateigröße optimieren (<200KB für Hero)
- [ ] Alt-Text schreiben
- [ ] Dateiname semantisch benennen

### Bildoptimierung Tools
- **Squoosh** (squoosh.app) - Browser-basiert, exzellent
- **ImageOptim** - macOS lokal
- **Sharp** - Node.js Automatisierung
- **Cloudinary/imgix** - CDN mit Transformation

---

## 8. Qualitätskriterien

### ✅ Akzeptables Bild
- Keine offensichtlichen KI-Artefakte
- Natürliche Anatomie bei Menschen
- Konsistente Beleuchtung
- Passend zur Event-Kategorie
- Regional authentisch
- Technisch korrekt (Schärfe, Exposure)

### ❌ Ablehnen wenn
- Verzerrte Gesichter/Gliedmaßen
- Unrealistischer "AI-Look"
- Falsche Jahreszeit/Stimmung
- Generischer Stock-Photo-Stil
- Kulturell unpassend für Region
- Technische Mängel (Blur, Banding)

---

*Version 1.0 | Erstellt für Starnberg Events Projekt*
