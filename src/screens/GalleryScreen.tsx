import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '../components/EmptyState';
import { GalleryGrid } from '../components/GalleryGrid';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProfileHeader } from '../components/ProfileHeader';
import { SearchBar } from '../components/SearchBar';
import { StatusBanner } from '../components/StatusBanner';
import { collectGalleryTags, filterGalleryItems } from '../gallery/filterGalleryItems';
import { loadGalleryItems, ThemePreference } from '../storage/galleryStorage';
import { AppTheme, getAppTheme } from '../theme/theme';
import { GalleryFilter, GalleryItem, GalleryUser, RootStackParamList } from '../types/gallery';
import { getPersistableImageUri } from '../utils/imageAssets';
import { shareGalleryItem } from '../utils/shareGalleryItem';

type GalleryScreenProps = NativeStackScreenProps<RootStackParamList, 'Gallery'> & {
  user: GalleryUser;
  themePreference: ThemePreference;
  onToggleTheme: () => void;
};

export function GalleryScreen({ navigation, onToggleTheme, themePreference, user }: GalleryScreenProps) {
  const theme = getAppTheme(themePreference);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>('all');
  const [activeTag, setActiveTag] = useState<string>();
  const [status, setStatus] = useState<{ message: string; tone: 'info' | 'error' | 'success' }>();

  const loadItems = useCallback(async () => {
    setItems(await loadGalleryItems());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadItems();
    }, [loadItems]),
  );

  const openPicker = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setStatus({ message: 'Photo library permission was denied.', tone: 'error' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      base64: Platform.OS === 'web',
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (result.canceled) {
      setStatus({ message: 'Image selection cancelled.', tone: 'info' });
      return;
    }

    navigation.navigate('AddItem', {
      imageUri: getPersistableImageUri(result.assets[0]),
      source: 'library',
    });
  };

  const openCamera = async () => {
    if (Platform.OS === 'web') {
      setStatus({
        message: 'Camera capture depends on browser support. Use the image picker if it is unavailable.',
        tone: 'info',
      });
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      setStatus({ message: 'Camera permission was denied.', tone: 'error' });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      base64: Platform.OS === 'web',
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (result.canceled) {
      setStatus({ message: 'Camera capture cancelled.', tone: 'info' });
      return;
    }

    navigation.navigate('AddItem', {
      imageUri: getPersistableImageUri(result.assets[0]),
      source: 'camera',
    });
  };

  const filteredItems = filterGalleryItems(items, searchText, activeFilter, activeTag);
  const hasSearch = searchText.trim().length > 0;
  const hasRefinements = hasSearch || activeFilter !== 'all' || Boolean(activeTag);
  const favoriteCount = items.filter((item) => item.isFavorite).length;
  const taggedCount = items.filter((item) => (item.tags?.length ?? 0) > 0).length;
  const topTags = collectGalleryTags(items, 6);
  const visibleTags =
    activeTag && !topTags.some((tag) => tag.toLowerCase() === activeTag.toLowerCase())
      ? [activeTag, ...topTags].slice(0, 6)
      : topTags;

  const clearRefinements = () => {
    setSearchText('');
    setActiveFilter('all');
    setActiveTag(undefined);
  };

  const shareItem = async (item: GalleryItem) => {
    setStatus(await shareGalleryItem(item));
  };

  const explainVoiceCapture = () => {
    setStatus({
      message: 'Choose a photo first, then use Dictate caption while creating the memory.',
      tone: 'info',
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.page}>
        <ProfileHeader
          onOpenSettings={() => navigation.navigate('Settings')}
          onToggleTheme={onToggleTheme}
          theme={theme}
          themePreference={themePreference}
          user={user}
        />

        <View style={styles.titleRow}>
          <View style={styles.titleText}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Memories</Text>
            <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
              Save fewer photos, remember more context, and keep meaningful visuals ready offline.
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.actionPanel,
            {
              backgroundColor: theme.colors.surfaceRaised,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              boxShadow: `0 16px 38px ${theme.colors.shadow}`,
            },
          ]}
        >
          <View style={styles.actionCopy}>
            <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Create Memory</Text>
            <Text style={[styles.actionBody, { color: theme.colors.muted }]}>
              Capture a moment, add the story, pick a mood, and save it privately on this device.
            </Text>
          </View>
          <View style={styles.actionRow}>
            <PrimaryButton icon="P" label="Photo" onPress={openPicker} theme={theme} />
            <PrimaryButton icon="C" label="Camera" onPress={openCamera} theme={theme} variant="secondary" />
            <PrimaryButton icon="V" label="Voice" onPress={explainVoiceCapture} theme={theme} variant="secondary" />
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatPill label="Memories" theme={theme} value={items.length.toString()} />
          <StatPill label="Favorites" theme={theme} value={favoriteCount.toString()} />
          <StatPill label="Tagged" theme={theme} value={taggedCount.toString()} />
        </View>

        <SearchBar onChangeText={setSearchText} theme={theme} value={searchText} />

        <View style={styles.filterRow}>
          <FilterChip active={activeFilter === 'all'} label="All" onPress={() => setActiveFilter('all')} theme={theme} />
          <FilterChip
            active={activeFilter === 'favorites'}
            label="Favorites"
            onPress={() => setActiveFilter('favorites')}
            theme={theme}
          />
          <FilterChip
            active={activeFilter === 'camera'}
            label="Camera"
            onPress={() => setActiveFilter('camera')}
            theme={theme}
          />
          <FilterChip
            active={activeFilter === 'library'}
            label="Library"
            onPress={() => setActiveFilter('library')}
            theme={theme}
          />
        </View>

        {visibleTags.length ? (
          <View style={styles.tagsSection}>
            <Text style={[styles.tagsLabel, { color: theme.colors.muted }]}>Moods and tags</Text>
            <View style={styles.tagsRow}>
              {visibleTags.map((tag) => (
                <FilterChip
                  key={tag}
                  active={activeTag?.toLowerCase() === tag.toLowerCase()}
                  label={tag}
                  onPress={() =>
                    setActiveTag((current) => (current?.toLowerCase() === tag.toLowerCase() ? undefined : tag))
                  }
                  theme={theme}
                />
              ))}
              {hasRefinements ? (
                <FilterChip active={false} label="Clear filters" onPress={clearRefinements} theme={theme} />
              ) : null}
            </View>
          </View>
        ) : null}

        <StatusBanner message={status?.message} theme={theme} tone={status?.tone} />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {hasRefinements ? 'Matching memories' : 'Recent memories'}
          </Text>
          <Text style={[styles.sectionMeta, { color: theme.colors.muted }]}>
            {filteredItems.length} {filteredItems.length === 1 ? 'memory' : 'memories'}
          </Text>
        </View>

        <GalleryGrid
          ListEmptyComponent={
            <EmptyState
              actionLabel={hasRefinements ? 'Clear filters' : 'Create first memory'}
              body={
                hasRefinements
                  ? 'No memories match that mix of search, filters, moods, or tags yet.'
                  : 'Choose from your library or open the camera, then add a caption, mood, and tags.'
              }
              onAction={hasRefinements ? clearRefinements : openPicker}
              theme={theme}
              title={hasRefinements ? 'No matches' : 'Your first memory is waiting'}
            />
          }
          items={filteredItems}
          onItemPress={(item) => navigation.navigate('Detail', { itemId: item.id })}
          onItemShare={shareItem}
          theme={theme}
        />
      </View>
    </SafeAreaView>
  );
}

type StatPillProps = {
  label: string;
  theme: AppTheme;
  value: string;
};

type FilterChipProps = {
  active: boolean;
  label: string;
  onPress: () => void;
  theme: AppTheme;
};

function StatPill({ label, theme, value }: StatPillProps) {
  return (
    <View
      style={[
        styles.statPill,
        {
          backgroundColor: theme.colors.surfaceRaised,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          boxShadow: `0 10px 24px ${theme.colors.shadow}`,
        },
      ]}
    >
      <Text style={[styles.statValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.muted }]}>{label}</Text>
    </View>
  );
}

function FilterChip({ active, label, onPress, theme }: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        {
          backgroundColor: active ? theme.colors.primary : theme.colors.surfaceRaised,
          borderColor: active ? theme.colors.primary : theme.colors.border,
          borderRadius: theme.radius.md,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <Text style={[styles.filterChipText, { color: active ? theme.colors.primaryText : theme.colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  actionBody: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  actionCopy: {
    flex: 1,
    gap: 4,
    minWidth: 220,
  },
  actionPanel: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
    padding: 14,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0,
  },
  filterChip: {
    borderWidth: 1,
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  page: {
    alignSelf: 'center',
    flex: 1,
    gap: 14,
    maxWidth: 1180,
    paddingHorizontal: 18,
    paddingTop: 10,
    width: '100%',
  },
  safeArea: {
    flex: 1,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 28,
  },
  sectionMeta: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  statPill: {
    borderWidth: 1,
    flex: 1,
    gap: 2,
    minWidth: 92,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  tagsLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagsSection: {
    gap: 8,
  },
  title: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 43,
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  titleText: {
    flex: 1,
    minWidth: 240,
  },
});
