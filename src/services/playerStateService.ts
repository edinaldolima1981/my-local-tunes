/**
 * @fileoverview Serviço de persistência do estado do player
 * 
 * Salva e restaura o estado do player para retomar a reprodução
 * quando o app é reaberto.
 */

import { Track, RepeatMode } from '@/types/music';

const PLAYER_STATE_KEY = 'music_player_state';

/** Estado persistido do player */
export interface PersistedPlayerState {
  /** Faixa que estava tocando */
  currentTrack: Track | null;
  /** Posição na faixa (segundos) */
  currentTime: number;
  /** Volume (0-1) */
  volume: number;
  /** Modo shuffle ativo */
  shuffle: boolean;
  /** Modo de repetição */
  repeat: RepeatMode;
  /** IDs das faixas na fila */
  queueIds: string[];
  /** Índice atual na fila */
  queueIndex: number;
  /** Timestamp do salvamento */
  savedAt: number;
}

/**
 * Salva o estado atual do player
 */
export function savePlayerState(state: {
  currentTrack: Track | null;
  currentTime: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  queue: Track[];
  queueIndex: number;
}): void {
  try {
    const persistedState: PersistedPlayerState = {
      currentTrack: state.currentTrack,
      currentTime: state.currentTime,
      volume: state.volume,
      shuffle: state.shuffle,
      repeat: state.repeat,
      queueIds: state.queue.map(t => t.id),
      queueIndex: state.queueIndex,
      savedAt: Date.now(),
    };
    
    localStorage.setItem(PLAYER_STATE_KEY, JSON.stringify(persistedState));
  } catch (e) {
    console.warn('[PlayerState] Failed to save state:', e);
  }
}

/**
 * Carrega o estado salvo do player
 * @returns Estado salvo ou null se não houver
 */
export function loadPlayerState(): PersistedPlayerState | null {
  try {
    const saved = localStorage.getItem(PLAYER_STATE_KEY);
    if (saved) {
      const state = JSON.parse(saved) as PersistedPlayerState;
      
      // Verifica se o estado não é muito antigo (7 dias)
      const maxAge = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - state.savedAt > maxAge) {
        clearPlayerState();
        return null;
      }
      
      return state;
    }
  } catch (e) {
    console.warn('[PlayerState] Failed to load state:', e);
  }
  return null;
}

/**
 * Limpa o estado salvo
 */
export function clearPlayerState(): void {
  try {
    localStorage.removeItem(PLAYER_STATE_KEY);
  } catch (e) {
    console.warn('[PlayerState] Failed to clear state:', e);
  }
}

/**
 * Restaura a fila a partir dos IDs salvos
 * @param savedIds - IDs das faixas salvas
 * @param availableTracks - Faixas disponíveis para matching
 * @returns Fila restaurada
 */
export function restoreQueue(savedIds: string[], availableTracks: Track[]): Track[] {
  const trackMap = new Map(availableTracks.map(t => [t.id, t]));
  
  return savedIds
    .map(id => trackMap.get(id))
    .filter((t): t is Track => t !== undefined);
}
