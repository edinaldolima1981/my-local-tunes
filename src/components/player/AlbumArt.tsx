import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

interface AlbumArtProps {
  coverUrl?: string;
  isPlaying: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AlbumArt({ coverUrl, isPlaying, size = 'lg' }: AlbumArtProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-64 h-64 md:w-72 md:h-72',
  };

  const iconSizes = {
    sm: 20,
    md: 32,
    lg: 64,
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} relative rounded-2xl overflow-hidden bg-secondary flex items-center justify-center`}
      animate={isPlaying && size === 'lg' ? { 
        boxShadow: [
          '0 0 20px hsl(var(--primary) / 0.3)',
          '0 0 40px hsl(var(--primary) / 0.5)',
          '0 0 20px hsl(var(--primary) / 0.3)',
        ]
      } : {}}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {coverUrl ? (
        <motion.img
          src={coverUrl}
          alt="Album cover"
          className="w-full h-full object-cover"
          animate={isPlaying && size === 'lg' ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
          <Music className="text-muted-foreground" size={iconSizes[size]} />
        </div>
      )}
      
      {/* Vinyl record effect for large size */}
      {size === 'lg' && isPlaying && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{ 
            background: 'radial-gradient(circle at center, transparent 30%, hsl(var(--primary) / 0.1) 100%)'
          }}
        />
      )}
    </motion.div>
  );
}
