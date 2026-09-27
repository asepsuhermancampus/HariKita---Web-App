import manifestData from '../../../public/harikita-assets/harikita_manifest.json';

export type StudioAssetCategory = 'brand' | 'event-icon' | 'frame' | 'floral' | 'decorative' | 'frames' | 'icons' | 'backgrounds' | 'image';

export interface StudioAsset {
  id: string;
  path: string;
  category: StudioAssetCategory;
  subCategory?: string;
  tags: readonly string[];
  kind: 'svg' | 'png';
}

type ManifestEntry = {
  id: string;
  publicUrl: string;
  category: string;
  subCategory?: string;
  relativePath: string;
};

// Build manifest from public/harikita-assets/harikita_manifest.json
const MANIFEST_ASSETS: StudioAsset[] = (manifestData as ManifestEntry[])
  .filter((e) => e.publicUrl && e.id)
  .map((e) => {
    const ext = e.relativePath?.split('.').pop()?.toLowerCase();
    const tags: string[] = [e.category, e.subCategory ?? ''].filter(Boolean);
    // Add descriptive tags from id
    const idParts = e.id.split('-');
    idParts.forEach((p) => { if (p.length > 2 && !tags.includes(p)) tags.push(p); });
    return {
      id: e.id,
      path: e.publicUrl,
      category: e.category as StudioAssetCategory,
      subCategory: e.subCategory,
      tags,
      kind: ext === 'png' ? 'png' : 'svg',
    };
  });

// Static brand / legacy assets
const STATIC_ASSETS: StudioAsset[] = [
  { id: 'brand-symbol', path: '/brand/harikita-symbol.svg', category: 'brand', tags: ['logo', 'brand'], kind: 'svg' },
  { id: 'logo-cameo', path: '/logo_cameo.png', category: 'brand', tags: ['logo', 'brand'], kind: 'png' },
];

export const STUDIO_ASSET_MANIFEST: readonly StudioAsset[] = [...MANIFEST_ASSETS, ...STATIC_ASSETS];

export function listStudioAssets(): StudioAsset[] {
  return STUDIO_ASSET_MANIFEST.map((asset) => ({ ...asset, tags: [...asset.tags] }));
}

export function findStudioAsset(path: string): StudioAsset | undefined {
  if (!path || /^https?:\/\//i.test(path) || !path.startsWith('/')) return undefined;
  return STUDIO_ASSET_MANIFEST.find((asset) => asset.path === path);
}

export function filterStudioAssets(filters: {
  category?: string;
  subCategory?: string;
  tag?: string;
  query?: string;
} = {}): StudioAsset[] {
  const query = filters.query?.toLowerCase();
  return listStudioAssets().filter((asset) =>
    (!filters.category || asset.category === filters.category) &&
    (!filters.subCategory || asset.subCategory === filters.subCategory) &&
    (!filters.tag || asset.tags.includes(filters.tag)) &&
    (!query || `${asset.id} ${asset.path} ${asset.tags.join(' ')}`.toLowerCase().includes(query))
  );
}

/** List all unique categories */
export function listAssetCategories(): string[] {
  return [...new Set(STUDIO_ASSET_MANIFEST.map((a) => a.category))];
}

/** List unique subCategories within a category */
export function listAssetSubCategories(category?: string): string[] {
  return [...new Set(
    STUDIO_ASSET_MANIFEST
      .filter((a) => !category || a.category === category)
      .map((a) => a.subCategory)
      .filter(Boolean) as string[]
  )];
}
