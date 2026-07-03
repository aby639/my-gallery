import { Directory, File, Paths } from 'expo-file-system';

export async function persistVoiceForGallery(uri: string | undefined, id: string): Promise<string | undefined> {
  if (!uri?.startsWith('file://')) {
    return uri;
  }

  try {
    const sourceFile = new File(uri);

    if (!sourceFile.exists) {
      return uri;
    }

    const voiceDirectory = getVoiceDirectory();
    voiceDirectory.create({ idempotent: true, intermediates: true });

    const destinationFile = new File(voiceDirectory, `${id}${getAudioExtension(uri)}`);

    if (destinationFile.exists) {
      destinationFile.delete();
    }

    sourceFile.copy(destinationFile);
    return destinationFile.uri;
  } catch {
    return uri;
  }
}

export function deletePersistedVoice(uri: string | undefined): void {
  if (!uri?.startsWith('file://')) {
    return;
  }

  try {
    const voiceDirectory = getVoiceDirectory();

    if (!uri.startsWith(voiceDirectory.uri)) {
      return;
    }

    const audioFile = new File(uri);

    if (audioFile.exists) {
      audioFile.delete();
    }
  } catch {
    // Removing the gallery record should still succeed if file cleanup fails.
  }
}

export function clearPersistedVoices(): void {
  try {
    const voiceDirectory = getVoiceDirectory();

    if (voiceDirectory.exists) {
      voiceDirectory.delete();
    }
  } catch {
    // Clearing the gallery can still proceed even if file cleanup fails.
  }
}

function getVoiceDirectory(): Directory {
  return new Directory(Paths.document, 'voice-notes');
}

function getAudioExtension(uri: string): string {
  const extensionMatch = uri.toLowerCase().match(/\.(m4a|mp4|aac|3gp|webm|caf)(?:\?|$)/);
  return extensionMatch ? `.${extensionMatch[1]}` : '.m4a';
}
