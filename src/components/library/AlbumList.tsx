import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Disc, Trash2, Plus, Music2, Sparkles, FolderPlus, ImagePlus, Pencil } from 'lucide-react';
import { Album } from '@/hooks/useLibraryOrganization';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface AlbumListProps {
  albums: Album[];
  onAlbumSelect: (album: Album) => void;
}

export function AlbumList({ albums, onAlbumSelect }: AlbumListProps) {
  const { deleteTracksByAlbum, addTracksFromFiles, createAlbum, customAlbums, deleteCustomAlbum, updateAlbumCover, updateAlbumMetadata } = useMusicLibrary();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [newAlbumArtist, setNewAlbumArtist] = useState('');
  const [albumForCover, setAlbumForCover] = useState<Album | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [albumToEdit, setAlbumToEdit] = useState<Album | null>(null);
  const [editAlbumName, setEditAlbumName] = useState('');
  const [editAlbumArtist, setEditAlbumArtist] = useState('');

  const handleDeleteAlbum = (album: Album) => {
    deleteTracksByAlbum(album.name, album.artist);
    // Também remove o álbum customizado se existir
    const customAlbum = customAlbums.find(a => a.name === album.name && a.artist === album.artist);
    if (customAlbum) {
      deleteCustomAlbum(customAlbum.id);
    }
    toast.success(`Álbum "${album.name}" removido da biblioteca`);
  };

  const handleAddMusic = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addTracksFromFiles(files);
      toast.success(`${files.length} música(s) adicionada(s)!`);
    }
    e.target.value = '';
  };

  const handleCreateAlbum = () => {
    if (newAlbumName.trim()) {
      createAlbum(newAlbumName.trim(), newAlbumArtist.trim() || 'Artista Desconhecido');
      toast.success(`Álbum "${newAlbumName}" criado! Clique nele para adicionar músicas.`);
      setNewAlbumName('');
      setNewAlbumArtist('');
      setShowCreateDialog(false);
    }
  };

  const handleCoverClick = (album: Album, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlbumForCover(album);
    coverInputRef.current?.click();
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && albumForCover) {
      // Verifica se é uma imagem
      if (!file.type.startsWith('image/')) {
        toast.error('Selecione um arquivo de imagem válido');
        return;
      }

      try {
        // Converte para Data URL persistente (sobrevive ao refresh)
        const coverDataUrl = await imageToDataUrl(file);
        updateAlbumCover(albumForCover.name, albumForCover.artist, coverDataUrl);
        toast.success(`Capa do álbum "${albumForCover.name}" atualizada!`);
      } catch (error) {
        toast.error('Erro ao processar a imagem');
      }
    }
    e.target.value = '';
    setAlbumForCover(null);
  };

  const handleEditClick = (album: Album, e: React.MouseEvent) => {
    e.stopPropagation();
    setAlbumToEdit(album);
    setEditAlbumName(album.name);
    setEditAlbumArtist(album.artist);
    setShowEditDialog(true);
  };

  const handleEditAlbum = () => {
    if (albumToEdit && editAlbumName.trim()) {
      updateAlbumMetadata(
        albumToEdit.name,
        albumToEdit.artist,
        editAlbumName.trim(),
        editAlbumArtist.trim() || 'Artista Desconhecido'
      );
      toast.success(`Álbum atualizado para "${editAlbumName}"`);
      setShowEditDialog(false);
      setAlbumToEdit(null);
      setEditAlbumName('');
      setEditAlbumArtist('');
    }
  };

  // Converte imagem para Data URL comprimida
  const imageToDataUrl = (file: File, maxWidth = 400): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-4">
      {/* Input hidden para seleção de arquivos de áudio */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*,audio/mpeg,audio/mp3,audio/wav,audio/flac,audio/aac,audio/ogg,audio/x-m4a,audio/mp4,.mp3,.wav,.flac,.aac,.ogg,.m4a,.wma"
        multiple
        className="hidden"
      />

      {/* Input hidden para seleção de capa */}
      <input
        type="file"
        ref={coverInputRef}
        onChange={handleCoverChange}
        accept="image/*"
        className="hidden"
      />

      {/* Header com título e botões discretos */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          <span className="text-sm text-muted-foreground font-medium">
            {albums.length} {albums.length === 1 ? 'álbum' : 'álbuns'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="h-8 px-3 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <FolderPlus size={14} className="mr-1" />
            Criar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddMusic}
            className="h-8 px-3 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Plus size={14} className="mr-1" />
            Importar
          </Button>
        </div>
      </div>

      {albums.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
            <Music2 size={40} className="text-primary/60" />
          </div>
          <p className="text-foreground font-medium mb-1">Sua biblioteca está vazia</p>
          <p className="text-sm text-muted-foreground mb-4">
            Importe músicas para começar sua coleção
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddMusic}
            className="border-primary/30 text-primary hover:bg-primary/10"
          >
            <Plus size={16} className="mr-2" />
            Adicionar músicas
          </Button>
        </motion.div>
      ) : (
        <ScrollArea className="h-[calc(100vh-340px)]">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4">
            {albums.map((album, index) => (
              <motion.div
                key={`${album.name}-${album.artist}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02, duration: 0.2 }}
                className="group relative"
              >
                <button
                  onClick={() => onAlbumSelect(album)}
                  className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-2xl"
                >
                  {/* Capa do Álbum */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary shadow-lg group-hover:shadow-xl group-hover:shadow-primary/10 transition-all duration-300">
                    {album.coverUrl ? (
                      <img
                        src={album.coverUrl}
                        alt={album.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-secondary via-muted to-secondary flex items-center justify-center">
                        <Disc size={40} className="text-muted-foreground/50" />
                      </div>
                    )}

                    {/* Overlay gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Play indicator on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg backdrop-blur-sm">
                        <svg className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>

                    {/* Badge de músicas */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-full text-[10px] text-white/90 font-medium">
                      {album.trackCount} {album.trackCount === 1 ? 'música' : 'músicas'}
                    </div>
                  </div>

                  {/* Informações do Álbum */}
                  <div className="mt-2.5 px-1">
                    <p className="font-semibold text-foreground truncate text-sm leading-tight">
                      {album.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {album.artist}
                    </p>
                  </div>
                </button>

                {/* Botão Editar - aparece no hover */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 left-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/50 backdrop-blur-sm text-white/80 hover:text-primary hover:bg-black/70"
                  onClick={(e) => handleEditClick(album, e)}
                  title="Editar álbum"
                >
                  <Pencil size={14} />
                </Button>

                {/* Botão Adicionar Capa - aparece no hover */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 left-10 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/50 backdrop-blur-sm text-white/80 hover:text-primary hover:bg-black/70"
                  onClick={(e) => handleCoverClick(album, e)}
                  title="Adicionar capa"
                >
                  <ImagePlus size={14} />
                </Button>

                {/* Botão Excluir - aparece no hover */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/50 backdrop-blur-sm text-white/80 hover:text-destructive hover:bg-black/70"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir álbum?</AlertDialogTitle>
                      <AlertDialogDescription>
                        O álbum "{album.name}" de {album.artist} ({album.trackCount} músicas) será removido da sua biblioteca. Esta ação não exclui os arquivos do dispositivo.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteAlbum(album)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      )}
      {/* Dialog para criar novo álbum */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Criar Novo Álbum</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nome do Álbum</label>
              <Input
                placeholder="Ex: Minhas Favoritas"
                value={newAlbumName}
                onChange={(e) => setNewAlbumName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Artista (opcional)</label>
              <Input
                placeholder="Ex: Vários Artistas"
                value={newAlbumArtist}
                onChange={(e) => setNewAlbumArtist(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateAlbum} disabled={!newAlbumName.trim()}>
              <FolderPlus size={16} className="mr-2" />
              Criar Álbum
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar álbum */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Editar Álbum</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nome do Álbum</label>
              <Input
                placeholder="Ex: Minhas Favoritas"
                value={editAlbumName}
                onChange={(e) => setEditAlbumName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Artista</label>
              <Input
                placeholder="Ex: Vários Artistas"
                value={editAlbumArtist}
                onChange={(e) => setEditAlbumArtist(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditAlbum} disabled={!editAlbumName.trim()}>
              <Pencil size={16} className="mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}