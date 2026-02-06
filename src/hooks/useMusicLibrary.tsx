import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Track } from '@/types/music';
import { scanMusicFiles, requestStoragePermissions } from '@/services/musicScanner';
import { mockTracks } from '@/data/mockTracks';
import { Capacitor } from '@capacitor/core';

interface MusicLibraryContextType {
  tracks: Track[];
  isScanning: boolean;
  scanProgress: number;
  scanStatus: string;
  error: string | null;
  rescan: () => Promise<void>;
  isNativePlatform: boolean;
  deleteTrack: (trackId: string) => void;
  deleteTracksByArtist: (artistName: string) => void;
  deleteTracksByAlbum: (albumName: string, artistName: string) => void;
}

const MusicLibraryContext = createContext<MusicLibraryContextType | null>(null);

export function MusicLibraryProvider({ children }: { children: ReactNode }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const isNativePlatform = Capacitor.isNativePlatform();

  const scanMusic = async () => {
    setIsScanning(true);
    setError(null);
    setScanProgress(0);
    setScanStatus('Verificando permissões...');

    try {
      if (isNativePlatform) {
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
          setScanStatus('Nenhuma música encontrada');
          // Use mock tracks as fallback on native if no music found
          setTracks(mockTracks);
        } else {
          setTracks(scannedTracks);
          setScanStatus(`${scannedTracks.length} músicas encontradas`);
        }
      } else {
        // On web, use mock tracks
        setScanStatus('Usando músicas de demonstração');
        setTracks(mockTracks);
      }
    } catch (e) {
      console.error('Scan error:', e);
      setError('Erro ao escanear músicas');
      // Fallback to mock tracks
      setTracks(mockTracks);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    scanMusic();
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

  return (
    <MusicLibraryContext.Provider
      value={{
        tracks,
        isScanning,
        scanProgress,
        scanStatus,
        error,
        rescan,
        isNativePlatform,
        deleteTrack,
        deleteTracksByArtist,
        deleteTracksByAlbum,
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