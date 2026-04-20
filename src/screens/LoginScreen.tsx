import { NativeStackScreenProps } from '@react-navigation/native-stack';
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

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (result.user) {
      await onSignIn(result.user);
    }
  };

  const handleDemoSignIn = async () => {
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
            A local-first gallery for images, voice captions, quick search, and sharing.
          </Text>
        </View>

        <View style={styles.actions}>
          <StatusBanner message={authWarning} theme={theme} tone="info" />
          <PrimaryButton
            disabled={!canUseGoogle || isSigningIn}
            fullWidth
            label={isSigningIn ? 'Opening Google...' : 'Continue with Google'}
            onPress={handleGoogleSignIn}
            theme={theme}
          />
          <PrimaryButton
            fullWidth
            label="Use demo profile"
            onPress={handleDemoSignIn}
            theme={theme}
            variant="secondary"
          />
          <Text style={[styles.note, { color: theme.colors.muted }]}>
            Demo mode keeps the reviewer flow available until OAuth client IDs are added.
          </Text>
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
