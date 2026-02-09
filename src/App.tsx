import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MusicLibraryProvider } from "@/hooks/useMusicLibrary";
import { PlaylistProvider } from "@/hooks/usePlaylists";
import { FavoritesProvider } from "@/hooks/useFavorites";
import { LicenseProvider, useLicense } from "@/hooks/useLicense";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SplashScreen } from "@/components/welcome/SplashScreen";
import { Onboarding } from "@/components/welcome/Onboarding";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { PaymentScreen } from "@/components/license/PaymentScreen";

import { Loader2 } from "lucide-react";
import Index from "./pages/Index";
import Privacy from "./pages/Privacy";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Loading spinner component
const LoadingScreen = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);
// LicenseGate - bloqueia acesso quando trial expira e não pagou
const LicenseGate = ({ children }: { children: React.ReactNode }) => {
  const { status, isLoading: licenseLoading } = useLicense();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Verifica se é admin (bypass total)
  useEffect(() => {
    let cancelled = false;
    const checkAdmin = async () => {
      try {
        if (!user) {
          if (!cancelled) { setIsAdmin(false); setAdminChecked(true); }
          return;
        }
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        if (!cancelled) setIsAdmin(!!data);
      } catch (err) {
        console.error('[LicenseGate] Erro ao verificar admin:', err);
        if (!cancelled) { setIsAdmin(false); setHasError(true); }
      } finally {
        if (!cancelled) setAdminChecked(true);
      }
    };

    // Timeout de 2s para não travar (especialmente no iOS)
    const timeout = setTimeout(() => {
      if (!cancelled && !adminChecked) {
        console.warn('[LicenseGate] Admin check timeout - liberando acesso');
        setAdminChecked(true);
        setHasError(true);
      }
    }, 2000);

    checkAdmin();
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [user]);

  // Enquanto carrega, mostra loading (max 2s pelo timeout)
  if (licenseLoading || !adminChecked) {
    return <LoadingScreen />;
  }

  // Se houve erro na verificação, libera acesso (fail-open)
  if (hasError) {
    return <>{children}</>;
  }

  // Admin tem acesso total
  if (isAdmin) {
    return <>{children}</>;
  }

  // Se licença válida (trial ativo ou pago), libera
  if (!status || status.isValid) {
    return <>{children}</>;
  }

  // Trial expirado e não pagou - bloqueia
  return <PaymentScreen />;
};


// Gate de autenticação - exige login antes de acessar o app
const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <>{children}</>;
};

// Conteúdo interno que gerencia splash/onboarding/auth
const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem('hasSeenOnboarding') !== 'true';
  });
  const [appReady, setAppReady] = useState(false);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  // Quando splash e onboarding terminam, marca como pronto com um pequeno delay
  // para garantir que o DOM renderize corretamente (fix Chrome tela preta)
  useEffect(() => {
    if (!showSplash && !showOnboarding) {
      // Força um reflow antes de renderizar o app principal
      const timer = requestAnimationFrame(() => {
        setAppReady(true);
      });
      return () => cancelAnimationFrame(timer);
    }
  }, [showSplash, showOnboarding]);

  // Splash screen
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Onboarding
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Aguarda o app estar pronto (evita flash de tela preta no Chrome)
  if (!appReady) {
    return <LoadingScreen />;
  }

  // App principal - acesso livre (sem autenticação durante testes)
  return (
    <MusicLibraryProvider>
      <PlaylistProvider>
        <FavoritesProvider>
          <Index />
        </FavoritesProvider>
      </PlaylistProvider>
    </MusicLibraryProvider>
  );
};

// Componente principal do app - providers estáveis
const MainApp = () => {
  return (
    <AuthProvider>
      <LicenseProvider>
        <AppContent />
      </LicenseProvider>
    </AuthProvider>
  );
};

const App = () => {
  // Captura erros assíncronos não tratados (previne tela preta no iOS)
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('[App] Unhandled rejection:', event.reason);
      event.preventDefault();
    };
    window.addEventListener('unhandledrejection', handleRejection);
    return () => window.removeEventListener('unhandledrejection', handleRejection);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Admin route - acesso direto, sem splash/onboarding/licença */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/privacy" element={<Privacy />} />
            
            {/* Rota principal com splash, onboarding, auth e verificação de licença */}
            <Route path="/" element={<MainApp />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
