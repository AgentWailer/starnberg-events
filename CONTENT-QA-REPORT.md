# Content QA Report – events.json

**Datum:** 2026-02-05  
**Geprüfte Datei:** `src/data/events.json`  
**Events gesamt:** 514

---

## 📊 Zusammenfassung

| Kategorie | Status | Findings |
|-----------|--------|----------|
| Regionen-Definition | 🔴 Kritisch | 3 fehlende Regionen (`starnberger-see`, `ammersee`, `wuermtal`) |
| Regionen-Zuordnung | 🔴 Kritisch | **154 Events** in falscher Region |
| Catch-all Region | 🟡 Warnung | 26 Events mit unspezifischem `starnberg-ammersee` |
| Kategorien | 🟢 OK | 1 fraglicher Fall |
| artTags vs tags | 🔴 Kritisch | **182 Events** nutzen `tags` statt `artTags` |
| Duplikate | 🟡 Warnung | 2 Duplikat-Gruppen |
| Vergangene Events | 🟡 Warnung | 1 Event vor heute |
| Fehlende Daten | 🟢 OK | Keine fehlenden Titel/Daten |
| Zeitformate | 🟢 OK | Alle valide |

**Gesamt: 340+ Datensätze betroffen**

---

## 1. 🗺️ Regionen-Check

### 1.1 Regionen-Definition ist unvollständig

Die `regions`-Definition in der JSON enthält nur 5 Regionen:
- `poecking`, `starnberg-ammersee`, `muenchen`, `tegernsee`, `werdenfels`

**Tatsächlich verwendet werden 7 verschiedene Werte:**
- `starnberger-see` (307 Events) – **nicht in Definition!**
- `ammersee` (3 Events) – **nicht in Definition!**
- `starnberg-ammersee` (26 Events)
- `poecking` (51 Events)
- `muenchen` (97 Events)
- `tegernsee` (14 Events)
- `werdenfels` (16 Events)

**Fehlende Regionen:**
- `starnberger-see` – für Starnberg, Tutzing, Berg, Bernried, Seeshaupt, Münsing
- `ammersee` – für Herrsching, Inning, Wörthsee, Dießen, Schondorf, Andechs
- `wuermtal` – für Gauting, Gilching, Krailling, Planegg, Wolfratshausen

**Fix:** `starnberg-ammersee` in der Definition durch `starnberger-see`, `ammersee` und `wuermtal` ersetzen.

### 1.2 Events in falscher Region (154 Events!)

Das Kernproblem: Fast alle Events außerhalb von München/Tegernsee/Werdenfels/Pöcking wurden in den Catch-all `starnberger-see` geworfen, obwohl sie klar zu `ammersee` oder `wuermtal` gehören.

#### → Ammersee (37 Fixes)
Events in **Herrsching, Wörthsee, Andechs, Inning** die fälschlich als `starnberger-see` getaggt sind:

| ID | Titel | Ort | Aktuell | Soll |
|----|-------|-----|---------|------|
| 10 | Babyballett Schnuppertag | Herrsching | starnberger-see | **ammersee** |
| 17 | Die Demokratie des Waldes | Herrsching | starnberger-see | **ammersee** |
| 24 | Faschingsparty für Teens | Herrsching | starnberger-see | **ammersee** |
| 46 | Theaterzwerge - Die Träne der Elfe | Herrsching | starnberger-see | **ammersee** |
| 48 | Volleyball Heimspiele | Herrsching | starnberger-see | **ammersee** |
| 66 | Theaterzwerge (Sonntag) | Herrsching | starnberger-see | **ammersee** |
| 69 | Tanzkunst60+ | Herrsching | starnberger-see | **ammersee** |
| 88 | Kegeln im Pfarrzentrum | Herrsching | starnberger-see | **ammersee** |
| 91 | Fasching im SC Wörthsee | Wörthsee | starnberger-see | **ammersee** |
| 111 | Frauengesundheit | Herrsching | starnberger-see | **ammersee** |
| 119 | Valentinstag Yoga | Herrsching | starnberger-see | **ammersee** |
| 133 | Mittwochclub der Senioren | Herrsching | starnberger-see | **ammersee** |
| 136 | BÜRGERTREFF 55+ | Herrsching | starnberger-see | **ammersee** |
| 147 | Heimspieltag Handball | Herrsching | starnberger-see | **ammersee** |
| 151 | Tribal Style Belly Dance | Herrsching | starnberger-see | **ammersee** |
| 171 | Aromatherapie Schwangerschaft | Herrsching | starnberger-see | **ammersee** |
| 177 | Waldgeheimnis Tierspuren | Herrsching | starnberger-see | **ammersee** |
| 182 | Jugendfeuerwehr Herrsching | Herrsching | starnberger-see | **ammersee** |
| 194 | Ballett für Erwachsene | Herrsching | starnberger-see | **ammersee** |
| 199 | Aromatherapie Workshop | Herrsching | starnberger-see | **ammersee** |
| 223 | Waldschreiben | Herrsching | starnberger-see | **ammersee** |
| 228 | Benefiz Flohmarkt | Herrsching | starnberger-see | **ammersee** |
| 237 | Volleyball Heimspiele | Herrsching | starnberger-see | **ammersee** |
| 243 | Heimspieltag Handball | Herrsching | starnberger-see | **ammersee** |
| 252 | Lachyoga | Herrsching | starnberger-see | **ammersee** |
| 257 | Jahresmitgliederversammlung | Herrsching | starnberger-see | **ammersee** |
| 258 | Yoga Intensivwochenende | Herrsching | starnberger-see | **ammersee** |
| 263 | Qigong Workshop | Herrsching | starnberger-see | **ammersee** |
| 268 | Ostara Yoga | Herrsching | starnberger-see | **ammersee** |
| 281 | ADFC Tour Andechs | Steinebach | starnberger-see | **ammersee** |
| 282 | Heimspieltag Handball | Herrsching | starnberger-see | **ammersee** |
| 293 | Wechseljahre Workshop | Herrsching | starnberger-see | **ammersee** |
| 345 | Stressmanagement | Herrsching | starnberger-see | **ammersee** |
| 403 | Sommersonnenwende Yoga | Herrsching | starnberger-see | **ammersee** |
| 409 | SUP Yoga Training | Herrsching | starnberger-see | **ammersee** |
| 448 | Mabon Yoga | Herrsching | starnberger-see | **ammersee** |
| 142 | Meridiane & Wohlfühlpunkte | Herrsching | starnberger-see | **ammersee** |

#### → Würmtal (108 Fixes)
Events in **Gauting, Gilching, Wolfratshausen, Krailling, Planegg** die fälschlich als `starnberger-see` getaggt sind:

**Gauting** (50+ Events): IDs 12, 28, 55, 78, 86, 138, 160, 166, 197, 208, 210, 215, 218, 224, 225, 227, 230, 233, 238, 239, 241, 245, 255, 260, 266, 270, 272, 296, 305, 308, 314, 315, 318, 319, 320, 324, 331, 336, 338, 356, 358, 359, 360, 362, 372, 378, 384, 391, 402, 406, 413, 460

**Wolfratshausen** (25+ Events): IDs 23, 62, 98, 131, 164, 183, 188, 196, 219, 253, 261, 280, 295, 323, 342, 352, 367, 388, 400, 423, 425, 450, 456, 459, 464, 478, 481, 484, 494, 496

**Gilching** (20+ Events): IDs 43, 120, 121, 200, 244, 250, 256, 291, 307, 316, 322, 328, 341, 343, 348, 365, 401, 404, 431, 432, 435, 441, 457, 465

**Krailling:** ID 287  
**Planegg:** ID 349

#### → Pöcking (10 Fixes)
Events in **Niederpöcking/Pöcking** die fälschlich als `starnberger-see` getaggt sind:

| ID | Titel | Ort |
|----|-------|-----|
| 104 | Valentinstag in LA VILLA | Niederpöcking |
| 145 | Kulinarische Höhepunkte in LA VILLA | Niederpöcking |
| 162 | Genuss und Entspannung in LA VILLA | Niederpöcking |
| 267 | Ganzheitlicher Detox Day | Niederpöcking |
| 357 | Muttertag Brunch in LA VILLA | Niederpöcking |
| 426 | LA VILLA Sommerfest | Niederpöcking |
| 438 | Starnberger See Schwimmen | Pöcking |
| 488 | 30. LA VILLA Weihnachtsmarkt | Niederpöcking |
| 492 | Weihnachtsbacken im LA VILLA | Niederpöcking |

### 1.3 Catch-all `starnberg-ammersee` Events (26 Events)

Diese Events nutzen die alte Sammel-Region `starnberg-ammersee` und sollten spezifischer zugeordnet werden. Ohne Location-Match verbleiben sie dort.

---

## 2. 🏷️ Kategorien-Check

**Gültige Kategorien:** `kinder`, `familie`, `erwachsene` ✅  
**Ungültige Kategorien verwendet:** Keine ✅

### Stichproben-Prüfung (20 Events)

| ID | Titel | Kategorie | Bewertung |
|----|-------|-----------|-----------|
| 2 | Montgolfiade | erwachsene | ✅ Passt (kann auch familie) |
| 3 | Fotoausstellung | familie | ✅ OK |
| 10 | Babyballett | kinder | ✅ OK |
| 23 | Tarzan Musical | familie | ✅ OK |
| 50 | 1. Starnberger Ballnacht | erwachsene | ✅ OK |
| 83 | Kinder-Turnfasching | kinder | ✅ OK |
| 98 | Kinderfasching | kinder | ✅ OK |
| 99 | Viermal Schwarzer Kater | familie | ✅ OK |
| 117 | Kinderfasching im Silberfasan | kinder | ✅ OK |
| 122 | Karneval der Tiere Ferienkurs | kinder | ✅ OK |
| 155 | "Die Anstalt" Satire | erwachsene | ✅ OK |
| 195 | Das Dschungelbuch | familie | ✅ OK |
| 209 | Politische Bildung in Grundschulen | erwachsene | ⚠️ Fragwürdig – ist eine Fachtagung ÜBER Grundschulen, nicht FÜR Kinder |
| 303 | Toni und Max Uthoff | erwachsene | ✅ OK |
| 331 | Luise Kinseher | erwachsene | ✅ OK |
| 382 | Buch der Phantasie Ferienkurs | kinder | ✅ OK |
| 441 | Sommer Dance Camp 6-12 | kinder | ✅ OK |
| 462 | Eva Karl Faltermeier | erwachsene | ✅ OK |
| 496 | Wolfgang Krebs Weihnachts-Gala | erwachsene | ✅ OK |

**Ergebnis:** Kategorien sind zu **95%+ korrekt** zugeordnet. ID 209 ist vertretbar (Fachtagung).

---

## 3. 🎨 artTags-Check

### Schema-Inkonsistenz: `tags` vs `artTags`

| Feld | Events |
|------|--------|
| `artTags` (korrekt) | 323 |
| `tags` (legacy!) | 182 |
| Beides (artTags + tags) | 9 |
| Keines von beiden | 33 |

🔴 **182 Events** nutzen das alte Feld `tags` statt `artTags`. Diese stammen hauptsächlich von den Quellen: `tegernsee`, `gapa`, `deutsches-museum`, `olympiapark`, `hellabrunn`, `starnbergammersee`.

### Definierte vs. verwendete artTags

**Definiert (38):** musik, theater, kunst, kultur, sport, natur, markt, bildung, fest, show, indoor, tanz, yoga, wellness, meditation, radsport, radtour, wandern, schwimmen, laufen, ferienprogramm, fasching, tennis, fussball, volleyball, handball, turnen, einrad, wintersport, stockschießen, kurs, gesundheit, aromatherapie, tcm, ayurveda, zeremonie, sup, gravel

**Tatsächlich in artTags verwendet (36):** Alle bis auf `sup` und `gravel` → diese werden nie genutzt.

**In `tags` (legacy) verwendet, aber NICHT in artTags definiert:**
- `führung` ❌ (sehr häufig!)
- `workshop` ❌
- `kulinarisch` ❌
- `kinder` ❌
- `kino` ❌
- `literatur` ❌
- `brauchtum` ❌

⚠️ Beim Umbenennen von `tags` → `artTags` müssen diese 7 Tags entweder zur Definition hinzugefügt oder auf bestehende gemappt werden.

### Stichprobe artTags-Qualität

| ID | Titel | artTags | Bewertung |
|----|-------|---------|-----------|
| 1 | Führung Heinz Butz | kunst, kultur, bildung | ✅ OK |
| 5 | Das Lochmannhaus | kultur, kunst | ✅ OK |
| 9 | Handarbeits-Basteltreff | kunst | ✅ OK |
| 50 | Ballnacht | tanz, indoor | ⚠️ Fehlt: `fest` |
| 83 | Kinder-Turnfasching | fasching, turnen | ✅ OK |
| 85 | Anna Buchegger Konzert | musik | ✅ OK |
| 99 | Viermal Schwarzer Kater | theater, musik | ✅ OK |
| 140 | MuMM! Mut- und Mitmachtage | fest, bildung | ✅ OK |
| 169 | Ergorudern Meisterschaft | sport | ✅ OK |
| 251 | Tanzperformance | tanz, kunst | ✅ OK |

---

## 4. 🔄 Duplikaten-Check

**2 Duplikat-Gruppen gefunden:**

### Duplikat 1: "Die Demokratie des Waldes" (2026-02-06)
| ID | Location | Source | Region |
|----|----------|--------|--------|
| 17 | Herrsching | herrsching-gemeinde | starnberger-see |
| 18 | Wartaweil 77 | starnbergammersee | starnberg-ammersee |

**Empfehlung:** ID 18 entfernen (ID 17 hat präzisere Quelle), oder mergen.

### Duplikat 2: "Weiberfasching" (2026-02-12)
| ID | Location | Source | Region |
|----|----------|--------|--------|
| 84 | Berger Straße 5 | starnbergammersee | starnberg-ammersee |
| 87 | BecCult | beccult | poecking |

**Empfehlung:** Prüfen ob gleicher Veranstaltungsort (BecCult = Berger Straße 5 in Pöcking). Eines entfernen.

---

## 5. 📋 Daten-Konsistenz

| Check | Ergebnis |
|-------|----------|
| Events ohne Titel | 0 ✅ |
| Events ohne Datum | 0 ✅ |
| Ungültiges Datumsformat | 0 ✅ |
| Ungültiges Zeitformat | 0 ✅ |
| Events ohne Location | 0 ✅ |

### Vergangene Events (1)

| ID | Titel | Datum |
|----|-------|-------|
| 1 | Führung Ausstellung Heinz Butz | 2026-01-22 |

**Empfehlung:** Entfernen oder Datum aktualisieren (Ausstellung läuft laut Description bis Mai 2026).

---

## 🔧 Empfohlene Fixes

### Priorität 1: Regionen-Definition aktualisieren
Die `regions`-Definition muss um `starnberger-see`, `ammersee` und `wuermtal` erweitert werden. `starnberg-ammersee` kann als Fallback bleiben oder durch die drei spezifischen Regionen ersetzt werden.

### Priorität 2: 154 Region-Zuordnungen korrigieren
Automatisch anwendbar über das `fixes`-Objekt unten.

### Priorität 3: `tags` → `artTags` Feld umbenennen
182 Events betroffen. Zusätzlich 7 neue Tag-Werte in `artTags`-Definition aufnehmen: `führung`, `workshop`, `kulinarisch`, `kinder`, `kino`, `literatur`, `brauchtum`.

### Priorität 4: Duplikate bereinigen
2 Duplikat-Gruppen manuell prüfen und eines je Paar entfernen.

### Priorität 5: Vergangenes Event
ID 1 entfernen oder Datum aktualisieren.

---

## 🔩 Fixes JSON

```json
{
  "regionsDefinition": {
    "action": "replace",
    "path": "regions",
    "value": {
      "poecking": { "name": "Pöcking", "emoji": "🏠" },
      "starnberger-see": { "name": "Starnberger See", "emoji": "🏔️" },
      "ammersee": { "name": "Ammersee", "emoji": "⛵" },
      "muenchen": { "name": "München", "emoji": "🏙️" },
      "tegernsee": { "name": "Tegernsee", "emoji": "⛰️" },
      "werdenfels": { "name": "Werdenfelser Land", "emoji": "🎿" },
      "wuermtal": { "name": "Würmtal", "emoji": "🌳" }
    }
  },
  "artTagsDefinitionAdd": ["führung", "workshop", "kulinarisch", "kinder", "kino", "literatur", "brauchtum"],
  "regionFixes": [
    { "id": 10, "region": "ammersee" },
    { "id": 12, "region": "wuermtal" },
    { "id": 17, "region": "ammersee" },
    { "id": 23, "region": "wuermtal" },
    { "id": 24, "region": "ammersee" },
    { "id": 28, "region": "wuermtal" },
    { "id": 43, "region": "wuermtal" },
    { "id": 46, "region": "ammersee" },
    { "id": 48, "region": "ammersee" },
    { "id": 55, "region": "wuermtal" },
    { "id": 62, "region": "wuermtal" },
    { "id": 66, "region": "ammersee" },
    { "id": 69, "region": "ammersee" },
    { "id": 78, "region": "wuermtal" },
    { "id": 86, "region": "wuermtal" },
    { "id": 88, "region": "ammersee" },
    { "id": 91, "region": "ammersee" },
    { "id": 98, "region": "wuermtal" },
    { "id": 104, "region": "poecking" },
    { "id": 111, "region": "ammersee" },
    { "id": 119, "region": "ammersee" },
    { "id": 120, "region": "wuermtal" },
    { "id": 121, "region": "wuermtal" },
    { "id": 131, "region": "wuermtal" },
    { "id": 133, "region": "ammersee" },
    { "id": 136, "region": "ammersee" },
    { "id": 138, "region": "wuermtal" },
    { "id": 142, "region": "ammersee" },
    { "id": 145, "region": "poecking" },
    { "id": 147, "region": "ammersee" },
    { "id": 151, "region": "ammersee" },
    { "id": 160, "region": "wuermtal" },
    { "id": 162, "region": "poecking" },
    { "id": 164, "region": "wuermtal" },
    { "id": 166, "region": "wuermtal" },
    { "id": 171, "region": "ammersee" },
    { "id": 177, "region": "ammersee" },
    { "id": 182, "region": "ammersee" },
    { "id": 183, "region": "wuermtal" },
    { "id": 188, "region": "wuermtal" },
    { "id": 194, "region": "ammersee" },
    { "id": 196, "region": "wuermtal" },
    { "id": 197, "region": "wuermtal" },
    { "id": 199, "region": "ammersee" },
    { "id": 200, "region": "wuermtal" },
    { "id": 208, "region": "wuermtal" },
    { "id": 210, "region": "wuermtal" },
    { "id": 215, "region": "wuermtal" },
    { "id": 218, "region": "wuermtal" },
    { "id": 219, "region": "wuermtal" },
    { "id": 223, "region": "ammersee" },
    { "id": 224, "region": "wuermtal" },
    { "id": 225, "region": "wuermtal" },
    { "id": 227, "region": "wuermtal" },
    { "id": 228, "region": "ammersee" },
    { "id": 230, "region": "wuermtal" },
    { "id": 233, "region": "wuermtal" },
    { "id": 237, "region": "ammersee" },
    { "id": 238, "region": "wuermtal" },
    { "id": 239, "region": "wuermtal" },
    { "id": 241, "region": "wuermtal" },
    { "id": 243, "region": "ammersee" },
    { "id": 244, "region": "wuermtal" },
    { "id": 245, "region": "wuermtal" },
    { "id": 250, "region": "wuermtal" },
    { "id": 252, "region": "ammersee" },
    { "id": 253, "region": "wuermtal" },
    { "id": 255, "region": "wuermtal" },
    { "id": 256, "region": "wuermtal" },
    { "id": 257, "region": "ammersee" },
    { "id": 258, "region": "ammersee" },
    { "id": 260, "region": "wuermtal" },
    { "id": 261, "region": "wuermtal" },
    { "id": 263, "region": "ammersee" },
    { "id": 266, "region": "wuermtal" },
    { "id": 267, "region": "poecking" },
    { "id": 268, "region": "ammersee" },
    { "id": 270, "region": "wuermtal" },
    { "id": 272, "region": "wuermtal" },
    { "id": 280, "region": "wuermtal" },
    { "id": 281, "region": "ammersee" },
    { "id": 282, "region": "ammersee" },
    { "id": 287, "region": "wuermtal" },
    { "id": 291, "region": "wuermtal" },
    { "id": 293, "region": "ammersee" },
    { "id": 295, "region": "wuermtal" },
    { "id": 296, "region": "wuermtal" },
    { "id": 305, "region": "wuermtal" },
    { "id": 307, "region": "wuermtal" },
    { "id": 308, "region": "wuermtal" },
    { "id": 312, "region": "ammersee" },
    { "id": 314, "region": "wuermtal" },
    { "id": 315, "region": "wuermtal" },
    { "id": 316, "region": "wuermtal" },
    { "id": 318, "region": "wuermtal" },
    { "id": 319, "region": "wuermtal" },
    { "id": 320, "region": "wuermtal" },
    { "id": 322, "region": "wuermtal" },
    { "id": 323, "region": "wuermtal" },
    { "id": 324, "region": "wuermtal" },
    { "id": 328, "region": "wuermtal" },
    { "id": 331, "region": "wuermtal" },
    { "id": 336, "region": "wuermtal" },
    { "id": 338, "region": "wuermtal" },
    { "id": 341, "region": "wuermtal" },
    { "id": 342, "region": "wuermtal" },
    { "id": 343, "region": "wuermtal" },
    { "id": 345, "region": "ammersee" },
    { "id": 348, "region": "wuermtal" },
    { "id": 349, "region": "wuermtal" },
    { "id": 352, "region": "wuermtal" },
    { "id": 356, "region": "wuermtal" },
    { "id": 357, "region": "poecking" },
    { "id": 358, "region": "wuermtal" },
    { "id": 359, "region": "wuermtal" },
    { "id": 360, "region": "wuermtal" },
    { "id": 362, "region": "wuermtal" },
    { "id": 365, "region": "wuermtal" },
    { "id": 367, "region": "wuermtal" },
    { "id": 372, "region": "wuermtal" },
    { "id": 378, "region": "wuermtal" },
    { "id": 384, "region": "wuermtal" },
    { "id": 388, "region": "wuermtal" },
    { "id": 391, "region": "wuermtal" },
    { "id": 400, "region": "wuermtal" },
    { "id": 401, "region": "wuermtal" },
    { "id": 402, "region": "wuermtal" },
    { "id": 403, "region": "ammersee" },
    { "id": 404, "region": "wuermtal" },
    { "id": 406, "region": "wuermtal" },
    { "id": 409, "region": "ammersee" },
    { "id": 413, "region": "wuermtal" },
    { "id": 423, "region": "wuermtal" },
    { "id": 425, "region": "wuermtal" },
    { "id": 426, "region": "poecking" },
    { "id": 431, "region": "wuermtal" },
    { "id": 432, "region": "wuermtal" },
    { "id": 435, "region": "wuermtal" },
    { "id": 438, "region": "poecking" },
    { "id": 441, "region": "wuermtal" },
    { "id": 448, "region": "ammersee" },
    { "id": 450, "region": "wuermtal" },
    { "id": 456, "region": "wuermtal" },
    { "id": 457, "region": "wuermtal" },
    { "id": 459, "region": "wuermtal" },
    { "id": 460, "region": "wuermtal" },
    { "id": 464, "region": "wuermtal" },
    { "id": 465, "region": "wuermtal" },
    { "id": 478, "region": "wuermtal" },
    { "id": 481, "region": "wuermtal" },
    { "id": 484, "region": "wuermtal" },
    { "id": 488, "region": "poecking" },
    { "id": 492, "region": "poecking" },
    { "id": 494, "region": "wuermtal" },
    { "id": 496, "region": "wuermtal" }
  ],
  "tagFieldRename": [2, 3, 4, 7, 8, 11, 15, 16, 18, 19, 20, 21, 26, 30, 31, 33, 34, 37, 38, 39, 40, 45, 47, 49, 51, 52, 53, 56, 57, 58, 59, 60, 61, 63, 64, 67, 70, 72, 82, 84, 87, 90, 93, 94, 97, 100, 102, 103, 105, 106, 108, 109, 110, 114, 116, 123, 125, 127, 128, 129, 130, 132, 135, 139, 143, 144, 149, 152, 156, 157, 158, 161, 167, 170, 175, 184, 191, 198, 205, 211, 214, 216, 220, 235, 248, 254, 262, 271, 273, 274, 277, 283, 284, 289, 292, 294, 301, 304, 309, 310, 311, 313, 321, 325, 326, 329, 332, 334, 335, 339, 340, 344, 353, 354, 364, 366, 368, 369, 370, 371, 373, 374, 375, 376, 379, 381, 386, 389, 393, 394, 396, 399, 405, 408, 410, 414, 415, 416, 424, 428, 429, 430, 437, 443, 445, 446, 449, 452, 455, 463, 466, 467, 469, 471, 473, 474, 475, 476, 479, 480, 482, 487, 489, 490, 491, 495, 497, 498, 500, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514],
  "pastEvents": [{ "id": 1, "action": "remove_or_update_date" }],
  "duplicates": [
    { "keep": 17, "remove": 18, "reason": "Die Demokratie des Waldes – 2026-02-06" },
    { "keep": 87, "remove": 84, "reason": "Weiberfasching – 2026-02-12 (manuell prüfen)" }
  ]
}
```

---

*Report generiert am 2026-02-05 von Content-QA-Agent*
