import { GalleryItem } from '../types/gallery';

export function parseTagInput(input: string): string[] {
  const uniqueTags = new Map<string, string>();

  input.split(',').forEach((rawTag) => {
    const tag = normalizeTag(rawTag);

    if (!tag) {
      return;
    }

    const key = tag.toLowerCase();

    if (!uniqueTags.has(key)) {
      uniqueTags.set(key, tag);
    }
  });

  return [...uniqueTags.values()].slice(0, 8);
}

export function formatTagInput(tags?: string[]): string {
  return (tags ?? []).join(', ');
}

export function buildSearchText(item: GalleryItem): string {
  return [item.caption, ...(item.tags ?? [])].join(' ').toLowerCase();
}

function normalizeTag(rawTag: string): string {
  return rawTag.replace(/^#+/, '').trim().replace(/\s+/g, ' ');
}
