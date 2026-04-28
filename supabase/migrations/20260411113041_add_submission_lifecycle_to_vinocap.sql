/*
  # Add Submission Lifecycle Fields to vinocap_winery_profiles

  ## Summary
  Introduces a structured submission lifecycle to the winery profile table.
  This turns onboarding from a simple form insert into a trackable dossier workflow.

  ### New Columns

  1. `submission_status` (text, default 'submitted')
     The lifecycle stage of the profile dossier.
     Accepted values: 'draft' | 'submitted' | 'under_review' | 'ready_for_publication' | 'published'

  2. `submitted_at` (timestamptz)
     Timestamp of when the winery completed and submitted their dossier.
     Set on insert by the client.

  3. `review_notes` (text, default '')
     Optional internal notes from the platform team during review.
     Not shown to the winery publicly.

  4. `publication_ready_at` (timestamptz)
     Timestamp set by admin when the profile is cleared for publication.

  ## Security
  No RLS changes required. Existing policies cover new columns automatically.

  ## Notes
  - All columns use IF NOT EXISTS pattern for safe re-run
  - `submission_status` defaults to 'submitted' so that all existing rows
    that arrived without a status are treated as submitted (not draft)
  - Backwards compatible with all seeded and existing onboarded data
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'submission_status'
  ) THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN submission_status text DEFAULT 'submitted';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'submitted_at'
  ) THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN submitted_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'review_notes'
  ) THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN review_notes text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'publication_ready_at'
  ) THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN publication_ready_at timestamptz;
  END IF;
END $$;
