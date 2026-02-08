import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { Track } from '@/types/music';

// Supported audio file extensions
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'];

// Common music directories to scan
const MUSIC_DIRECTORIES = [
  'Music',
  'Download',
  'Downloads',
  'DCIM',
  'Audio',
];

function isAudioFile(filename: string): boolean {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  return AUDIO_EXTENSIONS.includes(ext);
}

function generateTrackId(path: string): string {
  return btoa(path).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
}

function extractTrackInfo(filename: string, path: string): Partial<Track> {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  // Try to parse "Artist - Title" format
  const parts = nameWithoutExt.split(' - ');
  
  if (parts.length >= 2) {
    return {
      artist: parts[0].trim(),
      title: parts.slice(1).join(' - ').trim(),
      album: 'Músicas Locais',
    };
  }
  
  return {
    title: nameWithoutExt,
    artist: 'Artista Desconhecido',
    album: 'Músicas Locais',
  };
}

async function scanDirectory(
  path: string,
  directory: Directory,
  onProgress?: (scanned: number) => void
): Promise<Track[]> {
  const tracks: Track[] = [];
  let scannedCount = 0;

  async function scanRecursive(currentPath: string): Promise<void> {
    try {
      const result = await Filesystem.readdir({
        path: currentPath,
        directory,
      });

      for (const file of result.files) {
        const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;
        
        if (file.type === 'directory') {
          await scanRecursive(filePath);
        } else if (isAudioFile(file.name)) {
          try {
            const uri = await Filesystem.getUri({
              path: filePath,
              directory,
            });

            const trackInfo = extractTrackInfo(file.name, filePath);
            
            tracks.push({
              id: generateTrackId(filePath),
              title: trackInfo.title || file.name,
              artist: trackInfo.artist || 'Artista Desconhecido',
              album: trackInfo.album || 'Álbum Desconhecido',
              duration: 0, // Will be updated when played
              uri: Capacitor.convertFileSrc(uri.uri),
              mediaType: 'audio',
            });

            scannedCount++;
            onProgress?.(scannedCount);
          } catch (e) {
            console.warn(`Failed to get URI for ${filePath}:`, e);
          }
        }
      }
    } catch (e) {
      // Directory doesn't exist or permission denied
      console.warn(`Failed to scan directory ${currentPath}:`, e);
    }
  }

  await scanRecursive(path);
  return tracks;
}

export async function scanMusicFiles(
  onProgress?: (scanned: number, status: string) => void
): Promise<Track[]> {
  const allTracks: Track[] = [];
  const platform = Capacitor.getPlatform();

  if (platform === 'web') {
    // On web, return empty array - user can select files manually
    console.log('Web platform detected - file scanning not available');
    return [];
  }

  onProgress?.(0, 'Iniciando escaneamento...');

  // Scan external storage on Android
  if (platform === 'android') {
    for (const dir of MUSIC_DIRECTORIES) {
      onProgress?.(allTracks.length, `Escaneando ${dir}...`);
      
      const tracks = await scanDirectory(
        dir,
        Directory.ExternalStorage,
        (count) => onProgress?.(allTracks.length + count, `Escaneando ${dir}...`)
      );
      
      allTracks.push(...tracks);
    }

    // Also scan root of external storage
    onProgress?.(allTracks.length, 'Escaneando armazenamento externo...');
    const rootTracks = await scanDirectory(
      '',
      Directory.ExternalStorage,
      (count) => onProgress?.(allTracks.length + count, 'Escaneando armazenamento externo...')
    );
    allTracks.push(...rootTracks);
  }

  // Scan Documents directory (works on both iOS and Android)
  onProgress?.(allTracks.length, 'Escaneando documentos...');
  const docTracks = await scanDirectory(
    '',
    Directory.Documents,
    (count) => onProgress?.(allTracks.length + count, 'Escaneando documentos...')
  );
  allTracks.push(...docTracks);

  // Remove duplicates based on URI
  const uniqueTracks = allTracks.filter(
    (track, index, self) => index === self.findIndex(t => t.uri === track.uri)
  );

  onProgress?.(uniqueTracks.length, 'Escaneamento concluído!');
  
  return uniqueTracks;
}

export async function requestStoragePermissions(): Promise<boolean> {
  const platform = Capacitor.getPlatform();
  
  if (platform === 'web') {
    return true;
  }

  try {
    // Try to read from external storage to check permissions
    await Filesystem.readdir({
      path: '',
      directory: Directory.ExternalStorage,
    });
    return true;
  } catch (e) {
    console.error('Storage permission denied:', e);
    return false;
  }
}
