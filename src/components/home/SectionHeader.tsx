import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  delay?: number;
}

export function SectionHeader({ title, onSeeAll, delay = 0 }: SectionHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center justify-between mb-4"
    >
      <h2 className="text-lg font-bold">{title}</h2>
      {onSeeAll && (
        <button 
          onClick={onSeeAll}
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          Ver tudo <ChevronRight size={16} />
        </button>
      )}
    </motion.div>
  );
}
