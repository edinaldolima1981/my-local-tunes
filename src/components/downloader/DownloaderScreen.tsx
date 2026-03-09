import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Link2,
  ClipboardPaste,
  Search,
  ExternalLink,
  Trash2,
  ChevronDown,
  ChevronUp,
  Youtube,
  Globe,
  Music,
  Video,
  AlertCircle,
  History,
  Wrench,
  X,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDownloadHistory } from '@/hooks/useDownloadHistory';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Platform = 'youtube' | 'tiktok' | 'instagram' | 'facebook' | 'unknown';

const detectPlatform = (url: string): Platform => {
  if (/youtu(\.be|be\.com)/i.test(url)) return 'youtube';
  if (/tiktok\.com/i.test(url)) return 'tiktok';
  if (/instagram\.com/i.test(url)) return 'instagram';
  if (/facebook\.com|fb\.watch/i.test(url)) return 'facebook';
  return 'unknown';
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Clean URL: extract original video URL from nested downloader URLs
const cleanUrl = (url: string): string => {
  try {
    const u = new URL(url);
    // If someone pasted a downloader URL like you2downloader.com/?url=ENCODED
    const nested = u.searchParams.get("url");
    if (nested) {
      return cleanUrl(decodeURIComponent(nested));
    }
  } catch {}
  return url;
};

// Extract YouTube video ID
const getYouTubeId = (url: string): string | null => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

const getDownloadServices = () => {
  return [
    { name: 'Sua Música', url: 'https://suamusica.com.br', recommended: true, description: 'Músicas brasileiras grátis' },
    { name: 'Palco MP3', url: 'https://www.palcomp3.com.br', recommended: false, description: 'Downloads de MP3 grátis' },
  ];
};

const platformIcons: Record<Platform, React.ReactNode> = {
  youtube: <Youtube size={18} />,
  tiktok: <Globe size={18} />,
  instagram: <Globe size={18} />,
  facebook: <Globe size={18} />,
  unknown: <Globe size={18} />,
};

const platformLabels: Record<Platform, string> = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  facebook: 'Facebook',
  unknown: 'Desconhecida',
};

export const DownloaderScreen = () => {
  const [link, setLink] = useState('');
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState('');
  const [showServices, setShowServices] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);

  const { history, addRecord, removeRecord, clearHistory, isDuplicate } = useDownloadHistory();

  const openUrl = useCallback((url: string, title: string, method: string, plt: Platform) => {
    if (isDuplicate(link.trim())) {
      toast.warning('Este link já foi baixado anteriormente');
    }
    addRecord({ url: link.trim(), title, platform: plt, format: 'auto', method });
    
    // Use a real anchor element to avoid popup blockers
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [link, isDuplicate, addRecord]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setLink(text);
      processLink(text);
    } catch {
      toast.error('Não foi possível acessar a área de transferência');
    }
  };

  const processLink = async (url: string) => {
    const target = url.trim();
    setError('');
    setShowServices(false);
    setDownloadUrl(null);

    if (!target) {
      setError('Cole um link para continuar');
      return;
    }

    if (!isValidUrl(target)) {
      setError('Link inválido. Verifique e tente novamente.');
      return;
    }

    const detected = detectPlatform(target);
    setPlatform(detected);

    if (detected === 'unknown') {
      setError('Plataforma não reconhecida. Tente YouTube, TikTok, Instagram ou Facebook.');
      return;
    }

    // Try backend API first
    setIsLoading(true);
    toast.info('Buscando link de download...');

    try {
      const { data, error: fnError } = await supabase.functions.invoke('youtube-download', {
        body: { url: target },
      });

      if (fnError) throw fnError;

      if (data?.url) {
        // Direct download link found!
        setDownloadUrl(data.url);
        addRecord({
          url: target,
          title: `${platformLabels[detected]} - Download direto`,
          platform: detected,
          format: 'auto',
          method: 'API Cobalt',
        });
        toast.success('Link de download encontrado! Clique para baixar.');
      } else if (data?.status === 'fallback' && data?.links) {
        // API unavailable, show fallback links
        setShowServices(true);
        toast.warning('API indisponível. Use um dos serviços abaixo.');
      } else if (data?.picker) {
        // Multiple options (e.g. video + audio)
        setDownloadUrl(data.picker[0]?.url || data.url);
        toast.success('Link encontrado! Clique para baixar.');
      } else {
        setShowServices(true);
        toast.warning('Não foi possível gerar link direto. Use um serviço abaixo.');
      }
    } catch (err) {
      console.error('[Download API]', err);
      setShowServices(true);
      toast.warning('Erro na API. Use um dos serviços abaixo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    processLink(link);
  };

  const handleClear = () => {
    setLink('');
    setPlatform(null);
    setError('');
    setShowServices(false);
    setDownloadUrl(null);
    setIsLoading(false);
  };

  const downloadServices = platform && platform !== 'unknown' 
    ? getDownloadServices(link.trim(), platform) 
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Downloader</h1>
        <p className="text-sm text-muted-foreground mt-1">Baixe vídeos e áudios de diversas plataformas</p>
      </div>

      {/* Link Input */}
      <div className="space-y-3">
        <div className="relative">
          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="url"
            value={link}
            onChange={(e) => {
              const raw = e.target.value;
              const val = cleanUrl(raw.trim());
              setLink(val);
              setError('');
              setShowServices(false);
              setDownloadUrl(null);
              if (val && isValidUrl(val)) {
                const detected = detectPlatform(val);
                setPlatform(detected);
                if (detected === 'unknown') {
                  setError('Plataforma não reconhecida. Tente YouTube, TikTok, Instagram ou Facebook.');
                }
              } else {
                setPlatform(null);
              }
            }}
            placeholder="Cole aqui o link do vídeo"
            className="w-full h-12 pl-10 pr-10 rounded-xl border border-border bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
          {link && (
            <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Platform badge */}
        <AnimatePresence>
          {platform && platform !== 'unknown' && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 text-primary text-sm font-medium"
            >
              {platformIcons[platform]}
              Plataforma detectada: {platformLabels[platform]}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2">
          <Button onClick={handlePaste} variant="secondary" className="flex-1 gap-2 rounded-xl">
            <ClipboardPaste size={16} />
            Colar
          </Button>
          <Button onClick={handleSearch} disabled={isLoading} className="flex-1 gap-2 rounded-xl">
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {isLoading ? 'Buscando...' : 'Buscar Vídeo'}
          </Button>
        </div>

        {/* Direct Download Button */}
        <AnimatePresence>
          {downloadUrl && (
            <motion.a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-center gap-3 p-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <Download size={20} />
              Baixar Agora
            </motion.a>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm"
            >
              <AlertCircle size={16} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Download Services - appears after clicking "Buscar Vídeo" */}
      <AnimatePresence>
        {showServices && downloadServices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-3"
          >
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Download size={16} />
              Escolha um serviço para baixar
            </h2>

            <div className="space-y-2">
              {downloadServices.map((service) => (
                <a
                  key={service.name}
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    if (isDuplicate(link.trim())) {
                      toast.warning('Este link já foi baixado anteriormente');
                    }
                    addRecord({
                      url: link.trim(),
                      title: `${platformLabels[platform!]} - via ${service.name}`,
                      platform: platform!,
                      format: 'auto',
                      method: service.name,
                    });
                  }}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                    service.recommended
                      ? 'bg-primary/10 border-primary/30 hover:bg-primary/20'
                      : 'bg-secondary/30 border-border/50 hover:bg-secondary/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    service.recommended ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Download size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                      {service.name}
                      {service.recommended && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
                          Recomendado
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">Clique para abrir e baixar</p>
                  </div>
                  <ExternalLink size={16} className="text-muted-foreground shrink-0" />
                </a>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Você será redirecionado para o serviço externo com opções de formato e qualidade
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Mode */}
      <div className="space-y-3">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm font-semibold text-foreground w-full"
        >
          <Wrench size={16} />
          Modo Avançado
          {showAdvanced ? <ChevronUp size={16} className="ml-auto" /> : <ChevronDown size={16} className="ml-auto" />}
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 space-y-4">
                <p className="text-xs text-muted-foreground">
                  O modo avançado usa engines de download internas (yt-dlp). 
                  Requer um servidor backend configurado.
                </p>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Video size={14} />
                    Baixar vídeo
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {['MP4 360p', 'MP4 720p', 'MP4 1080p'].map(fmt => (
                      <Button key={fmt} variant="outline" size="sm" className="rounded-lg text-xs" disabled>
                        {fmt}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Music size={14} />
                    Baixar áudio
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {['MP3', 'M4A'].map(fmt => (
                      <Button key={fmt} variant="outline" size="sm" className="rounded-lg text-xs" disabled>
                        {fmt}
                      </Button>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground italic">
                  Em breve — requer configuração de backend com yt-dlp
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Download History */}
      <div className="space-y-3">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2 text-sm font-semibold text-foreground w-full"
        >
          <History size={16} />
          Meus Downloads
          {history.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
              {history.length}
            </span>
          )}
          {showHistory ? <ChevronUp size={16} className="ml-auto" /> : <ChevronDown size={16} className="ml-auto" />}
        </button>

        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {history.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  Nenhum download registrado
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map(record => (
                    <div key={record.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        {platformIcons[record.platform]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{record.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {platformLabels[record.platform]} · {record.method} · {new Date(record.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <button onClick={() => removeRecord(record.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={clearHistory} className="w-full text-xs text-muted-foreground">
                    Limpar histórico
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden anchor for programmatic navigation */}
      <a ref={linkRef} className="hidden" target="_blank" rel="noopener noreferrer" />
    </div>
  );
};
