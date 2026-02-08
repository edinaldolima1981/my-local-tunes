# VibePlayer - Build & Deployment Guide

## 📱 Build Instructions

### Prerequisites
- Node.js 16+ installed
- Android Studio (for Android builds)
- Xcode (for iOS builds - macOS only)

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Web Assets
```bash
npm run build
```

### 3. Android Build

#### First Time Setup
```bash
npx cap add android
```

#### Sync and Build
```bash
npx cap sync android
npx cap open android
```

In Android Studio:
1. Build → Generate Signed Bundle/APK
2. Select "Android App Bundle" (for Play Store)
3. Create/select keystore
4. Build Release

#### Generate Keystore (First Time)
```bash
keytool -genkey -v -keystore vibeplayer-release.keystore -alias vibeplayer -keyalg RSA -keysize 2048 -validity 10000
```

### 4. iOS Build

#### First Time Setup
```bash
npx cap add ios
```

#### Sync and Build
```bash
npx cap sync ios
npx cap open ios
```

In Xcode:
1. Select your development team
2. Product → Archive
3. Distribute App → App Store Connect

---

## 📝 Store Listing Content

### App Name
**VibePlayer**

### Short Description (80 chars)
Modern offline music & video player with premium features

### Long Description

**VibePlayer - Your Music, Your Style**

VibePlayer is a modern, premium music and video player designed for music lovers who want complete control over their media library.

**KEY FEATURES:**

🎵 **Offline First**
- 100% offline - no internet required
- All your music stored securely on your device
- Privacy-focused - no data tracking

🎨 **Premium Interface**
- Beautiful glassmorphism design
- Fullscreen player with vinyl animation
- Smooth, intuitive controls
- Dark mode optimized

📁 **Smart Organization**
- Create custom albums
- Organize with playlists
- Edit metadata (name, artist, cover)
- Visual album art

🎬 **Video Support**
- Play music videos
- Seamless audio/video switching
- Picture-in-picture ready

✨ **Advanced Features**
- Queue management
- Shuffle & repeat modes
- Search & filter
- Import from device storage

**100% FREE - NO ADS - NO SUBSCRIPTIONS**

Perfect for:
- Music collectors
- Audiophiles
- Privacy-conscious users
- Offline listening

Download VibePlayer today and take control of your music experience!

### Keywords (ASO)
music player, offline music, video player, audio player, music library, playlist, album manager, mp3 player, media player, music organizer

### Category
**Music & Audio**

### Content Rating
**Everyone**

### Privacy Policy URL
`https://[your-domain]/privacy` or use the Privacy.tsx page

---

## 📸 Screenshot Requirements

### Android (Google Play)
- At least 2 screenshots
- Min: 320px
- Max: 3840px
- Recommended: 1080x1920 (phone), 1920x1080 (tablet)

### iOS (App Store)
- 6.5" display: 1242 x 2688
- 5.5" display: 1242 x 2208
- iPad Pro: 2048 x 2732

### Suggested Screenshots
1. Main library view with albums
2. Fullscreen player (vinyl animation)
3. Video playback
4. Playlist management
5. Album detail view

---

## ✅ Pre-Launch Checklist

- [ ] Privacy Policy published
- [ ] App icon (1024x1024) ready
- [ ] Screenshots taken
- [ ] Tested on real devices
- [ ] Version set to 1.0.0
- [ ] App signed with release keystore
- [ ] Store listing content prepared
- [ ] Age rating completed
- [ ] Contact email set up

---

## 📦 App Signing

### Android
**Important files to backup:**
- `vibeplayer-release.keystore`
- Keystore password
- Key alias
- Key password

### iOS
Managed through Apple Developer account and Xcode.

---

## 🚀 Publishing

### Google Play Store
1. Create Google Play Console account (US$ 25)
2. Create app
3. Upload AAB file
4. Complete store listing
5. Set pricing & distribution
6. Submit for review

### Apple App Store
1. Join Apple Developer Program (US$ 99/year)
2. Create app in App Store Connect
3. Upload build via Xcode
4. Complete app information
5. Submit for review

**Review Time:**
- Google Play: 1-3 days
- Apple App Store: 1-7 days

---

## 📧 Support

For build issues or questions:
- Email: support@vibeplayer.app
- GitHub: [your-repo-url]
