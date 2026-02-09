import { motion } from 'framer-motion';
import { Disc3, Settings } from 'lucide-react';

interface GreetingHeaderProps {
  tracksCount: number;
  isPlaying: boolean;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function GreetingHeader({ tracksCount, isPlaying }: GreetingHeaderProps) {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg" />
          <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Disc3 className="text-primary-foreground" size={24} />
          </div>
        </motion.div>
        <div>
          <h1 className="text-2xl font-bold">{getGreeting()}</h1>
          <p className="text-sm text-muted-foreground">
            {tracksCount} {tracksCount === 1 ? 'música' : 'músicas'} na biblioteca
          </p>
        </div>
      </div>
    </motion.header>
  );
}
