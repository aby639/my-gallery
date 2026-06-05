# MemoLens Release And Product Plan

## The Release Model

Use both Play Store updates and EAS Update. They solve different problems.

- Play Store is the main public distribution channel. Users install from Play once, get trusted updates, and do not deal with APK files.
- EAS Update is for fast JavaScript, UI, copy, styling, and compatible asset fixes after a Play Store or preview build is already installed.
- New APK/AAB builds are still required for native changes: permissions, Expo SDK upgrades, native dependencies, Google Sign-In native setup, app icons, package identifiers, version codes, and runtime version changes.

## Normal Workflow

1. Build locally and test on emulator/device.
2. Push code to GitHub.
3. Create a preview build for quick tester checks.
4. Publish compatible UI fixes with EAS Update on the `preview` or `production` channel.
5. Build a production Android App Bundle for Play Store.
6. Release first through Play internal testing, then closed testing, then production.
7. Use EAS Update for safe UI/JS updates between Play Store releases.
8. Use Play Store releases for native or major updates.

## Commands

Preview APK for testers:

```bash
npm run build:android:preview
```

Production App Bundle for Google Play:

```bash
npm run build:android:production
```

Production OTA update:

```bash
npm run update:production -- --message "Short update note"
```

## GitHub Repo Checklist

- Keep `.env` private and never commit OAuth client secrets.
- Commit `README.md`, `app.json`, `eas.json`, `package.json`, `package-lock.json`, `src/`, `assets/`, `docs/`, and `android/`.
- Do not commit `node_modules/`, `dist/`, `.expo/`, logs, screenshots, or local APK output.
- Use GitHub issues for product ideas and bugs.
- Use GitHub releases only for preview APKs if you want direct tester downloads outside Play Store.

## Play Store Checklist

- Create the app with package name `com.ablespace.mygallery`.
- Upload Android App Bundles, not only APKs.
- Keep Play App Signing enabled.
- Add the Play app-signing SHA-1 certificate to the Google Cloud Android OAuth client.
- Add privacy policy, app access instructions, content rating, data safety, screenshots, icon, feature graphic, and store description.
- Use internal testing for quick verification.
- For production access on a new personal developer account, run a closed test with at least 12 opted-in testers for at least 14 days, then apply for production access.

## Product Positioning

MemoLens should not compete with Google Photos as a full replacement. The strongest niche is:

> A private, local-first memory gallery where every saved image has a searchable caption, mood, and tags.

That makes the app useful for:

- Students saving whiteboards, diagrams, notes, and screenshots.
- People saving receipts, documents, and warranty photos.
- Creators collecting visual references with voice captions.
- Anyone who wants a small private image notebook instead of a huge cloud gallery.

## Product Roadmap

Phase 1, make the current app feel complete:

- Share cards that combine photo, caption, date, and MemoLens branding.
- Search filters for camera/library/date.
- Import/export backup.
- Empty-state sample tips.
- Accessibility pass and larger text checks.

Phase 2, make it genuinely useful:

- OCR search inside images.
- AI-generated caption suggestions.
- Biometric lock.
- Google Drive backup/export.
- Import/export ZIP.
- Reminder or pinned collections.

Phase 3, make it Play Store-ready:

- Crash reporting.
- Analytics for core flows.
- Hosted privacy policy URL.
- Account deletion or local account reset flow.
- Closed-test feedback workflow.
