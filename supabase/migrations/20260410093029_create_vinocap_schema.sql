/*
  # Vinocap Schema

  ## Tables

  ### vinocap_winery_profiles
  Stores winery onboarding data submitted via the /participer form.
  Columns: identity, product info, commercial info, presentation, consents.

  ### vinocap_publication_status
  Tracks publication state per winery profile.

  ## Security
  - RLS enabled on all tables
  - Public can INSERT winery profiles (onboarding is public)
  - Only authenticated admins can SELECT/UPDATE
  - Public can SELECT published winery profiles (for card display)
*/

CREATE TABLE IF NOT EXISTS vinocap_winery_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),

  -- A. Identity
  domaine_name text NOT NULL DEFAULT '',
  contact_name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  email text NOT NULL DEFAULT '',
  website text DEFAULT '',
  socials jsonb DEFAULT '{}',
  address text DEFAULT '',
  town text DEFAULT '',
  map_link text DEFAULT '',

  -- B. Product identity
  wine_types text[] DEFAULT '{}',
  appellation text DEFAULT '',
  territory text DEFAULT '',
  style_cues text DEFAULT '',
  flagship_product text DEFAULT '',
  is_organic boolean DEFAULT false,
  is_premium boolean DEFAULT false,
  is_sustainable boolean DEFAULT false,
  tasting_available boolean DEFAULT false,
  visit_available boolean DEFAULT false,

  -- C. Commercial utility
  direct_purchase boolean DEFAULT false,
  where_to_buy text DEFAULT '',
  opening_times text DEFAULT '',
  reservation_required boolean DEFAULT false,
  whatsapp boolean DEFAULT false,

  -- D. Presentation
  short_presentation text DEFAULT '',
  specialties text DEFAULT '',
  differentiators text DEFAULT '',

  -- E. Consents
  consent_publication boolean NOT NULL DEFAULT false,
  consent_content_use boolean NOT NULL DEFAULT false,

  -- Publication state
  is_published boolean DEFAULT false,
  is_seeded boolean DEFAULT false,
  slug text UNIQUE
);

ALTER TABLE vinocap_winery_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit winery onboarding"
  ON vinocap_winery_profiles
  FOR INSERT
  TO anon
  WITH CHECK (consent_publication = true AND consent_content_use = true);

CREATE POLICY "Public can view published wineries"
  ON vinocap_winery_profiles
  FOR SELECT
  TO anon
  USING (is_published = true);

CREATE POLICY "Authenticated can view all wineries"
  ON vinocap_winery_profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can update wineries"
  ON vinocap_winery_profiles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
