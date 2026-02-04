-- Migration: Weather cache table to avoid Open-Meteo rate limits
-- Only 1 row (id=1), refreshed every 30 minutes

CREATE TABLE IF NOT EXISTS weather_cache (
  id            INTEGER PRIMARY KEY,
  weather_code  INTEGER,
  temperature   REAL,
  precipitation REAL,
  wind_speed    REAL,
  fetched_at    TEXT NOT NULL
);
