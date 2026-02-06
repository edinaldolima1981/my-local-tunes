import { Capacitor } from '@capacitor/core';
import { Track } from '@/types/music';

/**
 * Background Audio Service
 * Handles native platform-specific audio configurations for background playback
 */
class BackgroundAudioService {
  private wakeLock: WakeLockSentinel | null = null;
  private isBackgroundEnabled = false;

  /**
   * Initialize background audio capabilities
   */
  async initialize(): Promise<void> {
    const platform = Capacitor.getPlatform();
    
    console.log(`[BackgroundAudio] Initializing for platform: ${platform}`);

    // Request wake lock for screen-off playback (web/PWA)
    if ('wakeLock' in navigator) {
      await this.requestWakeLock();
    }

    // Setup visibility change handler
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    this.isBackgroundEnabled = true;
    console.log('[BackgroundAudio] Background audio enabled');
  }

  /**
   * Request a wake lock to prevent device sleep during playback
   */
  private async requestWakeLock(): Promise<void> {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        console.log('[BackgroundAudio] Wake lock acquired');

        this.wakeLock?.addEventListener('release', () => {
          console.log('[BackgroundAudio] Wake lock released');
        });
      }
    } catch (e) {
      console.warn('[BackgroundAudio] Wake lock not available:', e);
    }
  }

  /**
   * Release wake lock
   */
  async releaseWakeLock(): Promise<void> {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
  }

  /**
   * Handle visibility changes (app going to background)
   */
  private handleVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      // App came to foreground - reacquire wake lock if needed
      if (this.isBackgroundEnabled && !this.wakeLock) {
        this.requestWakeLock();
      }
    }
  }

  /**
   * Update Now Playing info for native OS controls
   */
  updateNowPlaying(track: Track, isPlaying: boolean, position: number, duration: number): void {
    if ('mediaSession' in navigator) {
      // Update metadata
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: track.coverUrl 
          ? [
              { src: track.coverUrl, sizes: '96x96', type: 'image/jpeg' },
              { src: track.coverUrl, sizes: '128x128', type: 'image/jpeg' },
              { src: track.coverUrl, sizes: '192x192', type: 'image/jpeg' },
              { src: track.coverUrl, sizes: '256x256', type: 'image/jpeg' },
              { src: track.coverUrl, sizes: '384x384', type: 'image/jpeg' },
              { src: track.coverUrl, sizes: '512x512', type: 'image/jpeg' },
            ]
          : [],
      });

      // Update playback state
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      // Update position state
      try {
        navigator.mediaSession.setPositionState({
          duration: duration || 0,
          playbackRate: 1,
          position: Math.min(position, duration || 0),
        });
      } catch (e) {
        // Some browsers don't support setPositionState
      }
    }
  }

  /**
   * Register media session action handlers
   */
  registerActionHandlers(handlers: {
    onPlay?: () => void;
    onPause?: () => void;
    onPrevious?: () => void;
    onNext?: () => void;
    onSeek?: (time: number) => void;
    onSeekBackward?: (offset: number) => void;
    onSeekForward?: (offset: number) => void;
    onStop?: () => void;
  }): void {
    if (!('mediaSession' in navigator)) return;

    const session = navigator.mediaSession;

    if (handlers.onPlay) {
      session.setActionHandler('play', handlers.onPlay);
    }
    if (handlers.onPause) {
      session.setActionHandler('pause', handlers.onPause);
    }
    if (handlers.onPrevious) {
      session.setActionHandler('previoustrack', handlers.onPrevious);
    }
    if (handlers.onNext) {
      session.setActionHandler('nexttrack', handlers.onNext);
    }
    if (handlers.onSeek) {
      session.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          handlers.onSeek!(details.seekTime);
        }
      });
    }
    if (handlers.onSeekBackward) {
      session.setActionHandler('seekbackward', (details) => {
        handlers.onSeekBackward!(details.seekOffset || 10);
      });
    }
    if (handlers.onSeekForward) {
      session.setActionHandler('seekforward', (details) => {
        handlers.onSeekForward!(details.seekOffset || 10);
      });
    }
    if (handlers.onStop) {
      session.setActionHandler('stop', handlers.onStop);
    }

    console.log('[BackgroundAudio] Media session handlers registered');
  }

  /**
   * Get platform info
   */
  getPlatformInfo(): { platform: string; isNative: boolean } {
    const platform = Capacitor.getPlatform();
    return {
      platform,
      isNative: Capacitor.isNativePlatform(),
    };
  }
}

export const backgroundAudioService = new BackgroundAudioService();
