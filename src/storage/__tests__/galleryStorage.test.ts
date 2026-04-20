import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearGalleryItems,
  loadGalleryItems,
  loadThemePreference,
  saveGalleryItems,
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
