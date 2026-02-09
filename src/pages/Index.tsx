/**
 * @fileoverview Página principal do Music Player
 * 
 * Contém navegação entre Home e Library com:
 * - Home: Carrossel de artistas + grid de álbuns
 * - Library: Lista de músicas, artistas, álbuns, playlists
 * - Mini Player e Player em tela cheia
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, 
  RefreshCw, 
  Shield,
  Home,
  Library
} from 'lucide-react';

// Hooks
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import { useLibraryOrganization, Artist, Album } from '@/hooks/useLibraryOrganization';
import { usePlaylists } from '@/hooks/usePlaylists';

// Componentes do Player
import { VolumeControl } from '@/components/player/VolumeControl';
import { MiniPlayer } from '@/components/player/MiniPlayer';
import { FullscreenPlayer } from '@/components/player/FullscreenPlayer';

// Componentes
import { HomeScreen } from '@/components/home/HomeScreen';
import { LibraryScreen } from '@/components/library/LibraryScreen';
import { PrivacyInfo } from '@/components/PrivacyInfo';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Equalizer } from '@/components/player/Equalizer';

// Types
import { Track } from '@/types/music';

type MainTab = 'home' | 'library';

const Index = () => {
  // UI State
  const [mainTab, setMainTab] = useState<MainTab>('home');
  const [showVolume, setShowVolume] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  // Navigation state (for going from Home to Library detail)
  const [pendingArtist, setPendingArtist] = useState<Artist | null>(null);
  const [pendingAlbum, setPendingAlbum] = useState<Album | null>(null);

  // Hooks
  const player = useAudioPlayer();
  const { tracks, customAlbums, isScanning, scanProgress, scanStatus, error, rescan } = useMusicLibrary();
  const { artists, albums, searchTracks } = useLibraryOrganization(tracks, customAlbums);
  const { resolvePlaylists } = usePlaylists();

  // Resolve playlists when library loads
  useEffect(() => {
    if (tracks.length > 0) {
      resolvePlaylists(tracks);
    }
  }, [tracks, resolvePlaylists]);

  // Load queue when tracks are scanned
  useEffect(() => {
    if (tracks.length > 0 && player.queue.length === 0) {
      player.loadQueue(tracks, 0);
    }
  }, [tracks]);

  // Handlers
  const handleTrackSelect = (index: number) => {
    player.loadQueue(tracks, index);
  };

  const handlePlayFromCategory = (categoryTracks: Track[], index: number) => {
    player.loadQueue(categoryTracks, index);
  };

  const handlePlayAll = (tracksToPlay: Track[]) => {
    if (tracksToPlay.length > 0) {
      player.loadQueue(tracksToPlay, 0);
    }
  };

  const handleArtistSelect = (artist: Artist) => {
    setPendingArtist(artist);
    setMainTab('library');
  };

  const handleAlbumSelect = (album: Album) => {
    setPendingAlbum(album);
    setMainTab('library');
  };

  const handleClearPending = () => {
    setPendingArtist(null);
    setPendingAlbum(null);
  };

  const progress = player.duration > 0 ? player.currentTime / player.duration : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-surface opacity-50 pointer-events-none" />
      
      <div className="relative z-10 pb-32">
        <div className="container max-w-lg mx-auto px-4 py-6 safe-area-inset">
          {/* Header Controls */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-end gap-1 mb-4"
          >
            <Equalizer />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPrivacy(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Shield size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowVolume(!showVolume)}
              className={`transition-colors ${showVolume ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Volume2 size={22} />
            </Button>
          </motion.div>

          {/* Volume Control */}
          <AnimatePresence>
            {showVolume && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <VolumeControl volume={player.volume} onVolumeChange={player.setVolumeLevel} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scanning Status */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 rounded-2xl bg-secondary/50 backdrop-blur-sm flex items-center gap-3 border border-border/50"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <RefreshCw className="animate-spin text-primary" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{scanStatus}</p>
                  <p className="text-xs text-muted-foreground">{scanProgress} arquivos encontrados</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <AnimatePresence mode="wait">
            {mainTab === 'home' ? (
              <motion.div
                key="home"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.2 }}
              >
                <HomeScreen
                  artists={artists}
                  albums={albums}
                  tracksCount={tracks.length}
                  isPlaying={player.isPlaying}
                  onArtistSelect={handleArtistSelect}
                  onAlbumSelect={handleAlbumSelect}
                />
              </motion.div>
            ) : (
              <motion.div
                key="library"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.2 }}
              >
                <LibraryScreen
                  tracks={tracks}
                  artists={artists}
                  albums={albums}
                  currentTrack={player.currentTrack}
                  isPlaying={player.isPlaying}
                  isScanning={isScanning}
                  onRescan={rescan}
                  onTrackSelect={handleTrackSelect}
                  onPlayFromCategory={handlePlayFromCategory}
                  onPlayAll={handlePlayAll}
                  onOpenFullscreen={() => setShowFullscreen(true)}
                  searchTracks={searchTracks}
                  onGoHome={() => setMainTab('home')}
                  initialArtist={pendingArtist}
                  initialAlbum={pendingAlbum}
                  onClearInitial={handleClearPending}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        {/* Mini Player */}
        <AnimatePresence>
          {player.currentTrack && !showFullscreen && (
            <MiniPlayer
              track={player.currentTrack}
              isPlaying={player.isPlaying}
              progress={progress}
              onTogglePlay={player.togglePlay}
              onNext={player.handleNext}
              onExpand={() => setShowFullscreen(true)}
            />
          )}
        </AnimatePresence>

        {/* Tab Bar */}
        <div className="bg-background/95 backdrop-blur-lg border-t border-border/50 safe-area-inset-bottom">
          <div className="container max-w-lg mx-auto flex items-center justify-around py-2">
            <button
              onClick={() => setMainTab('home')}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
                mainTab === 'home'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <Home size={22} />
              <span className="text-[10px] font-medium">Home</span>
            </button>
            <button
              onClick={() => setMainTab('library')}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
                mainTab === 'library'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <Library size={22} />
              <span className="text-[10px] font-medium">Biblioteca</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Player */}
      <FullscreenPlayer
        isOpen={showFullscreen}
        onClose={() => setShowFullscreen(false)}
        track={player.currentTrack}
        isPlaying={player.isPlaying}
        currentTime={player.currentTime}
        duration={player.duration}
        shuffle={player.shuffle}
        repeat={player.repeat}
        onTogglePlay={player.togglePlay}
        onPrevious={player.handlePrevious}
        onNext={player.handleNext}
        onSeek={player.seek}
        onToggleShuffle={player.toggleShuffle}
        onToggleRepeat={player.toggleRepeat}
      />

      {/* Privacy Info Dialog */}
      <PrivacyInfo isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </div>
  );
};

export default Index;
