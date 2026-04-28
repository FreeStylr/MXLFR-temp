/*
  # Create submit_paid_fiche secure function

  1. Purpose
    - Provides a server-validated save path for /vin/finaliser
    - Replaces the direct anon INSERT from the front-end for this flow only
    - Verifies the payment_reference points to a truly paid reservation
      before creating a vinocap_winery_profiles row
    - Prevents duplicate fiche creation for the same payment_reference

  2. Validation steps (all server-side, browser cannot bypass)
    - ref must not be null/empty
    - reservation must exist in vinocap_reservations with that payment_reference
    - reservation status must be: paid, code_assigned, awaiting_final_onboarding, completed
    - no existing vinocap_winery_profiles row with that payment_reference

  3. Returns
    - 'ok' on success
    - 'invalid_ref' if ref is empty or reservation not found
    - 'unpaid' if reservation exists but is not in a paid status
    - 'already_submitted' if a fiche already exists for this ref

  4. Security
    - SECURITY DEFINER: runs with elevated privileges, bypasses RLS
    - Callable by anon (needed for the public finaliser page)
    - The caller cannot forge the outcome because all checks are server-side
*/

CREATE OR REPLACE FUNCTION submit_paid_fiche(
  p_ref             text,
  p_domaine_name    text,
  p_contact_name    text,
  p_phone           text,
  p_whatsapp        boolean,
  p_website         text,
  p_where_to_buy    text,
  p_map_link        text,
  p_short_presentation text,
  p_style_cues      text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_status text;
  v_existing_id uuid;
BEGIN
  -- Reject empty ref
  IF p_ref IS NULL OR trim(p_ref) = '' THEN
    RETURN 'invalid_ref';
  END IF;

  -- Look up reservation status
  SELECT status INTO v_status
  FROM vinocap_reservations
  WHERE payment_reference = trim(p_ref)
  LIMIT 1;

  -- Reservation not found
  IF NOT FOUND THEN
    RETURN 'invalid_ref';
  END IF;

  -- Reservation exists but is not paid
  IF v_status NOT IN ('paid', 'code_assigned', 'awaiting_final_onboarding', 'completed') THEN
    RETURN 'unpaid';
  END IF;

  -- Duplicate check: fiche already submitted for this ref
  SELECT id INTO v_existing_id
  FROM vinocap_winery_profiles
  WHERE payment_reference = trim(p_ref)
  LIMIT 1;

  IF FOUND THEN
    RETURN 'already_submitted';
  END IF;

  -- All checks passed — insert the fiche
  INSERT INTO vinocap_winery_profiles (
    domaine_name,
    contact_name,
    phone,
    whatsapp,
    website,
    where_to_buy,
    map_link,
    short_presentation,
    style_cues,
    payment_reference,
    submission_status,
    submitted_at,
    consent_publication,
    consent_content_use,
    is_published
  ) VALUES (
    trim(p_domaine_name),
    trim(p_contact_name),
    trim(p_phone),
    p_whatsapp,
    trim(p_website),
    trim(p_where_to_buy),
    trim(p_map_link),
    trim(p_short_presentation),
    trim(p_style_cues),
    trim(p_ref),
    'submitted',
    now(),
    true,
    true,
    false
  );

  RETURN 'ok';
END;
$$;

-- Allow the anon role to call this function (needed for the public finaliser page)
GRANT EXECUTE ON FUNCTION submit_paid_fiche(
  text, text, text, text, boolean, text, text, text, text, text
) TO anon;

GRANT EXECUTE ON FUNCTION submit_paid_fiche(
  text, text, text, text, boolean, text, text, text, text, text
) TO authenticated;
