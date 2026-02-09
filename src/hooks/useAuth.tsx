/**
 * @fileoverview Hook para gerenciar autenticação
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { getDeviceId } from '@/services/licenseService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithApple: () => Promise<{ error: Error | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Atualiza licença com user_id quando faz login
  const linkLicenseToUser = useCallback(async (userId: string, email: string | undefined) => {
    const deviceId = getDeviceId();
    try {
      const { data: existingLicense } = await supabase
        .from('user_licenses')
        .select('id, user_id')
        .eq('device_id', deviceId)
        .maybeSingle();

      if (existingLicense) {
        await supabase
          .from('user_licenses')
          .update({ 
            user_id: userId,
            email: email || null,
            trial_started_at: new Date().toISOString(),
            trial_ends_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          })
          .eq('id', existingLicense.id);
      } else {
        await supabase
          .from('user_licenses')
          .insert({ 
            device_id: deviceId,
            user_id: userId,
            email: email || null
          });
      }
    } catch (error) {
      console.error('Erro ao vincular licença ao usuário:', error);
    }
  }, []);


  useEffect(() => {
    let isMounted = true;

    // Listener para mudanças CONTÍNUAS de auth (NÃO controla isLoading)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!isMounted) return;
        console.debug('[auth] event:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Quando usuário faz login, vincula à licença e inicia trial
        if (event === 'SIGNED_IN' && currentSession?.user) {
          setTimeout(() => {
            linkLicenseToUser(currentSession.user.id, currentSession.user.email)
              .catch(err => console.error('Erro ao vincular licença:', err));
          }, 0);
        }
      }
    );

    // Carga INICIAL (controla isLoading)
    const initializeAuth = async () => {
      try {
        const { data: sessionData, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[auth] erro ao obter sessão:', error);
        }
        if (!isMounted) return;
        setSession(sessionData.session);
        setUser(sessionData.session?.user ?? null);
      } catch (error) {
        console.error('[auth] erro ao inicializar auth:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Failsafe: nunca ficar preso em loading
    const loadingTimeout = window.setTimeout(() => {
      if (isMounted) setIsLoading(false);
    }, 5000);

    initializeAuth().then(() => window.clearTimeout(loadingTimeout));

    return () => {
      isMounted = false;
      window.clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, [linkLicenseToUser]);

  const signInWithGoogle = useCallback(async () => {
    const { lovable } = await import('@/integrations/lovable/index');
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    return { error: result.error || null };
  }, []);

  const signInWithApple = useCallback(async () => {
    const { lovable } = await import('@/integrations/lovable/index');
    const result = await lovable.auth.signInWithOAuth('apple', {
      redirect_uri: window.location.origin,
    });
    return { error: result.error || null };
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: window.location.origin
      }
    });
    return { error: error as Error | null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      signInWithGoogle, 
      signInWithApple,
      signInWithEmail,
      signUpWithEmail,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
