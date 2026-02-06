import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ba129bad79c94a08a096a53c0367afd1',
  appName: 'Music Player',
  webDir: 'dist',
  
  // Configuração para desenvolvimento - remover em produção
  // server: {
  //   url: 'https://ba129bad-79c9-4a08-a096-a53c0367afd1.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },

  // App 100% offline - sem requisições de rede
  android: {
    // Desabilita tráfego de rede não criptografado
    allowMixedContent: false,
  },
  
  ios: {
    // Configurações de privacidade iOS
    contentInset: 'automatic',
  },

  plugins: {
    // Configuração do Filesystem
    Filesystem: {
      // Diretórios permitidos para leitura
      iosCustomScheme: 'capacitor',
    },
  },
};

export default config;
