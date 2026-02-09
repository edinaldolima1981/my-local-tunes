
-- Drop all existing restrictive policies on user_licenses
DROP POLICY IF EXISTS "Authenticated users can create own license" ON public.user_licenses;
DROP POLICY IF EXISTS "Deny unauthenticated access" ON public.user_licenses;
DROP POLICY IF EXISTS "Only admins can delete licenses" ON public.user_licenses;
DROP POLICY IF EXISTS "Only admins can update licenses" ON public.user_licenses;
DROP POLICY IF EXISTS "Users can view own license" ON public.user_licenses;

-- Recreate as PERMISSIVE policies (the default, which actually allows access)
CREATE POLICY "Users can view own license"
  ON public.user_licenses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create own license"
  ON public.user_licenses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Admins can update licenses"
  ON public.user_licenses FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete licenses"
  ON public.user_licenses FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
