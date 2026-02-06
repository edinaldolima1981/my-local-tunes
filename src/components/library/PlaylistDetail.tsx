import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Plus, Trash2, Music } from 'lucide-react';
import { Track, Playlist } from '@/types/music';
import { usePlaylists } from '@/hooks/usePlaylists';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface PlaylistDetailProps {
  playlist: Playlist;
  currentTrack: Track | null;
  isPlaying: boolean;
  onBack: () => void;
  onPlayAll: (tracks: Track[]) => void;
  onTrackSelect: (track: Track, index: number, tracks: Track[]) => void;
}

export function PlaylistDetail({
  playlist,
  currentTrack,
  isPlaying,
  onBack,
  onPlayAll,
  onTrackSelect,
}: PlaylistDetailProps) {
  const { removeTrackFromPlaylist, getPlaylist } = usePlaylists();
  const [trackToRemove, setTrackToRemove] = useState<Track | null>(null);

  // Get fresh playlist data
  const currentPlaylist = getPlaylist(playlist.id) || playlist;

  const handleRemoveTrack = () => {
    if (trackToRemove) {
      removeTrackFromPlaylist(playlist.id, trackToRemove.id);
      setTrackToRemove(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold truncate">{currentPlaylist.name}</h2>
          <p className="text-sm text-muted-foreground">
            {currentPlaylist.tracks.length} {currentPlaylist.tracks.length === 1 ? 'música' : 'músicas'}
          </p>
        </div>
        {currentPlaylist.tracks.length > 0 && (
          <Button
            onClick={() => onPlayAll(currentPlaylist.tracks)}
            className="bg-primary text-primary-foreground"
          >
            <Play size={18} className="mr-2" fill="currentColor" />
            Tocar
          </Button>
        )}
      </div>

      {/* Track List */}
      {currentPlaylist.tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <Music size={40} className="mb-2" />
          <p>Playlist vazia</p>
          <p className="text-sm">Adicione músicas à sua playlist</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-380px)]">
          <div className="space-y-1">
            {currentPlaylist.tracks.map((track, index) => {
              const isActive = currentTrack?.id === track.id;

              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive ? 'bg-primary/10 border border-primary/30' : 'hover:bg-secondary/50'
                  }`}
                >
                  <button
                    onClick={() => onTrackSelect(track, index, currentPlaylist.tracks)}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center overflow-hidden">
                      {track.coverUrl ? (
                        <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Music size={18} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
                        {track.title}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                    </div>
                  </button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive/70 hover:text-destructive"
                    onClick={() => setTrackToRemove(track)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* Remove Confirmation */}
      <AlertDialog open={!!trackToRemove} onOpenChange={() => setTrackToRemove(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover música</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja remover "{trackToRemove?.title}" da playlist?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveTrack} className="bg-destructive text-destructive-foreground">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
