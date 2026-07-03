import * as ExpoSharing from 'expo-sharing';
import { Platform, Share } from 'react-native';

import { GalleryItem } from '../types/gallery';

type ShareResult = {
  message: string;
  tone: 'info' | 'success' | 'error';
};

type NavigatorWithShare = Navigator & {
  share?: (data: ShareData) => Promise<void>;
  clipboard?: Clipboard;
};

export async function shareGalleryItem(item: GalleryItem): Promise<ShareResult | undefined> {
  const caption = item.caption || 'MemoLens memory';
  const shareTitle = item.mood ? `${item.mood} memory` : 'MemoLens';
  const shareMessage = buildShareMessage(item);

  try {
    if (Platform.OS === 'web') {
      const navigatorWithShare = globalThis.navigator as NavigatorWithShare | undefined;

      if (navigatorWithShare?.share) {
        await navigatorWithShare.share({
          text: shareMessage,
          title: shareTitle,
        });
        return undefined;
      }

      if (navigatorWithShare?.clipboard?.writeText) {
        await navigatorWithShare.clipboard.writeText(shareMessage);
        return { message: 'Sharing is not available in this preview. Caption copied instead.', tone: 'info' };
      }

      return { message: 'Sharing is not available in this preview.', tone: 'info' };
    }

    if (await ExpoSharing.isAvailableAsync()) {
      const targets = getNativeShareTargets(item, caption);

      for (const target of targets) {
        try {
          await ExpoSharing.shareAsync(target.uri, {
            dialogTitle: target.dialogTitle,
            mimeType: target.mimeType,
            UTI: target.UTI,
          });
          return undefined;
        } catch {
          // Try the next attached media file, then fall back to text sharing below.
        }
      }
    }

    await Share.share({
      message: shareMessage,
      title: shareTitle,
    });

    return undefined;
  } catch {
    return {
      message: Platform.OS === 'web' ? 'Sharing is not available in this preview.' : 'Share sheet is unavailable right now. Try again from the saved memory.',
      tone: 'info',
    };
  }
}

function buildShareMessage(item: GalleryItem): string {
  const lines = [item.caption || 'MemoLens memory'];

  if (item.mood) {
    lines.push(`Mood: ${item.mood}`);
  }

  if (item.tags?.length) {
    lines.push(`Tags: ${item.tags.map((tag) => `#${tag.replace(/^#+/, '')}`).join(' ')}`);
  }

  if (item.voiceUri) {
    lines.push('Voice note attached in MemoLens.');
  }

  lines.push('Made with MemoLens');
  return lines.join('\n\n');
}

type NativeShareTarget = {
  dialogTitle: string;
  mimeType: string;
  uri: string;
  UTI?: string;
};

function getNativeShareTargets(item: GalleryItem, caption: string): NativeShareTarget[] {
  const targets: NativeShareTarget[] = [];
  const imageTarget = getImageShareTarget(item.imageUri, caption);
  const voiceTarget = item.voiceUri ? getVoiceShareTarget(item.voiceUri, caption) : undefined;

  if (item.source === 'voice') {
    if (voiceTarget) targets.push(voiceTarget);
    if (imageTarget) targets.push(imageTarget);
    return targets;
  }

  if (imageTarget) targets.push(imageTarget);
  if (voiceTarget) targets.push(voiceTarget);
  return targets;
}

function getImageShareTarget(uri: string, caption: string): NativeShareTarget | undefined {
  if (!uri.startsWith('file://')) {
    return undefined;
  }

  const mimeType = getImageMimeType(uri);

  return {
    dialogTitle: caption,
    mimeType,
    uri,
    UTI: getImageUti(mimeType),
  };
}

function getVoiceShareTarget(uri: string, caption: string): NativeShareTarget | undefined {
  if (!uri.startsWith('file://')) {
    return undefined;
  }

  const mimeType = getAudioMimeType(uri);

  return {
    dialogTitle: caption,
    mimeType,
    uri,
    UTI: getAudioUti(mimeType),
  };
}

function getImageMimeType(uri: string): string {
  const normalizedUri = uri.toLowerCase();

  if (normalizedUri.includes('image/png') || normalizedUri.endsWith('.png')) {
    return 'image/png';
  }

  if (normalizedUri.endsWith('.webp')) {
    return 'image/webp';
  }

  return 'image/jpeg';
}

function getImageUti(mimeType: string): string {
  if (mimeType === 'image/png') {
    return 'public.png';
  }

  return 'public.jpeg';
}

function getAudioMimeType(uri: string): string {
  const normalizedUri = uri.toLowerCase();

  if (normalizedUri.endsWith('.3gp')) {
    return 'audio/3gpp';
  }

  if (normalizedUri.endsWith('.aac')) {
    return 'audio/aac';
  }

  if (normalizedUri.endsWith('.webm')) {
    return 'audio/webm';
  }

  if (normalizedUri.endsWith('.caf')) {
    return 'audio/x-caf';
  }

  return 'audio/mp4';
}

function getAudioUti(mimeType: string): string {
  if (mimeType === 'audio/aac') {
    return 'public.aac-audio';
  }

  if (mimeType === 'audio/x-caf') {
    return 'com.apple.coreaudio-format';
  }

  return 'public.audio';
}
