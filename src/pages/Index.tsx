import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ListMusic, Disc3 } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { AlbumArt } from '@/components/player/AlbumArt';
import { ProgressBar } from '@/components/player/ProgressBar';
import { PlayerControls } from '@/components/player/PlayerControls';
import { TrackInfo } from '@/components/player/TrackInfo';
import { TrackList } from '@/components/player/TrackList';
import { SearchBar } from '@/components/player/SearchBar';
import { mockTracks } from '@/data/mockTracks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const player = useAudioPlayer();

  // Initialize queue with mock tracks
  useMemo(() => {
    if (player.queue.length === 0) {
      player.loadQueue(mockTracks, 0);
    }
  }, []);

  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return mockTracks;
    const query = searchQuery.toLowerCase();
    return mockTracks.filter(
      track =>
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.album.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleTrackSelect = (index: number) => {
    const track = filteredTracks[index];
    const originalIndex = mockTracks.findIndex(t => t.id === track.id);
    player.loadQueue(mockTracks, originalIndex);
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
          className="flex items-center justify-center gap-3 mb-6"
        >
          <Disc3 className="text-primary animate-spin-slow" size={28} />
          <h1 className="text-2xl font-bold text-gradient-primary">Music Player</h1>
        </motion.header>

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
              </div>

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
