import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat,
  Heart,
  Library,
  Music,
  Download
} from 'lucide-react';
import { Track } from '@/types/music';
import { Artist, Album } from '@/hooks/useLibraryOrganization';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import defaultCover from '@/assets/default-cover.jpg';

interface HomeScreenProps {
  artists: Artist[];
  albums: Album[];
  tracksCount: number;
  isPlaying: boolean;
  favoritesCount: number;
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  onArtistSelect: (artist: Artist) => void;
  onAlbumSelect: (album: Album) => void;
  onQuickNavigate: (destination: 'favorites' | 'recent' | 'shuffle' | 'playlists') => void;
  onSeeAllArtists: () => void;
  onSeeAllAlbums: () => void;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onSeek: (time: number) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function HomeScreen({
  tracksCount,
  isPlaying,
  currentTrack,
  currentTime,
  duration,
  shuffle,
  repeat,
  onTogglePlay,
  onPrevious,
  onNext,
  onToggleShuffle,
  onToggleRepeat,
  onSeek,
  isFavorite,
  onToggleFavorite,
  onSeeAllAlbums,
}: HomeScreenProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const coverUrl = currentTrack?.coverUrl || defaultCover;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    onSeek(percent * duration);
  };

  return (
    <div className="flex flex-col items-center min-h-[70vh] px-4">
      {/* App Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-3 mb-6 w-full"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
          <Music size={20} className="text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-gradient-primary">Music Player</h1>
      </motion.header>

      {/* Album Art with Neumorphic Frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative mb-8"
      >
        {/* Neon pulse glow - subtle, only when playing */}
        {isPlaying && (
          <>
            {/* Outer glow */}
            <motion.div
              animate={{ 
                opacity: [0.2, 0.4, 0.2],
                scale: [1, 1.04, 1],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute -inset-3 rounded-3xl bg-primary blur-2xl"
            />
            {/* Inner glow */}
            <motion.div
              animate={{ 
                opacity: [0.25, 0.45, 0.25],
                scale: [1, 1.02, 1],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 0.3
              }}
              className="absolute -inset-1 rounded-3xl bg-primary/50 blur-xl"
            />
          </>
        )}
        
        {/* Static outer glow */}
        <div 
          className="absolute inset-0 rounded-3xl blur-2xl opacity-30"
          style={{ 
            background: `radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)` 
          }}
        />
        
        {/* Neumorphic container */}
        <div className="relative p-4 rounded-3xl neu-card">
          {/* Video or Album Art */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-2xl">
            {currentTrack?.mediaType === 'video' ? (
              <VideoPlayer
                src={currentTrack.uri}
                isPlaying={isPlaying}
                currentTime={currentTime}
                repeat={repeat}
              />
            ) : (
              <>
                <img
                  src={coverUrl}
                  alt={currentTrack?.title || 'Album Cover'}
                  className="w-full h-full object-cover"
                />
                {/* Vinyl effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Track Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-6 w-full max-w-xs"
      >
        <h1 className="text-xl font-bold truncate mb-1">
          {currentTrack?.title || 'Nenhuma música'}
        </h1>
        <p className="text-muted-foreground truncate">
          {currentTrack?.artist || 'Selecione uma música'}
        </p>
      </motion.div>

      {/* Progress Bar - Neumorphic */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-xs mb-6"
      >
        <div 
          className="h-2 rounded-full neu-inset cursor-pointer relative overflow-hidden"
          onClick={handleProgressClick}
        >
          <motion.div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full"
            style={{ width: `${progress}%` }}
            layoutId="progress"
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary shadow-lg border-2 border-background"
            style={{ left: `calc(${progress}% - 8px)` }}
            whileHover={{ scale: 1.2 }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </motion.div>

      {/* Control Buttons - Neumorphic Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-4 mb-8"
      >
        {/* Shuffle */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onToggleShuffle}
          className={`w-12 h-12 rounded-full neu-button flex items-center justify-center transition-colors ${
            shuffle ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Shuffle size={18} />
        </motion.button>

        {/* Previous */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onPrevious}
          className="w-14 h-14 rounded-full neu-button flex items-center justify-center text-foreground"
        >
          <SkipBack size={22} />
        </motion.button>

        {/* Play/Pause - Main button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onTogglePlay}
          className="w-18 h-18 p-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg glow-primary"
        >
          {isPlaying ? (
            <Pause size={28} className="text-primary-foreground" />
          ) : (
            <Play size={28} className="text-primary-foreground ml-1" />
          )}
        </motion.button>

        {/* Next */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onNext}
          className="w-14 h-14 rounded-full neu-button flex items-center justify-center text-foreground"
        >
          <SkipForward size={22} />
        </motion.button>

        {/* Repeat */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onToggleRepeat}
          className={`w-12 h-12 rounded-full neu-button flex items-center justify-center transition-colors relative ${
            repeat !== 'off' ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <Repeat size={18} />
          {repeat === 'one' && (
            <span className="absolute -top-1 -right-1 text-[10px] font-bold text-primary">1</span>
          )}
        </motion.button>
      </motion.div>

      {/* Bottom Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-8"
      >
        {/* Favorite */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onToggleFavorite}
          className={`flex flex-col items-center gap-1 transition-colors ${
            isFavorite ? 'text-rose-500' : 'text-muted-foreground'
          }`}
        >
          <Heart size={22} fill={isFavorite ? 'currentColor' : 'none'} />
          <span className="text-[10px]">Favorito</span>
        </motion.button>

        {/* Library */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onSeeAllAlbums}
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Library size={22} />
          <span className="text-[10px]">Biblioteca</span>
        </motion.button>

        {/* Track count */}
        <div className="flex flex-col items-center gap-1 text-muted-foreground">
          <Music size={22} />
          <span className="text-[10px]">{tracksCount} músicas</span>
        </div>
      </motion.div>

      {/* Empty State */}
      {!currentTrack && tracksCount === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="w-24 h-24 rounded-full neu-card flex items-center justify-center mb-4">
            <Music size={40} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhuma música</h3>
          <p className="text-muted-foreground text-sm text-center max-w-xs">
            Adicione músicas ao seu dispositivo para começar
          </p>
        </motion.div>
      )}
    </div>
  );
}
