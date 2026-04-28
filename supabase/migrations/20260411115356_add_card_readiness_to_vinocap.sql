/*
  # Add Card Readiness Fields to vinocap_winery_profiles

  ## Summary
  Extends the lifecycle model with two readiness checkpoint fields.
  These mark distinct stages between dossier submission and public publication.

  ### New Columns

  1. `preview_ready` (boolean, default false)
     Set to true when the profile has enough content to be internally previewed.
     Useful for admin/association preview before public publication.
     Does NOT make the card publicly visible — only `is_published = true` does that.

  2. `public_card_ready` (boolean, default false)
     Set to true when the card has been reviewed and is cleared for publication.
     Acts as the pre-publication gate before `is_published` is flipped to true.

  ## Lifecycle Sequence (readable at a glance)
  submitted → under_review → preview_ready → public_card_ready → is_published=true

  ## Security
  No RLS changes required. Existing policies cover new columns automatically.

  ## Notes
  - Seeded/published wineries are not affected (their is_published is already true)
  - All defaults are conservative (false) so no inadvertent exposure occurs
  - The public RLS policy already gates on is_published = true — this is unchanged
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'preview_ready'
  ) THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN preview_ready boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'public_card_ready'
  ) THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN public_card_ready boolean DEFAULT false;
  END IF;
END $$;
