/*
  # Add has_non_alcoholic attribute to vinocap_winery_profiles

  ## Summary
  Adds a boolean attribute to represent whether a winery produces non-alcoholic
  (sans alcool) wines. This is stored as a secondary attribute alongside
  the existing wine_types array, not as a replacement wine color category.

  ## What changed
  - `vinocap_winery_profiles`
    - New column: `has_non_alcoholic` (boolean, default false)
      Indicates the winery offers at least one non-alcoholic wine.
      Compatible with existing wine_types values (rouge, blanc, rose, bulles).

  ## Notes
  - No existing data is modified; all existing rows default to false.
  - This column is intentionally orthogonal to wine_types.
  - A winery can be e.g. wine_types=['rouge','blanc'] AND has_non_alcoholic=true.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'has_non_alcoholic'
  ) THEN
    ALTER TABLE vinocap_winery_profiles
      ADD COLUMN has_non_alcoholic boolean NOT NULL DEFAULT false;
  END IF;
END $$;
