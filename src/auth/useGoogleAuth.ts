import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useMemo, useState } from 'react';

import { googleClientIds, hasGoogleClientId, missingGoogleClientMessage } from './authConfig';
import { demoUser } from './demoUser';
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
  const [request, , promptAsync] = Google.useAuthRequest({
    ...googleClientIds,
    scopes: ['openid', 'profile', 'email'],
    selectAccount: true,
  });

  const authWarning = useMemo(() => {
    return hasGoogleClientId ? undefined : missingGoogleClientMessage;
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<SignInResult> => {
    if (!hasGoogleClientId) {
      return { user: null, error: missingGoogleClientMessage };
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
  }, [promptAsync, request]);

  const signInDemo = useCallback(async (): Promise<SignInResult> => {
    return { user: demoUser };
  }, []);

  return {
    authWarning,
    canUseGoogle: hasGoogleClientId && !!request,
    isSigningIn,
    signInDemo,
    signInWithGoogle,
  };
}
