/*
  # Create Association Invites Table

  ## Summary
  Supports the association-initiated membership flow.

  When the Route des Vignerons et des Pêcheurs (or any future association)
  wants to invite their members to join Vinocap, they receive a master invite link.
  That link generates individual tokenized invite URLs that can be sent to each member.

  Each invite token pre-fills the association fields on the onboarding form
  so the member is automatically tagged as an association member on submission.

  ### New Table: vinocap_association_invites

  Columns:
  - `id` — primary key
  - `token` — unique URL-safe token sent in the invite link
  - `association_id` — slug of the association (e.g. 'route-des-vignerons-et-des-pecheurs')
  - `association_name` — full name (pre-fills onboarding form)
  - `association_join_label` — display label for the badge
  - `invited_email` — optional: pre-fill the email field for named invites
  - `invited_name` — optional: pre-fill contact name for named invites
  - `status` — 'pending' | 'used' | 'expired'
  - `used_at` — timestamp when the invite was consumed
  - `winery_profile_id` — FK to the created winery profile once used
  - `created_by` — who created the invite (admin label, not a FK for now)
  - `expires_at` — optional expiry
  - `created_at`

  ## Security
  - RLS enabled
  - Public (anon) can SELECT a single token to validate it (needed for invite page)
  - Public (anon) can UPDATE status/used_at when consuming (invite claim)
  - No public INSERT (invites are created by admin/association only)
  - Authenticated users can manage all
*/

CREATE TABLE IF NOT EXISTS vinocap_association_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),

  token text UNIQUE NOT NULL,
  association_id text NOT NULL DEFAULT '',
  association_name text NOT NULL DEFAULT '',
  association_join_label text NOT NULL DEFAULT '',

  invited_email text DEFAULT '',
  invited_name text DEFAULT '',

  status text DEFAULT 'pending',
  used_at timestamptz,
  winery_profile_id uuid REFERENCES vinocap_winery_profiles(id) ON DELETE SET NULL,

  created_by text DEFAULT '',
  expires_at timestamptz
);

ALTER TABLE vinocap_association_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read invite by token"
  ON vinocap_association_invites
  FOR SELECT
  TO anon
  USING (status = 'pending');

CREATE POLICY "Public can claim pending invite"
  ON vinocap_association_invites
  FOR UPDATE
  TO anon
  USING (status = 'pending')
  WITH CHECK (status = 'used');

CREATE POLICY "Authenticated can manage invites"
  ON vinocap_association_invites
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert invites"
  ON vinocap_association_invites
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update invites"
  ON vinocap_association_invites
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

/*
  Seed one invite token for the Route des Vignerons et des Pêcheurs
  so the association page can demonstrate the flow immediately.
  Token is deterministic for demo use: 'route-invite-2026-demo'
*/
INSERT INTO vinocap_association_invites (
  token,
  association_id,
  association_name,
  association_join_label,
  invited_email,
  invited_name,
  status,
  created_by,
  expires_at
) VALUES (
  'route-invite-2026-demo',
  'route-des-vignerons-et-des-pecheurs',
  'Route des Vignerons et des Pêcheurs',
  'Membre de la Route des Vignerons et des Pêcheurs',
  '',
  '',
  'pending',
  'Vinocap admin',
  '2027-12-31 23:59:59+00'
) ON CONFLICT (token) DO NOTHING;
