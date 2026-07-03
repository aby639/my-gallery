import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatusBanner } from '../components/StatusBanner';
import {
  FeatureChip,
  GlassCard,
  MemoBottomNav,
  MemoIcon,
  MemoryCard,
  MemoryCardData,
  ScreenBackground,
  formatMemoryDate,
  getMemoryTitle,
  memoColors,
  memoFont,
} from '../components/memolens/MemoLensKit';
import { filterGalleryItems } from '../gallery/filterGalleryItems';
import { loadGalleryItems } from '../storage/galleryStorage';
import { getAppTheme } from '../theme/theme';
import { GalleryItem, GallerySource, RootStackParamList } from '../types/gallery';
import { getPersistableImageUri } from '../utils/imageAssets';

type SearchMemoriesScreenProps = NativeStackScreenProps<RootStackParamList, 'SearchMemories'>;

type StatusState = {
  message: string;
  tone: 'info' | 'error' | 'success';
};

type SearchFilter = 'all' | 'favorites' | 'mood' | 'photos' | 'tags' | 'voice';

type SearchMemory = MemoryCardData & {
  item?: GalleryItem;
  source?: GallerySource;
  tags?: string[];
};

const filters: { label: string; value: SearchFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Favorites', value: 'favorites' },
  { label: 'Photos', value: 'photos' },
  { label: 'Voice', value: 'voice' },
  { label: 'Tags', value: 'tags' },
  { label: 'Mood', value: 'mood' },
];

const fallbackMemoryImage = require('../../assets/memolens/sunset.jpg');

export function SearchMemoriesScreen({ navigation }: SearchMemoriesScreenProps) {
  const insets = useSafeAreaInsets();
  const searchRef = useRef<TextInput>(null);
  const bannerTheme = useMemo(() => getAppTheme('dark'), []);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchFilter>('all');
  const [status, setStatus] = useState<StatusState>();

  const loadItems = useCallback(async () => {
    setItems(await loadGalleryItems());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadItems();
    }, [loadItems]),
  );

  const memories = useMemo(() => {
    const saved = filterGalleryItems(items, query).map(createSavedMemory);

    return saved.filter((memory) => {
      if (activeFilter === 'favorites') return Boolean(memory.item?.isFavorite);
      if (activeFilter === 'photos') return memory.source !== 'voice';
      if (activeFilter === 'voice') return Boolean(memory.hasVoice);
      if (activeFilter === 'tags') return Boolean(memory.tags?.length);
      if (activeFilter === 'mood') return Boolean(memory.mood);
      return true;
    });
  }, [activeFilter, items, query]);

  const columns = useMemo(() => splitColumns(memories), [memories]);
  const showEmpty = memories.length === 0;

  const openPicker = async () => {
    setStatus(undefined);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setStatus({ message: 'Photo library permission is needed to add a memory.', tone: 'error' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      base64: true,
      quality: 0.86,
    });

    if (result.canceled || !result.assets[0]) {
      setStatus({ message: 'Photo selection cancelled.', tone: 'info' });
      return;
    }

    navigation.navigate('AddItem', {
      imageUri: getPersistableImageUri(result.assets[0]),
      source: 'library',
    });
  };

  const openMemory = (memory: SearchMemory) => {
    if (memory.item) {
      navigation.navigate('Detail', { itemId: memory.item.id });
    }
  };

  return (
    <ScreenBackground>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: 30 + insets.bottom }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.scroller}
        >
          <View style={styles.headerBlock}>
            <Text style={styles.eyebrow}>Find a feeling</Text>
            <Text style={styles.title}>Search Memories</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => searchRef.current?.focus()}
            style={({ pressed }) => [styles.searchShell, pressed && styles.pressed]}
          >
            <MemoIcon color={memoColors.text} name="search" size={21} strokeWidth={2.25} />
            <TextInput
              ref={searchRef}
              autoCapitalize="none"
              onChangeText={setQuery}
              placeholder="Search memories, captions, moods..."
              placeholderTextColor={memoColors.quiet}
              style={styles.searchInput}
              value={query}
            />
          </Pressable>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroller}>
            <View style={styles.filterRow}>
              {filters.map((filter) => (
                <FeatureChip
                  key={filter.value}
                  active={activeFilter === filter.value}
                  label={filter.label}
                  onPress={() => setActiveFilter(filter.value)}
                />
              ))}
            </View>
          </ScrollView>

          <StatusBanner message={status?.message} theme={bannerTheme} tone={status?.tone} />

          {showEmpty ? (
            <GlassCard style={styles.emptyState}>
              <View style={styles.emptyOrb}>
                <MemoIcon color={memoColors.quiet} name="search" size={34} strokeWidth={2.1} />
                <View style={styles.emptyDot} />
              </View>
              <Text style={styles.emptyTitle}>No saved memories found</Text>
              <Text style={styles.emptyBody}>Try another caption, mood, or tag, or create a new memory from the plus button.</Text>
            </GlassCard>
          ) : (
            <View style={styles.masonry}>
              <View style={styles.memoryColumn}>
                {columns[0].map((memory) => (
                  <MemoryCard key={memory.id} memory={memory} onPress={() => openMemory(memory)} />
                ))}
              </View>
              <View style={styles.memoryColumn}>
                {columns[1].map((memory) => (
                  <MemoryCard key={memory.id} memory={memory} onPress={() => openMemory(memory)} />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <MemoBottomNav
        active="search"
        bottomInset={insets.bottom}
        onCreate={() => navigation.navigate('AddItem', undefined)}
        onHome={() => navigation.navigate('Gallery')}
        onMemories={() => {
          setQuery('');
          setActiveFilter('all');
        }}
        onProfile={() => navigation.navigate('Settings')}
        onSearch={() => searchRef.current?.focus()}
      />
    </ScreenBackground>
  );
}

function createSavedMemory(item: GalleryItem, index: number): SearchMemory {
  return {
    date: formatMemoryDate(item.createdAt),
    hasVoice: Boolean(item.voiceUri),
    height: [214, 154, 184, 232, 154, 184][index % 6],
    id: item.id,
    image: item.imageUri ? { uri: item.imageUri } : fallbackMemoryImage,
    item,
    mood: item.mood ?? (item.isFavorite ? 'Favorite' : item.source === 'camera' ? 'Captured' : 'Saved'),
    source: item.source,
    tags: item.tags,
    title: getMemoryTitle(item.caption),
  };
}

function splitColumns(memories: SearchMemory[]): [SearchMemory[], SearchMemory[]] {
  return memories.reduce<[SearchMemory[], SearchMemory[]]>(
    (columns, memory, index) => {
      columns[index % 2].push(memory);
      return columns;
    },
    [[], []],
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 18,
    paddingHorizontal: 24,
    paddingTop: 34,
  },
  dividerLine: {
    backgroundColor: memoColors.border,
    flex: 1,
    height: 1,
  },
  emptyBody: {
    color: memoColors.muted,
    fontFamily: memoFont.regular,
    fontSize: 14,
    letterSpacing: 0,
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyDot: {
    backgroundColor: memoColors.pink,
    borderColor: memoColors.card,
    borderRadius: 6,
    borderWidth: 2,
    height: 12,
    position: 'absolute',
    right: 10,
    top: 8,
    width: 12,
  },
  emptyOrb: {
    alignItems: 'center',
    backgroundColor: memoColors.card,
    borderColor: memoColors.border,
    borderRadius: 40,
    borderWidth: 1,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
    minHeight: 270,
    padding: 24,
  },
  emptyTitle: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 20,
    letterSpacing: 0,
    lineHeight: 26,
    textAlign: 'center',
  },
  eyebrow: {
    color: memoColors.pink,
    fontFamily: memoFont.semiBold,
    fontSize: 12,
    letterSpacing: 0.4,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 24,
  },
  filterScroller: {
    marginRight: -24,
  },
  headerBlock: {
    gap: 3,
  },
  masonry: {
    flexDirection: 'row',
    gap: 14,
  },
  memoryColumn: {
    flex: 1,
    gap: 14,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.985 }],
  },
  recentDivider: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    marginTop: 8,
    opacity: 0.44,
  },
  recentDividerText: {
    color: memoColors.quiet,
    fontFamily: memoFont.medium,
    fontSize: 11,
    letterSpacing: 0.5,
    lineHeight: 15,
    textTransform: 'uppercase',
  },
  safeArea: {
    flex: 1,
  },
  scroller: {
    flex: 1,
  },
  searchInput: {
    color: memoColors.text,
    flex: 1,
    fontFamily: memoFont.regular,
    fontSize: 14,
    letterSpacing: 0,
    minHeight: 52,
    padding: 0,
  },
  searchShell: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 29, 0.86)',
    borderColor: 'rgba(168, 85, 247, 0.44)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  title: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 28,
    letterSpacing: 0,
    lineHeight: 34,
  },
});
