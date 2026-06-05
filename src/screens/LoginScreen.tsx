import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGoogleAuth } from '../auth/useGoogleAuth';
import { AppLogo } from '../components/AppLogo';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatusBanner } from '../components/StatusBanner';
import { ThemePreference } from '../storage/galleryStorage';
import { getAppTheme } from '../theme/theme';
import { GalleryUser, RootStackParamList } from '../types/gallery';

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'> & {
  onSignIn: (user: GalleryUser) => Promise<void>;
  themePreference: ThemePreference;
};

export function LoginScreen({ onSignIn, themePreference }: LoginScreenProps) {
  const theme = getAppTheme(themePreference);
  const { authWarning, canUseGoogle, isSigningIn, signInDemo, signInWithGoogle } = useGoogleAuth();
  const showDemoFallback = __DEV__ || Boolean(authWarning);
  const [authError, setAuthError] = useState<string | undefined>();

  const handleGoogleSignIn = async () => {
    setAuthError(undefined);
    const result = await signInWithGoogle();
    if (result.user) {
      await onSignIn(result.user);
      return;
    }

    setAuthError(result.error);
  };

  const handleDemoSignIn = async () => {
    setAuthError(undefined);
    const result = await signInDemo();
    if (result.user) {
      await onSignIn(result.user);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.poster}>
          <View style={styles.logoRow}>
            <AppLogo animated size={86} theme={theme} />
            <View style={styles.brandCopy}>
              <Text style={[styles.brand, { color: theme.colors.text }]}>MemoLens</Text>
              <Text style={[styles.tagline, { color: theme.colors.accent }]}>Save the photo. Keep the feeling.</Text>
            </View>
          </View>
          <Text style={[styles.headline, { color: theme.colors.text }]}>Private memories with the story still attached.</Text>
          <Text style={[styles.body, { color: theme.colors.muted }]}>
            Save photos, write or dictate captions, add moods and tags, then find the moment again without digging
            through your camera roll.
          </Text>
        </View>

        <View
          style={[
            styles.actions,
            {
              backgroundColor: theme.colors.surfaceRaised,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.md,
              boxShadow: `0 18px 42px ${theme.colors.shadow}`,
            },
          ]}
        >
          <StatusBanner message={authError} theme={theme} tone="error" />
          <StatusBanner message={authWarning} theme={theme} tone="info" />
          <PrimaryButton
            disabled={!canUseGoogle || isSigningIn}
            fullWidth
            icon="G"
            label={isSigningIn ? 'Opening Google...' : 'Continue with Google'}
            onPress={handleGoogleSignIn}
            theme={theme}
          />
          <Text style={[styles.privacyNote, { color: theme.colors.muted }]}>
            Google is used for sign-in only. Your saved memories stay on this device unless you share them.
          </Text>
          {showDemoFallback ? (
            <>
              <PrimaryButton
                fullWidth
                label="Use demo profile"
                onPress={handleDemoSignIn}
                theme={theme}
                variant="secondary"
              />
              <Text style={[styles.note, { color: theme.colors.muted }]}>
                {authWarning
                  ? 'Review fallback only. Add Google OAuth IDs to enable the required sign-in path.'
                  : 'Development fallback only. Continue with Google is the production flow.'}
              </Text>
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actions: {
    borderWidth: 1,
    gap: 12,
    padding: 14,
    width: '100%',
  },
  body: {
    fontSize: 17,
    lineHeight: 24,
    maxWidth: 520,
  },
  brand: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 0,
  },
  brandCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  container: {
    alignSelf: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    maxWidth: 720,
    padding: 24,
    width: '100%',
  },
  headline: {
    fontSize: 41,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 48,
    maxWidth: 620,
  },
  logoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  note: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  poster: {
    gap: 14,
    marginBottom: 36,
  },
  privacyNote: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  safeArea: {
    flex: 1,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0,
  },
});
