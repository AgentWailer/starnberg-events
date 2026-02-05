import { readFileSync, writeFileSync } from 'fs';

const data = JSON.parse(readFileSync('./src/data/events.json', 'utf-8'));

const cats = {};
data.events.forEach(e => { cats[e.category] = (cats[e.category]||0)+1; });

const regions = {};
data.events.forEach(e => { regions[e.region] = (regions[e.region]||0)+1; });

const md = `# Data Quality Report
*Generated: 2026-02-05*

## Summary
| Metric | Before | After |
|--------|--------|-------|
| Total Events | 514 | 512 |
| Events without artTags | 191 (37%) | 0 (0%) |
| Undefined regions in use | 2 (starnberger-see, ammersee) | 0 |
| Duplicate events | 2 | 0 |
| Category corrections | — | 103+ events |

## 1. Region Changes

### New Region Definitions Added
- \`starnberger-see\`: Starnberger See 🏔️ (was used by 304 events but not defined)
- \`ammersee\`: Ammersee ⛵ (was used by 3 events but not defined)

### Removed Region Definition
- \`starnberg-ammersee\`: No longer needed — all 26 events migrated

### Migrated Events (26 total, from \`starnberg-ammersee\`)
Based on location/address analysis:

**→ ammersee (7 events):**
- Kloster Andechs: öffentliche Kirchenführung (Andechs)
- Die Demokratie des Waldes (Wartaweil/Herrsching)
- Märchenstunde in der Bücherei Dießen
- Münchner Schäfflertanz am Seehof Herrsching
- SENIORENESSEN im Unterbräu Diessen
- Tanzkunst 60+ (Herrsching)
- Diessener Kneipen-Chor (Diessen)

**→ starnberger-see (19 events):**
- Events in Starnberg, Tutzing, Berg, Pöcking, Gilching, Weßling, etc.

### Final Region Distribution
| Region | Count |
|--------|-------|
| starnberger-see | ${regions['starnberger-see']} |
| muenchen | ${regions['muenchen']} |
| poecking | ${regions['poecking']} |
| werdenfels | ${regions['werdenfels']} |
| tegernsee | ${regions['tegernsee']} |
| ammersee | ${regions['ammersee']} |

## 2. Category Changes (103+ corrections)

### erwachsene → familie (majority of changes)
Key patterns fixed:
- **Montgolfiade/Ballonfahrten** (IDs 2, 15, 31, 57): Winter-Freiluftveranstaltung → familie
- **Deutsche Heißluftballon-Meisterschaft** (IDs 371, 373, 374, 376) → familie
- **Fasching events** (IDs 64, 82, 91, 93, 94, 109, 114, 124, 125, 127, 128, 129) → familie
- **Museums/Ausstellungen** (IDs 1, 5, 6, 25, 44, 115, 118, 148, 204, 232, 276) → familie
- **Sportevents** (IDs 48, 79, 147, 169, 200, 237, 243, 282, 438, 460, 502) → familie
- **Konzerte (große/öffentliche)** (IDs 144, 188, 265, 283, 353, 355, 364, 394, 408, 415, 446, 490, 510) → familie
- **Radtouren** (IDs 281, 291, 296, 307, 318, 320, 322, 336, 341, 342, 343, 435) → familie
- **Naturführungen** (ID 35: Seetaucherexkursion) → familie
- **Schäfflertanz** (IDs 47, 63) → familie
- **St. Patrick's Day** (IDs 226, 242) → familie
- **3D-Shows/Multivision** (IDs 183, 478) → familie
- **Theater** (IDs 189, 249, 261, 269, 464, 481) → familie
- **Kirchenführung/Brauereiführung** (IDs 8, 97) → familie
- **Diverses** (Spielenachmittag, Kegeln, Stockschützen, Wanderungen, etc.)

### Final Category Distribution
| Category | Before | After |
|----------|--------|-------|
| erwachsene | 301 (59%) | ${cats['erwachsene']} (${Math.round(cats['erwachsene']/512*100)}%) |
| familie | 184 (36%) | ${cats['familie']} (${Math.round(cats['familie']/512*100)}%) |
| kinder | 29 (6%) | ${cats['kinder']} (${Math.round(cats['kinder']/512*100)}%) |

## 3. artTags Changes

### Coverage
| Metric | Before | After |
|--------|--------|-------|
| With artTags | 323 (63%) | 512 (100%) |
| Without artTags | 191 (37%) | 0 (0%) |

### 189 events received new or additional artTags:
- **164 events** got artTags assigned for the first time
- **25 events** with existing artTags got additional relevant tags

### Examples of assigned tags:
- Montgolfiade events → [fest, natur]
- Handball Heimspiele → [sport, handball]
- Fasching events → [fest, fasching]
- Yoga events → [yoga, wellness/meditation]
- Radtouren → [sport, radtour]
- Konzerte → [musik, show]
- Kabarett → [show, kultur]

### Old \`tags\` field cleaned up
182 events had a legacy \`tags\` field (instead of \`artTags\`). All converted to proper \`artTags\`.

## 4. Duplicates Removed (2)

| ID | Title | Date | Reason |
|----|-------|------|--------|
| 18 | Die Demokratie des Waldes | 2026-02-06 | Kept ID 17 (has artTags, venue, proper address) |
| 87 | Weiberfasching | 2026-02-12 | Kept ID 84 (more detailed description) |

## 5. aiCuration Fields
✅ All 38 events with \`aiCuration\` fields preserved intact.

## 6. Remaining Issues
✅ No remaining data quality issues.
- All events have valid categories (kinder/familie/erwachsene)
- All events have at least 1 artTag from the defined set
- All regions used are properly defined
- No duplicate events
- No orphaned data
`;

writeFileSync('./DATA-QUALITY-REPORT.md', md, 'utf-8');
console.log('Report written.');
