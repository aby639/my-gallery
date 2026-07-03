import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatusBanner } from '../components/StatusBanner';
import {
  FeatureChip,
  GlassCard,
  GradientButton,
  MemoIcon,
  MemoWaveform,
  RoundIconButton,
  ScreenBackground,
  formatMemoryDateTime,
  getMemoryTitle,
  gradients,
  memoColors,
  memoFont,
} from '../components/memolens/MemoLensKit';
import { formatTagInput, MEMORY_MOODS, parseTagInput } from '../gallery/galleryMetadata';
import { loadGalleryItems, saveGalleryItems, ThemePreference } from '../storage/galleryStorage';
import { getAppTheme } from '../theme/theme';
import { GalleryItem, RootStackParamList } from '../types/gallery';
import { deletePersistedVoice } from '../utils/audioAssets';
import { deletePersistedGalleryImage } from '../utils/imageAssets';
import { shareGalleryItem } from '../utils/shareGalleryItem';
import { formatVoiceDuration } from '../voice/useVoiceNoteRecorder';

type DetailScreenProps = NativeStackScreenProps<RootStackParamList, 'Detail'> & {
  themePreference: ThemePreference;
};

type StatusState = {
  message: string;
  tone: 'info' | 'error' | 'success';
};

const fallbackMemoryImage = require('../../assets/memolens/sunset.jpg');

export function DetailScreen({ navigation, route, themePreference }: DetailScreenProps) {
  const insets = useSafeAreaInsets();
  const bannerTheme = useMemo(() => getAppTheme(themePreference), [themePreference]);
  const [item, setItem] = useState<GalleryItem | null>(null);
  const [caption, setCaption] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>(MEMORY_MOODS[0]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [status, setStatus] = useState<StatusState>();
  const voiceSource = useMemo(() => (item?.voiceUri ? { uri: item.voiceUri } : null), [item?.voiceUri]);
  const voicePlayer = useAudioPlayer(voiceSource, { updateInterval: 150 });
  const voiceStatus = useAudioPlayerStatus(voicePlayer);

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

  useEffect(() => {
    if (!voiceStatus.didJustFinish) {
      return;
    }

    void voicePlayer.seekTo(0);
  }, [voicePlayer, voiceStatus.didJustFinish]);

  const persistDetails = async (overrides?: Partial<GalleryItem>): Promise<GalleryItem | null> => {
    if (!item) return null;

    const trimmedCaption = caption.trim();

    if (!trimmedCaption) {
      setStatus({ message: 'Memory caption cannot be empty.', tone: 'error' });
      return null;
    }

    const items = await loadGalleryItems();
    const updatedItem: GalleryItem = {
      ...item,
      caption: trimmedCaption,
      isFavorite,
      mood: selectedMood,
      tags: parseTagInput(tagsInput),
      ...overrides,
    };

    await saveGalleryItems(items.map((candidate) => (candidate.id === item.id ? updatedItem : candidate)));
    setItem(updatedItem);
    setCaption(updatedItem.caption);
    setTagsInput(formatTagInput(updatedItem.tags));
    setSelectedMood(updatedItem.mood ?? MEMORY_MOODS[0]);
    setIsFavorite(Boolean(updatedItem.isFavorite));
    return updatedItem;
  };

  const toggleFavorite = async () => {
    const nextFavorite = !isFavorite;
    setIsFavorite(nextFavorite);

    const updated = await persistDetails({ isFavorite: nextFavorite });

    if (updated) {
      setStatus({ message: nextFavorite ? 'Marked as favorite.' : 'Removed from favorites.', tone: 'success' });
    }
  };

  const deleteItem = async () => {
    if (!item) return;

    const confirmed = await confirmDestructiveAction(
      'Delete this memory?',
      'This removes the saved image copy, voice note, caption, mood, and tags from this device.',
    );

    if (!confirmed) {
      return;
    }

    const items = await loadGalleryItems();
    await saveGalleryItems(items.filter((candidate) => candidate.id !== item.id));
    deletePersistedGalleryImage(item.imageUri);
    deletePersistedVoice(item.voiceUri);
    navigation.navigate('Gallery');
  };

  const shareItem = async () => {
    if (!item) return;

    setStatus(undefined);
    const result = await shareGalleryItem({
      ...item,
      caption,
      isFavorite,
      mood: selectedMood,
      tags: parseTagInput(tagsInput),
    });

    if (result) {
      setStatus(result);
    }
  };

  const openEditFlow = () => {
    if (!item) return;
    navigation.navigate('AddItem', { itemId: item.id });
  };

  const toggleVoicePlayback = async () => {
    if (!item?.voiceUri) return;

    try {
      if (voiceStatus.playing) {
        voicePlayer.pause();
        return;
      }

      if (voiceStatus.duration > 0 && voiceStatus.currentTime >= voiceStatus.duration) {
        await voicePlayer.seekTo(0);
      }

      voicePlayer.play();
    } catch {
      setStatus({ message: 'Voice note could not be played on this device.', tone: 'info' });
    }
  };

  if (!item) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.missingState}>
            <GlassCard style={styles.missingCard}>
              <MemoIcon color={memoColors.pink} name="search" size={42} strokeWidth={2.2} />
              <Text style={styles.missingTitle}>Memory not found</Text>
              <Text style={styles.missingBody}>This memory may have been removed from local storage.</Text>
              <GradientButton label="Back to memories" onPress={() => navigation.navigate('Gallery')} />
            </GlassCard>
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  const created = formatMemoryDateTime(item.createdAt);
  const title = getMemoryTitle(caption);
  const tags = parseTagInput(tagsInput);
  const isVoicePlaying = voiceStatus.playing && !voiceStatus.didJustFinish;
  const voiceDurationLabel = getVoiceDurationLabel(voiceStatus.currentTime, voiceStatus.duration, item.voiceDurationMillis);

  return (
    <ScreenBackground>
      <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
        <View style={styles.root}>
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: 124 + insets.bottom }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.hero}>
              <Image resizeMode="cover" source={item.imageUri ? { uri: item.imageUri } : fallbackMemoryImage} style={styles.heroImage} />
              <LinearGradient colors={[...gradients.cardTop]} style={styles.heroTopShade} />
              <LinearGradient colors={[...gradients.cardBottom]} locations={[0, 0.46, 1]} style={styles.heroBottomShade} />
              <View style={[styles.heroActions, { paddingTop: 14 + insets.top }]}>
                <RoundIconButton icon="arrow-left" label="Go back" onPress={() => navigation.goBack()} />
                <View style={styles.heroActionGroup}>
                  <RoundIconButton
                    icon="edit"
                    label="Edit memory"
                    onPress={openEditFlow}
                  />
                  <RoundIconButton
                    icon="heart"
                    label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    onPress={toggleFavorite}
                    tone={isFavorite ? 'pink' : 'default'}
                  />
                </View>
              </View>
            </View>

            <View style={styles.story}>
              <View style={styles.moodLine}>
                <FeatureChip active label={selectedMood} />
              </View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.date}>{created}</Text>

              <Text style={styles.caption}>{caption}</Text>

              {item.voiceUri ? (
                <GlassCard style={styles.voicePlayer}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={toggleVoicePlayback}
                    style={({ pressed }) => [styles.playButton, pressed && styles.pressed]}
                  >
                    <MemoIcon color={memoColors.text} name={isVoicePlaying ? 'pause' : 'play'} size={17} strokeWidth={2.3} />
                  </Pressable>
                  <View style={styles.voicePlayerCopy}>
                    <Text style={styles.voicePlayerTitle}>{isVoicePlaying ? 'Playing voice note' : 'Voice note saved'}</Text>
                    <Text style={styles.duration}>{voiceDurationLabel}</Text>
                  </View>
                  <MemoWaveform active={isVoicePlaying} height={26} />
                </GlassCard>
              ) : (
                <Text style={styles.voiceUnavailable}>No voice note attached. Edit this memory to add one.</Text>
              )}

              <View style={styles.tagRow}>
                {(tags.length > 0 ? tags : [selectedMood]).map((tag) => (
                  <Text key={tag} style={styles.detailTag}>
                    #{tag.toLowerCase()}
                  </Text>
                ))}
              </View>

              <StatusBanner message={status?.message} theme={bannerTheme} tone={status?.tone} />
            </View>
          </ScrollView>

          <View style={[styles.actionDock, { paddingBottom: 16 + insets.bottom }]}>
            <ActionButton icon="heart" label={isFavorite ? 'Favorited' : 'Favorite'} onPress={toggleFavorite} tone="pink" />
            <ActionButton icon="share" label="Share" onPress={shareItem} />
            <ActionButton icon="edit" label="Edit" onPress={openEditFlow} />
            <ActionButton icon="trash" label="Delete" onPress={deleteItem} tone="danger" />
          </View>
        </View>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function getVoiceDurationLabel(currentTime: number, duration: number, fallbackDurationMillis?: number): string {
  if (duration > 0) {
    const currentMillis = Math.min(Math.max(currentTime, 0), duration) * 1000;
    const durationMillis = duration * 1000;

    if (currentMillis >= 1000) {
      return `${formatVoiceDuration(currentMillis)} / ${formatVoiceDuration(durationMillis)}`;
    }

    return formatVoiceDuration(durationMillis);
  }

  return formatVoiceDuration(fallbackDurationMillis);
}

type ActionButtonProps = {
  icon: 'edit' | 'heart' | 'share' | 'trash';
  label: string;
  onPress: () => void;
  tone?: 'default' | 'danger' | 'pink';
};

function ActionButton({ icon, label, onPress, tone = 'default' }: ActionButtonProps) {
  const color = tone === 'danger' || tone === 'pink' ? memoColors.pink : memoColors.text;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        tone === 'danger' && styles.actionButtonDanger,
        tone === 'pink' && styles.actionButtonPink,
        pressed && styles.pressed,
      ]}
    >
      <MemoIcon color={color} name={icon} size={20} strokeWidth={2.3} />
      <Text
        style={[
          styles.actionButtonText,
          tone === 'danger' && styles.actionButtonDangerText,
          tone === 'pink' && styles.actionButtonPinkText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
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
  actionButton: {
    alignItems: 'center',
    backgroundColor: memoColors.card,
    borderColor: memoColors.border,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    gap: 6,
    justifyContent: 'center',
    minHeight: 58,
    paddingHorizontal: 7,
  },
  actionButtonDanger: {
    backgroundColor: 'rgba(251, 113, 133, 0.08)',
    borderColor: 'rgba(251, 113, 133, 0.24)',
  },
  actionButtonDangerText: {
    color: memoColors.pink,
  },
  actionButtonPink: {
    backgroundColor: 'rgba(251, 113, 133, 0.1)',
    borderColor: 'rgba(251, 113, 133, 0.24)',
  },
  actionButtonPinkText: {
    color: memoColors.pink,
  },
  actionButtonText: {
    color: memoColors.text,
    fontFamily: memoFont.medium,
    fontSize: 11,
    letterSpacing: 0,
    lineHeight: 15,
  },
  actionDock: {
    backgroundColor: 'rgba(9, 10, 16, 0.95)',
    borderColor: 'rgba(26, 29, 41, 0.82)',
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    gap: 9,
    left: 0,
    paddingHorizontal: 18,
    paddingTop: 14,
    position: 'absolute',
    right: 0,
  },
  caption: {
    color: 'rgba(248, 250, 252, 0.9)',
    fontFamily: memoFont.regular,
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 25,
  },
  captionEditCard: {
    padding: 14,
  },
  captionInput: {
    color: memoColors.text,
    fontFamily: memoFont.regular,
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 24,
    minHeight: 116,
    padding: 0,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  content: {
    flexGrow: 1,
  },
  date: {
    color: memoColors.muted,
    fontFamily: memoFont.medium,
    fontSize: 13,
    letterSpacing: 0,
    lineHeight: 18,
  },
  detailTag: {
    color: memoColors.quiet,
    fontFamily: memoFont.medium,
    fontSize: 13,
    letterSpacing: 0,
    lineHeight: 18,
  },
  duration: {
    color: memoColors.muted,
    fontFamily: memoFont.medium,
    fontSize: 12,
    letterSpacing: 0,
    minWidth: 34,
  },
  editPanel: {
    gap: 12,
    padding: 16,
  },
  hero: {
    height: 470,
    position: 'relative',
  },
  heroActionGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  heroActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    paddingHorizontal: 24,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 5,
  },
  heroBottomShade: {
    bottom: 0,
    height: '58%',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  heroImage: {
    height: '100%',
    width: '100%',
  },
  heroTopShade: {
    height: '28%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  missingBody: {
    color: memoColors.muted,
    fontFamily: memoFont.regular,
    fontSize: 15,
    letterSpacing: 0,
    lineHeight: 22,
    textAlign: 'center',
  },
  missingCard: {
    alignItems: 'center',
    gap: 14,
    padding: 24,
    width: '100%',
  },
  missingState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  missingTitle: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 24,
    letterSpacing: 0,
    lineHeight: 31,
  },
  moodLine: {
    alignItems: 'flex-start',
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: memoColors.accent,
    borderRadius: 21,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.985 }],
  },
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  sectionLabel: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 14,
    letterSpacing: 0,
    lineHeight: 19,
  },
  story: {
    gap: 15,
    marginTop: -18,
    paddingBottom: 18,
    paddingHorizontal: 24,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  tagsInput: {
    backgroundColor: 'rgba(18, 20, 29, 0.82)',
    borderColor: memoColors.border,
    borderRadius: 18,
    borderWidth: 1,
    color: memoColors.text,
    fontFamily: memoFont.regular,
    fontSize: 14,
    letterSpacing: 0,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  title: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 31,
    letterSpacing: 0,
    lineHeight: 38,
  },
  voiceUnavailable: {
    color: memoColors.muted,
    fontFamily: memoFont.regular,
    fontSize: 13,
    letterSpacing: 0,
    lineHeight: 19,
  },
  voicePlayer: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 29, 0.74)',
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  voicePlayerCopy: {
    gap: 2,
    minWidth: 96,
  },
  voicePlayerTitle: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 13,
    letterSpacing: 0,
    lineHeight: 18,
  },
});
