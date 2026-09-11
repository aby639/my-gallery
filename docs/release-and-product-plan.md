# MemoLens Release And Product Plan

**Production work is paused as of 11 September 2026.** These are reference commands for a future release, not actions to run during the pause. See [the dated status record](release-status.md).

## Build And Update Model

Google Play distributes reviewed native app builds. EAS Update distributes compatible JavaScript and assets to an installed build on the matching channel/runtime. A GitHub push alone does neither.

Native dependencies, permissions, SDK changes and other native configuration changes require a new native build. Runtime versions must distinguish incompatible native builds; this project currently uses a fixed Android runtime string in `app.json`, so review it explicitly when native code changes. See [Expo runtime compatibility](https://docs.expo.dev/eas-update/runtime-versions/).

| Command | Effect when deliberately run |
| --- | --- |
| `npm run build:android:preview` | Request an EAS internal-distribution preview build |
| `npm run build:android:production` | Request a production-profile Android App Bundle |
| `npm run update:preview -- --message "Update note"` | Publish an update to the preview channel |
| `npm run update:production -- --message "Update note"` | Publish an update to installed compatible production-channel builds |

The EAS profile named `production` is a build/update configuration, not evidence of Play Store production approval. Cloud builds may consume account quota. No build or update is needed just to commit documentation and media.

## Before A Future Release

1. Test the current code on a real Android device, including camera, dictation, voice recording/playback, persistence, sharing and sign-in.
2. Run `npm test` and `npm run typecheck`; review platform-specific failures rather than relying on web screenshots.
3. Check runtime compatibility, package identity, signing and the Play app-signing OAuth certificate.
4. Review the store text, data-safety answers, privacy policy and app-access instructions against actual app behaviour.
5. Compare the current marketing captures against native phone/tablet layouts.
6. Resume the closed-test process in [release-status.md](release-status.md) before seeking production access.

## Repository Boundaries

Commit source, configuration, lockfiles, documentation and the curated media pack. Keep secrets, signing keys, personal memories, tester email lists, account screenshots, dependencies, build output and raw video intermediates out of Git.

The current pack is [2026-09-memolens](../playstore-assets/2026-09-memolens/README.md). `production-v4-wow` is an older archive. Do not remove local draft videos merely to keep them out of Git; the ignore rules already exclude them.

## Product Direction

MemoLens is a small photo journal, not a replacement for a cloud photo library. Captions, moods, tags and voice notes add context to personal memories, study references and useful images.

Candidate improvements, not commitments or implemented features:

- Backup/export and restore, with clear handling of local data loss.
- Accessibility, larger-text and native tablet layout checks.
- Date/source search filters and branded share cards.
- Optional OCR, caption suggestions and biometric locking.
- Optional crash reporting only after reviewing consent and privacy implications.

## References

- [EAS Build introduction](https://docs.expo.dev/build/introduction/)
- [EAS Update runtime versions](https://docs.expo.dev/eas-update/runtime-versions/)
- [Play Console testing setup](https://support.google.com/googleplay/android-developer/answer/9845334?hl=en)
