import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Wifi, WifiOff, UserX, Database, Eye, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface PrivacyInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

const privacyPoints = [
  {
    icon: WifiOff,
    title: '100% Offline',
    description: 'Funciona completamente sem internet',
  },
  {
    icon: Database,
    title: 'Dados Locais',
    description: 'Tudo armazenado apenas no seu dispositivo',
  },
  {
    icon: UserX,
    title: 'Sem Login',
    description: 'Não requer cadastro ou conta',
  },
  {
    icon: Eye,
    title: 'Sem Rastreamento',
    description: 'Nenhum dado é coletado ou enviado',
  },
  {
    icon: Shield,
    title: 'Permissões Mínimas',
    description: 'Apenas acesso aos seus arquivos de música',
  },
  {
    icon: Lock,
    title: 'Privacidade Total',
    description: 'Suas músicas e playlists são só suas',
  },
];

export function PrivacyInfo({ isOpen, onClose }: PrivacyInfoProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="text-primary" size={24} />
            Privacidade
          </DialogTitle>
          <DialogDescription>
            Este app respeita sua privacidade
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {privacyPoints.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <point.icon size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{point.title}</p>
                <p className="text-sm text-muted-foreground">{point.description}</p>
              </div>
              <Check size={18} className="text-primary flex-shrink-0 mt-1" />
            </motion.div>
          ))}
        </div>

        <div className="pt-2">
          <Button onClick={onClose} className="w-full">
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
