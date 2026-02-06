import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Plus, Music, ListPlus } from 'lucide-react';
import { Track } from '@/types/music';
import { Artist, Album, Folder } from '@/hooks/useLibraryOrganization';
import { usePlaylists } from '@/hooks/usePlaylists';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
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
  const { playlists, addTrackToPlaylist, createPlaylist } = usePlaylists();
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [trackToAdd, setTrackToAdd] = useState<Track | null>(null);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const handleAddToPlaylist = (playlistId: string) => {
    if (trackToAdd) {
      addTrackToPlaylist(playlistId, trackToAdd);
      toast.success(`Adicionada a playlist!`);
      setShowAddToPlaylist(false);
      setTrackToAdd(null);
    }
  };

  const openAddToPlaylist = (track: Track) => {
    setTrackToAdd(track);
    setShowAddToPlaylist(true);
  };

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      const newPlaylist = createPlaylist(newPlaylistName.trim());
      if (trackToAdd) {
        addTrackToPlaylist(newPlaylist.id, trackToAdd);
        toast.success(`Playlist "${newPlaylistName}" criada com a música!`);
      }
      setNewPlaylistName('');
      setShowCreatePlaylist(false);
      setShowAddToPlaylist(false);
      setTrackToAdd(null);
    }
  };

  const handleAddAllToPlaylist = (playlistId: string) => {
    tracks.forEach(track => {
      addTrackToPlaylist(playlistId, track);
    });
    toast.success(`${tracks.length} músicas adicionadas!`);
    setShowAddToPlaylist(false);
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
        <div className="flex items-center gap-2">
          {tracks.length > 0 && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setTrackToAdd(null); // null means add all
                  setShowAddToPlaylist(true);
                }}
                title="Adicionar todas à playlist"
              >
                <ListPlus size={18} />
              </Button>
              <Button
                onClick={() => onPlayAll(tracks)}
                className="bg-primary text-primary-foreground"
              >
                <Play size={18} className="mr-2" fill="currentColor" />
                Tocar
              </Button>
            </>
          )}
        </div>
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
                  title="Adicionar à playlist"
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
            <DialogTitle>
              {trackToAdd ? 'Adicionar à Playlist' : `Adicionar ${tracks.length} músicas`}
            </DialogTitle>
          </DialogHeader>
          
          {showCreatePlaylist ? (
            <div className="space-y-4">
              <Input
                placeholder="Nome da playlist"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreatePlaylist(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim()}
                >
                  Criar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Create new playlist button */}
              <button
                onClick={() => setShowCreatePlaylist(true)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-left border border-primary/30"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Plus size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-primary">Nova Playlist</p>
                  <p className="text-sm text-muted-foreground">Criar e adicionar músicas</p>
                </div>
              </button>

              {/* Existing playlists */}
              {playlists.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => trackToAdd 
                        ? handleAddToPlaylist(playlist.id) 
                        : handleAddAllToPlaylist(playlist.id)
                      }
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
