/*
  # Fix service requests RLS policies
  
  1. Changes
    - Remove invalid role() function calls
    - Use proper auth.uid() checks
    - Simplify policy conditions
    - Enable RLS on service_requests table
  
  2. Security
    - Allow public inserts for service requests
    - Give admins full access
    - Let users view their own requests
*/

-- Enable RLS
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable insert for public users" ON service_requests;
DROP POLICY IF EXISTS "Allow admin full access to service requests" ON service_requests;
DROP POLICY IF EXISTS "Allow users to view their own requests" ON service_requests;

-- Allow anyone to submit new service requests
CREATE POLICY "Enable insert for public users"
ON service_requests
FOR INSERT
TO public
WITH CHECK (true);

-- Allow admins full access to all service requests
CREATE POLICY "Allow admin full access to service requests"
ON service_requests
FOR ALL
TO public
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow users to view their own requests
CREATE POLICY "Allow users to view their own requests"
ON service_requests
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.phone_number = service_requests.phone
  )
);