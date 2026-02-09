import { motion } from 'framer-motion';
import { Heart, Clock, Shuffle, ListMusic } from 'lucide-react';

interface QuickAccessGridProps {
  onNavigate: (destination: 'favorites' | 'recent' | 'shuffle' | 'playlists') => void;
  favoritesCount: number;
}

const quickItems = [
  { id: 'favorites', label: 'Favoritos', icon: Heart, color: 'from-rose-500 to-pink-600' },
  { id: 'recent', label: 'Recentes', icon: Clock, color: 'from-blue-500 to-cyan-500' },
  { id: 'shuffle', label: 'Aleatório', icon: Shuffle, color: 'from-green-500 to-emerald-500' },
  { id: 'playlists', label: 'Playlists', icon: ListMusic, color: 'from-purple-500 to-violet-600' },
] as const;

export function QuickAccessGrid({ onNavigate, favoritesCount }: QuickAccessGridProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="grid grid-cols-2 gap-3">
        {quickItems.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate(item.id)}
            className="relative overflow-hidden rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 p-4 flex items-center gap-3 text-left transition-all hover:bg-card group"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <item.icon size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.label}</p>
              {item.id === 'favorites' && favoritesCount > 0 && (
                <p className="text-xs text-muted-foreground">{favoritesCount} músicas</p>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
}
