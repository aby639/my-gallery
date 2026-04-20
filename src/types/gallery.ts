export type GallerySource = 'camera' | 'library';

export type GalleryItem = {
  id: string;
  imageUri: string;
  caption: string;
  createdAt: string;
  source: GallerySource;
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
  AddItem: {
    imageUri: string;
    source: GallerySource;
  };
  Detail: {
    itemId: string;
  };
};
