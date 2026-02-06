import { Track, Playlist } from '@/types/music';

const PLAYLISTS_KEY = 'music_player_playlists';

export function loadPlaylists(): Playlist[] {
  try {
    const stored = localStorage.getItem(PLAYLISTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load playlists:', e);
  }
  return [];
}

export function savePlaylists(playlists: Playlist[]): void {
  try {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  } catch (e) {
    console.error('Failed to save playlists:', e);
  }
}

export function createPlaylist(name: string, tracks: Track[] = []): Playlist {
  return {
    id: `playlist_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    name,
    tracks,
    coverUrl: tracks[0]?.coverUrl,
  };
}

export function addTrackToPlaylist(playlist: Playlist, track: Track): Playlist {
  if (playlist.tracks.some(t => t.id === track.id)) {
    return playlist; // Track already exists
  }
  return {
    ...playlist,
    tracks: [...playlist.tracks, track],
    coverUrl: playlist.coverUrl || track.coverUrl,
  };
}

export function removeTrackFromPlaylist(playlist: Playlist, trackId: string): Playlist {
  return {
    ...playlist,
    tracks: playlist.tracks.filter(t => t.id !== trackId),
  };
}

export function deletePlaylist(playlists: Playlist[], playlistId: string): Playlist[] {
  return playlists.filter(p => p.id !== playlistId);
}

export function renamePlaylist(playlist: Playlist, newName: string): Playlist {
  return {
    ...playlist,
    name: newName,
  };
}
