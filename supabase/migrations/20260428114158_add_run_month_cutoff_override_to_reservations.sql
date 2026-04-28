/*
  # Add run_month, cutoff_date, manual_override, override_note to wine_reservations

  ## Summary
  Extends the wine_reservations table to support the booking-loop concept of
  edition runs (run/month selection), cutoff dates, and ops manual override flags.

  ## Changes
  ### Modified table: wine_reservations
  - `run_month` (text, nullable) — human-readable edition label e.g. "Mai 2026"
  - `cutoff_date` (date, nullable) — the integration cutoff for the chosen run
  - `manual_override` (boolean, default false) — ops flag: true = approved exception even past cutoff
  - `override_note` (text, nullable) — internal ops note explaining the exception

  ## Notes
  - All columns are nullable or have safe defaults so existing rows are unaffected.
  - No RLS changes needed: existing policies already cover these new columns.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wine_reservations' AND column_name = 'run_month'
  ) THEN
    ALTER TABLE wine_reservations ADD COLUMN run_month text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wine_reservations' AND column_name = 'cutoff_date'
  ) THEN
    ALTER TABLE wine_reservations ADD COLUMN cutoff_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wine_reservations' AND column_name = 'manual_override'
  ) THEN
    ALTER TABLE wine_reservations ADD COLUMN manual_override boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'wine_reservations' AND column_name = 'override_note'
  ) THEN
    ALTER TABLE wine_reservations ADD COLUMN override_note text;
  END IF;
END $$;
