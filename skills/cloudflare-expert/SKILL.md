# Cloudflare Expert Playbook

> Umfassendes Playbook für das Cloudflare-Ökosystem mit Fokus auf praktische Anwendung und Kostenoptimierung.

---

## 1. Workers

### Execution Model
Workers laufen auf Cloudflare's globalem Edge-Netzwerk in **Isolates** (V8-basiert, nicht Container).

```
Request → Edge Location → Isolate → Response
                ↓
        Cold Start: ~5ms (vs ~200ms bei Lambda)
```

**Key Concepts:**
- **Isolates** teilen sich Memory zwischen Requests (≠ Container)
- Worker startet bei Inaktivität automatisch neu
- Keine persistente Verbindung zwischen Requests

### Limits (Stand 2024)

| Feature | Free | Paid |
|---------|------|------|
| **Requests** | 100K/Tag | Unlimited |
| **CPU Zeit** | 10ms | 30s (max 5min) |
| **Memory** | 128 MB | 128 MB |
| **Worker Size** | 3 MB | 10 MB |
| **Subrequests** | 50/Request | 1000/Request |
| **Cron Triggers** | 5 | 250 |
| **Env Variables** | 64 | 128 |

### Durable Objects vs KV vs D1

| Kriterium | KV | D1 | Durable Objects |
|-----------|----|----|-----------------|
| **Konsistenz** | Eventually | Strong | Strong |
| **Latenz** | ~50ms Write | ~10ms | <1ms (in-region) |
| **Use Case** | Config, Cache | Relational Data | Real-time, State |
| **Preis** | $0.50/M reads | $0.001/M rows | $0.15/M requests |
| **Limit** | 25 MiB/value | 10 GB/DB | Unbegrenzt |

**Entscheidungsbaum:**
```
Brauchst du SQL-Queries?
├─ Ja → D1
└─ Nein → Brauchst du Echtzeit-Koordination?
          ├─ Ja → Durable Objects
          └─ Nein → KV (für Reads) oder D1 (für Writes)
```

### Cron Triggers Best Practices

```javascript
// wrangler.jsonc
{
  "triggers": {
    "crons": [
      "*/5 * * * *",     // Alle 5 Minuten
      "0 0 * * *",       // Täglich um Mitternacht UTC
      "0 */6 * * *"      // Alle 6 Stunden
    ]
  }
}
```

```javascript
// src/index.js
export default {
  async scheduled(controller, env, ctx) {
    const cronExpression = controller.cron;
    const scheduledTime = controller.scheduledTime;
    
    // Wichtig: ctx.waitUntil() für async Cleanup
    ctx.waitUntil(
      (async () => {
        try {
          await doExpensiveWork(env);
        } catch (e) {
          // Fehler loggen, nicht werfen (sonst kein Retry)
          console.error('Cron failed:', e);
        }
      })()
    );
  }
};
```

**Cron CPU Limits:**
- HTTP Requests: max 30s (konfigurierbar bis 5min)
- Cron Triggers: max **15 Minuten** CPU Zeit

### Error Handling & Logging

```javascript
export default {
  async fetch(request, env, ctx) {
    try {
      const result = await riskyOperation();
      return Response.json(result);
    } catch (error) {
      // Strukturiertes Logging für Workers Logs
      console.log({
        level: 'error',
        message: error.message,
        stack: error.stack,
        url: request.url,
        cf: request.cf, // Geolocation, ASN, etc.
      });
      
      // Sentry/Error-Tracking via waitUntil
      ctx.waitUntil(reportToSentry(error, request));
      
      return new Response('Internal Error', { status: 500 });
    }
  }
};
```

**Workers Logs aktivieren:**
```javascript
// wrangler.jsonc
{
  "observability": {
    "enabled": true,
    "head_sampling_rate": 1  // 100% - für Prod: 0.1 (10%)
  }
}
```

**Kosten Workers Logs:**
- Free: 200K Logs/Tag, 3 Tage Retention
- Paid: 20M inkludiert + $0.60/Million, 7 Tage Retention

### Wrangler CLI Mastery

```bash
# Projekt initialisieren
npx wrangler init my-worker

# Lokale Entwicklung (mit echten Bindings!)
npx wrangler dev --remote  # Nutzt echte KV, D1, etc.
npx wrangler dev            # Lokale Simulation

# Deployment
npx wrangler deploy
npx wrangler deploy --env staging  # Environment

# Secrets (nie in wrangler.toml!)
npx wrangler secret put API_KEY
npx wrangler secret list
npx wrangler secret delete API_KEY

# Logs in Echtzeit
npx wrangler tail              # Alle Logs
npx wrangler tail --format=json

# Cron manuell testen
curl "http://localhost:8787/cdn-cgi/handler/scheduled"
curl "http://localhost:8787/cdn-cgi/handler/scheduled?cron=0+*+*+*+*"

# D1 Interaktion
npx wrangler d1 execute my-db --command "SELECT * FROM users"
npx wrangler d1 execute my-db --file ./schema.sql

# KV
npx wrangler kv key put --binding=MY_KV "key" "value"
npx wrangler kv key get --binding=MY_KV "key"
```

---

## 2. D1 (SQLite)

### Schema Design für Analytics

```sql
-- Zeitreihen-optimiertes Schema
CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id TEXT,
  properties TEXT,  -- JSON für flexible Daten
  created_at TEXT DEFAULT (datetime('now')),
  
  -- Partitionierung simulieren
  date_partition TEXT GENERATED ALWAYS AS (date(created_at)) STORED
);

-- Kritische Indizes
CREATE INDEX idx_events_type_date ON events(event_type, date_partition);
CREATE INDEX idx_events_user ON events(user_id) WHERE user_id IS NOT NULL;

-- Aggregierte Tabelle für schnelle Dashboards
CREATE TABLE daily_stats (
  date TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  UNIQUE(date, event_type)
);
```

### Query Performance

```javascript
// ❌ Schlecht: Full Table Scan
const result = await env.DB
  .prepare("SELECT * FROM events WHERE properties LIKE '%premium%'")
  .all();

// ✅ Gut: Index nutzen
const result = await env.DB
  .prepare(`
    SELECT * FROM events 
    WHERE event_type = ? 
    AND date_partition = date('now')
  `)
  .bind('purchase')
  .all();

// Batch-Operationen für Writes
const stmt = env.DB.prepare(
  "INSERT INTO events (event_type, user_id, properties) VALUES (?, ?, ?)"
);
await env.DB.batch([
  stmt.bind('click', 'user1', '{}'),
  stmt.bind('view', 'user2', '{}'),
  stmt.bind('purchase', 'user1', '{"amount": 99}'),
]);
```

**EXPLAIN analysieren:**
```sql
EXPLAIN QUERY PLAN SELECT * FROM events WHERE user_id = 'abc';
-- Ergebnis: SEARCH events USING INDEX idx_events_user (user_id=?)
```

### Migrations

```bash
# Migration erstellen
npx wrangler d1 migrations create my-db add_users_table

# Generiert: migrations/0001_add_users_table.sql
```

```sql
-- migrations/0001_add_users_table.sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_email ON users(email);
```

```bash
# Migrations anwenden
npx wrangler d1 migrations apply my-db          # Production
npx wrangler d1 migrations apply my-db --local  # Lokal

# Status prüfen
npx wrangler d1 migrations list my-db
```

### Backups & Time Travel

```bash
# Manuelles Backup
npx wrangler d1 backup create my-db

# Backups auflisten
npx wrangler d1 backup list my-db

# Restore von Backup
npx wrangler d1 backup restore my-db <backup-id>
```

**Time Travel (Point-in-Time Recovery):**
- Paid: 30 Tage zurück
- Free: 7 Tage zurück
- Max 10 Restores pro 10 Minuten

### D1 Limits & Workarounds

| Limit | Wert | Workaround |
|-------|------|------------|
| Max DB Size | 10 GB | Sharding über mehrere DBs |
| Max Row Size | 2 MB | Große Blobs in R2 speichern |
| Query Timeout | 30s | Batch-Processing |
| Columns/Table | 100 | JSON für flexible Felder |
| Concurrent Queries | Begrenzt | Read Replicas nutzen |

**Große DELETE/UPDATE in Batches:**
```javascript
async function batchDelete(db, table, condition, batchSize = 1000) {
  let deleted = 0;
  while (true) {
    const result = await db
      .prepare(`DELETE FROM ${table} WHERE ${condition} LIMIT ?`)
      .bind(batchSize)
      .run();
    
    deleted += result.meta.changes;
    if (result.meta.changes < batchSize) break;
  }
  return deleted;
}
```

### D1 Pricing

| Metrik | Free | Paid |
|--------|------|------|
| Rows Read | 5M/Tag | 25B/Monat inkl., +$0.001/M |
| Rows Written | 100K/Tag | 50M/Monat inkl., +$1.00/M |
| Storage | 5 GB total | 5 GB inkl., +$0.75/GB-Monat |

---

## 3. Workers AI

### Verfügbare Modelle (Highlights)

**Text Generation:**
| Modell | Speed | Quality | Kosten/M Output |
|--------|-------|---------|-----------------|
| llama-3.2-1b-instruct | ⚡⚡⚡ | ★★ | $0.20 |
| llama-3.1-8b-instruct-fast | ⚡⚡⚡ | ★★★ | $0.38 |
| llama-3.3-70b-fp8-fast | ⚡⚡ | ★★★★ | $2.25 |
| deepseek-r1-distill-qwen-32b | ⚡ | ★★★★★ | $4.88 |
| gpt-oss-120b (OpenAI) | ⚡ | ★★★★★ | $0.75 |

**Embeddings:**
| Modell | Dimensionen | Kosten/M Tokens |
|--------|-------------|-----------------|
| bge-small-en-v1.5 | 384 | $0.02 |
| bge-base-en-v1.5 | 768 | $0.07 |
| bge-m3 (multilingual) | 1024 | $0.01 |

**Image Generation:**
| Modell | Speed | Quality | Kosten |
|--------|-------|---------|--------|
| flux-1-schnell | ⚡⚡⚡ | ★★★ | ~$0.005/Bild |
| flux-2-dev | ⚡⚡ | ★★★★ | ~$0.02/Bild |

### Kosten & Limits

**Pricing:**
- Free: 10,000 Neurons/Tag
- Paid: 10,000 Neurons/Tag inkl. + $0.011/1,000 Neurons

**Neurons berechnen:**
```javascript
// Beispiel: llama-3.1-8b-instruct-fast
// Input: 4,119 Neurons/M tokens
// Output: 34,868 Neurons/M tokens

// 1000 Token Input + 500 Token Output:
const neurons = (1000 * 4119 / 1_000_000) + (500 * 34868 / 1_000_000);
// = 4.12 + 17.43 = 21.55 Neurons
// Kosten: 21.55 * $0.011 / 1000 = $0.00024
```

### Streaming Responses

```javascript
export default {
  async fetch(request, env) {
    const messages = [
      { role: 'user', content: 'Erkläre Cloudflare Workers in 3 Sätzen.' }
    ];

    // Streaming Response
    const stream = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast', {
      messages,
      stream: true,
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  }
};
```

**Client-seitiges Parsing:**
```javascript
const response = await fetch('/api/ai');
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  // SSE Format: data: {"response": "..."}
  const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
  for (const line of lines) {
    const json = JSON.parse(line.slice(6));
    console.log(json.response);
  }
}
```

### Prompt Engineering für CF AI

```javascript
// System Prompt für konsistente Outputs
const systemPrompt = `Du bist ein hilfreicher Assistent für Event-Informationen.
Antworte immer auf Deutsch.
Formatiere Daten als: DD.MM.YYYY
Halte Antworten unter 100 Wörtern.`;

const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct-fast', {
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userQuery }
  ],
  max_tokens: 256,
  temperature: 0.7,  // 0 = deterministisch, 1 = kreativ
});
```

**Function Calling (bei unterstützten Modellen):**
```javascript
const result = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
  messages: [{ role: 'user', content: 'Wie ist das Wetter in München?' }],
  tools: [{
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Holt aktuelle Wetterdaten',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string', description: 'Stadt' }
        },
        required: ['location']
      }
    }
  }]
});
```

---

## 4. Pages

### Build Configuration

```javascript
// wrangler.jsonc für Pages
{
  "name": "my-site",
  "pages_build_output_dir": "dist",
  "compatibility_date": "2024-01-01"
}
```

**Framework-spezifische Configs:**

```bash
# Next.js
npx @cloudflare/next-on-pages

# Astro
npm run build  # Output: dist/

# SvelteKit
npm run build  # Mit @sveltejs/adapter-cloudflare
```

### Preview Deployments

```bash
# Automatisch bei PR
# Jeder Branch bekommt: <branch>.<project>.pages.dev

# Manuell deployen
npx wrangler pages deploy dist/ --branch=feature-x
```

**Preview URLs schützen:**
```javascript
// functions/_middleware.js
export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  // Nur auf Preview-Domains
  if (url.hostname.includes('.pages.dev') && 
      !url.hostname.startsWith('www')) {
    const auth = context.request.headers.get('Authorization');
    if (auth !== `Bearer ${context.env.PREVIEW_TOKEN}`) {
      return new Response('Unauthorized', { status: 401 });
    }
  }
  
  return context.next();
}
```

### Functions (API Routes)

```
functions/
├── api/
│   ├── events.js          → /api/events
│   ├── events/
│   │   └── [id].js        → /api/events/:id
│   └── [[catchall]].js    → /api/*
└── _middleware.js          → Alle Routes
```

```javascript
// functions/api/events/[id].js
export async function onRequestGet(context) {
  const { id } = context.params;
  const event = await context.env.DB
    .prepare('SELECT * FROM events WHERE id = ?')
    .bind(id)
    .first();
  
  if (!event) {
    return new Response('Not found', { status: 404 });
  }
  
  return Response.json(event);
}

export async function onRequestPut(context) {
  const { id } = context.params;
  const body = await context.request.json();
  
  await context.env.DB
    .prepare('UPDATE events SET title = ? WHERE id = ?')
    .bind(body.title, id)
    .run();
  
  return new Response('Updated', { status: 200 });
}
```

### Headers & Redirects

**`public/_headers`:**
```
# Alle Seiten
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer

# Statische Assets mit langem Cache
/assets/*
  Cache-Control: public, max-age=31536000, immutable

# API CORS
/api/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE

# Robots für Preview
https://:project.pages.dev/*
  X-Robots-Tag: noindex
```

**`public/_redirects`:**
```
# Alte URLs umleiten
/old-page  /new-page  301

# SPA Fallback
/*  /index.html  200

# Sprach-basierte Weiterleitung
/  /de  302  Language=de
/  /en  302  Language=en
```

---

## 5. R2 (Object Storage)

### Wann R2 vs externe Dienste?

| Kriterium | R2 | S3 | Backblaze B2 |
|-----------|----|----|--------------|
| **Egress** | **KOSTENLOS** | $0.09/GB | $0.01/GB |
| **Storage** | $0.015/GB | $0.023/GB | $0.006/GB |
| **Class A Ops** | $4.50/M | $5.00/M | $0.004/10K |
| **Class B Ops** | $0.36/M | $0.40/M | Free |
| **Free Tier** | 10 GB | 5 GB (12 Mo) | 10 GB |

**R2 wählen wenn:**
- ✅ Hoher Egress (Video Streaming, Downloads)
- ✅ Bereits auf Cloudflare (Workers Integration)
- ✅ Einfache S3-kompatible API nötig

**S3/andere wählen wenn:**
- ❌ Komplexe S3-Features (Object Lock, Glacier)
- ❌ Multi-Region Replication nötig
- ❌ AWS-Ökosystem tief integriert

### Presigned URLs

```javascript
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
});

// Download-URL (1 Stunde gültig)
export async function getDownloadUrl(key) {
  return getSignedUrl(
    S3,
    new GetObjectCommand({ Bucket: 'my-bucket', Key: key }),
    { expiresIn: 3600 }
  );
}

// Upload-URL mit Content-Type Restriction
export async function getUploadUrl(key, contentType) {
  return getSignedUrl(
    S3,
    new PutObjectCommand({
      Bucket: 'my-bucket',
      Key: key,
      ContentType: contentType, // Erzwingt diesen Type!
    }),
    { expiresIn: 600 } // 10 Minuten
  );
}
```

**Sicherheit:**
- Presigned URLs sind Bearer Tokens - kurze Expiry nutzen!
- `ContentType` in PutObjectCommand verhindert falsche Uploads

### CORS Configuration

```javascript
// Via Wrangler oder Dashboard
const corsRules = [
  {
    AllowedOrigins: ['https://mysite.com', 'https://*.pages.dev'],
    AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
    AllowedHeaders: ['*'],
    ExposeHeaders: ['ETag', 'Content-Length'],
    MaxAgeSeconds: 3600
  }
];
```

```bash
# CORS setzen via AWS CLI
aws s3api put-bucket-cors \
  --bucket my-bucket \
  --cors-configuration file://cors.json \
  --endpoint-url https://${ACCOUNT_ID}.r2.cloudflarestorage.com
```

### Kosten-Optimierung

**1. Infrequent Access Storage:**
```javascript
// Für Daten die selten gelesen werden
// Storage: $0.01/GB (vs $0.015)
// Aber: $0.01/GB Retrieval + höhere Ops-Kosten
// → Nur bei wirklich seltenen Reads (<1x/Monat)
```

**2. Lifecycle Rules:**
```javascript
// Alte Daten automatisch löschen
const lifecycleRules = {
  Rules: [{
    ID: 'delete-old-logs',
    Filter: { Prefix: 'logs/' },
    Status: 'Enabled',
    Expiration: { Days: 30 }
  }]
};
```

**3. Multipart Uploads für große Dateien:**
```javascript
// Automatisch bei AWS SDK für Dateien > 100MB
// Parallele Uploads = schneller
// Resumable bei Fehlern
```

**Kostenbeispiel:**
```
10 GB Storage + 1M Downloads/Monat:
- R2: $0.15 Storage + $0.36 Ops + $0 Egress = $0.51
- S3:  $0.23 Storage + $0.40 Ops + $90 Egress = $90.63

→ R2 spart 99% bei hohem Egress!
```

---

## 6. Analytics & Observability

### Web Analytics

**Setup (ohne Proxy):**
```html
<!-- Automatisch bei Pages, sonst manuell: -->
<script 
  defer 
  src='https://static.cloudflareinsights.com/beacon.min.js' 
  data-cf-beacon='{"token": "YOUR_TOKEN"}'
></script>
```

**Features:**
- ✅ Kostenlos (alle Pläne)
- ✅ Privacy-first (keine Cookies)
- ✅ Core Web Vitals
- ❌ Keine Custom Events (dafür: Workers Analytics)

### Workers Analytics

```javascript
// In Worker: Analytics Engine Binding
export default {
  async fetch(request, env) {
    const start = Date.now();
    
    // ... Request verarbeiten
    
    // Event loggen
    env.ANALYTICS.writeDataPoint({
      blobs: [
        request.cf?.country || 'unknown',
        new URL(request.url).pathname,
      ],
      doubles: [
        Date.now() - start,  // Latenz
        1,                   // Count
      ],
      indexes: [request.cf?.country || 'XX'],
    });
    
    return response;
  }
};
```

**Querying via GraphQL:**
```graphql
query {
  viewer {
    accounts(filter: {accountTag: "YOUR_ACCOUNT_ID"}) {
      workersAnalyticsEngineAdaptiveGroups(
        filter: {
          datetime_gt: "2024-01-01T00:00:00Z"
        }
        limit: 100
      ) {
        dimensions {
          blob1  # country
          blob2  # path
        }
        sum {
          double1  # total latency
          double2  # count
        }
      }
    }
  }
}
```

### Logpush

```javascript
// wrangler.jsonc
{
  "logpush": true  // Aktiviert Logpush für diesen Worker
}
```

**Destinations:**
- R2 (günstigste Option)
- S3
- Azure Blob
- BigQuery
- Datadog
- Splunk
- etc.

**Setup via Dashboard:**
1. Workers & Pages → Logs → Logpush
2. Destination wählen
3. Fields auswählen
4. Filter/Sampling konfigurieren

**Kosten:**
- $0.05/Million Log-Zeilen (nach Filtering)
- Tipp: Sampling nutzen für High-Traffic Workers

### Real-time Logs

```bash
# Echtzeit-Logs im Terminal
npx wrangler tail my-worker

# Mit Filter
npx wrangler tail my-worker --status error
npx wrangler tail my-worker --search "user_id=123"

# JSON Format für Parsing
npx wrangler tail my-worker --format json | jq '.logs[]'
```

**Im Code:**
```javascript
// Strukturiertes Logging
console.log(JSON.stringify({
  level: 'info',
  event: 'user_login',
  user_id: userId,
  ip: request.headers.get('CF-Connecting-IP'),
  country: request.cf?.country,
}));
```

---

## Quick Reference: Kosten-Übersicht

| Service | Free Tier | Paid (typisch) |
|---------|-----------|----------------|
| **Workers** | 100K req/Tag | $5/Mo + $0.30/M req |
| **D1** | 5M reads/Tag | $0.001/M rows |
| **KV** | 100K reads/Tag | $0.50/M reads |
| **R2** | 10 GB + 1M ops | $0.015/GB + $0/egress |
| **Durable Objects** | 100K req/Tag | $0.15/M req |
| **Workers AI** | 10K neurons/Tag | $0.011/1K neurons |
| **Pages** | Unlimited | Unlimited |
| **Web Analytics** | Unlimited | Unlimited |

---

## Projekt-Template

```
my-project/
├── src/
│   └── index.ts           # Worker Entry
├── functions/             # Pages Functions
│   └── api/
├── migrations/            # D1 Migrations
├── public/
│   ├── _headers
│   └── _redirects
├── wrangler.jsonc
└── package.json
```

```javascript
// wrangler.jsonc - Vollständiges Beispiel
{
  "name": "my-project",
  "main": "src/index.ts",
  "compatibility_date": "2024-01-01",
  
  "observability": {
    "enabled": true,
    "head_sampling_rate": 0.1
  },
  
  "kv_namespaces": [
    { "binding": "CACHE", "id": "xxx" }
  ],
  
  "d1_databases": [
    { "binding": "DB", "database_id": "xxx", "database_name": "prod" }
  ],
  
  "r2_buckets": [
    { "binding": "ASSETS", "bucket_name": "my-assets" }
  ],
  
  "ai": {
    "binding": "AI"
  },
  
  "triggers": {
    "crons": ["0 * * * *"]
  }
}
```

---

*Letzte Aktualisierung: Februar 2024*
*Quelle: developers.cloudflare.com*
