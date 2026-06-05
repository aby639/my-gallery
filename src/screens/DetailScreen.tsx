import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatusBanner } from '../components/StatusBanner';
import { formatTagInput, MEMORY_MOODS, parseTagInput } from '../gallery/galleryMetadata';
import { loadGalleryItems, saveGalleryItems, ThemePreference } from '../storage/galleryStorage';
import { AppTheme, getAppTheme } from '../theme/theme';
import { GalleryItem, RootStackParamList } from '../types/gallery';
import { deletePersistedGalleryImage } from '../utils/imageAssets';
import { shareGalleryItem } from '../utils/shareGalleryItem';

type DetailScreenProps = NativeStackScreenProps<RootStackParamList, 'Detail'> & {
  themePreference: ThemePreference;
};

export function DetailScreen({ navigation, route, themePreference }: DetailScreenProps) {
  const theme = getAppTheme(themePreference);
  const [item, setItem] = useState<GalleryItem | null>(null);
  const [caption, setCaption] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>(MEMORY_MOODS[0]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [status, setStatus] = useState<{ message: string; tone: 'info' | 'error' | 'success' }>();

  const loadItem = useCallback(async () => {
    const items = await loadGalleryItems();
    const found = items.find((candidate) => candidate.id === route.params.itemId) ?? null;
    setItem(found);
    setCaption(found?.caption ?? '');
    setTagsInput(formatTagInput(found?.tags));
    setSelectedMood(found?.mood ?? MEMORY_MOODS[0]);
    setIsFavorite(Boolean(found?.isFavorite));
  }, [route.params.itemId]);

  useFocusEffect(
    useCallback(() => {
      void loadItem();
    }, [loadItem]),
  );

  const saveDetails = async () => {
    if (!item) return;

    const trimmedCaption = caption.trim();

    if (!trimmedCaption) {
      setStatus({ message: 'Memory caption cannot be empty.', tone: 'error' });
      return;
    }

    const nextTags = parseTagInput(tagsInput);
    const items = await loadGalleryItems();
    const updatedItem: GalleryItem = {
      ...item,
      caption: trimmedCaption,
      isFavorite,
      mood: selectedMood,
      tags: nextTags,
    };
    const updatedItems = items.map((candidate) => (candidate.id === item.id ? updatedItem : candidate));

    await saveGalleryItems(updatedItems);
    setItem(updatedItem);
    setStatus({ message: 'Memory updated.', tone: 'success' });
  };

  const deleteItem = async () => {
    if (!item) return;

    const confirmed = await confirmDestructiveAction(
      'Delete this memory?',
      'This removes the saved image copy, caption, mood, and tags from this device.',
    );

    if (!confirmed) {
      return;
    }

    const items = await loadGalleryItems();
    await saveGalleryItems(items.filter((candidate) => candidate.id !== item.id));
    deletePersistedGalleryImage(item.imageUri);
    navigation.navigate('Gallery');
  };

  const shareItem = async () => {
    if (!item) return;

    setStatus(
      await shareGalleryItem({
        ...item,
        caption,
        isFavorite,
        mood: selectedMood,
        tags: parseTagInput(tagsInput),
      }),
    );
  };

  if (!item) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        <View style={styles.missing}>
          <EmptyState
            actionLabel="Back to memories"
            body="This memory may have been removed from local storage."
            onAction={() => navigation.navigate('Gallery')}
            theme={theme}
            title="Memory not found"
          />
        </View>
      </SafeAreaView>
    );
  }

  const created = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(item.createdAt));

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <PrimaryButton label="Back" onPress={() => navigation.goBack()} theme={theme} variant="ghost" />
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>Memory detail</Text>
            <Text numberOfLines={2} style={[styles.title, { color: theme.colors.text }]}>
              {caption || 'Untitled memory'}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.hero,
            {
              backgroundColor: theme.colors.surfaceRaised,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              boxShadow: `0 20px 44px ${theme.colors.shadow}`,
            },
          ]}
        >
          <Image resizeMode="cover" source={{ uri: item.imageUri }} style={styles.image} />
          <View style={[styles.heroPill, { backgroundColor: theme.colors.surface, borderRadius: theme.radius.sm }]}>
            <Text style={[styles.heroPillText, { color: theme.colors.text }]}>
              {created} · {item.source === 'camera' ? 'Camera' : 'Library'}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => setIsFavorite((current) => !current)}
            style={({ pressed }) => [
              styles.favoriteButton,
              {
                backgroundColor: isFavorite ? theme.colors.accent : theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.sm,
                opacity: pressed ? 0.72 : 1,
              },
            ]}
          >
            <Text style={[styles.favoriteText, { color: isFavorite ? theme.colors.primaryText : theme.colors.text }]}>
              {isFavorite ? 'Favorite' : 'Mark favorite'}
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.form,
            {
              backgroundColor: theme.colors.surfaceRaised,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
            },
          ]}
        >
          <View style={styles.summaryRow}>
            <MetaPill label="Source" theme={theme} value={item.source === 'camera' ? 'Camera' : 'Library'} />
            <MetaPill label="Mood" theme={theme} value={selectedMood} />
            <MetaPill label="Saved" theme={theme} value={created} />
          </View>

          <Text style={[styles.label, { color: theme.colors.text }]}>Caption</Text>
          <TextInput
            multiline
            maxLength={320}
            onChangeText={setCaption}
            placeholder="Caption"
            placeholderTextColor={theme.colors.muted}
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
                color: theme.colors.text,
              },
            ]}
            textAlignVertical="top"
            value={caption}
          />

          <Text style={[styles.label, { color: theme.colors.text }]}>Mood</Text>
          <View style={styles.chipRow}>
            {MEMORY_MOODS.map((mood) => (
              <ChoiceChip
                key={mood}
                active={selectedMood === mood}
                label={mood}
                onPress={() => setSelectedMood(mood)}
                theme={theme}
              />
            ))}
          </View>

          <Text style={[styles.label, { color: theme.colors.text }]}>Tags</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={setTagsInput}
            placeholder="nature, design, travel"
            placeholderTextColor={theme.colors.muted}
            style={[
              styles.tagsInput,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
                color: theme.colors.text,
              },
            ]}
            value={tagsInput}
          />

          <Text style={[styles.shareHint, { color: theme.colors.muted }]}>
            Sharing sends the saved image file to supported apps. Captions stay in MemoLens unless the target app accepts
            shared text too.
          </Text>
          <StatusBanner message={status?.message} theme={theme} tone={status?.tone} />
          <View style={styles.actions}>
            <PrimaryButton fullWidth icon="S" label="Save changes" onPress={saveDetails} theme={theme} />
            <PrimaryButton fullWidth icon=">" label="Share memory" onPress={shareItem} theme={theme} variant="secondary" />
            <PrimaryButton fullWidth label="Delete memory" onPress={deleteItem} theme={theme} variant="danger" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type ChoiceChipProps = {
  active: boolean;
  label: string;
  onPress: () => void;
  theme: AppTheme;
};

function ChoiceChip({ active, label, onPress, theme }: ChoiceChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.choiceChip,
        {
          backgroundColor: active ? theme.colors.secondary : theme.colors.surface,
          borderColor: active ? theme.colors.secondary : theme.colors.border,
          borderRadius: theme.radius.md,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <Text style={[styles.choiceText, { color: active ? theme.colors.secondaryText : theme.colors.text }]}>{label}</Text>
    </Pressable>
  );
}

type MetaPillProps = {
  label: string;
  theme: AppTheme;
  value: string;
};

function MetaPill({ label, theme, value }: MetaPillProps) {
  return (
    <View
      style={[
        styles.metaPill,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
        },
      ]}
    >
      <Text numberOfLines={2} style={[styles.metaPillValue, { color: theme.colors.text }]}>
        {value}
      </Text>
      <Text style={[styles.metaPillLabel, { color: theme.colors.muted }]}>{label}</Text>
    </View>
  );
}

async function confirmDestructiveAction(title: string, message: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    const confirm = (globalThis as { confirm?: (value: string) => boolean }).confirm;
    return confirm ? confirm(`${title}\n\n${message}`) : false;
  }

  return new Promise((resolve) => {
    let settled = false;
    const settle = (value: boolean) => {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    };

    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => settle(false) },
        { text: 'Delete', style: 'destructive', onPress: () => settle(true) },
      ],
      {
        cancelable: true,
        onDismiss: () => settle(false),
      },
    );
  });
}

const styles = StyleSheet.create({
  actions: {
    gap: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceChip: {
    borderWidth: 1,
    minHeight: 40,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  choiceText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
  content: {
    alignSelf: 'center',
    gap: 18,
    maxWidth: 920,
    padding: 20,
    width: '100%',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  favoriteButton: {
    borderWidth: 1,
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
    right: 14,
    top: 14,
  },
  favoriteText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  form: {
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 3,
    minWidth: 220,
  },
  hero: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  heroPill: {
    bottom: 14,
    left: 14,
    maxWidth: '82%',
    paddingHorizontal: 10,
    paddingVertical: 7,
    position: 'absolute',
  },
  heroPillText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  image: {
    aspectRatio: 1.24,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 116,
    padding: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
  },
  metaPill: {
    borderWidth: 1,
    flex: 1,
    gap: 4,
    minWidth: 140,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  metaPillLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  metaPillValue: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0,
  },
  missing: {
    flex: 1,
    padding: 20,
  },
  safeArea: {
    flex: 1,
  },
  shareHint: {
    fontSize: 13,
    lineHeight: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagsInput: {
    borderWidth: 1,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 36,
  },
});
