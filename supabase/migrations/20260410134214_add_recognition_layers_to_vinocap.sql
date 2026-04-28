/*
  # Add Recognition Layers to vinocap_winery_profiles

  ## Summary
  Extends the winery profile table with three structured recognition layers:

  ### 1. Official Origin / Appellation Layer
  New columns for legal wine-origin identity (AOP, AOC, IGP).
  These are separate from the existing loose `appellation` text field,
  providing a structured, validated origin scheme type plus display-ready fields.

  - `origin_scheme_type` — enum-like text: 'AOP' | 'AOC' | 'IGP' | 'other' | 'none'
  - `appellation_name` — canonical appellation name (e.g. "Saint-Chinian")
  - `protected_display_term` — full display string (e.g. "Saint-Chinian AOC")
  - `official_origin_verified` — boolean flag for admin-verified origins
  - `official_origin_logo_enabled` — whether to show the origin badge on cards

  ### 2. Certifications / Practices Layer
  Replaces the single `is_organic` / `is_sustainable` booleans with granular fields.
  Existing booleans are preserved for backwards compatibility.

  - `bio_ab` — boolean: Agriculture Biologique / AB label
  - `hve` — boolean: Haute Valeur Environnementale certification
  - `terra_vitis` — boolean: Terra Vitis certification
  - `vegan` — boolean: vegan wine / production
  - `sustainable_claim` — free text for other sustainability claims
  - `certification_notes` — any additional certification detail

  ### 3. Association Recognition Layer
  Supports membership in named associations (e.g. Route des Vignerons et des Pêcheurs).

  - `association_id` — short slug identifier for the association
  - `association_name` — full name of the association
  - `association_member_status` — text: 'member' | 'pending' | 'none'
  - `association_verified` — boolean: admin-verified membership
  - `association_badge_enabled` — whether to show the badge on cards/listing
  - `association_join_label` — display label for membership, e.g. "Membre de la Route des Vignerons et des Pêcheurs"

  ## Security
  No RLS changes — existing policies cover new columns automatically.

  ## Notes
  - All columns use IF NOT EXISTS pattern to be safe on re-run
  - All defaults are conservative (false / '' / 'none')
  - Backwards compatibility with existing seeded/onboarded data is maintained
*/

DO $$
BEGIN
  -- Official origin / appellation layer
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'origin_scheme_type') THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN origin_scheme_type text DEFAULT 'none';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'appellation_name') THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN appellation_name text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'protected_display_term') THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN protected_display_term text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'official_origin_verified') THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN official_origin_verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'official_origin_logo_enabled') THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN official_origin_logo_enabled boolean DEFAULT false;
  END IF;

  -- Certifications / practices layer
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'bio_ab') THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN bio_ab boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'hve') THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN hve boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'terra_vitis') THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN terra_vitis boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'vegan') THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN vegan boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'sustainable_claim') THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN sustainable_claim text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'certification_notes') THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN certification_notes text DEFAULT '';
  END IF;

  -- Association recognition layer
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'association_id') THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN association_id text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'association_name') THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN association_name text DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'association_member_status') THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN association_member_status text DEFAULT 'none';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'association_verified') THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN association_verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'association_badge_enabled') THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN association_badge_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'association_join_label') THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN association_join_label text DEFAULT '';
  END IF;
END $$;
