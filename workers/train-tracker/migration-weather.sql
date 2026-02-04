-- Migration: Wetterdaten zu Abfahrten hinzufügen
-- WMO Weather Codes: 0=klar, 1-3=bewölkt, 45/48=Nebel, 51-57=Nieselregen,
--   61-67=Regen, 71-77=Schnee, 80-82=Regenschauer, 85-86=Schneeschauer, 95-99=Gewitter

ALTER TABLE departures ADD COLUMN weather_code INTEGER;      -- WMO code
ALTER TABLE departures ADD COLUMN temperature REAL;           -- °C
ALTER TABLE departures ADD COLUMN precipitation REAL;         -- mm
ALTER TABLE departures ADD COLUMN wind_speed REAL;            -- km/h

CREATE INDEX IF NOT EXISTS idx_departures_weather ON departures(date, weather_code);
