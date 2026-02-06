import { Track, RepeatMode } from '@/types/music';
import { Capacitor } from '@capacitor/core';
import { backgroundAudioService } from './backgroundAudioService';

class AudioPlayerService {
  private audio: HTMLAudioElement;
  private currentTrack: Track | null = null;
  private onTimeUpdate: ((time: number) => void) | null = null;
  private onDurationChange: ((duration: number) => void) | null = null;
  private onEnded: (() => void) | null = null;
  private onPlayStateChange: ((isPlaying: boolean) => void) | null = null;
  private onError: ((error: string) => void) | null = null;
  private isInitialized = false;

  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    // Enable background audio on mobile
    (this.audio as any).webkitPreservesPitch = true;
    this.setupEventListeners();
    this.initializeBackgroundAudio();
  }

  private async initializeBackgroundAudio(): Promise<void> {
    if (this.isInitialized) return;
    
    await backgroundAudioService.initialize();
    this.isInitialized = true;
    
    console.log('[AudioPlayer] Service initialized with background support');
  }

  private setupEventListeners() {
    this.audio.addEventListener('timeupdate', () => {
      this.onTimeUpdate?.(this.audio.currentTime);
      this.updateNowPlaying();
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
      this.updateNowPlaying();
    });

    this.audio.addEventListener('pause', () => {
      this.onPlayStateChange?.(false);
      this.updateNowPlaying();
    });

    this.audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      const mediaError = this.audio.error;
      let errorMessage = 'Erro ao reproduzir áudio';
      
      if (mediaError) {
        switch (mediaError.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = 'Reprodução cancelada';
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'Erro de rede ao carregar áudio';
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = 'Formato de áudio não suportado';
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Arquivo de áudio não encontrado';
            break;
        }
      }
      
      this.onError?.(errorMessage);
    });

    // Handle audio focus on mobile
    this.audio.addEventListener('waiting', () => {
      console.log('[AudioPlayer] Buffering...');
    });

    this.audio.addEventListener('canplay', () => {
      console.log('[AudioPlayer] Ready to play');
    });
  }

  private updateNowPlaying(): void {
    if (this.currentTrack) {
      backgroundAudioService.updateNowPlaying(
        this.currentTrack,
        !this.audio.paused,
        this.audio.currentTime,
        this.audio.duration || 0
      );
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

    // Register all media session handlers through background service
    backgroundAudioService.registerActionHandlers({
      onPlay: () => this.play(),
      onPause: () => this.pause(),
      onPrevious: callbacks.onPrevious,
      onNext: callbacks.onNext,
      onSeek: (time) => this.seek(time),
      onSeekBackward: (offset) => this.seek(Math.max(this.audio.currentTime - offset, 0)),
      onSeekForward: (offset) => this.seek(Math.min(this.audio.currentTime + offset, this.audio.duration)),
      onStop: () => this.pause(),
    });
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
