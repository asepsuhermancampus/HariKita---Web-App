import { normalizeSvgString } from '../src/app/design-system-showcase/components/invitation-hub/studio/DynamicSvgRenderer';

function testNormalize(): boolean {
  const rawSvg = '<svg><path stroke="#2B2B2B" fill="#000" /><circle stroke="#333" fill="none" /></svg>';
  const normalized = normalizeSvgString(rawSvg);
  if (!normalized.includes('stroke="currentColor"')) {
    throw new Error('Failed to replace hardcoded stroke with currentColor');
  }
  if (!normalized.includes('fill="currentColor"')) {
    throw new Error('Failed to replace hardcoded fill with currentColor');
  }
  if (!normalized.includes('fill="none"')) {
    throw new Error('Preserved fill="none" incorrectly replaced');
  }
  console.log('✓ Task 2 validation passed: SVG normalizer correctly transforms attributes');
  return true;
}

testNormalize();
