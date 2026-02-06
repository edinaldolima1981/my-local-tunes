import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Track } from '@/types/music';
import { scanMusicFiles, requestStoragePermissions } from '@/services/musicScanner';
import { mockTracks } from '@/data/mockTracks';
import { Capacitor } from '@capacitor/core';

export interface CustomAlbum {
  id: string;
  name: string;
  artist: string;
  coverUrl?: string;
  createdAt: number;
}

interface MusicLibraryContextType {
  tracks: Track[];
  customAlbums: CustomAlbum[];
  isScanning: boolean;
  scanProgress: number;
  scanStatus: string;
  error: string | null;
  rescan: () => Promise<void>;
  isNativePlatform: boolean;
  deleteTrack: (trackId: string) => void;
  deleteTracksByArtist: (artistName: string) => void;
  deleteTracksByAlbum: (albumName: string, artistName: string) => void;
  addTracksFromFiles: (files: FileList, albumName?: string, albumArtist?: string) => void;
  createAlbum: (name: string, artist?: string) => CustomAlbum;
  deleteCustomAlbum: (albumId: string) => void;
  updateAlbumCover: (albumName: string, artistName: string, coverUrl: string) => void;
}

const MusicLibraryContext = createContext<MusicLibraryContextType | null>(null);

// Gera um ID único para a track
function generateTrackId(fileName: string): string {
  return `file-${fileName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Extrai metadados básicos do nome do arquivo
function parseFileName(fileName: string): { title: string; artist: string } {
  // Remove extensão
  const nameWithoutExt = fileName.replace(/\.[^.]+$/, '');
  
  // Tenta extrair artista - título (formato comum)
  const dashMatch = nameWithoutExt.match(/^(.+?)\s*[-–]\s*(.+)$/);
  if (dashMatch) {
    return { artist: dashMatch[1].trim(), title: dashMatch[2].trim() };
  }
  
  return { title: nameWithoutExt, artist: 'Artista Desconhecido' };
}

// Converte File para Data URL (persistente)
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Converte imagem para Data URL comprimida (para capas)
function imageFileToDataUrl(file: File, maxWidth = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function MusicLibraryProvider({ children }: { children: ReactNode }) {
  // Carrega tracks salvos do localStorage
  const [tracks, setTracks] = useState<Track[]>(() => {
    const saved = localStorage.getItem('userTracks');
    return saved ? JSON.parse(saved) : [];
  });
  const [customAlbums, setCustomAlbums] = useState<CustomAlbum[]>(() => {
    const saved = localStorage.getItem('customAlbums');
    return saved ? JSON.parse(saved) : [];
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const isNativePlatform = Capacitor.isNativePlatform();

  // Salva álbuns customizados no localStorage
  useEffect(() => {
    localStorage.setItem('customAlbums', JSON.stringify(customAlbums));
  }, [customAlbums]);

  // Salva tracks do usuário no localStorage
  useEffect(() => {
    // Agora todas as URIs são Data URLs persistentes
    localStorage.setItem('userTracks', JSON.stringify(tracks));
  }, [tracks]);

  const scanMusic = async () => {
    // No modo web, não faz scan automático - usuário importa manualmente
    if (!isNativePlatform) {
      setScanStatus('Importe suas músicas para começar');
      return;
    }

    setIsScanning(true);
    setError(null);
    setScanProgress(0);
    setScanStatus('Verificando permissões...');

    try {
      const hasPermission = await requestStoragePermissions();
      
      if (!hasPermission) {
        setError('Permissão de armazenamento negada. Por favor, conceda permissão nas configurações do app.');
        setIsScanning(false);
        return;
      }

      const scannedTracks = await scanMusicFiles((count, status) => {
        setScanProgress(count);
        setScanStatus(status);
      });

      if (scannedTracks.length === 0) {
        setScanStatus('Nenhuma música encontrada no dispositivo');
      } else {
        setTracks(prev => [...prev, ...scannedTracks]);
        setScanStatus(`${scannedTracks.length} músicas encontradas`);
      }
    } catch (e) {
      console.error('Scan error:', e);
      setError('Erro ao escanear músicas');
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (isNativePlatform) {
      scanMusic();
    }
  }, []);

  const rescan = async () => {
    await scanMusic();
  };

  // Exclui uma música específica da lista
  const deleteTrack = (trackId: string) => {
    setTracks(prevTracks => prevTracks.filter(track => track.id !== trackId));
  };

  // Exclui todas as músicas de um artista
  const deleteTracksByArtist = (artistName: string) => {
    setTracks(prevTracks => prevTracks.filter(track => track.artist !== artistName));
  };

  // Exclui todas as músicas de um álbum específico
  const deleteTracksByAlbum = (albumName: string, artistName: string) => {
    setTracks(prevTracks => prevTracks.filter(
      track => !(track.album === albumName && track.artist === artistName)
    ));
  };

  // Extrai capa do álbum de arquivos de áudio (se disponível)
  const extractCoverFromAudio = async (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      // Tenta extrair metadados usando jsmediatags se disponível
      // Por enquanto, retorna undefined - a capa pode ser adicionada manualmente
      resolve(undefined);
    });
  };

  // Adiciona músicas a partir de arquivos selecionados pelo usuário
  const addTracksFromFiles = async (files: FileList, albumName?: string, albumArtist?: string) => {
    const targetAlbum = albumName || 'Músicas Importadas';
    const targetArtist = albumArtist || 'Artista Desconhecido';

    // Processa cada arquivo de forma assíncrona
    for (const file of Array.from(files)) {
      // Verifica se é um arquivo de áudio
      if (!file.type.startsWith('audio/')) continue;

      try {
        const { title } = parseFileName(file.name);
        
        // Converte para Data URL persistente (sobrevive ao refresh)
        const dataUrl = await fileToDataUrl(file);
        
        // Cria um áudio temporário para obter a duração
        const tempAudio = new Audio(dataUrl);
        
        const duration = await new Promise<number>((resolve) => {
          tempAudio.addEventListener('loadedmetadata', () => {
            resolve(tempAudio.duration || 0);
          });
          tempAudio.addEventListener('error', () => {
            resolve(0);
          });
        });

        const track: Track = {
          id: generateTrackId(file.name),
          title,
          artist: targetArtist,
          album: targetAlbum,
          duration,
          uri: dataUrl, // Data URL persistente
          coverUrl: undefined,
        };

        // Adiciona a track imediatamente
        setTracks(prevTracks => [...prevTracks, track]);
      } catch (error) {
        console.error('Erro ao processar arquivo:', file.name, error);
      }
    }
  };

  // Atualiza a capa de um álbum (e todas as músicas dele)
  const updateAlbumCover = (albumName: string, artistName: string, coverUrl: string) => {
    // Atualiza todas as tracks do álbum
    setTracks(prevTracks => 
      prevTracks.map(track => 
        track.album === albumName && track.artist === artistName
          ? { ...track, coverUrl }
          : track
      )
    );
    
    // Atualiza o álbum customizado se existir
    setCustomAlbums(prev => 
      prev.map(album => 
        album.name === albumName && album.artist === artistName
          ? { ...album, coverUrl }
          : album
      )
    );
  };

  // Cria um novo álbum customizado
  const createAlbum = (name: string, artist: string = 'Artista Desconhecido'): CustomAlbum => {
    const newAlbum: CustomAlbum = {
      id: `album-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      artist,
      createdAt: Date.now(),
    };
    setCustomAlbums(prev => [...prev, newAlbum]);
    return newAlbum;
  };

  // Exclui um álbum customizado e suas músicas
  const deleteCustomAlbum = (albumId: string) => {
    const album = customAlbums.find(a => a.id === albumId);
    if (album) {
      // Remove as músicas do álbum
      setTracks(prevTracks => prevTracks.filter(t => t.album !== album.name));
      // Remove o álbum customizado
      setCustomAlbums(prev => prev.filter(a => a.id !== albumId));
    }
  };

  return (
    <MusicLibraryContext.Provider
      value={{
        tracks,
        customAlbums,
        isScanning,
        scanProgress,
        scanStatus,
        error,
        rescan,
        isNativePlatform,
        deleteTrack,
        deleteTracksByArtist,
        deleteTracksByAlbum,
        addTracksFromFiles,
        createAlbum,
        deleteCustomAlbum,
        updateAlbumCover,
      }}
    >
      {children}
    </MusicLibraryContext.Provider>
  );
}

export function useMusicLibrary() {
  const context = useContext(MusicLibraryContext);
  if (!context) {
    throw new Error('useMusicLibrary must be used within a MusicLibraryProvider');
  }
  return context;
}