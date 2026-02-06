import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Heart, Share2, MoreHorizontal, ListMusic } from 'lucide-react';
import { Track, RepeatMode } from '@/types/music';
import { AlbumArt } from './AlbumArt';
import { ProgressBar } from './ProgressBar';
import { PlayerControls } from './PlayerControls';
import { Button } from '@/components/ui/button';

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
          {/* Background with album art blur */}
          {track?.coverUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.3, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 overflow-hidden"
            >
              <img
                src={track.coverUrl}
                alt=""
                className="w-full h-full object-cover blur-3xl"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
            </motion.div>
          )}

          {/* Content */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative h-full flex flex-col safe-area-inset"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-foreground/70 hover:text-foreground"
              >
                <ChevronDown size={28} />
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Tocando agora
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onShowQueue}
                className="text-foreground/70 hover:text-foreground"
              >
                <ListMusic size={24} />
              </Button>
            </div>

            {/* Album Art */}
            <div className="flex-1 flex items-center justify-center px-8 py-4">
              <motion.div
                key={track?.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 25,
                  delay: 0.15 
                }}
                className="w-full max-w-sm aspect-square"
              >
                <div className={`w-full h-full rounded-2xl overflow-hidden shadow-2xl ${isPlaying ? 'animate-pulse-glow' : ''}`}>
                  {track?.coverUrl ? (
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-primary/40" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Track Info & Controls */}
            <div className="px-8 pb-8 space-y-6">
              {/* Track Info */}
              <motion.div
                key={`info-${track?.id}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-foreground truncate">
                    {track?.title || 'Nenhuma música'}
                  </h2>
                  <p className="text-lg text-muted-foreground truncate">
                    {track?.artist || 'Selecione uma música'}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                    <Heart size={24} />
                  </Button>
                </div>
              </motion.div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <ProgressBar
                  currentTime={currentTime}
                  duration={duration}
                  onSeek={onSeek}
                />
              </div>

              {/* Controls */}
              <div className="py-4">
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
                />
              </div>

              {/* Extra Actions */}
              <div className="flex items-center justify-center gap-8 pt-2">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Share2 size={20} />
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <MoreHorizontal size={20} />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
