import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, 
  User, 
  Disc, 
  ListMusic,
  Music,
  Search,
  Heart,
  Disc3,
  Shield,
  Home
} from 'lucide-react';

import { Track, Playlist } from '@/types/music';
import { Artist, Album } from '@/hooks/useLibraryOrganization';
import { TrackList } from '@/components/player/TrackList';
import { SearchBar } from '@/components/player/SearchBar';
import { ArtistList } from '@/components/library/ArtistList';
import { AlbumList } from '@/components/library/AlbumList';
import { PlaylistView } from '@/components/library/PlaylistView';
import { PlaylistDetail } from '@/components/library/PlaylistDetail';
import { CategoryDetail } from '@/components/library/CategoryDetail';
import { FavoritesList } from '@/components/library/FavoritesList';
import { Button } from '@/components/ui/button';

type LibraryView = 'main' | 'artist' | 'album' | 'playlist';
type LibraryTab = 'songs' | 'favorites' | 'artists' | 'albums' | 'playlists';

interface LibraryScreenProps {
  tracks: Track[];
  artists: Artist[];
  albums: Album[];
  currentTrack: Track | null;
  isPlaying: boolean;
  isScanning: boolean;
  onRescan: () => void;
  onTrackSelect: (index: number) => void;
  onPlayFromCategory: (tracks: Track[], index: number) => void;
  onPlayAll: (tracks: Track[]) => void;
  onOpenFullscreen: () => void;
  searchTracks: (query: string) => Track[];
  onGoHome: () => void;
  // Navigation from Home
  initialArtist?: Artist | null;
  initialAlbum?: Album | null;
  onClearInitial?: () => void;
}

export function LibraryScreen({
  tracks,
  artists,
  albums,
  currentTrack,
  isPlaying,
  isScanning,
  onRescan,
  onTrackSelect,
  onPlayFromCategory,
  onPlayAll,
  onOpenFullscreen,
  searchTracks,
  onGoHome,
  initialArtist,
  initialAlbum,
  onClearInitial,
}: LibraryScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [libraryView, setLibraryView] = useState<LibraryView>('main');
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('songs');
  const [highlightedTrackId, setHighlightedTrackId] = useState<string | null>(null);
  
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // Handle navigation from Home
  useEffect(() => {
    if (initialArtist) {
      setSelectedArtist(initialArtist);
      setLibraryView('artist');
      onClearInitial?.();
    } else if (initialAlbum) {
      setSelectedAlbum(initialAlbum);
      setLibraryView('album');
      onClearInitial?.();
    }
  }, [initialArtist, initialAlbum, onClearInitial]);

  const filteredTracks = useMemo(() => {
    return searchTracks(searchQuery);
  }, [searchQuery, searchTracks]);

  const handleTrackSelect = (index: number) => {
    const track = filteredTracks[index];
    const originalIndex = tracks.findIndex(t => t.id === track.id);
    onTrackSelect(originalIndex);
  };

  const handleArtistSelect = (artist: Artist) => {
    setSelectedArtist(artist);
    setLibraryView('artist');
  };

  const handleAlbumSelect = (album: Album) => {
    setSelectedAlbum(album);
    setLibraryView('album');
  };

  const handlePlaylistSelect = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setLibraryView('playlist');
  };

  const handleBackToMain = () => {
    setLibraryView('main');
    setSelectedArtist(null);
    setSelectedAlbum(null);
    setSelectedPlaylist(null);
  };

  const handleGoToSongsWithHighlight = (track: Track) => {
    setHighlightedTrackId(track.id);
    setLibraryView('main');
    setLibraryTab('songs');
    setSearchQuery('');
    setSelectedArtist(null);
    setSelectedAlbum(null);
    setSelectedPlaylist(null);
    
    setTimeout(() => {
      setHighlightedTrackId(null);
    }, 3000);
  };

  // Detail views
  if (libraryView === 'artist' && selectedArtist) {
    return (
      <CategoryDetail
        title={selectedArtist.name}
        tracks={selectedArtist.tracks}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onBack={handleBackToMain}
        onPlayAll={onPlayAll}
        onTrackSelect={(track, index, tracks) => onPlayFromCategory(tracks, index)}
        onTrackDoubleClick={handleGoToSongsWithHighlight}
        onOpenFullscreen={onOpenFullscreen}
      />
    );
  }

  if (libraryView === 'album' && selectedAlbum) {
    return (
      <CategoryDetail
        title={selectedAlbum.name}
        subtitle={selectedAlbum.artist}
        tracks={selectedAlbum.tracks}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onBack={handleBackToMain}
        onPlayAll={onPlayAll}
        onTrackSelect={(track, index, tracks) => onPlayFromCategory(tracks, index)}
        onTrackDoubleClick={handleGoToSongsWithHighlight}
        onOpenFullscreen={onOpenFullscreen}
        isAlbumView={true}
        albumName={selectedAlbum.name}
        albumArtist={selectedAlbum.artist}
      />
    );
  }

  if (libraryView === 'playlist' && selectedPlaylist) {
    return (
      <PlaylistDetail
        playlist={selectedPlaylist}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onBack={handleBackToMain}
        onPlayAll={onPlayAll}
        onTrackSelect={(track, index, tracks) => onPlayFromCategory(tracks, index)}
        onTrackDoubleClick={handleGoToSongsWithHighlight}
        onOpenFullscreen={onOpenFullscreen}
      />
    );
  }

  // Main library view
  const tabs: LibraryTab[] = ['songs', 'favorites', 'artists', 'albums', 'playlists'];
  const tabIndex = tabs.indexOf(libraryTab);
  
  const handleSwipe = (direction: number) => {
    const newIndex = tabIndex + direction;
    if (newIndex >= 0 && newIndex < tabs.length) {
      setLibraryTab(tabs[newIndex]);
    }
  };

  const tabLabels: Record<LibraryTab, string> = {
    songs: 'Músicas',
    favorites: 'Favoritos',
    artists: 'Artistas',
    albums: 'Álbuns',
    playlists: 'Playlists'
  };

  const tabIcons: Record<LibraryTab, React.ReactNode> = {
    songs: <Music size={14} />,
    favorites: <Heart size={14} />,
    artists: <User size={14} />,
    albums: <Disc size={14} />,
    playlists: <ListMusic size={14} />
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-2"
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
            Biblioteca • {tracks.length} músicas
          </p>
        </div>
      </motion.header>

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {searchQuery ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
            <Search size={16} />
            <span>{filteredTracks.length} resultados para "{searchQuery}"</span>
          </div>
          <TrackList
            tracks={filteredTracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTrackSelect={handleTrackSelect}
          />
        </div>
      ) : (
        <>
          {/* Tab labels with Home button */}
          <div className="flex items-center justify-between px-1">
            {/* Home button */}
            <button
              onClick={onGoHome}
              className="flex flex-col items-center gap-0.5 py-1 text-[10px] transition-all text-muted-foreground/60 hover:text-primary"
            >
              <Home size={14} />
              <span>Home</span>
            </button>
            
            {/* Library tabs */}
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setLibraryTab(tab)}
                className={`flex flex-col items-center gap-0.5 py-1 text-[10px] transition-all ${
                  libraryTab === tab 
                    ? 'text-primary font-medium' 
                    : 'text-muted-foreground/60'
                }`}
              >
                {tabIcons[tab]}
                <span>{tabLabels[tab]}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
            <span>
              {libraryTab === 'songs' && `${tracks.length} músicas`}
              {libraryTab === 'favorites' && 'Suas músicas favoritas'}
              {libraryTab === 'artists' && `${artists.length} artistas`}
              {libraryTab === 'albums' && `${albums.length} álbuns`}
              {libraryTab === 'playlists' && 'Suas playlists'}
            </span>
            {libraryTab === 'songs' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRescan}
                disabled={isScanning}
                className="text-primary hover:text-primary/80"
              >
                <RefreshCw size={16} className={`mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            )}
          </div>

          {/* Swipeable content area */}
          <motion.div
            key={libraryTab}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x > 80) handleSwipe(-1);
              else if (info.offset.x < -80) handleSwipe(1);
            }}
            className="touch-pan-y"
          >
            {libraryTab === 'songs' && (
              <TrackList
                tracks={tracks}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onTrackSelect={onTrackSelect}
                highlightedTrackId={highlightedTrackId}
              />
            )}
            {libraryTab === 'favorites' && (
              <FavoritesList
                allTracks={tracks}
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onTrackSelect={onTrackSelect}
                highlightedTrackId={highlightedTrackId}
              />
            )}
            {libraryTab === 'artists' && (
              <ArtistList artists={artists} onArtistSelect={handleArtistSelect} />
            )}
            {libraryTab === 'albums' && (
              <AlbumList albums={albums} onAlbumSelect={handleAlbumSelect} />
            )}
            {libraryTab === 'playlists' && (
              <PlaylistView onPlaylistSelect={handlePlaylistSelect} />
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}
