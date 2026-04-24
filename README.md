# My Gallery

My Gallery is a private, local-first visual notebook for photos that need context.

Save an image from your camera or library, add a typed or dictated caption, then search by what the image means instead of scrolling through a crowded camera roll.

## Why It Exists

Most gallery apps are good at storing photos, but not always good at remembering why a photo mattered. My Gallery focuses on the smaller set of images that need notes: receipts, whiteboards, screenshots, study material, visual references, documents, and personal moments.

## Features

- Google sign-in on Web, Android, and iOS.
- Add images from camera or photo library.
- Type captions or dictate them with speech recognition.
- Search saved images by caption and tag.
- Mark important images as favorites.
- Add tags for quick grouping and filtering.
- Store captions, profile state, theme, and native image copies locally.
- Edit captions, tags, and favorite state after saving.
- Share saved images through the native share sheet with the actual image file on mobile.
- Toggle light and dark mode.
- Manage local data, sign-out, and release info from Settings.
- Receive compatible UI/JavaScript updates through EAS Update.

## Screens

- Login
- Gallery
- Add caption
- Image detail
- Settings
- Share flow

Screenshots and store artwork are tracked in [Play Store listing draft](docs/play-store-listing-draft.md).

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

For Android, the OAuth client must include the SHA-1 certificate for the build being tested. Development/debug builds, EAS builds, and Play Store app-signing builds can have different SHA-1 values.

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

Preview over-the-air update:

```bash
npm run update:preview -- --message "Short update note"
```

Production over-the-air update:

```bash
npm run update:production -- --message "Short update note"
```

EAS Update is for compatible JavaScript, UI, copy, and asset changes. Build a new APK/AAB when native code, permissions, native packages, Expo SDK version, Google native auth setup, or runtime version changes.

More detail lives in [Release and product plan](docs/release-and-product-plan.md).

## Product Roadmap

Near-term:

- Better caption templates when sharing.
- Search filters for date and source.
- Privacy policy URL in app settings.
- Import/export backup.

Later:

- OCR search inside images.
- AI caption suggestions.
- Biometric lock.
- Google Drive backup/export.
- Crash reporting and analytics.

## Privacy Direction

My Gallery is local-first. Images and captions are stored on the device unless the user chooses to share them. Google Sign-In is used for identity, and camera, photo library, microphone, and speech recognition permissions are requested only when the related feature is used.

Before a production Play Store release, publish a full privacy policy and align it with the final feature set. A starter policy draft lives in [Privacy policy draft](docs/privacy-policy-draft.md).
