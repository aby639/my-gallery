import { FlatList, ListRenderItemInfo, StyleSheet, useWindowDimensions, View } from 'react-native';
import type { DimensionValue } from 'react-native';

import { AppTheme } from '../theme/theme';
import { GalleryItem } from '../types/gallery';
import { GalleryCard } from './GalleryCard';

type GalleryGridProps = {
  items: GalleryItem[];
  onItemPress: (item: GalleryItem) => void;
  onItemShare: (item: GalleryItem) => void;
  theme: AppTheme;
  ListEmptyComponent: React.ReactElement;
};

export function GalleryGrid({ items, onItemPress, onItemShare, theme, ListEmptyComponent }: GalleryGridProps) {
  const { width } = useWindowDimensions();
  const columns = width >= 1040 ? 4 : width >= 720 ? 3 : 2;

  const itemWidth = `${100 / columns}%` as DimensionValue;

  const renderItem = ({ index, item }: ListRenderItemInfo<GalleryItem>) => (
    <View style={[styles.item, { flexBasis: itemWidth, maxWidth: itemWidth, padding: theme.spacing.sm }]}>
      <GalleryCard index={index} item={item} onPress={onItemPress} onShare={onItemShare} theme={theme} />
    </View>
  );

  return (
    <FlatList
      ListEmptyComponent={ListEmptyComponent}
      columnWrapperStyle={items.length > 0 ? styles.row : undefined}
      contentContainerStyle={items.length > 0 ? styles.content : styles.emptyContent}
      data={items}
      key={columns}
      keyExtractor={(item) => item.id}
      numColumns={columns}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 132,
    paddingTop: 6,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 80,
    paddingTop: 24,
  },
  item: {
    minWidth: 0,
  },
  row: {
    alignItems: 'stretch',
  },
});
