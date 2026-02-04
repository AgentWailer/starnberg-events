-- S6 Pünktlichkeits-Tracker: D1 Schema
-- Jede S6-Abfahrt an Possenhofen wird einmal gespeichert,
-- bei wiederholtem Poll wird delay/cancelled aktualisiert (letzter Wert = genauester)

CREATE TABLE IF NOT EXISTS departures (
  trip_id      TEXT    NOT NULL,
  date         TEXT    NOT NULL,   -- YYYY-MM-DD (Betriebstag)
  planned_when TEXT    NOT NULL,   -- ISO-Timestamp geplante Abfahrt
  planned_hour INTEGER NOT NULL,   -- 0-23, für Stunden-Analyse
  delay        INTEGER,            -- Sekunden, NULL = keine Echtzeitdaten
  cancelled    INTEGER NOT NULL DEFAULT 0,  -- 1 = ausgefallen
  direction    TEXT    NOT NULL,   -- 'muenchen' oder 'tutzing'
  line         TEXT    NOT NULL,   -- z.B. 'S6'
  recorded_at  TEXT    NOT NULL,   -- ISO-Timestamp letztes Update
  PRIMARY KEY (trip_id, date)
);

CREATE INDEX IF NOT EXISTS idx_departures_date ON departures(date);
CREATE INDEX IF NOT EXISTS idx_departures_dir  ON departures(date, direction);
