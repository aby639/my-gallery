import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGoogleAuth } from '../auth/useGoogleAuth';
import { MemoLensLogo } from '../components/MemoLensLogo';
import { StatusBanner } from '../components/StatusBanner';
import { ThemePreference } from '../storage/galleryStorage';
import { getAppTheme } from '../theme/theme';
import { GalleryUser, RootStackParamList } from '../types/gallery';

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'> & {
  onSignIn: (user: GalleryUser) => Promise<void>;
  themePreference: ThemePreference;
};

type FloatingCard = {
  source: ImageSourcePropType;
  styleKey: keyof typeof cardStyles;
};

const MEMOLENS_COLORS = {
  background: '#090A10',
  foreground: '#F8FAFC',
  muted: '#A1A1AA',
  quiet: '#71717A',
  surface: '#171827',
  surfaceStrong: '#1A1D29',
  border: 'rgba(255, 255, 255, 0.15)',
  borderSoft: 'rgba(255, 255, 255, 0.08)',
  purple: '#A855F7',
  pink: '#FB7185',
  orange: '#FB923C',
  shadow: 'rgba(0, 0, 0, 0.42)',
};

const memoryCards: FloatingCard[] = [
  { source: require('../../assets/memolens/sunset.jpg'), styleKey: 'topLeft' },
  { source: require('../../assets/memolens/forest.jpg'), styleKey: 'topRight' },
  { source: require('../../assets/memolens/coffee.jpg'), styleKey: 'midLeft' },
  { source: require('../../assets/memolens/cat.jpg'), styleKey: 'midRight' },
  { source: require('../../assets/memolens/travel.jpg'), styleKey: 'bottomLeft' },
  { source: require('../../assets/memolens/study.jpg'), styleKey: 'bottomRight' },
];

const featureLabels = ['Photo Memories', 'Voice Notes', 'Mood Tags', 'Private'];

export function LoginScreen({ onSignIn }: LoginScreenProps) {
  const theme = getAppTheme('dark');
  const { height, width } = useWindowDimensions();
  const { authWarning, canUseGoogle, isSigningIn, signInDemo, signInWithGoogle } = useGoogleAuth();
  const [authError, setAuthError] = useState<string | undefined>();

  const screenWidth = Math.min(width, 393);
  const scale = screenWidth / 393;
  const heroHeight = Math.max(360, Math.min(height * 0.49, 430));
  const horizontalPadding = Math.max(24, 28 * scale);

  const handleGoogleSignIn = async () => {
    setAuthError(undefined);
    const result = await signInWithGoogle();
    if (result.user) {
      await onSignIn(result.user);
      return;
    }

    if (result.error && !/cancel/i.test(result.error)) {
      setAuthError(result.error);
    }
  };

  const handlePrivateStart = async () => {
    setAuthError(undefined);
    const result = await signInDemo();
    if (result.user) {
      await onSignIn(result.user);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenBackground />
      <ScrollView
        bounces={false}
        contentContainerStyle={[styles.scrollContent, { minHeight: height }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.screen, { maxWidth: 393 }]}>
          <View style={[styles.hero, { height: heroHeight }]}>
            <View style={styles.heroGlow} />
            {memoryCards.map((card) => (
              <FloatingMemoryCard key={card.styleKey} scale={scale} source={card.source} style={cardStyles[card.styleKey]} />
            ))}
            <View style={styles.logoCluster}>
              <View style={styles.logoFrame}>
                <MemoLensLogo animated size={48} />
              </View>
              <Text style={styles.logoWordmark}>MemoLens</Text>
            </View>
          </View>

          <View style={[styles.contentPanel, { paddingHorizontal: horizontalPadding }]}>
            <View style={styles.featureRow}>
              {featureLabels.map((label) => (
                <FeatureChip key={label} label={label} />
              ))}
            </View>

            <Text style={styles.headline}>
              Save the photo.{'\n'}Keep the feeling.
            </Text>
            <Text style={styles.description}>A private memory space for photos, captions, moods, and voice notes.</Text>

            <View style={styles.actions}>
              <StatusBanner message={authError} theme={theme} tone="error" />
              <StatusBanner message={authWarning} theme={theme} tone="info" />
              <LoginActionButton
                disabled={!canUseGoogle || isSigningIn}
                label={isSigningIn ? 'Opening Google...' : 'Continue with Google'}
                onPress={handleGoogleSignIn}
                variant="google"
              />
              <LoginActionButton label="Start privately" onPress={handlePrivateStart} variant="private" />
              <Text style={styles.helperText}>No account needed. Your memories stay on this device.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ScreenBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.glowBlob, styles.purpleGlow]} />
      <View style={[styles.glowBlob, styles.pinkGlow]} />
      <View style={[styles.glowBlob, styles.orangeGlow]} />
    </View>
  );
}

type FloatingMemoryCardProps = {
  scale: number;
  source: ImageSourcePropType;
  style: StyleProp<ViewStyle>;
};

type NativeTransform = Exclude<NonNullable<ViewStyle['transform']>, string>;

function FloatingMemoryCard({ scale, source, style }: FloatingMemoryCardProps) {
  const transform: NativeTransform = [...cardTransform(style), { scale }];

  return (
    <View style={[styles.memoryCard, style, { transform }]}>
      <Image source={source} style={styles.memoryImage} />
      <View style={styles.memoryOverlay} />
    </View>
  );
}

function cardTransform(style: StyleProp<ViewStyle>): NativeTransform {
  const transform = StyleSheet.flatten(style)?.transform;
  return Array.isArray(transform) ? (transform as NativeTransform) : [];
}

function FeatureChip({ label }: { label: string }) {
  return (
    <View style={styles.featureChip}>
      <Text style={styles.featureText}>{label}</Text>
    </View>
  );
}

type LoginActionButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant: 'google' | 'private';
};

function LoginActionButton({ disabled = false, label, onPress, variant }: LoginActionButtonProps) {
  const isGoogle = variant === 'google';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.loginButton,
        isGoogle ? styles.googleButton : styles.privateButton,
        {
          opacity: disabled ? 0.52 : pressed ? 0.88 : 1,
          transform: [{ scale: pressed && !disabled ? 0.985 : 1 }],
        },
      ]}
    >
      {isGoogle ? <GoogleGlyph /> : null}
      <Text style={[styles.loginButtonText, isGoogle ? styles.googleButtonText : styles.privateButtonText]}>{label}</Text>
    </Pressable>
  );
}

function GoogleGlyph() {
  return <Text style={styles.googleGlyph}>G</Text>;
}

const styles = StyleSheet.create({
  actions: {
    gap: 12,
    marginTop: 18,
    width: '100%',
  },
  contentPanel: {
    backgroundColor: 'transparent',
    marginTop: -18,
    paddingBottom: 28,
    width: '100%',
  },
  description: {
    color: MEMOLENS_COLORS.muted,
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0,
    lineHeight: 26,
    paddingRight: 12,
  },
  featureChip: {
    backgroundColor: 'rgba(26, 29, 41, 0.62)',
    borderColor: MEMOLENS_COLORS.borderSoft,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  featureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  featureText: {
    color: MEMOLENS_COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0,
  },
  glowBlob: {
    borderRadius: 999,
    position: 'absolute',
  },
  googleButton: {
    backgroundColor: MEMOLENS_COLORS.foreground,
    borderColor: MEMOLENS_COLORS.foreground,
  },
  googleButtonText: {
    color: MEMOLENS_COLORS.background,
  },
  googleGlyph: {
    color: MEMOLENS_COLORS.background,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0,
    marginRight: 4,
  },
  headline: {
    color: MEMOLENS_COLORS.foreground,
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: 0,
    lineHeight: 39,
    marginBottom: 18,
  },
  helperText: {
    color: MEMOLENS_COLORS.quiet,
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0,
    lineHeight: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  hero: {
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  heroGlow: {
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    borderRadius: 180,
    height: 250,
    left: '20%',
    position: 'absolute',
    top: '20%',
    width: 250,
  },
  loginButton: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { height: 12, width: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    width: '100%',
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0,
  },
  logoCluster: {
    alignItems: 'center',
    left: '50%',
    position: 'absolute',
    top: '45%',
    transform: [{ translateX: -82 }, { translateY: -62 }],
    width: 164,
    zIndex: 20,
  },
  logoFrame: {
    alignItems: 'center',
    backgroundColor: 'rgba(23, 24, 39, 0.86)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 34,
    borderWidth: 1,
    height: 104,
    justifyContent: 'center',
    shadowColor: MEMOLENS_COLORS.pink,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.26,
    shadowRadius: 34,
    width: 104,
  },
  logoWordmark: {
    color: MEMOLENS_COLORS.foreground,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0,
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { height: 2, width: 0 },
    textShadowRadius: 8,
  },
  memoryCard: {
    backgroundColor: MEMOLENS_COLORS.surface,
    borderColor: MEMOLENS_COLORS.border,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'absolute',
    shadowColor: MEMOLENS_COLORS.shadow,
    shadowOffset: { height: 18, width: 0 },
    shadowOpacity: 0.42,
    shadowRadius: 28,
    zIndex: 10,
  },
  memoryImage: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  memoryOverlay: {
    backgroundColor: 'rgba(9, 10, 16, 0.2)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  orangeGlow: {
    backgroundColor: MEMOLENS_COLORS.orange,
    bottom: -130,
    height: 300,
    left: -110,
    opacity: 0.07,
    width: 300,
  },
  pinkGlow: {
    backgroundColor: MEMOLENS_COLORS.pink,
    height: 250,
    opacity: 0.07,
    right: -110,
    top: '38%',
    width: 250,
  },
  privateButton: {
    backgroundColor: MEMOLENS_COLORS.surface,
    borderColor: MEMOLENS_COLORS.surfaceStrong,
  },
  privateButtonText: {
    color: MEMOLENS_COLORS.foreground,
  },
  purpleGlow: {
    backgroundColor: MEMOLENS_COLORS.purple,
    height: 230,
    left: '18%',
    opacity: 0.07,
    top: '10%',
    width: 230,
  },
  safeArea: {
    backgroundColor: MEMOLENS_COLORS.background,
    flex: 1,
  },
  screen: {
    alignSelf: 'center',
    flex: 1,
    overflow: 'hidden',
    width: '100%',
  },
  scrollContent: {
    backgroundColor: MEMOLENS_COLORS.background,
    flexGrow: 1,
  },
});

const cardStyles = StyleSheet.create({
  bottomLeft: {
    height: 96,
    left: '5%',
    top: '50%',
    transform: [{ rotate: '-6deg' }],
    width: 128,
  },
  bottomRight: {
    height: 112,
    right: '7%',
    top: '60%',
    transform: [{ rotate: '6deg' }],
    width: 96,
  },
  midLeft: {
    height: 104,
    left: '4%',
    top: '28%',
    transform: [{ rotate: '3deg' }],
    width: 104,
  },
  midRight: {
    height: 128,
    right: '4%',
    top: '38%',
    transform: [{ rotate: '-3deg' }],
    width: 96,
  },
  topLeft: {
    height: 128,
    left: '6%',
    top: '6%',
    transform: [{ rotate: '-6deg' }],
    width: 96,
  },
  topRight: {
    height: 144,
    right: '5%',
    top: '10%',
    transform: [{ rotate: '6deg' }],
    width: 112,
  },
});
