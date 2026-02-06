/**
 * @fileoverview Serviço de áudio em background
 * 
 * Este serviço gerencia a reprodução de áudio quando o app está em segundo plano:
 * - Wake Lock para manter o dispositivo ativo durante reprodução
 * - Media Session API para controles do sistema operacional
 * - Suporte a Android (notificação) e iOS (Control Center)
 */

import { Capacitor } from '@capacitor/core';
import { Track } from '@/types/music';

/**
 * Serviço para gerenciar reprodução em background
 * Implementa Wake Lock e Media Session API
 */
class BackgroundAudioService {
  /** Referência ao wake lock (mantém dispositivo ativo) */
  private wakeLock: WakeLockSentinel | null = null;
  
  /** Flag indicando se o serviço foi inicializado */
  private isBackgroundEnabled = false;

  /**
   * Inicializa as capacidades de áudio em background
   * Deve ser chamado uma vez ao iniciar o player
   */
  async initialize(): Promise<void> {
    const platform = Capacitor.getPlatform();
    
    console.log(`[BackgroundAudio] Initializing for platform: ${platform}`);

    // Request wake lock para reprodução com tela desligada (web/PWA)
    if ('wakeLock' in navigator) {
      await this.requestWakeLock();
    }

    // Setup handler para mudança de visibilidade
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    this.isBackgroundEnabled = true;
    console.log('[BackgroundAudio] Background audio enabled');
  }

  /**
   * Solicita um wake lock para evitar que o dispositivo durma
   * durante a reprodução de áudio
   */
  private async requestWakeLock(): Promise<void> {
    try {
      if ('wakeLock' in navigator) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
   * Libera o wake lock (chamado quando o player para)
   */
  async releaseWakeLock(): Promise<void> {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
  }

  /**
   * Trata mudanças de visibilidade (app indo para background)
   * Reacquire wake lock quando o app volta ao foreground
   */
  private handleVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      if (this.isBackgroundEnabled && !this.wakeLock) {
        this.requestWakeLock();
      }
    }
  }

  /**
   * Atualiza as informações "Now Playing" para controles do SO
   * Isso atualiza a notificação no Android e Control Center no iOS
   * 
   * @param track - Faixa atual
   * @param isPlaying - Se está tocando
   * @param position - Posição atual em segundos
   * @param duration - Duração total em segundos
   */
  updateNowPlaying(track: Track, isPlaying: boolean, position: number, duration: number): void {
    if ('mediaSession' in navigator) {
      // Atualiza metadados
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

      // Atualiza estado de reprodução
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      // Atualiza posição (alguns navegadores suportam)
      try {
        navigator.mediaSession.setPositionState({
          duration: duration || 0,
          playbackRate: 1,
          position: Math.min(position, duration || 0),
        });
      } catch (e) {
        // Alguns navegadores não suportam setPositionState
      }
    }
  }

  /**
   * Registra handlers para ações da Media Session
   * Estes handlers respondem a controles do lock screen, fones, etc.
   * 
   * @param handlers - Objeto com callbacks para cada ação
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

    // Registra cada handler se fornecido
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
   * Retorna informações sobre a plataforma atual
   * Útil para lógica condicional baseada em plataforma
   */
  getPlatformInfo(): { platform: string; isNative: boolean } {
    const platform = Capacitor.getPlatform();
    return {
      platform,
      isNative: Capacitor.isNativePlatform(),
    };
  }
}

// Exporta instância singleton do serviço
export const backgroundAudioService = new BackgroundAudioService();
