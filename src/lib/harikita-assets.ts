import assetCatalogData from '../data/harikita-assets.json';
import { HariKitaAsset, HariKitaAssetCategory } from '../types/harikita-asset';

const assets = assetCatalogData as HariKitaAsset[];

export interface HariKitaAssetSummary {
  total: number;
  vectorCount: number;
  textureCount: number;
  categoryCounts: Record<string, number>;
}

export function getHariKitaAssets(): HariKitaAsset[] {
  return assets;
}

export function getHariKitaAssetSummary(): HariKitaAssetSummary {
  const vectorCount = assets.filter(a => a.format === 'svg' || a.filePath.endsWith('.svg')).length;
  const textureCount = assets.filter(a => a.format === 'webp' || a.filePath.endsWith('.webp')).length;
  const categoryCounts: Record<string, number> = {};
  for (const asset of assets) {
    categoryCounts[asset.category] = (categoryCounts[asset.category] || 0) + 1;
  }
  return {
    total: assets.length,
    vectorCount,
    textureCount,
    categoryCounts,
  };
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

