-- =============================================
--  FOUND — Supabase Database Setup
-- =============================================
--  Run this in: Supabase Dashboard → SQL Editor
-- =============================================

-- 1. Create the photos table
CREATE TABLE photos (
  id          TEXT PRIMARY KEY,          -- 4-char code e.g. 'A9F2'
  hidden_date TEXT NOT NULL,             -- human-readable e.g. '14 February 2026'
  found       BOOLEAN DEFAULT FALSE,
  found_date  TEXT,                      -- human-readable e.g. '2 April 2026'
  location    TEXT,                      -- e.g. 'Berlin, Germany'
  caption     TEXT,                      -- optional finder message
  created_at  TIMESTAMPTZ DEFAULT NOW(), -- when YOU hid the photo
  found_at    TIMESTAMPTZ               -- when it was marked found
);

-- 2. Enable Row Level Security
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- 3. Policy: anyone can READ all records
CREATE POLICY "Public read access"
  ON photos FOR SELECT
  USING (true);

-- 4. Policy: anyone can UPDATE only unfound records, only specific columns
--    (The API route does the actual update via service role,
--     but this is a safety net if the anon key is ever exposed)
CREATE POLICY "Mark as found only"
  ON photos FOR UPDATE
  USING (found = false)
  WITH CHECK (found = true);

-- 5. No INSERT or DELETE for public — only you via the dashboard
--    (service role bypasses RLS, so your API route still works)

-- =============================================
--  SEED DATA — remove or modify as needed
-- =============================================

INSERT INTO photos (id, hidden_date, found, found_date, location, caption, found_at) VALUES
  ('A9F2', '14 February 2026', true,  '2 April 2026',    'Berlin, Germany',      'Found near the river.',          '2026-04-02T14:30:00Z'),
  ('K7M4', '19 March 2026',   true,  '19 March 2026',   'Lisbon, Portugal',      NULL,                             '2026-03-19T10:00:00Z'),
  ('Q3B7', '5 January 2026',  true,  '12 January 2026', 'Prague, Czechia',       'On a bench in Letná Park.',      '2026-01-12T16:45:00Z'),
  ('T4P8', '22 January 2026', true,  '3 February 2026', 'Melbourne, Australia',  'Tucked inside a library book.',  '2026-02-03T09:20:00Z'),
  ('L2X9', '28 March 2026',   false, NULL,               NULL,                    NULL,                             NULL),
  ('W8N1', '1 February 2026', false, NULL,               NULL,                    NULL,                             NULL);
