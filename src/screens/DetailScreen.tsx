import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';

import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatusBanner } from '../components/StatusBanner';
import { formatTagInput, parseTagInput } from '../gallery/galleryMetadata';
import { loadGalleryItems, saveGalleryItems, ThemePreference } from '../storage/galleryStorage';
import { getAppTheme } from '../theme/theme';
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
  const [isFavorite, setIsFavorite] = useState(false);
  const [status, setStatus] = useState<{ message: string; tone: 'info' | 'error' | 'success' }>();

  const loadItem = useCallback(async () => {
    const items = await loadGalleryItems();
    const found = items.find((candidate) => candidate.id === route.params.itemId) ?? null;
    setItem(found);
    setCaption(found?.caption ?? '');
    setTagsInput(formatTagInput(found?.tags));
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
      setStatus({ message: 'Caption cannot be empty.', tone: 'error' });
      return;
    }

    const nextTags = parseTagInput(tagsInput);
    const items = await loadGalleryItems();
    const updatedItems = items.map((candidate) =>
      candidate.id === item.id
        ? {
            ...candidate,
            caption: trimmedCaption,
            isFavorite,
            tags: nextTags,
          }
        : candidate,
    );

    await saveGalleryItems(updatedItems);
    setItem({ ...item, caption: trimmedCaption, isFavorite, tags: nextTags });
    setStatus({ message: 'Image details updated.', tone: 'success' });
  };

  const deleteItem = async () => {
    if (!item) return;

    const items = await loadGalleryItems();
    await saveGalleryItems(items.filter((candidate) => candidate.id !== item.id));
    deletePersistedGalleryImage(item.imageUri);
    navigation.navigate('Gallery');
  };

  const shareItem = async () => {
    if (!item) return;

    setStatus(await shareGalleryItem({ ...item, caption }));
  };

  if (!item) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        <View style={styles.missing}>
          <EmptyState
            actionLabel="Back to gallery"
            body="This image may have been removed from local storage."
            onAction={() => navigation.navigate('Gallery')}
            theme={theme}
            title="Image not found"
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
          <Text style={[styles.meta, { color: theme.colors.muted }]}>
            {created} · {item.source === 'camera' ? 'Camera' : 'Library'}
          </Text>
        </View>

        <Image resizeMode="cover" source={{ uri: item.imageUri }} style={[styles.image, { borderRadius: theme.radius.md }]} />

        <View style={styles.form}>
          <View style={styles.summaryRow}>
            <MetaPill label="Saved" theme={theme} value={created} />
            <MetaPill label="Source" theme={theme} value={item.source === 'camera' ? 'Camera' : 'Library'} />
            <MetaPill label="Favorite" theme={theme} value={isFavorite ? 'On' : 'Off'} />
          </View>

          <Text style={[styles.label, { color: theme.colors.text }]}>Caption</Text>
          <TextInput
            multiline
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

          <Text style={[styles.label, { color: theme.colors.text }]}>Tags</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={setTagsInput}
            placeholder="receipt, design, travel"
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
            Sharing now uses the saved image file on device so supported apps receive the actual image, not a raw local
            path.
          </Text>
          <StatusBanner message={status?.message} theme={theme} tone={status?.tone} />
          <View style={styles.actions}>
            <PrimaryButton label="Save changes" onPress={saveDetails} theme={theme} />
            <PrimaryButton
              label={isFavorite ? 'Remove favorite' : 'Add favorite'}
              onPress={() => setIsFavorite((current) => !current)}
              theme={theme}
              variant="secondary"
            />
            <PrimaryButton label="Share image" onPress={shareItem} theme={theme} variant="secondary" />
            <PrimaryButton label="Delete" onPress={deleteItem} theme={theme} variant="danger" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type MetaPillProps = {
  label: string;
  theme: ReturnType<typeof getAppTheme>;
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

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  content: {
    alignSelf: 'center',
    gap: 18,
    maxWidth: 920,
    padding: 20,
    width: '100%',
  },
  form: {
    gap: 12,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  image: {
    aspectRatio: 1.35,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    fontSize: 16,
    minHeight: 110,
    padding: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
  },
  meta: {
    fontSize: 13,
    fontWeight: '700',
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
    fontWeight: '700',
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
});
