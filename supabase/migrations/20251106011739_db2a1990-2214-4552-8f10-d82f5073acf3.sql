-- Drop the problematic policy that only allows admins to see roles
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;

-- Create a new policy that allows users to see their own role
CREATE POLICY "Users can view their own role"
ON user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Additionally, allow admins to see all roles (but this won't create a deadlock anymore)
CREATE POLICY "Admins can view all roles"
ON user_roles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);