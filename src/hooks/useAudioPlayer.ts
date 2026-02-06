import { useState, useCallback, useEffect, useRef } from 'react';
import { Track, RepeatMode } from '@/types/music';
import { audioPlayerService } from '@/services/audioPlayerService';

export function useAudioPlayer() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  
  const queueRef = useRef(queue);
  const queueIndexRef = useRef(queueIndex);
  const repeatRef = useRef(repeat);
  const shuffleRef = useRef(shuffle);

  // Keep refs in sync
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

  const playTrackInternal = useCallback(async (track: Track) => {
    await audioPlayerService.loadTrack(track);
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

  const loadQueue = useCallback((tracks: Track[], startIndex = 0) => {
    setQueue(tracks);
    setQueueIndex(startIndex);
    if (tracks[startIndex]) {
      playTrackInternal(tracks[startIndex]);
    }
  }, [playTrackInternal]);

  const playFromQueue = useCallback((index: number) => {
    if (queue[index]) {
      setQueueIndex(index);
      playTrackInternal(queue[index]);
    }
  }, [queue, playTrackInternal]);

  const playTrack = useCallback((track: Track) => {
    playTrackInternal(track);
  }, [playTrackInternal]);

  return {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    shuffle,
    repeat,
    queue,
    queueIndex,
    play,
    pause,
    togglePlay,
    seek,
    handleNext,
    handlePrevious,
    setVolumeLevel,
    toggleShuffle,
    toggleRepeat,
    loadQueue,
    playFromQueue,
    playTrack,
  };
}
