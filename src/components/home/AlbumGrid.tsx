import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Album } from '@/hooks/useLibraryOrganization';
import defaultCover from '@/assets/default-cover.jpg';

interface AlbumGridProps {
  albums: Album[];
  onAlbumSelect: (album: Album) => void;
}

export function AlbumGrid({ albums, onAlbumSelect }: AlbumGridProps) {
  if (albums.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground text-sm">Nenhum álbum encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {albums.map((album, index) => (
        <motion.div
          key={`${album.name}-${album.artist}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="group cursor-pointer"
          onClick={() => onAlbumSelect(album)}
        >
          <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
            <img
              src={album.coverUrl || defaultCover}
              alt={album.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg"
              >
                <Play size={20} className="text-primary-foreground ml-0.5" />
              </motion.div>
            </div>
          </div>
          
          <h4 className="font-medium text-sm truncate">{album.name}</h4>
          <p className="text-xs text-muted-foreground truncate">{album.artist}</p>
        </motion.div>
      ))}
    </div>
  );
}
