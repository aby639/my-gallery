import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppNavigator } from './src/navigation/AppNavigator';
import {
  clearUser,
  loadThemePreference,
  loadUser,
  saveThemePreference,
  saveUser,
  ThemePreference,
} from './src/storage/galleryStorage';
import { getAppTheme } from './src/theme/theme';
import { GalleryUser } from './src/types/gallery';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [themePreference, setThemePreference] = useState<ThemePreference>('light');
  const [user, setUser] = useState<GalleryUser | null>(null);
  const theme = getAppTheme(themePreference);

  useEffect(() => {
    async function bootstrap() {
      const [storedUser, storedTheme] = await Promise.all([loadUser(), loadThemePreference()]);
      setUser(storedUser);
      setThemePreference(storedTheme);
      setIsReady(true);
    }

    void bootstrap();
  }, []);

  const handleSignIn = async (nextUser: GalleryUser) => {
    await saveUser(nextUser);
    setUser(nextUser);
  };

  const handleSignOut = async () => {
    await clearUser();
    setUser(null);
  };

  const handleToggleTheme = () => {
    const nextTheme = themePreference === 'dark' ? 'light' : 'dark';
    setThemePreference(nextTheme);
    void saveThemePreference(nextTheme);
  };

  if (!isReady) {
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
      <StatusBar style={themePreference === 'dark' ? 'light' : 'dark'} />
      <AppNavigator
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onToggleTheme={handleToggleTheme}
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
