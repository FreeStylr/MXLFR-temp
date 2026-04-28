/*
  # Drop vinocap_* backward-compatibility views

  The previous rename migration created 6 views with old vinocap_* names
  pointing to the new wine_* tables, to allow a rolling code migration.

  All source code has been updated to reference wine_* directly.
  No function, RPC, policy, or application code depends on these views.
  They are now safe to drop.

  1. Views dropped
    - vinocap_winery_profiles
    - vinocap_reservations
    - vinocap_association_invites
    - vinocap_campaigns
    - vinocap_campaign_qrs
    - vinocap_scan_events
*/

DROP VIEW IF EXISTS vinocap_winery_profiles;
DROP VIEW IF EXISTS vinocap_reservations;
DROP VIEW IF EXISTS vinocap_association_invites;
DROP VIEW IF EXISTS vinocap_campaigns;
DROP VIEW IF EXISTS vinocap_campaign_qrs;
DROP VIEW IF EXISTS vinocap_scan_events;
