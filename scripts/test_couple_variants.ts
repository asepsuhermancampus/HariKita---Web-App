import { CoupleCardVariantId } from '../src/types/invitation-studio';
import fs from 'fs';

const expectedVariants: CoupleCardVariantId[] = [
  'floating-glass',
  'editorial-serif',
  'fullscreen-prewed',
  'twin-arches',
  'mihrab-arabesque',
  'javanese-gunungan',
  'royal-medallion',
  'polaroid-scrapbook',
];

function testVariantsList(): boolean {
  if (expectedVariants.length !== 8) {
    throw new Error('Expected exactly 8 couple card variants');
  }

  // Check that all 8 variant files exist
  const variantFiles = [
    'FloatingGlassVariant.tsx',
    'EditorialSerifVariant.tsx',
    'FullscreenPrewedVariant.tsx',
    'TwinArchesFloralVariant.tsx',
    'MihrabArabesqueVariant.tsx',
    'JavaneseGununganVariant.tsx',
    'RoyalMedallionVariant.tsx',
    'PolaroidScrapbookVariant.tsx',
  ];

  for (const file of variantFiles) {
    const path = `src/app/design-system-showcase/components/invitation-hub/studio/sections/couple-variants/${file}`;
    if (!fs.existsSync(path)) {
      throw new Error(`Missing variant file: ${path}`);
    }
  }

  console.log('✓ Task 3 validation passed: All 8 couple card variant components exist');
  return true;
}

testVariantsList();
