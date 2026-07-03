import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

type VoiceNoteState = {
  durationMillis?: number;
  uri?: string;
};

export function useVoiceNoteRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.LOW_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 250);
  const [message, setMessage] = useState<string>();
  const [voiceNote, setVoiceNoteState] = useState<VoiceNoteState>({});

  const setVoiceNote = useCallback((uri?: string, durationMillis?: number) => {
    setVoiceNoteState({ durationMillis, uri });
  }, []);

  const startRecording = useCallback(async () => {
    setMessage(undefined);

    if (Platform.OS === 'web') {
      setMessage('Voice note recording works in the Android/iOS build. Use dictation or typed captions in web preview.');
      return;
    }

    try {
      const permission = await requestRecordingPermissionsAsync();

      if (!permission.granted) {
        setMessage('Microphone permission was denied. You can still type or dictate the caption.');
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setMessage(undefined);
    } catch (error) {
      const fallback = error instanceof Error ? error.message : 'Voice recording failed.';
      setMessage(`${fallback} You can still save the photo and caption.`);
    }
  }, [recorder]);

  const stopRecording = useCallback(async () => {
    try {
      await recorder.stop();
      const status = recorder.getStatus();
      const uri = recorder.uri ?? status.url ?? undefined;

      if (uri) {
        setVoiceNoteState({
          durationMillis: status.durationMillis || recorderState.durationMillis || undefined,
          uri,
        });
        setMessage(undefined);
      } else {
        setMessage('Recording stopped, but no voice file was returned.');
      }
    } catch (error) {
      const fallback = error instanceof Error ? error.message : 'Voice recording could not be stopped.';
      setMessage(`${fallback} Try recording again.`);
    } finally {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
    }
  }, [recorder, recorderState.durationMillis]);

  const removeVoiceNote = useCallback(() => {
    setVoiceNoteState({});
    setMessage(undefined);
  }, []);

  return {
    durationMillis: voiceNote.durationMillis,
    isRecording: recorderState.isRecording,
    message,
    recordingDurationMillis: recorderState.durationMillis,
    removeVoiceNote,
    setVoiceNote,
    startRecording,
    stopRecording,
    uri: voiceNote.uri,
  };
}

export function formatVoiceDuration(durationMillis?: number): string {
  if (!durationMillis || durationMillis < 1000) {
    return '0:00';
  }

  const totalSeconds = Math.round(durationMillis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
