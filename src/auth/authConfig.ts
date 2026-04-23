import { Platform } from 'react-native';

export const nativeAppIdentifier = 'com.ablespace.mygallery';

function normalizeClientId(value?: string) {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

export const googleClientIds = {
  webClientId: normalizeClientId(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID),
  iosClientId: normalizeClientId(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID),
  androidClientId: normalizeClientId(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID),
};

type GoogleClientIds = Partial<typeof googleClientIds>;

const googleClientEnvNames = {
  android: 'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID',
  ios: 'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID',
  web: 'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
} as const;

const googlePlatformLabels = {
  android: 'Android',
  ios: 'iOS',
  web: 'Web',
} as const;

type GoogleAuthPlatform = keyof typeof googleClientEnvNames;

function isGoogleAuthPlatform(platform: string): platform is GoogleAuthPlatform {
  return platform === 'android' || platform === 'ios' || platform === 'web';
}

export function getGoogleClientIdForPlatform(platform: string, clientIds: GoogleClientIds = googleClientIds) {
  if (platform === 'android') {
    return normalizeClientId(clientIds.androidClientId);
  }

  if (platform === 'ios') {
    return normalizeClientId(clientIds.iosClientId);
  }

  if (platform === 'web') {
    return normalizeClientId(clientIds.webClientId);
  }

  return undefined;
}

export function getGoogleClientEnvNameForPlatform(platform: string) {
  return isGoogleAuthPlatform(platform) ? googleClientEnvNames[platform] : undefined;
}

export function hasGoogleClientIdForPlatform(platform: string, clientIds: GoogleClientIds = googleClientIds) {
  return Boolean(getGoogleClientIdForPlatform(platform, clientIds));
}

export function hasNativeGoogleClientIdsForPlatform(platform: string, clientIds: GoogleClientIds = googleClientIds) {
  if (platform === 'android') {
    return Boolean(normalizeClientId(clientIds.webClientId) && normalizeClientId(clientIds.androidClientId));
  }

  if (platform === 'ios') {
    return Boolean(normalizeClientId(clientIds.webClientId) && normalizeClientId(clientIds.iosClientId));
  }

  return hasGoogleClientIdForPlatform(platform, clientIds);
}

export function createGoogleAuthRequestClientIds(clientIds: GoogleClientIds) {
  return {
    androidClientId:
      normalizeClientId(clientIds.androidClientId) ?? 'missing-android-client-id.apps.googleusercontent.com',
    iosClientId: normalizeClientId(clientIds.iosClientId) ?? 'missing-ios-client-id.apps.googleusercontent.com',
    webClientId: normalizeClientId(clientIds.webClientId) ?? 'missing-web-client-id.apps.googleusercontent.com',
  };
}

export const googleAuthRequestClientIds = createGoogleAuthRequestClientIds(googleClientIds);

export const hasGoogleClientId = hasGoogleClientIdForPlatform(Platform.OS);

export function getMissingGoogleClientMessage(platform: string) {
  if (!isGoogleAuthPlatform(platform)) {
    return 'Google sign-in is available on Web, Android, and iOS. Use the demo profile on this platform.';
  }

  if (platform === 'android') {
    return [
      'Android Google sign-in needs EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID and EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID in .env.',
      `The Android OAuth client must use package ${nativeAppIdentifier} and this machine's debug SHA-1.`,
      'Restart Expo and rebuild the Android app after changing OAuth IDs.',
    ].join(' ');
  }

  if (platform === 'ios') {
    return [
      'iOS Google sign-in needs EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID and EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID in .env.',
      `The iOS OAuth client must use bundle ID ${nativeAppIdentifier}.`,
      'Rebuild the iOS app after changing OAuth IDs.',
    ].join(' ');
  }

  return `${googlePlatformLabels[platform]} Google sign-in needs ${googleClientEnvNames[platform]} in .env. Configure it in Google Cloud OAuth, then restart Expo.`;
}

export const missingGoogleClientMessage = getMissingGoogleClientMessage(Platform.OS);
