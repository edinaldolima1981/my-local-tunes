import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { Track, Playlist } from '@/types/music';
import {
  loadPlaylists,
  savePlaylists,
  createPlaylist as createPlaylistUtil,
  addTrackToPlaylist as addTrackUtil,
  removeTrackFromPlaylist as removeTrackUtil,
  deletePlaylist as deletePlaylistUtil,
  renamePlaylist as renamePlaylistUtil,
  resolvePlaylistTracks,
} from '@/services/playlistService';

interface PlaylistContextType {
  playlists: Playlist[];
  createPlaylist: (name: string, tracks?: Track[]) => Playlist;
  deletePlaylist: (playlistId: string) => void;
  renamePlaylist: (playlistId: string, newName: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  getPlaylist: (playlistId: string) => Playlist | undefined;
  resolvePlaylists: (allTracks: Track[]) => void;
}

const PlaylistContext = createContext<PlaylistContextType | null>(null);

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isResolved, setIsResolved] = useState(false);
  const hasLoaded = useRef(false);

  // Carrega playlists do localStorage (apenas uma vez)
  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      const loaded = loadPlaylists();
      setPlaylists(loaded);
    }
  }, []);

  // Salva playlists quando mudam (após resolução)
  useEffect(() => {
    if (isResolved) {
      savePlaylists(playlists);
    }
  }, [playlists, isResolved]);

  // Resolve as tracks das playlists usando a biblioteca
  const resolvePlaylists = useCallback((allTracks: Track[]) => {
    if (allTracks.length === 0) return;
    
    setPlaylists(prev => {
      const resolved = prev.map(p => 
        resolvePlaylistTracks(p as Playlist & { _trackIds?: string[] }, allTracks)
      );
      return resolved;
    });
    setIsResolved(true);
  }, []);

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
        resolvePlaylists,
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
