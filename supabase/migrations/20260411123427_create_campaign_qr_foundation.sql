/*
  # Create Campaign / QR Foundation

  ## Summary
  Introduces the foundational campaign and QR architecture for Vinocap.

  The locked product logic is: scan → campaign resolver → (future: video/AI welcome → smart
  questions → relevant cards). This migration builds the data layer that makes that flow
  structurally possible.

  Three new tables are created:

  ---

  ## 1. vinocap_campaigns

  The campaign is the primary object. A QR code belongs to a campaign, not to a winery card.
  A campaign is time-bound (start_at / end_at) and zone-bound.

  ### Columns
  - `id`             — primary key
  - `name`           — human display name (e.g. "Vinocap 2026")
  - `slug`           — URL-safe unique identifier used in admin/internal references
  - `campaign_type`  — type of campaign ('event', 'institutional', 'sponsor', 'permanent')
  - `context_label`  — the event or front-of-bag label visible to the user (e.g. "Vinocap 2026")
  - `zone`           — geographic or logical zone context (e.g. "Hérault littoral")
  - `start_at`       — when the campaign goes live
  - `end_at`         — when the campaign expires (NULL = no expiry)
  - `status`         — 'draft' | 'scheduled' | 'active' | 'paused' | 'ended' | 'archived'
  - `owner_type`     — who runs the campaign ('vinocap', 'association', 'sponsor', 'institution')
  - `owner_name`     — human label for the owner
  - `experience_key` — future hook for AI/video host configuration (nullable)
  - `is_public`      — whether the campaign should be publicly discoverable
  - `created_at`

  ### Status lifecycle
  draft → scheduled → active → ended → archived
  active may also be paused and resumed

  ---

  ## 2. vinocap_campaign_qrs

  A QR is a physical/digital artifact tied to a single campaign.
  The QR slug is what gets printed/encoded in the physical QR code.
  When a visitor scans, the qr_slug resolves → campaign → experience.

  ### Columns
  - `id`           — primary key
  - `campaign_id`  — foreign key to vinocap_campaigns
  - `qr_slug`      — unique URL-safe token encoded in the QR (e.g. "v26-main")
  - `label`        — human label for admin reference (e.g. "Stand entrée principale")
  - `is_active`    — whether this specific QR is currently enabled
  - `created_at`

  ---

  ## 3. vinocap_scan_events

  Every QR scan creates a structured log entry suitable for future analytics.
  Captures the campaign context, QR identity, timing, and the resolver outcome.

  ### Columns
  - `id`           — primary key
  - `campaign_id`  — which campaign was resolved (nullable: if QR was invalid)
  - `qr_id`        — which QR was scanned (nullable: if QR was invalid)
  - `qr_slug`      — the raw slug that was scanned (always captured for audit)
  - `scanned_at`   — exact timestamp
  - `entry_path`   — the URL path that triggered the scan (e.g. '/vinocap/q/v26-main')
  - `scan_result`  — resolver outcome: 'active' | 'ended' | 'not_yet_live' | 'paused' | 'invalid' | 'archived'
  - `user_agent`   — browser user-agent string (nullable)
  - `session_key`  — optional frontend-generated session/device key (nullable)
  - `created_at`   — same as scanned_at by default

  ---

  ## Security

  ### vinocap_campaigns
  - RLS enabled
  - Public (anon) can SELECT active/public campaigns (for resolver)
  - No public INSERT or UPDATE

  ### vinocap_campaign_qrs
  - RLS enabled
  - Public (anon) can SELECT active QR records (for resolver)
  - No public INSERT or UPDATE

  ### vinocap_scan_events
  - RLS enabled
  - Public (anon) can INSERT scan events (scanning is public/unauthenticated)
  - No public SELECT (analytics are internal)
  - Authenticated users can SELECT for analytics

  ---

  ## Notes
  - All three tables use conservative defaults
  - The vinocap_scan_events table is append-only from the public side
  - The experience_key field on campaigns is a future hook for the AI/video host config
  - The qr_slug on scan_events is always captured even if the QR is invalid (for audit)
*/

CREATE TABLE IF NOT EXISTS vinocap_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),

  name text NOT NULL DEFAULT '',
  slug text UNIQUE NOT NULL DEFAULT '',
  campaign_type text NOT NULL DEFAULT 'event',
  context_label text NOT NULL DEFAULT '',
  zone text NOT NULL DEFAULT '',

  start_at timestamptz,
  end_at timestamptz,
  status text NOT NULL DEFAULT 'draft',

  owner_type text NOT NULL DEFAULT 'vinocap',
  owner_name text NOT NULL DEFAULT '',
  experience_key text,
  is_public boolean NOT NULL DEFAULT true
);

ALTER TABLE vinocap_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active public campaigns"
  ON vinocap_campaigns
  FOR SELECT
  TO anon
  USING (is_public = true AND status IN ('active', 'scheduled', 'paused', 'ended'));

CREATE POLICY "Authenticated can manage campaigns"
  ON vinocap_campaigns
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert campaigns"
  ON vinocap_campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update campaigns"
  ON vinocap_campaigns
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

---

CREATE TABLE IF NOT EXISTS vinocap_campaign_qrs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),

  campaign_id uuid NOT NULL REFERENCES vinocap_campaigns(id) ON DELETE CASCADE,
  qr_slug text UNIQUE NOT NULL DEFAULT '',
  label text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true
);

ALTER TABLE vinocap_campaign_qrs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active QRs"
  ON vinocap_campaign_qrs
  FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated can manage campaign QRs"
  ON vinocap_campaign_qrs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert campaign QRs"
  ON vinocap_campaign_qrs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update campaign QRs"
  ON vinocap_campaign_qrs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

---

CREATE TABLE IF NOT EXISTS vinocap_scan_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),

  campaign_id uuid REFERENCES vinocap_campaigns(id) ON DELETE SET NULL,
  qr_id uuid REFERENCES vinocap_campaign_qrs(id) ON DELETE SET NULL,
  qr_slug text NOT NULL DEFAULT '',
  scanned_at timestamptz NOT NULL DEFAULT now(),
  entry_path text NOT NULL DEFAULT '',
  scan_result text NOT NULL DEFAULT 'invalid',
  user_agent text,
  session_key text
);

ALTER TABLE vinocap_scan_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can log scan events"
  ON vinocap_scan_events
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated can view scan events"
  ON vinocap_scan_events
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_scan_events_campaign_id ON vinocap_scan_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_scan_events_scanned_at ON vinocap_scan_events(scanned_at);
CREATE INDEX IF NOT EXISTS idx_campaign_qrs_qr_slug ON vinocap_campaign_qrs(qr_slug);
