/**
 * @fileoverview Mini Player
 * 
 * Barra inferior compacta que aparece quando há música tocando.
 * Permite controle básico e expande para o player em tela cheia.
 */

import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, ChevronUp, Music } from 'lucide-react';
import { Track } from '@/types/music';
import { Button } from '@/components/ui/button';

interface MiniPlayerProps {
  track: Track | null;
  isPlaying: boolean;
  /** Progresso da reprodução (0 a 1) */
  progress: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onExpand: () => void;
}

/** Componente do ícone animado de play/pause */
const AnimatedPlayPauseIcon = forwardRef<HTMLDivElement, { isPlaying: boolean }>(
  function AnimatedPlayPauseIcon({ isPlaying }, ref) {
    return (
      <div ref={ref}>
        {isPlaying ? (
          <Pause size={20} fill="currentColor" />
        ) : (
          <Play size={20} fill="currentColor" className="ml-0.5" />
        )}
      </div>
    );
  }
);

/** Componente das informações da faixa animadas */
const AnimatedTrackInfo = forwardRef<HTMLDivElement, { track: Track }>(
  function AnimatedTrackInfo({ track }, ref) {
    return (
      <div ref={ref}>
        <p className="font-medium text-foreground truncate text-sm">
          {track.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {track.artist}
        </p>
      </div>
    );
  }
);

export function MiniPlayer({
  track,
  isPlaying,
  progress,
  onTogglePlay,
  onNext,
  onExpand,
}: MiniPlayerProps) {
  if (!track) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-40"
    >
      {/* Progress bar at top */}
      <div className="h-0.5 bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <div className="glass-surface border-t border-border/50 px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          {/* Album art & info - clickable to expand */}
          <button
            onClick={onExpand}
            className="flex items-center gap-3 flex-1 min-w-0 text-left"
          >
            {/* Album Art */}
            <motion.div
              key={track.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0 shadow-lg"
            >
              {track.coverUrl ? (
                <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                  <Music size={20} className="text-primary" />
                </div>
              )}
            </motion.div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={track.id}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <AnimatedTrackInfo track={track} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Expand indicator */}
            <ChevronUp size={20} className="text-muted-foreground" />
          </button>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePlay();
                }}
                className="w-11 h-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <AnimatedPlayPauseIcon isPlaying={isPlaying} />
              </Button>
            </motion.div>

            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className="text-foreground"
            >
              <SkipForward size={22} fill="currentColor" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
