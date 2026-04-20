# My Gallery - Ablespace React Native Assignment Design

Date: 2026-04-20
Project folder: D:\Downloads\my_gallary

## Goal
Build a polished cross-platform React Native gallery app for iOS, Android, and Web. The app demonstrates Google login, media capture/picking, voice or text captions, local persistence, sharing, responsive UI, and clear setup instructions.

## Chosen Direction
Use the approved Premium Minimal style: clean light/dark surfaces, tight spacing, visible user profile header, search, a responsive image grid, and focused add/edit flows. The UI should feel professional and easy for reviewers to test.

## Technical Approach
Use Expo managed React Native because it supports iOS, Android, and Web from one codebase and fits the assignment timeline. Use React Navigation for the app flow. Use Expo libraries for image picking, camera access, sharing, local storage, and auth/session handling.

## Authentication
Implement Google sign-in with Expo AuthSession Google provider. Google OAuth client IDs will be read from environment variables and documented in the README. If credentials are missing during local review, show a clear setup hint and provide a demo mode only for development so the rest of the assignment can still be inspected.

After login, show the user's name and profile picture at the top of the gallery screen. Support sign out.

## Gallery Flow
The logged-in gallery screen contains:
- Profile header with name, avatar, dark-mode toggle, and sign-out action.
- Search input for filtering by caption text.
- Responsive grid of image cards with captions underneath.
- Empty state guiding the user to add the first image.
- Floating or prominent Add action.

Adding an image opens an add flow:
- Choose from gallery on all platforms.
- Use camera where supported.
- Add a caption manually or dictate it.
- Save locally.

Image cards support preview/detail, editing caption, deleting, and sharing image plus caption.

## Voice Captions
Use the browser Web Speech API for web where available. For native platforms, use an Expo-compatible speech recognition package if installable in the environment; otherwise provide a clean fallback and document the native limitation. Manual text input is always available.

## Persistence
Store gallery items locally with AsyncStorage. Each item stores id, image URI, caption, created timestamp, and source type. Persist dark-mode preference and the last signed-in profile. The app is local-first and remains usable offline for adding and editing local items.

## Sharing
Use Expo Sharing where available. On web, use the Web Share API when available and fall back to copying/downloading-friendly behavior where necessary. Show user-friendly messages if a platform does not support a share path.

## Error Handling And Edge Cases
Handle permission denial, cancelled image picking, missing auth credentials, unavailable voice APIs, unsupported sharing, corrupted saved data, and empty/search-no-results states. Keep messages short and useful.

## Testing And Verification
Include focused tests for storage helpers and gallery filtering. Verify the app starts on web. README will include commands for iOS, Android, and Web, plus Google OAuth setup notes and demo-video checklist.

## Deliverables
Create complete source code, README, and setup instructions in the repo. Include notes for demo video coverage: login, profile header, add from picker/camera, voice/manual caption, search, dark mode, local persistence, share, and web/mobile runs.
