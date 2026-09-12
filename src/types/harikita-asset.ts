export type HariKitaAssetCategory =
  | 'ornaments'
  | 'lines'
  | 'corners'
  | 'abstract'
  | 'flowers/single-stem'
  | 'flowers/blooms'
  | 'flowers/accents'
  | 'leaves/sprigs'
  | 'leaves/branches'
  | 'leaves/stems'
  | 'compositions'
  | 'patterns'
  | 'textures'
  | 'icons'
  | 'decorative'
  | 'cards'
  | 'avatars';

export interface HariKitaAsset {
  id: string;
  name: string;
  category: HariKitaAssetCategory;
  categoryLabel: string;
  filePath: string;
  format: 'svg' | 'webp';
  viewBox?: string;
  aspectRatio: string;
  tags: string[];
  suggestedUsage: string;
}
