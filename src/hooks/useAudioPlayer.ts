/**
 * @fileoverview Hook principal do player de áudio
 * 
 * Gerencia todo o estado de reprodução:
 * - Faixa atual e fila de reprodução
 * - Controles (play/pause/seek/next/prev)
 * - Modos shuffle e repeat
 * - Persistência automática do estado
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Track, RepeatMode } from '@/types/music';
import { audioPlayerService } from '@/services/audioPlayerService';
import { 
  savePlayerState, 
  loadPlayerState, 
  restoreQueue,
  PersistedPlayerState 
} from '@/services/playerStateService';

/** Intervalo para auto-save do estado (ms) */
const AUTO_SAVE_INTERVAL = 5000;

export function useAudioPlayer() {
  // ============================================
  // Estado do Player
  // ============================================
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isRestored, setIsRestored] = useState(false);
  
  // Refs para acesso em callbacks
  const queueRef = useRef(queue);
  const queueIndexRef = useRef(queueIndex);
  const repeatRef = useRef(repeat);
  const shuffleRef = useRef(shuffle);
  const savedStateRef = useRef<PersistedPlayerState | null>(null);

  // ============================================
  // Sincronização de Refs
  // ============================================
  
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    queueIndexRef.current = queueIndex;
  }, [queueIndex]);

  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  useEffect(() => {
    shuffleRef.current = shuffle;
  }, [shuffle]);

  // ============================================
  // Carregamento do Estado Salvo
  // ============================================

  useEffect(() => {
    const savedState = loadPlayerState();
    if (savedState) {
      savedStateRef.current = savedState;
      setVolume(savedState.volume);
      setShuffle(savedState.shuffle);
      setRepeat(savedState.repeat);
      audioPlayerService.setVolume(savedState.volume);
      console.log('[useAudioPlayer] State loaded from storage');
    }
  }, []);

  // ============================================
  // Auto-save do Estado
  // ============================================

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentTrack) {
        savePlayerState({
          currentTrack,
          currentTime: audioPlayerService.getCurrentTime(),
          volume,
          shuffle,
          repeat,
          queue,
          queueIndex,
        });
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [currentTrack, volume, shuffle, repeat, queue, queueIndex]);

  // Salva estado quando a faixa muda
  useEffect(() => {
    if (currentTrack) {
      savePlayerState({
        currentTrack,
        currentTime: 0,
        volume,
        shuffle,
        repeat,
        queue,
        queueIndex,
      });
    }
  }, [currentTrack]);

  // ============================================
  // Funções Internas
  // ============================================

  const playTrackInternal = useCallback(async (track: Track, seekTo?: number) => {
    await audioPlayerService.loadTrack(track);
    if (seekTo !== undefined && seekTo > 0) {
      await audioPlayerService.seek(seekTo);
    }
    await audioPlayerService.play();
    setCurrentTrack(track);
  }, []);

  const handleNext = useCallback(() => {
    const currentQueue = queueRef.current;
    const currentIndex = queueIndexRef.current;
    const currentRepeat = repeatRef.current;
    const currentShuffle = shuffleRef.current;

    if (currentQueue.length === 0) return;

    if (currentRepeat === 'one') {
      audioPlayerService.seek(0);
      audioPlayerService.play();
      return;
    }
    
    let nextIndex: number;
    
    if (currentShuffle) {
      nextIndex = Math.floor(Math.random() * currentQueue.length);
    } else {
      nextIndex = (currentIndex + 1) % currentQueue.length;
      if (nextIndex === 0 && currentRepeat === 'off') {
        audioPlayerService.pause();
        return;
      }
    }
    
    setQueueIndex(nextIndex);
    playTrackInternal(currentQueue[nextIndex]);
  }, [playTrackInternal]);

  const handlePrevious = useCallback(() => {
    const currentQueue = queueRef.current;
    const currentIndex = queueIndexRef.current;
    const currentPlayerTime = audioPlayerService.getCurrentTime();

    if (currentQueue.length === 0) return;

    if (currentPlayerTime > 3) {
      audioPlayerService.seek(0);
      return;
    }

    const prevIndex = currentIndex === 0 ? currentQueue.length - 1 : currentIndex - 1;
    setQueueIndex(prevIndex);
    playTrackInternal(currentQueue[prevIndex]);
  }, [playTrackInternal]);

  useEffect(() => {
    audioPlayerService.setCallbacks({
      onTimeUpdate: setCurrentTime,
      onDurationChange: setDuration,
      onEnded: handleNext,
      onPlayStateChange: setIsPlaying,
      onPrevious: handlePrevious,
      onNext: handleNext,
    });

    return () => {
      audioPlayerService.setCallbacks({});
    };
  }, [handleNext, handlePrevious]);

  const play = useCallback(() => {
    audioPlayerService.play();
  }, []);

  const pause = useCallback(() => {
    audioPlayerService.pause();
  }, []);

  const togglePlay = useCallback(() => {
    audioPlayerService.togglePlay();
  }, []);

  const seek = useCallback((time: number) => {
    audioPlayerService.seek(time);
    setCurrentTime(time);
  }, []);

  const setVolumeLevel = useCallback((level: number) => {
    audioPlayerService.setVolume(level);
    setVolume(level);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeat(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  /**
   * Carrega uma fila de reprodução
   * Se houver estado salvo, tenta restaurar a posição
   */
  const loadQueue = useCallback((tracks: Track[], startIndex = 0) => {
    setQueue(tracks);
    
    // Tenta restaurar estado salvo na primeira carga
    if (!isRestored && savedStateRef.current) {
      const savedState = savedStateRef.current;
      const restoredQueue = restoreQueue(savedState.queueIds, tracks);
      
      if (restoredQueue.length > 0 && savedState.currentTrack) {
        // Encontra a faixa salva na nova lista (com uri completo)
        const savedTrackWithUri = tracks.find(t => t.id === savedState.currentTrack?.id);
        
        if (savedTrackWithUri) {
          const savedTrackIndex = tracks.findIndex(t => t.id === savedState.currentTrack?.id);
          setQueueIndex(savedTrackIndex >= 0 ? savedTrackIndex : 0);
          // Define a track COM uri para que o fullscreen funcione
          setCurrentTrack(savedTrackWithUri);
          setCurrentTime(savedState.currentTime);
          // Carrega a faixa na posição salva, mas não inicia automaticamente
          audioPlayerService.loadTrack(savedTrackWithUri);
          audioPlayerService.seek(savedState.currentTime);
          setIsRestored(true);
          console.log('[useAudioPlayer] Restored to saved position with full track data');
          return;
        }
      }
    }
    
    setIsRestored(true);
    // Só inicia reprodução se for uma ação explícita do usuário (startIndex fornecido)
    // Não auto-play na primeira carga
    if (startIndex > 0 || !savedStateRef.current) {
      setQueueIndex(startIndex);
      if (tracks[startIndex]) {
        playTrackInternal(tracks[startIndex]);
      }
    } else if (tracks.length > 0) {
      // Na primeira carga sem estado salvo, apenas define a faixa sem tocar
      setQueueIndex(0);
      setCurrentTrack(tracks[0]);
    }
  }, [playTrackInternal, isRestored]);

  const playFromQueue = useCallback((index: number) => {
    if (queue[index]) {
      setQueueIndex(index);
      playTrackInternal(queue[index]);
    }
  }, [queue, playTrackInternal]);

  const playTrack = useCallback((track: Track) => {
    playTrackInternal(track);
  }, [playTrackInternal]);

  // ============================================
  // Retorno do Hook
  // ============================================

  return {
    // Estado
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    queue,
    queueIndex,
    isRestored,
    
    // Controles básicos
    play,
    pause,
    togglePlay,
    seek,
    
    // Navegação
    handleNext,
    handlePrevious,
    
    // Configurações
    setVolumeLevel,
    toggleShuffle,
    toggleRepeat,
    
    // Fila
    loadQueue,
    playFromQueue,
    playTrack,
  };
}
