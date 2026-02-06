import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MusicLibraryProvider } from "@/hooks/useMusicLibrary";
import { PlaylistProvider } from "@/hooks/usePlaylists";
import { audioPlayerService } from "@/services/audioPlayerService";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Para qualquer áudio que possa estar tocando de uma sessão anterior
audioPlayerService.stop();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MusicLibraryProvider>
        <PlaylistProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </PlaylistProvider>
      </MusicLibraryProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
