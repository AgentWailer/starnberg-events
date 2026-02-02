# Events StarnbergAmmersee 🏔️

Eine moderne Landing Page für Veranstaltungen in der Region Starnberg & Ammersee.

## Features

- 📅 **Aktuelle Events** aus der Region
- 👶 **Kinder-Aktivitäten** im Fokus
- 👨‍👩‍👧‍👦 **Familien-Events** 
- 🎭 **Erwachsenen-Unterhaltung**
- 🔍 **Filter** nach Kategorien
- 📱 **Responsive Design**
- ⚡ **Schnell & leichtgewichtig** (keine Dependencies)

## Struktur

```
├── index.html      # Hauptseite (HTML + CSS + JS)
├── events.json     # Event-Daten (leicht erweiterbar)
└── README.md
```

## Events aktualisieren

Events werden in `events.json` gepflegt. Format:

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

## Deployment

Die Seite ist statisch und kann auf jedem Webserver gehostet werden:
- GitHub Pages
- Cloudflare Pages
- Netlify
- Vercel

## Datenquelle

Events stammen von [StarnbergAmmersee.de](https://www.starnbergammersee.de/entdecken-erleben/veranstaltungskalender)

## Roadmap

- [ ] Automatisches Event-Scraping
- [ ] Kalender-Ansicht
- [ ] Event-Benachrichtigungen
- [ ] Wetter-Integration
- [ ] Karten-Ansicht
- [ ] Favoriten speichern

---

Made with ❤️ für die Region StarnbergAmmersee
