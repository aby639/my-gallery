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
        <Text style={[styles.meta, { color: theme.colors.muted }]}>
          {created} · {item.source === 'camera' ? 'Camera' : 'Library'}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: 6,
    minHeight: 72,
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
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0,
  },
});
