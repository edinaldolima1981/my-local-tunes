/**
 * @fileoverview Tipos do domínio musical
 * Define as estruturas de dados principais do player de música
 */

/**
 * Representa uma faixa de áudio
 * @property id - Identificador único gerado a partir do caminho do arquivo
 * @property title - Título da música (extraído do nome do arquivo ou metadados)
 * @property artist - Nome do artista
 * @property album - Nome do álbum
 * @property duration - Duração em segundos (0 se não conhecido)
 * @property uri - URI do arquivo (file:// ou capacitor://)
 * @property coverUrl - URL da capa do álbum (opcional)
 */
export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  uri: string;
  coverUrl?: string;
}

/**
 * Representa uma playlist personalizada
 * @property id - Identificador único (UUID)
 * @property name - Nome da playlist definido pelo usuário
 * @property tracks - Lista de faixas na playlist
 * @property coverUrl - URL da capa (usa a primeira música se não definido)
 */
export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  coverUrl?: string;
}

/**
 * Modos de repetição do player
 * - 'off': Sem repetição - para no final da fila
 * - 'all': Repete toda a fila
 * - 'one': Repete a música atual
 */
export type RepeatMode = 'off' | 'all' | 'one';

/**
 * Estado completo do player de áudio
 * Usado para persistência e sincronização entre componentes
 */
export interface PlayerState {
  /** Faixa atualmente carregada (null se nenhuma) */
  currentTrack: Track | null;
  /** Se o áudio está tocando */
  isPlaying: boolean;
  /** Posição atual em segundos */
  currentTime: number;
  /** Duração total em segundos */
  duration: number;
  /** Volume (0.0 a 1.0) */
  volume: number;
  /** Se o modo aleatório está ativo */
  shuffle: boolean;
  /** Modo de repetição atual */
  repeat: RepeatMode;
  /** Lista de reprodução atual */
  queue: Track[];
  /** Índice da música atual na fila */
  queueIndex: number;
}
