# MemoLens Play Store Listing Draft

## App Name

MemoLens

## Short Description

Save photos with captions, moods, tags, and private search.

## Full Description

MemoLens is a private memory gallery for the photos you want to remember, explain, and find again.

Save a photo from your camera or library, add a typed or dictated caption, choose a mood, then search by what the moment meant instead of scrolling through a huge camera roll. MemoLens is local-first, so your saved images, captions, moods, and tags stay on your device unless you choose to share them.

Use it for:

- Study notes, whiteboards, and screenshots.
- Receipts, warranty photos, and documents.
- Creative references and quick visual ideas.
- Personal moments with searchable captions.

Key features:

- Google sign-in.
- Camera and photo library import without forced cropping.
- Typed or voice captions.
- Mood and tag organization.
- Fast memory search.
- Favorites and quick filters.
- Offline local storage.
- Settings for local data and appearance.
- Dark and light mode.
- Image sharing with the saved image file.

MemoLens is not trying to replace your whole photo library. It is built for the smaller set of images that need a story attached.

## Screenshot Checklist

1. MemoLens onboarding with Google sign-in.
2. Empty memories screen with Create Memory action.
3. Create Memory screen with selected photo, caption, mood, and tags.
4. Memories home with saved cards, stats, search, favorites, moods, and tag filters.
5. Memory detail with edit, favorite, share, and delete actions.
6. Native Android share sheet showing an image preview.
7. Settings screen with local-first privacy and storage actions.
8. Dark mode and light mode examples.

## Feature Graphic Idea

Text:

Save the photo. Keep the feeling.

Visual:

A clean phone mockup showing a memory card with a photo, caption, mood, and search field.

## Privacy Policy Draft Points

This app currently:

- Stores saved images, captions, moods, tags, and favorites locally on the device.
- Uses Google Sign-In for account identity.
- Does not upload memory content to a custom backend.
- Uses microphone and speech recognition only when the user starts caption dictation.
- Uses camera and photo library only when the user chooses to create a memory.

Suggested app config:

```env
EXPO_PUBLIC_PRIVACY_POLICY_URL=https://your-hosted-policy-url
```

## Data Safety Draft

Data collected:

- Name, email, and profile photo from Google Sign-In.

Data handled locally:

- User-added images.
- User-written or dictated captions.
- Moods, tags, favorites.
- Theme preference.

Data sharing:

- Images are shared only when the user taps share and chooses a target app.

Security notes:

- Add biometric lock before marketing the app for sensitive/private storage.
- Add cloud backup only after privacy policy and account deletion flows are ready.

## First Production Scope

Ship these before Play Store production:

- Hosted privacy policy URL.
- Accessibility pass.
- Crash reporting.
- At least 12 closed-test opted-in testers for 14 days, per current Play Console requirement for new personal developer accounts.

Keep OCR, AI captions, and backup as post-launch upgrades.
