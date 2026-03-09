import { motion } from 'framer-motion';
import {
  Music,
  ExternalLink,
  Download,
} from 'lucide-react';

const downloadServices = [
  { name: 'Sua Música', url: 'https://suamusica.com.br', recommended: true, description: 'Músicas brasileiras grátis' },
  { name: 'Palco MP3', url: 'https://www.palcomp3.com.br', recommended: false, description: 'Downloads de MP3 grátis' },
  { name: 'YouTube', url: 'https://www.youtube.com/', recommended: false, description: 'Maior plataforma de vídeos e música' },
];

export const DownloaderScreen = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Download size={24} />
          Baixar Músicas
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Acesse os sites abaixo para buscar e baixar músicas gratuitamente
        </p>
      </div>

      {/* Sites de Download */}
      <div className="space-y-3">
        {downloadServices.map((service, index) => (
          <motion.a
            key={service.name}
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
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
          <li>Clique em um dos sites acima</li>
          <li>Pesquise a música desejada no site</li>
          <li>Clique no botão de download do site</li>
          <li>A música será baixada para seu dispositivo</li>
        </ol>
      </div>
    </div>
  );
};
