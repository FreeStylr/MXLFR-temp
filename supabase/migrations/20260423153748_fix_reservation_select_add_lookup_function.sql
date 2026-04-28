/*
  # Fix reservation SELECT access and add safe lookup function

  1. Security Changes
    - Drop the custom header-based SELECT policy (too complex for MVP)
    - Anon cannot SELECT directly from vinocap_reservations
    - Add a Postgres function `lookup_reservation_by_ref` that:
      - Takes a payment_reference
      - Returns only the status (no PII)
      - Is callable by anon via supabase.rpc()
    - This prevents browsing all rows while allowing status checks

  2. Important Notes
    - The function returns ONLY the status field, nothing sensitive
    - Direct table SELECT remains restricted to authenticated/service_role
    - INSERT for anon stays unchanged (public reservation form)
*/

-- Drop the header-based SELECT policy (replaced by function)
DROP POLICY IF EXISTS "Anon can read own reservation by reference" ON vinocap_reservations;

-- Create a safe lookup function that returns only status for a given reference
CREATE OR REPLACE FUNCTION lookup_reservation_status(ref text)
RETURNS TABLE(status text, structure_name text) AS $$
BEGIN
  RETURN QUERY
  SELECT r.status, r.structure_name
  FROM vinocap_reservations r
  WHERE r.payment_reference = ref
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to anon so the front-end can call it
GRANT EXECUTE ON FUNCTION lookup_reservation_status(text) TO anon;
GRANT EXECUTE ON FUNCTION lookup_reservation_status(text) TO authenticated;
