import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ThemePreference } from '../storage/galleryStorage';
import { getNavigationTheme } from '../theme/theme';
import { GalleryUser, RootStackParamList } from '../types/gallery';
import { AddItemScreen } from '../screens/AddItemScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { GalleryScreen } from '../screens/GalleryScreen';
import { LoginScreen } from '../screens/LoginScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

type AppNavigatorProps = {
  user: GalleryUser | null;
  themePreference: ThemePreference;
  onSignIn: (user: GalleryUser) => Promise<void>;
  onSignOut: () => Promise<void>;
  onToggleTheme: () => void;
};

export function AppNavigator({
  user,
  themePreference,
  onSignIn,
  onSignOut,
  onToggleTheme,
}: AppNavigatorProps) {
  return (
    <NavigationContainer theme={getNavigationTheme(themePreference)}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Gallery">
              {(props) => (
                <GalleryScreen
                  {...props}
                  onSignOut={onSignOut}
                  onToggleTheme={onToggleTheme}
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
