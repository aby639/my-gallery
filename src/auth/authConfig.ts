const env =
  (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

export const googleClientIds = {
  webClientId: env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  androidClientId: env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
};

export const hasGoogleClientId = Object.values(googleClientIds).some(Boolean);

export const missingGoogleClientMessage =
  'Google OAuth client IDs are not configured yet. Add the EXPO_PUBLIC_GOOGLE_* values from .env.example to enable real Google login.';
