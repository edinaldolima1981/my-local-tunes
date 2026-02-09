import { motion } from 'framer-motion';
import { Disc3, Shield } from 'lucide-react';
import { Artist, Album } from '@/hooks/useLibraryOrganization';
import { ArtistCarousel } from './ArtistCarousel';
import { AlbumGrid } from './AlbumGrid';

interface HomeScreenProps {
  artists: Artist[];
  albums: Album[];
  tracksCount: number;
  isPlaying: boolean;
  onArtistSelect: (artist: Artist) => void;
  onAlbumSelect: (album: Album) => void;
}

export function HomeScreen({
  artists,
  albums,
  tracksCount,
  isPlaying,
  onArtistSelect,
  onAlbumSelect,
}: HomeScreenProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <motion.div
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
        >
          <Disc3 className="text-primary" size={32} />
        </motion.div>
        <div>
          <h1 className="text-2xl font-bold text-gradient-primary">Music Player</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Shield size={10} />
            100% Offline • {tracksCount} músicas
          </p>
        </div>
      </motion.header>

      {/* Artist Carousel */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold mb-3">Artistas em Destaque</h2>
        <ArtistCarousel artists={artists} onArtistSelect={onArtistSelect} />
      </motion.section>

      {/* Albums Grid */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold mb-3">Álbuns</h2>
        <AlbumGrid albums={albums} onAlbumSelect={onAlbumSelect} />
      </motion.section>
    </div>
  );
}
