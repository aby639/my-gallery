import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGoogleAuth } from '../auth/useGoogleAuth';
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
          <View style={styles.brandRow}>
            <View
              style={[
                styles.brandMark,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.radius.md,
                },
              ]}
            >
              <View style={[styles.brandPhoto, { backgroundColor: theme.colors.primaryText, borderRadius: theme.radius.sm }]}>
                <View style={[styles.brandDot, { backgroundColor: theme.colors.accent, borderRadius: 4 }]} />
              </View>
            </View>
            <Text style={[styles.brand, { color: theme.colors.text }]}>My Gallery</Text>
          </View>
          <Text style={[styles.headline, { color: theme.colors.text }]}>Save the photo. Keep the sentence.</Text>
          <Text style={[styles.body, { color: theme.colors.muted }]}>
            Sign in with Google, save images, dictate captions, search quickly, and share the moments that matter.
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
                  : 'Development fallback only. The required flow is Continue with Google.'}
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
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  brandDot: {
    height: 8,
    position: 'absolute',
    right: 7,
    top: 7,
    width: 8,
  },
  brandMark: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  brandPhoto: {
    height: 25,
    width: 27,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
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
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 50,
    maxWidth: 620,
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
  safeArea: {
    flex: 1,
  },
});
