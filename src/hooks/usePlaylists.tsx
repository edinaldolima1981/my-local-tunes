import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Track, Playlist } from '@/types/music';
import {
  loadPlaylists,
  savePlaylists,
  createPlaylist as createPlaylistUtil,
  addTrackToPlaylist as addTrackUtil,
  removeTrackFromPlaylist as removeTrackUtil,
  deletePlaylist as deletePlaylistUtil,
  renamePlaylist as renamePlaylistUtil,
} from '@/services/playlistService';

interface PlaylistContextType {
  playlists: Playlist[];
  createPlaylist: (name: string, tracks?: Track[]) => Playlist;
  deletePlaylist: (playlistId: string) => void;
  renamePlaylist: (playlistId: string, newName: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  getPlaylist: (playlistId: string) => Playlist | undefined;
}

const PlaylistContext = createContext<PlaylistContextType | null>(null);

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    setPlaylists(loadPlaylists());
  }, []);

  useEffect(() => {
    if (playlists.length > 0) {
      savePlaylists(playlists);
    }
  }, [playlists]);

  const createPlaylist = useCallback((name: string, tracks: Track[] = []) => {
    const newPlaylist = createPlaylistUtil(name, tracks);
    setPlaylists(prev => [...prev, newPlaylist]);
    return newPlaylist;
  }, []);

  const deletePlaylist = useCallback((playlistId: string) => {
    setPlaylists(prev => deletePlaylistUtil(prev, playlistId));
  }, []);

  const renamePlaylist = useCallback((playlistId: string, newName: string) => {
    setPlaylists(prev =>
      prev.map(p => (p.id === playlistId ? renamePlaylistUtil(p, newName) : p))
    );
  }, []);

  const addTrackToPlaylist = useCallback((playlistId: string, track: Track) => {
    setPlaylists(prev =>
      prev.map(p => (p.id === playlistId ? addTrackUtil(p, track) : p))
    );
  }, []);

  const removeTrackFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists(prev =>
      prev.map(p => (p.id === playlistId ? removeTrackUtil(p, trackId) : p))
    );
  }, []);

  const getPlaylist = useCallback(
    (playlistId: string) => playlists.find(p => p.id === playlistId),
    [playlists]
  );

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        createPlaylist,
        deletePlaylist,
        renamePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        getPlaylist,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylists() {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylists must be used within a PlaylistProvider');
  }
  return context;
}
