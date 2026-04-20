import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useState } from 'react';

import { EmptyState } from '../components/EmptyState';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatusBanner } from '../components/StatusBanner';
import { loadGalleryItems, saveGalleryItems, ThemePreference } from '../storage/galleryStorage';
import { getAppTheme } from '../theme/theme';
import { GalleryItem, RootStackParamList } from '../types/gallery';
import { shareGalleryItem } from '../utils/shareGalleryItem';

type DetailScreenProps = NativeStackScreenProps<RootStackParamList, 'Detail'> & {
  themePreference: ThemePreference;
};

export function DetailScreen({ navigation, route, themePreference }: DetailScreenProps) {
  const theme = getAppTheme(themePreference);
  const [item, setItem] = useState<GalleryItem | null>(null);
  const [caption, setCaption] = useState('');
  const [status, setStatus] = useState<{ message: string; tone: 'info' | 'error' | 'success' }>();

  const loadItem = useCallback(async () => {
    const items = await loadGalleryItems();
    const found = items.find((candidate) => candidate.id === route.params.itemId) ?? null;
    setItem(found);
    setCaption(found?.caption ?? '');
  }, [route.params.itemId]);

  useFocusEffect(
    useCallback(() => {
      void loadItem();
    }, [loadItem]),
  );

  const saveCaption = async () => {
    if (!item) return;

    const trimmedCaption = caption.trim();

    if (!trimmedCaption) {
      setStatus({ message: 'Caption cannot be empty.', tone: 'error' });
      return;
    }

    const items = await loadGalleryItems();
    const updatedItems = items.map((candidate) =>
      candidate.id === item.id ? { ...candidate, caption: trimmedCaption } : candidate,
    );
    await saveGalleryItems(updatedItems);
    setItem({ ...item, caption: trimmedCaption });
    setStatus({ message: 'Caption updated.', tone: 'success' });
  };

  const deleteItem = async () => {
    if (!item) return;

    const items = await loadGalleryItems();
    await saveGalleryItems(items.filter((candidate) => candidate.id !== item.id));
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
            value={caption}
          />
          <StatusBanner message={status?.message} theme={theme} tone={status?.tone} />
          <View style={styles.actions}>
            <PrimaryButton label="Save caption" onPress={saveCaption} theme={theme} />
            <PrimaryButton label="Share" onPress={shareItem} theme={theme} variant="secondary" />
            <PrimaryButton label="Delete" onPress={deleteItem} theme={theme} variant="danger" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  missing: {
    flex: 1,
    padding: 20,
  },
  safeArea: {
    flex: 1,
  },
});
