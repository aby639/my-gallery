import type {
  ExpoSpeechRecognitionErrorEvent,
  ExpoSpeechRecognitionOptions,
  ExpoSpeechRecognitionResultEvent,
} from 'expo-speech-recognition';

declare const require: (moduleName: string) => SpeechRecognitionPackage;

type PermissionResult = {
  granted: boolean;
};

type ListenerSubscription = {
  remove: () => void;
};

export type SpeechRecognitionPackage = {
  ExpoSpeechRecognitionModule: {
    addListener: (
      eventName: 'start' | 'end' | 'result' | 'error',
      listener: (event: ExpoSpeechRecognitionResultEvent | ExpoSpeechRecognitionErrorEvent) => void,
    ) => ListenerSubscription;
    isRecognitionAvailable: () => boolean;
    requestPermissionsAsync: () => Promise<PermissionResult>;
    start: (options: ExpoSpeechRecognitionOptions) => void;
    stop: () => void;
  };
};

export const voiceNativeModuleUnavailableMessage =
  'Voice captions need a development build on mobile. You can still type the caption.';

export function loadSpeechRecognitionPackage(
  loader: () => SpeechRecognitionPackage = () => require('expo-speech-recognition'),
): SpeechRecognitionPackage | null {
  try {
    return loader();
  } catch {
    return null;
  }
}
