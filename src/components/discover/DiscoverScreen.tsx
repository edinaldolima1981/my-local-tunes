import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Download, Music, FolderOpen, Disc3, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMusicLibrary } from '@/hooks/useMusicLibrary';
import { toast } from 'sonner';

export function DiscoverScreen() {
  const { addTracksFromFiles } = useMusicLibrary();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const handleOpenSuaMusica = () => {
    window.open('https://suamusica.com.br/', '_blank', 'noopener,noreferrer');
  };

  const handleImportFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImporting(true);
    try {
      await addTracksFromFiles(files);
      toast.success(`${files.length} música(s) importada(s) com sucesso!`);
    } catch (error) {
      toast.error('Erro ao importar músicas');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-2"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Globe className="text-primary" size={32} />
        </motion.div>
        <div>
          <h1 className="text-2xl font-bold text-gradient-primary">Descobrir</h1>
          <p className="text-xs text-muted-foreground">
            Encontre e baixe músicas grátis
          </p>
        </div>
      </motion.header>

      {/* SuaMusica Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl overflow-hidden border border-border/50 bg-gradient-to-br from-emerald-500/10 to-primary/10"
      >
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Music className="text-emerald-400" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Sua Música</h2>
              <p className="text-xs text-muted-foreground">suamusica.com.br</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Ouça e baixe <strong className="text-foreground">milhares de músicas grátis</strong> — Sertanejo, Forró, Pagode, Funk e muito mais. 
            Artistas como Henrique & Juliano, Bruno & Marrone e outros!
          </p>

          <Button
            onClick={handleOpenSuaMusica}
            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            size="lg"
          >
            <ExternalLink size={18} />
            Abrir Sua Música
            <ArrowRight size={16} />
          </Button>
        </div>
      </motion.div>

      {/* Como funciona */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Como funciona
        </h3>

        <div className="space-y-2">
          {[
            { step: '1', text: 'Abra o Sua Música clicando no botão acima', icon: Globe },
            { step: '2', text: 'Pesquise e baixe as músicas que quiser', icon: Download },
            { step: '3', text: 'Volte aqui e importe os arquivos baixados', icon: FolderOpen },
            { step: '4', text: 'Curta suas músicas offline no VibePlayer! 🎶', icon: Disc3 },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/30"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">{item.step}</span>
              </div>
              <p className="text-sm">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Botão Importar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,video/*"
          multiple
          onChange={handleImportFiles}
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="lg"
          className="w-full gap-2 border-primary/30 hover:bg-primary/10"
          disabled={importing}
        >
          <Download size={18} />
          {importing ? 'Importando...' : 'Importar Músicas Baixadas'}
        </Button>
        <p className="text-[11px] text-muted-foreground text-center mt-2">
          Aceita MP3, M4A, WAV, MP4 e outros formatos
        </p>
      </motion.div>
    </div>
  );
}
