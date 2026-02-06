import { motion, AnimatePresence } from 'framer-motion';
import { Track } from '@/types/music';

interface TrackInfoProps {
  track: Track | null;
}

export function TrackInfo({ track }: TrackInfoProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={track?.id || 'empty'}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="text-center space-y-1"
      >
        {track ? (
          <>
            <h2 className="text-xl md:text-2xl font-semibold text-foreground truncate max-w-[280px] md:max-w-[320px]">
              {track.title}
            </h2>
            <p className="text-muted-foreground truncate max-w-[280px] md:max-w-[320px]">
              {track.artist}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl md:text-2xl font-semibold text-muted-foreground">
              Nenhuma música selecionada
            </h2>
            <p className="text-muted-foreground">
              Selecione uma música para começar
            </p>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
