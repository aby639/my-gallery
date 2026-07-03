import { Directory, File, Paths } from 'expo-file-system';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';

export function getPersistableImageUri(asset: ImagePickerAsset): string {
  if (Platform.OS !== 'web' && asset.uri) {
    return asset.uri;
  }

  if (asset.base64) {
    const mimeType = asset.mimeType ?? 'image/jpeg';
    return `data:${mimeType};base64,${asset.base64}`;
  }

  return asset.uri;
}

export async function persistImageForGallery(uri: string, id: string): Promise<string> {
  const dataUriMatch = uri.match(/^data:(image\/(?:jpe?g|png|webp));base64,(.+)$/);

  if (dataUriMatch) {
    try {
      const galleryDirectory = getGalleryDirectory();
      galleryDirectory.create({ idempotent: true, intermediates: true });

      const destinationFile = new File(galleryDirectory, `${id}${getImageExtensionFromMime(dataUriMatch[1])}`);

      if (destinationFile.exists) {
        destinationFile.delete();
      }

      await LegacyFileSystem.writeAsStringAsync(destinationFile.uri, dataUriMatch[2], {
        encoding: LegacyFileSystem.EncodingType.Base64,
      });

      return destinationFile.uri;
    } catch {
      return uri;
    }
  }

  if (!uri.startsWith('file://')) {
    return uri;
  }

  try {
    const sourceFile = new File(uri);

    if (!sourceFile.exists) {
      return uri;
    }

    const galleryDirectory = getGalleryDirectory();
    galleryDirectory.create({ idempotent: true, intermediates: true });

    const destinationFile = new File(galleryDirectory, `${id}${getImageExtension(uri)}`);

    if (destinationFile.exists) {
      destinationFile.delete();
    }

    sourceFile.copy(destinationFile);
    return destinationFile.uri;
  } catch {
    return uri;
  }
}

export function deletePersistedGalleryImage(uri: string): void {
  if (!uri.startsWith('file://')) {
    return;
  }

  try {
    const galleryDirectory = getGalleryDirectory();

    if (!uri.startsWith(galleryDirectory.uri)) {
      return;
    }

    const imageFile = new File(uri);

    if (imageFile.exists) {
      imageFile.delete();
    }
  } catch {
    // Removing the gallery record should still succeed if file cleanup fails.
  }
}

export function clearPersistedGalleryImages(): void {
  try {
    const galleryDirectory = getGalleryDirectory();

    if (!galleryDirectory.exists) {
      return;
    }

    galleryDirectory.delete();
  } catch {
    // Clearing the gallery can still proceed even if file cleanup fails.
  }
}

function getGalleryDirectory(): Directory {
  return new Directory(Paths.document, 'gallery');
}

function getImageExtension(uri: string): string {
  const extensionMatch = uri.toLowerCase().match(/\.(jpe?g|png|webp)(?:\?|$)/);

  if (!extensionMatch) {
    return '.jpg';
  }

  return `.${extensionMatch[1] === 'jpeg' ? 'jpg' : extensionMatch[1]}`;
}

function getImageExtensionFromMime(mimeType: string): string {
  if (mimeType === 'image/png') {
    return '.png';
  }

  if (mimeType === 'image/webp') {
    return '.webp';
  }

  return '.jpg';
}
