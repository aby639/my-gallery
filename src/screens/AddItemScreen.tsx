import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Crypto from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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
  memoColors,
  memoFont,
} from '../components/memolens/MemoLensKit';
import { MEMORY_MOODS, parseTagInput } from '../gallery/galleryMetadata';
import { loadGalleryItems, saveGalleryItems, ThemePreference } from '../storage/galleryStorage';
import { getAppTheme } from '../theme/theme';
import { GalleryItem, GallerySource, RootStackParamList } from '../types/gallery';
import { deletePersistedVoice, persistVoiceForGallery } from '../utils/audioAssets';
import { deletePersistedGalleryImage, getPersistableImageUri, persistImageForGallery } from '../utils/imageAssets';
import { useVoiceCaption } from '../voice/useVoiceCaption';
import { formatVoiceDuration, useVoiceNoteRecorder } from '../voice/useVoiceNoteRecorder';

type AddItemScreenProps = NativeStackScreenProps<RootStackParamList, 'AddItem'> & {
  themePreference: ThemePreference;
};

type StatusState = {
  message: string;
  tone: 'info' | 'error' | 'success';
};

const moods = ['Peaceful', 'Happy', 'Grateful', 'Warm', 'Excited', 'Love', 'Calm'];
const suggestedTags = ['Travel', 'Food', 'Study', 'Family', 'Pet', 'Nature', 'Work', 'Personal'];
const fallbackImage = require('../../assets/memolens/sunset.jpg');

export function AddItemScreen({ navigation, route, themePreference }: AddItemScreenProps) {
  const insets = useSafeAreaInsets();
  const bannerTheme = useMemo(() => getAppTheme(themePreference), [themePreference]);
  const fallbackUri = getFallbackImageUri();
  const editingItemId = route.params?.itemId;
  const isEditing = Boolean(editingItemId);
  const [currentImageUri, setCurrentImageUri] = useState(route.params?.imageUri ?? fallbackUri);
  const [currentSource, setCurrentSource] = useState<GallerySource>(route.params?.source ?? 'library');
  const [caption, setCaption] = useState('');
  const [customMoodInput, setCustomMoodInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>(MEMORY_MOODS[0]);
  const [status, setStatus] = useState<StatusState>();
  const [isSaving, setIsSaving] = useState(false);
  const dictation = useVoiceCaption({
    onResult: (text) => setCaption(text),
  });
  const voiceNote = useVoiceNoteRecorder();
  const { setVoiceNote } = voiceNote;

  useEffect(() => {
    let mounted = true;

    async function loadEditableMemory() {
      if (!editingItemId) {
        return;
      }

      const existingItems = await loadGalleryItems();
      const existingItem = existingItems.find((candidate) => candidate.id === editingItemId);

      if (!mounted) {
        return;
      }

      if (!existingItem) {
        setStatus({ message: 'This memory could not be found for editing.', tone: 'error' });
        return;
      }

      setCurrentImageUri(existingItem.imageUri || fallbackUri);
      setCurrentSource(existingItem.source);
      setCaption(existingItem.caption);
      const existingMood = existingItem.mood ?? MEMORY_MOODS[0];
      setSelectedMood(existingMood);
      setCustomMoodInput(moods.includes(existingMood) ? '' : existingMood);
      setTagsInput(existingItem.tags?.join(', ') ?? '');
      setVoiceNote(existingItem.voiceUri, existingItem.voiceDurationMillis);
    }

    void loadEditableMemory();

    return () => {
      mounted = false;
    };
  }, [editingItemId, fallbackUri, setVoiceNote]);

  const pickPhoto = async () => {
    setStatus(undefined);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setStatus({ message: 'Photo library permission is needed to change this memory photo.', tone: 'error' });
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

    setCurrentImageUri(getPersistableImageUri(result.assets[0]));
    setCurrentSource('library');
  };

  const takePhoto = async () => {
    setStatus(undefined);

    if (Platform.OS === 'web') {
      setStatus({
        message: 'WEB LIMITATION: camera capture is available in Android/iOS builds. Use Photos in this preview.',
        tone: 'info',
      });
      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      setStatus({ message: 'Camera permission is needed to capture this memory.', tone: 'error' });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      base64: false,
      quality: 0.86,
    });

    if (result.canceled || !result.assets[0]) {
      setStatus({ message: 'Camera capture cancelled.', tone: 'info' });
      return;
    }

    setCurrentImageUri(getPersistableImageUri(result.assets[0]));
    setCurrentSource('camera');
  };

  const saveItem = async () => {
    const trimmedCaption = caption.trim();
    const customMood = normalizeMood(customMoodInput);
    const nextMood = customMood || selectedMood;

    if (!trimmedCaption && !voiceNote.uri) {
      setStatus({ message: 'Write, dictate, or record a voice note before saving.', tone: 'error' });
      return;
    }

    setIsSaving(true);

    try {
      const existingItems = await loadGalleryItems();
      const existingItem = editingItemId
        ? existingItems.find((candidate) => candidate.id === editingItemId)
        : undefined;

      if (editingItemId && !existingItem) {
        setStatus({ message: 'This memory could not be updated because it no longer exists.', tone: 'error' });
        return;
      }

      const id = editingItemId ?? Crypto.randomUUID();
      const imageUri = await persistImageForGallery(currentImageUri, id);
      const voiceUri = await persistVoiceForGallery(voiceNote.uri, id);
      const nextItem: GalleryItem = {
        ...existingItem,
        id,
        caption: trimmedCaption || 'Voice note',
        createdAt: existingItem?.createdAt ?? new Date().toISOString(),
        imageUri,
        isFavorite: existingItem?.isFavorite ?? false,
        mood: nextMood,
        source: voiceUri && currentSource === 'voice' ? 'voice' : currentSource,
        tags: parseTagInput(tagsInput),
        voiceDurationMillis: voiceUri ? voiceNote.durationMillis : undefined,
        voiceUri,
      };

      if (existingItem?.imageUri && existingItem.imageUri !== imageUri) {
        deletePersistedGalleryImage(existingItem.imageUri);
      }

      if (existingItem?.voiceUri && existingItem.voiceUri !== voiceUri) {
        deletePersistedVoice(existingItem.voiceUri);
      }

      const nextItems = editingItemId
        ? existingItems.map((candidate) => (candidate.id === editingItemId ? nextItem : candidate))
        : [nextItem, ...existingItems];

      await saveGalleryItems(nextItems);

      if (editingItemId) {
        navigation.navigate('Detail', { itemId: id });
        return;
      }

      setCaption('');
      setCustomMoodInput('');
      setTagsInput('');
      setSelectedMood(MEMORY_MOODS[0]);
      setCurrentImageUri(fallbackUri);
      setCurrentSource('library');
      voiceNote.removeVoiceNote();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Gallery' }],
      });
    } catch {
      setStatus({ message: 'The image could not be saved. Try again once the file finishes loading.', tone: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDictation = () => {
    if (dictation.isListening) {
      dictation.stopListening();
      return;
    }

    void dictation.startListening();
  };

  const toggleVoiceNoteRecording = () => {
    if (voiceNote.isRecording) {
      void voiceNote.stopRecording();
      return;
    }

    void voiceNote.startRecording();
  };

  const addTag = (tag: string) => {
    const tags = parseTagInput(tagsInput);

    if (tags.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
      return;
    }

    setTagsInput([...tags, tag].join(', '));
  };

  const selectedTags = parseTagInput(tagsInput);
  const voiceDuration = voiceNote.isRecording
    ? voiceNote.recordingDurationMillis
    : voiceNote.durationMillis;

  return (
    <ScreenBackground>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
          <View style={styles.header}>
            <RoundIconButton icon="arrow-left" label="Go back" onPress={() => navigation.goBack()} />
            <Text style={styles.headerTitle}>{isEditing ? 'Edit Memory' : 'New Memory'}</Text>
            <RoundIconButton icon="bell" label="Reminder" onPress={() => setStatus({ message: 'Reminder notes are coming later.', tone: 'info' })} />
          </View>

          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: 116 + insets.bottom }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.previewFrame}>
              <Image resizeMode="cover" source={currentImageUri ? { uri: currentImageUri } : fallbackImage} style={styles.previewImage} />
              <LinearGradient colors={['rgba(9,10,16,0)', 'rgba(9,10,16,0.76)']} style={styles.previewGradient} />
              <View style={styles.previewActions}>
                <Pressable accessibilityRole="button" onPress={pickPhoto} style={({ pressed }) => [styles.previewButton, pressed && styles.pressed]}>
                  <MemoIcon color={memoColors.text} name="image" size={16} strokeWidth={2.25} />
                  <Text style={styles.previewButtonText}>{currentImageUri ? 'Change Photo' : 'Photos'}</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={takePhoto} style={({ pressed }) => [styles.previewButton, styles.previewButtonSecondary, pressed && styles.pressed]}>
                  <MemoIcon color={memoColors.text} name="camera" size={16} strokeWidth={2.25} />
                  <Text style={styles.previewButtonText}>Camera</Text>
                </Pressable>
              </View>
            </View>

            <StatusBanner
              message={status?.message || voiceNote.message || dictation.message}
              theme={bannerTheme}
              tone={status?.tone ?? 'info'}
            />

            <GlassCard style={styles.captionCard}>
              <TextInput
                maxLength={320}
                multiline
                onChangeText={setCaption}
                placeholder="What's the story behind this photo?"
                placeholderTextColor={memoColors.quiet}
                style={styles.captionInput}
                textAlignVertical="top"
                value={caption}
              />
              <Pressable
                accessibilityRole="button"
                onPress={toggleDictation}
                style={({ pressed }) => [styles.captionVoiceButton, dictation.isListening && styles.captionVoiceActive, pressed && styles.pressed]}
              >
                <MemoIcon color={dictation.isListening ? memoColors.text : memoColors.muted} name="mic" size={18} strokeWidth={2.4} />
              </Pressable>
              <Text style={styles.counter}>{caption.trim().length}/320</Text>
            </GlassCard>

            <GlassCard style={styles.voiceCard}>
              <LinearGradient colors={['rgba(34,211,238,0.14)', 'rgba(168,85,247,0.03)']} style={StyleSheet.absoluteFill} />
              <Text style={styles.voiceTitle}>Dictate Caption</Text>
              <Text style={styles.voiceBody}>Speak and MemoLens writes the story for you. Dictation is not saved as audio.</Text>
              <View style={styles.voiceRow}>
                <Pressable accessibilityRole="button" onPress={toggleDictation} style={({ pressed }) => [styles.recordButton, dictation.isListening && styles.recordButtonActive, pressed && styles.pressed]}>
                  <MemoIcon color={dictation.isListening ? memoColors.pink : memoColors.cyan} name="mic" size={22} strokeWidth={2.4} />
                </Pressable>
                <MemoWaveform active={dictation.isListening} />
              </View>
              <Text style={styles.voiceNote}>{dictation.isListening ? 'Listening now...' : 'Tap once to speak your caption.'}</Text>

              <View style={styles.voiceDivider} />

              <Text style={styles.voiceTitle}>Save a Voice Note</Text>
              <Text style={styles.voiceBody}>Add the real voice, sound, or feeling behind this memory. The recording stays private on this device.</Text>
              <View style={styles.voiceSaveRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={toggleVoiceNoteRecording}
                  style={({ pressed }) => [styles.voiceSaveButton, voiceNote.isRecording && styles.voiceSaveButtonActive, pressed && styles.pressed]}
                >
                  <MemoIcon color={voiceNote.isRecording ? memoColors.pink : memoColors.cyan} name={voiceNote.isRecording ? 'stop' : 'mic'} size={18} strokeWidth={2.4} />
                  <Text style={styles.voiceSaveButtonText}>
                    {voiceNote.isRecording ? 'Finish recording' : voiceNote.uri ? 'Replace voice note' : 'Record voice'}
                  </Text>
                </Pressable>
                <Text style={styles.voiceDuration}>{formatVoiceDuration(voiceDuration)}</Text>
              </View>
              {voiceNote.uri ? (
                <Pressable accessibilityRole="button" onPress={voiceNote.removeVoiceNote} style={({ pressed }) => [styles.removeVoiceButton, pressed && styles.pressed]}>
                  <Text style={styles.removeVoiceText}>Remove voice note</Text>
                </Pressable>
              ) : null}
            </GlassCard>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Mood</Text>
              <View style={styles.chipRow}>
                {moods.map((mood) => (
                  <FeatureChip
                    key={mood}
                    active={selectedMood === mood && !customMoodInput.trim()}
                    label={mood}
                    onPress={() => {
                      setSelectedMood(mood);
                      setCustomMoodInput('');
                    }}
                  />
                ))}
              </View>
              <TextInput
                onChangeText={(value) => {
                  setCustomMoodInput(value);
                  const mood = normalizeMood(value);
                  if (mood) {
                    setSelectedMood(mood);
                  }
                }}
                placeholder="Or type a mood like Proud, Nostalgic, Hopeful"
                placeholderTextColor={memoColors.quiet}
                style={styles.moodInput}
                value={customMoodInput}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Tags</Text>
              <View style={styles.chipRow}>
                {suggestedTags.map((tag) => (
                  <FeatureChip
                    key={tag}
                    active={selectedTags.some((existing) => existing.toLowerCase() === tag.toLowerCase())}
                    label={tag}
                    onPress={() => addTag(tag)}
                  />
                ))}
              </View>
              <TextInput
                autoCapitalize="none"
                onChangeText={setTagsInput}
                placeholder="Or type tags separated by commas"
                placeholderTextColor={memoColors.quiet}
                style={styles.tagsInput}
                value={tagsInput}
              />
            </View>
          </ScrollView>

          <View style={[styles.saveDock, { paddingBottom: 16 + insets.bottom }]}>
            <GradientButton disabled={isSaving} label={isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Memory'} onPress={saveItem} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function normalizeMood(value: string): string {
  return value.trim().replace(/\s+/g, ' ').slice(0, 28);
}

function getFallbackImageUri(): string {
  const resolver = (Image as typeof Image & {
    resolveAssetSource?: (source: unknown) => { uri?: string } | undefined;
  }).resolveAssetSource;

  return resolver?.(fallbackImage)?.uri ?? '';
}

const styles = StyleSheet.create({
  captionCard: {
    minHeight: 136,
    padding: 15,
  },
  captionInput: {
    color: memoColors.text,
    fontFamily: memoFont.regular,
    fontSize: 15,
    letterSpacing: 0,
    lineHeight: 22,
    minHeight: 94,
    paddingRight: 48,
  },
  captionVoiceActive: {
    backgroundColor: memoColors.accent,
  },
  captionVoiceButton: {
    alignItems: 'center',
    backgroundColor: memoColors.card,
    borderColor: memoColors.border,
    borderRadius: 20,
    borderWidth: 1,
    bottom: 14,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: 14,
    width: 40,
  },
  changePhoto: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(18, 20, 29, 0.88)',
    borderColor: memoColors.borderSoft,
    borderRadius: 20,
    borderWidth: 1,
    bottom: 16,
    flexDirection: 'row',
    gap: 8,
    minHeight: 40,
    paddingHorizontal: 16,
    position: 'absolute',
  },
  changePhotoText: {
    color: memoColors.text,
    fontFamily: memoFont.medium,
    fontSize: 13,
    letterSpacing: 0,
    lineHeight: 17,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  content: {
    gap: 20,
    paddingHorizontal: 24,
    paddingTop: 4,
  },
  counter: {
    bottom: 13,
    color: memoColors.quiet,
    fontFamily: memoFont.medium,
    fontSize: 11,
    letterSpacing: 0,
    position: 'absolute',
    right: 62,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  headerTitle: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 18,
    letterSpacing: 0,
    lineHeight: 24,
  },
  moodInput: {
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
  keyboard: {
    flex: 1,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.985 }],
  },
  previewFrame: {
    backgroundColor: memoColors.card,
    borderColor: memoColors.border,
    borderRadius: 24,
    borderWidth: 1,
    height: 320,
    overflow: 'hidden',
    position: 'relative',
  },
  previewGradient: {
    bottom: 0,
    height: '42%',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  previewActions: {
    alignSelf: 'center',
    bottom: 16,
    flexDirection: 'row',
    gap: 10,
    position: 'absolute',
  },
  previewButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 29, 0.9)',
    borderColor: memoColors.borderSoft,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 40,
    paddingHorizontal: 14,
  },
  previewButtonSecondary: {
    backgroundColor: 'rgba(26, 29, 41, 0.82)',
  },
  previewButtonText: {
    color: memoColors.text,
    fontFamily: memoFont.medium,
    fontSize: 13,
    letterSpacing: 0,
    lineHeight: 17,
  },
  previewImage: {
    height: '100%',
    width: '100%',
  },
  recordButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(34, 211, 238, 0.14)',
    borderColor: 'rgba(34, 211, 238, 0.28)',
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  recordButtonActive: {
    backgroundColor: 'rgba(251, 113, 133, 0.14)',
    borderColor: 'rgba(251, 113, 133, 0.34)',
  },
  safeArea: {
    flex: 1,
  },
  saveDock: {
    backgroundColor: 'rgba(9, 10, 16, 0.95)',
    borderColor: 'rgba(26, 29, 41, 0.78)',
    borderTopWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 14,
    letterSpacing: 0,
    lineHeight: 19,
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
  voiceBody: {
    color: memoColors.muted,
    fontFamily: memoFont.regular,
    fontSize: 13,
    letterSpacing: 0,
    lineHeight: 18,
    marginBottom: 16,
  },
  voiceCard: {
    padding: 20,
  },
  voiceDivider: {
    backgroundColor: memoColors.border,
    height: 1,
    marginBottom: 16,
    marginTop: 18,
    opacity: 0.86,
  },
  voiceDuration: {
    color: memoColors.muted,
    fontFamily: memoFont.medium,
    fontSize: 12,
    letterSpacing: 0,
    minWidth: 42,
    textAlign: 'right',
  },
  voiceNote: {
    color: memoColors.quiet,
    fontFamily: memoFont.regular,
    fontSize: 11,
    letterSpacing: 0,
    lineHeight: 16,
    marginTop: 12,
  },
  voiceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  removeVoiceButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    minHeight: 28,
    justifyContent: 'center',
  },
  removeVoiceText: {
    color: memoColors.pink,
    fontFamily: memoFont.medium,
    fontSize: 12,
    letterSpacing: 0,
    lineHeight: 16,
  },
  voiceSaveButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    borderColor: 'rgba(34, 211, 238, 0.26)',
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 14,
  },
  voiceSaveButtonActive: {
    backgroundColor: 'rgba(251, 113, 133, 0.13)',
    borderColor: 'rgba(251, 113, 133, 0.34)',
  },
  voiceSaveButtonText: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 13,
    letterSpacing: 0,
    lineHeight: 18,
  },
  voiceSaveRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  voiceTitle: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 21,
    marginBottom: 4,
  },
});
