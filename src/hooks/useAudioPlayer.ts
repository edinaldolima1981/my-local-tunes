import { useState, useRef, useCallback, useEffect } from 'react';
import { Track, RepeatMode } from '@/types/music';

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);

  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => handleNext();
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
    };
  }, []);

  const playTrack = useCallback((track: Track) => {
    if (audioRef.current) {
      audioRef.current.src = track.uri;
      audioRef.current.play();
      setCurrentTrack(track);
    }
  }, []);

  const play = useCallback(() => {
    audioRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (queue.length === 0) return;

    let nextIndex: number;
    
    if (repeat === 'one') {
      seek(0);
      play();
      return;
    }
    
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = (queueIndex + 1) % queue.length;
      if (nextIndex === 0 && repeat === 'off') {
        pause();
        return;
      }
    }
    
    setQueueIndex(nextIndex);
    playTrack(queue[nextIndex]);
  }, [queue, queueIndex, shuffle, repeat, playTrack, seek, play, pause]);

  const handlePrevious = useCallback(() => {
    if (queue.length === 0) return;

    if (currentTime > 3) {
      seek(0);
      return;
    }

    const prevIndex = queueIndex === 0 ? queue.length - 1 : queueIndex - 1;
    setQueueIndex(prevIndex);
    playTrack(queue[prevIndex]);
  }, [queue, queueIndex, currentTime, playTrack, seek]);

  const setVolumeLevel = useCallback((level: number) => {
    if (audioRef.current) {
      audioRef.current.volume = level;
      setVolume(level);
    }
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
      playTrack(tracks[startIndex]);
    }
  }, [playTrack]);

  const playFromQueue = useCallback((index: number) => {
    if (queue[index]) {
      setQueueIndex(index);
      playTrack(queue[index]);
    }
  }, [queue, playTrack]);

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
