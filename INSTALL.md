# Music Player - Instruções de Instalação

## Pré-requisitos

- Node.js 18+
- Android Studio (para Android)
- Xcode (para iOS - apenas Mac)

## Instalação

1. **Clone o repositório:**
```bash
git clone <seu-repositorio>
cd <nome-do-projeto>
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Adicione as plataformas nativas:**
```bash
npx cap add android
npx cap add ios  # apenas Mac
```

4. **Configure permissões (Android):**

Edite `android/app/src/main/AndroidManifest.xml` e adicione antes de `<application>`:

```xml
<!-- Permissões de armazenamento -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />

<!-- Para reprodução em segundo plano -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

5. **Build e sync:**
```bash
npm run build
npx cap sync
```

6. **Execute no dispositivo:**
```bash
npx cap run android
# ou
npx cap run ios
```

## Funcionalidades

✅ Escaneia pastas Music, Download, DCIM, Audio  
✅ Suporta MP3, WAV, FLAC, AAC, OGG, M4A  
✅ Player com Play/Pause, Próxima/Anterior  
✅ Barra de progresso interativa  
✅ Tempo decorrido e total  
✅ Reprodução em segundo plano (usa Media Session API)  
✅ Controle pela tela de bloqueio  
✅ Shuffle e Repeat  
✅ Controle de volume  
✅ Busca de músicas  

## Estrutura de Pastas Escaneadas

O app procura músicas nas seguintes pastas:
- `/Music`
- `/Download`
- `/Downloads`
- `/DCIM`
- `/Audio`
- `/Documents`

## Transferindo Músicas

Para adicionar músicas ao app:

1. Conecte o celular ao computador via USB
2. Copie os arquivos de áudio para uma das pastas acima
3. Abra o app e clique em "Atualizar" na aba Biblioteca

## Formato de Nome Recomendado

Para melhor organização, nomeie seus arquivos assim:
```
Artista - Nome da Música.mp3
```

O app irá extrair automaticamente o artista e título.
