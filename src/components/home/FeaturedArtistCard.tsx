import { motion } from 'framer-motion';
import { Play, ChevronRight } from 'lucide-react';
import { Artist } from '@/hooks/useLibraryOrganization';
import defaultCover from '@/assets/default-cover.jpg';

interface FeaturedArtistCardProps {
  artist: Artist;
  onSelect: (artist: Artist) => void;
  index: number;
}

export function FeaturedArtistCard({ artist, onSelect, index }: FeaturedArtistCardProps) {
  const coverUrl = artist.coverUrl || artist.tracks.find(t => t.coverUrl)?.coverUrl || defaultCover;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className="relative min-w-[280px] h-40 rounded-2xl overflow-hidden cursor-pointer group"
      onClick={() => onSelect(artist)}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
        style={{ backgroundImage: `url(${coverUrl})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      
      {/* Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-between">
        <div>
          <p className="text-xs text-primary font-medium uppercase tracking-wider mb-1">
            Artista em Destaque
          </p>
          <h3 className="text-xl font-bold text-white line-clamp-1">{artist.name}</h3>
          <p className="text-sm text-white/70 mt-1">
            {artist.tracks.length} {artist.tracks.length === 1 ? 'música' : 'músicas'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(artist);
            }}
          >
            <Play size={18} className="text-primary-foreground ml-0.5" />
          </motion.button>
          <span className="text-sm text-white/80 flex items-center gap-1 group-hover:text-primary transition-colors">
            Ver artista <ChevronRight size={16} />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
