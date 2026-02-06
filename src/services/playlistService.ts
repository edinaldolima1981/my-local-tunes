/**
 * @fileoverview Serviço de gerenciamento de playlists
 * 
 * Gerencia operações CRUD de playlists com persistência em localStorage.
 * Os dados são armazenados apenas localmente - nunca são enviados para servidores.
 */

import { Track, Playlist } from '@/types/music';

/** Chave usada para armazenar playlists no localStorage */
const PLAYLISTS_KEY = 'music_player_playlists';

/**
 * Carrega todas as playlists do localStorage
 * @returns Array de playlists ou array vazio se não houver dados
 */
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

/**
 * Salva todas as playlists no localStorage
 * @param playlists - Array de playlists a serem salvas
 */
export function savePlaylists(playlists: Playlist[]): void {
  try {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  } catch (e) {
    console.error('Failed to save playlists:', e);
  }
}

/**
 * Cria uma nova playlist
 * @param name - Nome da playlist
 * @param tracks - Faixas iniciais (opcional)
 * @returns Nova playlist com ID único
 */
export function createPlaylist(name: string, tracks: Track[] = []): Playlist {
  return {
    id: `playlist_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    name,
    tracks,
    coverUrl: tracks[0]?.coverUrl,
  };
}

/**
 * Adiciona uma faixa a uma playlist
 * Não adiciona duplicatas (verifica por ID)
 * 
 * @param playlist - Playlist alvo
 * @param track - Faixa a adicionar
 * @returns Playlist atualizada
 */
export function addTrackToPlaylist(playlist: Playlist, track: Track): Playlist {
  // Evita duplicatas
  if (playlist.tracks.some(t => t.id === track.id)) {
    return playlist;
  }
  return {
    ...playlist,
    tracks: [...playlist.tracks, track],
    coverUrl: playlist.coverUrl || track.coverUrl,
  };
}

/**
 * Remove uma faixa de uma playlist
 * @param playlist - Playlist alvo
 * @param trackId - ID da faixa a remover
 * @returns Playlist atualizada
 */
export function removeTrackFromPlaylist(playlist: Playlist, trackId: string): Playlist {
  return {
    ...playlist,
    tracks: playlist.tracks.filter(t => t.id !== trackId),
  };
}

/**
 * Remove uma playlist da lista
 * @param playlists - Lista atual de playlists
 * @param playlistId - ID da playlist a remover
 * @returns Lista atualizada sem a playlist removida
 */
export function deletePlaylist(playlists: Playlist[], playlistId: string): Playlist[] {
  return playlists.filter(p => p.id !== playlistId);
}

/**
 * Renomeia uma playlist
 * @param playlist - Playlist a renomear
 * @param newName - Novo nome
 * @returns Playlist com nome atualizado
 */
export function renamePlaylist(playlist: Playlist, newName: string): Playlist {
  return {
    ...playlist,
    name: newName,
  };
}
