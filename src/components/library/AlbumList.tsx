import { motion } from 'framer-motion';
import { Disc, ChevronRight } from 'lucide-react';
import { Album } from '@/hooks/useLibraryOrganization';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AlbumListProps {
  albums: Album[];
  onAlbumSelect: (album: Album) => void;
}

export function AlbumList({ albums, onAlbumSelect }: AlbumListProps) {
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
          <motion.button
            key={`${album.name}-${album.artist}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onAlbumSelect(album)}
            className="flex flex-col items-center p-3 rounded-xl hover:bg-secondary/50 transition-colors text-center"
          >
            <div className="w-full aspect-square rounded-lg bg-secondary flex items-center justify-center overflow-hidden mb-2">
              {album.coverUrl ? (
                <img src={album.coverUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <Disc size={40} className="text-muted-foreground" />
              )}
            </div>
            <p className="font-medium text-foreground truncate w-full text-sm">{album.name}</p>
            <p className="text-xs text-muted-foreground truncate w-full">{album.artist}</p>
          </motion.button>
        ))}
      </div>
    </ScrollArea>
  );
}
