/*
  # Create wine_runs table

  ## Summary
  Replaces the hardcoded RUNS array in the frontend with a DB-driven table
  that ops can manage without code deploys.

  ## New table: wine_runs
  - `id` (uuid, pk)
  - `label` (text, unique) — human-readable edition label e.g. "Mai 2026"
  - `cutoff_date` (date) — last date a reservation is accepted for this run
  - `distribution_label` (text) — display-only distribution date e.g. "30 avril 2026"
  - `sort_order` (int, default 0) — display order in the UI
  - `is_active` (boolean, default true) — if false, hidden from the booking modal entirely

  ## Security
  - RLS enabled
  - Authenticated + anon users can SELECT (needed for public booking modal)
  - No direct INSERT/UPDATE/DELETE from frontend — all writes go through ops edge function with service role
*/

CREATE TABLE IF NOT EXISTS wine_runs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at       timestamptz DEFAULT now(),
  label            text NOT NULL DEFAULT '',
  cutoff_date      date NOT NULL,
  distribution_label text NOT NULL DEFAULT '',
  sort_order       integer NOT NULL DEFAULT 0,
  is_active        boolean NOT NULL DEFAULT true,
  CONSTRAINT wine_runs_label_unique UNIQUE (label)
);

ALTER TABLE wine_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active runs"
  ON wine_runs FOR SELECT
  USING (true);

-- Seed with the three runs that were previously hardcoded
INSERT INTO wine_runs (label, cutoff_date, distribution_label, sort_order, is_active)
VALUES
  ('Mai 2026',     '2026-03-16', '30 avril 2026',  1, true),
  ('Juin 2026',    '2026-04-16', '31 mai 2026',    2, true),
  ('Juillet 2026', '2026-05-17', '1 juillet 2026', 3, true)
ON CONFLICT (label) DO NOTHING;
