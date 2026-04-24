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
      allowsEditing: true,
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
      allowsEditing: true,
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
            <Text style={[styles.title, { color: theme.colors.text }]}>Gallery</Text>
            <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
              Save fewer photos, remember more context, and keep your useful visuals ready offline.
            </Text>
          </View>
          <View style={styles.actionRow}>
            <PrimaryButton label="Camera" onPress={openCamera} theme={theme} variant="secondary" />
            <PrimaryButton label="Add image" onPress={openPicker} theme={theme} />
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatPill label="Saved" theme={theme} value={items.length.toString()} />
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
            <Text style={[styles.tagsLabel, { color: theme.colors.muted }]}>Quick tags</Text>
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

        <GalleryGrid
          ListEmptyComponent={
            <EmptyState
              actionLabel={hasRefinements ? 'Clear filters' : 'Add first image'}
              body={
                hasRefinements
                  ? 'No saved images match that mix of search, filters, or tags yet.'
                  : 'Choose from your library or open the camera, then add a caption, tags, and favorites as your gallery grows.'
              }
              onAction={hasRefinements ? clearRefinements : openPicker}
              theme={theme}
              title={hasRefinements ? 'No matches' : 'Your gallery is ready'}
            />
          }
          items={filteredItems}
          onItemPress={(item) => navigation.navigate('Detail', { itemId: item.id })}
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
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
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
          backgroundColor: active ? theme.colors.primary : theme.colors.surface,
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
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
    gap: 16,
    maxWidth: 1180,
    paddingHorizontal: 20,
    paddingTop: 8,
    width: '100%',
  },
  safeArea: {
    flex: 1,
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
    fontSize: 22,
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
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 40,
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
