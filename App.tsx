import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { clearNativeGoogleSession } from './src/auth/nativeGoogleSignIn';
import { AppNavigator } from './src/navigation/AppNavigator';
import {
  clearUser,
  loadUser,
  saveUser,
  ThemePreference,
} from './src/storage/galleryStorage';
import { getAppTheme } from './src/theme/theme';
import { GalleryUser } from './src/types/gallery';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [fontLoadTimedOut, setFontLoadTimedOut] = useState(false);
  const themePreference: ThemePreference = 'dark';
  const [user, setUser] = useState<GalleryUser | null>(null);
  const theme = getAppTheme(themePreference);
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    async function bootstrap() {
      const storedUser = await loadUser();
      setUser(storedUser);
      setIsReady(true);
    }

    void bootstrap();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      return undefined;
    }

    const timeout = setTimeout(() => setFontLoadTimedOut(true), 2500);
    return () => clearTimeout(timeout);
  }, [fontsLoaded]);

  const handleSignIn = async (nextUser: GalleryUser) => {
    await saveUser(nextUser);
    setUser(nextUser);
  };

  const handleSignOut = async () => {
    await clearNativeGoogleSession();
    await clearUser();
    setUser(null);
  };

  if (!isReady || (!fontsLoaded && !fontLoadTimedOut)) {
    return (
      <SafeAreaProvider>
        <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppNavigator
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        themePreference={themePreference}
        user={user}
      />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
