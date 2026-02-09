/**
 * @fileoverview Hook para gerenciar autenticação
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';


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


  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    // Failsafe: nunca ficar preso em loading indefinidamente
    const loadingTimeout = window.setTimeout(() => {
      if (!isMounted) return;
      console.warn('[auth] timeout ao inicializar sessão; continuando sem sessão');
      setIsLoading(false);
    }, 5000);

    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      try {
        // Listener de mudanças de sessão
        const { data } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          if (!isMounted) return;

          console.debug('[auth] event:', event);
          setSession(currentSession);
          setUser(currentSession?.user ?? null);


          if (!isMounted) return;
          window.clearTimeout(loadingTimeout);
          setIsLoading(false);
        });

        subscription = data.subscription;

        // Busca sessão existente (não depende de rede na maioria dos casos)
        const { data: sessionData, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[auth] erro ao obter sessão:', error);
        }

        if (!isMounted) return;
        setSession(sessionData.session);
        setUser(sessionData.session?.user ?? null);
        window.clearTimeout(loadingTimeout);
        setIsLoading(false);
      } catch (error) {
        console.error('[auth] erro ao inicializar auth:', error);
        if (!isMounted) return;
        window.clearTimeout(loadingTimeout);
        setIsLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
      window.clearTimeout(loadingTimeout);
      subscription?.unsubscribe();
    };
  }, []);

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
