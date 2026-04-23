import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
      <View style={styles.container}>
        <View style={styles.poster}>
          <Text style={[styles.brand, { color: theme.colors.text }]}>My Gallery</Text>
          <Text style={[styles.headline, { color: theme.colors.text }]}>Save the photo. Keep the sentence.</Text>
          <Text style={[styles.body, { color: theme.colors.muted }]}>
            Sign in with Google, save images, dictate captions, search quickly, and share the moments that matter.
          </Text>
        </View>

        <View style={styles.actions}>
          <StatusBanner message={authError} theme={theme} tone="error" />
          <StatusBanner message={authWarning} theme={theme} tone="info" />
          <PrimaryButton
            disabled={!canUseGoogle || isSigningIn}
            fullWidth
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 12,
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
  container: {
    alignSelf: 'center',
    flex: 1,
    justifyContent: 'center',
    maxWidth: 720,
    padding: 24,
    width: '100%',
  },
  headline: {
    fontSize: 44,
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
