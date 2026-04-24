import { buildSearchText } from './galleryMetadata';
import { GalleryFilter, GalleryItem } from '../types/gallery';

export function filterGalleryItems(
  items: GalleryItem[],
  searchText: string,
  activeFilter: GalleryFilter = 'all',
  activeTag?: string,
): GalleryItem[] {
  const query = searchText.trim().toLowerCase();
  const normalizedTag = activeTag?.trim().toLowerCase();

  return [...items]
    .filter((item) => {
      if (activeFilter === 'favorites' && !item.isFavorite) {
        return false;
      }

      if (activeFilter === 'camera' && item.source !== 'camera') {
        return false;
      }

      if (activeFilter === 'library' && item.source !== 'library') {
        return false;
      }

      if (query.length > 0 && !buildSearchText(item).includes(query)) {
        return false;
      }

      if (normalizedTag && !(item.tags ?? []).some((tag) => tag.toLowerCase() === normalizedTag)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function collectGalleryTags(items: GalleryItem[], limit = 6): string[] {
  const usage = new Map<string, { count: number; label: string }>();

  items.forEach((item) => {
    (item.tags ?? []).forEach((tag) => {
      const key = tag.toLowerCase();
      const existing = usage.get(key);

      if (existing) {
        existing.count += 1;
        return;
      }

      usage.set(key, { count: 1, label: tag });
    });
  });

  return [...usage.values()]
    .sort((a, b) => (b.count === a.count ? a.label.localeCompare(b.label) : b.count - a.count))
    .slice(0, limit)
    .map((entry) => entry.label);
}
