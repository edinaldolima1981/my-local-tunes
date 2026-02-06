import { useMemo } from 'react';
import { Track } from '@/types/music';

export interface Artist {
  name: string;
  tracks: Track[];
  trackCount: number;
  coverUrl?: string;
}

export interface Album {
  name: string;
  artist: string;
  tracks: Track[];
  trackCount: number;
  coverUrl?: string;
}

export interface Folder {
  path: string;
  name: string;
  tracks: Track[];
  trackCount: number;
}

export function useLibraryOrganization(tracks: Track[]) {
  const artists = useMemo<Artist[]>(() => {
    const artistMap = new Map<string, Track[]>();
    
    tracks.forEach(track => {
      const artistName = track.artist || 'Artista Desconhecido';
      const existing = artistMap.get(artistName) || [];
      artistMap.set(artistName, [...existing, track]);
    });

    return Array.from(artistMap.entries())
      .map(([name, artistTracks]) => ({
        name,
        tracks: artistTracks,
        trackCount: artistTracks.length,
        coverUrl: artistTracks[0]?.coverUrl,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tracks]);

  const albums = useMemo<Album[]>(() => {
    const albumMap = new Map<string, { artist: string; tracks: Track[] }>();
    
    tracks.forEach(track => {
      const albumName = track.album || 'Álbum Desconhecido';
      const key = `${albumName}__${track.artist}`;
      const existing = albumMap.get(key);
      
      if (existing) {
        existing.tracks.push(track);
      } else {
        albumMap.set(key, {
          artist: track.artist || 'Artista Desconhecido',
          tracks: [track],
        });
      }
    });

    return Array.from(albumMap.entries())
      .map(([key, data]) => ({
        name: key.split('__')[0],
        artist: data.artist,
        tracks: data.tracks,
        trackCount: data.tracks.length,
        coverUrl: data.tracks[0]?.coverUrl,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tracks]);

  const folders = useMemo<Folder[]>(() => {
    const folderMap = new Map<string, Track[]>();
    
    tracks.forEach(track => {
      // Extract folder from URI
      const uri = track.uri || '';
      const parts = uri.split('/');
      parts.pop(); // Remove filename
      const folderPath = parts.slice(-2).join('/') || 'Raiz';
      const folderName = parts[parts.length - 1] || 'Raiz';
      
      const existing = folderMap.get(folderPath) || [];
      folderMap.set(folderPath, [...existing, track]);
    });

    return Array.from(folderMap.entries())
      .map(([path, folderTracks]) => ({
        path,
        name: path.split('/').pop() || 'Raiz',
        tracks: folderTracks,
        trackCount: folderTracks.length,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [tracks]);

  const searchTracks = (query: string): Track[] => {
    if (!query.trim()) return tracks;
    const lowerQuery = query.toLowerCase();
    return tracks.filter(
      track =>
        track.title.toLowerCase().includes(lowerQuery) ||
        track.artist.toLowerCase().includes(lowerQuery) ||
        track.album.toLowerCase().includes(lowerQuery)
    );
  };

  return {
    artists,
    albums,
    folders,
    searchTracks,
    totalTracks: tracks.length,
    totalArtists: artists.length,
    totalAlbums: albums.length,
  };
}
