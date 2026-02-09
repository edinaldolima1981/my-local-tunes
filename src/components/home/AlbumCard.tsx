import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Album } from '@/hooks/useLibraryOrganization';
import defaultCover from '@/assets/default-cover.jpg';

interface AlbumCardProps {
  album: Album;
  onSelect: (album: Album) => void;
  index: number;
  variant?: 'grid' | 'horizontal';
}

export function AlbumCard({ album, onSelect, index, variant = 'grid' }: AlbumCardProps) {
  if (variant === 'horizontal') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 + index * 0.05 }}
        className="min-w-[140px] cursor-pointer group"
        onClick={() => onSelect(album)}
      >
        <div className="relative aspect-square rounded-xl overflow-hidden mb-2 shadow-lg">
          <img
            src={album.coverUrl || defaultCover}
            alt={album.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Hover Play Button */}
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
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      className="group cursor-pointer"
      onClick={() => onSelect(album)}
    >
      <div className="relative aspect-square rounded-xl overflow-hidden mb-2 shadow-lg ring-1 ring-border/30">
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
  );
}
