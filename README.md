# My Gallery

Premium Minimal React Native gallery app for the Ablespace assignment. It runs on iOS, Android, and Web with Google login, image picking, camera capture, voice or manual captions, local persistence, search, dark mode, and sharing.

## Features

- Google sign-in with Expo AuthSession on Web and native Google Sign-In on Android/iOS.
- Development demo profile when OAuth client IDs are not configured.
- Image picker on iOS, Android, and Web.
- Camera capture where the platform supports it.
- Voice captions through `expo-speech-recognition`, with manual text fallback.
- Local-first persistence with AsyncStorage for captions/profile/theme and app-owned file storage for saved images.
- Responsive grid with caption search and empty states.
- Detail screen with edit caption, delete, and real image sharing.
- Dark mode toggle across the app.
- EAS Update support for shipping UI/JavaScript fixes without asking users to reinstall.

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

The main assignment flow is **Continue with Google**. The app keeps **Use demo profile** as a development and review fallback only, so the rest of the gallery can still be checked before OAuth secrets are added.

## Google Cloud OAuth Setup

Create or open a Google Cloud project, then configure the OAuth consent screen:

- App name: `My Gallery`
- User type: External
- Scopes: `openid`, `profile`, `email`
- Add your own Google account as a test user while the app is in testing mode.

Create these OAuth clients:

- Web client: add `http://localhost:8081` as an authorized JavaScript origin. Add `http://localhost:8082` too only if your Expo web server is running on that port.
- Android client: package name `com.ablespace.mygallery`, with the SHA-1 from your local debug keystore or EAS build signing certificate.
- iOS client: bundle ID `com.ablespace.mygallery`.

Then put the generated client IDs in `.env` and restart Expo. Google OAuth on Android and iOS should be tested with a development/native build, not Expo Go, because custom scheme redirects are not reliable in Expo Go.

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

## Release And Updates

This project is linked to EAS as `@aby369/my-gallery-ablespace`.

Use a preview APK for testers:

```bash
npm run build:android:preview
```

Use a production Android App Bundle for Google Play:

```bash
npm run build:android:production
```

Publish a UI/JavaScript update to preview users:

```bash
npm run update:preview -- --message "Short update note"
```

Publish a UI/JavaScript update to Play Store users:

```bash
npm run update:production -- --message "Short update note"
```

EAS Update can ship JavaScript, styling, text, and asset changes to installed builds with the same runtime version. Build and distribute a new APK/AAB when native code changes, permissions change, Expo SDK changes, dependencies with native modules change, or Google/native auth configuration changes.

## Design Choices

The UI uses the approved **Premium Minimal** direction: neutral surfaces, restrained borders, strong typography, and a clear primary action. The gallery screen is the main workspace, so reviewers land directly on the assignment features after login rather than a marketing-style experience.

The app is local-first. Captions and user state are saved in AsyncStorage, while native images are copied into app-owned document storage so saved items do not depend on temporary picker cache. For Web, selected images use base64 data when available so they remain available after reloads more reliably than temporary object URLs.

## Trade-Offs

- Google OAuth requires real client IDs in `.env`; the demo profile exists only to keep the rest of the flow testable without secrets.
- Native speech recognition with `expo-speech-recognition` requires a development/native build for full iOS and Android behavior because it uses native permissions and config plugins.
- Sharing support differs by platform. The app uses Web Share API in browsers and native file sharing on Android/iOS, with fallback messaging when unavailable.
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
- Release workflow and product roadmap live in `docs/release-and-product-plan.md`.
- Play Store copy and publishing notes live in `docs/play-store-listing-draft.md`.
