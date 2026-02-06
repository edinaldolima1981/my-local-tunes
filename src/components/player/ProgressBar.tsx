import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  showLabels?: boolean;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function ProgressBar({ 
  currentTime, 
  duration, 
  onSeek,
  showLabels = true 
}: ProgressBarProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full space-y-2">
      <div className="relative group">
        <Slider
          value={[progress]}
          max={100}
          step={0.1}
          onValueChange={([value]) => onSeek((value / 100) * duration)}
          className="cursor-pointer"
        />
      </div>
      {showLabels && (
        <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
          <motion.span
            key={Math.floor(currentTime)}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
          >
            {formatTime(currentTime)}
          </motion.span>
          <span>{formatTime(duration)}</span>
        </div>
      )}
    </div>
  );
}
