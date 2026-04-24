import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { useCallback, useState } from 'react';
import { Alert, Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../components/PrimaryButton';
import { StatusBanner } from '../components/StatusBanner';
import { clearGalleryItems, loadGalleryItems, ThemePreference } from '../storage/galleryStorage';
import { getAppTheme } from '../theme/theme';
import { GalleryUser, RootStackParamList } from '../types/gallery';
import { clearPersistedGalleryImages } from '../utils/imageAssets';

type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'> & {
  user: GalleryUser;
  themePreference: ThemePreference;
  onSignOut: () => Promise<void>;
  onToggleTheme: () => void;
};

export function SettingsScreen({
  navigation,
  onSignOut,
  onToggleTheme,
  themePreference,
  user,
}: SettingsScreenProps) {
  const theme = getAppTheme(themePreference);
  const [itemCount, setItemCount] = useState(0);
  const [status, setStatus] = useState<{ message: string; tone: 'info' | 'error' | 'success' }>();

  useFocusEffect(
    useCallback(() => {
      async function loadCounts() {
        const items = await loadGalleryItems();
        setItemCount(items.length);
      }

      void loadCounts();
    }, []),
  );

  const handleClearGallery = async () => {
    const confirmed = await confirmDestructiveAction(
      'Clear saved gallery?',
      'This removes saved images, captions, favorites, and tags from this device.',
    );

    if (!confirmed) {
      return;
    }

    await clearGalleryItems();
    clearPersistedGalleryImages();
    setItemCount(0);
    setStatus({ message: 'Local gallery cleared from this device.', tone: 'success' });
  };

  const handleSignOut = async () => {
    const confirmed = await confirmDestructiveAction(
      'Sign out now?',
      'You will return to the Google login screen, but local gallery data on this device will stay in place.',
    );

    if (!confirmed) {
      return;
    }

    await onSignOut();
  };

  const appVersion = Constants.expoConfig?.version ?? '1.1.0';
  const releaseChannel = Updates.channel ?? 'preview';
  const runtimeVersion = Updates.runtimeVersion ?? '1.0.0';
  const hostedPrivacyPolicyUrl = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL?.trim();

  const handleOpenPrivacyPolicy = async () => {
    if (hostedPrivacyPolicyUrl) {
      const canOpen = await Linking.canOpenURL(hostedPrivacyPolicyUrl);

      if (canOpen) {
        await Linking.openURL(hostedPrivacyPolicyUrl);
        return;
      }
    }

    navigation.navigate('PrivacyPolicy');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <PrimaryButton label="Back" onPress={() => navigation.goBack()} theme={theme} variant="ghost" />
          <View style={styles.headerCopy}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Settings</Text>
            <Text style={[styles.subtitle, { color: theme.colors.muted }]}>
              Account, privacy, appearance, and local storage controls.
            </Text>
          </View>
        </View>

        <StatusBanner message={status?.message} theme={theme} tone={status?.tone} />

        <SectionCard body={user.email ?? 'Google profile connected'} theme={theme} title={user.name}>
          <PrimaryButton
            label={themePreference === 'dark' ? 'Use light mode' : 'Use dark mode'}
            onPress={onToggleTheme}
            theme={theme}
            variant="secondary"
          />
          <PrimaryButton label="Sign out" onPress={handleSignOut} theme={theme} variant="ghost" />
        </SectionCard>

        <SectionCard
          body="Everything in the gallery is stored locally on this device unless you actively share it."
          theme={theme}
          title="Storage and privacy"
        >
          <View style={styles.kpiRow}>
            <InfoCard label="Saved items" theme={theme} value={itemCount.toString()} />
            <InfoCard label="Channel" theme={theme} value={releaseChannel} />
            <InfoCard label="Version" theme={theme} value={appVersion} />
          </View>
          <Text style={[styles.detailText, { color: theme.colors.muted }]}>
            Google is used for sign-in only. Camera, photo library, microphone, and speech recognition permissions are
            requested only when you use those features.
          </Text>
          <PrimaryButton
            label="Privacy policy"
            onPress={handleOpenPrivacyPolicy}
            theme={theme}
            variant="secondary"
            accessibilityHint="Open the app privacy policy"
          />
          <PrimaryButton label="Clear local gallery" onPress={handleClearGallery} theme={theme} variant="danger" />
        </SectionCard>

        <SectionCard body="This build is ready for tester installs and OTA UI updates." theme={theme} title="Release info">
          <InfoCard label="Runtime" theme={theme} value={runtimeVersion} />
          <Text style={[styles.detailText, { color: theme.colors.muted }]}>
            Publish a new Android App Bundle when native packages, permissions, Google auth config, or runtime version
            changes. Use EAS Update for UI, copy, and other compatible JavaScript changes.
          </Text>
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}

type SectionCardProps = {
  title: string;
  body: string;
  theme: ReturnType<typeof getAppTheme>;
  children: React.ReactNode;
};

function SectionCard({ body, children, theme, title }: SectionCardProps) {
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
      <View style={styles.sectionCopy}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.sectionBody, { color: theme.colors.muted }]}>{body}</Text>
      </View>
      <View style={styles.sectionActions}>{children}</View>
    </View>
  );
}

type InfoCardProps = {
  label: string;
  theme: ReturnType<typeof getAppTheme>;
  value: string;
};

function InfoCard({ label, theme, value }: InfoCardProps) {
  return (
    <View
      style={[
        styles.infoCard,
        {
          backgroundColor: theme.colors.surfaceAlt,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
        },
      ]}
    >
      <Text style={[styles.infoValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.infoLabel, { color: theme.colors.muted }]}>{label}</Text>
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
        { text: 'Continue', style: 'destructive', onPress: () => settle(true) },
      ],
      {
        cancelable: true,
        onDismiss: () => settle(false),
      },
    );
  });
}

const styles = StyleSheet.create({
  content: {
    alignSelf: 'center',
    gap: 16,
    maxWidth: 920,
    padding: 20,
    width: '100%',
  },
  detailText: {
    fontSize: 13,
    lineHeight: 18,
  },
  header: {
    gap: 12,
  },
  headerCopy: {
    gap: 4,
  },
  infoCard: {
    borderWidth: 1,
    flex: 1,
    gap: 4,
    minWidth: 120,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
  },
  kpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  safeArea: {
    flex: 1,
  },
  section: {
    borderWidth: 1,
    gap: 16,
    padding: 18,
  },
  sectionActions: {
    gap: 10,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionCopy: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 22,
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
