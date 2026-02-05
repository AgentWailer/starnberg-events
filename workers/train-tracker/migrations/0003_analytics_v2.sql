ALTER TABLE analytics_pageviews ADD COLUMN language TEXT DEFAULT '';
ALTER TABLE analytics_pageviews ADD COLUMN is_new INTEGER DEFAULT 0;
