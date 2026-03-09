import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Music,
  ExternalLink,
  Download,
  Youtube,
  Loader2,
  Link2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const downloadServices = [
  { name: 'Sua Música', url: 'https://suamusica.com.br', recommended: true, description: 'Músicas brasileiras grátis' },
  { name: 'Palco MP3', url: 'https://www.palcomp3.com.br', recommended: false, description: 'Downloads de MP3 grátis' },
];

export const DownloaderScreen = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleYoutubeDownload = async () => {
    if (!youtubeUrl.trim()) {
      toast.error('Cole uma URL do YouTube');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: fnError } = await supabase.functions.invoke('youtube-download', {
        body: { url: youtubeUrl.trim() },
      });

      if (fnError) throw fnError;

      if (data?.url) {
        // Direct download link
        window.open(data.url, '_blank');
        toast.success('Download iniciado!');
      } else if (data?.status === 'picker' && data?.picker?.length > 0) {
        // Multiple options - open first one
        window.open(data.picker[0].url, '_blank');
        toast.success('Download iniciado!');
      } else if (data?.status === 'fallback' && data?.links?.length > 0) {
        // Fallback - open first link
        window.open(data.links[0].url, '_blank');
        toast.info('Abrindo site alternativo para download');
      } else {
        setError('Não foi possível processar este link. Tente outro URL.');
      }
    } catch (err: any) {
      console.error('[Downloader] Error:', err);
      setError('Erro ao processar. Verifique o link e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Download size={24} />
          Baixar Músicas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Baixe do YouTube ou acesse sites de música grátis
        </p>
      </div>

      {/* YouTube Downloader */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
            <Youtube className="text-red-400" size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">YouTube</h2>
            <p className="text-xs text-muted-foreground">Cole o link do vídeo ou música</p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="https://youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => { setYoutubeUrl(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleYoutubeDownload()}
              className="pl-9 bg-background/50 border-red-500/20"
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleYoutubeDownload}
            disabled={loading || !youtubeUrl.trim()}
            className="bg-red-600 hover:bg-red-700 text-white shrink-0"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
            <AlertCircle size={14} />
            {error}
          </div>
        )}
      </motion.div>

      {/* Sites de Download */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
          Sites de Música Grátis
        </h3>
        {downloadServices.map((service, index) => (
          <motion.a
            key={service.name}
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
              service.recommended
                ? 'bg-primary/10 border-primary/30 hover:bg-primary/20'
                : 'bg-secondary/30 border-border/50 hover:bg-secondary/50'
            }`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
              service.recommended ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            }`}>
              <Music size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-foreground flex items-center gap-2">
                {service.name}
                {service.recommended && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
                    Recomendado
                  </span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">{service.description}</p>
            </div>
            <ExternalLink size={18} className="text-muted-foreground shrink-0" />
          </motion.a>
        ))}
      </div>

      {/* Instruções */}
      <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
        <h3 className="text-sm font-semibold text-foreground mb-2">Como baixar:</h3>
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Cole um link do YouTube acima para baixar direto</li>
          <li>Ou acesse Sua Música / Palco MP3 para músicas brasileiras</li>
          <li>Depois importe os arquivos na aba Descobrir</li>
        </ol>
      </div>
    </div>
  );
};
