import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Crypto from 'expo-crypto';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import { PrimaryButton } from '../components/PrimaryButton';
import { StatusBanner } from '../components/StatusBanner';
import { loadGalleryItems, saveGalleryItems, ThemePreference } from '../storage/galleryStorage';
import { getAppTheme } from '../theme/theme';
import { GalleryItem, RootStackParamList } from '../types/gallery';
import { useVoiceCaption } from '../voice/useVoiceCaption';

type AddItemScreenProps = NativeStackScreenProps<RootStackParamList, 'AddItem'> & {
  themePreference: ThemePreference;
};

export function AddItemScreen({ navigation, route, themePreference }: AddItemScreenProps) {
  const theme = getAppTheme(themePreference);
  const [caption, setCaption] = useState('');
  const [status, setStatus] = useState<{ message: string; tone: 'info' | 'error' | 'success' }>();
  const [isSaving, setIsSaving] = useState(false);
  const voice = useVoiceCaption({
    onResult: (text) => setCaption(text),
  });

  const saveItem = async () => {
    const trimmedCaption = caption.trim();

    if (!trimmedCaption) {
      setStatus({ message: 'Add a caption before saving.', tone: 'error' });
      return;
    }

    setIsSaving(true);
    const existingItems = await loadGalleryItems();
    const nextItem: GalleryItem = {
      id: Crypto.randomUUID(),
      caption: trimmedCaption,
      createdAt: new Date().toISOString(),
      imageUri: route.params.imageUri,
      source: route.params.source,
    };

    await saveGalleryItems([nextItem, ...existingItems]);
    setIsSaving(false);
    navigation.navigate('Gallery');
  };

  const toggleVoice = () => {
    if (voice.isListening) {
      voice.stopListening();
      return;
    }

    void voice.startListening();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={[styles.eyebrow, { color: theme.colors.muted }]}>New image</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>Add a caption</Text>
          </View>

          <Image
            resizeMode="cover"
            source={{ uri: route.params.imageUri }}
            style={[styles.preview, { borderRadius: theme.radius.md }]}
          />

          <View style={styles.form}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Caption</Text>
            <TextInput
              multiline
              onChangeText={setCaption}
              placeholder="Type a caption, or dictate it with voice"
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
            <StatusBanner message={voice.message || status?.message} theme={theme} tone={status?.tone ?? 'info'} />
            <View style={styles.actions}>
              <PrimaryButton
                label={voice.isListening ? 'Stop voice' : 'Dictate caption'}
                onPress={toggleVoice}
                theme={theme}
                variant="secondary"
              />
              <PrimaryButton disabled={isSaving} label={isSaving ? 'Saving...' : 'Save'} onPress={saveItem} theme={theme} />
              <PrimaryButton label="Cancel" onPress={() => navigation.goBack()} theme={theme} variant="ghost" />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    maxWidth: 820,
    padding: 20,
    width: '100%',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  form: {
    gap: 12,
  },
  header: {
    gap: 4,
  },
  input: {
    borderWidth: 1,
    fontSize: 16,
    minHeight: 130,
    padding: 14,
  },
  keyboard: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
  },
  preview: {
    aspectRatio: 1.35,
    width: '100%',
  },
  safeArea: {
    flex: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
  },
});
