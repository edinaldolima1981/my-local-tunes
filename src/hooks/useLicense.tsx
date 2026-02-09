/**
 * @fileoverview Hook para gerenciar estado de licença
 * 
 * Provê contexto global do status da licença para toda a aplicação.
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  LicenseStatus, 
  checkLicenseStatus, 
  getDeviceId,
  updateLicenseEmail 
} from '@/services/licenseService';

interface LicenseContextType {
  status: LicenseStatus | null;
  isLoading: boolean;
  error: string | null;
  refreshStatus: () => Promise<void>;
  updateEmail: (email: string) => Promise<boolean>;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

interface LicenseProviderProps {
  children: ReactNode;
}

export const LicenseProvider = ({ children }: LicenseProviderProps) => {
  const [status, setStatus] = useState<LicenseStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const licenseStatus = await checkLicenseStatus();
      setStatus(licenseStatus);
    } catch (err) {
      console.error('Erro ao verificar licença:', err);
      setError('Não foi possível verificar a licença');
      // Em caso de erro, permite uso (modo offline)
      setStatus({
        isValid: true,
        isPaid: false,
        isTrialActive: true,
        trialDaysLeft: 0,
        trialEndsAt: null,
        deviceId: getDeviceId(),
        license: null,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateEmail = useCallback(async (email: string): Promise<boolean> => {
    const success = await updateLicenseEmail(email);
    if (success) {
      await refreshStatus();
    }
    return success;
  }, [refreshStatus]);

  useEffect(() => {
    refreshStatus();

    // Verifica novamente a cada 1 hora
    const interval = setInterval(refreshStatus, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  return (
    <LicenseContext.Provider value={{ status, isLoading, error, refreshStatus, updateEmail }}>
      {children}
    </LicenseContext.Provider>
  );
};

export const useLicense = (): LicenseContextType => {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense deve ser usado dentro de LicenseProvider');
  }
  return context;
};
