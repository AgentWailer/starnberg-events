#!/usr/bin/env node
/**
 * Starnberg Events Scraper - Simple Version
 * 
 * This scraper is designed to be run via OpenClaw browser automation.
 * For scheduled updates, use OpenClaw cron with browser action.
 * 
 * Manual run: node scraper.js (requires events data piped in)
 * OpenClaw: Use browser tool to extract events, then update events.json
 */

const fs = require('fs');
const path = require('path');

// If running standalone with piped data
if (!process.stdin.isTTY) {
  let data = '';
  process.stdin.on('data', chunk => data += chunk);
  process.stdin.on('end', () => {
    try {
      const events = JSON.parse(data);
      processAndSave(events);
    } catch (e) {
      console.error('Failed to parse input:', e.message);
      process.exit(1);
    }
  });
} else {
  console.log(`
📅 Starnberg Events Scraper

This scraper works with OpenClaw browser automation.

Usage via OpenClaw:
1. Browser navigates to starnbergammersee.de/entdecken-erleben/veranstaltungskalender
2. Execute extraction script to get events
3. Pipe results to this script

Example command for OpenClaw cron:
"Scrape Starnberg events: navigate to the calendar, extract all events, update events.json"
`);
}

function parseDate(dateStr) {
  const match = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})\s*(\d{2}):(\d{2})/);
  if (match) {
    const [, day, month, year, hour, minute] = match;
    return { date: \`\${year}-\${month}-\${day}\`, time: \`\${hour}:\${minute}\` };
  }
  return null;
}

function determineCategory(title, type) {
  const t = title.toLowerCase();
  if (t.includes('kinder') || t.includes('märchen') || type === 'Literarische') return 'kinder';
  if (type === 'Tanzveranstaltung' || type === 'Musikveranstaltung' || t.includes('ball')) return 'erwachsene';
  return 'familie';
}

function extractTags(title) {
  const tags = [];
  const t = title.toLowerCase();
  if (t.includes('musik') || t.includes('konzert') || t.includes('chor')) tags.push('musik');
  if (t.includes('kunst') || t.includes('ausstellung')) tags.push('kunst');
  if (t.includes('theater') || t.includes('kabarett')) tags.push('theater');
  if (t.includes('film') || t.includes('kino')) tags.push('kino');
  if (t.includes('führung') || t.includes('kloster')) tags.push('führung');
  if (t.includes('kinder') || t.includes('märchen')) tags.push('kinder');
  if (t.includes('workshop') || t.includes('kurs')) tags.push('workshop');
  if (t.includes('fasching') || t.includes('ball') || t.includes('fest')) tags.push('fest');
  if (t.includes('tanz')) tags.push('tanz');
  return tags.slice(0, 3);
}

function processAndSave(rawEvents) {
  const today = new Date().toISOString().split('T')[0];
  
  const events = rawEvents
    .map((e, idx) => {
      const parsed = parseDate(e.dateRaw);
      if (!parsed) return null;
      
      const location = (e.address || '').replace(/^\d{5}\s+/, '').split(',')[0].trim() || 'Starnberg';
      
      return {
        id: idx + 1,
        title: e.title,
        date: parsed.date,
        time: parsed.time,
        location,
        address: e.address || '',
        description: e.description || '',
        category: determineCategory(e.title, e.type),
        tags: extractTags(e.title),
        url: e.url
      };
    })
    .filter(e => e && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  
  events.forEach((e, i) => e.id = i + 1);
  
  const output = {
    lastUpdated: today,
    source: 'https://www.starnbergammersee.de/entdecken-erleben/veranstaltungskalender',
    events
  };
  
  const outputPath = path.join(__dirname, 'events.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  
  console.log(\`✅ Updated events.json with \${events.length} events\`);
}

module.exports = { processAndSave, parseDate, determineCategory, extractTags };
