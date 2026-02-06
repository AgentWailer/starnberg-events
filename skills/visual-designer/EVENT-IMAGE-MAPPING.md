# Event Image Mapping

Automatisch generierte Bilder für Starnberg Events Kategorien.

**Generiert:** 2026-02-06
**Modell:** black-forest-labs/flux-1.1-pro via Replicate API
**Bildformat:** WebP, 16:9, Qualität 90

## Analyse der Event-Daten

### Hauptkategorien
| Kategorie | Anzahl Events |
|-----------|---------------|
| familie | 282 |
| erwachsene | 202 |
| kinder | 28 |

### Top artTags
| artTag | Anzahl |
|--------|--------|
| kultur | 153 |
| bildung | 119 |
| musik | 116 |
| natur | 74 |
| kunst | 67 |
| fest | 65 |
| indoor | 63 |
| show | 60 |
| sport | 56 |
| theater | 39 |
| tanz | 35 |
| wellness | 33 |
| yoga | 24 |
| fasching | 22 |

---

## Generierte Bilder

### 1. musik.webp
**Pfad:** `/images/events/musik.webp`
**Verwendung für:** `musik`, `show`, `musik+kultur`, `musik+indoor`
**Prompt:**
```
Concert hall with warm golden stage lighting, silhouettes of musicians performing on stage, audience from behind enjoying live music, intimate atmosphere, cinematic photography, professional event photography style, no visible faces
```

---

### 2. kunst-kultur.webp
**Pfad:** `/images/events/kunst-kultur.webp`
**Verwendung für:** `kunst`, `kultur`, `kunst+kultur`, `kunst+bildung`, Museumsführungen
**Prompt:**
```
Elegant art gallery interior in Bavaria, modern paintings on white walls, beautiful natural light streaming through large windows, visitors viewing art from behind, sophisticated museum atmosphere, architectural photography, warm tones
```

---

### 3. natur.webp
**Pfad:** `/images/events/natur.webp`
**Verwendung für:** `natur`, `wandern`, `outdoor`, Exkursionen, Naturführungen
**Prompt:**
```
Starnberger See lake in Bavaria at golden hour, Alps mountains in the background, morning mist over calm water, wooden boat dock, lush green shoreline, serene natural landscape, professional landscape photography, warm morning light
```

---

### 4. theater.webp
**Pfad:** `/images/events/theater.webp`
**Verwendung für:** `theater`, Bühnenaufführungen, Kindertheater
**Prompt:**
```
Intimate theater stage with dramatic red velvet curtains, warm spotlight illuminating empty wooden stage, rows of elegant seats in foreground, classic Bavarian theater interior, theatrical atmosphere, professional architectural photography
```

---

### 5. wellness.webp
**Pfad:** `/images/events/wellness.webp`
**Verwendung für:** `wellness`, `yoga`, `meditation`, Achtsamkeitskurse
**Prompt:**
```
Peaceful yoga studio with warm natural light, yoga mats arranged on wooden floor, large windows overlooking Bavarian nature, candles and plants, zen meditation space, calming wellness atmosphere, soft morning light, minimalist interior design
```

---

### 6. fest.webp
**Pfad:** `/images/events/fest.webp`
**Verwendung für:** `fest`, `fasching`, Dorffeste, Märkte, Volksfeste
**Prompt:**
```
Traditional Bavarian village festival at dusk, colorful string lights and paper lanterns, festive market stalls, Alpine mountains in background, warm summer evening atmosphere, people celebrating from distance, authentic German Volksfest ambiance, cinematic festival photography
```

---

### 7. sport.webp
**Pfad:** `/images/events/sport.webp`
**Verwendung für:** `sport`, `radsport`, `radtour`, `laufen`, Outdoor-Sport
**Prompt:**
```
Scenic cycling path along Starnberger See lake in Bavaria, bicycle parked near shore, Alps visible in distance, golden hour sunlight, healthy outdoor lifestyle, summer day in German countryside, professional outdoor sports photography
```

---

### 8. tanz.webp
**Pfad:** `/images/events/tanz.webp`
**Verwendung für:** `tanz`, Tanzworkshops, Ballroom, Discofox
**Prompt:**
```
Elegant dance studio with polished wooden parquet floor, mirrors on walls, dramatic lighting, dancing couple silhouette in motion blur, classic ballroom atmosphere, warm ambient lighting, professional dance photography, artistic movement
```

---

## Mapping-Logik für Events

### Prioritätsreihenfolge (artTags)
1. Spezifische Tags prüfen: `musik`, `theater`, `tanz`, `wellness/yoga`, `sport`, `natur`
2. Fallback auf allgemeine Tags: `kunst/kultur`, `fest`
3. Default: `natur.webp` (da regional passend)

### Beispiel-Zuordnung
```javascript
function getEventImage(event) {
  const tags = event.artTags || [];
  
  if (tags.includes('musik') || tags.includes('show')) return 'musik.webp';
  if (tags.includes('theater')) return 'theater.webp';
  if (tags.includes('tanz')) return 'tanz.webp';
  if (tags.includes('wellness') || tags.includes('yoga') || tags.includes('meditation')) return 'wellness.webp';
  if (tags.includes('sport') || tags.includes('radsport') || tags.includes('laufen')) return 'sport.webp';
  if (tags.includes('natur') || tags.includes('wandern')) return 'natur.webp';
  if (tags.includes('kunst') || tags.includes('kultur') || tags.includes('bildung')) return 'kunst-kultur.webp';
  if (tags.includes('fest') || tags.includes('fasching') || tags.includes('markt')) return 'fest.webp';
  
  // Default
  return 'natur.webp';
}
```

---

## Zukünftige Generierung

### Neues Bild erstellen
```bash
# Token aus ~/.zshrc laden
source ~/.zshrc

# Neues Bild generieren
curl -s -X POST "https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions" \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "prompt": "YOUR PROMPT HERE",
      "aspect_ratio": "16:9",
      "output_format": "webp",
      "output_quality": 90
    }
  }'

# Prediction ID merken, dann pollen:
curl -s "https://api.replicate.com/v1/predictions/PREDICTION_ID" \
  -H "Authorization: Bearer $REPLICATE_API_TOKEN" | jq '.output'

# Output-URL herunterladen:
curl -sL "OUTPUT_URL" -o "starnberg-events/public/images/events/name.webp"
```

### Prompt-Richtlinien
- **Lokalkolorit:** Starnberger See, Alpen, Bayern erwähnen
- **DSGVO-konform:** "no visible faces", "from behind", "silhouettes"
- **Authentisch:** "cinematic photography", "professional", nicht "stock photo"
- **Atmosphäre:** Warme Töne, Golden Hour, einladende Stimmung

### Thumbnail-Varianten (1:1)
Für quadratische Thumbnails: `"aspect_ratio": "1:1"` verwenden.

---

## Bildstatus

| Bild | Dateigröße | Status |
|------|------------|--------|
| musik.webp | 63 KB | ✅ |
| kunst-kultur.webp | 159 KB | ✅ |
| natur.webp | 213 KB | ✅ |
| theater.webp | 79 KB | ✅ |
| wellness.webp | 145 KB | ✅ |
| fest.webp | 248 KB | ✅ |
| sport.webp | 265 KB | ✅ |
| tanz.webp | 57 KB | ✅ |

**Gesamt:** 8 Bilder, ca. 1.2 MB
