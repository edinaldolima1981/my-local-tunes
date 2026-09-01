import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Music,
  ExternalLink,
  Download,
  Youtube,
  Loader2,
  Link2,
  AlertCircle,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const downloadServices = [
  { name: 'Sua Música', url: 'https://suamusica.com.br', recommended: true, description: 'Músicas brasileiras grátis' },
  { name: 'Palco MP3', url: 'https://www.palcomp3.com.br', recommended: false, description: 'Downloads de MP3 grátis' },
];

const isValidYoutubeUrl = (value: string) =>
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/.test(value.trim());

export const DownloaderScreen = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedCommand, setCopiedCommand] = useState(false);
  const lastProcessedRef = useRef('');

  const trimmedUrl = youtubeUrl.trim();
  const ytDlpCommand = `yt-dlp -x --audio-format mp3 "${trimmedUrl}"`;

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(ytDlpCommand);
      setCopiedCommand(true);
      toast.success('Comando copiado! Cole no terminal do PC.');
      setTimeout(() => setCopiedCommand(false), 2000);
    } catch {
      toast.error('Não foi possível copiar');
    }
  };

  const handleInputChange = (value: string) => {
    setYoutubeUrl(value);
    setError('');
    // Auto-start download as soon as a valid YouTube link is pasted
    const trimmed = value.trim();
    if (isValidYoutubeUrl(trimmed) && !loading && lastProcessedRef.current !== trimmed) {
      lastProcessedRef.current = trimmed;
      handleYoutubeDownload(trimmed);
    }
  };

  const handleYoutubeDownload = async (urlOverride?: string) => {
    const url = (urlOverride ?? youtubeUrl).trim();
    if (!url) {
      toast.error('Cole uma URL do YouTube');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await supabase.functions.invoke('youtube-download', {
        body: { url },
      });

      const data = response.data;
      const fnError = response.error;

      // Handle non-2xx responses - the error body contains our JSON
      if (fnError) {
        // Try to parse error context for our custom message
        const errBody = (fnError as any)?.context;
        if (errBody && typeof errBody.json === 'function') {
          try {
            const parsed = await errBody.json();
            if (parsed?.error) {
              setError(parsed.error);
              return;
            }
          } catch {}
        }
        setError('Erro ao processar. Verifique se é um link de vídeo do YouTube.');
        return;
      }

      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Abrindo site de download!');
      } else if (data?.error) {
        setError(data.error);
      } else {
        setError('Não foi possível processar este link. Verifique se é um link válido do YouTube.');
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
              onChange={(e) => handleInputChange(e.target.value)}
              onPaste={(e) => {
                const text = e.clipboardData.getData('text');
                if (isValidYoutubeUrl(text)) {
                  e.preventDefault();
                  handleInputChange(text);
                }
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleYoutubeDownload()}
              className="pl-9 bg-background/50 border-red-500/20"
              disabled={loading}
            />
          </div>
            <Button
            onClick={() => handleYoutubeDownload()}
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

        {/* yt-dlp command for PC users */}
        {isValidYoutubeUrl(trimmedUrl) && (
          <div className="mt-3 p-3 rounded-xl bg-black/40 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Terminal size={14} className="text-green-400" />
              <p className="text-xs font-semibold text-green-400">No PC (método yt-dlp):</p>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 min-w-0 text-[11px] font-mono text-green-300 bg-black/40 px-2 py-1.5 rounded-lg overflow-x-auto whitespace-nowrap">
                {ytDlpCommand}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyCommand}
                className="shrink-0 h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/10"
              >
                {copiedCommand ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              No Windows: Terminal → <span className="font-mono">winget install yt-dlp</span> → cole o comando
            </p>
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
