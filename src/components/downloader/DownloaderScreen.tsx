import { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDownloadHistory, DownloadRecord } from '@/hooks/useDownloadHistory';
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

const generateSSUrl = (url: string, platform: Platform): string | null => {
  if (platform === 'youtube') {
    return url.replace(/youtube\.com/, 'ssyoutube.com').replace(/youtu\.be/, 'ssyoutube.com/watch?v=');
  }
  if (platform === 'tiktok') {
    return url.replace(/tiktok\.com/, 'sstiktok.com');
  }
  if (platform === 'instagram') {
    return url.replace(/instagram\.com/, 'ssinstagram.com');
  }
  if (platform === 'facebook') {
    return url.replace(/facebook\.com/, 'ssfacebook.com');
  }
  return null;
};

const externalServices = [
  { name: 'KeepVid', baseUrl: 'https://keepvid.to/?url=' },
  { name: 'SaveTube', baseUrl: 'https://savetube.me/pt/1/?url=' },
  { name: 'Zeemo', baseUrl: 'https://zeemo.ai/tools/youtube-downloader?url=' },
  { name: 'AceThinker', baseUrl: 'https://www.acethinker.com/downloader#url=' },
];

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

  const { history, addRecord, removeRecord, clearHistory, isDuplicate } = useDownloadHistory();

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setLink(text);
      handleDetect(text);
    } catch {
      toast.error('Não foi possível acessar a área de transferência');
    }
  };

  const handleDetect = (url?: string) => {
    const target = url || link;
    setError('');

    if (!target.trim()) {
      setError('Cole um link para continuar');
      return;
    }

    if (!isValidUrl(target.trim())) {
      setError('Link inválido. Verifique e tente novamente.');
      return;
    }

    const detected = detectPlatform(target.trim());
    setPlatform(detected);

    if (detected === 'unknown') {
      setError('Plataforma não reconhecida. Tente YouTube, TikTok, Instagram ou Facebook.');
    }
  };

  const handleSSMethod = () => {
    if (!link || !platform) return;

    if (isDuplicate(link)) {
      toast.warning('Este link já foi baixado anteriormente');
    }

    const ssUrl = generateSSUrl(link.trim(), platform);
    if (ssUrl) {
      addRecord({ url: link.trim(), title: `${platformLabels[platform]} - Download`, platform, format: 'auto', method: 'SS' });
      window.open(ssUrl, '_blank');
    } else {
      toast.error('Método SS não disponível para esta plataforma');
    }
  };

  const handleExternalService = (service: typeof externalServices[0]) => {
    if (!link.trim()) {
      setError('Cole um link primeiro');
      return;
    }
    addRecord({ url: link.trim(), title: `Via ${service.name}`, platform: platform || 'unknown', format: 'auto', method: service.name });
    window.open(`${service.baseUrl}${encodeURIComponent(link.trim())}`, '_blank');
  };

  const handleClear = () => {
    setLink('');
    setPlatform(null);
    setError('');
  };

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
            onChange={(e) => { setLink(e.target.value); setError(''); setPlatform(null); }}
            placeholder="Cole aqui o link do vídeo"
            className="w-full h-12 pl-10 pr-10 rounded-xl border border-border bg-secondary/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
          {link && (
            <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={handlePaste} variant="secondary" className="flex-1 gap-2 rounded-xl">
            <ClipboardPaste size={16} />
            Colar
          </Button>
          <Button onClick={() => handleDetect()} className="flex-1 gap-2 rounded-xl">
            <Search size={16} />
            Buscar Vídeo
          </Button>
        </div>

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

        {/* Platform Detected */}
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
      </div>

      {/* SS Method - Quick Download */}
      <AnimatePresence>
        {platform && platform !== 'unknown' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="space-y-3"
          >
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Download size={16} />
              Download Rápido
            </h2>
            <Button onClick={handleSSMethod} className="w-full gap-2 rounded-xl h-12 text-base">
              <Download size={18} />
              Baixar via SaveFrom (Método SS)
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Abre o serviço SaveFrom.net com opções de MP4, WebM e MP3
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* External Services */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <ExternalLink size={16} />
          Baixar via serviço externo
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {externalServices.map((service) => (
            <Button
              key={service.name}
              variant="outline"
              onClick={() => handleExternalService(service)}
              className="rounded-xl h-11 text-sm gap-2"
            >
              <Globe size={14} />
              {service.name}
            </Button>
          ))}
        </div>
      </div>

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

                {/* Video Formats */}
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

                {/* Audio Formats */}
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
    </div>
  );
};
