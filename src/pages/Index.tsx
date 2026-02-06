import { useState, useMemo } from 'react';
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
  Search
} from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import { useLibraryOrganization, Artist, Album, Folder } from '@/hooks/useLibraryOrganization';
import { usePlaylists } from '@/hooks/usePlaylists';
import { AlbumArt } from '@/components/player/AlbumArt';
import { ProgressBar } from '@/components/player/ProgressBar';
import { PlayerControls } from '@/components/player/PlayerControls';
import { TrackInfo } from '@/components/player/TrackInfo';
import { TrackList } from '@/components/player/TrackList';
import { SearchBar } from '@/components/player/SearchBar';
import { VolumeControl } from '@/components/player/VolumeControl';
import { ArtistList } from '@/components/library/ArtistList';
import { AlbumList } from '@/components/library/AlbumList';
import { FolderList } from '@/components/library/FolderList';
import { PlaylistView } from '@/components/library/PlaylistView';
import { PlaylistDetail } from '@/components/library/PlaylistDetail';
import { CategoryDetail } from '@/components/library/CategoryDetail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Playlist, Track } from '@/types/music';

type LibraryView = 'main' | 'artist' | 'album' | 'folder' | 'playlist' | 'search';
type LibraryTab = 'songs' | 'artists' | 'albums' | 'folders' | 'playlists';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showVolume, setShowVolume] = useState(false);
  const [libraryView, setLibraryView] = useState<LibraryView>('main');
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('songs');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  const player = useAudioPlayer();
  const { tracks, isScanning, scanProgress, scanStatus, error, rescan, isNativePlatform } = useMusicLibrary();
  const { artists, albums, folders, searchTracks } = useLibraryOrganization(tracks);

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
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { id: 'songs', label: 'Músicas', icon: Music },
                { id: 'artists', label: 'Artistas', icon: User },
                { id: 'albums', label: 'Álbuns', icon: Disc },
                { id: 'folders', label: 'Pastas', icon: FolderOpen },
                { id: 'playlists', label: 'Playlists', icon: ListMusic },
              ].map(({ id, label, icon: Icon }) => (
                <Button
                  key={id}
                  variant={libraryTab === id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLibraryTab(id as LibraryTab)}
                  className={`flex-shrink-0 ${
                    libraryTab === id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'border-border hover:bg-secondary'
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
    <div className="min-h-screen bg-background safe-area-inset">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-surface opacity-50 pointer-events-none" />
      
      <div className="relative z-10 container max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <Disc3 className="text-primary animate-spin-slow" size={28} />
            <h1 className="text-2xl font-bold text-gradient-primary">Music Player</h1>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowVolume(!showVolume)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Volume2 size={20} />
          </Button>
        </motion.header>

        {/* Volume Control */}
        <AnimatePresence>
          {showVolume && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <VolumeControl volume={player.volume} onVolumeChange={player.setVolumeLevel} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Scanning Status */}
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 rounded-lg bg-secondary/50 flex items-center gap-3"
          >
            <RefreshCw className="animate-spin text-primary" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium">{scanStatus}</p>
              <p className="text-xs text-muted-foreground">{scanProgress} arquivos encontrados</p>
            </div>
          </motion.div>
        )}

        <Tabs defaultValue="player" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50">
            <TabsTrigger value="player" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Disc3 size={18} className="mr-2" />
              Player
            </TabsTrigger>
            <TabsTrigger value="library" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ListMusic size={18} className="mr-2" />
              Biblioteca
            </TabsTrigger>
          </TabsList>

          {/* Player View */}
          <TabsContent value="player" className="mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center space-y-6"
            >
              {/* Album Art */}
              <AlbumArt 
                coverUrl={player.currentTrack?.coverUrl} 
                isPlaying={player.isPlaying} 
              />

              {/* Track Info */}
              <TrackInfo track={player.currentTrack} />

              {/* Progress Bar */}
              <div className="w-full px-2">
                <ProgressBar
                  currentTime={player.currentTime}
                  duration={player.duration}
                  onSeek={player.seek}
                />
              </div>

              {/* Controls */}
              <PlayerControls
                isPlaying={player.isPlaying}
                shuffle={player.shuffle}
                repeat={player.repeat}
                onTogglePlay={player.togglePlay}
                onPrevious={player.handlePrevious}
                onNext={player.handleNext}
                onToggleShuffle={player.toggleShuffle}
                onToggleRepeat={player.toggleRepeat}
                disabled={!player.currentTrack}
              />
            </motion.div>
          </TabsContent>

          {/* Library View */}
          <TabsContent value="library" className="mt-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {renderLibraryContent()}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
