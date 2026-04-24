import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '../theme/theme';
import { GalleryItem } from '../types/gallery';

type GalleryCardProps = {
  item: GalleryItem;
  onPress: (item: GalleryItem) => void;
  theme: AppTheme;
};

export function GalleryCard({ item, onPress, theme }: GalleryCardProps) {
  const created = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
    new Date(item.createdAt),
  );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          opacity: pressed ? 0.78 : 1,
        },
      ]}
    >
      <Image
        accessibilityLabel={item.caption || 'Gallery image'}
        resizeMode="cover"
        source={{ uri: item.imageUri }}
        style={[styles.image, { borderTopLeftRadius: theme.radius.md, borderTopRightRadius: theme.radius.md }]}
      />
      <View style={styles.body}>
        <Text numberOfLines={2} style={[styles.caption, { color: theme.colors.text }]}>
          {item.caption || 'Untitled memory'}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: theme.colors.muted }]}>
            {created} · {item.source === 'camera' ? 'Camera' : 'Library'}
          </Text>
          {item.isFavorite ? (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: theme.colors.surfaceAlt,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.sm,
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: theme.colors.text }]}>Favorite</Text>
            </View>
          ) : null}
        </View>
        {item.tags?.length ? (
          <View style={styles.tagRow}>
            {item.tags.slice(0, 2).map((tag) => (
              <View
                key={tag}
                style={[
                  styles.tag,
                  {
                    backgroundColor: theme.colors.surfaceAlt,
                    borderColor: theme.colors.border,
                    borderRadius: theme.radius.sm,
                  },
                ]}
              >
                <Text numberOfLines={1} style={[styles.tagText, { color: theme.colors.text }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0,
  },
  body: {
    gap: 6,
    minHeight: 94,
    padding: 10,
  },
  caption: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 18,
  },
  card: {
    borderWidth: 1,
    flex: 1,
    overflow: 'hidden',
  },
  image: {
    aspectRatio: 1,
    width: '100%',
  },
  meta: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    borderWidth: 1,
    maxWidth: '100%',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0,
  },
});
