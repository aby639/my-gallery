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
  const message = `${item.caption || 'My Gallery image'}\n${item.imageUri}`;

  try {
    if (Platform.OS === 'web') {
      const navigatorWithShare = globalThis.navigator as NavigatorWithShare | undefined;

      if (navigatorWithShare?.share) {
        await navigatorWithShare.share({
          text: item.caption || 'My Gallery image',
          title: 'My Gallery',
          url: item.imageUri,
        });
        return { message: 'Shared from the browser.', tone: 'success' };
      }

      if (navigatorWithShare?.clipboard?.writeText) {
        await navigatorWithShare.clipboard.writeText(message);
        return { message: 'Sharing is not available here, so the caption and image link were copied.', tone: 'info' };
      }

      return { message: 'Sharing is not supported in this browser.', tone: 'error' };
    }

    await Share.share({
      message,
      title: 'My Gallery',
      url: item.imageUri,
    });

    return { message: 'Share sheet opened.', tone: 'success' };
  } catch {
    if (await ExpoSharing.isAvailableAsync()) {
      await ExpoSharing.shareAsync(item.imageUri, {
        dialogTitle: item.caption || 'My Gallery',
      });
      return { message: 'Image share sheet opened.', tone: 'success' };
    }

    return { message: 'Sharing is not available on this device.', tone: 'error' };
  }
}
