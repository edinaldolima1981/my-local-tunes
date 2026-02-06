import { motion } from 'framer-motion';
import { Disc, Trash2 } from 'lucide-react';
import { Album } from '@/hooks/useLibraryOrganization';
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

interface AlbumListProps {
  albums: Album[];
  onAlbumSelect: (album: Album) => void;
}

export function AlbumList({ albums, onAlbumSelect }: AlbumListProps) {
  const { deleteTracksByAlbum } = useMusicLibrary();

  const handleDeleteAlbum = (album: Album, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteTracksByAlbum(album.name, album.artist);
    toast.success(`Álbum "${album.name}" removido da biblioteca`);
  };

  if (albums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <Disc size={40} className="mb-2" />
        <p>Nenhum álbum encontrado</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-320px)]">
      <div className="grid grid-cols-2 gap-3">
        {albums.map((album, index) => (
          <motion.div
            key={`${album.name}-${album.artist}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            className="relative flex flex-col items-center p-3 rounded-xl hover:bg-secondary/50 transition-colors text-center group"
          >
            <button
              onClick={() => onAlbumSelect(album)}
              className="w-full flex flex-col items-center"
            >
              {/* Capa do Álbum em Destaque */}
              <div className="relative w-full aspect-square rounded-xl bg-secondary flex items-center justify-center overflow-hidden mb-3 shadow-xl ring-2 ring-primary/10">
                {album.coverUrl ? (
                  <img src={album.coverUrl} alt={album.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Disc size={48} className="text-muted-foreground" />
                  </div>
                )}
                
                {/* Overlay com gradiente */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Número de músicas no canto */}
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                  {album.trackCount} {album.trackCount === 1 ? 'música' : 'músicas'}
                </div>
              </div>
              
              {/* Informações do Álbum */}
              <p className="font-semibold text-foreground truncate w-full text-sm">{album.name}</p>
              <p className="text-xs text-muted-foreground truncate w-full">{album.artist}</p>
            </button>

            {/* Botão Excluir Álbum */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-sm text-white hover:text-destructive hover:bg-destructive/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 size={16} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir álbum?</AlertDialogTitle>
                  <AlertDialogDescription>
                    O álbum "{album.name}" de {album.artist} ({album.trackCount} músicas) será removido da sua biblioteca. Esta ação não exclui os arquivos do dispositivo.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => handleDeleteAlbum(album, e)}
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