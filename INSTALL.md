# Music Player - Guia de Instalação

## 📱 Sobre o Projeto

Player de música **multiplataforma** desenvolvido com **React + Capacitor**, criando aplicativos nativos para Android e iOS a partir de uma única base de código.

### Tecnologias

| Stack | Tecnologia |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui + Framer Motion |
| Mobile | **Capacitor** (wrapper nativo Android/iOS) |
| Áudio | HTML5 Audio API + Media Session API |

---

## 🔒 Privacidade e Segurança

- ✅ **100% Offline** - Funciona sem internet
- ✅ **Sem coleta de dados** - Nenhuma informação é enviada
- ✅ **Sem login/cadastro** - Use imediatamente
- ✅ **Sem analytics** - Nenhum rastreamento
- ✅ **Permissões mínimas** - Apenas acesso aos arquivos de música

---

## 🚀 Desenvolvimento Local (Web)

```bash
npm install
npm run dev      # Desenvolvimento
npm run build    # Produção
```

---

## 📲 Build para Android

### Pré-requisitos

1. **Android Studio** (https://developer.android.com/studio)
2. **Java JDK 17+**
3. **Android SDK** API Level 33+

### Passos

```bash
# 1. Instalar dependências
npm install

# 2. Adicionar plataforma Android (primeira vez)
npx cap add android

# 3. Build do projeto web
npm run build

# 4. Sincronizar com projeto nativo
npx cap sync android

# 5. Abrir no Android Studio
npx cap open android
```

### Gerar APK/AAB

No Android Studio: **Build > Generate Signed Bundle/APK**

---

## 🍎 Build para iOS

### Pré-requisitos

1. **macOS** (obrigatório)
2. **Xcode 15+**
3. **Conta de Desenvolvedor Apple** (para dispositivos reais)

### Passos

```bash
npm install
npx cap add ios
npm run build
npx cap sync ios
npx cap open ios
```

---

## 🔊 Recursos de Áudio

### Background Audio

O app suporta reprodução quando:
- Tela desligada
- App em segundo plano
- Outros apps em uso

### Controles do Sistema

- **Android**: Notificação de mídia, lock screen
- **iOS**: Control Center, lock screen, AirPods
- **Web**: Media Session API

### Formatos Suportados

| Formato | Android | iOS | Web |
|---------|---------|-----|-----|
| MP3     | ✅      | ✅  | ✅  |
| AAC/M4A | ✅      | ✅  | ✅  |
| WAV     | ✅      | ✅  | ✅  |
| FLAC    | ✅      | ✅  | ⚠️  |
| OGG     | ✅      | ⚠️  | ✅  |

---

## 🔒 Permissões Necessárias

### Android
```xml
<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

### iOS
```xml
<key>NSAppleMusicUsageDescription</key>
<key>UIBackgroundModes</key><array><string>audio</string></array>
```

---

## 🛠️ Hot Reload (Dev)

Descomente em `capacitor.config.ts`:

```typescript
server: {
  url: 'http://SEU_IP:5173',
  cleartext: true
},
```

**⚠️ Remova antes do build de produção!**

---

## 📦 Estrutura

```
├── src/services/       # Áudio, scanner, playlists
├── src/components/     # UI components
├── android/            # Projeto nativo Android
├── ios/                # Projeto nativo iOS
└── capacitor.config.ts # Config Capacitor
```

---

## 🐛 Solução de Problemas

| Problema | Solução |
|----------|---------|
| Permissão negada | Verifique `READ_MEDIA_AUDIO` (Android 13+) |
| Áudio para em background | Confirme `FOREGROUND_SERVICE_MEDIA_PLAYBACK` |
| Build falha | `rm -rf node_modules && npm install && npx cap sync` |
