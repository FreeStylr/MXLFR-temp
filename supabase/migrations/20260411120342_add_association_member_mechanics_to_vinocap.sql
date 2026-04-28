/*
  # Add Association Member Mechanics Fields to vinocap_winery_profiles

  ## Summary
  Strengthens the association/member layer by distinguishing how a winery entered
  the platform and when association membership was established.
  This makes the invite-driven Route member path operationally different from a
  generic winery submission — not just cosmetically different.

  ### New Columns

  1. `association_entry_path` (text, default 'none')
     How the winery joined the platform relative to their association.
     Accepted values:
       - 'none'   — no association, standard submission
       - 'direct' — submitted via /participer with association fields filled manually
       - 'invite' — entered through a tokenized /invite/:token link from the association

  2. `association_invited_at` (timestamptz)
     Timestamp when the invite token was consumed and the member joined via the
     association's invite flow. NULL for non-invite entries.

  ## Why This Matters
  With these two fields, the system can:
  - Distinguish invite-path Route members from generic submissions in the data model
  - Provide differentiated lifecycle logic (invite = faster/better-framed review path)
  - Support future association-assisted batch onboarding, member lists, and admin tooling
  - Show the pipeline of pending vs active members on the association page

  ## Lifecycle Difference
  - Generic submission: submission_status = 'submitted'
  - Invite-path member:  submission_status = 'under_review' (one stage ahead, association-backed)

  ## Security
  No RLS changes required. Existing policies cover new columns automatically.

  ## Notes
  - All existing rows default to 'none' (no entry path set) — backwards compatible
  - Seeded/published entries are unaffected
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'association_entry_path'
  ) THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN association_entry_path text DEFAULT 'none';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'association_invited_at'
  ) THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN association_invited_at timestamptz;
  END IF;
END $$;
