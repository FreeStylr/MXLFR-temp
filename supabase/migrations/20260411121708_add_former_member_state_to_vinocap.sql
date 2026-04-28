/*
  # Add Former Member State to vinocap_winery_profiles

  ## Summary
  Encodes the business rule: a winery that leaves an association must be able to remain
  on the platform as a normal winery, while the platform retains internal historical
  evidence of its former association relationship.

  This is a detachment / downgrade-from-member-to-normal-winery rule, not a deletion.

  ### New Column

  1. `association_left_at` (timestamptz, nullable)
     Records when a winery was detached from its association (i.e. left or was removed).
     NULL means no detachment has occurred.
     Non-NULL means the winery was formerly a member at some point.

  ### Clarified Value on association_member_status

  The existing `association_member_status` text column now formally supports a fourth value:
    - 'none'    — never had an association
    - 'pending' — submitted via invite, not yet validated
    - 'member'  — current active member
    - 'former'  — was a member, has since left/been detached

  No schema change is required to support 'former' — the column is already a free-form
  text field. This migration adds the `association_left_at` timestamp column only.

  ## Business Rules Encoded

  ### Public rule (already enforced by existing logic)
  Public display of association badges, listing grouping, and member recognition is
  already gated on `association_member_status = 'member'` AND `association_badge_enabled = true`.
  Setting `association_member_status = 'former'` and `association_badge_enabled = false`
  immediately removes all public association visibility without touching any other profile data.

  ### Internal history rule
  When a winery is detached from an association, the following fields are preserved:
    - `association_id`        — which association they belonged to
    - `association_name`      — name of that association
    - `association_join_label` — the label used during membership
    - `association_entry_path` — how they originally entered ('invite', 'direct', etc.)
    - `association_invited_at` — when the invite was used
    - `association_left_at`   — when they were detached (new)

  These fields form a complete internal history of the winery's association lifecycle.

  ## Future Admin Detach Action

  A future admin action "remove from association" should:
    1. SET   association_member_status  = 'former'
    2. SET   association_badge_enabled  = false
    3. SET   association_left_at        = NOW()
    4. LEAVE all other association_* fields intact (historical retention)
    5. LEAVE is_published unchanged (winery stays on platform as normal winery)

  This migration prepares that workflow without building the admin UI yet.

  ## Security
  No RLS changes required. Existing policies cover new columns automatically.

  ## Notes
  - Existing members and seeded profiles are unaffected (no data changes)
  - All existing logic relying on association_member_status = 'member' remains correct
  - Adding 'former' is additive — no breaking changes to existing checks
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vinocap_winery_profiles' AND column_name = 'association_left_at'
  ) THEN
    ALTER TABLE vinocap_winery_profiles ADD COLUMN association_left_at timestamptz;
  END IF;
END $$;
