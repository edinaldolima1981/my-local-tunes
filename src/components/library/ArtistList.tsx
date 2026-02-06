import { motion } from 'framer-motion';
import { User, ChevronRight, Trash2 } from 'lucide-react';
import { Artist } from '@/hooks/useLibraryOrganization';
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

interface ArtistListProps {
  artists: Artist[];
  onArtistSelect: (artist: Artist) => void;
}

export function ArtistList({ artists, onArtistSelect }: ArtistListProps) {
  const { deleteTracksByArtist } = useMusicLibrary();

  const handleDeleteArtist = (artist: Artist, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTracksByArtist(artist.name);
    toast.success(`Artista "${artist.name}" removido da biblioteca`);
  };

  if (artists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <User size={40} className="mb-2" />
        <p>Nenhum artista encontrado</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-320px)]">
      <div className="space-y-1">
        {artists.map((artist, index) => (
          <motion.div
            key={artist.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
          >
            <button
              onClick={() => onArtistSelect(artist)}
              className="flex-1 flex items-center gap-3 text-left"
            >
              {/* Foto do Artista/Álbum */}
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center overflow-hidden shadow-lg ring-2 ring-primary/20">
                {artist.coverUrl ? (
                  <img src={artist.coverUrl} alt={artist.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={28} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate text-lg">{artist.name}</p>
                <p className="text-sm text-muted-foreground">
                  {artist.trackCount} {artist.trackCount === 1 ? 'música' : 'músicas'}
                </p>
              </div>
              <ChevronRight size={20} className="text-muted-foreground" />
            </button>

            {/* Botão Excluir Artista */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 size={18} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir artista?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Todas as {artist.trackCount} músicas de "{artist.name}" serão removidas da sua biblioteca. Esta ação não exclui os arquivos do dispositivo.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => handleDeleteArtist(artist, e)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}