-- Remover políticas antigas permissivas
DROP POLICY IF EXISTS "Allow public insert access" ON public.user_licenses;
DROP POLICY IF EXISTS "Allow public read access" ON public.user_licenses;
DROP POLICY IF EXISTS "Allow public update access" ON public.user_licenses;

-- Adicionar coluna user_id para vincular licença ao usuário autenticado
ALTER TABLE public.user_licenses ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_user_licenses_user_id ON public.user_licenses(user_id);

-- Política: Usuário pode ver apenas sua própria licença (por device_id ou user_id)
CREATE POLICY "Users can view own license"
ON public.user_licenses
FOR SELECT
USING (
  user_id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin')
);

-- Política: Permitir inserção de licença apenas para dispositivos não autenticados (primeiro acesso)
-- ou pelo próprio usuário
CREATE POLICY "Allow license creation"
ON public.user_licenses
FOR INSERT
WITH CHECK (
  auth.uid() IS NULL OR 
  user_id IS NULL OR 
  user_id = auth.uid()
);

-- Política: Usuário pode atualizar apenas sua própria licença, ou admin pode atualizar qualquer uma
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