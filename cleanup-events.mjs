import { readFileSync, writeFileSync } from 'fs';

const data = JSON.parse(readFileSync('./src/data/events.json', 'utf-8'));
const report = { categoryChanges: [], artTagChanges: [], regionChanges: [], duplicatesRemoved: [], issues: [] };

// ============================================================
// 1. ADD REGION DEFINITIONS
// ============================================================
data.regions['starnberger-see'] = { name: 'Starnberger See', emoji: '🏔️' };
data.regions['ammersee'] = { name: 'Ammersee', emoji: '⛵' };

// ============================================================
// 2. MIGRATE starnberg-ammersee EVENTS
// ============================================================
// Ammersee towns/keywords
const ammerseeOrte = ['herrsching', 'dießen', 'diessen', 'diessen', 'andechs', 'utting', 'schondorf', 'inning', 'ammersee', 'wartaweil', 'breitbrunn', 'pähl', 'raisting'];
// Starnberger See towns/keywords
const starnbergOrte = ['starnberg', 'tutzing', 'feldafing', 'berg', 'pöcking', 'possenhofen', 'bernried', 'seeshaupt', 'münsing', 'percha', 'söcking', 'gauting', 'gilching', 'weßling', 'wörthsee', 'krailling', 'wolfratshausen'];

function classifyRegion(event) {
  const text = (event.location + ' ' + (event.address || '') + ' ' + (event.description || '') + ' ' + event.title).toLowerCase();
  if (ammerseeOrte.some(o => text.includes(o))) return 'ammersee';
  if (starnbergOrte.some(o => text.includes(o))) return 'starnberger-see';
  return null;
}

data.events.forEach(e => {
  if (e.region === 'starnberg-ammersee') {
    const newRegion = classifyRegion(e);
    if (newRegion) {
      report.regionChanges.push({ id: e.id, title: e.title, from: e.region, to: newRegion });
      e.region = newRegion;
    } else {
      // Default to starnberger-see for unclassifiable ones
      report.regionChanges.push({ id: e.id, title: e.title, from: e.region, to: 'starnberger-see', note: 'defaulted' });
      e.region = 'starnberger-see';
    }
  }
});

// ============================================================
// 3. REMOVE DUPLICATES  
// ============================================================
// "Die Demokratie des Waldes" - keep id 17 (has artTags, venue, proper address)
// "Weiberfasching" - keep id 84 (more description) 
const removeIds = new Set([18, 87]);
const beforeCount = data.events.length;
data.events = data.events.filter(e => {
  if (removeIds.has(e.id)) {
    report.duplicatesRemoved.push({ id: e.id, title: e.title, date: e.date });
    return false;
  }
  return true;
});

// ============================================================
// 4. FIX CATEGORIES
// ============================================================
function classifyCategory(e) {
  const t = (e.title || '').toLowerCase();
  const d = (e.description || '').toLowerCase();
  const text = t + ' ' + d;

  // === KINDER: explicitly for children only ===
  if (
    (t.includes('kinder') && (t.includes('theater') || t.includes('kurs') || t.includes('turnen') || t.includes('konzert') || t.includes('fasching') || t.includes('programm') || t.includes('ferienprogramm') || t.includes('werkstatt'))) ||
    t.startsWith('kinderkonzert') ||
    t.startsWith('kindertheater') ||
    t.startsWith('kinderfasching') ||
    t === 'kinderturnen' ||
    (t.includes('kinder') && !t.includes('family') && !t.includes('famili') && d.includes('für kinder'))
  ) {
    return 'kinder';
  }

  // === ERWACHSENE: truly adults only ===
  const erwachsenePatterns = [
    /kabarett/i, /comedy/i, /standup/i, /stand-up/i,
    /weinprobe/i, /wine tasting/i, /weinseminar/i,
    /yoga/i, /pilates/i, /qigong/i, /meditation/i, /achtsamkeit/i,
    /vortrag/i, /lesung/i, /buchvorstellung/i,
    /tanzparty/i, /tanzabend/i, /milonga/i, /tango argentino/i, /discofox/i, /west coast swing/i,
    /senioren/i, /55\+/i, /60\+/i, /ü30/i, /ab 16 jahren/i,
    /arbeitseinsatz/i, /mitgliederversammlung/i, /stammtisch/i,
    /betrugsprävention/i, /klimaschutz/i, /energiewende/i,
    /detox/i, /brunch/i, /candlelight.?dinner/i, /valentins.*dinner/i, /valentins.*menü/i,
    /genuss.*see/i, /kulinarische höhepunkte/i,
    /aromatherapie/i, /wechseljahre/i, /beckenboden/i, /frauengesundheit/i,
    /stressmanagement/i, /depressionstagung/i,
    /blutspende/i, /altpapiersammlung/i,
    /job.?event/i, /job.?messe/i,
    /politische bildung/i, /tutzinger rede/i,
    /fahrsicherheitskurs/i,
    /kreativkurs für erwachsene/i, /ballett für erwachsene/i,
    /mal-.*kurs.*erwachsene/i, /spachtelkurs.*erwachsene/i,
    /handarbeits.*treff/i,
    /intensivwochenende/i,
    /videoclub/i,
    /orni-stammtisch/i,
    /pflege im alter/i,
    /obstbaumschnitt/i,
  ];

  // === FAMILIE: for families, suitable for children AND adults ===
  const familiePatterns = [
    /montgolfiade/i, /ballonfahrt/i, /heißluftballon/i, /ballon.*meisterschaft/i,
    /volksfest/i, /seefest/i, /weihnachtsmarkt/i, /christkindlmarkt/i, /adventsmarkt/i, /ostermarkt/i, /ostereier.*markt/i,
    /flohmarkt/i,
    /fasching/i, /fosnacht/i, /faschingsumzug/i, /faschingsskispringen/i,
    /garderevue/i, /perchalla/i, /rosenmontagsball/i, /malle.?party/i, /faschingssause/i,
    /schäfflertanz/i,
    /naturführung/i, /vogelwanderung/i, /seetaucherexkursion/i,
    /st\.?\s*patrick/i,
    /bundesliga/i, /heimspiel/i, /handball.*heimspiel/i, /volleyball.*heimspiel/i,
    /landkreislauf/i, /staffellauf/i, /schwimmwettbewerb/i,
    /museum/i, /ausstellung/i, /dauerausstellung/i,
    /fotoausstellung/i,
    /open air/i, /im garten/i, /rathausinnenhof/i,
    /konzert.*park/i, /stadtkapelle/i,
    /3d.?show/i, /multivision/i,
    /kirchenführung/i,
    /brauereiführung/i, /brauereibesichtigung/i,
    /märchenstunde/i,
    /spielenachmittag/i,
    /family in concert/i, /familienkonzert/i,
    /zirkus/i,
    /special olympics/i,
    /kegeln/i,
    /stockschützen/i,
    /nachtwanderung/i, /wanderung/i, /königsmarsch/i,
    /poetry slam/i,
    /filmworkshop/i, /kurzfilmnacht/i,
    /ferienprogramm/i,
    /anradeln/i, /saisonstart/i,
    /bavaria.*marsch/i,
    /feierabendtour/i, /nachmittagstour/i, /radtour/i, /tagestour/i,
    /aktionstag/i,
  ];

  // Check familie patterns first (these override erwachsene)
  for (const p of familiePatterns) {
    if (p.test(text)) return 'familie';
  }

  // Check erwachsene patterns
  for (const p of erwachsenePatterns) {
    if (p.test(text)) return 'erwachsene';
  }

  // Specific ID-based overrides for edge cases
  return null; // no change
}

// Manual overrides for tricky cases based on full review
const manualOverrides = {
  // Montgolfiade → familie
  2: 'familie', 15: 'familie', 31: 'familie', 57: 'familie',
  // Ballonmeisterschaft → familie  
  371: 'familie', 373: 'familie', 374: 'familie', 376: 'familie',
  // Fasching events → familie (even "Weiberfasching" is a party, but it says "ab 16" so erwachsene is ok)
  64: 'familie', // Fosnachtsumzug
  82: 'familie', // Unsinniger Donnerstag
  91: 'familie', // Fasching im SC Wörthsee
  93: 'familie', // Pöckinger Malle-Party
  94: 'familie', // Fasching mit GROUNDLIFT
  109: 'familie', // Starnberger Faschingssause
  114: 'familie', // Fosnachts-Sonntag
  124: 'familie', // Starnberger Garderevue  
  125: 'familie', // 16. Starnberger Garderevue Perchalla
  126: 'familie', // Rosenmontagsball - actually says "ab 16 Jahren" so keep erwachsene
  127: 'familie', // Fosnachts-Dienstag
  128: 'familie', // Faschingsskispringen
  129: 'familie', // RuckiZucki und Kehraus
  // Museums/Exhibitions → familie
  1: 'familie', // Führung Ausstellung Heinz Butz (museum tour)
  5: 'familie', // Das Lochmannhaus (Dauerausstellung)
  6: 'familie', // Höfische Schifffahrt und Seegeschichte (Dauerausstellung)
  25: 'familie', // Das Flüstern der Blumen (Kunstausstellung)
  44: 'familie', // Direktorenführung Heinz Butz
  115: 'familie', // Geschichten vom Klimawandel (Ausstellung)
  118: 'familie', // Direktorenführung Heinz Butz
  148: 'familie', // Öffentliche Führung Ruprecht von Kaufmann
  204: 'familie', // Filmvorführung Heinz Butz
  232: 'familie', // Künstlerführung Ruprecht von Kaufmann
  276: 'familie', // Direktorenführung Abend
  // Handball/Volleyball Heimspiele → familie
  48: 'familie', // Volleyball Heimspiele
  79: 'familie', // WWK Volleys Bundesliga
  147: 'familie', // Heimspieltag Handball
  237: 'familie', // Volleyball Heimspiele
  243: 'familie', // Heimspieltag Handball
  282: 'familie', // Heimspieltag Handball
  502: 'familie', // IHF Handball WM
  // Naturführungen → familie
  35: 'familie', // Seetaucherexkursion
  // Sportevents zum Zuschauen/Mitmachen → familie
  14: 'familie', // Langlauf-Tage (family winter sports)
  169: 'familie', // Int. Deutsche Meisterschaft Ergorudern (spectator event)
  200: 'familie', // Special Olympics Tennis
  438: 'familie', // Starnberger See Schwimmen (ab 2012er Jahrgang - kids can participate)
  460: 'familie', // 42. Starnberger Landkreislauf  
  // Schäfflertanz → familie  
  63: 'familie', // Schäfflertanz Partenkirchen
  47: 'familie', // Münchner Schäfflertanz am Seehof Herrsching
  // St. Patrick's Day → familie
  226: 'familie', // St. Patrick's Day München
  242: 'familie', // St. Patrick's Day München Parade
  // Konzerte (big/public/accessible) → familie
  144: 'familie', // König der Löwen - Music Live in Concert
  188: 'familie', // Neue Philharmonie - orchestral concert
  265: 'familie', // Stadtkapelle Starnberg Konzert
  283: 'familie', // Die Schlagernacht des Jahres
  353: 'familie', // Konzert der Philharmonie Starnberger See
  355: 'familie', // Konzert der Philharmonie Starnberger See e.V.
  364: 'familie', // Sportfreunde Stiller
  394: 'familie', // Foo Fighters
  408: 'familie', // The Weeknd
  415: 'familie', // Nina Chuba
  446: 'familie', // AnnenMayKantereit
  461: 'familie', // Simon & Garfunkel Tribute meets Classic  
  490: 'familie', // BAP
  510: 'familie', // Herbert Grönemeyer
  // Open Air / public events → familie
  388: 'familie', // Marion & Sobo Open Air Gypsy Jazz
  400: 'familie', // Poetry Slam Open Air
  // 3D-Shows / Multivision → familie
  183: 'familie', // 3D-Show Süd-Afrika
  478: 'familie', // Multivision Bretagne
  // Kirchenführung → familie
  8: 'familie', // Kloster Andechs Kirchenführung
  97: 'familie', // Starnberger Brauhaus Brauereiführung
  // Märchenstunde → kinder (actually "Für Groß und Klein" so familie)
  21: 'familie', // Märchenstunde in der Bücherei Dießen
  // Spielenachmittag → familie
  73: 'familie', // Nachbarschaftshilfe Spielenachmittag
  // Wanderungen → familie
  387: 'familie', // Bavaria Königsmarsch
  // Film workshops / events for youth → can be familie
  123: 'familie', // FILMWORKSHOP (in Faschingsferien, for beginners)
  // Theater (general audience) → depends
  189: 'familie', // Theatergruppe Pöcking: Vampir von Zwicklbach (Komödie)
  249: 'familie', // same play Sunday
  269: 'familie', // same play Finale
  261: 'familie', // Das Apostelspiel (Fastenzeit-Theater, 10€)
  481: 'familie', // Der Gott des Gemetzels (theater)
  464: 'familie', // Liebe, Lust und Hexenschuss (Komödie)
  // Kegeln → familie
  88: 'familie', // Kegeln im Pfarrzentrum
  // Radtouren → familie
  281: 'familie', 291: 'familie', 296: 'familie', 307: 'familie', 318: 'familie', 
  320: 'familie', 322: 'familie', 336: 'familie', 341: 'familie', 342: 'familie', 
  343: 'familie', 435: 'familie',
  // Stockschützen → familie
  431: 'familie',
  // Film im Kino Breitwand (documentary evenings with discussion) → erwachsene
  338: 'erwachsene', 378: 'erwachsene', 384: 'erwachsene', 406: 'erwachsene', 413: 'erwachsene',
  // Historische Fahrt → familie
  436: 'familie',
  // Schifffahrt events → familie  
  433: 'familie', // Pasta & Prosecco Schifffahrt (adults more likely but it's a boat ride)
  422: 'erwachsene', // Ü30-Party (explicitly Ü30)
  // SUP Yoga Teacher Training → erwachsene
  409: 'erwachsene',
  // Jugendfeuerwehr → kinder/familie
  182: 'familie', // Jugendfeuerwehr Infoabend
  // Family in Concert → familie
  218: 'familie',
  // Film des Monats (with discussion) → erwachsene  
  185: 'erwachsene',
  // Large concerts (arena) → familie
  463: 'familie', // Felix Lobrecht (comedy but Olympiahalle - actually standup → erwachsene)
  491: 'familie', // Chris Tall (comedy Olympiahalle → erwachsene)
  508: 'erwachsene', // Özcan Cosar comedy
  // Waldschreiben → erwachsene (workshop)
  223: 'erwachsene',
  // Sinfonietta → familie (Schüler/Studenten frei!)
  131: 'familie',
  // Weihnachtsjazz → familie
  494: 'familie',
  // Adventsmarkt → familie
  221: 'familie', // Andechser Ostereier-Markt
  483: 'familie', // Andechser Adventsmarkt  
  // Farbige Universum / Astronomie-Vorträge at Volkssternwarte → erwachsene (Fachvorträge)
  // Keep erwachsene: 27, 92, 165, 190, 236, 297
  // Ballnacht → erwachsene (formal ball)
  50: 'erwachsene', 51: 'erwachsene',
  // Keep: Yoga & Bowls, Yoga & Brunch → erwachsene
  // Tribal Belly Dance → erwachsene (course)
  // Kreistanzen Wochenende → erwachsene (seminar)  
  // Opern auf Bayrisch → erwachsene (Kabarett-character)
  // Isaria Kollektiv LA TRAVIATA → erwachsene (opera)
  // Actually let's reconsider some big concerts:
  463: 'erwachsene', // Felix Lobrecht standup
  491: 'erwachsene', // Chris Tall standup
  // Starkbierfest → could be familie (it's a Volksfest-like event)
  164: 'familie', // Starkbierfest Wolfratshausen
  // Pasta & Prosecco Schifffahrt → more adult
  433: 'erwachsene',
  // Aschermittwoch im Theodor → erwachsene (restaurant dinner)
  135: 'erwachsene',
  // Kneipen-Chor → erwachsene
  130: 'erwachsene',
  // Familienfreundliches Gauting → erwachsene (political discussion)  
  86: 'erwachsene',
  // Aktionstag Natürlich auf Tour → familie
  112: 'familie',
  // Schifffahrt Historische Fahrt → familie
  436: 'familie',
  // Schwimmen → familie  
  438: 'familie',
  // Federspiel Konzert → familie (Blasmusik/folk)
  385: 'familie',
  // nou Well cousines → keep erwachsene (specific concert)
  299: 'erwachsene',
  // Florian Christl → erwachsene (specific concert)
  351: 'erwachsene',
  // Uli Singers → erwachsene
  330: 'erwachsene',
};

// Override: keep Rosenmontagsball as erwachsene since "ab 16 Jahren"
manualOverrides[126] = 'erwachsene';

data.events.forEach(e => {
  const oldCat = e.category;
  
  // Check manual override first
  if (manualOverrides[e.id] !== undefined) {
    const newCat = manualOverrides[e.id];
    if (newCat !== oldCat) {
      report.categoryChanges.push({ id: e.id, title: e.title, from: oldCat, to: newCat });
      e.category = newCat;
    }
    return;
  }
  
  // Then try auto-classification
  const suggested = classifyCategory(e);
  if (suggested && suggested !== oldCat) {
    // Only apply certain auto-fixes
    if (suggested === 'familie' && oldCat === 'erwachsene') {
      report.categoryChanges.push({ id: e.id, title: e.title, from: oldCat, to: suggested });
      e.category = suggested;
    }
  }
});

// ============================================================
// 5. FIX artTags
// ============================================================
const validArtTags = Object.keys(data.artTags);

function suggestArtTags(e) {
  const text = ((e.title || '') + ' ' + (e.description || '')).toLowerCase();
  const tags = new Set();
  
  // Music
  if (/konzert|musik|jazz|swing|blues|sinfoni|orchester|philharmonie|klavier|cello|violine|viola|quartett|trio|quintett|sextett|kammermusik|oper|sänger|gesang|band|live.?music|songwriter|akkordeon|harmonika|gitarr|harfe|schlagzeug|piano|rezital|blasmusik|folk|hip.?hop|schlager|rock|pop|punk|rap/.test(text)) tags.add('musik');
  
  // Theater
  if (/theater|schauspiel|aufführung|vorstellung|komödie|tragödie|bühne|inszenierung|darsteller/.test(text)) tags.add('theater');
  
  // Art
  if (/kunst|ausstellung|exhibition|galerie|maler|malerei|zeichn|skulptur|fotograf|kreativ|atelier|illustration|linodruck/.test(text)) tags.add('kunst');
  
  // Culture
  if (/kultur|museum|tradition|brauchtum|heimat|kirch|kloster|historisch|denkmal/.test(text)) tags.add('kultur');
  
  // Sport
  if (/sport|turnier|meisterschaft|wettkampf|wettbewerb|bundesliga|regionalliga|heimspiel|training|fitness/.test(text) && !/e-?sport/.test(text)) tags.add('sport');
  
  // Nature
  if (/natur|wald|wiese|see|berg|alpen|vögel|ornitholog|flora|fauna|biotop|moor|ramsar|tier|garten|blumen|baum|naturschutz/.test(text)) tags.add('natur');
  
  // Market
  if (/markt|flohmarkt|weihnachtsmarkt|christkindlmarkt|adventsmarkt|ostermarkt/.test(text)) tags.add('markt');
  
  // Education
  if (/bildung|vortrag|workshop|seminar|kurs|fortbildung|weiterbildung|vhs|volkshochschule|führung|infoveranstaltung|infoabend|filmworkshop/.test(text)) tags.add('bildung');
  
  // Festival/celebration
  if (/fest|feier|festival|party|ball|gala|fasching|fosnacht|karneval|silvester/.test(text)) tags.add('fest');
  
  // Show
  if (/show|kabarett|comedy|standup|satire|zirkus|revue|varieté|slam|3d.show|multivision/.test(text)) tags.add('show');
  
  // Indoor
  if (/hallenbad|halle|indoor|museum|theater|kino|bibliothek/.test(text)) tags.add('indoor');
  
  // Dance
  if (/tanz|tanzen|tanzabend|tanzparty|milonga|tango|discofox|swing|walzer|ballett|belly dance|kreistanz/.test(text)) tags.add('tanz');
  
  // Yoga
  if (/\byoga\b/.test(text)) tags.add('yoga');
  
  // Wellness
  if (/wellness|spa|entspannung|wohlfühl|detox|brunch|genuss/.test(text)) tags.add('wellness');
  
  // Meditation
  if (/meditation|achtsamkeit|klang|bowls|zeremonie.*yoga|yoga.*zeremonie/.test(text)) tags.add('meditation');
  
  // Cycling
  if (/radsport|radrennen|rennrad/.test(text)) tags.add('radsport');
  if (/radtour|fahrradtour|feierabendtour|nachmittagstour|anradeln/.test(text)) tags.add('radtour');
  
  // Hiking
  if (/wandern|wanderung|nachtwanderung|winterwandern|schneeschuh/.test(text)) tags.add('wandern');
  
  // Swimming
  if (/schwimm|freiwasser/.test(text)) tags.add('schwimmen');
  
  // Running
  if (/lauf|staffellauf|landkreislauf|ultrawanderung|jogg/.test(text)) tags.add('laufen');
  
  // Fasching
  if (/fasching|fosnacht|karneval|faschingsumzug|weiberfasching|rosenmontag|unsinnig|schäfflertanz|maschkera|garde.*revue|perchalla/.test(text)) tags.add('fasching');
  
  // Tennis
  if (/\btennis\b/.test(text)) tags.add('tennis');
  
  // Football
  if (/\bfußball\b|\bfussball\b/.test(text)) tags.add('fussball');
  
  // Volleyball
  if (/volleyball/.test(text)) tags.add('volleyball');
  
  // Handball
  if (/handball/.test(text)) tags.add('handball');
  
  // Turnen
  if (/\bturnen\b|\bgymnastik\b/.test(text)) tags.add('turnen');
  
  // Winter sports
  if (/wintersport|skifahren|langlauf|rodeln|schlittschuh|ski.*springen/.test(text)) tags.add('wintersport');
  
  // Stockschießen
  if (/stocksch[iü][eß]/.test(text)) tags.add('stockschießen');
  
  // Course
  if (/\bkurs\b|kursstart|workshop|seminar|training|teacher training/.test(text)) tags.add('kurs');
  
  // Health
  if (/gesundheit|kiefer|tinnitus|beckenboden|nährstoff|wechseljahre|schwangerschaft|stressmanagement|detox/.test(text)) tags.add('gesundheit');
  
  // Aromatherapy
  if (/aromatherapie|ätherische öle|düfte/.test(text)) tags.add('aromatherapie');
  
  // TCM
  if (/\btcm\b|traditionelle chinesische/.test(text)) tags.add('tcm');
  
  // Ayurveda
  if (/ayurveda/.test(text)) tags.add('ayurveda');
  
  // Ceremony
  if (/zeremonie|ritual|kakao.?zeremonie|jahreskreis|sonnenwende|ostara|mabon/.test(text)) tags.add('zeremonie');
  
  // SUP
  if (/\bsup\b/.test(text)) tags.add('sup');
  
  // Gravel
  if (/gravel/.test(text)) tags.add('gravel');
  
  // Ferienprogramm
  if (/ferienprogramm|ferien.*programm/.test(text)) tags.add('ferienprogramm');
  
  // Return only valid tags
  return [...tags].filter(t => validArtTags.includes(t));
}

data.events.forEach(e => {
  // Convert old "tags" field to artTags if artTags missing
  if ((!e.artTags || e.artTags.length === 0) && e.tags) {
    // Old tags exist but artTags don't - will be replaced by suggested tags
  }
  
  const existingTags = new Set(e.artTags || []);
  const suggested = suggestArtTags(e);
  
  if (!e.artTags || e.artTags.length === 0) {
    // No artTags at all - assign suggested
    if (suggested.length > 0) {
      const finalTags = suggested.slice(0, 3);
      report.artTagChanges.push({ id: e.id, title: e.title, action: 'assigned', tags: finalTags });
      e.artTags = finalTags;
    } else {
      report.issues.push({ id: e.id, title: e.title, issue: 'Could not auto-assign artTags' });
    }
  } else {
    // Has artTags - check if obvious ones are missing
    const missing = suggested.filter(t => !existingTags.has(t));
    // Only add clearly missing important tags
    const importantMissing = missing.filter(t => {
      // Only add if the match is very strong
      const text = ((e.title || '') + ' ' + (e.description || '')).toLowerCase();
      if (t === 'yoga' && /\byoga\b/.test(text)) return true;
      if (t === 'fasching' && /fasching|fosnacht/.test(text)) return true;
      if (t === 'volleyball' && /volleyball/.test(text)) return true;
      if (t === 'handball' && /handball/.test(text)) return true;
      if (t === 'tennis' && /\btennis\b/.test(text)) return true;
      if (t === 'radtour' && /radtour|feierabendtour|nachmittagstour/.test(text)) return true;
      if (t === 'wandern' && /wandern|wanderung/.test(text)) return true;
      if (t === 'tanz' && /tanz|milonga|discofox/.test(text) && !existingTags.has('tanz')) return true;
      if (t === 'meditation' && /meditation/.test(text)) return true;
      if (t === 'zeremonie' && /zeremonie/.test(text)) return true;
      return false;
    });
    if (importantMissing.length > 0) {
      report.artTagChanges.push({ id: e.id, title: e.title, action: 'added', tags: importantMissing, existing: [...existingTags] });
      e.artTags = [...existingTags, ...importantMissing];
    }
  }
  
  // Clean up: remove old "tags" field, it should be "artTags"
  if (e.tags) {
    delete e.tags;
  }
});

// ============================================================
// 6. UPDATE COUNTS
// ============================================================
data.eventCount = data.events.length;

// Remove starnberg-ammersee from regions if no events use it
const regionsUsed = new Set(data.events.map(e => e.region));
if (!regionsUsed.has('starnberg-ammersee')) {
  delete data.regions['starnberg-ammersee'];
}

// ============================================================
// 7. WRITE OUTPUT
// ============================================================
writeFileSync('./src/data/events.json', JSON.stringify(data, null, 2) + '\n', 'utf-8');

// ============================================================
// 8. GENERATE REPORT
// ============================================================
const catChangesByType = {};
report.categoryChanges.forEach(c => {
  const key = `${c.from} → ${c.to}`;
  if (!catChangesByType[key]) catChangesByType[key] = [];
  catChangesByType[key].push(c);
});

let md = `# Data Quality Report
*Generated: ${new Date().toISOString().split('T')[0]}*

## Summary
- **Events total:** ${data.events.length} (was ${beforeCount})
- **Category changes:** ${report.categoryChanges.length}
- **artTags assigned/updated:** ${report.artTagChanges.length}
- **Region migrations:** ${report.regionChanges.length}
- **Duplicates removed:** ${report.duplicatesRemoved.length}

## 1. Region Changes

### New Region Definitions Added
- \`starnberger-see\`: Starnberger See 🏔️
- \`ammersee\`: Ammersee ⛵

### Migrated Events (from \`starnberg-ammersee\`)
| ID | Title | New Region |
|----|-------|-----------|
`;
report.regionChanges.forEach(r => {
  md += `| ${r.id} | ${r.title} | \`${r.to}\` ${r.note ? '(default)' : ''} |\n`;
});

md += `
### Region \`starnberg-ammersee\` ${regionsUsed.has('starnberg-ammersee') ? 'still in use' : 'removed (no longer needed)'}

## 2. Category Changes (${report.categoryChanges.length})

`;
Object.entries(catChangesByType).forEach(([key, changes]) => {
  md += `### ${key} (${changes.length})\n`;
  changes.slice(0, 10).forEach(c => {
    md += `- **${c.title}** (ID ${c.id})\n`;
  });
  if (changes.length > 10) md += `- ... and ${changes.length - 10} more\n`;
  md += '\n';
});

md += `## 3. artTags Changes (${report.artTagChanges.length})

### Newly Assigned (events that had NO artTags)
`;
const assigned = report.artTagChanges.filter(c => c.action === 'assigned');
md += `**${assigned.length} events** received artTags for the first time.\n\n`;
assigned.slice(0, 15).forEach(c => {
  md += `- **${c.title}** (ID ${c.id}): [${c.tags.join(', ')}]\n`;
});
if (assigned.length > 15) md += `- ... and ${assigned.length - 15} more\n`;

const added = report.artTagChanges.filter(c => c.action === 'added');
md += `\n### Tags Added to Existing (${added.length})\n`;
added.slice(0, 10).forEach(c => {
  md += `- **${c.title}** (ID ${c.id}): added [${c.tags.join(', ')}] to existing [${c.existing.join(', ')}]\n`;
});
if (added.length > 10) md += `- ... and ${added.length - 10} more\n`;

md += `
## 4. Duplicates Removed (${report.duplicatesRemoved.length})

`;
report.duplicatesRemoved.forEach(d => {
  md += `- **${d.title}** (ID ${d.id}, date: ${d.date})\n`;
});

md += `
## 5. Remaining Issues

`;
if (report.issues.length > 0) {
  report.issues.forEach(i => {
    md += `- ⚠️ **${i.title}** (ID ${i.id}): ${i.issue}\n`;
  });
} else {
  md += `✅ No remaining issues.\n`;
}

// Final stats
const finalCats = {};
data.events.forEach(e => { finalCats[e.category] = (finalCats[e.category]||0)+1; });
const finalNoTags = data.events.filter(e => !e.artTags || e.artTags.length === 0).length;
const finalRegions = {};
data.events.forEach(e => { finalRegions[e.region] = (finalRegions[e.region]||0)+1; });

md += `
## 6. Final Statistics

### Categories
| Category | Count |
|----------|-------|
${Object.entries(finalCats).sort((a,b) => b[1]-a[1]).map(([k,v]) => `| ${k} | ${v} |`).join('\n')}

### Regions
| Region | Count |
|--------|-------|
${Object.entries(finalRegions).sort((a,b) => b[1]-a[1]).map(([k,v]) => `| ${k} | ${v} |`).join('\n')}

### artTags Coverage
- Events with artTags: ${data.events.filter(e => e.artTags && e.artTags.length > 0).length} / ${data.events.length}
- Events without artTags: ${finalNoTags}
`;

writeFileSync('./DATA-QUALITY-REPORT.md', md, 'utf-8');

console.log('=== PROCESSING COMPLETE ===');
console.log(`Events: ${beforeCount} → ${data.events.length}`);
console.log(`Category changes: ${report.categoryChanges.length}`);
console.log(`artTag changes: ${report.artTagChanges.length} (${assigned.length} assigned, ${added.length} added)`);
console.log(`Region migrations: ${report.regionChanges.length}`);
console.log(`Duplicates removed: ${report.duplicatesRemoved.length}`);
console.log(`Remaining without artTags: ${finalNoTags}`);
console.log(`Issues: ${report.issues.length}`);
