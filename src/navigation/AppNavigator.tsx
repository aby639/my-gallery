import { LinkingOptions, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ThemePreference } from '../storage/galleryStorage';
import { getNavigationTheme } from '../theme/theme';
import { GalleryUser, RootStackParamList } from '../types/gallery';
import { AddItemScreen } from '../screens/AddItemScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { GalleryScreen } from '../screens/GalleryScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { PrivacyPolicyScreen } from '../screens/PrivacyPolicyScreen';
import { SearchMemoriesScreen } from '../screens/SearchMemoriesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  config: {
    screens: {
      AddItem: 'add',
      Detail: 'detail/:itemId',
      Gallery: '',
      Login: 'login',
      PrivacyPolicy: 'privacy',
      SearchMemories: 'search',
      Settings: 'settings',
    },
  },
  prefixes: ['http://localhost:8093', 'http://127.0.0.1:8093', 'mygallery://'],
};

type AppNavigatorProps = {
  user: GalleryUser | null;
  themePreference: ThemePreference;
  onSignIn: (user: GalleryUser) => Promise<void>;
  onSignOut: () => Promise<void>;
};

export function AppNavigator({
  user,
  themePreference,
  onSignIn,
  onSignOut,
}: AppNavigatorProps) {
  return (
    <NavigationContainer linking={linking} theme={getNavigationTheme(themePreference)}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Gallery">
              {(props) => (
                <GalleryScreen
                  {...props}
                  themePreference={themePreference}
                  user={user}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="AddItem">
              {(props) => <AddItemScreen {...props} themePreference={themePreference} />}
            </Stack.Screen>
            <Stack.Screen name="Detail">
              {(props) => <DetailScreen {...props} themePreference={themePreference} />}
            </Stack.Screen>
            <Stack.Screen name="SearchMemories">
              {(props) => <SearchMemoriesScreen {...props} />}
            </Stack.Screen>
            <Stack.Screen name="Settings">
              {(props) => (
                <SettingsScreen
                  {...props}
                  onSignOut={onSignOut}
                  user={user}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="PrivacyPolicy">
              {(props) => <PrivacyPolicyScreen {...props} themePreference={themePreference} />}
            </Stack.Screen>
          </>
        ) : (
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onSignIn={onSignIn} themePreference={themePreference} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
