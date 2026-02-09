/**
 * @fileoverview Banner de aviso de trial
 * 
 * Mostra quantos dias restam no período de teste.
 */

import { motion } from 'framer-motion';
import { Clock, Crown } from 'lucide-react';
import { useLicense } from '@/hooks/useLicense';
import { formatTrialDays } from '@/services/licenseService';

interface TrialBannerProps {
  onUpgrade?: () => void;
}

export const TrialBanner = ({ onUpgrade }: TrialBannerProps) => {
  const { status } = useLicense();

  // Não mostra se já é pago ou se não tem status
  if (!status || status.isPaid) return null;

  // Não mostra se tem mais de 3 dias restantes
  if (status.trialDaysLeft > 3) return null;

  const isUrgent = status.trialDaysLeft <= 1;
  const isExpired = status.trialDaysLeft <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-4 p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${
        isExpired
          ? 'bg-destructive/20 border border-destructive/50'
          : isUrgent
          ? 'bg-amber-500/20 border border-amber-500/50'
          : 'bg-primary/10 border border-primary/30'
      }`}
      onClick={onUpgrade}
    >
      <div className={`p-2 rounded-lg ${
        isExpired ? 'bg-destructive/30' : isUrgent ? 'bg-amber-500/30' : 'bg-primary/20'
      }`}>
        {isExpired ? (
          <Clock className="text-destructive" size={18} />
        ) : (
          <Crown className={isUrgent ? 'text-amber-500' : 'text-primary'} size={18} />
        )}
      </div>
      
      <div className="flex-1">
        <p className={`text-sm font-medium ${
          isExpired ? 'text-destructive' : isUrgent ? 'text-amber-500' : 'text-primary'
        }`}>
          {isExpired ? 'Período de teste expirado' : formatTrialDays(status.trialDaysLeft)}
        </p>
        <p className="text-xs text-muted-foreground">
          {isExpired ? 'Toque para desbloquear' : 'Toque para ver opções de pagamento'}
        </p>
      </div>

      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className={`text-xs font-semibold px-2 py-1 rounded ${
          isExpired ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'
        }`}
      >
        {isExpired ? 'BLOQUEADO' : 'UPGRADE'}
      </motion.div>
    </motion.div>
  );
};
