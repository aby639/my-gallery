import { useCallback, useEffect, useRef, useState } from 'react';

import {
  loadSpeechRecognitionPackage,
  SpeechRecognitionPackage,
  voiceNativeModuleUnavailableMessage,
} from './speechRecognition';

type UseVoiceCaptionOptions = {
  onResult: (text: string) => void;
};

export function useVoiceCaption({ onResult }: UseVoiceCaptionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState<string>();
  const speechRecognitionRef = useRef<SpeechRecognitionPackage | null>(null);

  useEffect(() => {
    const speechRecognition = loadSpeechRecognitionPackage();
    speechRecognitionRef.current = speechRecognition;

    if (!speechRecognition) {
      return undefined;
    }

    const startListener = speechRecognition.ExpoSpeechRecognitionModule.addListener('start', () => {
      setIsListening(true);
      setMessage('Listening...');
    });
    const endListener = speechRecognition.ExpoSpeechRecognitionModule.addListener('end', () => {
      setIsListening(false);
    });
    const resultListener = speechRecognition.ExpoSpeechRecognitionModule.addListener('result', (event) => {
      if (!('results' in event)) {
        return;
      }

      const transcript = event.results[0]?.transcript?.trim();

      if (transcript) {
        onResult(transcript);
        setMessage(event.isFinal ? 'Caption captured.' : 'Listening...');
      }
    });
    const errorListener = speechRecognition.ExpoSpeechRecognitionModule.addListener('error', (event) => {
      setIsListening(false);
      setMessage(('message' in event && event.message) || 'Voice caption failed. You can still type the caption.');
    });

    return () => {
      startListener.remove();
      endListener.remove();
      resultListener.remove();
      errorListener.remove();
    };
  }, [onResult]);

  const startListening = useCallback(async () => {
    const speechRecognition = speechRecognitionRef.current;

    if (!speechRecognition) {
      setMessage(voiceNativeModuleUnavailableMessage);
      return;
    }

    try {
      if (!speechRecognition.ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        setMessage('Voice captions are not available on this device. Type the caption instead.');
        return;
      }

      const permission = await speechRecognition.ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!permission.granted) {
        setMessage('Microphone permission was denied. Type the caption instead.');
        return;
      }

      speechRecognition.ExpoSpeechRecognitionModule.start({
        addsPunctuation: true,
        continuous: false,
        interimResults: true,
        lang: 'en-US',
        maxAlternatives: 1,
      });
    } catch (error) {
      const fallback = error instanceof Error ? error.message : 'Voice captions failed.';
      setMessage(`${fallback} You can still type the caption.`);
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    speechRecognitionRef.current?.ExpoSpeechRecognitionModule.stop();
    setIsListening(false);
  }, []);

  return {
    isListening,
    message,
    startListening,
    stopListening,
  };
}
