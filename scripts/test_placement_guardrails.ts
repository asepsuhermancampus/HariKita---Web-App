import {
  getSlotAllowedCategories,
  isAssetCompatibleWithSlot,
  PLACEMENT_STYLES_CATALOG,
} from '../src/app/design-system-showcase/components/invitation-hub/studio/AssetPlacementEngine';
import { HariKitaAsset } from '../src/types/harikita-asset';

function testGuardrails(): boolean {
  // Test that exactly 10 placement styles exist
  if (PLACEMENT_STYLES_CATALOG.length !== 10) {
    throw new Error(`Expected exactly 10 placement styles, got ${PLACEMENT_STYLES_CATALOG.length}`);
  }

  // Test divider slot only accepts 'lines'
  const dividerAllowed = getSlotAllowedCategories('divider');
  if (!dividerAllowed.includes('lines') || dividerAllowed.includes('corners')) {
    throw new Error('Guardrail failure: Divider slot must only accept lines');
  }

  // Test corner slot only accepts 'corners'
  const cornerAllowed = getSlotAllowedCategories('corner');
  if (!cornerAllowed.includes('corners') || cornerAllowed.includes('lines')) {
    throw new Error('Guardrail failure: Corner slot must only accept corners');
  }

  // Mock dummy asset testing
  const dummyLineAsset: HariKitaAsset = {
    id: 'test-line',
    name: 'Test Line',
    category: 'lines',
    categoryLabel: 'Lines',
    filePath: 'assets/harikita/lines/line-01.svg',
    format: 'svg',
    aspectRatio: 'horizontal/wide',
    tags: ['line'],
    suggestedUsage: 'Divider',
  };

  const dummyCornerAsset: HariKitaAsset = {
    id: 'test-corner',
    name: 'Test Corner',
    category: 'corners',
    categoryLabel: 'Corners',
    filePath: 'assets/harikita/corners/corner-01.svg',
    format: 'svg',
    aspectRatio: 'square/proportional',
    tags: ['corner'],
    suggestedUsage: 'Corner',
  };

  if (!isAssetCompatibleWithSlot(dummyLineAsset, 'divider')) {
    throw new Error('Line asset should be compatible with divider slot');
  }
  if (isAssetCompatibleWithSlot(dummyCornerAsset, 'divider')) {
    throw new Error('Corner asset should NOT be compatible with divider slot');
  }

  console.log('✓ Task 5 validation passed: Visual Guardrails slot filtering & 10 placement styles verified');
  return true;
}

testGuardrails();
