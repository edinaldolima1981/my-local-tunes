import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MusicLibraryProvider } from "@/hooks/useMusicLibrary";
import { PlaylistProvider } from "@/hooks/usePlaylists";
import { SplashScreen } from "@/components/welcome/SplashScreen";
import { Onboarding } from "@/components/welcome/Onboarding";
import Index from "./pages/Index";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/privacy" element={<Privacy />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </PlaylistProvider>
          </MusicLibraryProvider>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

