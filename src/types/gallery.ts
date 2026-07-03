export type GallerySource = 'camera' | 'library' | 'voice';
export type GalleryFilter = 'all' | 'favorites' | 'camera' | 'library';

export type GalleryItem = {
  id: string;
  imageUri: string;
  caption: string;
  createdAt: string;
  source: GallerySource;
  mood?: string;
  tags?: string[];
  isFavorite?: boolean;
  voiceDurationMillis?: number;
  voiceUri?: string;
};

export type GalleryUser = {
  id: string;
  name: string;
  email?: string;
  photoUrl?: string;
};

export type RootStackParamList = {
  Login: undefined;
  Gallery: undefined;
  AddItem:
    | {
        imageUri?: string;
        itemId?: string;
        source?: GallerySource;
      }
    | undefined;
  Detail: {
    itemId: string;
  };
  SearchMemories: undefined;
  Settings: undefined;
  PrivacyPolicy: undefined;
};
