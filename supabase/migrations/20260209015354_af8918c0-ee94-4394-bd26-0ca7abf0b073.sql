-- Corrigir política de INSERT para exigir user_id = auth.uid()
DROP POLICY IF EXISTS "Authenticated users can create license" ON public.user_licenses;

CREATE POLICY "Authenticated users can create own license"
ON public.user_licenses
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  user_id = auth.uid()
);