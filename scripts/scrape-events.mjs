#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const EVENTS_PATH = join(__dirname, '../src/data/events.json');
const SOURCES_PATH = join(__dirname, '../src/data/sources.json');

// Category detection keywords
const CATEGORY_KEYWORDS = {
  kinder: ['kinder', 'kinderführung', 'familienführung', 'märchen', 'kids'],
  familie: ['familie', 'familien', 'für alle', 'publikum'],
  erwachsene: ['erwachsene', 'ab 16', 'ab 18', 'kabarett', 'vortrag']
};

// Tag detection keywords
const TAG_KEYWORDS = {
  musik: ['konzert', 'musik', 'band', 'orchester', 'sänger', 'livemusik'],
  theater: ['theater', 'schauspiel', 'kabarett', 'comedy', 'aufführung'],
  kunst: ['ausstellung', 'kunst', 'galerie', 'museum', 'foto'],
  sport: ['sport', 'wettkampf', 'training', 'turnier', 'lauf'],
  natur: ['wanderung', 'führung', 'naturpark', 'outdoor', 'berg'],
  markt: ['markt', 'flohmarkt', 'bauernmarkt', 'trödel'],
  bildung: ['workshop', 'kurs', 'seminar', 'vortrag', 'lesung'],
  fest: ['fest', 'feier', 'festival', 'party', 'fasching', 'ball'],
  show: ['show', 'spektakel', 'vorführung', 'magie'],
  indoor: ['indoor', 'halle', 'museum', 'theater', 'kino']
};

/**
 * Load existing events
 */
function loadExistingEvents() {
  try {
    const data = JSON.parse(readFileSync(EVENTS_PATH, 'utf-8'));
    return data.events || [];
  } catch (err) {
    console.error('Error loading existing events:', err.message);
    return [];
  }
}

/**
 * Load sources configuration
 */
function loadSources() {
  try {
    const data = JSON.parse(readFileSync(SOURCES_PATH, 'utf-8'));
    return data.sources || [];
  } catch (err) {
    console.error('Error loading sources:', err.message);
    return [];
  }
}

/**
 * Detect category from title and description
 */
function detectCategory(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      return category;
    }
  }
  
  return 'familie'; // Default
}

/**
 * Detect tags from title and description
 */
function detectTags(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const tags = [];
  
  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      tags.push(tag);
    }
  }
  
  return tags;
}

/**
 * Check if event is a duplicate (same title and date)
 */
function isDuplicate(event, existingEvents) {
  return existingEvents.some(e => 
    e.title === event.title && 
    e.date === event.date
  );
}

/**
 * Check if event is in the past
 */
function isPastEvent(dateStr) {
  const eventDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return eventDate < today;
}

/**
 * Scraper for StarnbergAmmersee (STUB - needs real implementation)
 */
async function scrapeStarnbergAmmersee() {
  console.log('⚠️  TODO: StarnbergAmmersee scraper not implemented yet');
  // This would use cheerio to parse the page
  // https://www.starnbergammersee.de/entdecken-erleben/veranstaltungskalender
  return [];
}

/**
 * Scraper for beccult (STUB - needs real implementation)
 */
async function scrapeBeccult() {
  console.log('⚠️  TODO: beccult scraper not implemented yet');
  // This would use cheerio to parse the page
  // https://www.beccult.de/veranstaltungen
  return [];
}

/**
 * Scraper for Olympiapark (STUB - needs real implementation)
 */
async function scrapeOlympiapark() {
  console.log('⚠️  TODO: Olympiapark scraper not implemented yet');
  // This would use cheerio to parse the page
  return [];
}

/**
 * Scraper for Deutsches Museum (STUB - needs real implementation)
 */
async function scrapeDeutschesMuseum() {
  console.log('⚠️  TODO: Deutsches Museum scraper not implemented yet');
  return [];
}

/**
 * Scraper for Tierpark Hellabrunn (STUB - needs real implementation)
 */
async function scrapeHellabrunn() {
  console.log('⚠️  TODO: Tierpark Hellabrunn scraper not implemented yet');
  return [];
}

/**
 * Scraper for Tegernsee (STUB - needs real implementation)
 */
async function scrapeTegernsee() {
  console.log('⚠️  TODO: Tegernsee scraper not implemented yet');
  return [];
}

/**
 * Scraper for Garmisch-Partenkirchen (STUB - needs real implementation)
 */
async function scrapeGapa() {
  console.log('⚠️  TODO: Garmisch-Partenkirchen scraper not implemented yet');
  return [];
}

/**
 * Scraper for München.de (STUB - very complex, may need API)
 */
async function scrapeMuenchen() {
  console.log('⚠️  TODO: muenchen.de scraper not implemented yet (complex)');
  return [];
}

/**
 * Scraper for PFC Pöcking (STUB)
 */
async function scrapePFC() {
  console.log('⚠️  TODO: PFC Pöcking scraper not implemented yet');
  return [];
}

/**
 * Main scraper orchestrator
 */
async function scrapeAllSources() {
  const sources = loadSources();
  const scrapers = {
    'starnbergammersee': scrapeStarnbergAmmersee,
    'beccult': scrapeBeccult,
    'olympiapark': scrapeOlympiapark,
    'deutsches-museum': scrapeDeutschesMuseum,
    'hellabrunn': scrapeHellabrunn,
    'tegernsee': scrapeTegernsee,
    'gapa': scrapeGapa,
    'muenchen': scrapeMuenchen,
    'pfc': scrapePFC
  };
  
  const allNewEvents = [];
  
  for (const source of sources) {
    console.log(`\n📡 Scraping: ${source.name}...`);
    
    const scraper = scrapers[source.id];
    if (!scraper) {
      console.log(`⚠️  No scraper found for: ${source.id}`);
      continue;
    }
    
    try {
      const events = await scraper();
      console.log(`   ✅ Found ${events.length} events`);
      allNewEvents.push(...events);
    } catch (err) {
      console.error(`   ❌ Error scraping ${source.name}:`, err.message);
    }
  }
  
  return allNewEvents;
}

/**
 * Merge and deduplicate events
 */
function mergeEvents(existingEvents, newEvents) {
  // Keep manual events
  const manualEvents = existingEvents.filter(e => e.manual === true);
  
  // Remove past events from existing
  const futureExisting = existingEvents.filter(e => !isPastEvent(e.date) && !e.manual);
  
  // Remove duplicates from new events
  const uniqueNewEvents = newEvents.filter(e => 
    !isDuplicate(e, futureExisting) && 
    !isDuplicate(e, manualEvents)
  );
  
  // Combine all
  const allEvents = [...manualEvents, ...futureExisting, ...uniqueNewEvents];
  
  // Sort by date
  allEvents.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA - dateB;
    }
    // If same date, sort by time
    return (a.time || '').localeCompare(b.time || '');
  });
  
  // Reassign IDs
  allEvents.forEach((event, index) => {
    event.id = index + 1;
  });
  
  return allEvents;
}

/**
 * Save events to file
 */
function saveEvents(events) {
  // Get unique sources
  const sources = [...new Set(events.map(e => e.source))];
  
  const data = {
    lastUpdated: new Date().toISOString().split('T')[0],
    sources,
    regions: {
      poecking: { name: 'Pöcking', emoji: '🏠' },
      'starnberg-ammersee': { name: 'Starnberg-Ammersee', emoji: '🏔️' },
      muenchen: { name: 'München', emoji: '🏙️' },
      tegernsee: { name: 'Tegernsee', emoji: '⛰️' },
      werdenfels: { name: 'Werdenfelser Land', emoji: '🎿' }
    },
    eventCount: events.length,
    events
  };
  
  writeFileSync(EVENTS_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`\n💾 Saved ${events.length} events to ${EVENTS_PATH}`);
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting event scraper...\n');
  
  const existingEvents = loadExistingEvents();
  console.log(`📚 Loaded ${existingEvents.length} existing events`);
  
  const newEvents = await scrapeAllSources();
  
  const mergedEvents = mergeEvents(existingEvents, newEvents);
  
  // Calculate changes
  const added = mergedEvents.filter(e => 
    !existingEvents.some(ex => ex.title === e.title && ex.date === e.date)
  ).length;
  const removed = existingEvents.length - mergedEvents.length + added;
  
  console.log('\n📊 Summary:');
  console.log(`   • Added: ${added} new events`);
  console.log(`   • Removed: ${removed} past/duplicate events`);
  console.log(`   • Total: ${mergedEvents.length} events`);
  
  saveEvents(mergedEvents);
  
  console.log('\n✅ Done!\n');
}

// Run
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
