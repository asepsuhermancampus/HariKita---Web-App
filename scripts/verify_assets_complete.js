const fs = require('fs');
const path = require('path');

const ASSET_BASE = path.join(__dirname, '..', 'public', 'assets', 'harikita');

const TARGET_SPEC = [
  // 1. Ornaments (12)
  ...Array.from({ length: 12 }, (_, i) => `ornaments/botanical-${String(i + 1).padStart(2, '0')}.svg`),
  // 2. Lines (12)
  ...Array.from({ length: 12 }, (_, i) => `lines/divider-${String(i + 1).padStart(2, '0')}.svg`),
  // 3. Corners (8)
  ...Array.from({ length: 8 }, (_, i) => `corners/corner-${String(i + 1).padStart(2, '0')}.svg`),
  // 4. Abstract Symbols (10)
  ...Array.from({ length: 10 }, (_, i) => `abstract/symbol-${String(i + 1).padStart(2, '0')}.svg`),
  // 5. Single Stem Flowers (12)
  ...Array.from({ length: 12 }, (_, i) => `flowers/single-stem/flower-single-stem-${String(i + 1).padStart(2, '0')}.svg`),
  // 6. Flower Blooms (6)
  ...Array.from({ length: 6 }, (_, i) => `flowers/blooms/flower-bloom-${String(i + 1).padStart(2, '0')}.svg`),
  // 7. Small Floral Accents (6)
  ...Array.from({ length: 6 }, (_, i) => `flowers/accents/flower-accent-${String(i + 1).padStart(2, '0')}.svg`),
  // 8. Leaves: sprigs (8), branches (4), stems (4)
  ...Array.from({ length: 8 }, (_, i) => `leaves/sprigs/leaf-sprig-${String(i + 1).padStart(2, '0')}.svg`),
  ...Array.from({ length: 4 }, (_, i) => `leaves/branches/branch-${String(i + 1).padStart(2, '0')}.svg`),
  ...Array.from({ length: 4 }, (_, i) => `leaves/stems/stem-${String(i + 1).padStart(2, '0')}.svg`),
  // 9. Compositions (8)
  ...Array.from({ length: 8 }, (_, i) => `compositions/composition-${String(i + 1).padStart(2, '0')}.svg`),
  // 10. Patterns (8) & Textures (4)
  ...Array.from({ length: 8 }, (_, i) => `patterns/pattern-${String(i + 1).padStart(2, '0')}.svg`),
  'textures/texture-paper-light.webp',
  'textures/texture-paper-dark.webp',
  'textures/texture-linen-light.webp',
  'textures/texture-linen-dark.webp',
  // 11. Custom Icons (6)
  'icons/icon-two-people.svg',
  'icons/icon-love-story.svg',
  'icons/icon-wedding-event.svg',
  'icons/icon-invitation.svg',
  'icons/icon-togetherness.svg',
  'icons/icon-journey.svg',
  // 12. UI Decorative (12)
  'decorative/badge-premium.svg',
  'decorative/badge-new.svg',
  'decorative/stamp-harikita.svg',
  'decorative/wax-seal-hk.svg',
  'decorative/frame-arch-01.svg',
  'decorative/frame-arch-02.svg',
  'decorative/mask-arch-01.svg',
  'decorative/quote-mark.svg',
  'decorative/card-corner-01.svg',
  'decorative/card-corner-02.svg',
  'decorative/section-line-01.svg',
  'decorative/section-line-02.svg',
  // 13. Cards (8)
  ...Array.from({ length: 8 }, (_, i) => `cards/card-invitation-${String(i + 1).padStart(2, '0')}.svg`),
  // 14. Avatars (6)
  'avatars/avatar-taupe.svg',
  'avatars/avatar-charcoal.svg',
  'avatars/avatar-champagne.svg',
  'avatars/avatar-beige.svg',
  'avatars/avatar-wreath-light.svg',
  'avatars/avatar-wreath-dark.svg'
];

function verifyAssets() {
  console.log(`=== VERIFYING HARIKITA VISUAL ASSETS (TARGET: ${TARGET_SPEC.length} FILES) ===\n`);

  let missing = 0;
  let invalid = 0;

  for (const relPath of TARGET_SPEC) {
    const fullPath = path.join(ASSET_BASE, relPath);
    if (!fs.existsSync(fullPath)) {
      missing++;
      if (missing <= 10) console.error(`❌ Missing asset: ${relPath}`);
      continue;
    }

    const ext = path.extname(relPath).toLowerCase();
    if (ext === '.svg') {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (!content.includes('<svg') || !content.includes('</svg>')) {
        invalid++;
        console.error(`❌ Malformed SVG content: ${relPath}`);
      }
      if (!content.includes('viewBox')) {
        invalid++;
        console.error(`❌ SVG missing viewBox: ${relPath}`);
      }
    } else if (ext === '.webp') {
      const size = fs.statSync(fullPath).size;
      if (size < 100) {
        invalid++;
        console.error(`❌ WebP file suspiciously small (<100B): ${relPath}`);
      }
    }
  }

  if (missing > 10) console.error(`... and ${missing - 10} more missing assets.`);

  console.log(`\nResults: ${TARGET_SPEC.length - missing - invalid} / ${TARGET_SPEC.length} assets valid.`);
  if (missing === 0 && invalid === 0) {
    console.log('✅ ALL 136 ASSETS VERIFIED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.log(`❌ Failed verification: ${missing} missing, ${invalid} invalid.`);
    process.exit(1);
  }
}

verifyAssets();
