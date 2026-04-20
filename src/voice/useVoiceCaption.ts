import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useCallback, useState } from 'react';

type UseVoiceCaptionOptions = {
  onResult: (text: string) => void;
};

export function useVoiceCaption({ onResult }: UseVoiceCaptionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [message, setMessage] = useState<string>();

  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
    setMessage('Listening...');
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript?.trim();

    if (transcript) {
      onResult(transcript);
      setMessage(event.isFinal ? 'Caption captured.' : 'Listening...');
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    setIsListening(false);
    setMessage(event.message || 'Voice caption failed. You can still type the caption.');
  });

  const startListening = useCallback(async () => {
    try {
      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        setMessage('Voice captions are not available on this device. Type the caption instead.');
        return;
      }

      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!permission.granted) {
        setMessage('Microphone permission was denied. Type the caption instead.');
        return;
      }

      ExpoSpeechRecognitionModule.start({
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
    ExpoSpeechRecognitionModule.stop();
    setIsListening(false);
  }, []);

  return {
    isListening,
    message,
    startListening,
    stopListening,
  };
}
