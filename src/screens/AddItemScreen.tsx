import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Crypto from 'expo-crypto';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../components/PrimaryButton';
import { StatusBanner } from '../components/StatusBanner';
import { MEMORY_MOODS, parseTagInput, SUGGESTED_TAGS } from '../gallery/galleryMetadata';
import { loadGalleryItems, saveGalleryItems, ThemePreference } from '../storage/galleryStorage';
import { AppTheme, getAppTheme } from '../theme/theme';
import { GalleryItem, RootStackParamList } from '../types/gallery';
import { persistImageForGallery } from '../utils/imageAssets';
import { useVoiceCaption } from '../voice/useVoiceCaption';

type AddItemScreenProps = NativeStackScreenProps<RootStackParamList, 'AddItem'> & {
  themePreference: ThemePreference;
};

export function AddItemScreen({ navigation, route, themePreference }: AddItemScreenProps) {
  const theme = getAppTheme(themePreference);
  const [caption, setCaption] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>(MEMORY_MOODS[0]);
  const [status, setStatus] = useState<{ message: string; tone: 'info' | 'error' | 'success' }>();
  const [isSaving, setIsSaving] = useState(false);
  const voice = useVoiceCaption({
    onResult: (text) => setCaption(text),
  });

  const saveItem = async () => {
    const trimmedCaption = caption.trim();

    if (!trimmedCaption) {
      setStatus({ message: 'Write or dictate the memory before saving.', tone: 'error' });
      return;
    }

    setIsSaving(true);

    try {
      const id = Crypto.randomUUID();
      const imageUri = await persistImageForGallery(route.params.imageUri, id);
      const existingItems = await loadGalleryItems();
      const nextItem: GalleryItem = {
        id,
        caption: trimmedCaption,
        createdAt: new Date().toISOString(),
        imageUri,
        isFavorite: false,
        mood: selectedMood,
        source: route.params.source,
        tags: parseTagInput(tagsInput),
      };

      await saveGalleryItems([nextItem, ...existingItems]);
      navigation.navigate('Gallery');
    } catch {
      setStatus({ message: 'The image could not be saved. Try again once the file finishes loading.', tone: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleVoice = () => {
    if (voice.isListening) {
      voice.stopListening();
      return;
    }

    void voice.startListening();
  };

  const addSuggestedTag = (tag: string) => {
    const tags = parseTagInput(tagsInput);

    if (tags.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
      return;
    }

    setTagsInput([...tags, tag].join(', '));
  };

  const characterCount = `${caption.trim().length}/320`;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <PrimaryButton label="Back" onPress={() => navigation.goBack()} theme={theme} variant="ghost" />
            <View style={styles.headerCopy}>
              <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>Capture. Write. Remember.</Text>
              <Text style={[styles.title, { color: theme.colors.text }]}>Create Memory</Text>
            </View>
          </View>

          <View
            style={[
              styles.previewFrame,
              {
                backgroundColor: theme.colors.surfaceRaised,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
                boxShadow: `0 20px 44px ${theme.colors.shadow}`,
              },
            ]}
          >
            <Image resizeMode="cover" source={{ uri: route.params.imageUri }} style={styles.preview} />
            <View style={[styles.previewPill, { backgroundColor: theme.colors.surface, borderRadius: theme.radius.sm }]}>
              <Text style={[styles.previewPillText, { color: theme.colors.text }]}>
                {route.params.source === 'camera' ? 'Camera memory' : 'Photo memory'}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [
                styles.changePhoto,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.radius.sm,
                  opacity: pressed ? 0.72 : 1,
                },
              ]}
            >
              <Text style={[styles.changePhotoText, { color: theme.colors.primaryText }]}>Change photo</Text>
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
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Caption</Text>
              <Text style={[styles.counter, { color: theme.colors.muted }]}>{characterCount}</Text>
            </View>
            <TextInput
              multiline
              maxLength={320}
              onChangeText={setCaption}
              placeholder="What was happening here? Why did it matter?"
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

            <View
              style={[
                styles.voicePanel,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.md,
                },
              ]}
            >
              <View style={styles.voiceCopy}>
                <Text style={[styles.voiceTitle, { color: theme.colors.text }]}>Voice caption</Text>
                <Text style={[styles.voiceBody, { color: theme.colors.muted }]}>
                  Dictate the caption, then edit the words before saving.
                </Text>
              </View>
              <Waveform active={voice.isListening} theme={theme} />
              <PrimaryButton
                icon="V"
                label={voice.isListening ? 'Stop' : 'Dictate'}
                onPress={toggleVoice}
                theme={theme}
                variant="secondary"
              />
            </View>

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
              placeholder="nature, morning, family"
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
            <View style={styles.chipRow}>
              {SUGGESTED_TAGS.slice(0, 6).map((tag) => (
                <ChoiceChip key={tag} active={false} label={tag} onPress={() => addSuggestedTag(tag)} theme={theme} />
              ))}
            </View>

            <StatusBanner message={voice.message || status?.message} theme={theme} tone={status?.tone ?? 'info'} />
            <View style={styles.actions}>
              <PrimaryButton
                disabled={isSaving}
                fullWidth
                icon="S"
                label={isSaving ? 'Saving memory...' : 'Save Memory'}
                onPress={saveItem}
                theme={theme}
              />
              <PrimaryButton fullWidth label="Cancel" onPress={() => navigation.goBack()} theme={theme} variant="ghost" />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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

type WaveformProps = {
  active: boolean;
  theme: AppTheme;
};

function Waveform({ active, theme }: WaveformProps) {
  return (
    <View style={styles.waveform} accessibilityLabel={active ? 'Voice caption listening' : 'Voice caption idle'}>
      {[10, 18, 13, 24, 16, 28, 12, 21].map((height, index) => (
        <View
          key={`${height}-${index}`}
          style={[
            styles.waveBar,
            {
              backgroundColor: active
                ? index % 2 === 0
                  ? theme.colors.accent
                  : theme.colors.warm
                : theme.colors.border,
              borderRadius: 3,
              height,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 10,
  },
  changePhoto: {
    bottom: 14,
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
    right: 14,
  },
  changePhotoText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
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
    maxWidth: 860,
    padding: 20,
    width: '100%',
  },
  counter: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
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
  input: {
    borderWidth: 1,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 132,
    padding: 14,
  },
  keyboard: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  preview: {
    aspectRatio: 1.42,
    width: '100%',
  },
  previewFrame: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewPill: {
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
    position: 'absolute',
    top: 14,
  },
  previewPillText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  safeArea: {
    flex: 1,
  },
  tagsInput: {
    borderWidth: 1,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 39,
  },
  voiceBody: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  voiceCopy: {
    flex: 1,
    gap: 2,
    minWidth: 140,
  },
  voicePanel: {
    alignItems: 'center',
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    padding: 12,
  },
  voiceTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0,
  },
  waveBar: {
    width: 4,
  },
  waveform: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    height: 34,
  },
});
