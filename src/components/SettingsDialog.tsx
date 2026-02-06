import { useState } from 'react';
import { Settings, Trash2, Database, HardDrive, AlertTriangle, Check } from 'lucide-react';
import { clearAllStorage } from '@/services/audioStorageService';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      // Limpa IndexedDB (áudios e capas)
      await clearAllStorage();
      
      // Limpa localStorage
      localStorage.removeItem('trackMetadata');
      localStorage.removeItem('customAlbums');
      localStorage.removeItem('music_player_playlists');
      localStorage.removeItem('music_player_state');
      localStorage.removeItem('equalizer_settings');
      
      setClearSuccess(true);
      
      // Recarrega a página após 1.5s
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
    } finally {
      setIsClearing(false);
      setShowConfirmReset(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings size={20} className="text-primary" />
              Configurações
            </DialogTitle>
            <DialogDescription>
              Gerencie os dados do seu player de música
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Storage Info */}
            <div className="p-4 rounded-lg bg-secondary/50 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Database size={16} className="text-primary" />
                Armazenamento
              </div>
              <p className="text-xs text-muted-foreground">
                Suas músicas e playlists são armazenadas localmente no seu dispositivo. 
                Nenhum dado é enviado para servidores externos.
              </p>
            </div>

            {/* Clear Data */}
            <div className="p-4 rounded-lg border border-destructive/30 bg-destructive/5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                <Trash2 size={16} />
                Limpar Dados
              </div>
              <p className="text-xs text-muted-foreground">
                Remove todas as músicas importadas, playlists e configurações. 
                Esta ação não pode ser desfeita.
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowConfirmReset(true)}
                className="w-full"
              >
                <HardDrive size={16} className="mr-2" />
                Limpar Todos os Dados
              </Button>
            </div>

            {/* Version */}
            <div className="text-center text-xs text-muted-foreground pt-2">
              Music Player v1.0.0 • 100% Offline
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Reset Dialog */}
      <AlertDialog open={showConfirmReset} onOpenChange={setShowConfirmReset}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle size={20} />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir todos os dados? Isso irá remover:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Todas as músicas importadas</li>
                <li>Todas as playlists criadas</li>
                <li>Capas de álbuns personalizadas</li>
                <li>Configurações do player</li>
              </ul>
              <p className="mt-3 font-medium text-destructive">
                Esta ação não pode ser desfeita!
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAllData}
              disabled={isClearing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isClearing ? (
                'Limpando...'
              ) : clearSuccess ? (
                <>
                  <Check size={16} className="mr-2" />
                  Limpo!
                </>
              ) : (
                'Sim, Excluir Tudo'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
