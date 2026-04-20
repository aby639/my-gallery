import { createGoogleAuthRequestClientIds } from '../authConfig';

describe('createGoogleAuthRequestClientIds', () => {
  it('uses safe placeholders when OAuth client IDs are missing', () => {
    expect(createGoogleAuthRequestClientIds({})).toEqual({
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
