/**
 * @fileoverview Página principal do Music Player
 * 
 * Esta é a tela principal do aplicativo, contendo:
 * - Header com logo e controles
 * - Navegação por abas (Músicas, Artistas, Álbuns, Pastas, Playlists)
 * - Barra de busca
 * - Mini Player (quando há música tocando)
 * - Player em tela cheia (modal)
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Disc3, 
  Volume2, 
  RefreshCw, 
  User, 
  Disc, 
  FolderOpen, 
  ListMusic,
  Music,
  Search,
  Shield,
  Heart
} from 'lucide-react';

// Hooks
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import { useLibraryOrganization, Artist, Album } from '@/hooks/useLibraryOrganization';
import { usePlaylists } from '@/hooks/usePlaylists';

// Componentes do Player
import { TrackList } from '@/components/player/TrackList';
import { SearchBar } from '@/components/player/SearchBar';
import { VolumeControl } from '@/components/player/VolumeControl';
import { MiniPlayer } from '@/components/player/MiniPlayer';
import { FullscreenPlayer } from '@/components/player/FullscreenPlayer';

// Componentes da Biblioteca
import { ArtistList } from '@/components/library/ArtistList';
import { AlbumList } from '@/components/library/AlbumList';
import { PlaylistView } from '@/components/library/PlaylistView';
import { PlaylistDetail } from '@/components/library/PlaylistDetail';
import { CategoryDetail } from '@/components/library/CategoryDetail';
import { FavoritesList } from '@/components/library/FavoritesList';

// UI Components
import { PrivacyInfo } from '@/components/PrivacyInfo';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Equalizer } from '@/components/player/Equalizer';

// Types
import { Playlist, Track } from '@/types/music';

/** Visualizações disponíveis da biblioteca */
type LibraryView = 'main' | 'artist' | 'album' | 'playlist' | 'search';

/** Abas de navegação da biblioteca */
type LibraryTab = 'songs' | 'favorites' | 'artists' | 'albums' | 'playlists';

/**
 * Componente principal da aplicação
 * Gerencia o estado da UI e coordena os sub-componentes
 */
const Index = () => {
  // ============================================
  // Estado da UI
  // ============================================
  const [searchQuery, setSearchQuery] = useState('');
  const [showVolume, setShowVolume] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [libraryView, setLibraryView] = useState<LibraryView>('main');
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('songs');
  const [highlightedTrackId, setHighlightedTrackId] = useState<string | null>(null);
  
  // Estado de seleção para navegação detalhada
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // ============================================
  // Hooks
  // ============================================
  
  /** Hook do player de áudio - controla reprodução, fila, etc */
  const player = useAudioPlayer();
  
  /** Hook da biblioteca - escaneia e gerencia arquivos de música */
  const { tracks, customAlbums, isScanning, scanProgress, scanStatus, error, rescan } = useMusicLibrary();
  
  /** Hook de organização - agrupa por artista, álbum */
  const { artists, albums, searchTracks } = useLibraryOrganization(tracks, customAlbums);
  
  /** Hook de playlists */
  const { resolvePlaylists } = usePlaylists();

  // ============================================
  // Efeitos
  // ============================================

  /**
   * Resolve as tracks das playlists quando a biblioteca carrega
   */
  useEffect(() => {
    if (tracks.length > 0) {
      resolvePlaylists(tracks);
    }
  }, [tracks, resolvePlaylists]);

  /**
   * Carrega a fila de reprodução quando as músicas são escaneadas
   * Isso permite que o usuário comece a tocar imediatamente
   */
  useEffect(() => {
    if (tracks.length > 0 && player.queue.length === 0) {
      player.loadQueue(tracks, 0);
    }
  }, [tracks]);

  // ============================================
  // Dados Derivados
  // ============================================

  /** Filtra músicas baseado na busca do usuário */
  const filteredTracks = useMemo(() => {
    return searchTracks(searchQuery);
  }, [searchQuery, searchTracks]);

  // ============================================
  // Handlers
  // ============================================

  /**
   * Seleciona uma música da lista filtrada
   * Encontra o índice original para manter a fila correta
   */
  const handleTrackSelect = (index: number) => {
    const track = filteredTracks[index];
    const originalIndex = tracks.findIndex(t => t.id === track.id);
    player.loadQueue(tracks, originalIndex);
  };

  /**
   * Reproduz a partir de uma categoria (artista, álbum, etc)
   * Carrega apenas as músicas daquela categoria
   */
  const handlePlayFromCategory = (categoryTracks: Track[], index: number) => {
    player.loadQueue(categoryTracks, index);
  };

  /** Reproduz todas as músicas de uma categoria */
  const handlePlayAll = (tracksToPlay: Track[]) => {
    if (tracksToPlay.length > 0) {
      player.loadQueue(tracksToPlay, 0);
    }
  };

  /** Navega para os detalhes de um artista */
  const handleArtistSelect = (artist: Artist) => {
    setSelectedArtist(artist);
    setLibraryView('artist');
  };

  /** Navega para os detalhes de um álbum */
  const handleAlbumSelect = (album: Album) => {
    setSelectedAlbum(album);
    setLibraryView('album');
  };

  /** Navega para os detalhes de uma playlist */
  const handlePlaylistSelect = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setLibraryView('playlist');
  };

  /** Volta para a visualização principal da biblioteca */
  const handleBackToMain = () => {
    setLibraryView('main');
    setSelectedArtist(null);
    setSelectedAlbum(null);
    setSelectedPlaylist(null);
  };

  /** Navega para a aba de músicas com destaque na faixa selecionada */
  const handleGoToSongsWithHighlight = (track: Track) => {
    setHighlightedTrackId(track.id);
    setLibraryView('main');
    setLibraryTab('songs');
    setSearchQuery('');
    setSelectedArtist(null);
    setSelectedAlbum(null);
    setSelectedPlaylist(null);
    
    // Remove o destaque após alguns segundos
    setTimeout(() => {
      setHighlightedTrackId(null);
    }, 3000);
  };

  /** Calcula o progresso da música atual (0 a 1) */
  const progress = player.duration > 0 ? player.currentTime / player.duration : 0;

  const renderLibraryContent = () => {
    // Detail views
    if (libraryView === 'artist' && selectedArtist) {
      return (
        <CategoryDetail
          title={selectedArtist.name}
          tracks={selectedArtist.tracks}
          currentTrack={player.currentTrack}
          isPlaying={player.isPlaying}
          onBack={handleBackToMain}
          onPlayAll={handlePlayAll}
          onTrackSelect={(track, index, tracks) => handlePlayFromCategory(tracks, index)}
          onTrackDoubleClick={handleGoToSongsWithHighlight}
          onOpenFullscreen={() => setShowFullscreen(true)}
        />
      );
    }

    if (libraryView === 'album' && selectedAlbum) {
      return (
        <CategoryDetail
          title={selectedAlbum.name}
          subtitle={selectedAlbum.artist}
          tracks={selectedAlbum.tracks}
          currentTrack={player.currentTrack}
          isPlaying={player.isPlaying}
          onBack={handleBackToMain}
          onPlayAll={handlePlayAll}
          onTrackSelect={(track, index, tracks) => handlePlayFromCategory(tracks, index)}
          onTrackDoubleClick={handleGoToSongsWithHighlight}
          onOpenFullscreen={() => setShowFullscreen(true)}
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
          currentTrack={player.currentTrack}
          isPlaying={player.isPlaying}
          onBack={handleBackToMain}
          onPlayAll={handlePlayAll}
          onTrackSelect={(track, index, tracks) => handlePlayFromCategory(tracks, index)}
          onTrackDoubleClick={handleGoToSongsWithHighlight}
          onOpenFullscreen={() => setShowFullscreen(true)}
        />
      );
    }

    // Main library view with swipeable tabs
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
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {searchQuery ? (
          // Search results
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground px-1">
              <Search size={16} />
              <span>{filteredTracks.length} resultados para "{searchQuery}"</span>
            </div>
            <TrackList
              tracks={filteredTracks}
              currentTrack={player.currentTrack}
              isPlaying={player.isPlaying}
              onTrackSelect={handleTrackSelect}
            />
          </div>
        ) : (
          // Swipeable tabs
          <>
            {/* Tab labels */}
            <div className="flex items-center justify-between px-1">
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
                  onClick={rescan}
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
                  currentTrack={player.currentTrack}
                  isPlaying={player.isPlaying}
                  onTrackSelect={handleTrackSelect}
                  highlightedTrackId={highlightedTrackId}
                />
              )}
              {libraryTab === 'favorites' && (
                <FavoritesList
                  allTracks={tracks}
                  currentTrack={player.currentTrack}
                  isPlaying={player.isPlaying}
                  onTrackSelect={handleTrackSelect}
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
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-surface opacity-50 pointer-events-none" />
      
      <div className="relative z-10 pb-24">
        <div className="container max-w-lg mx-auto px-4 py-6 safe-area-inset">
          {/* Header */}
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: player.isPlaying ? 360 : 0 }}
                transition={{ duration: 3, repeat: player.isPlaying ? Infinity : 0, ease: "linear" }}
              >
                <Disc3 className="text-primary" size={32} />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-gradient-primary">Music Player</h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield size={10} />
                  100% Offline • {tracks.length} músicas
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Equalizer />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPrivacy(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Shield size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowVolume(!showVolume)}
                className={`transition-colors ${showVolume ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Volume2 size={22} />
              </Button>
            </div>
          </motion.header>

          {/* Volume Control */}
          <AnimatePresence>
            {showVolume && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <VolumeControl volume={player.volume} onVolumeChange={player.setVolumeLevel} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scanning Status */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 rounded-2xl bg-secondary/50 backdrop-blur-sm flex items-center gap-3 border border-border/50"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <RefreshCw className="animate-spin text-primary" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{scanStatus}</p>
                  <p className="text-xs text-muted-foreground">{scanProgress} arquivos encontrados</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Library Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {renderLibraryContent()}
          </motion.div>
        </div>
      </div>

      {/* Mini Player */}
      <AnimatePresence>
        {player.currentTrack && !showFullscreen && (
          <MiniPlayer
            track={player.currentTrack}
            isPlaying={player.isPlaying}
            progress={progress}
            onTogglePlay={player.togglePlay}
            onNext={player.handleNext}
            onExpand={() => setShowFullscreen(true)}
          />
        )}
      </AnimatePresence>

      {/* Fullscreen Player */}
      <FullscreenPlayer
        isOpen={showFullscreen}
        onClose={() => setShowFullscreen(false)}
        track={player.currentTrack}
        isPlaying={player.isPlaying}
        currentTime={player.currentTime}
        duration={player.duration}
        shuffle={player.shuffle}
        repeat={player.repeat}
        onTogglePlay={player.togglePlay}
        onPrevious={player.handlePrevious}
        onNext={player.handleNext}
        onSeek={player.seek}
        onToggleShuffle={player.toggleShuffle}
        onToggleRepeat={player.toggleRepeat}
      />

      {/* Privacy Info Dialog */}
      <PrivacyInfo isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </div>
  );
};

export default Index;
