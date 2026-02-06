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
  Settings
} from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import { useLibraryOrganization, Artist, Album, Folder } from '@/hooks/useLibraryOrganization';
import { usePlaylists } from '@/hooks/usePlaylists';
import { TrackList } from '@/components/player/TrackList';
import { SearchBar } from '@/components/player/SearchBar';
import { VolumeControl } from '@/components/player/VolumeControl';
import { MiniPlayer } from '@/components/player/MiniPlayer';
import { FullscreenPlayer } from '@/components/player/FullscreenPlayer';
import { ArtistList } from '@/components/library/ArtistList';
import { AlbumList } from '@/components/library/AlbumList';
import { FolderList } from '@/components/library/FolderList';
import { PlaylistView } from '@/components/library/PlaylistView';
import { PlaylistDetail } from '@/components/library/PlaylistDetail';
import { CategoryDetail } from '@/components/library/CategoryDetail';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Playlist, Track } from '@/types/music';

type LibraryView = 'main' | 'artist' | 'album' | 'folder' | 'playlist' | 'search';
type LibraryTab = 'songs' | 'artists' | 'albums' | 'folders' | 'playlists';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showVolume, setShowVolume] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [libraryView, setLibraryView] = useState<LibraryView>('main');
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('songs');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  const player = useAudioPlayer();
  const { tracks, isScanning, scanProgress, scanStatus, error, rescan } = useMusicLibrary();
  const { artists, albums, folders, searchTracks } = useLibraryOrganization(tracks);

  // Auto-load queue when tracks change
  useEffect(() => {
    if (tracks.length > 0 && player.queue.length === 0) {
      player.loadQueue(tracks, 0);
    }
  }, [tracks]);

  const filteredTracks = useMemo(() => {
    return searchTracks(searchQuery);
  }, [searchQuery, searchTracks]);

  const handleTrackSelect = (index: number) => {
    const track = filteredTracks[index];
    const originalIndex = tracks.findIndex(t => t.id === track.id);
    player.loadQueue(tracks, originalIndex);
  };

  const handlePlayFromCategory = (categoryTracks: Track[], index: number) => {
    player.loadQueue(categoryTracks, index);
  };

  const handlePlayAll = (tracksToPlay: Track[]) => {
    if (tracksToPlay.length > 0) {
      player.loadQueue(tracksToPlay, 0);
    }
  };

  const handleArtistSelect = (artist: Artist) => {
    setSelectedArtist(artist);
    setLibraryView('artist');
  };

  const handleAlbumSelect = (album: Album) => {
    setSelectedAlbum(album);
    setLibraryView('album');
  };

  const handleFolderSelect = (folder: Folder) => {
    setSelectedFolder(folder);
    setLibraryView('folder');
  };

  const handlePlaylistSelect = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setLibraryView('playlist');
  };

  const handleBackToMain = () => {
    setLibraryView('main');
    setSelectedArtist(null);
    setSelectedAlbum(null);
    setSelectedFolder(null);
    setSelectedPlaylist(null);
  };

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
        />
      );
    }

    if (libraryView === 'folder' && selectedFolder) {
      return (
        <CategoryDetail
          title={selectedFolder.name}
          subtitle={selectedFolder.path}
          tracks={selectedFolder.tracks}
          currentTrack={player.currentTrack}
          isPlaying={player.isPlaying}
          onBack={handleBackToMain}
          onPlayAll={handlePlayAll}
          onTrackSelect={(track, index, tracks) => handlePlayFromCategory(tracks, index)}
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
        />
      );
    }

    // Main library view with tabs
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
          // Category tabs
          <>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
              {[
                { id: 'songs', label: 'Músicas', icon: Music },
                { id: 'artists', label: 'Artistas', icon: User },
                { id: 'albums', label: 'Álbuns', icon: Disc },
                { id: 'folders', label: 'Pastas', icon: FolderOpen },
                { id: 'playlists', label: 'Playlists', icon: ListMusic },
              ].map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant={libraryTab === id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setLibraryTab(id as LibraryTab)}
                  className={`flex-shrink-0 rounded-full px-4 transition-all duration-200 ${
                    libraryTab === id 
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                  }`}
                >
                  <Icon size={16} className="mr-1.5" />
                  {label}
                </Button>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
              <span>
                {libraryTab === 'songs' && `${tracks.length} músicas`}
                {libraryTab === 'artists' && `${artists.length} artistas`}
                {libraryTab === 'albums' && `${albums.length} álbuns`}
                {libraryTab === 'folders' && `${folders.length} pastas`}
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

            <AnimatePresence mode="wait">
              <motion.div
                key={libraryTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {libraryTab === 'songs' && (
                  <TrackList
                    tracks={tracks}
                    currentTrack={player.currentTrack}
                    isPlaying={player.isPlaying}
                    onTrackSelect={handleTrackSelect}
                  />
                )}
                {libraryTab === 'artists' && (
                  <ArtistList artists={artists} onArtistSelect={handleArtistSelect} />
                )}
                {libraryTab === 'albums' && (
                  <AlbumList albums={albums} onAlbumSelect={handleAlbumSelect} />
                )}
                {libraryTab === 'folders' && (
                  <FolderList folders={folders} onFolderSelect={handleFolderSelect} />
                )}
                {libraryTab === 'playlists' && (
                  <PlaylistView onPlaylistSelect={handlePlaylistSelect} />
                )}
              </motion.div>
            </AnimatePresence>
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
                <p className="text-xs text-muted-foreground">
                  {tracks.length} músicas
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowVolume(!showVolume)}
              className={`transition-colors ${showVolume ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Volume2 size={22} />
            </Button>
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
    </div>
  );
};

export default Index;
