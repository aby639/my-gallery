import { GalleryItem } from '../types/gallery';

export const MEMORY_MOODS = ['Peaceful', 'Happy', 'Focused', 'Grateful', 'Inspired', 'Loved'] as const;

export const SUGGESTED_TAGS = ['Nature', 'Study', 'Work', 'Family', 'Travel', 'Receipt', 'Idea', 'Morning'] as const;

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
  const createdDate = new Date(item.createdAt);
  const dateText = Number.isNaN(createdDate.getTime())
    ? item.createdAt
    : new Intl.DateTimeFormat(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(createdDate);

  return [item.caption, item.mood, item.source, item.createdAt, dateText, ...(item.tags ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function normalizeTag(rawTag: string): string {
  return rawTag.replace(/^#+/, '').trim().replace(/\s+/g, ' ');
}
