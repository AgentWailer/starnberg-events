# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Starnberg Events is a regional events directory for the Starnberg & Ammersee area in Germany. It displays local events with filtering, weather info, and transportation data.

**Live:** https://starnberg-events.pages.dev/

## Commands

```bash
npm run dev      # Start local dev server
npm run build    # Production build (output: dist/)
npm run preview  # Preview production build locally
```

**Deployment:** Push to `main` triggers automatic build and deploy to GitHub Pages via `.github/workflows/deploy.yml`.

## Tech Stack

- **Astro 5.x** - Static site generator with file-based routing
- **TypeScript** (strict mode)
- **Native CSS** with scoped styles in components
- **No JS frameworks** - Vanilla JS for client-side interactivity

## Architecture

```
src/
├── pages/index.astro      # Main page - imports events, sorts, renders grid
├── layouts/Layout.astro   # Base HTML + global CSS variables (ALPENSEE palette)
├── components/            # Astro components with scoped styles
│   ├── EventCard.astro    # Individual event display
│   ├── FilterBar.astro    # Category/source/region filters
│   ├── InfoTicker.astro   # Mobile carousel info bar
│   ├── WeatherWidget.astro, TrainInfo.astro, etc.
└── data/
    └── events.json        # Event dataset (updated externally via scraper)
```

## Data Model

Events come from `src/data/events.json` (updated externally via OpenClaw scraper):

```json
{
  "id": 1,
  "title": "Event Name",
  "date": "2026-02-03",
  "time": "18:30",
  "location": "Starnberg",
  "category": "kinder|familie|erwachsene",
  "region": "poecking|starnberg-ammersee|muenchen|tegernsee|werdenfels",
  "source": "beccult|starnbergammersee|muenchen|...",
  "url": "https://..."
}
```

**Categories:** `kinder` (children), `familie` (family), `erwachsene` (adults)

**Regions:** Pöcking, Starnberg-Ammersee, München, Tegernsee, Werdenfelser Land

## Design System

The project uses a custom "ALPENSEE" color palette defined in `Layout.astro`:

- Primary: Deep teal (`#0d4a5c`)
- Accent: Soft gold (`#c9a962`)
- Category colors: amber (kinder), emerald (familie), purple (erwachsene)
- 8px-based spacing scale via CSS custom properties

Design principles documented in `docs/DESIGN-INSPIRATION.md`.

## Responsive Strategy

- **Desktop:** Full weather strip + transport info visible
- **Mobile:** Compact `InfoTicker` carousel replaces desktop widgets
- Components use `desktop-only` / `mobile-info-bar` classes for breakpoint switching
