# 🎵 Music Player

Player de música **offline** e **multiplataforma** para Android e iOS.

![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Capacitor](https://img.shields.io/badge/Capacitor-8-green)

---

## ✨ Funcionalidades

- 🎵 Reprodução de MP3, WAV, FLAC, AAC, OGG, M4A
- 📁 Organização por Artista, Álbum e Pasta
- 📝 Playlists personalizadas
- 🔍 Busca por nome, artista ou álbum
- 🔀 Shuffle e Repeat
- 🔒 100% offline - sem coleta de dados
- 🎨 Interface moderna com animações suaves
- 📱 Controles via lock screen e notificações

---

## 📂 Estrutura do Projeto

```
music-player/
├── src/
│   ├── components/           # Componentes React
│   │   ├── library/          # Biblioteca (artistas, álbuns, playlists)
│   │   ├── player/           # Player (controles, progresso, etc)
│   │   └── ui/               # Componentes shadcn/ui
│   │
│   ├── hooks/                # React Hooks customizados
│   │   ├── useAudioPlayer.ts       # Estado do player
│   │   ├── useMusicLibrary.tsx     # Scanner de músicas
│   │   ├── usePlaylists.tsx        # Gerenciamento de playlists
│   │   └── useLibraryOrganization.ts # Agrupamento por categoria
│   │
│   ├── services/             # Serviços de negócio
│   │   ├── audioPlayerService.ts     # Reprodução de áudio
│   │   ├── backgroundAudioService.ts # Áudio em background
│   │   ├── musicScanner.ts           # Scanner de arquivos
│   │   └── playlistService.ts        # CRUD de playlists
│   │
│   ├── pages/                # Páginas/Telas
│   ├── types/                # Tipos TypeScript
│   └── assets/               # Recursos estáticos
│
├── android/                  # Projeto Android (após npx cap add android)
├── ios/                      # Projeto iOS (após npx cap add ios)
├── capacitor.config.ts       # Configuração Capacitor
└── INSTALL.md                # Guia detalhado de build
```

---

## 🚀 Quick Start

```bash
npm install          # Instalar dependências
npm run dev          # Desenvolvimento
npm run build        # Build produção
```

---

## 📲 Build Android (APK)

```bash
npm run build                 # Build web
npx cap add android           # Adicionar plataforma (1ª vez)
npx cap sync android          # Sincronizar
npx cap open android          # Abrir Android Studio
```

No Android Studio: **Build > Generate Signed Bundle / APK**

APK gerado em: `android/app/build/outputs/apk/`

---

## 🍎 Build iOS (IPA)

```bash
npm run build                 # Build web
npx cap add ios               # Adicionar plataforma (1ª vez)
npx cap sync ios              # Sincronizar
npx cap open ios              # Abrir Xcode
```

No Xcode: **Product > Archive > Distribute App**

---

## 🔒 Privacidade

- ❌ Sem conexão de internet
- ❌ Sem coleta de dados
- ❌ Sem analytics ou rastreamento
- ✅ 100% offline

---

## 📄 Documentação

- [INSTALL.md](INSTALL.md) - Guia completo de instalação e build
- [PRIVACY.md](PRIVACY.md) - Política de privacidade
