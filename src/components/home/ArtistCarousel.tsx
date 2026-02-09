import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Artist } from '@/hooks/useLibraryOrganization';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

interface ArtistCarouselProps {
  artists: Artist[];
  onArtistSelect: (artist: Artist) => void;
}

export function ArtistCarousel({ artists, onArtistSelect }: ArtistCarouselProps) {
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  );

  // Filter artists that have cover art
  const featuredArtists = artists
    .filter(artist => artist.coverUrl || artist.tracks.some(t => t.coverUrl))
    .slice(0, 10);

  if (featuredArtists.length === 0) {
    return (
      <div className="aspect-[16/9] rounded-2xl bg-secondary/30 flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Nenhum artista com capa encontrado</p>
      </div>
    );
  }

  return (
    <Carousel
      plugins={[plugin.current]}
      className="w-full"
      opts={{
        align: 'start',
        loop: true,
      }}
    >
      <CarouselContent>
        {featuredArtists.map((artist, index) => {
          const coverUrl = artist.coverUrl || artist.tracks.find(t => t.coverUrl)?.coverUrl;

          return (
            <CarouselItem key={artist.name}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer group"
                onClick={() => onArtistSelect(artist)}
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: coverUrl ? `url(${coverUrl})` : undefined,
                    backgroundColor: !coverUrl ? 'hsl(var(--secondary))' : undefined,
                  }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-2xl font-bold text-white mb-1">{artist.name}</h3>
                  <p className="text-white/70 text-sm">
                    {artist.tracks.length} {artist.tracks.length === 1 ? 'música' : 'músicas'}
                  </p>
                </div>

                {/* Play Button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-4 bottom-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onArtistSelect(artist);
                  }}
                >
                  <Play size={20} className="text-primary-foreground ml-0.5" />
                </motion.button>
              </motion.div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
}
