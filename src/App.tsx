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
import { SplashScreen } from "@/components/welcome/SplashScreen";
import { Onboarding } from "@/components/welcome/Onboarding";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { PaymentScreen } from "@/components/license/PaymentScreen";
import { supabase } from "@/integrations/supabase/client";
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

// Componente que verifica licença e bloqueia se necessário (admins são isentos)
const LicenseGate = ({ children }: { children: React.ReactNode }) => {
  const { status, isLoading } = useLicense();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      setIsAdmin(data === true);
    };
    checkAdmin();
  }, [user]);

  // Enquanto carrega, mostra loading
  if (isLoading || isAdmin === null) {
    return <LoadingScreen />;
  }

  // Admins têm acesso total, sem restrição de licença
  if (isAdmin) {
    return <>{children}</>;
  }

  // Se licença inválida (trial expirado e não pago), mostra tela de pagamento
  if (status && !status.isValid) {
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

// Componente principal do app com splash/onboarding
const MainApp = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding') === 'true';
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  // Splash screen
  if (showSplash) {
    return (
      <AuthProvider>
        <LicenseProvider>
          <SplashScreen onComplete={handleSplashComplete} />
        </LicenseProvider>
      </AuthProvider>
    );
  }

  // Onboarding
  if (showOnboarding) {
    return (
      <AuthProvider>
        <LicenseProvider>
          <Onboarding onComplete={handleOnboardingComplete} />
        </LicenseProvider>
      </AuthProvider>
    );
  }

  // App principal
  return (
    <AuthProvider>
      <LicenseProvider>
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
