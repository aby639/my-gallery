import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MemoLensLogo } from '../components/MemoLensLogo';
import { StatusBanner } from '../components/StatusBanner';
import {
  GlassCard,
  MemoBottomNav,
  MemoIcon,
  RoundIconButton,
  ScreenBackground,
  memoColors,
  memoFont,
} from '../components/memolens/MemoLensKit';
import { clearGalleryItems, loadGalleryItems } from '../storage/galleryStorage';
import { getAppTheme } from '../theme/theme';
import { GalleryItem, GalleryUser, RootStackParamList } from '../types/gallery';
import { clearPersistedVoices } from '../utils/audioAssets';
import { clearPersistedGalleryImages } from '../utils/imageAssets';

type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'> & {
  user: GalleryUser;
  onSignOut: () => Promise<void>;
};

type StatusState = {
  message: string;
  tone: 'info' | 'error' | 'success';
};

type SettingsModeColors = {
  border: string;
  button: string;
  card: string;
  muted: string;
  quiet: string;
  screen: string;
  text: string;
  tile: string;
};

export function SettingsScreen({
  navigation,
  onSignOut,
  user,
}: SettingsScreenProps) {
  const insets = useSafeAreaInsets();
  const bannerTheme = useMemo(() => getAppTheme('dark'), []);
  const modeColors = useMemo(getSettingsModeColors, []);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [status, setStatus] = useState<StatusState>();

  useFocusEffect(
    useCallback(() => {
      async function loadCounts() {
        setItems(await loadGalleryItems());
      }

      void loadCounts();
    }, []),
  );

  const handleClearGallery = async () => {
    const confirmed = await confirmDestructiveAction(
      'Clear local memories?',
      'This removes saved image copies, voice notes, captions, moods, favorites, and tags from this device.',
    );

    if (!confirmed) {
      return;
    }

    await clearGalleryItems();
    clearPersistedGalleryImages();
    clearPersistedVoices();
    setItems([]);
    setStatus({ message: 'Local memories cleared from this device.', tone: 'success' });
  };

  const handleSignOut = async () => {
    const confirmed = await confirmDestructiveAction(
      'Sign out now?',
      'You will return to MemoLens login. Local memories on this device will stay in place.',
    );

    if (!confirmed) {
      return;
    }

    await onSignOut();
  };

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

  const appVersion = Constants.expoConfig?.version ?? '1.2.0';
  const releaseChannel = Updates.channel ?? 'local';
  const runtimeVersion = Updates.runtimeVersion ?? '1.0.0';
  const favoriteCount = items.filter((item) => item.isFavorite).length;
  const tagCount = new Set(items.flatMap((item) => item.tags ?? [])).size;
  const isPrivateMode = user.id === 'demo-user' || user.email?.endsWith('@memolens.local');
  const accountLabel = isPrivateMode ? 'Private mode' : 'Google account';
  const firstName = user.name.trim().split(/\s+/)[0] || 'Aby';

  return (
    <ScreenBackground style={{ backgroundColor: modeColors.screen }}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: 30 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerRow}>
            <RoundIconButton icon="arrow-left" label="Back to Home" onPress={() => navigation.navigate('Gallery')} />
            <View style={styles.brandRow}>
              <MemoLensLogo size={25} />
              <Text style={[styles.brandText, { color: modeColors.text }]}>MemoLens</Text>
            </View>
            <RoundIconButton icon="settings" label="Profile settings" onPress={() => setStatus({ message: 'You are viewing profile settings.', tone: 'info' })} />
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.eyebrow}>Profile and privacy</Text>
            <Text style={[styles.title, { color: modeColors.text }]}>Your memory space</Text>
            <Text style={[styles.subtitle, { color: modeColors.muted }]}>Keep your saved moments private, readable, and ready on this device.</Text>
          </View>

          <StatusBanner message={status?.message} theme={bannerTheme} tone={status?.tone} />

          <GlassCard style={[styles.profileCard, { backgroundColor: modeColors.card, borderColor: modeColors.border }]}>
            <View style={styles.profileTop}>
              {user.photoUrl ? (
                <Image source={{ uri: user.photoUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>{firstName.charAt(0).toUpperCase() || 'A'}</Text>
                </View>
              )}
              <View style={styles.profileCopy}>
                <Text style={[styles.profileName, { color: modeColors.text }]}>{user.name || 'Private MemoLens'}</Text>
                <Text style={[styles.profileEmail, { color: modeColors.muted }]}>{user.email ?? 'Saved locally on this device'}</Text>
                <View style={styles.accountPill}>
                  <MemoIcon color={memoColors.pink} name={isPrivateMode ? 'heart' : 'user'} size={14} strokeWidth={2.4} />
                  <Text style={[styles.accountPillText, { color: modeColors.text }]}>{accountLabel}</Text>
                </View>
              </View>
            </View>

            <View style={styles.profileActions}>
              <ProfileButton colors={modeColors} icon="user" label="Sign out" onPress={handleSignOut} />
            </View>
          </GlassCard>

          <View style={styles.statsGrid}>
            <StatCard colors={modeColors} label="Memories" value={items.length.toString()} />
            <StatCard colors={modeColors} label="Favorites" value={favoriteCount.toString()} />
            <StatCard colors={modeColors} label="Tags" value={tagCount.toString()} />
          </View>

          <GlassCard style={[styles.sectionCard, { backgroundColor: modeColors.card, borderColor: modeColors.border }]}>
            <Text style={[styles.sectionTitle, { color: modeColors.text }]}>Storage and privacy</Text>
            <Text style={[styles.sectionBody, { color: modeColors.muted }]}>
              Memories are saved privately on this device. They do not sync to another phone yet, even when you sign in with the same Google account.
            </Text>
            <View style={styles.infoGrid}>
              <InfoTile colors={modeColors} label="Channel" value={releaseChannel} />
              <InfoTile colors={modeColors} label="Version" value={appVersion} />
            </View>
            <Text style={[styles.sectionNote, { color: modeColors.muted }]}>
              Google is used for sign-in only in this build. Camera, photo library, microphone, and speech recognition permissions are requested only when you use those features.
            </Text>
            <ProfileButton colors={modeColors} icon="share" label="Privacy policy" onPress={handleOpenPrivacyPolicy} />
            <DangerButton label="Clear local memories" onPress={handleClearGallery} />
          </GlassCard>

          <GlassCard style={[styles.sectionCard, { backgroundColor: modeColors.card, borderColor: modeColors.border }]}>
            <Text style={[styles.sectionTitle, { color: modeColors.text }]}>Release info</Text>
            <Text style={[styles.sectionBody, { color: modeColors.muted }]}>This build is for local QA and internal testing. Do not upload a new AAB until the rescue checklist passes.</Text>
            <InfoTile colors={modeColors} label="Runtime" value={runtimeVersion} />
          </GlassCard>
        </ScrollView>
      </SafeAreaView>

      <MemoBottomNav
        active="profile"
        bottomInset={insets.bottom}
        onCreate={() => navigation.navigate('AddItem', undefined)}
        onHome={() => navigation.navigate('Gallery')}
        onMemories={() => navigation.navigate('SearchMemories')}
        onProfile={() => undefined}
        onSearch={() => navigation.navigate('SearchMemories')}
      />
    </ScreenBackground>
  );
}

type ProfileButtonProps = {
  colors: SettingsModeColors;
  icon: 'settings' | 'share' | 'user';
  label: string;
  onPress: () => void;
};

function ProfileButton({ colors, icon, label, onPress }: ProfileButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.profileButton,
        { backgroundColor: colors.button, borderColor: colors.border },
        pressed && styles.pressed,
      ]}
    >
      <MemoIcon color={colors.text} name={icon} size={18} strokeWidth={2.3} />
      <Text style={[styles.profileButtonText, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

function DangerButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.dangerButton, pressed && styles.pressed]}>
      <MemoIcon color={memoColors.pink} name="trash" size={18} strokeWidth={2.3} />
      <Text style={styles.dangerButtonText}>{label}</Text>
    </Pressable>
  );
}

function StatCard({ colors, label, value }: { colors: SettingsModeColors; label: string; value: string }) {
  return (
    <GlassCard style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.quiet }]}>{label}</Text>
    </GlassCard>
  );
}

function InfoTile({ colors, label, value }: { colors: SettingsModeColors; label: string; value: string }) {
  return (
    <View style={[styles.infoTile, { backgroundColor: colors.tile, borderColor: colors.border }]}>
      <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.infoLabel, { color: colors.quiet }]}>{label}</Text>
    </View>
  );
}

function getSettingsModeColors(): SettingsModeColors {
  return {
    border: memoColors.border,
    button: 'rgba(26, 29, 41, 0.7)',
    card: memoColors.glass,
    muted: memoColors.muted,
    quiet: memoColors.quiet,
    screen: memoColors.background,
    text: memoColors.text,
    tile: 'rgba(26, 29, 41, 0.7)',
  };
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
  accountPill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(251, 113, 133, 0.1)',
    borderColor: 'rgba(251, 113, 133, 0.2)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 7,
    minHeight: 32,
    paddingHorizontal: 12,
  },
  accountPillText: {
    color: memoColors.text,
    fontFamily: memoFont.medium,
    fontSize: 12,
    letterSpacing: 0,
    lineHeight: 16,
  },
  avatarFallback: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    height: 76,
    justifyContent: 'center',
    width: 76,
  },
  avatarImage: {
    borderColor: memoColors.borderSoft,
    borderRadius: 24,
    borderWidth: 1,
    height: 76,
    width: 76,
  },
  avatarInitial: {
    color: memoColors.background,
    fontFamily: memoFont.bold,
    fontSize: 30,
    letterSpacing: 0,
    lineHeight: 36,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  brandText: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 18,
    letterSpacing: 0,
    lineHeight: 24,
  },
  content: {
    gap: 17,
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  dangerButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(251, 113, 133, 0.11)',
    borderColor: 'rgba(251, 113, 133, 0.28)',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 16,
  },
  dangerButtonText: {
    color: memoColors.pink,
    fontFamily: memoFont.semiBold,
    fontSize: 14,
    letterSpacing: 0,
    lineHeight: 19,
  },
  eyebrow: {
    color: memoColors.pink,
    fontFamily: memoFont.semiBold,
    fontSize: 12,
    letterSpacing: 0.4,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  infoLabel: {
    color: memoColors.quiet,
    fontFamily: memoFont.medium,
    fontSize: 10,
    letterSpacing: 0,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  infoTile: {
    backgroundColor: 'rgba(26, 29, 41, 0.7)',
    borderColor: memoColors.border,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    minHeight: 76,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  infoValue: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 18,
    letterSpacing: 0,
    lineHeight: 24,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
  },
  profileActions: {
    gap: 10,
  },
  profileButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(26, 29, 41, 0.7)',
    borderColor: memoColors.border,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 16,
  },
  profileButtonText: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 14,
    letterSpacing: 0,
    lineHeight: 19,
  },
  profileCard: {
    gap: 18,
    padding: 18,
  },
  profileCopy: {
    flex: 1,
    gap: 5,
  },
  profileEmail: {
    color: memoColors.muted,
    fontFamily: memoFont.regular,
    fontSize: 13,
    letterSpacing: 0,
    lineHeight: 18,
  },
  profileName: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 24,
    letterSpacing: 0,
    lineHeight: 30,
  },
  profileTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 15,
  },
  safeArea: {
    flex: 1,
  },
  sectionBody: {
    color: memoColors.muted,
    fontFamily: memoFont.regular,
    fontSize: 14,
    letterSpacing: 0,
    lineHeight: 21,
  },
  sectionCard: {
    gap: 14,
    padding: 18,
  },
  sectionNote: {
    color: memoColors.muted,
    fontFamily: memoFont.regular,
    fontSize: 13,
    letterSpacing: 0,
    lineHeight: 20,
  },
  sectionTitle: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 22,
    letterSpacing: 0,
    lineHeight: 28,
  },
  statCard: {
    flex: 1,
    gap: 3,
    minHeight: 88,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  statLabel: {
    color: memoColors.quiet,
    fontFamily: memoFont.medium,
    fontSize: 10,
    letterSpacing: 0,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statValue: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 24,
    letterSpacing: 0,
    lineHeight: 30,
  },
  subtitle: {
    color: memoColors.muted,
    fontFamily: memoFont.regular,
    fontSize: 15,
    letterSpacing: 0,
    lineHeight: 22,
  },
  title: {
    color: memoColors.text,
    fontFamily: memoFont.semiBold,
    fontSize: 32,
    letterSpacing: 0,
    lineHeight: 39,
  },
  titleBlock: {
    gap: 5,
    paddingTop: 6,
  },
});
