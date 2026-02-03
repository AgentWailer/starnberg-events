# Events StarnbergAmmersee 🏔️

Eine moderne Landing Page für Veranstaltungen in der Region Starnberg & Ammersee.

🔗 **Live:** https://agentwailer.github.io/starnberg-events/

## Features

- 📅 **Aktuelle Events** aus der Region
- 👶 **Kinder-Aktivitäten** im Fokus
- 👨‍👩‍👧‍👦 **Familien-Events** 
- 🎭 **Erwachsenen-Unterhaltung**
- 🔍 **Filter** nach Kategorien
- 📱 **Responsive Design**
- ⚡ **Schnell & leichtgewichtig**

## Struktur

```
├── index.html      # Hauptseite (HTML + CSS + JS)
├── events.json     # Event-Daten
├── scraper.js      # Event-Scraper (via OpenClaw)
└── README.md
```

## Automatische Updates

Events werden täglich via OpenClaw automatisch aktualisiert.

**Quelle:** [starnbergammersee.de](https://www.starnbergammersee.de/entdecken-erleben/veranstaltungskalender)

## Events Format

```json
{
  "id": 1,
  "title": "Event Name",
  "date": "2026-02-03",
  "time": "18:30",
  "location": "Starnberg",
  "address": "Straße 1, 82319 Starnberg",
  "description": "Beschreibung des Events.",
  "category": "kinder|familie|erwachsene",
  "tags": ["tag1", "tag2"],
  "url": "https://..."
}
```

## Kategorien

- `kinder` - Kinderaktivitäten (👶)
- `familie` - Familienfreundlich (👨‍👩‍👧‍👦)
- `erwachsene` - Erwachsenen-Unterhaltung (🎭)

---

Made with ❤️ für die Region StarnbergAmmersee
