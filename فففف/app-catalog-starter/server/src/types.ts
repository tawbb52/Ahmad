export interface AppItem {
  id: string;
  name: string;
  bundleId: string;
  version: string;
  description: string;
  iconUrl: string;
  websiteUrl: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export type AppInput = Omit<AppItem, 'id' | 'createdAt' | 'updatedAt'>;
