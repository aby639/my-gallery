import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '../components/EmptyState';
import { GalleryGrid } from '../components/GalleryGrid';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProfileHeader } from '../components/ProfileHeader';
import { SearchBar } from '../components/SearchBar';
import { StatusBanner } from '../components/StatusBanner';
import { filterGalleryItems } from '../gallery/filterGalleryItems';
import { loadGalleryItems, ThemePreference } from '../storage/galleryStorage';
import { AppTheme, getAppTheme } from '../theme/theme';
import { GalleryItem, GalleryUser, RootStackParamList } from '../types/gallery';
import { getPersistableImageUri } from '../utils/imageAssets';

type GalleryScreenProps = NativeStackScreenProps<RootStackParamList, 'Gallery'> & {
  user: GalleryUser;
  themePreference: ThemePreference;
  onSignOut: () => Promise<void>;
  onToggleTheme: () => void;
};

export function GalleryScreen({
  navigation,
  onSignOut,
  onToggleTheme,
  themePreference,
  user,
}: GalleryScreenProps) {
  const theme = getAppTheme(themePreference);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [searchText, setSearchText] = useState('');
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
      setStatus({ message: 'Camera capture depends on browser support. Use the image picker if it is unavailable.', tone: 'info' });
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

  const filteredItems = filterGalleryItems(items, searchText);
  const hasSearch = searchText.trim().length > 0;
  const cameraCount = items.filter((item) => item.source === 'camera').length;
  const libraryCount = items.length - cameraCount;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={styles.page}>
        <ProfileHeader
          onSignOut={onSignOut}
          onToggleTheme={onToggleTheme}
          theme={theme}
          themePreference={themePreference}
          user={user}
        />

        <View style={styles.titleRow}>
          <View style={styles.titleText}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Gallery</Text>
            <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
              Private, searchable memories that stay ready offline
            </Text>
          </View>
          <View style={styles.actionRow}>
            <PrimaryButton label="Camera" onPress={openCamera} theme={theme} variant="secondary" />
            <PrimaryButton label="Add image" onPress={openPicker} theme={theme} />
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatPill label="Saved" theme={theme} value={items.length.toString()} />
          <StatPill label="Camera" theme={theme} value={cameraCount.toString()} />
          <StatPill label="Library" theme={theme} value={libraryCount.toString()} />
        </View>

        <SearchBar onChangeText={setSearchText} theme={theme} value={searchText} />
        <StatusBanner message={status?.message} theme={theme} tone={status?.tone} />

        <GalleryGrid
          ListEmptyComponent={
            <EmptyState
              actionLabel={hasSearch ? undefined : 'Add first image'}
              body={
                hasSearch
                  ? 'No saved captions match that search yet.'
                  : 'Choose from your library or open the camera, then add a typed or dictated caption.'
              }
              onAction={hasSearch ? undefined : openPicker}
              theme={theme}
              title={hasSearch ? 'No matches' : 'Your gallery is ready'}
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

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
