# My Gallery

Premium Minimal React Native gallery app for the Ablespace assignment. It runs on iOS, Android, and Web with Google login, image picking, camera capture, voice or manual captions, local persistence, search, dark mode, and sharing.

## Features

- Google sign-in with Expo AuthSession and profile header.
- Development demo profile when OAuth client IDs are not configured.
- Image picker on iOS, Android, and Web.
- Camera capture where the platform supports it.
- Voice captions through `expo-speech-recognition`, with manual text fallback.
- Local-first persistence with AsyncStorage for gallery items, profile, and theme.
- Responsive grid with caption search and empty states.
- Detail screen with edit caption, delete, and share.
- Dark mode toggle across the app.

## Setup

Install dependencies:

```bash
npm install
```

Copy the environment sample:

```bash
copy .env.example .env
```

Add Google OAuth client IDs to `.env`:

```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
```

The app remains reviewable without these values by using **Use demo profile** on the login screen. Real Google sign-in needs the client IDs and redirect URI configuration for your Expo app scheme.

## Run

Start the Expo dev server:

```bash
npm start
```

Run on Android:

```bash
npm run android
```

Run on iOS:

```bash
npm run ios
```

Run on Web:

```bash
npm run web
```

## Test

```bash
npm test
npm run typecheck
```

Create a static web export:

```bash
npx expo export --platform web
```

## Design Choices

The UI uses the approved **Premium Minimal** direction: neutral surfaces, restrained borders, strong typography, and a clear primary action. The gallery screen is the main workspace, so reviewers land directly on the assignment features after login rather than a marketing-style experience.

The app is local-first. Images and captions are saved in AsyncStorage so the user can keep adding and editing while offline. For Web, selected images use base64 data when available so they remain available after reloads more reliably than temporary object URLs.

## Trade-Offs

- Google OAuth requires real client IDs in `.env`; the demo profile exists only to keep the rest of the flow testable without secrets.
- Native speech recognition with `expo-speech-recognition` requires a development/native build for full iOS and Android behavior because it uses native permissions and config plugins.
- Sharing support differs by platform. The app uses Web Share API in browsers, React Native Share on native platforms, and fallback messaging when unavailable.
- This implementation stores data locally only. A backend sync layer was listed as a bonus and is not included.

## Demo Video Checklist

Record these moments for the assignment submission:

1. Web: open the app, use demo or Google login, show profile header.
2. Web: add an image from the picker, type a caption, save it.
3. Web: search by caption, switch dark mode, open detail, edit caption, share.
4. Android: launch the same app, add from picker or camera, dictate a caption.
5. iOS: launch the app, show the gallery grid and sharing flow.

## Project Notes

- Source code lives in `src/`.
- Pure behavior tests cover gallery filtering and local persistence.
- Assignment design and implementation notes live in `docs/superpowers/`.
