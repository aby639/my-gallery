import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Image, ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MemoLensLogo } from '../components/MemoLensLogo';
import { StatusBanner } from '../components/StatusBanner';
import {
  GlassCard,
  MemoBottomNav,
  MemoIcon,
  MemoryCard,
  MemoryCardData,
  ScreenBackground,
  formatMemoryDate,
  getMemoryTitle,
  gradients,
  memoColors,
  memoFont,
} from '../components/memolens/MemoLensKit';
import { filterGalleryItems } from '../gallery/filterGalleryItems';
import { loadGalleryItems, ThemePreference } from '../storage/galleryStorage';
import { getAppTheme } from '../theme/theme';
import { GalleryItem, GallerySource, GalleryUser, RootStackParamList } from '../types/gallery';
import { getPersistableImageUri } from '../utils/imageAssets';

type GalleryScreenProps = NativeStackScreenProps<RootStackParamList, 'Gallery'> & {
  themePreference: ThemePreference;
  user: GalleryUser;
};

type StatusState = {
  message: string;
  tone: 'info' | 'error' | 'success';
};

type HomeMemory = MemoryCardData & {
  item?: GalleryItem;
  source?: GallerySource;
  tags?: string[];
};

const fallbackMemoryImage = require('../../assets/memolens/sunset.jpg');

export function GalleryScreen({ navigation, user }: GalleryScreenProps) {
  const insets = useSafeAreaInsets();
  const searchRef = useRef<TextInput>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [status, setStatus] = useState<StatusState>();
  const bannerTheme = useMemo(() => getAppTheme('dark'), []);

  const loadItems = useCallback(async () => {
    setItems(await loadGalleryItems());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadItems();
    }, [loadItems]),
  );

  const savedMatches = useMemo(() => filterGalleryItems(items, searchText), [items, searchText]);
  const memories = useMemo(() => savedMatches.map(createSavedMemory).slice(0, 8), [savedMatches]);

  const columns = useMemo(() => splitColumns(memories), [memories]);
  const firstName = getFirstName(user.name);

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

    openCreateFlow(result.assets[0], 'library');
  };

  const openCamera = async () => {
    setStatus(undefined);

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      setStatus({ message: 'Camera permission is needed to capture a memory.', tone: 'error' });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      base64: true,
      quality: 0.86,
    });

    if (result.canceled || !result.assets[0]) {
      setStatus({ message: 'Camera capture cancelled.', tone: 'info' });
      return;
    }

    openCreateFlow(result.assets[0], 'camera');
  };

  const openCreateFlow = (asset: ImagePicker.ImagePickerAsset, source: GallerySource) => {
    navigation.navigate('AddItem', {
      imageUri: getPersistableImageUri(asset),
      source,
    });
  };

  const openVoice = () => {
    navigation.navigate('AddItem', { source: 'voice' });
  };

  const openMemory = (memory: HomeMemory) => {
    if (memory.item) {
      navigation.navigate('Detail', { itemId: memory.item.id });
    }
  };

  const tagCount = new Set(items.flatMap((item) => item.tags ?? [])).size;

  return (
    <ScreenBackground>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: 30 + insets.bottom }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          style={styles.scroller}
        >
          <View style={styles.headerRow}>
            <View style={styles.brandRow}>
              <MemoLensLogo size={25} />
              <Text style={styles.brandText}>MemoLens</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable accessibilityRole="button" onPress={() => navigation.navigate('SearchMemories')} style={styles.headerIcon}>
                <MemoIcon color={memoColors.muted} name="bell" size={20} strokeWidth={2.25} />
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Settings')}>
                {user.photoUrl ? (
                  <Image source={{ uri: user.photoUrl }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarInitial}>{firstName.charAt(0).toUpperCase() || 'A'}</Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>

          <View style={styles.greetingBlock}>
            <Text style={styles.greeting}>Good evening, {firstName}</Text>
            <Text style={styles.subtitle}>What feeling are we saving today?</Text>
          </View>

          <View style={styles.statsRow}>
            <Stat label="Memories" value={String(items.length)} />
            <View style={styles.statDivider} />
            <Stat label="Favorites" value={String(items.filter((item) => item.isFavorite).length)} />
            <View style={styles.statDivider} />
            <Stat label="Tags" value={String(tagCount)} />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => searchRef.current?.focus()}
            style={({ pressed }) => [styles.searchShell, pressed && styles.pressed]}
          >
            <MemoIcon color={memoColors.quiet} name="search" size={21} strokeWidth={2.25} />
            <TextInput
              ref={searchRef}
              autoCapitalize="none"
              onChangeText={setSearchText}
              placeholder="Search memories, moods, tags..."
              placeholderTextColor={memoColors.quiet}
              style={styles.searchInput}
              value={searchText}
            />
          </Pressable>

          <GlassCard style={styles.createCard}>
            <LinearGradient colors={['rgba(168,85,247,0.17)', 'rgba(251,113,133,0.08)', 'rgba(251,146,60,0.02)']} style={StyleSheet.absoluteFill} />
            <View style={styles.createText}>
              <Text style={styles.createTitle}>Create a Memory</Text>
              <Text style={styles.createBody}>Photo, voice, mood, and story.</Text>
            </View>
            <View style={styles.createActions}>
              <CreateAction color={memoColors.cyan} icon="camera" label="Camera" onPress={openCamera} />
              <CreateAction color={memoColors.accent} icon="image" label="Photos" onPress={openPicker} />
              <CreateAction color={memoColors.orange} icon="mic" label="Voice" onPress={openVoice} />
            </View>
          </GlassCard>

          <StatusBanner message={status?.message} theme={bannerTheme} tone={status?.tone} />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Memories</Text>
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate('SearchMemories')}>
              <Text style={styles.viewAll}>View all</Text>
            </Pressable>
          </View>

          {memories.length > 0 ? (
            <View style={styles.masonry}>
              <View style={styles.column}>
                {columns[0].map((memory) => (
                  <MemoryCard key={memory.id} memory={memory} onPress={() => openMemory(memory)} />
                ))}
              </View>
              <View style={styles.column}>
                {columns[1].map((memory) => (
                  <MemoryCard key={memory.id} memory={memory} onPress={() => openMemory(memory)} />
                ))}
              </View>
            </View>
          ) : (
            <GlassCard style={styles.emptyState}>
              <MemoLensLogo size={64} />
              <Text style={styles.emptyTitle}>Your first memory is waiting</Text>
              <Text style={styles.emptyBody}>Choose from your library or open the camera, then add a caption, mood, and tags.</Text>
            </GlassCard>
          )}
        </ScrollView>
      </SafeAreaView>

      <MemoBottomNav
        active="home"
        bottomInset={insets.bottom}
        onCreate={() => navigation.navigate('AddItem', undefined)}
        onHome={() => undefined}
        onMemories={() => navigation.navigate('SearchMemories')}
        onProfile={() => navigation.navigate('Settings')}
        onSearch={() => navigation.navigate('SearchMemories')}
      />
    </ScreenBackground>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function CreateAction({
  color,
  icon,
  label,
  onPress,
}: {
  color: string;
  icon: 'camera' | 'image' | 'mic';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.createAction, pressed && styles.pressed]}>
      <View style={[styles.createIcon, { backgroundColor: `${color}18`, borderColor: `${color}38` }]}>
        <MemoIcon color={color} name={icon} size={22} strokeWidth={2.35} />
      </View>
      <Text style={styles.createLabel}>{label}</Text>
    </Pressable>
  );
}

function createSavedMemory(item: GalleryItem, index: number): HomeMemory {
  return {
    date: formatMemoryDate(item.createdAt),
    hasVoice: Boolean(item.voiceUri),
    height: [170, 150, 158, 176, 150, 164][index % 6],
    id: item.id,
    image: item.imageUri ? { uri: item.imageUri } : fallbackMemoryImage,
    item,
    mood: item.mood ?? (item.isFavorite ? 'Favorite' : item.source === 'camera' ? 'Captured' : 'Saved'),
    source: item.source,
    tags: item.tags,
    title: getMemoryTitle(item.caption),
  };
}

function splitColumns(memories: HomeMemory[]): [HomeMemory[], HomeMemory[]] {
  return memories.reduce<[HomeMemory[], HomeMemory[]]>(
    (columns, memory, index) => {
      columns[index % 2].push(memory);
      return columns;
    },
    [[], []],
  );
}

function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] || 'Aby';
}

const styles = StyleSheet.create({
  avatarFallback: {
    alignItems: 'center',
    backgroundColor: '#171827',
    borderColor: memoColors.borderSoft,
    borderRadius: 19,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  avatarImage: {
    borderColor: memoColors.borderSoft,
    borderRadius: 19,
    borderWidth: 1,
    height: 38,
    width: 38,
  },
  avatarInitial: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 15,
    letterSpacing: 0,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  brandText: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 20,
    letterSpacing: 0,
    lineHeight: 26,
  },
  column: {
    flex: 1,
    gap: 14,
  },
  content: {
    gap: 18,
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  createAction: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
    minHeight: 76,
  },
  createActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  createBody: {
    color: memoColors.muted,
    fontFamily: memoFont.regular,
    fontSize: 13,
    letterSpacing: 0,
    lineHeight: 19,
  },
  createCard: {
    padding: 20,
  },
  createIcon: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  createLabel: {
    color: memoColors.text,
    fontFamily: memoFont.medium,
    fontSize: 11,
    letterSpacing: 0,
    lineHeight: 15,
  },
  createText: {
    gap: 4,
  },
  createTitle: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 18,
    letterSpacing: 0,
    lineHeight: 24,
  },
  emptyBody: {
    color: memoColors.muted,
    fontFamily: memoFont.regular,
    fontSize: 14,
    letterSpacing: 0,
    lineHeight: 21,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    minHeight: 260,
    padding: 26,
  },
  emptyTitle: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 21,
    letterSpacing: 0,
    lineHeight: 27,
    textAlign: 'center',
  },
  greeting: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 27,
    letterSpacing: 0,
    lineHeight: 34,
  },
  greetingBlock: {
    gap: 5,
    paddingTop: 9,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 13,
  },
  headerIcon: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  masonry: {
    flexDirection: 'row',
    gap: 14,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.985 }],
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
    backgroundColor: 'rgba(18, 20, 29, 0.82)',
    borderColor: memoColors.border,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  sectionTitle: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 22,
    letterSpacing: 0,
    lineHeight: 28,
  },
  stat: {
    flex: 1,
    gap: 3,
  },
  statDivider: {
    alignSelf: 'stretch',
    backgroundColor: memoColors.border,
    width: 1,
  },
  statLabel: {
    color: memoColors.quiet,
    fontFamily: memoFont.medium,
    fontSize: 10,
    letterSpacing: 0,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  statsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 52,
    paddingVertical: 4,
  },
  statValue: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 20,
    letterSpacing: 0,
    lineHeight: 26,
  },
  subtitle: {
    color: memoColors.muted,
    fontFamily: memoFont.regular,
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 23,
  },
  viewAll: {
    color: gradients.brand[0],
    fontFamily: memoFont.medium,
    fontSize: 12,
    letterSpacing: 0,
    lineHeight: 16,
  },
});
