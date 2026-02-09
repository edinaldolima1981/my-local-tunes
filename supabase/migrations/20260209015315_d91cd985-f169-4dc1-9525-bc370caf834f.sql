-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own license" ON public.user_licenses;
DROP POLICY IF EXISTS "Allow license creation" ON public.user_licenses;
DROP POLICY IF EXISTS "Users can update own license" ON public.user_licenses;

-- Política RESTRITIVA: Bloquear acesso não autenticado completamente
CREATE POLICY "Deny unauthenticated access"
ON public.user_licenses
AS RESTRICTIVE
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Política: Usuário autenticado pode ver apenas sua própria licença OU admin vê todas
CREATE POLICY "Users can view own license"
ON public.user_licenses
FOR SELECT
USING (
  user_id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin')
);

-- Política: Usuário autenticado pode criar licença vinculada a si mesmo
CREATE POLICY "Authenticated users can create license"
ON public.user_licenses
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND
  (user_id IS NULL OR user_id = auth.uid())
);

-- Política: Usuário pode atualizar apenas sua licença, admin pode atualizar qualquer uma
CREATE POLICY "Users can update own license"
ON public.user_licenses
FOR UPDATE
USING (
  user_id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  user_id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin')
);

-- Adicionar política restritiva na tabela user_roles
CREATE POLICY "Deny unauthenticated role access"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
USING (auth.uid() IS NOT NULL);