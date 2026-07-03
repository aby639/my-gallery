import { useEffect, useRef } from 'react';
import { Animated, GestureResponderEvent, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppTheme } from '../theme/theme';
import { GalleryItem } from '../types/gallery';

type GalleryCardProps = {
  item: GalleryItem;
  onPress: (item: GalleryItem) => void;
  onShare: (item: GalleryItem) => void;
  theme: AppTheme;
  index?: number;
};

export function GalleryCard({ index = 0, item, onPress, onShare, theme }: GalleryCardProps) {
  const entrance = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const created = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
    new Date(item.createdAt),
  );
  const visibleTags = item.tags?.slice(0, 2) ?? [];
  const mood = item.mood ?? (item.isFavorite ? 'Favorite' : undefined);

  useEffect(() => {
    Animated.timing(entrance, {
      delay: Math.min(index * 35, 180),
      duration: 260,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [entrance, index]);

  const pressTo = (value: number) => {
    Animated.spring(scale, {
      damping: 18,
      mass: 0.45,
      stiffness: 260,
      toValue: value,
      useNativeDriver: true,
    }).start();
  };

  const handleShare = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onShare(item);
  };

  return (
    <Animated.View
      style={[
        {
          opacity: entrance,
          transform: [
            {
              translateY: entrance.interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0],
              }),
            },
            { scale },
          ],
        },
      ]}
    >
      <Pressable
        accessibilityLabel={`Open ${item.caption || 'memory'}`}
        accessibilityRole="button"
        onPress={() => onPress(item)}
        onPressIn={() => pressTo(0.985)}
        onPressOut={() => pressTo(1)}
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surfaceAlt,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            boxShadow: `0 16px 34px ${theme.colors.shadow}`,
          },
        ]}
      >
        <View style={styles.imageWrap}>
          <Image
            accessibilityLabel={item.caption || 'MemoLens memory'}
            resizeMode="cover"
            source={{ uri: item.imageUri }}
            style={[
              styles.image,
              {
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
              },
            ]}
          />
          <View style={[styles.imageShade, { backgroundColor: theme.colors.overlay, borderRadius: theme.radius.md }]} />
          <View
            style={[
              styles.sourcePill,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.sm,
              },
            ]}
          >
            <Text style={[styles.sourceText, { color: theme.colors.text }]}>
              {item.source === 'camera' ? 'Camera' : 'Library'}
            </Text>
          </View>
          {item.isFavorite ? (
            <View
              style={[
                styles.favoriteMark,
                {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.sm,
                },
              ]}
            >
              <Text style={[styles.favoriteText, { color: theme.colors.primaryText }]}>Saved</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          {mood ? (
            <View
              style={[
                styles.moodPill,
                {
                  backgroundColor: theme.colors.accentSoft,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.sm,
                },
              ]}
            >
              <Text numberOfLines={1} style={[styles.moodText, { color: theme.colors.accent }]}>
                {mood}
              </Text>
            </View>
          ) : null}
          <View style={styles.captionRow}>
            <Text numberOfLines={2} style={[styles.caption, { color: theme.colors.text }]}>
              {item.caption || 'Untitled memory'}
            </Text>
            <Pressable
              accessibilityLabel={`Share ${item.caption || 'memory'}`}
              accessibilityRole="button"
              onPress={handleShare}
              style={({ pressed }) => [
                styles.shareButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.sm,
                  opacity: pressed ? 0.72 : 1,
                },
              ]}
            >
              <Text style={[styles.shareText, { color: theme.colors.text }]}>Send</Text>
            </Pressable>
          </View>
          <Text style={[styles.meta, { color: theme.colors.muted }]}>
            {created} · {item.source === 'camera' ? 'Captured' : 'Saved'}
          </Text>
          {visibleTags.length ? (
            <View style={styles.tagRow}>
              {visibleTags.map((tag) => (
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
          ) : (
            <View
              style={[
                styles.tag,
                {
                  alignSelf: 'flex-start',
                  backgroundColor: theme.colors.surfaceAlt,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.sm,
                },
              ]}
            >
              <Text style={[styles.tagText, { color: theme.colors.muted }]}>No tag</Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: 8,
    minHeight: 122,
    padding: 12,
  },
  caption: {
    flex: 1,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 19,
    minWidth: 0,
  },
  captionRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    borderWidth: 1,
    flex: 1,
    overflow: 'hidden',
  },
  favoriteMark: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  favoriteText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0,
  },
  image: {
    aspectRatio: 0.92,
    borderWidth: 1,
    width: '100%',
  },
  imageShade: {
    bottom: 8,
    height: '34%',
    left: 8,
    opacity: 0.32,
    position: 'absolute',
    right: 8,
  },
  imageWrap: {
    padding: 7,
  },
  meta: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
  },
  moodPill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    maxWidth: '100%',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  moodText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
  },
  shareButton: {
    borderWidth: 1,
    minHeight: 30,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  shareText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0,
  },
  sourcePill: {
    borderWidth: 1,
    bottom: 18,
    left: 18,
    paddingHorizontal: 8,
    paddingVertical: 5,
    position: 'absolute',
  },
  sourceText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0,
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
    fontWeight: '800',
    letterSpacing: 0,
  },
});
