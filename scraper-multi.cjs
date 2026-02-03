#!/usr/bin/env node
/**
 * Multi-Source Event Scraper for Starnberg Events
 * 
 * This scraper handles events from multiple sources:
 * - beccult.de (Pöcking local)
 * - starnbergammersee.de (regional)
 * - muenchen.de (Munich official)
 * - olympiapark.de (concerts/shows)
 * - hellabrunn.de (zoo/family)
 * - deutsches-museum.de (education/family)
 * - tegernsee.com (highlights only)
 * - gapa-tourismus.de (highlights only)
 * 
 * Usage: Pipe JSON event data with source info
 * echo '{"source": "beccult", "events": [...]}' | node scraper-multi.js
 */

const fs = require('fs');
const path = require('path');

const SOURCES = require('./src/data/sources.json');

// Category detection
function determineCategory(title, description = '', sourceType = '') {
  const t = (title + ' ' + description).toLowerCase();
  
  // Kids events
  if (t.includes('kinder') || t.includes('märchen') || t.includes('familien') && t.includes('kind')) {
    return 'kinder';
  }
  
  // Family events
  if (t.includes('familie') || t.includes('führung') || t.includes('museum') || 
      sourceType === 'family' || t.includes('zoo') || t.includes('tierpark')) {
    return 'familie';
  }
  
  // Adult events (parties, concerts, theater)
  if (t.includes('party') || t.includes('konzert') || t.includes('kabarett') || 
      t.includes('comedy') || t.includes('schlager') || t.includes('fasching') ||
      t.includes('ball') || t.includes('lesung') || t.includes('theater')) {
    return 'erwachsene';
  }
  
  return 'familie'; // Default to family-friendly
}

// Tag extraction
function extractTags(title, description = '') {
  const tags = [];
  const t = (title + ' ' + description).toLowerCase();
  
  const tagMap = {
    'musik': ['musik', 'konzert', 'chor', 'philharmonie', 'orchester', 'jazz', 'rock', 'schlager'],
    'kunst': ['kunst', 'ausstellung', 'galerie', 'museum'],
    'theater': ['theater', 'kabarett', 'comedy', 'bühne', 'aufführung'],
    'kino': ['film', 'kino', 'movie'],
    'führung': ['führung', 'tour', 'besichtigung'],
    'kinder': ['kinder', 'märchen', 'familie'],
    'workshop': ['workshop', 'kurs', 'seminar'],
    'fest': ['fasching', 'ball', 'fest', 'party', 'feier'],
    'tanz': ['tanz', 'disco', 'dancing'],
    'natur': ['wandern', 'natur', 'berg', 'see', 'outdoor'],
    'kulinarisch': ['essen', 'kulinarisch', 'brauerei', 'wein', 'bier'],
    'sport': ['sport', 'ski', 'lauf', 'marathon', 'turnier'],
    'literatur': ['lesung', 'autor', 'buch', 'literatur'],
    'brauchtum': ['tracht', 'tradition', 'brauch', 'heimat', 'rosstag']
  };
  
  for (const [tag, keywords] of Object.entries(tagMap)) {
    if (keywords.some(kw => t.includes(kw))) {
      tags.push(tag);
    }
  }
  
  return tags.slice(0, 3);
}

// Check if event is a highlight (for Tegernsee/Werdenfels)
function isHighlight(title, description = '', sourceConfig) {
  if (!sourceConfig.highlightKeywords) return true;
  
  const t = (title + ' ' + description).toLowerCase();
  return sourceConfig.highlightKeywords.some(kw => t.includes(kw)) ||
         t.includes('festival') || t.includes('highlight') || t.includes('besonder');
}

// Parse date from various formats
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  // Format: DD.MM.YYYY HH:MM
  let match = dateStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})\s*(\d{1,2}):(\d{2})/);
  if (match) {
    const [, day, month, year, hour, minute] = match;
    return { 
      date: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`, 
      time: `${hour.padStart(2, '0')}:${minute}` 
    };
  }
  
  // Format: DD.MM.YYYY
  match = dateStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (match) {
    const [, day, month, year] = match;
    return { 
      date: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`, 
      time: null 
    };
  }
  
  // Format: YYYY-MM-DD
  match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return { date: match[0], time: null };
  }
  
  return null;
}

// Normalize location name
function normalizeLocation(location, region) {
  if (!location) {
    const regionMap = {
      'poecking': 'Pöcking',
      'starnberg-ammersee': 'Starnberg',
      'muenchen': 'München',
      'tegernsee': 'Tegernsee',
      'werdenfels': 'Garmisch-Partenkirchen'
    };
    return regionMap[region] || 'Unbekannt';
  }
  
  return location
    .replace(/^\d{5}\s+/, '')  // Remove postal code
    .split(',')[0]              // Take first part
    .trim();
}

// Process events from a single source
function processSourceEvents(sourceId, rawEvents) {
  const sourceConfig = SOURCES.sources.find(s => s.id === sourceId);
  if (!sourceConfig) {
    console.error(`Unknown source: ${sourceId}`);
    return [];
  }
  
  const today = new Date().toISOString().split('T')[0];
  
  return rawEvents
    .map(e => {
      const parsed = parseDate(e.dateRaw || e.date);
      if (!parsed) return null;
      
      // For highlight sources, filter non-highlights
      if (sourceConfig.filter === 'highlights' && !isHighlight(e.title, e.description, sourceConfig)) {
        return null;
      }
      
      const location = normalizeLocation(e.location || e.address, sourceConfig.region);
      
      return {
        title: e.title,
        date: parsed.date,
        time: parsed.time || e.time || null,
        location,
        address: e.address || '',
        description: e.description || '',
        category: determineCategory(e.title, e.description, sourceConfig.type),
        tags: extractTags(e.title, e.description),
        url: e.url,
        source: sourceId,
        region: sourceConfig.region,
        venue: e.venue || null,
        isHighlight: sourceConfig.filter === 'highlights'
      };
    })
    .filter(e => e && e.date >= today);
}

// Merge events from multiple sources, avoiding duplicates
function mergeEvents(existingEvents, newEvents, sourceId) {
  // Remove old events from this source
  const filtered = existingEvents.filter(e => e.source !== sourceId);
  
  // Add new events
  const merged = [...filtered, ...newEvents];
  
  // Sort by date, then time
  merged.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });
  
  // Assign IDs
  merged.forEach((e, i) => e.id = i + 1);
  
  return merged;
}

// Load existing events
function loadExistingEvents() {
  const eventsPath = path.join(__dirname, 'src', 'data', 'events.json');
  try {
    const data = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));
    return data.events || [];
  } catch {
    return [];
  }
}

// Save events
function saveEvents(events) {
  const output = {
    lastUpdated: new Date().toISOString().split('T')[0],
    sources: SOURCES.sources.map(s => s.id),
    regions: SOURCES.regions,
    eventCount: events.length,
    events
  };
  
  const eventsPath = path.join(__dirname, 'src', 'data', 'events.json');
  fs.writeFileSync(eventsPath, JSON.stringify(output, null, 2));
  
  console.log(`✅ Saved ${events.length} events from ${new Set(events.map(e => e.source)).size} sources`);
  
  // Print summary by region
  const byRegion = {};
  events.forEach(e => {
    byRegion[e.region] = (byRegion[e.region] || 0) + 1;
  });
  console.log('📊 By region:', byRegion);
}

// Main: Read from stdin
if (!process.stdin.isTTY) {
  let data = '';
  process.stdin.on('data', chunk => data += chunk);
  process.stdin.on('end', () => {
    try {
      const input = JSON.parse(data);
      const sourceId = input.source;
      const rawEvents = input.events || [];
      
      console.log(`📥 Processing ${rawEvents.length} events from ${sourceId}...`);
      
      const processedEvents = processSourceEvents(sourceId, rawEvents);
      console.log(`✨ ${processedEvents.length} events passed filters`);
      
      const existingEvents = loadExistingEvents();
      const mergedEvents = mergeEvents(existingEvents, processedEvents, sourceId);
      
      saveEvents(mergedEvents);
    } catch (e) {
      console.error('❌ Failed to process:', e.message);
      process.exit(1);
    }
  });
} else {
  console.log(`
📅 Multi-Source Event Scraper

Usage with OpenClaw:
1. Browser navigates to source URL
2. Extract events with source-specific script
3. Pipe to: echo '{"source": "sourceId", "events": [...]}' | node scraper-multi.js

Sources: ${SOURCES.sources.map(s => s.id).join(', ')}
  `);
}

module.exports = { processSourceEvents, mergeEvents, parseDate, determineCategory };
