import { useState } from 'react';
import { motion } from 'framer-motion';
import { Music, Check, Search, Plus } from 'lucide-react';
import { Track, Playlist } from '@/types/music';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface AddToPlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlistId: string;
}

export function AddToPlaylistDialog({ 
  open, 
  onOpenChange, 
  playlistId 
}: AddToPlaylistDialogProps) {
  const { tracks } = useMusicLibrary();
  const { addTrackToPlaylist, getPlaylist } = usePlaylists();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTracks, setSelectedTracks] = useState<Set<string>>(new Set());

  const playlist = getPlaylist(playlistId);
  const existingTrackIds = new Set(playlist?.tracks.map(t => t.id) || []);

  // Filter tracks based on search
  const filteredTracks = tracks.filter(track => {
    const query = searchQuery.toLowerCase();
    return (
      track.title.toLowerCase().includes(query) ||
      track.artist.toLowerCase().includes(query) ||
      track.album.toLowerCase().includes(query)
    );
  });

  const handleToggleTrack = (trackId: string) => {
    setSelectedTracks(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const availableTracks = filteredTracks.filter(t => !existingTrackIds.has(t.id));
    if (selectedTracks.size === availableTracks.length) {
      setSelectedTracks(new Set());
    } else {
      setSelectedTracks(new Set(availableTracks.map(t => t.id)));
    }
  };

  const handleAddTracks = () => {
    selectedTracks.forEach(trackId => {
      const track = tracks.find(t => t.id === trackId);
      if (track) {
        addTrackToPlaylist(playlistId, track);
      }
    });
    setSelectedTracks(new Set());
    setSearchQuery('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedTracks(new Set());
    setSearchQuery('');
    onOpenChange(false);
  };

  const availableCount = filteredTracks.filter(t => !existingTrackIds.has(t.id)).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus size={20} className="text-primary" />
            Adicionar Músicas
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar músicas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary/50"
          />
        </div>

        {/* Select All */}
        {availableCount > 0 && (
          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-muted-foreground">
              {selectedTracks.size} de {availableCount} selecionadas
            </span>
            <Button variant="ghost" size="sm" onClick={handleSelectAll}>
              {selectedTracks.size === availableCount ? 'Desmarcar' : 'Selecionar'} todas
            </Button>
          </div>
        )}

        {/* Track List */}
        <ScrollArea className="flex-1 min-h-0 max-h-[40vh]">
          {filteredTracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Music size={32} className="mb-2" />
              <p className="text-sm">Nenhuma música encontrada</p>
            </div>
          ) : (
            <div className="space-y-1 pr-3">
              {filteredTracks.map((track, index) => {
                const isInPlaylist = existingTrackIds.has(track.id);
                const isSelected = selectedTracks.has(track.id);

                return (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      isInPlaylist 
                        ? 'opacity-50 cursor-not-allowed' 
                        : isSelected 
                          ? 'bg-primary/10 border border-primary/30' 
                          : 'hover:bg-secondary/50 cursor-pointer'
                    }`}
                    onClick={() => !isInPlaylist && handleToggleTrack(track.id)}
                  >
                    <Checkbox
                      checked={isSelected || isInPlaylist}
                      disabled={isInPlaylist}
                      onCheckedChange={() => !isInPlaylist && handleToggleTrack(track.id)}
                      className="data-[state=checked]:bg-primary"
                    />
                    
                    <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                      {track.coverUrl ? (
                        <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Music size={16} className="text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{track.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                    </div>
                    
                    {isInPlaylist && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Check size={12} />
                        Adicionada
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAddTracks} 
            disabled={selectedTracks.size === 0}
            className="bg-primary"
          >
            <Plus size={16} className="mr-2" />
            Adicionar {selectedTracks.size > 0 ? `(${selectedTracks.size})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
