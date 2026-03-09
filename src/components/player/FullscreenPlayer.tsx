import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Heart, ListMusic, Download, Loader2 } from 'lucide-react';
import { Track, RepeatMode } from '@/types/music';
import { AlbumArt } from './AlbumArt';
import { ProgressBar } from './ProgressBar';
import { PlayerControls } from './PlayerControls';
import { VideoPlayer } from './VideoPlayer';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { getAudioFile } from '@/services/audioStorageService';
import { toast } from 'sonner';

interface FullscreenPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onShowQueue?: () => void;
}

export function FullscreenPlayer({
  isOpen,
  onClose,
  track,
  isPlaying,
  currentTime,
  duration,
  shuffle,
  repeat,
  onTogglePlay,
  onPrevious,
  onNext,
  onSeek,
  onToggleShuffle,
  onToggleRepeat,
  onShowQueue,
}: FullscreenPlayerProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isCurrentFavorite = track ? isFavorite(track.id) : false;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-background"
        >
          {/* Background Layer */}
          <div className="absolute inset-0 overflow-hidden">
            {track?.coverUrl ? (
              <motion.img
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 0.3, scale: 1 }}
                src={track.coverUrl}
                alt=""
                className="w-full h-full object-cover blur-3xl"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/10 via-background to-accent/10" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
          </div>

          {/* Main Content */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative h-full flex flex-col safe-area-inset"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 shrink-0">
              <Button variant="ghost" size="icon" onClick={onClose} className="text-foreground/70 hover:text-foreground">
                <ChevronDown size={28} />
              </Button>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Tocando agora</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onShowQueue} className="text-foreground/70 hover:text-foreground">
                <ListMusic size={24} />
              </Button>
            </div>

            {/* Content Area - Split View */}
            <div className="flex-1 flex flex-col min-h-0">
              {/* Media Container (Vinyl or Video) */}
              <div className={`flex-1 flex items-center justify-center p-4 transition-all duration-300 ${track?.mediaType === 'video' ? 'max-h-[60vh]' : ''
                }`}>
                <motion.div
                  key={track?.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={`relative flex items-center justify-center ${track?.mediaType === 'video'
                    ? 'w-full h-full'
                    : 'w-full max-w-sm aspect-square'
                    }`}
                >
                  {track?.mediaType === 'video' ? (
                    <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-black relative group">
                      <VideoPlayer
                        src={track.uri}
                        isPlaying={isPlaying}
                        currentTime={currentTime}
                        repeat={repeat}
                      />
                    </div>
                  ) : (
                    <AlbumArt
                      coverUrl={track?.coverUrl}
                      isPlaying={isPlaying}
                      size="xl"
                    />
                  )}
                </motion.div>
              </div>

              {/* Controls Container */}
              <div className="px-8 pb-8 pt-4 space-y-6 bg-gradient-to-t from-background via-background/90 to-transparent shrink-0">
                {/* Track Info */}
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-foreground truncate">
                      {track?.title || 'Nenhuma música'}
                    </h2>
                    <p className="text-lg text-muted-foreground truncate">
                      {track?.artist || 'Selecione uma música'}
                    </p>
                  </div>
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => track && toggleFavorite(track.id)}
                      className={`ml-4 transition-colors ${
                        isCurrentFavorite 
                          ? 'text-red-500 hover:text-red-400' 
                          : 'text-muted-foreground hover:text-primary'
                      }`}
                    >
                      <Heart size={24} fill={isCurrentFavorite ? 'currentColor' : 'none'} />
                    </Button>
                  </motion.div>
                </div>

                {/* Progress Bar */}
                <ProgressBar
                  currentTime={currentTime}
                  duration={duration}
                  onSeek={onSeek}
                />

                {/* Main Controls */}
                <div className="py-2">
                  <PlayerControls
                    isPlaying={isPlaying}
                    shuffle={shuffle}
                    repeat={repeat}
                    onTogglePlay={onTogglePlay}
                    onPrevious={onPrevious}
                    onNext={onNext}
                    onToggleShuffle={onToggleShuffle}
                    onToggleRepeat={onToggleRepeat}
                    disabled={!track}
                    size="large"
                  />
                </div>

              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
