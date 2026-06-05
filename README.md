# MemoLens

MemoLens is a private, local-first memory gallery for photos that need context.

Save a photo from your camera or library, add a typed or dictated caption, choose a mood, add tags, then find the memory by what it meant instead of scrolling through a crowded camera roll.

## Why It Exists

Most gallery apps store everything. MemoLens is for the smaller set of images you actually need to remember: receipts, whiteboards, screenshots, study material, visual references, documents, and personal moments.

## Features

- Google sign-in on Web, Android, and iOS.
- Add photos from camera or photo library without forced cropping.
- Type captions or dictate them with speech recognition.
- Add moods, tags, and favorites.
- Search memories by caption, mood, tag, or source.
- Store captions, profile state, theme, and native image copies locally.
- Edit captions, moods, tags, and favorite state after saving.
- Share saved images through the native share sheet with the actual image file on mobile.
- Toggle light and dark mode.
- Manage local data, sign-out, privacy, and release info from Settings.
- Receive compatible UI/JavaScript updates through EAS Update.

## Screens

- MemoLens onboarding
- Memories home
- Create Memory
- Memory detail
- Settings
- Share flow

Store copy and launch notes are tracked in [Play Store listing draft](docs/play-store-listing-draft.md).

## Tech Stack

- Expo SDK 54
- React Native
- TypeScript
- React Navigation
- AsyncStorage
- Expo Image Picker
- Expo Speech Recognition
- Expo Sharing
- React Native Google Sign-In
- Expo AuthSession for Web OAuth
- EAS Build and EAS Update

## Getting Started

Install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
copy .env.example .env
```

Add Google OAuth client IDs:

```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
EXPO_PUBLIC_PRIVACY_POLICY_URL=https://your-hosted-policy-url
```

Start Expo:

```bash
npm start
```

Run Android:

```bash
npm run android
```

Run Web:

```bash
npm run web
```

## Google OAuth Notes

Use these app identifiers when creating OAuth clients:

- Android package: `com.ablespace.mygallery`
- iOS bundle ID: `com.ablespace.mygallery`
- Web local origin: `http://localhost:8081`

For Android, the OAuth client must include the SHA-1 certificate for the build being tested. Development/debug builds, EAS builds, and Play Store app-signing builds can have different SHA-1 values. If Google sign-in starts failing after a Play Store upload, add the Play app-signing SHA-1 to the Android OAuth client.

## Quality Checks

Run tests:

```bash
npm test
```

Run TypeScript:

```bash
npm run typecheck
```

## Release Workflow

Preview Android build:

```bash
npm run build:android:preview
```

Production Android App Bundle:

```bash
npm run build:android:production
```

Production over-the-air update:

```bash
npm run update:production -- --message "Short update note"
```

EAS Update can ship compatible JavaScript, UI, copy, and asset changes to installed builds with the same runtime version. Build and upload a new APK/AAB when native code, permissions, native packages, Expo SDK version, Google native auth setup, app icon, package config, or runtime version changes.

## Product Roadmap

Near-term:

- Share cards that combine photo, caption, date, and MemoLens branding.
- Date/source search filters.
- Import/export backup.
- Closed-test feedback capture.

Later:

- OCR search inside images.
- AI caption suggestions.
- Biometric lock.
- Google Drive backup/export.
- Crash reporting and analytics.

## Privacy Direction

MemoLens is local-first. Images, captions, moods, and tags are stored on the device unless the user chooses to share them. Google Sign-In is used for identity, and camera, photo library, microphone, and speech recognition permissions are requested only when the related feature is used.

A starter policy draft lives in [Privacy policy draft](docs/privacy-policy-draft.md).
