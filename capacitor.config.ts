import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vibeplayer.app',
  appName: 'VibePlayer',
  webDir: 'dist',

  // App 100% offline - sem requisições de rede
  android: {
    // Desabilita tráfego de rede não criptografado
    allowMixedContent: false,
    // Versão do build
    versionCode: 1,
  },

  ios: {
    // Configurações de privacidade iOS
    contentInset: 'automatic',
    // Número da versão de compilação
    buildNumber: '1',
  },

  plugins: {
    // Configuração do Filesystem para acesso a arquivos de mídia
    Filesystem: {
      iosCustomScheme: 'capacitor',
    },
    // Splash Screen nativo (opcional)
    SplashScreen: {
      launchShowDuration: 0, // Usamos nossa própria splash screen
      backgroundColor: '#000000',
    },
  },
};

export default config;

