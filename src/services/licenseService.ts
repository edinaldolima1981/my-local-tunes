/**
 * @fileoverview Serviço de gerenciamento de licenças
 * 
 * Controla o período de trial e status de pagamento dos usuários.
 * Funciona com device_id único para identificar cada instalação.
 */

import { supabase } from '@/integrations/supabase/client';

export interface UserLicense {
  id: string;
  device_id: string;
  email: string | null;
  trial_started_at: string;
  trial_ends_at: string;
  is_paid: boolean;
  paid_at: string | null;
  payment_method: string | null;
  stripe_payment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LicenseStatus {
  isValid: boolean;
  isPaid: boolean;
  isTrialActive: boolean;
  trialDaysLeft: number;
  trialEndsAt: Date | null;
  deviceId: string;
  license: UserLicense | null;
}

// Gera um ID único para o dispositivo
const generateDeviceId = (): string => {
  // Tenta recuperar ID existente
  const existingId = localStorage.getItem('device_id');
  if (existingId) return existingId;

  // Gera novo ID baseado em timestamp + random
  const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
  localStorage.setItem('device_id', newId);
  return newId;
};

// Obtém o device_id atual
export const getDeviceId = (): string => {
  return generateDeviceId();
};

// Busca ou cria licença para o dispositivo
export const getOrCreateLicense = async (): Promise<UserLicense | null> => {
  const deviceId = getDeviceId();

  try {
    // Primeiro, tenta buscar licença existente
    const { data: existingLicense, error: fetchError } = await supabase
      .from('user_licenses')
      .select('*')
      .eq('device_id', deviceId)
      .maybeSingle();

    if (fetchError) {
      console.error('Erro ao buscar licença:', fetchError);
      return null;
    }

    if (existingLicense) {
      return existingLicense;
    }

    // Se não existe, cria nova licença com trial de 7 dias
    const { data: newLicense, error: insertError } = await supabase
      .from('user_licenses')
      .insert({
        device_id: deviceId,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao criar licença:', insertError);
      return null;
    }

    return newLicense;
  } catch (error) {
    console.error('Erro no serviço de licença:', error);
    return null;
  }
};

// Verifica o status completo da licença
export const checkLicenseStatus = async (): Promise<LicenseStatus> => {
  const deviceId = getDeviceId();
  const license = await getOrCreateLicense();

  if (!license) {
    // Se falhou ao obter licença (sem internet), permite uso offline
    // mas marca como inválido para mostrar aviso
    return {
      isValid: true, // Permite uso offline
      isPaid: false,
      isTrialActive: true,
      trialDaysLeft: 0,
      trialEndsAt: null,
      deviceId,
      license: null,
    };
  }

  const now = new Date();
  const trialEndsAt = new Date(license.trial_ends_at);
  const timeDiff = trialEndsAt.getTime() - now.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  const isTrialActive = daysLeft > 0;
  const isPaid = license.is_paid;
  const isValid = isPaid || isTrialActive;

  return {
    isValid,
    isPaid,
    isTrialActive: !isPaid && isTrialActive,
    trialDaysLeft: Math.max(0, daysLeft),
    trialEndsAt,
    deviceId,
    license,
  };
};

// Atualiza email do usuário (opcional, para contato)
export const updateLicenseEmail = async (email: string): Promise<boolean> => {
  const deviceId = getDeviceId();

  try {
    const { error } = await supabase
      .from('user_licenses')
      .update({ email })
      .eq('device_id', deviceId);

    return !error;
  } catch {
    return false;
  }
};

// Formata dias restantes para exibição
export const formatTrialDays = (days: number): string => {
  if (days <= 0) return 'Expirado';
  if (days === 1) return '1 dia restante';
  return `${days} dias restantes`;
};

// Valor da licença (para exibição)
export const LICENSE_PRICE = 7.99;
export const PIX_KEY = 'SEU_EMAIL_OU_CHAVE_PIX_AQUI'; // ⚠️ ALTERE PARA SUA CHAVE PIX
