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

// Componente que verifica licença - admins são isentos, não bloqueia durante loading
const LicenseGate = ({ children }: { children: React.ReactNode }) => {
  const { status, isLoading } = useLicense();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    let alive = true;
    // Timeout curto de 2s - se não responder, assume não-admin e segue
    const timeout = setTimeout(() => {
      if (alive) setIsAdmin(false);
    }, 2000);

    supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })
      .then(({ data, error }) => {
        if (alive) setIsAdmin(error ? false : data === true);
      })
      .then(() => clearTimeout(timeout));

    return () => { alive = false; clearTimeout(timeout); };
  }, [user]);

  // Enquanto carrega, mostra o app normalmente (não bloqueia)
  if (isLoading || !status || isAdmin === null) {
    return <>{children}</>;
  }

  // Admins têm acesso total
  if (isAdmin) {
    return <>{children}</>;
  }

  // Só bloqueia quando confirmado que licença é inválida
  if (!status.isValid) {
    return <PaymentScreen />;
  }

  return <>{children}</>;
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
