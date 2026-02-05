# Rechtliches Audit: starnberg-events.pages.dev

**Datum:** 5. Februar 2026  
**Gegenstand:** Website starnberg-events.pages.dev  
**Betriebsart:** Deutschsprachige Event-Uebersicht fuer die Region Starnberg/Poecking  
**Hosting:** Cloudflare Pages (CDN: Cloudflare-Netzwerk)  
**Rechtsrahmen:** Deutsches Recht (TMG, MStV, DSGVO, TTDSG, UrhG, UWG)

> **HINWEIS:** Dieses Dokument stellt ein technisches Audit dar und ersetzt keine anwaltliche Rechtsberatung. Die finalen Impressums- und Datenschutztexte sollten vor Veroeffentlichung von einem auf IT-Recht spezialisierten Rechtsanwalt geprueft werden. Alle Angaben ohne Gewaehr.

---

## 1. Executive Summary

### Gesamtbewertung: KRITISCH — Sofortiger Handlungsbedarf

Die Website weist **mehrere schwerwiegende rechtliche Maengel** auf, die unmittelbar behoben werden muessen:

| Bereich | Status | Risiko |
|---------|--------|--------|
| Impressum | FEHLT KOMPLETT | KRITISCH |
| Datenschutzerklaerung | FEHLT KOMPLETT | KRITISCH |
| Google Fonts (extern) | DSGVO-Verstoss | KRITISCH |
| Cookie-/Speicherhinweis | Nicht vorhanden | NIEDRIG |
| KI-Kennzeichnung | Nicht vorhanden | WICHTIG |
| Haftungsausschluss | Nicht vorhanden | WICHTIG |
| Urheberrecht (Event-Daten) | Ungeklaert | WICHTIG |

**Dringendste Massnahmen:**
1. Impressum erstellen und einbinden
2. Google Fonts self-hosten (statt dynamisches Laden von Google-Servern)
3. Datenschutzerklaerung erstellen und einbinden
4. KI-generierte Inhalte kennzeichnen

---

## 2. Detaillierte Analyse

### 2.1 Impressumspflicht (Paragraf 5 TMG / Paragraf 18 MStV)

#### 2.1.1 Besteht eine Impressumspflicht?

**Ja, mit hoher Wahrscheinlichkeit.**

Paragraf 5 Abs. 1 TMG verpflichtet Diensteanbieter, die geschaeftsmaessige, in der Regel gegen Entgelt angebotene Telemedien bereithalten, ein Impressum vorzuhalten. Der Begriff "geschaeftsmaessig" wird von Gerichten weit ausgelegt:

- Die Website ist **oeffentlich zugaenglich** und richtet sich an ein breites Publikum
- Sie aggregiert Daten aus **kommerziellen Quellen** (beccult.de, starnbergammersee.de, muenchen.de, etc.)
- Sie verlinkt auf **kommerzielle Angebote** (Event-Tickets, Veranstaltungsorte)
- Es besteht mindestens eine **wirtschaftliche Naehe** durch die Bereitstellung von Informationsdiensten

Selbst wenn das Projekt rein privat und ohne Gewinnerzielungsabsicht betrieben wird, greift die Impressumspflicht nach herrschender Meinung bei "oeffentlich zugaenglichen" Websites mit regelmaessig aktualisierten Inhalten. Das Projekt hat den Charakter eines redaktionellen Informationsdienstes.

Zusaetzlich: Paragraf 18 Abs. 2 MStV (Medienstaatsvertrag) verlangt fuer Telemedien mit journalistisch-redaktionell gestalteten Angeboten die Angabe eines inhaltlich Verantwortlichen. Die kuratierte Darstellung von Event-Daten mit KI-generierten Zusammenfassungen und Bewertungen (AI Curation Scores) spricht fuer einen redaktionellen Charakter.

#### 2.1.2 Erforderliche Angaben

| Angabe | Rechtsgrundlage | Erforderlich |
|--------|----------------|--------------|
| Vollstaendiger Name (Vor- und Nachname) | Paragraf 5 Abs. 1 Nr. 1 TMG | Ja |
| Postanschrift (kein Postfach) | Paragraf 5 Abs. 1 Nr. 1 TMG | Ja |
| E-Mail-Adresse | Paragraf 5 Abs. 1 Nr. 2 TMG | Ja |
| Weitere schnelle elektronische Kontaktaufnahme | Paragraf 5 Abs. 1 Nr. 2 TMG | Ja (z.B. Kontaktformular oder Telefon) |
| Inhaltlich Verantwortlicher (bei redaktionellem Inhalt) | Paragraf 18 Abs. 2 MStV | Empfohlen |

Bei einem rein privaten Projekt (natuerliche Person, kein Gewerbe):
- Keine USt-IdNr. erforderlich
- Keine Handelsregisternummer erforderlich
- Kein Berufsverband erforderlich

#### 2.1.3 Erreichbarkeit: "Zwei-Klicks-Regel"

Das Impressum muss von **jeder Unterseite** aus mit maximal zwei Klicks erreichbar sein (BGH, Urteil vom 20.07.2006, Az. I ZR 228/03). Es muss "leicht erkennbar, unmittelbar erreichbar und staendig verfuegbar" sein.

**Aktueller Stand:** Kein Impressum vorhanden. Weder im Footer noch als eigene Seite. Die einzigen Links im Footer verweisen auf externe Quellen (beccult, starnbergammersee.de, muenchen.de).

**Befund: KRITISCH** — Verstoss gegen Paragraf 5 TMG. Bussgeld bis 50.000 EUR moeglich. Abmahngefahr durch Wettbewerber oder Wettbewerbsverbaende.

---

### 2.2 Datenschutzerklaerung (Art. 13/14 DSGVO)

#### 2.2.1 Besteht eine Pflicht?

**Ja, unbedingt.**

Bereits der blosse Aufruf der Website fuehrt zu Datenverarbeitungen (IP-Adressen, HTTP-Header). Art. 13 DSGVO verlangt, dass betroffene Personen bei Erhebung personenbezogener Daten umfassend informiert werden.

#### 2.2.2 Identifizierte Datenverarbeitungsvorgaenge

Die Code-Analyse der Website ergibt folgende Verarbeitungstaetigkeiten:

**a) Cloudflare Pages / CDN (Hosting)**
- **Daten:** IP-Adresse, User-Agent, Referrer, Zeitstempel bei jedem Seitenaufruf
- **Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse)
- **Auftragsverarbeitung:** Cloudflare Inc. (US-Unternehmen) ist Auftragsverarbeiter. Datentransfer in die USA erfordert angemessene Garantien (EU-US Data Privacy Framework, ggf. SCCs)
- **Pflicht:** Auftragsverarbeitungsvertrag (AVV/DPA) mit Cloudflare erforderlich. Cloudflare stellt diesen standardmaessig bereit (Self-Serve Subscription Agreement + DPA)

**b) Google Fonts (KRITISCH)**
- **Quelle im Code:** `Layout.astro`, Zeilen mit `fonts.googleapis.com` und `fonts.gstatic.com`
- **Geladene Schriftart:** "Space Grotesk" (Weights 400, 500, 600, 700)
- **Daten:** IP-Adresse wird bei jedem Seitenaufruf an Google-Server (USA) uebertragen
- **Rechtslage:** Das LG Muenchen I hat am 20.01.2022 (Az. 3 O 17493/20) entschieden, dass die dynamische Einbindung von Google Fonts ohne Einwilligung gegen Art. 6 Abs. 1 DSGVO und das Recht auf informationelle Selbstbestimmung (Paragraf 823 Abs. 1 BGB i.V.m. Art. 2 Abs. 1, Art. 1 Abs. 1 GG) verstoesst. Dem Klaeger wurden 100 EUR Schadensersatz zugesprochen
- **Massenfach-Abmahnungen:** Seit dem Urteil gab es eine Welle von (teil-)gewerblichen Abmahnungen. Auch wenn viele davon als rechtsmissbraeuchlich eingestuft wurden, bleibt der grundlegende DSGVO-Verstoss bestehen
- **Loesung:** Google Fonts MUSS lokal eingebunden (self-hosted) werden. Die Schriftart "Space Grotesk" ist Open Source (OFL-Lizenz) und kann problemlos heruntergeladen und vom eigenen Server ausgeliefert werden

**Befund: KRITISCH** — Sofort beheben. Jeder Seitenaufruf ist ein eigenstaendiger DSGVO-Verstoss.

**c) Open-Meteo API (api.open-meteo.com)**
- **Zweck:** Wetterdaten-Abruf (Temperatur, Wettercode, Sonnenauf-/untergang fuer Starnberger See)
- **Daten:** IP-Adresse des Nutzers wird an Open-Meteo-Server uebertragen (API-Aufruf erfolgt clientseitig im Browser per JavaScript in `WeatherWidget.astro`)
- **Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Bereitstellung ortsbezogener Wetterdaten)
- **Hinweis:** Open-Meteo ist ein Open-Source-Projekt mit Servern in der EU (Deutschland). Das Datenschutzrisiko ist vergleichsweise gering, muss aber in der Datenschutzerklaerung erwaehnt werden

**d) DB IRIS API / transport.rest API (via Cloudflare Worker)**
- **Zweck:** Echtzeit-S-Bahn-Daten (Abfahrten S6 Possenhofen)
- **Architektur:** 
  - Der Client ruft den eigenen Cloudflare Worker auf (`train-tracker.steffenvonlindern-be7.workers.dev/api/live`)
  - Der Worker ruft seinerseits die DB IRIS API (`iris.noncd.db.de`) und ggf. `v6.db.transport.rest` auf
  - Der Worker speichert Daten in Cloudflare D1 (Datenbank)
- **Daten bei Client-Aufruf:** IP-Adresse wird an Cloudflare Worker uebertragen
- **Vorteil:** Da der Worker als Proxy fungiert, wird die IP des Nutzers NICHT direkt an die DB-APIs uebertragen. Der Worker-Aufruf faellt unter Cloudflare-Hosting (gleicher AVV)
- **S6-Unterseite (`/s6`):** Ruft den Worker direkt vom Browser auf. Cloudflare Worker = gleicher Cloudflare-AVV

**e) localStorage-Nutzung**
- **Zweck:** 
  - Theme-Einstellung (dark/light Mode): `theme` Key
  - Favoriten: `favorites` Key (EventCard.astro)
  - Collapsible-Sections-Zustand
- **Daten:** Reine Funktionspraeferenzen, keine personenbezogenen Daten im engeren Sinne
- **Rechtsgrundlage:** Art. 6 Abs. 1 lit. f DSGVO / Paragraf 25 Abs. 2 Nr. 2 TTDSG (technisch notwendig)
- **Hinweis:** localStorage ist technisch kein Cookie, faellt aber unter Paragraf 25 TTDSG ("Speichern von und Zugriff auf Informationen in Endeinrichtungen"). Die Ausnahme fuer technisch notwendige Speicherung (Paragraf 25 Abs. 2 Nr. 2 TTDSG) greift hier, da die Speicherung der Theme-Praeferenz vom Nutzer ausdruecklich angefordert wird (Toggle-Button) und fuer die Bereitstellung des Dienstes erforderlich ist

**f) Cloudflare Workers AI**
- **Zweck:** KI-generierte Analyse der S-Bahn-Puenktlichkeitsdaten (Endpunkt `/api/ai-insight`)
- **Modell:** `@cf/openai/gpt-oss-120b` (Workers AI)
- **Daten:** Aggregierte Statistikdaten (keine personenbezogenen Daten der Nutzer) werden an das AI-Modell uebergeben. Die Verarbeitung findet innerhalb der Cloudflare-Infrastruktur statt
- **Personenbezug:** Gering, da nur aggregierte Statistiken verarbeitet werden, keine Nutzerdaten
- **Datenschutzerklaerung:** Sollte dennoch erwaehnt werden (Transparenzpflicht)

**g) AI Curation (Event-Bewertungen)**
- **Quelle:** `ai-curation/` Verzeichnis — vorberechnete JSON-Dateien mit KI-Bewertungen
- **Daten:** Statische, vorberechnete Bewertungen; kein API-Aufruf zur Laufzeit durch den Nutzer
- **Personenbezug:** Keiner. Reine Inhaltsaufbereitung

#### 2.2.3 Zusammenfassung: Erforderliche Inhalte der Datenschutzerklaerung

1. Name und Kontaktdaten des Verantwortlichen
2. Zweck und Rechtsgrundlage jeder Verarbeitung
3. Cloudflare als Auftragsverarbeiter (CDN, Workers, D1, Pages) inkl. Hinweis auf Datentransfer USA
4. Google Fonts — ENTFAELLT nach Self-Hosting (dann nicht mehr relevant)
5. Open-Meteo API (Wetterdaten)
6. localStorage / TTDSG-Ausnahme
7. Workers AI / KI-generierte Inhalte
8. Betroffenenrechte (Auskunft, Berichtigung, Loeschung, Einschraenkung, Widerspruch, Datenuebertragbarkeit)
9. Beschwerderecht bei der Aufsichtsbehoerde (BayLDA fuer Bayern)
10. Keine Cookies, kein Tracking, kein Profiling
11. Speicherdauer / Loeschfristen
12. SSL/TLS-Verschluesselung

**Befund: KRITISCH** — Keine Datenschutzerklaerung vorhanden. Verstoss gegen Art. 13 DSGVO.

---

### 2.3 Cookie-Hinweis / TTDSG-Analyse

#### 2.3.1 Werden Cookies gesetzt?

**Nein.** Die Code-Analyse zeigt:
- Kein Google Analytics
- Kein Matomo
- Keine Werbe-Tracker
- Keine Marketing-Cookies
- Keine Social-Media-Plugins
- Kein Facebook Pixel

Cloudflare setzt ggf. technische Cookies (z.B. `__cf_bm` fuer Bot-Management), diese fallen aber unter die Ausnahme fuer technisch notwendige Cookies.

#### 2.3.2 localStorage und TTDSG

Paragraf 25 TTDSG regelt den Zugriff auf Informationen in Endeinrichtungen (Browser des Nutzers). Dies umfasst neben Cookies auch localStorage, sessionStorage, IndexedDB, etc.

Die Website nutzt localStorage fuer:
- **Theme-Praeferenz:** Vom Nutzer explizit per Toggle angefordert
- **Favoriten:** Vom Nutzer explizit durch Interaktion gespeichert
- **Collapsible-Sections:** UI-Zustand

All diese Faelle fallen unter **Paragraf 25 Abs. 2 Nr. 2 TTDSG** (Ausnahme: "unbedingt erforderlich, damit der Anbieter eines Telemediendienstes einen vom Nutzer ausdruecklich gewuenschten Telemediendienst zur Verfuegung stellen kann").

#### 2.3.3 Ergebnis

**Ein Cookie-Banner / Consent-Banner ist NICHT erforderlich**, solange:
- Keine Cookies ausser technisch notwendigen gesetzt werden
- localStorage nur fuer nutzerseitig angeforderte Funktionen genutzt wird
- Google Fonts self-hosted wird (sonst waere eine Einwilligung noetig)
- Kein Tracking/Analytics eingesetzt wird

**Empfehlung:** In der Datenschutzerklaerung auf die localStorage-Nutzung und den Verzicht auf Cookies hinweisen. Kein separater Banner noetig.

**Befund: NIEDRIG** — Kein Cookie-Banner erforderlich bei aktuellem Setup (nach Behebung des Google-Fonts-Problems).

---

### 2.4 KI-Kennzeichnung

#### 2.4.1 EU AI Act (KI-Verordnung)

Die EU-KI-Verordnung (Verordnung (EU) 2024/1689) tritt schrittweise in Kraft. Art. 50 Abs. 1 verlangt ab Februar 2025 eine Kennzeichnungspflicht fuer KI-generierte Inhalte:

> "Anbieter von KI-Systemen [...] stellen sicher, dass [...] kuenstlich erzeugte oder manipulierte Text-, Audio- oder Bildinhalte [...] in einem maschinenlesbaren Format gekennzeichnet werden und als kuenstlich erzeugt oder manipuliert erkennbar sind."

Die Website nutzt KI an zwei Stellen:
1. **Workers AI:** Generiert Textanalysen der S-Bahn-Puenktlichkeitsdaten (auf der /s6-Seite)
2. **AI Curation:** Vorberechnete Bewertungen/Zusammenfassungen fuer Events (aiSummary, bestFor, Scores)

#### 2.4.2 Handlungsbedarf

- **S6-Analyse:** Wird bereits als "KI-Analyse" gekennzeichnet (Sektionsueberschrift im HTML). Empfehlung: Zusaetzlich angeben, dass der Text automatisch generiert wurde und keine redaktionelle Pruefung stattfindet
- **Event-Curation (aiSummary, Scores):** Wird NICHT als KI-generiert gekennzeichnet. Die Scores (z.B. "8/10") und Zusammenfassungen koennten von Nutzern als redaktionelle Bewertungen missverstanden werden

**Befund: WICHTIG** — KI-generierte Inhalte muessen transparent gekennzeichnet werden, insbesondere die AI Curation Scores und Zusammenfassungen.

---

### 2.5 Urheberrecht

#### 2.5.1 Event-Daten von Drittquellen

Die Website aggregiert Event-Daten aus folgenden Quellen:
- beccult.de (Poecking)
- starnbergammersee.de (regional)
- muenchen.de (Stadt Muenchen)
- olympiapark.de
- hellabrunn.de
- deutsches-museum.de
- tegernsee.com
- gapa-tourismus.de
- pfc.de (PFC Poecking)

**Rechtliche Bewertung:**

a) **Urheberrecht an Einzeldaten:** Reine Fakten (Datum, Uhrzeit, Ort, Titel einer Veranstaltung) geniessen in der Regel keinen urheberrechtlichen Schutz. Fakten sind nicht schutzfaehig (Paragraf 2 UrhG).

b) **Datenbankschutz (Paragraf 87a ff. UrhG):** Der Datenbankschutz greift, wenn die Quell-Datenbanken eine "wesentliche Investition" darstellen. Die systematische Uebernahme wesentlicher Teile einer geschuetzten Datenbank kann gegen Paragraf 87b UrhG verstossen. Relevant ist:
- Werden nur einzelne Datenpunkte (Titel, Datum, Ort) uebernommen, oder ganze Beschreibungen?
- Wird die Quelle systematisch und vollstaendig kopiert?

c) **Aktuelle Praxis:** Die Scraper (`scraper.js`, `scraper-multi.cjs`, `cleanup-events.mjs`) extrahieren strukturierte Daten von den Quell-Websites. Ob Beschreibungstexte 1:1 uebernommen werden, haengt von der konkreten Implementierung ab.

d) **Lauterkeitsrecht (UWG):** Auch ohne Urheberrechtsverletzung kann die systematische Uebernahme von Wettbewerberdaten gegen Paragraf 3 UWG (unlautere geschaeftliche Handlung) verstossen — allerdings nur bei einem Wettbewerbsverhaeltnis und geschaeftlichem Handeln.

**Empfehlungen:**
- Nur Fakten uebernehmen (Titel, Datum, Uhrzeit, Ort), keine laengeren Beschreibungstexte
- Quellen im Footer oder in der Datenschutzerklaerung benennen (geschieht bereits teilweise)
- Bei laengeren Textuebernahmen: Genehmigung der Quell-Website einholen
- KI-generierte Zusammenfassungen statt Original-Beschreibungen verwenden (die AI Curation geht bereits in diese Richtung)

**Befund: WICHTIG** — Ueberpruefen, ob nur Fakten oder auch schutzfaehige Texte uebernommen werden.

#### 2.5.2 Webcam-Verlinkung

Die Website verlinkt auf externe Webcams (BYC Starnberg, DTYC Tutzing) — es werden KEINE Webcam-Bilder eingebettet, sondern nur Hyperlinks gesetzt.

**Rechtliche Bewertung:** Das blosse Verlinken auf oeffentlich zugaengliche Webcam-Seiten ist urheberrechtlich unbedenklich (BGH, Urteil vom 17.07.2003, Az. I ZR 259/00 — "Paperboy"). Solange kein Framing/Embedding stattfindet, besteht kein Problem.

**Befund: KEIN HANDLUNGSBEDARF**

#### 2.5.3 KI-generierte Texte

Workers AI generiert Analysetexte auf Basis aggregierter Statistiken. Die urheberrechtliche Schutzfaehigkeit KI-generierter Texte ist umstritten, fuer den Betreiber aber unproblematisch — er ist derjenige, der die Texte generiert. Cloudflare Workers AI Terms of Service erlauben die Nutzung der Outputs.

**Befund: KEIN HANDLUNGSBEDARF** (aber Kennzeichnungspflicht, siehe 2.4)

---

### 2.6 Haftungsausschluss

#### 2.6.1 Event-Daten

Die Website stellt Event-Informationen bereit, die von Drittquellen stammen und automatisiert aggregiert werden. Es besteht keine Gewaehr fuer:
- Richtigkeit der Daten (Datum, Uhrzeit, Ort)
- Aktualitaet (Events koennen kurzfristig abgesagt oder verlegt werden)
- Vollstaendigkeit

Ein Haftungsausschluss ist **dringend empfohlen**, um die Haftung fuer fehlerhafte Informationen zu begrenzen. Zwar schraenkt Paragraf 309 Nr. 7 BGB die Moeglichkeit ein, die Haftung fuer Koerperschaeden und grobe Fahrlaessigkeit auszuschliessen, aber ein allgemeiner Hinweis auf die fehlende Gewaehr ist zulaessig und ueblich.

#### 2.6.2 S-Bahn-Daten

Die S6-Puenktlichkeitsanalyse basiert auf automatisiert erhobenen Daten. Die KI-Analyse kann fehlerhaft sein. Nutzer sollten sich nicht allein auf diese Daten verlassen (z.B. fuer Reiseplanung).

#### 2.6.3 Externe Links

Paragraf 7 Abs. 1 TMG stellt klar, dass Diensteanbieter fuer eigene Inhalte nach den allgemeinen Gesetzen verantwortlich sind. Fuer fremde Inhalte (verlinkte Seiten) besteht nach Paragraf 8-10 TMG eine eingeschraenkte Haftung. Ein Disclaimer zu externen Links ist dennoch empfehlenswert.

**Befund: WICHTIG** — Haftungsausschluss fuer Event-Daten, S-Bahn-Daten und externe Links erstellen.

---

## 3. Handlungsempfehlungen (priorisiert)

### KRITISCH — Sofort umsetzen

| Nr. | Massnahme | Aufwand | Details |
|-----|-----------|---------|---------|
| K1 | **Impressum erstellen** | 30 Min | Eigene Seite `/impressum` oder Abschnitt im Footer; von jeder Seite erreichbar |
| K2 | **Google Fonts self-hosten** | 1-2 Std | Schriftart "Space Grotesk" herunterladen, in `/public/fonts/` ablegen, CSS anpassen, externe Aufrufe entfernen |
| K3 | **Datenschutzerklaerung erstellen** | 2-3 Std | Eigene Seite `/datenschutz`; alle identifizierten Verarbeitungen auffuehren |

### WICHTIG — Innerhalb von 2 Wochen

| Nr. | Massnahme | Aufwand | Details |
|-----|-----------|---------|---------|
| W1 | **KI-Inhalte kennzeichnen** | 1 Std | Bei AI Curation Scores/Summaries visuellen Hinweis ergaenzen (z.B. kleines Icon + Tooltip "KI-generiert") |
| W2 | **Haftungsausschluss erstellen** | 1 Std | In Impressum oder eigene Seite integrieren |
| W3 | **Event-Daten-Quellen pruefen** | 2 Std | Sicherstellen, dass nur Fakten (nicht urheberrechtlich geschuetzte Texte) uebernommen werden |
| W4 | **Cloudflare DPA pruefen** | 30 Min | Sicherstellen, dass der Cloudflare Data Processing Addendum akzeptiert wurde |

### EMPFOHLEN — Bei Gelegenheit

| Nr. | Massnahme | Aufwand | Details |
|-----|-----------|---------|---------|
| E1 | **Footer um Impressum/Datenschutz-Links ergaenzen** | 15 Min | Links zu `/impressum` und `/datenschutz` im Footer beider Seiten (index + s6) |
| E2 | **Quellennachweise verbessern** | 30 Min | Bei Event-Daten die Originalquelle anzeigen (wird teilweise bereits gemacht) |
| E3 | **Barrierefreiheit (BFSG)** | Laufend | Ab Juni 2025 gilt das Barrierefreiheitsstaerkungsgesetz; nicht direkt fuer private Websites, aber best practice |

---

## 4. Vorlagen (Entwuerfe)

> **WICHTIG:** Die folgenden Texte sind Ausgangspunkte und muessen von einem Rechtsanwalt geprueft und ggf. individualisiert werden. Platzhalter sind mit `[PLATZHALTER]` markiert.

### 4.1 Impressum (Entwurf)

```
Impressum

Angaben gemaess Paragraf 5 TMG

[Vorname Nachname]
[Strasse Hausnummer]
[PLZ Ort]

Kontakt:
E-Mail: [email@example.com]
[Optional: Telefon: +49 XXX XXXXXXX]

Inhaltlich verantwortlich gemaess Paragraf 18 Abs. 2 MStV:
[Vorname Nachname]
[Adresse wie oben]

Haftungsausschluss

Haftung fuer Inhalte

Die Inhalte dieser Website werden mit groesster Sorgfalt erstellt. Fuer die Richtigkeit,
Vollstaendigkeit und Aktualitaet der Inhalte kann jedoch keine Gewaehr uebernommen werden.

Insbesondere:
- Event-Daten werden automatisiert von Drittquellen (u.a. beccult.de, starnbergammersee.de,
  muenchen.de) aggregiert. Aenderungen, Absagen oder Verschiebungen werden moeglicherweise
  nicht in Echtzeit uebernommen. Massgeblich sind stets die Angaben des jeweiligen Veranstalters.
- S-Bahn-Daten (S6 Possenhofen) werden automatisiert von der DB IRIS API erhoben und
  statistisch ausgewertet. Die angezeigten Analysen und Prognosen dienen nur der allgemeinen
  Information und sind keine verbindliche Fahrplanauskunft.
- KI-generierte Inhalte (Textanalysen, Event-Bewertungen) werden automatisiert erstellt und
  koennen Fehler enthalten. Sie stellen keine redaktionelle Bewertung dar.

Als Diensteanbieter sind wir gemaess Paragraf 7 Abs. 1 TMG fuer eigene Inhalte auf diesen
Seiten nach den allgemeinen Gesetzen verantwortlich.

Haftung fuer Links

Diese Website enthaelt Links zu externen Websites Dritter, auf deren Inhalte kein Einfluss
besteht. Fuer die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf moegliche
Rechtverstoesse ueberprueft. Rechtswidrige Inhalte waren zu diesem Zeitpunkt nicht erkennbar.
Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte
einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden
entsprechende Links umgehend entfernt.

Hinweis zu KI-generierten Inhalten

Diese Website verwendet kuenstliche Intelligenz (Cloudflare Workers AI) zur Erstellung von:
- Analysetexten zur S-Bahn-Puenktlichkeit
- Zusammenfassungen und Bewertungen von Veranstaltungen

Diese Inhalte werden automatisiert generiert und nicht redaktionell geprueft. Sie koennen
ungenau oder fehlerhaft sein.
```

### 4.2 Datenschutzerklaerung (Entwurf)

```
Datenschutzerklaerung

1. Verantwortlicher

Verantwortlicher fuer die Datenverarbeitung auf dieser Website ist:

[Vorname Nachname]
[Strasse Hausnummer]
[PLZ Ort]
E-Mail: [email@example.com]

2. Ueberblick der Verarbeitungen

Diese Website erhebt und verarbeitet personenbezogene Daten ausschliesslich im Rahmen der
gesetzlichen Bestimmungen. Wir verwenden KEINE Cookies, KEIN Tracking und KEINE Analyse-Tools
wie Google Analytics oder Matomo.

3. Hosting und Content Delivery Network

Diese Website wird ueber Cloudflare Pages (Cloudflare, Inc., 101 Townsend St, San Francisco,
CA 94107, USA) bereitgestellt. Bei jedem Zugriff auf diese Website werden durch Cloudflare
automatisch folgende Daten erhoben und in Server-Logfiles gespeichert:

- IP-Adresse des anfragenden Rechners
- Datum und Uhrzeit des Zugriffs
- Aufgerufene URL
- HTTP-Statuscode
- Uebertragene Datenmenge
- Referrer-URL
- Browser-Typ und -Version
- Betriebssystem

Diese Daten werden fuer die Bereitstellung und Sicherheit der Website benoetigt.
Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer sicheren
und effizienten Bereitstellung der Website).

Cloudflare ist als Auftragsverarbeiter taetig. Ein Auftragsverarbeitungsvertrag (Data
Processing Addendum) besteht. Cloudflare ist unter dem EU-US Data Privacy Framework
zertifiziert, was ein angemessenes Datenschutzniveau fuer die Datenuebermittlung in die
USA gewaehrleistet.

Weitere Informationen: https://www.cloudflare.com/privacypolicy/

4. Cloudflare Workers (S-Bahn-Daten)

Fuer die Anzeige aktueller S-Bahn-Abfahrten und Puenktlichkeitsstatistiken wird ein
Cloudflare Worker eingesetzt. Bei Aufruf der entsprechenden Funktionen wird Ihre
IP-Adresse an den Cloudflare Worker uebertragen. Der Worker leitet Ihre IP-Adresse
NICHT an die Deutsche Bahn oder andere Drittanbieter weiter, sondern ruft die Daten
serverseitig ab.

Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.

5. Wetterdaten (Open-Meteo)

Zur Anzeige aktueller Wetterdaten wird die Open-Meteo API (open-meteo.com) aufgerufen.
Dabei wird Ihre IP-Adresse an die Server von Open-Meteo uebertragen. Open-Meteo ist ein
Open-Source-Projekt mit Servern in Deutschland/EU.

Es werden ausschliesslich Wetterdaten fuer den Standort Starnberger See abgerufen. Es
findet kein Standort-Tracking des Nutzers statt.

Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Bereitstellung
ortsbezogener Wetterdaten fuer die Region).

Weitere Informationen: https://open-meteo.com/en/terms

6. Lokale Speicherung (localStorage)

Diese Website nutzt den localStorage Ihres Browsers fuer folgende Zwecke:

- Speicherung Ihrer Theme-Einstellung (helles/dunkles Design)
- Speicherung Ihrer Favoriten-Auswahl
- Speicherung des UI-Zustands (auf-/zugeklappte Bereiche)

Diese Daten werden ausschliesslich lokal in Ihrem Browser gespeichert und NICHT an
unsere oder fremde Server uebertragen. Es handelt sich um technisch notwendige
Speicherungen gemaess Paragraf 25 Abs. 2 Nr. 2 TTDSG, die fuer die von Ihnen
ausdruecklich angeforderte Funktionalitaet erforderlich sind. Eine Einwilligung
ist hierfuer nicht erforderlich.

Sie koennen die gespeicherten Daten jederzeit ueber die Entwicklertools Ihres
Browsers loeschen.

7. Kuenstliche Intelligenz

a) S-Bahn-Analyse: Auf der S6-Puenktlichkeitsseite werden aggregierte Statistikdaten
durch Cloudflare Workers AI (Modell: gpt-oss-120b) analysiert und als Textanalyse
dargestellt. Es werden dabei KEINE personenbezogenen Daten der Nutzer an das KI-Modell
uebergeben — lediglich aggregierte Zugdaten.

b) Event-Bewertungen: Veranstaltungen werden durch KI-Modelle mit Bewertungen und
Zusammenfassungen versehen. Diese werden vorab berechnet und als statische Daten
ausgeliefert. Es findet keine Echtzeit-KI-Verarbeitung von Nutzerdaten statt.

Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.

8. Keine Cookies

Diese Website setzt KEINE eigenen Cookies. Cloudflare kann technisch notwendige
Cookies setzen (z.B. fuer DDoS-Schutz). Diese sind gemaess Paragraf 25 Abs. 2 Nr. 2
TTDSG als technisch notwendig einzustufen und beduerfen keiner Einwilligung.

9. Keine Weitergabe an Dritte

Personenbezogene Daten werden nicht an Dritte weitergegeben, verkauft oder anderweitig
uebermittelt — mit Ausnahme der in dieser Erklaerung genannten technischen
Dienstleister (Cloudflare, Open-Meteo).

10. SSL/TLS-Verschluesselung

Diese Website nutzt aus Sicherheitsgruenden eine SSL/TLS-Verschluesselung. Eine
verschluesselte Verbindung erkennen Sie an dem Schloss-Symbol in der Adressleiste
Ihres Browsers und daran, dass die Adresszeile mit "https://" beginnt.

11. Ihre Rechte

Sie haben gegenueber dem Verantwortlichen folgende Rechte bezueglich Ihrer
personenbezogenen Daten:

- Recht auf Auskunft (Art. 15 DSGVO)
- Recht auf Berichtigung (Art. 16 DSGVO)
- Recht auf Loeschung (Art. 17 DSGVO)
- Recht auf Einschraenkung der Verarbeitung (Art. 18 DSGVO)
- Recht auf Datenuebertagbarkeit (Art. 20 DSGVO)
- Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)

Zur Ausuebung Ihrer Rechte wenden Sie sich bitte an die oben genannte E-Mail-Adresse.

12. Beschwerderecht

Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehoerde ueber die
Verarbeitung Ihrer personenbezogenen Daten zu beschweren. Die fuer Bayern
zustaendige Aufsichtsbehoerde ist:

Bayerisches Landesamt fuer Datenschutzaufsicht (BayLDA)
Promenade 18
91522 Ansbach
https://www.lda.bayern.de

13. Aenderungen

Diese Datenschutzerklaerung wird bei Bedarf aktualisiert. Die aktuelle Fassung
ist stets unter [URL]/datenschutz abrufbar.

Stand: [Datum einfuegen]
```

---

## 5. Technische Umsetzungshinweise

### 5.1 Google Fonts Self-Hosting

Folgende Aenderungen in `src/layouts/Layout.astro` sind noetig:

**Entfernen:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Ersetzen durch:**
1. Schriftdateien von Google Fonts herunterladen (WOFF2-Format)
2. In `public/fonts/` ablegen
3. CSS `@font-face`-Deklarationen in Layout.astro einfuegen

Werkzeug-Empfehlung: https://gwfh.mranftl.com/fonts (google-webfonts-helper) generiert automatisch die noetige CSS und WOFF2-Dateien.

### 5.2 Impressum/Datenschutz-Seiten

Neue Astro-Seiten erstellen:
- `src/pages/impressum.astro`
- `src/pages/datenschutz.astro`

Footer in `src/pages/index.astro` und `src/pages/s6.astro` um Links ergaenzen.

### 5.3 KI-Kennzeichnung

In `src/pages/index.astro` bei den Weekend-Highlight-Cards mit `aiSummary` und Score:
- Visuellen Hinweis ergaenzen, z.B. ein kleines Label "KI-bewertet" oder ein Tooltip
- Auf der /s6-Seite: Unter der "KI-Analyse"-Sektion den Hinweis "Automatisch generiert durch Cloudflare Workers AI. Keine redaktionelle Pruefung." ergaenzen

---

## 6. Risikobewertung

| Risiko | Eintrittswahrscheinlichkeit | Schadenshoehe | Prioritaet |
|--------|---------------------------|---------------|------------|
| Abmahnung wegen fehlendem Impressum | HOCH | 500-2.000 EUR | KRITISCH |
| DSGVO-Abmahnung wegen Google Fonts | MITTEL | 100-500 EUR pro Fall | KRITISCH |
| Bussgeld wegen fehlender Datenschutzerklaerung | NIEDRIG (bei privatem Projekt) | Bis 20 Mio EUR (theoretisch) | KRITISCH |
| Urheberrechtliche Abmahnung (Event-Daten) | NIEDRIG | 500-5.000 EUR | WICHTIG |
| Verstoss gegen KI-Kennzeichnungspflicht | NIEDRIG (derzeit) | Unklar, steigend | WICHTIG |

---

## 7. Checkliste zur Umsetzung

- [ ] Google Fonts self-hosten (Space Grotesk WOFF2 herunterladen, lokal einbinden)
- [ ] Externe Font-Aufrufe aus Layout.astro entfernen
- [ ] Impressum-Seite erstellen (`/impressum`)
- [ ] Datenschutz-Seite erstellen (`/datenschutz`)
- [ ] Footer auf index.astro um Impressum + Datenschutz Links ergaenzen
- [ ] Footer auf s6.astro um Impressum + Datenschutz Links ergaenzen
- [ ] KI-Kennzeichnung bei Event-Scores und AI-Summaries ergaenzen
- [ ] KI-Hinweis auf S6-Analyse-Seite ergaenzen
- [ ] Haftungsausschluss in Impressum integrieren
- [ ] Cloudflare DPA-Status pruefen
- [ ] Event-Daten-Scraper pruefen: werden nur Fakten oder auch laengere Texte uebernommen?
- [ ] Rechtsanwalt fuer finale Pruefung der Texte beauftragen

---

*Dieses Audit wurde am 5. Februar 2026 auf Basis einer statischen Code-Analyse des Projekts erstellt. Es stellt keine Rechtsberatung dar. Die Rechtslandschaft (insbesondere im Bereich KI-Regulierung) entwickelt sich dynamisch. Eine regelmaessige Ueberpruefung wird empfohlen.*
