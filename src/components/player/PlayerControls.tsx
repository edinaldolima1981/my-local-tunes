/**
 * @fileoverview Controles do Player
 * 
 * Botões de controle para:
 * - Play/Pause
 * - Próxima/Anterior
 * - Shuffle (aleatório)
 * - Repeat (off/all/one)
 */

import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RepeatMode } from '@/types/music';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PlayerControlsProps {
  /** Se está tocando */
  isPlaying: boolean;
  /** Se shuffle está ativo */
  shuffle: boolean;
  /** Modo de repetição atual */
  repeat: RepeatMode;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  disabled?: boolean;
  /** Tamanho dos controles */
  size?: 'default' | 'large';
}

/** Labels para cada modo de repetição */
const REPEAT_LABELS: Record<RepeatMode, string> = {
  off: 'Repetir: Desligado',
  all: 'Repetir: Playlist',
  one: 'Repetir: Música',
};

export function PlayerControls({
  isPlaying,
  shuffle,
  repeat,
  onTogglePlay,
  onPrevious,
  onNext,
  onToggleShuffle,
  onToggleRepeat,
  disabled = false,
  size = 'default',
}: PlayerControlsProps) {
  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;
  const isLarge = size === 'large';

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center justify-center gap-3 md:gap-6">
        {/* Shuffle Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleShuffle}
                disabled={disabled}
                className={`transition-all duration-200 ${
                  shuffle 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                } ${isLarge ? 'w-12 h-12' : 'w-10 h-10'}`}
              >
                <Shuffle size={isLarge ? 24 : 20} />
              </Button>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{shuffle ? 'Aleatório: Ligado' : 'Aleatório: Desligado'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Previous Button */}
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            disabled={disabled}
            className={`text-foreground hover:text-primary transition-colors ${
              isLarge ? 'w-14 h-14' : 'w-12 h-12'
            }`}
          >
            <SkipBack size={isLarge ? 32 : 26} fill="currentColor" />
          </Button>
        </motion.div>

        {/* Play/Pause Button */}
        <motion.div
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          <Button
            variant="default"
            size="icon"
            onClick={onTogglePlay}
            disabled={disabled}
            className={`rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all duration-200 ${
              isLarge ? 'w-20 h-20' : 'w-16 h-16'
            } ${isPlaying ? 'animate-pulse-glow' : ''}`}
          >
            <motion.div
              key={isPlaying ? 'pause' : 'play'}
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              {isPlaying ? (
                <Pause size={isLarge ? 36 : 30} fill="currentColor" />
              ) : (
                <Play size={isLarge ? 36 : 30} fill="currentColor" className="ml-1" />
              )}
            </motion.div>
          </Button>
        </motion.div>

        {/* Next Button */}
        <motion.div whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={disabled}
            className={`text-foreground hover:text-primary transition-colors ${
              isLarge ? 'w-14 h-14' : 'w-12 h-12'
            }`}
          >
            <SkipForward size={isLarge ? 32 : 26} fill="currentColor" />
          </Button>
        </motion.div>

        {/* Repeat Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div whileTap={{ scale: 0.9 }} className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleRepeat}
                disabled={disabled}
                className={`transition-all duration-200 ${
                  repeat !== 'off' 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                } ${isLarge ? 'w-12 h-12' : 'w-10 h-10'}`}
              >
                <RepeatIcon size={isLarge ? 24 : 20} />
              </Button>
              {/* Indicator dot for active repeat */}
              {repeat !== 'off' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary"
                />
              )}
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{REPEAT_LABELS[repeat]}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
