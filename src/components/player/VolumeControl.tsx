import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export function VolumeControl({ volume, onVolumeChange }: VolumeControlProps) {
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
      <VolumeIcon size={20} className="text-muted-foreground flex-shrink-0" />
      <Slider
        value={[volume * 100]}
        max={100}
        step={1}
        onValueChange={([value]) => onVolumeChange(value / 100)}
        className="flex-1"
      />
      <span className="text-sm text-muted-foreground w-10 text-right">
        {Math.round(volume * 100)}%
      </span>
    </div>
  );
}
