/**
 * @fileoverview Serviço de Equalizador de Áudio
 * 
 * Implementa um equalizador de 5 bandas usando Web Audio API:
 * - 60Hz (Bass)
 * - 230Hz (Low-Mid)
 * - 910Hz (Mid)
 * - 4kHz (High-Mid)
 * - 14kHz (Treble)
 */

/** Configuração de uma banda do equalizador */
export interface EqualizerBand {
  frequency: number;
  gain: number;
  label: string;
}

/** Preset de equalizador */
export interface EqualizerPreset {
  name: string;
  gains: number[];
}

/** Frequências padrão do equalizador (5 bandas) */
const DEFAULT_FREQUENCIES = [60, 230, 910, 4000, 14000];

/** Labels das bandas */
const BAND_LABELS = ['60Hz', '230Hz', '910Hz', '4kHz', '14kHz'];

/** Presets de equalizador */
export const EQUALIZER_PRESETS: EqualizerPreset[] = [
  { name: 'Flat', gains: [0, 0, 0, 0, 0] },
  { name: 'Bass Boost', gains: [6, 4, 0, 0, 0] },
  { name: 'Treble Boost', gains: [0, 0, 0, 4, 6] },
  { name: 'Rock', gains: [4, 2, -1, 3, 5] },
  { name: 'Pop', gains: [-1, 2, 4, 2, -1] },
  { name: 'Jazz', gains: [3, 1, -2, 2, 4] },
  { name: 'Classical', gains: [4, 2, -1, 2, 4] },
  { name: 'Electronic', gains: [5, 3, 0, 2, 4] },
  { name: 'Vocal', gains: [-2, 0, 4, 3, 1] },
];

const EQUALIZER_KEY = 'music_player_equalizer';

class EqualizerService {
  private audioContext: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private filters: BiquadFilterNode[] = [];
  private bands: EqualizerBand[] = [];
  private isConnected = false;
  private currentPreset = 'Flat';

  constructor() {
    this.initializeBands();
    this.loadSettings();
  }

  /** Inicializa as bandas com valores padrão */
  private initializeBands(): void {
    this.bands = DEFAULT_FREQUENCIES.map((freq, index) => ({
      frequency: freq,
      gain: 0,
      label: BAND_LABELS[index],
    }));
  }

  /** Carrega configurações salvas */
  private loadSettings(): void {
    try {
      const saved = localStorage.getItem(EQUALIZER_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.gains && Array.isArray(data.gains)) {
          data.gains.forEach((gain: number, index: number) => {
            if (this.bands[index]) {
              this.bands[index].gain = gain;
            }
          });
        }
        if (data.preset) {
          this.currentPreset = data.preset;
        }
      }
    } catch (e) {
      console.warn('[Equalizer] Failed to load settings:', e);
    }
  }

  /** Salva configurações atuais */
  private saveSettings(): void {
    try {
      const data = {
        gains: this.bands.map(b => b.gain),
        preset: this.currentPreset,
      };
      localStorage.setItem(EQUALIZER_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[Equalizer] Failed to save settings:', e);
    }
  }

  /**
   * Conecta o equalizador a um elemento de áudio
   * @param audioElement - Elemento HTML de áudio
   */
  connect(audioElement: HTMLAudioElement): void {
    if (this.isConnected) return;

    try {
      // Cria contexto de áudio
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Cria source node a partir do elemento de áudio
      this.sourceNode = this.audioContext.createMediaElementSource(audioElement);
      
      // Cria filtros para cada banda
      this.filters = this.bands.map((band, index) => {
        const filter = this.audioContext!.createBiquadFilter();
        
        // Define tipo de filtro baseado na posição
        if (index === 0) {
          filter.type = 'lowshelf';
        } else if (index === this.bands.length - 1) {
          filter.type = 'highshelf';
        } else {
          filter.type = 'peaking';
        }
        
        filter.frequency.value = band.frequency;
        filter.gain.value = band.gain;
        filter.Q.value = 1;
        
        return filter;
      });

      // Conecta em cadeia: source -> filters -> destination
      let currentNode: AudioNode = this.sourceNode;
      
      for (const filter of this.filters) {
        currentNode.connect(filter);
        currentNode = filter;
      }
      
      currentNode.connect(this.audioContext.destination);
      
      this.isConnected = true;
      console.log('[Equalizer] Connected to audio element');
    } catch (e) {
      console.error('[Equalizer] Failed to connect:', e);
    }
  }

  /**
   * Desconecta o equalizador
   */
  disconnect(): void {
    if (!this.isConnected) return;

    try {
      this.sourceNode?.disconnect();
      this.filters.forEach(f => f.disconnect());
      this.audioContext?.close();
      
      this.sourceNode = null;
      this.filters = [];
      this.audioContext = null;
      this.isConnected = false;
      
      console.log('[Equalizer] Disconnected');
    } catch (e) {
      console.error('[Equalizer] Failed to disconnect:', e);
    }
  }

  /**
   * Define o ganho de uma banda específica
   * @param bandIndex - Índice da banda (0-4)
   * @param gain - Ganho em dB (-12 a +12)
   */
  setBandGain(bandIndex: number, gain: number): void {
    if (bandIndex < 0 || bandIndex >= this.bands.length) return;
    
    // Limita o ganho entre -12 e +12 dB
    const clampedGain = Math.max(-12, Math.min(12, gain));
    
    this.bands[bandIndex].gain = clampedGain;
    
    if (this.filters[bandIndex]) {
      this.filters[bandIndex].gain.value = clampedGain;
    }
    
    this.currentPreset = 'Custom';
    this.saveSettings();
  }

  /**
   * Aplica um preset de equalizador
   * @param presetName - Nome do preset
   */
  applyPreset(presetName: string): void {
    const preset = EQUALIZER_PRESETS.find(p => p.name === presetName);
    if (!preset) return;

    preset.gains.forEach((gain, index) => {
      this.bands[index].gain = gain;
      if (this.filters[index]) {
        this.filters[index].gain.value = gain;
      }
    });

    this.currentPreset = presetName;
    this.saveSettings();
  }

  /**
   * Reseta o equalizador para flat
   */
  reset(): void {
    this.applyPreset('Flat');
  }

  /**
   * Retorna as bandas atuais
   */
  getBands(): EqualizerBand[] {
    return [...this.bands];
  }

  /**
   * Retorna o preset atual
   */
  getCurrentPreset(): string {
    return this.currentPreset;
  }

  /**
   * Verifica se o equalizador está conectado
   */
  getIsConnected(): boolean {
    return this.isConnected;
  }
}

// Exporta instância singleton
export const equalizerService = new EqualizerService();
