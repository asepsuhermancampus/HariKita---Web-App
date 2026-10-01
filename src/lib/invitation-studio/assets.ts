import manifestData from '../../../public/harikita-assets/harikita_manifest.json';
import newManifestData from '../../data/harikita-assets.json';

// ──────────────────────────────────────────────────────────────────────────────
// TIPE
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Semua kategori yang tersedia di Studio Undangan.
 * Sumber A: /public/harikita-assets/ (floral, frames, decorative, icons, backgrounds)
 * Sumber B: /public/assets/harikita/ (abstract, ornaments, flowers, leaves, lines, dll)
 */
export type StudioAssetCategory =
  // Sumber A (harikita-assets manifest)
  | 'brand' | 'event-icon' | 'frame' | 'floral' | 'decorative'
  | 'frames' | 'icons' | 'backgrounds' | 'image'
  // Sumber B (harikita-assets.json)
  | 'abstract' | 'avatars' | 'cards' | 'compositions' | 'corners'
  | 'flowers' | 'leaves' | 'lines' | 'ornaments' | 'patterns' | 'textures' | 'placeholders';

export interface StudioAsset {
  id: string;
  path: string;
  category: StudioAssetCategory;
  subCategory?: string;
  tags: readonly string[];
  kind: 'svg' | 'png';
  /** Label tampil di UI */
  label?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// SUMBER A — harikita_manifest.json (272 aset)
// ──────────────────────────────────────────────────────────────────────────────

type ManifestEntryA = {
  id: string;
  publicUrl: string;
  category: string;
  subCategory?: string;
  relativePath: string;
};

const SOURCE_A_ASSETS: StudioAsset[] = (manifestData as ManifestEntryA[])
  .filter((e) => e.publicUrl && e.id)
  .map((e) => {
    const ext = e.relativePath?.split('.').pop()?.toLowerCase();
    const tags: string[] = [e.category, e.subCategory ?? ''].filter(Boolean);
    const idParts = e.id.split('-');
    idParts.forEach((p) => { if (p.length > 2 && !tags.includes(p)) tags.push(p); });
    return {
      id: `a-${e.id}`,
      path: e.publicUrl,
      category: e.category as StudioAssetCategory,
      subCategory: e.subCategory,
      tags,
      kind: ext === 'png' ? 'png' : 'svg',
    };
  });

// ──────────────────────────────────────────────────────────────────────────────
// SUMBER B — harikita-assets.json (254 aset dari design-system-showcase)
// ──────────────────────────────────────────────────────────────────────────────

type ManifestEntryB = {
  id: string;
  name: string;
  category: string;        // e.g. "flowers/blooms", "leaves/stems"
  categoryLabel: string;
  filePath: string;        // e.g. "assets/harikita/flowers/blooms/..."
  format: string;
  tags: string[];
};

const SOURCE_B_ASSETS: StudioAsset[] = (newManifestData as ManifestEntryB[])
  .filter((e) => e.filePath && e.id)
  .map((e) => {
    // Normalise category: "flowers/blooms" -> category="flowers", subCategory="blooms"
    const catParts = e.category.split('/');
    const rootCat = catParts[0] as StudioAssetCategory;
    const subCat  = catParts[1] ?? undefined;

    const ext = e.filePath.split('.').pop()?.toLowerCase();
    const tags = [...(e.tags ?? [])];
    if (e.name && !tags.includes(e.name.toLowerCase())) tags.push(e.name.toLowerCase());

    return {
      id: `b-${e.id}`,
      // filePath = "assets/harikita/..." → publicUrl = "/assets/harikita/..."
      path: `/${e.filePath}`,
      category: rootCat,
      subCategory: subCat,
      tags,
      kind: ext === 'png' ? 'png' : 'svg',
      label: e.name,
    };
  });

// ──────────────────────────────────────────────────────────────────────────────
// STATIC — brand & legacy
// ──────────────────────────────────────────────────────────────────────────────

const STATIC_ASSETS: StudioAsset[] = [
  { id: 'brand-symbol', path: '/brand/harikita-symbol.svg', category: 'brand', tags: ['logo', 'brand'], kind: 'svg' },
  { id: 'logo-cameo',   path: '/logo_cameo.png',            category: 'brand', tags: ['logo', 'brand'], kind: 'png' },
];

// ──────────────────────────────────────────────────────────────────────────────
// GABUNGAN — total ~528 aset
// ──────────────────────────────────────────────────────────────────────────────

export const STUDIO_ASSET_MANIFEST: readonly StudioAsset[] = [
  ...SOURCE_A_ASSETS,
  ...SOURCE_B_ASSETS,
  ...STATIC_ASSETS,
];

// ──────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ──────────────────────────────────────────────────────────────────────────────

export function listStudioAssets(): StudioAsset[] {
  return STUDIO_ASSET_MANIFEST.map((a) => ({ ...a, tags: [...a.tags] }));
}

export function findStudioAsset(path: string): StudioAsset | undefined {
  if (!path || /^https?:\/\//i.test(path) || !path.startsWith('/')) return undefined;
  return STUDIO_ASSET_MANIFEST.find((a) => a.path === path);
}

export function filterStudioAssets(filters: {
  category?: string;
  subCategory?: string;
  tag?: string;
  query?: string;
} = {}): StudioAsset[] {
  const query = filters.query?.toLowerCase();
  return listStudioAssets().filter((a) =>
    (!filters.category    || a.category    === filters.category) &&
    (!filters.subCategory || a.subCategory === filters.subCategory) &&
    (!filters.tag         || a.tags.includes(filters.tag)) &&
    (!query || `${a.id} ${a.path} ${a.label ?? ''} ${a.tags.join(' ')}`.toLowerCase().includes(query))
  );
}

/** Semua kategori unik */
export function listAssetCategories(): string[] {
  return [...new Set(STUDIO_ASSET_MANIFEST.map((a) => a.category))].sort();
}

/** Semua subCategory unik dalam kategori tertentu */
export function listAssetSubCategories(category?: string): string[] {
  return [...new Set(
    STUDIO_ASSET_MANIFEST
      .filter((a) => !category || a.category === category)
      .map((a) => a.subCategory)
      .filter(Boolean) as string[]
  )].sort();
}

/** Total jumlah aset */
export function countStudioAssets(): number {
  return STUDIO_ASSET_MANIFEST.length;
}