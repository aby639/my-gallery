import {
  createGoogleAuthRequestClientIds,
  getGoogleClientEnvNameForPlatform,
  getGoogleClientIdForPlatform,
  getMissingGoogleClientMessage,
  hasNativeGoogleClientIdsForPlatform,
  hasGoogleClientIdForPlatform,
  nativeAppIdentifier,
} from '../authConfig';

describe('createGoogleAuthRequestClientIds', () => {
  it('uses safe placeholders when OAuth client IDs are missing', () => {
    expect(createGoogleAuthRequestClientIds({})).toEqual({
      androidClientId: 'missing-android-client-id.apps.googleusercontent.com',
      iosClientId: 'missing-ios-client-id.apps.googleusercontent.com',
      webClientId: 'missing-web-client-id.apps.googleusercontent.com',
    });
  });

  it('treats blank OAuth client IDs as missing', () => {
    expect(createGoogleAuthRequestClientIds({ webClientId: '   ' })).toEqual({
      androidClientId: 'missing-android-client-id.apps.googleusercontent.com',
      iosClientId: 'missing-ios-client-id.apps.googleusercontent.com',
      webClientId: 'missing-web-client-id.apps.googleusercontent.com',
    });
  });

  it('preserves configured OAuth client IDs', () => {
    expect(
      createGoogleAuthRequestClientIds({
        androidClientId: 'android-id',
        iosClientId: 'ios-id',
        webClientId: 'web-id',
      }),
    ).toEqual({
      androidClientId: 'android-id',
      iosClientId: 'ios-id',
      webClientId: 'web-id',
    });
  });
});

describe('platform Google OAuth config', () => {
  const clientIds = {
    androidClientId: 'android-id',
    iosClientId: 'ios-id',
    webClientId: 'web-id',
  };

  it('uses the client ID that matches the current platform', () => {
    expect(getGoogleClientIdForPlatform('web', clientIds)).toBe('web-id');
    expect(getGoogleClientIdForPlatform('android', clientIds)).toBe('android-id');
    expect(getGoogleClientIdForPlatform('ios', clientIds)).toBe('ios-id');
  });

  it('does not treat another platform client ID as configured', () => {
    expect(hasGoogleClientIdForPlatform('web', { androidClientId: 'android-id' })).toBe(false);
    expect(hasGoogleClientIdForPlatform('android', { webClientId: 'web-id' })).toBe(false);
    expect(hasGoogleClientIdForPlatform('ios', { webClientId: 'web-id' })).toBe(false);
    expect(hasGoogleClientIdForPlatform('web', { webClientId: '   ' })).toBe(false);
  });

  it('requires native Google sign-in to have web plus platform client IDs', () => {
    expect(hasNativeGoogleClientIdsForPlatform('android', clientIds)).toBe(true);
    expect(hasNativeGoogleClientIdsForPlatform('ios', clientIds)).toBe(true);
    expect(hasNativeGoogleClientIdsForPlatform('android', { androidClientId: 'android-id' })).toBe(false);
    expect(hasNativeGoogleClientIdsForPlatform('ios', { iosClientId: 'ios-id' })).toBe(false);
  });

  it('returns exact setup guidance for missing platform IDs', () => {
    expect(getGoogleClientEnvNameForPlatform('web')).toBe('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
    expect(getMissingGoogleClientMessage('android')).toContain('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID');
    expect(getMissingGoogleClientMessage('android')).toContain(nativeAppIdentifier);
  });
});
