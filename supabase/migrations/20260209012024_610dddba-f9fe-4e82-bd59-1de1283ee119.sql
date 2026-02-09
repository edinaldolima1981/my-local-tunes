-- Alterar período de trial padrão de 7 dias para 24 horas
ALTER TABLE public.user_licenses 
ALTER COLUMN trial_ends_at SET DEFAULT (now() + interval '24 hours');