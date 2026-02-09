/**
 * @fileoverview Painel de administração de licenças
 * 
 * Permite visualizar e gerenciar licenças dos usuários.
 * Acesso restrito a usuários com role 'admin'.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Search,
  RefreshCw,
  Shield,
  Copy,
  Check,
  LogOut,
  Loader2,
  Settings,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserLicense } from '@/services/licenseService';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AuthProvider, useAuth } from '@/hooks/useAuth';

interface LicenseStats {
  total: number;
  paid: number;
  trial: number;
  expired: number;
}

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [licenses, setLicenses] = useState<UserLicense[]>([]);
  const [filteredLicenses, setFilteredLicenses] = useState<UserLicense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<LicenseStats>({ total: 0, paid: 0, trial: 0, expired: 0 });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [pixKey, setPixKey] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Verifica se usuário é admin usando função do banco
  const checkAdminRole = useCallback(async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      if (error) {
        console.error('Erro ao verificar role:', error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(data === true);
    } catch (error) {
      console.error('Erro ao verificar admin:', error);
      setIsAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    checkAdminRole();
  }, [checkAdminRole]);

  const loadLicenses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_licenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const licenseList = data || [];
      setLicenses(licenseList);
      setFilteredLicenses(licenseList);

      const now = new Date();
      const statsData = licenseList.reduce((acc, license) => {
        acc.total++;
        if (license.is_paid) {
          acc.paid++;
        } else if (new Date(license.trial_ends_at) > now) {
          acc.trial++;
        } else {
          acc.expired++;
        }
        return acc;
      }, { total: 0, paid: 0, trial: 0, expired: 0 });

      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar licenças:', error);
      toast.error('Erro ao carregar licenças');
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega configurações do app
  const loadSettings = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'pix_key')
        .single();
      
      if (data) {
        setPixKey(data.value);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadLicenses();
      loadSettings();
    }
  }, [isAdmin, loadSettings]);

  const handleSavePixKey = async () => {
    if (!pixKey.trim()) {
      toast.error('Digite a chave PIX');
      return;
    }

    setIsSavingSettings(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ value: pixKey })
        .eq('key', 'pix_key');

      if (error) throw error;

      toast.success('Chave PIX salva com sucesso!');
      setShowSettings(false);
    } catch (error) {
      console.error('Erro ao salvar chave PIX:', error);
      toast.error('Erro ao salvar chave PIX');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredLicenses(licenses);
      return;
    }

    const filtered = licenses.filter(license => 
      license.device_id.toLowerCase().includes(term.toLowerCase()) ||
      license.email?.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredLicenses(filtered);
  };

  const handleMarkAsPaid = async (licenseId: string) => {
    try {
      const { error } = await supabase
        .from('user_licenses')
        .update({ 
          is_paid: true, 
          paid_at: new Date().toISOString(),
          payment_method: 'manual_pix'
        })
        .eq('id', licenseId);

      if (error) throw error;

      toast.success('Licença marcada como paga!');
      loadLicenses();
    } catch (error) {
      console.error('Erro ao atualizar licença:', error);
      toast.error('Erro ao atualizar licença');
    }
  };

  const handleRevokeLicense = async (licenseId: string) => {
    if (!confirm('Tem certeza que deseja revogar esta licença?')) return;

    try {
      const { error } = await supabase
        .from('user_licenses')
        .update({ 
          is_paid: false, 
          paid_at: null,
          payment_method: null
        })
        .eq('id', licenseId);

      if (error) throw error;

      toast.success('Licença revogada');
      loadLicenses();
    } catch (error) {
      console.error('Erro ao revogar licença:', error);
      toast.error('Erro ao revogar licença');
    }
  };

  const handleCopyDeviceId = async (deviceId: string) => {
    try {
      await navigator.clipboard.writeText(deviceId);
      setCopiedId(deviceId);
      toast.success('ID copiado!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const getLicenseStatus = (license: UserLicense) => {
    if (license.is_paid) return 'paid';
    const now = new Date();
    const trialEnds = new Date(license.trial_ends_at);
    if (trialEnds > now) return 'trial';
    return 'expired';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-500">PAGO</span>;
      case 'trial':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-500">TRIAL</span>;
      case 'expired':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-destructive/20 text-destructive">EXPIRADO</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = async () => {
    await signOut();
    setIsAdmin(null);
  };

  // Loading state
  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Não é admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-card rounded-2xl border border-border p-6 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-xl font-bold mb-2">Acesso Negado</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Você não tem permissão para acessar o painel de administração.
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Logado como: {user?.email}
          </p>
          <Button variant="outline" onClick={handleLogout} className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </motion.div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto p-4 safe-area-inset">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gerenciador de Licenças</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              title="Configurações"
            >
              <Settings size={18} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={loadLicenses}
              disabled={isLoading}
            >
              <RefreshCw className={`${isLoading ? 'animate-spin' : ''}`} size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card rounded-xl border border-border p-4 mb-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings size={18} />
              Configurações
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Chave PIX</label>
                <div className="flex gap-2">
                  <Input
                    value={pixKey}
                    onChange={(e) => setPixKey(e.target.value)}
                    placeholder="Sua chave PIX (email, CPF, celular ou aleatória)"
                    className="flex-1"
                  />
                  <Button onClick={handleSavePixKey} disabled={isSavingSettings}>
                    {isSavingSettings ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Esta chave será exibida para os usuários na tela de pagamento.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <span className="text-2xl font-bold">{stats.total}</span>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-xs text-muted-foreground">Pagos</span>
            </div>
            <span className="text-2xl font-bold text-green-500">{stats.paid}</span>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-blue-500" />
              <span className="text-xs text-muted-foreground">Trial</span>
            </div>
            <span className="text-2xl font-bold text-blue-500">{stats.trial}</span>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={16} className="text-destructive" />
              <span className="text-xs text-muted-foreground">Expirados</span>
            </div>
            <span className="text-2xl font-bold text-destructive">{stats.expired}</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Buscar por Device ID ou Email..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* License List */}
        <div className="space-y-3">
          {filteredLicenses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {isLoading ? 'Carregando...' : 'Nenhuma licença encontrada'}
            </div>
          ) : (
            filteredLicenses.map((license) => {
              const status = getLicenseStatus(license);
              const daysLeft = Math.ceil(
                (new Date(license.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              );

              return (
                <motion.div
                  key={license.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl border border-border p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusBadge(status)}
                        {status === 'trial' && daysLeft > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({daysLeft} dias restantes)
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-muted-foreground truncate">
                          {license.device_id}
                        </code>
                        <button
                          onClick={() => handleCopyDeviceId(license.device_id)}
                          className="shrink-0 text-muted-foreground hover:text-foreground"
                        >
                          {copiedId === license.device_id ? (
                            <Check size={14} />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                      {license.email && (
                        <p className="text-sm text-foreground mt-1">{license.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Criado: {formatDate(license.created_at)}</span>
                    <span>Trial até: {formatDate(license.trial_ends_at)}</span>
                  </div>

                  {license.is_paid && license.paid_at && (
                    <p className="text-xs text-green-500 mt-1">
                      Pago em: {formatDate(license.paid_at)} ({license.payment_method})
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    {!license.is_paid ? (
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsPaid(license.id)}
                        className="flex-1"
                      >
                        <CheckCircle size={14} className="mr-1" />
                        Marcar como Pago
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRevokeLicense(license.id)}
                        className="flex-1"
                      >
                        Revogar Licença
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// Wrapper com AuthProvider e gate de login
const AdminContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <AdminDashboard />;
};

export const LicenseManager = () => {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
};
