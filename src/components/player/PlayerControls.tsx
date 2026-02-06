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
}: PlayerControlsProps) {
  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4">
      {/* Shuffle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleShuffle}
        disabled={disabled}
        className={`transition-colors ${shuffle ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
      >
        <Shuffle size={20} />
      </Button>

      {/* Previous */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        disabled={disabled}
        className="text-foreground hover:text-primary transition-colors"
      >
        <SkipBack size={24} fill="currentColor" />
      </Button>

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
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
        >
          <motion.div
            key={isPlaying ? 'pause' : 'play'}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
          </motion.div>
        </Button>
      </motion.div>

      {/* Next */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={disabled}
        className="text-foreground hover:text-primary transition-colors"
      >
        <SkipForward size={24} fill="currentColor" />
      </Button>

      {/* Repeat */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleRepeat}
        disabled={disabled}
        className={`transition-colors ${repeat !== 'off' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
      >
        <RepeatIcon size={20} />
      </Button>
    </div>
  );
}
