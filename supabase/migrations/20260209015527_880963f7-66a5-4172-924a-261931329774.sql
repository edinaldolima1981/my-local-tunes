-- Remover política de update permissiva
DROP POLICY IF EXISTS "Users can update own license" ON public.user_licenses;

-- Apenas admins podem atualizar licenças (inclui marcar como pago)
CREATE POLICY "Only admins can update licenses"
ON public.user_licenses
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));