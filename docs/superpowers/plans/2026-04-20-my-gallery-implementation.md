# My Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Ablespace My Gallery assignment as a polished Expo React Native app for iOS, Android, and Web.

**Architecture:** The app uses Expo managed React Native with React Navigation. Screen components own UI flow, while small modules own persistence, filtering, auth configuration, voice capture, and sharing so they can be understood and tested independently.

**Tech Stack:** Expo, React Native, TypeScript, React Navigation, AsyncStorage, Expo Image Picker, Expo AuthSession Google provider, Expo Sharing, Web Speech API, `@react-native-voice/voice`, Jest.

---

## Visual Direction

**Visual thesis:** Premium Minimal gallery workspace with crisp white/ink surfaces, restrained borders, confident spacing, and one black primary action.

**Content plan:** Login introduces the product and Google auth; Gallery is the primary workspace with profile, search, grid, and add action; Add/Detail screens handle capture, captions, voice, edit, delete, and share; README explains setup and demo coverage.

**Interaction thesis:** Use smooth stack navigation, stable grid sizing, soft press feedback on image cards/buttons, and short status banners for errors or unsupported platform behavior.

## File Map

- Create `package.json`: npm scripts and dependencies.
- Create `app.json`: Expo app metadata and native permission strings.
- Create `babel.config.js`: Expo Babel preset.
- Create `tsconfig.json`: strict TypeScript settings.
- Create `jest.config.js`: Jest Expo test setup.
- Create `jest.setup.ts`: AsyncStorage and browser API test setup.
- Create `App.tsx`: app root and provider wiring.
- Create `src/types/gallery.ts`: shared `GalleryItem`, `GalleryUser`, and navigation types.
- Create `src/theme/theme.ts`: light/dark theme tokens and navigation themes.
- Create `src/gallery/filterGalleryItems.ts`: pure caption/date filtering.
- Create `src/gallery/__tests__/filterGalleryItems.test.ts`: failing tests before implementation.
- Create `src/storage/galleryStorage.ts`: AsyncStorage read/write helpers with corruption recovery.
- Create `src/storage/__tests__/galleryStorage.test.ts`: failing tests before implementation.
- Create `src/auth/authConfig.ts`: Google OAuth env handling.
- Create `src/auth/demoUser.ts`: development-only demo profile.
- Create `src/auth/useGoogleAuth.ts`: Google login hook with demo fallback.
- Create `src/voice/useVoiceCaption.ts`: web/native speech-recognition hook with fallback messages.
- Create `src/utils/imageAssets.ts`: image-picker/camera asset normalization.
- Create `src/utils/shareGalleryItem.ts`: native/web sharing helper.
- Create `src/components/PrimaryButton.tsx`: app button.
- Create `src/components/ProfileHeader.tsx`: avatar/name/theme/sign-out header.
- Create `src/components/SearchBar.tsx`: search field.
- Create `src/components/GalleryCard.tsx`: image card with caption.
- Create `src/components/GalleryGrid.tsx`: responsive grid.
- Create `src/components/EmptyState.tsx`: empty/search-empty states.
- Create `src/components/StatusBanner.tsx`: short error/status feedback.
- Create `src/screens/LoginScreen.tsx`: Google/demo sign-in.
- Create `src/screens/GalleryScreen.tsx`: main grid, search, image source actions.
- Create `src/screens/AddItemScreen.tsx`: selected image, manual/voice caption, save.
- Create `src/screens/DetailScreen.tsx`: preview, edit caption, share, delete.
- Create `src/navigation/AppNavigator.tsx`: stack navigation for auth/app screens.
- Create `.env.example`: Google OAuth public env keys.
- Create `README.md`: setup, run, design choices, trade-offs, demo checklist.

## Task 1: Scaffold Expo App

**Files:**
- Create: `package.json`
- Create: `app.json`
- Create: `babel.config.js`
- Create: `tsconfig.json`
- Create: `jest.config.js`
- Create: `jest.setup.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Generate Expo TypeScript baseline**

Run: `npx create-expo-app@latest scaffold --template blank-typescript --yes`

Expected: Expo project files created in `scaffold/`.

- [ ] **Step 2: Move baseline files into project root**

Copy `package.json`, `app.json`, `babel.config.js`, `tsconfig.json`, `App.tsx`, and initial assets from `scaffold/` into `D:\Downloads\my_gallary`, then remove `scaffold/`.

Expected: root contains Expo app files without deleting `docs/` or `.git/`.

- [ ] **Step 3: Install assignment dependencies**

Run:

```bash
npx expo install @react-native-async-storage/async-storage expo-auth-session expo-crypto expo-image-picker expo-sharing expo-web-browser react-native-safe-area-context react-native-screens
npm install @react-navigation/native @react-navigation/native-stack @react-native-voice/voice
npm install --save-dev jest jest-expo @types/jest @testing-library/react-native react-test-renderer
```

Expected: dependencies install and `package-lock.json` is created.

- [ ] **Step 4: Add test configuration**

Create `jest.config.js`:

```js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.expo/'],
};
```

Create `jest.setup.ts`:

```ts
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
```

Add scripts to `package.json`:

```json
{
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "test": "jest --runInBand",
  "typecheck": "tsc --noEmit"
}
```

- [ ] **Step 5: Commit scaffold**

Run:

```bash
git add .
git commit -m "chore: scaffold expo gallery app"
```

## Task 2: Add Tested Storage And Filtering

**Files:**
- Create: `src/types/gallery.ts`
- Create: `src/gallery/filterGalleryItems.ts`
- Create: `src/gallery/__tests__/filterGalleryItems.test.ts`
- Create: `src/storage/galleryStorage.ts`
- Create: `src/storage/__tests__/galleryStorage.test.ts`

- [ ] **Step 1: Write failing filter tests**

Create `src/gallery/__tests__/filterGalleryItems.test.ts`:

```ts
import { filterGalleryItems } from '../filterGalleryItems';
import { GalleryItem } from '../../types/gallery';

const items: GalleryItem[] = [
  { id: '1', imageUri: 'one.jpg', caption: 'Evening walk', createdAt: '2026-04-20T10:00:00.000Z', source: 'library' },
  { id: '2', imageUri: 'two.jpg', caption: 'Coffee light', createdAt: '2026-04-20T11:00:00.000Z', source: 'camera' },
  { id: '3', imageUri: 'three.jpg', caption: 'Blue hour', createdAt: '2026-04-19T10:00:00.000Z', source: 'library' },
];

describe('filterGalleryItems', () => {
  it('returns newest items first when search is empty', () => {
    expect(filterGalleryItems(items, '').map((item) => item.id)).toEqual(['2', '1', '3']);
  });

  it('filters captions case-insensitively and trims whitespace', () => {
    expect(filterGalleryItems(items, '  LIGHT ').map((item) => item.id)).toEqual(['2']);
  });

  it('returns an empty array when no captions match', () => {
    expect(filterGalleryItems(items, 'forest')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run filter tests and verify RED**

Run: `npm test -- src/gallery/__tests__/filterGalleryItems.test.ts`

Expected: FAIL because `filterGalleryItems` does not exist.

- [ ] **Step 3: Implement gallery types and filter**

Create `src/types/gallery.ts`:

```ts
export type GallerySource = 'camera' | 'library';

export type GalleryItem = {
  id: string;
  imageUri: string;
  caption: string;
  createdAt: string;
  source: GallerySource;
};

export type GalleryUser = {
  id: string;
  name: string;
  email?: string;
  photoUrl?: string;
};
```

Create `src/gallery/filterGalleryItems.ts`:

```ts
import { GalleryItem } from '../types/gallery';

export function filterGalleryItems(items: GalleryItem[], searchText: string): GalleryItem[] {
  const query = searchText.trim().toLowerCase();
  return [...items]
    .filter((item) => (query.length === 0 ? true : item.caption.toLowerCase().includes(query)))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
```

- [ ] **Step 4: Run filter tests and verify GREEN**

Run: `npm test -- src/gallery/__tests__/filterGalleryItems.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing storage tests**

Create `src/storage/__tests__/galleryStorage.test.ts`:

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearGalleryItems,
  loadGalleryItems,
  saveGalleryItems,
  loadThemePreference,
  saveThemePreference,
} from '../galleryStorage';
import { GalleryItem } from '../../types/gallery';

const item: GalleryItem = {
  id: 'item-1',
  imageUri: 'file://image.jpg',
  caption: 'Saved locally',
  createdAt: '2026-04-20T12:00:00.000Z',
  source: 'library',
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('galleryStorage', () => {
  it('persists and loads gallery items', async () => {
    await saveGalleryItems([item]);
    await expect(loadGalleryItems()).resolves.toEqual([item]);
  });

  it('returns an empty list when stored gallery data is corrupted', async () => {
    await AsyncStorage.setItem('my-gallery/items', '{bad json');
    await expect(loadGalleryItems()).resolves.toEqual([]);
  });

  it('clears gallery items', async () => {
    await saveGalleryItems([item]);
    await clearGalleryItems();
    await expect(loadGalleryItems()).resolves.toEqual([]);
  });

  it('persists theme preference', async () => {
    await saveThemePreference('dark');
    await expect(loadThemePreference()).resolves.toBe('dark');
  });
});
```

- [ ] **Step 6: Run storage tests and verify RED**

Run: `npm test -- src/storage/__tests__/galleryStorage.test.ts`

Expected: FAIL because `galleryStorage` does not exist.

- [ ] **Step 7: Implement storage helpers**

Create `src/storage/galleryStorage.ts`:

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GalleryItem, GalleryUser } from '../types/gallery';

const ITEMS_KEY = 'my-gallery/items';
const USER_KEY = 'my-gallery/user';
const THEME_KEY = 'my-gallery/theme';

export type ThemePreference = 'light' | 'dark';

export async function loadGalleryItems(): Promise<GalleryItem[]> {
  const raw = await AsyncStorage.getItem(ITEMS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveGalleryItems(items: GalleryItem[]): Promise<void> {
  await AsyncStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

export async function clearGalleryItems(): Promise<void> {
  await AsyncStorage.removeItem(ITEMS_KEY);
}

export async function loadUser(): Promise<GalleryUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GalleryUser;
  } catch {
    return null;
  }
}

export async function saveUser(user: GalleryUser): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY);
}

export async function loadThemePreference(): Promise<ThemePreference> {
  const raw = await AsyncStorage.getItem(THEME_KEY);
  return raw === 'dark' ? 'dark' : 'light';
}

export async function saveThemePreference(theme: ThemePreference): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, theme);
}
```

- [ ] **Step 8: Run storage tests and verify GREEN**

Run: `npm test -- src/storage/__tests__/galleryStorage.test.ts`

Expected: PASS.

- [ ] **Step 9: Commit tested data modules**

Run:

```bash
git add src
git commit -m "feat: add tested gallery data helpers"
```

## Task 3: Build Navigation, Auth, And Theme Shell

**Files:**
- Modify: `App.tsx`
- Create: `src/theme/theme.ts`
- Create: `src/auth/authConfig.ts`
- Create: `src/auth/demoUser.ts`
- Create: `src/auth/useGoogleAuth.ts`
- Create: `src/navigation/AppNavigator.tsx`
- Create: `src/screens/LoginScreen.tsx`
- Modify: `src/types/gallery.ts`

- [ ] **Step 1: Implement theme tokens**

Create `src/theme/theme.ts` with light/dark colors, spacing, radius, and navigation themes.

- [ ] **Step 2: Implement auth config and demo user**

Create `src/auth/authConfig.ts`, `src/auth/demoUser.ts`, and `src/auth/useGoogleAuth.ts`. Read `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, and `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`. If credentials are missing, expose a `signInDemo` path and an auth warning for reviewers.

- [ ] **Step 3: Implement navigation shell**

Create `src/navigation/AppNavigator.tsx` with native-stack routes for Login, Gallery, AddItem, and Detail.

- [ ] **Step 4: Implement login screen**

Create `src/screens/LoginScreen.tsx` with Premium Minimal styling, Google sign-in, demo fallback, and concise credential guidance.

- [ ] **Step 5: Wire root app**

Modify `App.tsx` to load stored user/theme, show loading state, provide navigation, and persist theme changes.

- [ ] **Step 6: Typecheck**

Run: `npm run typecheck`

Expected: no TypeScript errors for shell code.

- [ ] **Step 7: Commit shell**

Run:

```bash
git add App.tsx src
git commit -m "feat: add auth and navigation shell"
```

## Task 4: Build Gallery, Add, And Detail Flows

**Files:**
- Create: `src/components/PrimaryButton.tsx`
- Create: `src/components/ProfileHeader.tsx`
- Create: `src/components/SearchBar.tsx`
- Create: `src/components/GalleryCard.tsx`
- Create: `src/components/GalleryGrid.tsx`
- Create: `src/components/EmptyState.tsx`
- Create: `src/components/StatusBanner.tsx`
- Create: `src/screens/GalleryScreen.tsx`
- Create: `src/screens/AddItemScreen.tsx`
- Create: `src/screens/DetailScreen.tsx`
- Create: `src/utils/imageAssets.ts`
- Modify: `src/types/gallery.ts`

- [ ] **Step 1: Implement reusable UI components**

Create focused components using theme tokens, stable dimensions, responsive grid columns, and no decorative nested card stacks.

- [ ] **Step 2: Implement image normalization**

Create `src/utils/imageAssets.ts` to generate a persistable image URI from Expo picker assets. Use a web data URI when base64 is available.

- [ ] **Step 3: Implement Gallery screen**

Load persisted items, apply `filterGalleryItems`, show profile header, search, empty states, grid, Add action, camera/gallery source actions, and permission/cancel messages.

- [ ] **Step 4: Implement Add screen**

Show chosen image, text caption field, voice caption button, save action, and cancel path.

- [ ] **Step 5: Implement Detail screen**

Show full image, editable caption, save caption, share, delete, and metadata.

- [ ] **Step 6: Run tests and typecheck**

Run:

```bash
npm test
npm run typecheck
```

Expected: all tests pass and no TypeScript errors.

- [ ] **Step 7: Commit gallery flows**

Run:

```bash
git add src App.tsx
git commit -m "feat: build gallery capture and detail flows"
```

## Task 5: Add Voice, Sharing, Docs, And Final Polish

**Files:**
- Create: `src/voice/useVoiceCaption.ts`
- Create: `src/utils/shareGalleryItem.ts`
- Create: `.env.example`
- Create: `README.md`
- Modify: `app.json`
- Modify: `src/screens/AddItemScreen.tsx`
- Modify: `src/screens/DetailScreen.tsx`
- Modify: `src/screens/GalleryScreen.tsx`

- [ ] **Step 1: Implement voice captions**

Create a hook that uses Web Speech API on web and `@react-native-voice/voice` on iOS/Android. Return clear unsupported/permission messages and keep manual text input available.

- [ ] **Step 2: Implement sharing**

Create `shareGalleryItem` using Expo Sharing on native, Web Share API on web, and a clipboard/message fallback when sharing is unsupported.

- [ ] **Step 3: Add app metadata and permissions**

Update `app.json` with app name, slug, scheme, camera/photo/microphone permission descriptions, and web bundler settings.

- [ ] **Step 4: Add README and env sample**

README must include setup, iOS/Android/Web run commands, Google OAuth env setup, feature checklist, design choices, trade-offs, and demo video checklist.

- [ ] **Step 5: Run final verification**

Run:

```bash
npm test
npm run typecheck
npx expo export --platform web
```

Expected: tests pass, TypeScript passes, and web export completes.

- [ ] **Step 6: Commit final polish**

Run:

```bash
git add .
git commit -m "docs: add setup guide and final polish"
```

## Self-Review

Spec coverage:
- Google login and profile header: Task 3.
- Image picker/camera: Task 4.
- Captions via voice/manual text: Task 4 and Task 5.
- Local persistence and offline use: Task 2 and Task 4.
- Sharing: Task 5.
- Responsive Premium Minimal UI and React Navigation: Task 3 and Task 4.
- Dark mode/search bonus: Task 2, Task 3, Task 4.
- README and demo guidance: Task 5.

Placeholder scan: no TBD, TODO, or unspecified implementation steps remain.

Type consistency: `GalleryItem`, `GalleryUser`, and route names are introduced before use and reused consistently.
