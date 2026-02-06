import { motion } from 'framer-motion';
import { Folder as FolderIcon, ChevronRight } from 'lucide-react';
import { Folder } from '@/hooks/useLibraryOrganization';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FolderListProps {
  folders: Folder[];
  onFolderSelect: (folder: Folder) => void;
}

export function FolderList({ folders, onFolderSelect }: FolderListProps) {
  if (folders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
        <FolderIcon size={40} className="mb-2" />
        <p>Nenhuma pasta encontrada</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-320px)]">
      <div className="space-y-1">
        {folders.map((folder, index) => (
          <motion.button
            key={folder.path}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onFolderSelect(folder)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors text-left"
          >
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
              <FolderIcon size={24} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{folder.name}</p>
              <p className="text-sm text-muted-foreground">
                {folder.trackCount} {folder.trackCount === 1 ? 'música' : 'músicas'}
              </p>
            </div>
            <ChevronRight size={20} className="text-muted-foreground" />
          </motion.button>
        ))}
      </div>
    </ScrollArea>
  );
}
