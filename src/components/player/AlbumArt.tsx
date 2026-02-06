import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

interface AlbumArtProps {
  coverUrl?: string;
  isPlaying: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function AlbumArt({ coverUrl, isPlaying, size = 'lg' }: AlbumArtProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-64 h-64 md:w-72 md:h-72',
    xl: 'w-80 h-80 md:w-96 md:h-96',
  };

  const iconSizes = {
    sm: 20,
    md: 32,
    lg: 64,
    xl: 80,
  };

  const roundedClasses = {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} relative ${roundedClasses[size]} overflow-hidden bg-secondary flex items-center justify-center shadow-2xl`}
      animate={isPlaying && (size === 'lg' || size === 'xl') ? { 
        boxShadow: [
          '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          '0 25px 50px -12px hsl(var(--primary) / 0.3)',
          '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        ]
      } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {coverUrl ? (
        <motion.img
          src={coverUrl}
          alt="Album cover"
          className="w-full h-full object-cover"
          animate={isPlaying && (size === 'lg' || size === 'xl') ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary to-accent/20 flex items-center justify-center">
          <motion.div
            animate={isPlaying ? { rotate: 360 } : {}}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="relative"
          >
            <div className={`rounded-full bg-background/20 flex items-center justify-center ${
              size === 'xl' ? 'w-32 h-32' : size === 'lg' ? 'w-24 h-24' : 'w-full h-full'
            }`}>
              <Music className="text-muted-foreground" size={iconSizes[size]} />
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
