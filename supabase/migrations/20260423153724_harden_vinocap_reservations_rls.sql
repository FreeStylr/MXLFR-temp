/*
  # Harden vinocap_reservations RLS policies

  1. Security Changes
    - DROP the overly permissive SELECT and UPDATE policies that use USING(true)
    - INSERT policy stays: anonymous users need to create reservations (public form)
    - New SELECT policy: only allow reading own reservation by matching payment_reference
    - New UPDATE policy: restricted to service_role only (no anon updates)
    - Anonymous users can no longer browse/update all reservations

  2. Important Notes
    - The INSERT policy (anyone can insert) is intentional for the public reservation form
    - SELECT is restricted: anon can only read a row if they provide the exact payment_reference
    - UPDATE via anon key is fully blocked; only service_role (edge functions, admin) can update
    - This prevents browser-side status manipulation while keeping the form functional
*/

-- Drop the dangerously open SELECT policy
DROP POLICY IF EXISTS "Service role can select reservations" ON vinocap_reservations;

-- Drop the dangerously open UPDATE policy
DROP POLICY IF EXISTS "Service role can update reservations" ON vinocap_reservations;

-- New SELECT: anon can read a single reservation only by exact payment_reference match
-- This supports the proforma page and payment status lookup without exposing all rows
CREATE POLICY "Anon can read own reservation by reference"
  ON vinocap_reservations
  FOR SELECT
  TO anon
  USING (
    payment_reference IS NOT NULL
    AND payment_reference = current_setting('request.headers', true)::json->>'x-reservation-ref'
  );

-- Authenticated users (service role) can read all reservations (for admin/ops)
CREATE POLICY "Authenticated users can read reservations"
  ON vinocap_reservations
  FOR SELECT
  TO authenticated
  USING (true);

-- Only service_role can update reservations (payment status, allocated_code, etc.)
-- This is enforced by not creating any anon/authenticated UPDATE policy
-- Service role bypasses RLS by default
