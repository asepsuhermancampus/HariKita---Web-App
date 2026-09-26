export type StudioAssetCategory = 'brand' | 'event-icon' | 'frame' | 'floral' | 'image';
export interface StudioAsset { id: string; path: string; category: StudioAssetCategory; tags: readonly string[]; kind: 'svg' | 'png'; }

export const STUDIO_ASSET_MANIFEST: readonly StudioAsset[] = [
  { id: 'brand-symbol', path: '/brand/harikita-symbol.svg', category: 'brand', tags: ['logo', 'brand'], kind: 'svg' },
  { id: 'map-icon', path: '/harikita-assets/icons/events/icon-map-01.svg', category: 'event-icon', tags: ['map', 'event'], kind: 'svg' },
  { id: 'floral-corner', path: '/harikita-assets/frames/filigree-corners/filigree-corner-line-01.svg', category: 'floral', tags: ['floral', 'corner'], kind: 'svg' },
  { id: 'logo-cameo', path: '/logo_cameo.png', category: 'brand', tags: ['logo', 'brand'], kind: 'png' },
];

export function listStudioAssets(): StudioAsset[] { return STUDIO_ASSET_MANIFEST.map((asset) => ({ ...asset, tags: [...asset.tags] })); }
export function findStudioAsset(path: string): StudioAsset | undefined {
  if (!path || /^https?:\/\//i.test(path) || !path.startsWith('/')) return undefined;
  return STUDIO_ASSET_MANIFEST.find((asset) => asset.path === path);
}
export function filterStudioAssets(filters: { category?: StudioAssetCategory; tag?: string; query?: string } = {}): StudioAsset[] {
  const query = filters.query?.toLowerCase();
  return listStudioAssets().filter((asset) => (!filters.category || asset.category === filters.category) && (!filters.tag || asset.tags.includes(filters.tag)) && (!query || `${asset.id} ${asset.path} ${asset.tags.join(' ')}`.toLowerCase().includes(query)));
}
