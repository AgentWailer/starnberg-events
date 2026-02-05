CREATE TABLE IF NOT EXISTS analytics_pageviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  date TEXT NOT NULL,
  path TEXT NOT NULL,
  referrer TEXT DEFAULT '',
  country TEXT DEFAULT '',
  device TEXT DEFAULT '',
  browser TEXT DEFAULT '',
  visitor_id TEXT DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_apv_date ON analytics_pageviews(date);
CREATE INDEX IF NOT EXISTS idx_apv_vid ON analytics_pageviews(visitor_id, date);
CREATE INDEX IF NOT EXISTS idx_apv_path ON analytics_pageviews(path, date);
