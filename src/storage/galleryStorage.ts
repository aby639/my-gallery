import AsyncStorage from '@react-native-async-storage/async-storage';

import { GalleryItem, GalleryUser } from '../types/gallery';

const ITEMS_KEY = 'my-gallery/items';
const USER_KEY = 'my-gallery/user';
const THEME_KEY = 'my-gallery/theme';

export type ThemePreference = 'light' | 'dark';

export async function loadGalleryItems(): Promise<GalleryItem[]> {
  const raw = await AsyncStorage.getItem(ITEMS_KEY);

  if (!raw) {
    return [];
  }

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

  if (!raw) {
    return null;
  }

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
