import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Plus, Music } from 'lucide-react';
import { Track } from '@/types/music';
import { Artist, Album, Folder } from '@/hooks/useLibraryOrganization';
import { usePlaylists } from '@/hooks/usePlaylists';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CategoryDetailProps {
  title: string;
  subtitle?: string;
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onBack: () => void;
  onPlayAll: (tracks: Track[]) => void;
  onTrackSelect: (track: Track, index: number, tracks: Track[]) => void;
}

export function CategoryDetail({
  title,
  subtitle,
  tracks,
  currentTrack,
  isPlaying,
  onBack,
  onPlayAll,
  onTrackSelect,
}: CategoryDetailProps) {
  const { playlists, addTrackToPlaylist } = usePlaylists();
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [trackToAdd, setTrackToAdd] = useState<Track | null>(null);

  const handleAddToPlaylist = (playlistId: string) => {
    if (trackToAdd) {
      addTrackToPlaylist(playlistId, trackToAdd);
      setShowAddToPlaylist(false);
      setTrackToAdd(null);
    }
  };

  const openAddToPlaylist = (track: Track) => {
    setTrackToAdd(track);
    setShowAddToPlaylist(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold truncate">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
          <p className="text-xs text-muted-foreground">
            {tracks.length} {tracks.length === 1 ? 'música' : 'músicas'}
          </p>
        </div>
        {tracks.length > 0 && (
          <Button
            onClick={() => onPlayAll(tracks)}
            className="bg-primary text-primary-foreground"
          >
            <Play size={18} className="mr-2" fill="currentColor" />
            Tocar
          </Button>
        )}
      </div>

      {/* Track List */}
      <ScrollArea className="h-[calc(100vh-380px)]">
        <div className="space-y-1">
          {tracks.map((track, index) => {
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
                  onClick={() => onTrackSelect(track, index, tracks)}
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
                    <p className="text-sm text-muted-foreground truncate">
                      {track.artist} • {track.album}
                    </p>
                  </div>
                </button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openAddToPlaylist(track)}
                >
                  <Plus size={16} />
                </Button>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Add to Playlist Dialog */}
      <Dialog open={showAddToPlaylist} onOpenChange={setShowAddToPlaylist}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Adicionar à Playlist</DialogTitle>
          </DialogHeader>
          {playlists.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma playlist criada. Crie uma playlist primeiro.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                    <Music size={18} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{playlist.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {playlist.tracks.length} músicas
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
