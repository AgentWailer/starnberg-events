# Lokale Informationen Starnberger See
> Recherchiert am: 2026-02-03
> Status: Bereit für Astro-Integration

---

## 🚢 Schifffahrt Starnberger See - Fahrplan 2026

### Saisons
| Saison | Zeitraum | Betrieb |
|--------|----------|---------|
| **Vorsaison** | 05.04. - 30.04.2026 | täglich + Sa/So/Feiertage zusätzlich |
| **Hauptsaison** | 01.05. - 04.10.2026 | täglich |
| **Nachsaison** | 05.10. - 18.10.2026 | täglich + Sa/So/Feiertage zusätzlich |

### Anlegestellen (von Nord nach Süd)
1. **Starnberg** (Bahnhof/Schiffsanlegestelle) - Hauptanleger
2. **Berg**
3. **Leoni**
4. **Possenhofen**
5. **Tutzing** (Ortsmitte) - wichtiger Umsteigeknoten
6. **Bernried** (Buchheim Museum)
7. **Seeshaupt** - südlichster Anleger
8. **Ambach** (Ostufer)

### Rundfahrten
```yaml
große_rundfahrt:
  dauer: "ca. 3 Std. 40 Min."
  route: "Komplette Seeumrundung"
  
südliche_rundfahrt:
  dauer: "ca. 1 Std. 30 Min."
  route: "Tutzing - Bernried - Seeshaupt - Ambach - Tutzing"
  
nördliche_rundfahrt:
  dauer: "ca. 2 Std."
  route: "Starnberg - Berg - Leoni - Possenhofen - Tutzing"
  
kurzrundfahrt:
  dauer: "ca. 1 Std."
  route: "Kurze Tour im Nordbereich"
```

### Abfahrtszeiten Starnberg → Süden (Hauptsaison)
| Starnberg ab | Berg | Leoni | Possenhofen | Tutzing an |
|-------------|------|-------|-------------|------------|
| 10:15 | 10:27 | 10:37 | 10:50 | 11:14 |
| 10:55 | 11:07 | 11:17 | 11:30 | 11:54 |
| 11:35 | - | - | - | 12:15 |
| 13:20 | 13:32 | 13:42 | 13:55 | 14:19 |
| 14:30 | 14:42 | 14:52 | 15:05 | 15:29 |
| 15:55 | 16:07 | 16:17 | 16:30 | - |
| 17:15 | 17:27 | 17:37 | 17:50 | - |

### Kontakt
```yaml
verwaltung:
  name: "Schifffahrt Starnberger See"
  adresse: "Nepomukweg 4, 82319 Starnberg"
  telefon: "+49 8151 8061"
  email: "starnbergersee@seenschifffahrt.de"
  website: "https://www.seenschifffahrt.de"
  
gastronomie:
  name: "Schiffsgastronomie Paul Müller"
  telefon: "+49 8151 277060"
  email: "starnberg@paulmueller.net"
```

### Hinweise für Website
- ⚠️ Nebel/Sturm/Hochwasser → Verspätungen/Ausfälle möglich
- 🚲 Fahrradmitnahme begrenzt möglich
- ♿ Behindertenfreundliche Ausstattung
- 🍽️ Gaststättenbetrieb + Getränkeautomaten an Bord
- Aktuellen Schiffseinsatzplan auf seenschifffahrt.de prüfen

---

## 🛒 Wochenmärkte in der Region

### Starnberg
```yaml
standort: "Kirchplatz"
ausweichstandort: "Bahnhofsrondell (bei Veranstaltungen am Kirchplatz)"
tage:
  - tag: "Donnerstag"
    zeit: "vormittags" # genaue Uhrzeit auf Website prüfen
  - tag: "Samstag"
    zeit: "vormittags"
website: "https://www.starnberg.de/kultur-freizeit/einkaufs-und-erlebnisstadt/wochenmaerkte/"
kontakt: "Wochenmarkt@starnberg.de"
```

### Starnberg-Söcking
```yaml
standort: "Pfarrkirche Sankt Ulrich"
tage:
  - tag: "Freitag"
    zeit: "vormittags"
```

### Pöcking
```yaml
info: "Auf Website unter 'Tourismus & Freizeit > Veranstaltungen > Märkte & Feste'"
website: "https://www.poecking.de"
hinweis: "Detaillierte Marktinfos auf Gemeinde-Website prüfen"
```

### Tutzing
```yaml
website: "https://tutzing.de"
hinweis: "Keine Wochenmarkt-Info auf Hauptseite gefunden"
empfehlung: "Gemeinde direkt kontaktieren: 08158-2502-0"
```

### Feldafing
```yaml
website: "https://www.feldafing.de"
hinweis: "Keine Wochenmarkt-Info gefunden"
```

### Berg
```yaml
website: "https://www.gemeinde-berg.de"
hinweis: "Keine Wochenmarkt-Info gefunden"
```

---

## 📹 Webcams am Starnberger See

### BYC Starnberg (Bayerischer Yacht-Club)
```yaml
status: "✅ VERFÜGBAR"
url: "https://www.byc.de/webcams-wetter/"
standort: "Starnberg, Yachthafen"
features:
  - "Live-Webcam"
  - "Wetterdaten"
  - "Windstärke-Tabelle"
einbettbar: "Unklar - JavaScript-basiert, prüfen ob iframe möglich"
hinweis: "Seite enthält DSGVO-Hinweis zur Webcam (PDF verfügbar)"
```

### DTYC Tutzing (Deutscher Touring Yacht-Club)
```yaml
status: "❌ TEMPORÄR NICHT VERFÜGBAR"
url: "https://www.dtyc.de/webcam"
meldung: "Webcams und Wetterdaten derzeit nicht abrufbar - wir arbeiten daran"
kontakt:
  adresse: "Seestraße 18, 82327 Tutzing"
  telefon: "+49 8158 6941"
  email: "info@dtyc.de"
```

### Feldafing
```yaml
status: "❓ NICHT GEFUNDEN"
hinweis: "Keine öffentliche Webcam auf Gemeinde-Website"
```

### Alternative Webcam-Quellen
```yaml
starnbergammersee:
  url: "https://www.starnbergammersee.de"
  hinweis: "Tourismus-Portal - evtl. Webcam-Übersicht vorhanden"
```

---

## 🏛️ Gemeinde-Kontakte

### Starnberg
```yaml
website: "https://www.starnberg.de"
tourist_info: "https://www.starnbergammersee.de/"
```

### Pöcking
```yaml
website: "https://www.poecking.de"
sehenswürdigkeiten:
  - "Kaiserin Elisabeth Museum"
  - "Schloss Possenhofen"
  - "Maisinger See"
kulturangebote:
  - "Kulturmontag"
  - "beccult - Haus der Bürger und Vereine"
  - "Literaturcafé Waschhäusl"
```

### Feldafing
```yaml
website: "https://www.feldafing.de"
```

### Tutzing
```yaml
website: "https://tutzing.de"
adresse: "Kirchenstraße 9, 82327 Tutzing"
telefon: "08158-2502-0"
oeffnungszeiten:
  montag: "08:00-12:00"
  dienstag: "08:00-12:00 + 14:00-18:00"
  mittwoch: "geschlossen"
  donnerstag: "08:00-12:00"
  freitag: "08:00-12:00"
fairtrade: true
```

### Berg
```yaml
website: "https://www.gemeinde-berg.de"
```

---

## 📊 Für Astro-Komponenten

### Empfohlene Datenstruktur
```typescript
// types/local-info.ts
interface Fahrplan {
  saison: 'vor' | 'haupt' | 'nach';
  startDatum: string;
  endDatum: string;
  abfahrten: Abfahrt[];
}

interface Abfahrt {
  von: string;
  nach: string;
  zeit: string;
  schiffNr?: number;
}

interface Wochenmarkt {
  ort: string;
  standort: string;
  tage: { tag: string; zeit: string }[];
  website?: string;
}

interface Webcam {
  name: string;
  status: 'online' | 'offline' | 'unknown';
  url: string;
  embedUrl?: string;
}
```

### Komponenten-Ideen
1. **SchifffahrtWidget** - Nächste Abfahrt ab Starnberg
2. **WochenmarktBadge** - "Heute ist Markt!" wenn zutreffend
3. **WebcamCarousel** - Verfügbare Webcams rotieren
4. **SaisonAnzeige** - Aktuelle Schifffahrt-Saison anzeigen

---

## ⚠️ Offene Punkte / TODO

- [ ] Genaue Uhrzeiten für Wochenmärkte Starnberg recherchieren
- [ ] Pöcking Markttermine verifizieren
- [ ] BYC Webcam auf iframe-Einbettbarkeit testen
- [ ] DTYC Webcam Status regelmäßig prüfen
- [ ] Fährplan-PDF automatisches Update einrichten
- [ ] Veranstaltungskalender der Gemeinden integrieren

---

*Quelle: Offizielle Gemeinde-Websites und seenschifffahrt.de*
*Letzte Aktualisierung: 2026-02-03*
