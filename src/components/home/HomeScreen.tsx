import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Artist, Album } from '@/hooks/useLibraryOrganization';
import { GreetingHeader } from './GreetingHeader';
import { QuickAccessGrid } from './QuickAccessGrid';
import { FeaturedArtistCard } from './FeaturedArtistCard';
import { AlbumCard } from './AlbumCard';
import { SectionHeader } from './SectionHeader';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface HomeScreenProps {
  artists: Artist[];
  albums: Album[];
  tracksCount: number;
  isPlaying: boolean;
  favoritesCount: number;
  onArtistSelect: (artist: Artist) => void;
  onAlbumSelect: (album: Album) => void;
  onQuickNavigate: (destination: 'favorites' | 'recent' | 'shuffle' | 'playlists') => void;
  onSeeAllArtists: () => void;
  onSeeAllAlbums: () => void;
}

export function HomeScreen({
  artists,
  albums,
  tracksCount,
  isPlaying,
  favoritesCount,
  onArtistSelect,
  onAlbumSelect,
  onQuickNavigate,
  onSeeAllArtists,
  onSeeAllAlbums,
}: HomeScreenProps) {
  // Filter featured artists (with covers)
  const featuredArtists = artists
    .filter(artist => artist.coverUrl || artist.tracks.some(t => t.coverUrl))
    .slice(0, 5);

  // Get recent/popular albums
  const displayAlbums = albums.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <GreetingHeader 
        tracksCount={tracksCount} 
        isPlaying={isPlaying} 
      />

      {/* Quick Access Cards */}
      <QuickAccessGrid 
        onNavigate={onQuickNavigate}
        favoritesCount={favoritesCount}
      />

      {/* Featured Artists - Horizontal Scroll */}
      {featuredArtists.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <SectionHeader 
            title="Artistas em Destaque" 
            onSeeAll={onSeeAllArtists}
            delay={0.2}
          />
          
          <div className="relative -mx-4">
            <ScrollArea className="w-full">
              <div className="flex gap-4 px-4 pb-4">
                {featuredArtists.map((artist, index) => (
                  <FeaturedArtistCard
                    key={artist.name}
                    artist={artist}
                    onSelect={onArtistSelect}
                    index={index}
                  />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        </motion.section>
      )}

      {/* Albums Section */}
      {displayAlbums.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <SectionHeader 
            title="Seus Álbuns" 
            onSeeAll={onSeeAllAlbums}
            delay={0.3}
          />
          
          <div className="grid grid-cols-2 gap-4">
            {displayAlbums.map((album, index) => (
              <AlbumCard
                key={`${album.name}-${album.artist}`}
                album={album}
                onSelect={onAlbumSelect}
                index={index}
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* Empty State */}
      {tracksCount === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <span className="text-4xl">🎵</span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhuma música ainda</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Adicione músicas ao seu dispositivo para começar a ouvir
          </p>
        </motion.div>
      )}
    </div>
  );
}
