import { getHariKitaAssets } from '@/lib/harikita-assets';

/**
 * Resolves an asset ID, file path, or relative name into a valid public URL
 * for use in DynamicTintIcon or image tags.
 */
export function resolveAssetUrl(assetOrPath?: string): string {
  if (!assetOrPath) return '/assets/harikita/leaves/branches/branch-01.svg';

  let clean = assetOrPath.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
  if (clean.startsWith('/')) clean = clean.slice(1);

  if (clean.startsWith('assets/harikita/')) {
    return `/${clean}`;
  }
  if (clean.startsWith('assets/')) {
    return `/${clean}`;
  }

  // If it's a relative path like 'leaves/branches/branch-01.svg' or 'ornaments/ornament-01.svg'
  if (clean.includes('/') && (clean.endsWith('.svg') || clean.endsWith('.webp') || clean.endsWith('.png'))) {
    return `/assets/harikita/${clean}`;
  }

  // Known quick alias matches
  if (clean.includes('branch-01') || clean.includes('branch')) {
    return '/assets/harikita/leaves/branches/branch-01.svg';
  }
  if (clean.includes('vine')) {
    return '/assets/harikita/ornaments/ornament-vine-01.svg';
  }
  if (clean.includes('botanical')) {
    return '/assets/harikita/ornaments/botanical-01.svg';
  }
  if (clean.includes('corner')) {
    return '/assets/harikita/corners/corner-01.svg';
  }
  if (clean.includes('divider') || clean.includes('line')) {
    return '/assets/harikita/lines/line-01.svg';
  }

  // Try finding in harikita-assets catalog
  try {
    const all = getHariKitaAssets();
    const match = all.find((a) => a.id === clean || clean.includes(a.id) || a.id.includes(clean));
    if (match?.filePath) {
      return `/${match.filePath.replace(/^\//, '')}`;
    }
  } catch {
    // fallback
  }

  return '/assets/harikita/leaves/branches/branch-01.svg';
}
