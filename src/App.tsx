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

  // Verifica se é admin (bypass total)
  useEffect(() => {
    let cancelled = false;
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setAdminChecked(true);
        return;
      }
      try {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
        if (!cancelled) setIsAdmin(!!data);
      } catch {
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setAdminChecked(true);
      }
    };

    // Timeout de 3s para não travar
    const timeout = setTimeout(() => {
      if (!cancelled) {
        setAdminChecked(true);
      }
    }, 3000);

    checkAdmin();
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [user]);

  // Enquanto carrega, mostra loading
  if (licenseLoading || !adminChecked) {
    return <LoadingScreen />;
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

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  // Splash screen
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Onboarding
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // App principal com autenticação
  return (
    <AuthGate>
      <MusicLibraryProvider>
        <PlaylistProvider>
          <FavoritesProvider>
            <LicenseGate>
              <Index />
            </LicenseGate>
          </FavoritesProvider>
        </PlaylistProvider>
      </MusicLibraryProvider>
    </AuthGate>
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
