-- Spidy Database Schema
-- Cookieless, privacy-first web analytics

CREATE TABLE IF NOT EXISTS sites (
  id text PRIMARY KEY,
  domain text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  ts timestamptz NOT NULL DEFAULT now(),
  site_id text NOT NULL REFERENCES sites(id),
  path text NOT NULL,
  referrer text,
  country text,
  city text,
  lat real,
  lon real,
  device text,
  browser text,
  os text,
  visitor text NOT NULL,
  session text
);

CREATE INDEX IF NOT EXISTS events_site_ts ON events (site_id, ts DESC);
CREATE INDEX IF NOT EXISTS events_site_path ON events (site_id, path);
CREATE INDEX IF NOT EXISTS events_site_visitor ON events (site_id, visitor);

CREATE TABLE IF NOT EXISTS daily_stats (
  day date NOT NULL,
  site_id text NOT NULL REFERENCES sites(id),
  path text NOT NULL,
  referrer text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  device text NOT NULL DEFAULT '',
  views int NOT NULL DEFAULT 0,
  visitors int NOT NULL DEFAULT 0,
  PRIMARY KEY (day, site_id, path, referrer, country, device)
);

CREATE INDEX IF NOT EXISTS daily_stats_site_day ON daily_stats (site_id, day DESC);
