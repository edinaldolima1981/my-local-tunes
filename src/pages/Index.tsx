import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListMusic, Disc3, RefreshCw, Volume2, FolderOpen } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import { AlbumArt } from '@/components/player/AlbumArt';
import { ProgressBar } from '@/components/player/ProgressBar';
import { PlayerControls } from '@/components/player/PlayerControls';
import { TrackInfo } from '@/components/player/TrackInfo';
import { TrackList } from '@/components/player/TrackList';
import { SearchBar } from '@/components/player/SearchBar';
import { VolumeControl } from '@/components/player/VolumeControl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showVolume, setShowVolume] = useState(false);
  const player = useAudioPlayer();
  const { tracks, isScanning, scanProgress, scanStatus, error, rescan, isNativePlatform } = useMusicLibrary();

  // Load queue when tracks change
  useEffect(() => {
    if (tracks.length > 0 && player.queue.length === 0) {
      player.loadQueue(tracks, 0);
    }
  }, [tracks]);

  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return tracks;
    const query = searchQuery.toLowerCase();
    return tracks.filter(
      track =>
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.album.toLowerCase().includes(query)
    );
  }, [searchQuery, tracks]);

  const handleTrackSelect = (index: number) => {
    const track = filteredTracks[index];
    const originalIndex = tracks.findIndex(t => t.id === track.id);
    player.loadQueue(tracks, originalIndex);
  };

  return (
    <div className="min-h-screen bg-background safe-area-inset">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-surface opacity-50 pointer-events-none" />
      
      <div className="relative z-10 container max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <Disc3 className="text-primary animate-spin-slow" size={28} />
            <h1 className="text-2xl font-bold text-gradient-primary">Music Player</h1>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowVolume(!showVolume)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Volume2 size={20} />
          </Button>
        </motion.header>

        {/* Volume Control */}
        <AnimatePresence>
          {showVolume && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <VolumeControl volume={player.volume} onVolumeChange={player.setVolumeLevel} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Scanning Status */}
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 rounded-lg bg-secondary/50 flex items-center gap-3"
          >
            <RefreshCw className="animate-spin text-primary" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium">{scanStatus}</p>
              <p className="text-xs text-muted-foreground">{scanProgress} arquivos encontrados</p>
            </div>
          </motion.div>
        )}

        <Tabs defaultValue="player" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50">
            <TabsTrigger value="player" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Disc3 size={18} className="mr-2" />
              Player
            </TabsTrigger>
            <TabsTrigger value="library" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ListMusic size={18} className="mr-2" />
              Biblioteca
            </TabsTrigger>
          </TabsList>

          {/* Player View */}
          <TabsContent value="player" className="mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center space-y-6"
            >
              {/* Album Art */}
              <AlbumArt 
                coverUrl={player.currentTrack?.coverUrl} 
                isPlaying={player.isPlaying} 
              />

              {/* Track Info */}
              <TrackInfo track={player.currentTrack} />

              {/* Progress Bar */}
              <div className="w-full px-2">
                <ProgressBar
                  currentTime={player.currentTime}
                  duration={player.duration}
                  onSeek={player.seek}
                />
              </div>

              {/* Controls */}
              <PlayerControls
                isPlaying={player.isPlaying}
                shuffle={player.shuffle}
                repeat={player.repeat}
                onTogglePlay={player.togglePlay}
                onPrevious={player.handlePrevious}
                onNext={player.handleNext}
                onToggleShuffle={player.toggleShuffle}
                onToggleRepeat={player.toggleRepeat}
                disabled={!player.currentTrack}
              />
            </motion.div>
          </TabsContent>

          {/* Library View */}
          <TabsContent value="library" className="mt-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
              
              <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
                <span>{filteredTracks.length} músicas</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={rescan}
                  disabled={isScanning}
                  className="text-primary hover:text-primary/80"
                >
                  <RefreshCw size={16} className={`mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>

              {!isNativePlatform && (
                <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FolderOpen size={16} />
                    <span>Modo web - usando músicas de demonstração</span>
                  </div>
                </div>
              )}

              <TrackList
                tracks={filteredTracks}
                currentTrack={player.currentTrack}
                isPlaying={player.isPlaying}
                onTrackSelect={handleTrackSelect}
              />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
