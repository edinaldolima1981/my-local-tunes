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
import { SplashScreen } from "@/components/welcome/SplashScreen";
import { Onboarding } from "@/components/welcome/Onboarding";
import { PaymentScreen } from "@/components/license/PaymentScreen";
import Index from "./pages/Index";
import Privacy from "./pages/Privacy";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Componente que verifica licença e bloqueia se necessário
const LicenseGate = ({ children }: { children: React.ReactNode }) => {
  const { status, isLoading } = useLicense();

  // Enquanto carrega, mostra nada (splash ainda está ativa)
  if (isLoading) return null;

  // Se licença inválida (trial expirado e não pago), mostra tela de pagamento
  if (status && !status.isValid) {
    return <PaymentScreen />;
  }

  return <>{children}</>;
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding') === 'true';
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);

    // If user needs onboarding, that's next, otherwise go to app
    if (!showOnboarding) {
      setIsReady(true);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setIsReady(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LicenseProvider>
          {/* Show Splash Screen First */}
          {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

          {/* Show Onboarding After Splash (if needed) */}
          {!showSplash && showOnboarding && (
            <Onboarding onComplete={handleOnboardingComplete} />
          )}

          {/* Main App (after splash and onboarding) */}
          {isReady && (
            <MusicLibraryProvider>
              <PlaylistProvider>
                <FavoritesProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Routes>
                      {/* Admin route - não precisa de verificação de licença */}
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/privacy" element={<Privacy />} />
                      
                      {/* Rotas protegidas por licença */}
                      <Route path="/" element={
                        <LicenseGate>
                          <Index />
                        </LicenseGate>
                      } />
                      
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </FavoritesProvider>
              </PlaylistProvider>
            </MusicLibraryProvider>
          )}
        </LicenseProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

