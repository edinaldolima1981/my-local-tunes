import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Track } from '@/types/music';
import { scanMusicFiles, requestStoragePermissions } from '@/services/musicScanner';
import { Capacitor } from '@capacitor/core';
import {
  saveAudioFile,
  getAudioFile,
  deleteAudioFile,
  saveCoverImage,
  getCoverImage
} from '@/services/audioStorageService';

export interface CustomAlbum {
  id: string;
  name: string;
  artist: string;
  coverUrl?: string;
  createdAt: number;
}

// Metadados da track (sem o áudio em si)
interface TrackMetadata {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  hasAudio: boolean; // Indica se há áudio no IndexedDB
  mediaType?: 'audio' | 'video';
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
  updateAlbumMetadata: (oldName: string, oldArtist: string, newName: string, newArtist: string) => void;
}

const MusicLibraryContext = createContext<MusicLibraryContextType | null>(null);

// Gera um ID único para a track
function generateTrackId(fileName: string): string {
  return `file-${fileName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Extrai metadados básicos do nome do arquivo
function parseFileName(fileName: string): { title: string; artist: string } {
  const nameWithoutExt = fileName.replace(/\.[^.]+$/, '');
  const dashMatch = nameWithoutExt.match(/^(.+?)\s*[-–]\s*(.+)$/);
  if (dashMatch) {
    return { artist: dashMatch[1].trim(), title: dashMatch[2].trim() };
  }
  return { title: nameWithoutExt, artist: 'Artista Desconhecido' };
}

// Converte File para Data URL
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Converte imagem para Data URL comprimida
function imageFileToDataUrl(file: File, maxWidth = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
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
  // Carrega metadados de tracks salvos (sem o áudio)
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [customAlbums, setCustomAlbums] = useState<CustomAlbum[]>(() => {
    const saved = localStorage.getItem('customAlbums');
    return saved ? JSON.parse(saved) : [];
  });

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const isNativePlatform = Capacitor.isNativePlatform();

  // Carrega tracks do localStorage e recupera URIs do IndexedDB
  useEffect(() => {
    const loadTracks = async () => {
      try {
        const savedMetadata = localStorage.getItem('trackMetadata');
        if (!savedMetadata) {
          setIsLoaded(true);
          return;
        }

        const metadata: TrackMetadata[] = JSON.parse(savedMetadata);
        const loadedTracks: Track[] = [];

        for (const meta of metadata) {
          if (meta.hasAudio) {
            // Recupera o áudio do IndexedDB
            const audioDataUrl = await getAudioFile(meta.id);
            // Recupera a capa do álbum
            const albumKey = `${meta.album}__${meta.artist}`;
            const coverUrl = await getCoverImage(albumKey);

            if (audioDataUrl) {
              loadedTracks.push({
                id: meta.id,
                title: meta.title,
                artist: meta.artist,
                album: meta.album,
                duration: meta.duration,
                uri: audioDataUrl,
                coverUrl: coverUrl || undefined,
                mediaType: meta.mediaType || 'audio',
              });
            }
          }
        }

        setTracks(loadedTracks);
        console.log(`[MusicLibrary] Carregadas ${loadedTracks.length} músicas do armazenamento`);
      } catch (err) {
        console.error('Erro ao carregar músicas:', err);
      } finally {
        setIsLoaded(true);
      }
    };

    loadTracks();
  }, []);

  // Salva metadados no localStorage (apenas info básica, sem o áudio)
  useEffect(() => {
    if (!isLoaded) return;

    const metadata: TrackMetadata[] = tracks.map(t => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      album: t.album,
      duration: t.duration,
      hasAudio: !!t.uri,
      mediaType: t.mediaType,
    }));

    localStorage.setItem('trackMetadata', JSON.stringify(metadata));
  }, [tracks, isLoaded]);

  // Salva álbuns customizados no localStorage
  useEffect(() => {
    localStorage.setItem('customAlbums', JSON.stringify(customAlbums));
  }, [customAlbums]);

  const scanMusic = async () => {
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
        setError('Permissão de armazenamento negada.');
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
    if (isNativePlatform && isLoaded) {
      scanMusic();
    }
  }, [isLoaded]);

  const rescan = async () => {
    await scanMusic();
  };

  const deleteTrack = async (trackId: string) => {
    // Remove do IndexedDB
    await deleteAudioFile(trackId);
    // Remove do estado
    setTracks(prevTracks => prevTracks.filter(track => track.id !== trackId));
  };

  const deleteTracksByArtist = (artistName: string) => {
    const tracksToDelete = tracks.filter(t => t.artist === artistName);
    tracksToDelete.forEach(t => deleteAudioFile(t.id));
    setTracks(prevTracks => prevTracks.filter(track => track.artist !== artistName));
  };

  const deleteTracksByAlbum = (albumName: string, artistName: string) => {
    const tracksToDelete = tracks.filter(t => t.album === albumName && t.artist === artistName);
    tracksToDelete.forEach(t => deleteAudioFile(t.id));
    setTracks(prevTracks => prevTracks.filter(
      track => !(track.album === albumName && track.artist === artistName)
    ));
  };

  const addTracksFromFiles = async (files: FileList, albumName?: string, albumArtist?: string) => {
    const targetAlbum = albumName || 'Músicas Importadas';
    const targetArtist = albumArtist || 'Artista Desconhecido';

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) continue;

      try {
        const { title } = parseFileName(file.name);
        const trackId = generateTrackId(file.name);
        const mediaType = file.type.startsWith('video/') ? 'video' : 'audio';

        // Converte para Data URL
        const dataUrl = await fileToDataUrl(file);

        // Salva no IndexedDB (armazenamento grande)
        await saveAudioFile(trackId, dataUrl);

        // Obtém duração
        const tempMedia = mediaType === 'video' ? document.createElement('video') : new Audio();
        tempMedia.src = dataUrl;
        const duration = await new Promise<number>((resolve) => {
          tempMedia.addEventListener('loadedmetadata', () => resolve(tempMedia.duration || 0));
          tempMedia.addEventListener('error', () => resolve(0));
        });

        const track: Track = {
          id: trackId,
          title,
          artist: targetArtist,
          album: targetAlbum,
          duration,
          uri: dataUrl,
          coverUrl: undefined,
          mediaType,
        };

        setTracks(prevTracks => [...prevTracks, track]);
      } catch (error) {
        console.error('Erro ao processar arquivo:', file.name, error);
      }
    }
  };

  const updateAlbumCover = async (albumName: string, artistName: string, coverUrl: string) => {
    const albumKey = `${albumName}__${artistName}`;

    // Salva a capa no IndexedDB
    await saveCoverImage(albumKey, coverUrl);

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

  const updateAlbumMetadata = (oldName: string, oldArtist: string, newName: string, newArtist: string) => {
    // Atualiza todas as tracks do álbum
    setTracks(prevTracks =>
      prevTracks.map(track =>
        track.album === oldName && track.artist === oldArtist
          ? { ...track, album: newName, artist: newArtist }
          : track
      )
    );

    // Atualiza o álbum customizado, se existir
    setCustomAlbums(prevAlbums =>
      prevAlbums.map(album =>
        album.name === oldName && album.artist === oldArtist
          ? { ...album, name: newName, artist: newArtist }
          : album
      )
    );
  };

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

  const deleteCustomAlbum = (albumId: string) => {
    const album = customAlbums.find(a => a.id === albumId);
    if (album) {
      const tracksToDelete = tracks.filter(t => t.album === album.name);
      tracksToDelete.forEach(t => deleteAudioFile(t.id));
      setTracks(prevTracks => prevTracks.filter(t => t.album !== album.name));
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
        updateAlbumMetadata,
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
