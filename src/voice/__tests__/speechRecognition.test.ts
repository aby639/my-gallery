import {
  loadSpeechRecognitionPackage,
  SpeechRecognitionPackage,
  voiceNativeModuleUnavailableMessage,
} from '../speechRecognition';

const packageStub: SpeechRecognitionPackage = {
  ExpoSpeechRecognitionModule: {
    addListener: () => ({ remove: jest.fn() }),
    isRecognitionAvailable: () => true,
    requestPermissionsAsync: async () => ({ granted: true }),
    start: jest.fn(),
    stop: jest.fn(),
  },
};

describe('loadSpeechRecognitionPackage', () => {
  it('returns null when the native voice module is unavailable', () => {
    const loaded = loadSpeechRecognitionPackage(() => {
      throw new Error('Cannot find native module ExpoSpeechRecognition');
    });

    expect(loaded).toBeNull();
    expect(voiceNativeModuleUnavailableMessage).toContain('development build');
  });

  it('returns the speech recognition package when it can be loaded', () => {
    expect(loadSpeechRecognitionPackage(() => packageStub)).toBe(packageStub);
  });
});
