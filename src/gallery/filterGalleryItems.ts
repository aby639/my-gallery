import { GalleryItem } from '../types/gallery';

export function filterGalleryItems(items: GalleryItem[], searchText: string): GalleryItem[] {
  const query = searchText.trim().toLowerCase();

  return [...items]
    .filter((item) => (query.length === 0 ? true : item.caption.toLowerCase().includes(query)))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
