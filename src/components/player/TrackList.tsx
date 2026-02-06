import { motion } from 'framer-motion';
import { Music, Play, Pause } from 'lucide-react';
import { Track } from '@/types/music';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TrackListProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onTrackSelect: (index: number) => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function TrackList({ tracks, currentTrack, isPlaying, onTrackSelect }: TrackListProps) {
  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-4">
        <Music size={48} />
        <div className="text-center">
          <p className="font-medium">Nenhuma música encontrada</p>
          <p className="text-sm">Adicione músicas ao seu dispositivo</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-420px)] md:h-[400px]">
      <div className="space-y-1 p-1">
        {tracks.map((track, index) => {
          const isActive = currentTrack?.id === track.id;
          
          return (
            <motion.button
              key={track.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onTrackSelect(index)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left
                ${isActive 
                  ? 'bg-primary/10 border border-primary/30' 
                  : 'hover:bg-secondary/50 border border-transparent'
                }`}
            >
              {/* Album Art Thumbnail */}
              <div className="relative w-12 h-12 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                {track.coverUrl ? (
                  <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                    <Music size={20} className="text-muted-foreground" />
                  </div>
                )}
                
                {/* Play indicator overlay */}
                {isActive && (
                  <motion.div 
                    className="absolute inset-0 bg-primary/40 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {isPlaying ? (
                      <Pause size={20} className="text-primary-foreground" fill="currentColor" />
                    ) : (
                      <Play size={20} className="text-primary-foreground ml-0.5" fill="currentColor" />
                    )}
                  </motion.div>
                )}
              </div>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
                  {track.title}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {track.artist}
                </p>
              </div>

              {/* Duration */}
              <span className="text-sm text-muted-foreground flex-shrink-0">
                {formatDuration(track.duration)}
              </span>
            </motion.button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
