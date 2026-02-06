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

interface PlayerControlsProps {
  isPlaying: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  disabled?: boolean;
  size?: 'default' | 'large';
}

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
    <div className="flex items-center justify-center gap-3 md:gap-6">
      {/* Shuffle */}
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

      {/* Previous */}
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

      {/* Play/Pause */}
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

      {/* Next */}
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

      {/* Repeat */}
      <motion.div whileTap={{ scale: 0.9 }}>
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
      </motion.div>
    </div>
  );
}
