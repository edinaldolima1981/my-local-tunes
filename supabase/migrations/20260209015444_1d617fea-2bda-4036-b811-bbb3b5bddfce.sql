-- Adicionar política de UPDATE para user_roles (apenas admins)
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Adicionar política de DELETE para user_licenses (apenas admins)
CREATE POLICY "Only admins can delete licenses"
ON public.user_licenses
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));