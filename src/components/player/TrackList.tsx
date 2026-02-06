import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, Trash2, FolderOpen, Disc } from 'lucide-react';
import { Track } from '@/types/music';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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

// Extrai o nome da pasta do URI
function getFolderName(uri: string): string {
  if (!uri) return 'Desconhecida';
  const parts = uri.split('/');
  parts.pop(); // Remove o nome do arquivo
  return parts[parts.length - 1] || 'Raiz';
}

export function TrackList({ tracks, currentTrack, isPlaying, onTrackSelect }: TrackListProps) {
  const { deleteTrack } = useMusicLibrary();

  const handleDelete = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTrack(track.id);
    toast.success(`"${track.title}" removida da biblioteca`);
  };

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-4">
        <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center">
          <Music size={32} />
        </div>
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
          const folderName = getFolderName(track.uri);
          
          return (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.5) }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group
                ${isActive 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'hover:bg-secondary/50 border border-transparent'
                }`}
            >
              <button
                onClick={() => onTrackSelect(index)}
                className="flex-1 flex items-center gap-3"
              >
                {/* Track Number / Playing Indicator */}
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                  {isActive ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="relative"
                    >
                      {isPlaying ? (
                        <div className="flex items-end gap-0.5 h-4">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1 bg-primary rounded-full"
                              animate={{
                                height: ["8px", "16px", "8px"],
                              }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.15,
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <Pause size={16} className="text-primary" />
                      )}
                    </motion.div>
                  ) : (
                    <span className="text-sm text-muted-foreground group-hover:hidden">
                      {index + 1}
                    </span>
                  )}
                  {!isActive && (
                    <Play
                      size={16}
                      className="text-foreground hidden group-hover:block"
                      fill="currentColor"
                    />
                  )}
                </div>

                {/* Album Art Thumbnail */}
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0 shadow-md">
                  {track.coverUrl ? (
                    <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                      <Music size={18} className="text-muted-foreground" />
                    </div>
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
                  {/* Pasta e Álbum */}
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground/70">
                    <span className="flex items-center gap-1 truncate">
                      <FolderOpen size={10} />
                      {folderName}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <Disc size={10} />
                      {track.album || 'Desconhecido'}
                    </span>
                  </div>
                </div>

                {/* Duration */}
                <span className="text-sm text-muted-foreground flex-shrink-0 tabular-nums">
                  {formatDuration(track.duration)}
                </span>
              </button>

              {/* Delete Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 size={16} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir música?</AlertDialogTitle>
                    <AlertDialogDescription>
                      A música "{track.title}" será removida da sua biblioteca. Esta ação não exclui o arquivo do dispositivo.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={(e) => handleDelete(track, e)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </motion.div>
          );
        })}
      </div>
    </ScrollArea>
  );
}