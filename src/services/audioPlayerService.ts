import { Track, RepeatMode } from '@/types/music';
import { Capacitor } from '@capacitor/core';

class AudioPlayerService {
  private audio: HTMLAudioElement;
  private currentTrack: Track | null = null;
  private onTimeUpdate: ((time: number) => void) | null = null;
  private onDurationChange: ((duration: number) => void) | null = null;
  private onEnded: (() => void) | null = null;
  private onPlayStateChange: ((isPlaying: boolean) => void) | null = null;
  private onError: ((error: string) => void) | null = null;

  constructor() {
    this.audio = new Audio();
    this.setupEventListeners();
    this.setupMediaSession();
  }

  private setupEventListeners() {
    this.audio.addEventListener('timeupdate', () => {
      this.onTimeUpdate?.(this.audio.currentTime);
    });

    this.audio.addEventListener('durationchange', () => {
      if (!isNaN(this.audio.duration)) {
        this.onDurationChange?.(this.audio.duration);
      }
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (!isNaN(this.audio.duration)) {
        this.onDurationChange?.(this.audio.duration);
      }
    });

    this.audio.addEventListener('ended', () => {
      this.onEnded?.();
    });

    this.audio.addEventListener('play', () => {
      this.onPlayStateChange?.(true);
      this.updateMediaSessionState('playing');
    });

    this.audio.addEventListener('pause', () => {
      this.onPlayStateChange?.(false);
      this.updateMediaSessionState('paused');
    });

    this.audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      this.onError?.('Erro ao reproduzir áudio');
    });
  }

  private setupMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        this.play();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        this.pause();
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        // This will be handled by the hook
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        // This will be handled by the hook
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          this.seek(details.seekTime);
        }
      });

      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skipTime = details.seekOffset || 10;
        this.seek(Math.max(this.audio.currentTime - skipTime, 0));
      });

      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skipTime = details.seekOffset || 10;
        this.seek(Math.min(this.audio.currentTime + skipTime, this.audio.duration));
      });
    }
  }

  private updateMediaSessionState(state: 'playing' | 'paused' | 'none') {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state;
    }
  }

  private updateMediaSessionMetadata(track: Track) {
    if ('mediaSession' in navigator) {
      const artwork = track.coverUrl 
        ? [{ src: track.coverUrl, sizes: '512x512', type: 'image/jpeg' }]
        : [];

      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork,
      });
    }
  }

  private updateMediaSessionPosition() {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      try {
        navigator.mediaSession.setPositionState({
          duration: this.audio.duration || 0,
          playbackRate: this.audio.playbackRate,
          position: this.audio.currentTime,
        });
      } catch (e) {
        // Some browsers don't support this
      }
    }
  }

  setCallbacks(callbacks: {
    onTimeUpdate?: (time: number) => void;
    onDurationChange?: (duration: number) => void;
    onEnded?: () => void;
    onPlayStateChange?: (isPlaying: boolean) => void;
    onError?: (error: string) => void;
    onPrevious?: () => void;
    onNext?: () => void;
  }) {
    this.onTimeUpdate = callbacks.onTimeUpdate || null;
    this.onDurationChange = callbacks.onDurationChange || null;
    this.onEnded = callbacks.onEnded || null;
    this.onPlayStateChange = callbacks.onPlayStateChange || null;
    this.onError = callbacks.onError || null;

    // Setup media session handlers for prev/next
    if ('mediaSession' in navigator) {
      if (callbacks.onPrevious) {
        navigator.mediaSession.setActionHandler('previoustrack', callbacks.onPrevious);
      }
      if (callbacks.onNext) {
        navigator.mediaSession.setActionHandler('nexttrack', callbacks.onNext);
      }
    }
  }

  async loadTrack(track: Track): Promise<void> {
    this.currentTrack = track;
    this.audio.src = track.uri;
    this.audio.load();
    this.updateMediaSessionMetadata(track);
  }

  async play(): Promise<void> {
    try {
      await this.audio.play();
      this.updateMediaSessionPosition();
    } catch (e) {
      console.error('Play error:', e);
      this.onError?.('Erro ao reproduzir');
    }
  }

  async pause(): Promise<void> {
    this.audio.pause();
  }

  async togglePlay(): Promise<void> {
    if (this.audio.paused) {
      await this.play();
    } else {
      await this.pause();
    }
  }

  async seek(time: number): Promise<void> {
    this.audio.currentTime = time;
    this.updateMediaSessionPosition();
  }

  async setVolume(volume: number): Promise<void> {
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  getCurrentTime(): number {
    return this.audio.currentTime;
  }

  getDuration(): number {
    return this.audio.duration || 0;
  }

  isPlaying(): boolean {
    return !this.audio.paused;
  }

  getVolume(): number {
    return this.audio.volume;
  }

  getCurrentTrack(): Track | null {
    return this.currentTrack;
  }
}

export const audioPlayerService = new AudioPlayerService();
