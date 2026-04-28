/*
  # Tighten reservation INSERT policy

  1. Security Changes
    - Replace the open INSERT policy with one that constrains allowed initial statuses
    - Only allows: awaiting_card_payment, awaiting_wire, coop_lead
    - Prevents browser from inserting rows with 'paid' or other privileged statuses

  2. Important Notes
    - This prevents a malicious actor from inserting a pre-paid reservation
    - The form only creates rows with the three allowed statuses
*/

DROP POLICY IF EXISTS "Anyone can insert a reservation" ON vinocap_reservations;

CREATE POLICY "Public can create pending reservations"
  ON vinocap_reservations
  FOR INSERT
  TO anon
  WITH CHECK (
    status IN ('awaiting_card_payment', 'awaiting_wire', 'coop_lead')
  );
