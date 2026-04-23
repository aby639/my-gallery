import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

import { googleClientIds } from './authConfig';
import { GalleryUser } from '../types/gallery';

let isConfigured = false;

type NativeGoogleSignInResult = {
  user: GalleryUser | null;
  error?: string;
};

function configureNativeGoogleSignIn() {
  if (isConfigured) {
    return;
  }

  GoogleSignin.configure({
    iosClientId: googleClientIds.iosClientId,
    scopes: ['profile', 'email'],
    webClientId: googleClientIds.webClientId,
  });

  isConfigured = true;
}

function getNativeGoogleErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : undefined;

  if (code === statusCodes.SIGN_IN_CANCELLED) {
    return 'Google sign-in was cancelled.';
  }

  if (code === statusCodes.IN_PROGRESS) {
    return 'Google sign-in is already in progress.';
  }

  if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    return 'Google Play Services is not available or needs an update on this device.';
  }

  return error instanceof Error ? error.message : 'Google sign-in failed.';
}

export async function signInWithNativeGoogle(): Promise<NativeGoogleSignInResult> {
  configureNativeGoogleSignIn();

  try {
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }

    const response = await GoogleSignin.signIn();

    if (response.type !== 'success') {
      return { user: null, error: 'Google sign-in was cancelled.' };
    }

    const profile = response.data.user;

    return {
      user: {
        email: profile.email,
        id: profile.id,
        name: profile.name ?? profile.email,
        photoUrl: profile.photo ?? undefined,
      },
    };
  } catch (error) {
    return { user: null, error: getNativeGoogleErrorMessage(error) };
  }
}
