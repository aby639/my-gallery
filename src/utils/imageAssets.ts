import { ImagePickerAsset } from 'expo-image-picker';

export function getPersistableImageUri(asset: ImagePickerAsset): string {
  if (asset.base64) {
    const mimeType = asset.mimeType ?? 'image/jpeg';
    return `data:${mimeType};base64,${asset.base64}`;
  }

  return asset.uri;
}
