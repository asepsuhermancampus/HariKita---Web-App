import assetCatalogData from '../data/harikita-assets.json';
import { HariKitaAsset, HariKitaAssetCategory } from '../types/harikita-asset';

const assets = assetCatalogData as HariKitaAsset[];

export function getHariKitaAssets(): HariKitaAsset[] {
  return assets;
}

export function getAssetsByCategory(category: HariKitaAssetCategory): HariKitaAsset[] {
  return assets.filter(a => a.category === category);
}

export function getAssetById(id: string): HariKitaAsset | undefined {
  return assets.find(a => a.id === id);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(assets.map(a => a.category)));
}
