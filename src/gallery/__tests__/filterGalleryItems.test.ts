import { filterGalleryItems } from '../filterGalleryItems';
import { GalleryItem } from '../../types/gallery';

const items: GalleryItem[] = [
  {
    id: '1',
    imageUri: 'one.jpg',
    caption: 'Evening walk',
    createdAt: '2026-04-20T10:00:00.000Z',
    source: 'library',
  },
  {
    id: '2',
    imageUri: 'two.jpg',
    caption: 'Coffee light',
    createdAt: '2026-04-20T11:00:00.000Z',
    source: 'camera',
  },
  {
    id: '3',
    imageUri: 'three.jpg',
    caption: 'Blue hour',
    createdAt: '2026-04-19T10:00:00.000Z',
    source: 'library',
  },
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
