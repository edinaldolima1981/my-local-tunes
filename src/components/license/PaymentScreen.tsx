/**
 * @fileoverview Tela de pagamento/bloqueio
 * 
 * Exibida quando o trial expira. Mostra instruções para pagamento via PIX.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Copy, 
  Check, 
  QrCode, 
  Mail,
  Smartphone,
  ArrowRight,
  Music2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLicense } from '@/hooks/useLicense';
import { LICENSE_PRICE, getPixKey } from '@/services/licenseService';
import { toast } from 'sonner';

export const PaymentScreen = () => {
  const { status, updateEmail, refreshStatus } = useLicense();
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [pixKey, setPixKey] = useState<string>('Carregando...');

  // Carrega a chave PIX do banco
  useEffect(() => {
    const loadPixKey = async () => {
      const key = await getPixKey();
      setPixKey(key);
    };
    loadPixKey();
  }, []);

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      toast.success('Chave PIX copiada!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const handleCopyDeviceId = async () => {
    if (!status?.deviceId) return;
    try {
      await navigator.clipboard.writeText(status.deviceId);
      toast.success('ID do dispositivo copiado!');
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const handleSubmitEmail = async () => {
    if (!email.trim()) {
      toast.error('Digite seu email');
      return;
    }

    setIsSubmitting(true);
    const success = await updateEmail(email);
    setIsSubmitting(false);

    if (success) {
      toast.success('Email salvo! Aguarde a liberação.');
      setShowInstructions(true);
    } else {
      toast.error('Erro ao salvar email');
    }
  };

  const handleCheckPayment = async () => {
    toast.info('Verificando pagamento...');
    await refreshStatus();
    
    if (status?.isPaid) {
      toast.success('Pagamento confirmado! Aproveite o app!');
    } else {
      toast.info('Pagamento ainda não confirmado. Aguarde a liberação.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-surface opacity-50 pointer-events-none" />
      
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        {/* Lock Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="w-24 h-24 rounded-full bg-destructive/20 flex items-center justify-center mb-6"
        >
          <Lock className="text-destructive" size={48} />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-center mb-2"
        >
          Período de Teste Expirado
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-center mb-8 max-w-sm"
        >
          Para continuar usando o app, faça o pagamento via PIX.
        </motion.p>

        {/* Price Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm bg-card rounded-2xl border border-border p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Music2 className="text-primary" size={24} />
            </div>
            <div>
              <h3 className="font-semibold">Licença Vitalícia</h3>
              <p className="text-sm text-muted-foreground">Pagamento único</p>
            </div>
          </div>

          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-3xl font-bold text-primary">R$ {LICENSE_PRICE.toFixed(2).replace('.', ',')}</span>
            <span className="text-muted-foreground">/ único</span>
          </div>

          <ul className="space-y-2 mb-4 text-sm">
            <li className="flex items-center gap-2">
              <Check size={16} className="text-green-500" />
              Acesso vitalício ao app
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-green-500" />
              Todas as funcionalidades
            </li>
            <li className="flex items-center gap-2">
              <Check size={16} className="text-green-500" />
              Atualizações futuras incluídas
            </li>
          </ul>
        </motion.div>

        {/* Payment Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-sm space-y-4"
        >
          {/* PIX Key */}
          <div className="bg-secondary/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <QrCode size={18} className="text-primary" />
              <span className="text-sm font-medium">Chave PIX</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-background rounded-lg px-3 py-2 text-sm font-mono truncate">
                {pixKey}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPix}
                className="shrink-0"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
          </div>

          {/* Device ID */}
          <div className="bg-secondary/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone size={18} className="text-primary" />
              <span className="text-sm font-medium">ID do Dispositivo</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-background rounded-lg px-3 py-2 text-xs font-mono truncate">
                {status?.deviceId || 'Carregando...'}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyDeviceId}
                className="shrink-0"
              >
                <Copy size={16} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Envie este ID junto com o comprovante
            </p>
          </div>

          {/* Email (optional) */}
          <div className="bg-secondary/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail size={18} className="text-primary" />
              <span className="text-sm font-medium">Seu Email (opcional)</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSubmitEmail}
                disabled={isSubmitting}
                className="shrink-0"
              >
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>

          {/* Instructions */}
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-green-500/10 border border-green-500/30 rounded-xl p-4"
            >
              <h4 className="font-medium text-green-600 mb-2">Próximos passos:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Faça o PIX de R$ {LICENSE_PRICE.toFixed(2).replace('.', ',')}</li>
                <li>Envie o comprovante + ID do dispositivo</li>
                <li>Aguarde a liberação (até 24h)</li>
                <li>Clique em "Verificar Pagamento"</li>
              </ol>
            </motion.div>
          )}

          {/* Check Payment Button */}
          <Button
            onClick={handleCheckPayment}
            className="w-full"
            size="lg"
          >
            Verificar Pagamento
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
