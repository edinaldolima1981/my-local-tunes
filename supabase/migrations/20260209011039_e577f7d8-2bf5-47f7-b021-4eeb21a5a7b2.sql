-- Tabela de licenças/assinaturas dos usuários
CREATE TABLE public.user_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL UNIQUE,
  email TEXT,
  trial_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  trial_ends_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  stripe_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para consultas frequentes
CREATE INDEX idx_user_licenses_device_id ON public.user_licenses(device_id);
CREATE INDEX idx_user_licenses_trial_ends_at ON public.user_licenses(trial_ends_at);
CREATE INDEX idx_user_licenses_is_paid ON public.user_licenses(is_paid);

-- RLS - Permitir leitura/escrita pública (app local sem auth)
ALTER TABLE public.user_licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.user_licenses
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON public.user_licenses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON public.user_licenses
  FOR UPDATE USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_licenses_updated_at
  BEFORE UPDATE ON public.user_licenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();