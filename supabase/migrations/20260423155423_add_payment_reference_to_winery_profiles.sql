/*
  # Add payment_reference to vinocap_winery_profiles

  1. Changes
    - Adds `payment_reference` (text, nullable) to vinocap_winery_profiles
    - This links a winery profile back to the reservation that funded its creation
    - Used by the /vin/finaliser flow to associate the fiche with the paid reservation

  2. Notes
    - Column is nullable: existing seeded profiles have no reservation
    - No unique constraint: for MVP simplicity; admin review handles duplicates
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'payment_reference'
  ) THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN payment_reference text DEFAULT NULL;
  END IF;
END $$;
