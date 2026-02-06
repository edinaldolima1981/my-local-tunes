import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ListMusic, MoreVertical, Trash2, Edit2, Music } from 'lucide-react';
import { Playlist, Track } from '@/types/music';
import { usePlaylists } from '@/hooks/usePlaylists';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

interface PlaylistViewProps {
  onPlaylistSelect: (playlist: Playlist) => void;
}

export function PlaylistView({ onPlaylistSelect }: PlaylistViewProps) {
  const { playlists, createPlaylist, deletePlaylist, renamePlaylist } = usePlaylists();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (newName.trim()) {
      createPlaylist(newName.trim());
      setNewName('');
      setShowCreateDialog(false);
    }
  };

  const handleRename = () => {
    if (selectedPlaylist && newName.trim()) {
      renamePlaylist(selectedPlaylist.id, newName.trim());
      setNewName('');
      setShowRenameDialog(false);
      setSelectedPlaylist(null);
    }
  };

  const openRenameDialog = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setNewName(playlist.name);
    setShowRenameDialog(true);
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setShowCreateDialog(true)}
        variant="outline"
        className="w-full border-dashed border-primary/50 text-primary hover:bg-primary/10"
      >
        <Plus size={20} className="mr-2" />
        Criar Playlist
      </Button>

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <ListMusic size={40} className="mb-2" />
          <p>Nenhuma playlist criada</p>
          <p className="text-sm">Crie sua primeira playlist!</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-380px)]">
          <div className="space-y-1">
            {playlists.map((playlist, index) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <button
                  onClick={() => onPlaylistSelect(playlist)}
                  className="flex-1 flex items-center gap-3 text-left"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center overflow-hidden">
                    {playlist.coverUrl ? (
                      <img src={playlist.coverUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Music size={24} className="text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{playlist.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {playlist.tracks.length} {playlist.tracks.length === 1 ? 'música' : 'músicas'}
                    </p>
                  </div>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openRenameDialog(playlist)}>
                      <Edit2 size={16} className="mr-2" />
                      Renomear
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deletePlaylist(playlist.id)}
                      className="text-destructive"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Create Playlist Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Nova Playlist</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Nome da playlist"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="bg-secondary/50"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Playlist Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Renomear Playlist</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Novo nome"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            className="bg-secondary/50"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowRenameDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRename} disabled={!newName.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
