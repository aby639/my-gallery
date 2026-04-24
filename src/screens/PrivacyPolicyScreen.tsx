import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../components/PrimaryButton';
import { ThemePreference } from '../storage/galleryStorage';
import { getAppTheme } from '../theme/theme';
import { RootStackParamList } from '../types/gallery';

type PrivacyPolicyScreenProps = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'> & {
  themePreference: ThemePreference;
};

export function PrivacyPolicyScreen({ navigation, themePreference }: PrivacyPolicyScreenProps) {
  const theme = getAppTheme(themePreference);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <PrimaryButton
          label="Back"
          onPress={() => navigation.goBack()}
          theme={theme}
          variant="ghost"
          accessibilityHint="Return to settings"
        />

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Privacy Policy</Text>
          <Text style={[styles.subtitle, { color: theme.colors.muted }]}>Last updated: 24 April 2026</Text>
        </View>

        <PolicySection
          body="My Gallery is a local-first photo notebook. You can sign in with Google, save photos from the camera or library, write or dictate captions, add tags and favorites, and share images to other apps."
          themePreference={themePreference}
          title="What the app does"
        />
        <PolicySection
          body="The app may access your Google name, email address, and profile photo so your signed-in account can be shown inside the app."
          themePreference={themePreference}
          title="Data collected"
        />
        <PolicySection
          body="Saved image copies, captions, tags, favorites, theme preference, and signed-in profile state are stored locally on the device in this version of the app."
          themePreference={themePreference}
          title="Data stored on device"
        />
        <PolicySection
          body="Camera, photo library, microphone, and speech recognition permissions are requested only when you use the related feature."
          themePreference={themePreference}
          title="Permissions"
        />
        <PolicySection
          body="When you tap Share, the selected image is passed to the target app you choose. That destination app handles the shared content under its own policies."
          themePreference={themePreference}
          title="Sharing"
        />
        <PolicySection
          body="Gallery data stays on the device until you delete items, clear the local gallery in Settings, or uninstall the app."
          themePreference={themePreference}
          title="Retention"
        />
        <Text style={[styles.note, { color: theme.colors.muted }]}>
          For Play Store production, publish a hosted privacy policy URL that matches this text and the shipped feature
          set.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

type PolicySectionProps = {
  title: string;
  body: string;
  themePreference: ThemePreference;
};

function PolicySection({ body, themePreference, title }: PolicySectionProps) {
  const theme = getAppTheme(themePreference);

  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
        },
      ]}
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.sectionBody, { color: theme.colors.muted }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    alignSelf: 'center',
    gap: 14,
    maxWidth: 920,
    padding: 20,
    width: '100%',
  },
  header: {
    gap: 4,
  },
  note: {
    fontSize: 13,
    lineHeight: 18,
    paddingBottom: 24,
  },
  safeArea: {
    flex: 1,
  },
  section: {
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
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
  },
});
