import { motion } from 'framer-motion';
import { User, ChevronRight } from 'lucide-react';
import { Artist } from '@/hooks/useLibraryOrganization';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ArtistListProps {
  artists: Artist[];
  onArtistSelect: (artist: Artist) => void;
}

export function ArtistList({ artists, onArtistSelect }: ArtistListProps) {
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
          <motion.button
            key={artist.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onArtistSelect(artist)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
          >
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
              {artist.coverUrl ? (
                <img src={artist.coverUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={24} className="text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{artist.name}</p>
              <p className="text-sm text-muted-foreground">
                {artist.trackCount} {artist.trackCount === 1 ? 'música' : 'músicas'}
              </p>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </motion.button>
        ))}
      </div>
    </ScrollArea>
  );
}
