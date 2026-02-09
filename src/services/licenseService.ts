/**
 * @fileoverview Serviço de gerenciamento de licenças
 * 
 * Controla o período de trial e status de pagamento dos usuários.
 * Funciona com user_id (autenticado) ou device_id (fallback).
 */

import { supabase } from '@/integrations/supabase/client';

export interface UserLicense {
  id: string;
  device_id: string;
  user_id?: string | null;
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
  const existingId = localStorage.getItem('device_id');
  if (existingId) return existingId;

  const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
  localStorage.setItem('device_id', newId);
  return newId;
};

// Obtém o device_id atual
export const getDeviceId = (): string => {
  return generateDeviceId();
};

// Busca licença do usuário autenticado
export const getLicenseForUser = async (userId: string): Promise<UserLicense | null> => {
  try {
    const { data, error } = await supabase
      .from('user_licenses')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar licença do usuário:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar licença:', error);
    return null;
  }
};

// Verifica o status completo da licença (para usuário autenticado)
export const checkLicenseStatus = async (): Promise<LicenseStatus> => {
  const deviceId = getDeviceId();
  
  try {
    // Busca sessão atual do usuário
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Usuário autenticado - busca licença por user_id
      const license = await getLicenseForUser(session.user.id);
      
      if (license) {
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
      }
    }

    // Sem licença ou não autenticado - modo offline/trial
    return {
      isValid: true,
      isPaid: false,
      isTrialActive: true,
      trialDaysLeft: 0,
      trialEndsAt: null,
      deviceId,
      license: null,
    };
  } catch (error) {
    console.error('Erro ao verificar licença:', error);
    return {
      isValid: true,
      isPaid: false,
      isTrialActive: true,
      trialDaysLeft: 0,
      trialEndsAt: null,
      deviceId,
      license: null,
    };
  }
};

// Atualiza email do usuário
export const updateLicenseEmail = async (email: string): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) return false;

    const { error } = await supabase
      .from('user_licenses')
      .update({ email })
      .eq('user_id', session.user.id);

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
