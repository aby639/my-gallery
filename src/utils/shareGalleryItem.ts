import { getContentUriAsync } from 'expo-file-system/legacy';
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

export async function shareGalleryItem(item: GalleryItem): Promise<ShareResult> {
  const caption = item.caption || 'My Gallery image';

  try {
    if (Platform.OS === 'web') {
      const navigatorWithShare = globalThis.navigator as NavigatorWithShare | undefined;

      if (navigatorWithShare?.share) {
        await navigatorWithShare.share({
          text: caption,
          title: 'My Gallery',
          url: item.imageUri,
        });
        return { message: 'Shared from the browser.', tone: 'success' };
      }

      if (navigatorWithShare?.clipboard?.writeText) {
        await navigatorWithShare.clipboard.writeText(`${caption}\n${item.imageUri}`);
        return { message: 'Sharing is not available here, so the caption and image link were copied.', tone: 'info' };
      }

      return { message: 'Sharing is not supported in this browser.', tone: 'error' };
    }

    if (await ExpoSharing.isAvailableAsync()) {
      await ExpoSharing.shareAsync(await getNativeShareUri(item.imageUri), {
        dialogTitle: caption,
        mimeType: getImageMimeType(item.imageUri),
        UTI: getImageUti(item.imageUri),
      });
      return { message: 'Image share sheet opened with the saved file.', tone: 'success' };
    }

    await Share.share({
      message: caption,
      title: 'My Gallery',
    });

    return { message: 'Caption share sheet opened. Image sharing is not available on this device.', tone: 'info' };
  } catch {
    return { message: 'Sharing is not available on this device.', tone: 'error' };
  }
}

async function getNativeShareUri(uri: string): Promise<string> {
  if (Platform.OS !== 'android' || !uri.startsWith('file://')) {
    return uri;
  }

  try {
    return await getContentUriAsync(uri);
  } catch {
    return uri;
  }
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

function getImageUti(uri: string): string {
  const mimeType = getImageMimeType(uri);

  if (mimeType === 'image/png') {
    return 'public.png';
  }

  return 'public.jpeg';
}
