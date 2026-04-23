import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import {
  getMissingGoogleClientMessage,
  googleAuthRequestClientIds,
  hasGoogleClientIdForPlatform,
  hasNativeGoogleClientIdsForPlatform,
} from './authConfig';
import { demoUser } from './demoUser';
import { signInWithNativeGoogle } from './nativeGoogleSignIn';
import { GalleryUser } from '../types/gallery';

WebBrowser.maybeCompleteAuthSession();

type GoogleProfile = {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
};

type SignInResult = {
  user: GalleryUser | null;
  error?: string;
};

export function useGoogleAuth() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const usesNativeGoogleSignIn = Platform.OS !== 'web';
  const hasPlatformGoogleClientId = usesNativeGoogleSignIn
    ? hasNativeGoogleClientIdsForPlatform(Platform.OS)
    : hasGoogleClientIdForPlatform(Platform.OS);
  const [request, , promptAsync] = Google.useAuthRequest({
    ...googleAuthRequestClientIds,
    scopes: ['openid', 'profile', 'email'],
    selectAccount: true,
  });

  const authWarning = useMemo(() => {
    return hasPlatformGoogleClientId ? undefined : getMissingGoogleClientMessage(Platform.OS);
  }, [hasPlatformGoogleClientId]);

  const signInWithGoogle = useCallback(async (): Promise<SignInResult> => {
    if (!hasPlatformGoogleClientId) {
      return { user: null, error: getMissingGoogleClientMessage(Platform.OS) };
    }

    if (usesNativeGoogleSignIn) {
      setIsSigningIn(true);
      try {
        return await signInWithNativeGoogle();
      } finally {
        setIsSigningIn(false);
      }
    }

    if (!request) {
      return { user: null, error: 'Google sign-in is still preparing. Try again in a moment.' };
    }

    setIsSigningIn(true);
    try {
      const result = await promptAsync();

      if (result.type !== 'success') {
        return { user: null, error: 'Google sign-in was cancelled.' };
      }

      const accessToken = result.authentication?.accessToken;

      if (!accessToken) {
        return { user: null, error: 'Google did not return an access token. Check the OAuth client setup.' };
      }

      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        return { user: null, error: 'Google profile could not be loaded.' };
      }

      const profile = (await response.json()) as GoogleProfile;

      return {
        user: {
          id: profile.sub,
          name: profile.name ?? 'Gallery User',
          email: profile.email,
          photoUrl: profile.picture,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed.';
      return { user: null, error: message };
    } finally {
      setIsSigningIn(false);
    }
  }, [hasPlatformGoogleClientId, promptAsync, request, usesNativeGoogleSignIn]);

  const signInDemo = useCallback(async (): Promise<SignInResult> => {
    return { user: demoUser };
  }, []);

  return {
    authWarning,
    canUseGoogle: hasPlatformGoogleClientId && (usesNativeGoogleSignIn || !!request),
    isSigningIn,
    signInDemo,
    signInWithGoogle,
  };
}
