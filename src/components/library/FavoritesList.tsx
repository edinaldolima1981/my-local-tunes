/**
 * @fileoverview Lista de músicas favoritas
 * 
 * Exibe as músicas marcadas como favoritas pelo usuário
 */

import { useMemo } from 'react';
import { Heart } from 'lucide-react';
import { Track } from '@/types/music';
import { useFavorites } from '@/hooks/useFavorites';
import { TrackList } from '@/components/player/TrackList';

interface FavoritesListProps {
  /** Todas as tracks da biblioteca */
  allTracks: Track[];
  /** Track sendo reproduzida */
  currentTrack: Track | null;
  /** Se está tocando */
  isPlaying: boolean;
  /** Callback quando seleciona uma track */
  onTrackSelect: (index: number) => void;
  /** ID da track destacada */
  highlightedTrackId?: string | null;
}

export function FavoritesList({
  allTracks,
  currentTrack,
  isPlaying,
  onTrackSelect,
  highlightedTrackId,
}: FavoritesListProps) {
  const { favoriteIds } = useFavorites();

  // Filtra apenas as músicas favoritas
  const favoriteTracks = useMemo(() => {
    return allTracks.filter(track => favoriteIds.has(track.id));
  }, [allTracks, favoriteIds]);

  if (favoriteTracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
          <Heart size={40} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Nenhuma música favorita
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Toque no ❤️ no player para adicionar músicas aos seus favoritos
        </p>
      </div>
    );
  }

  return (
    <TrackList
      tracks={favoriteTracks}
      currentTrack={currentTrack}
      isPlaying={isPlaying}
      onTrackSelect={onTrackSelect}
      highlightedTrackId={highlightedTrackId}
    />
  );
}
