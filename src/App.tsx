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
import Index from "./pages/Index";
import Privacy from "./pages/Privacy";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Componente que verifica licença e bloqueia se necessário
const LicenseGate = ({ children }: { children: React.ReactNode }) => {
  const { status, isLoading } = useLicense();

  // Enquanto carrega, mostra nada
  if (isLoading) return null;

  // Se licença inválida (trial expirado e não pago), mostra tela de pagamento
  if (status && !status.isValid) {
    return <PaymentScreen />;
  }

  return <>{children}</>;
};

// Gate de autenticação - exige login antes de acessar o app
const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) {
    return <AuthScreen />;
  }

  return <>{children}</>;
};

// Componente principal do app com splash/onboarding
const MainApp = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding') === 'true';
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    if (!showOnboarding) {
      setIsReady(true);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setIsReady(true);
  };

  return (
    <AuthProvider>
      <LicenseProvider>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

        {!showSplash && showOnboarding && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}

        {isReady && (
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
        )}
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
