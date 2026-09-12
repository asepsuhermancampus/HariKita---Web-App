const fs = require('fs');
const path = require('path');

const UI_DIR = path.join(__dirname, '..', 'src', 'components', 'harikita', 'ui');

const REQUIRED_COMPONENTS = [
  'ButtonPrimary.tsx',
  'ButtonSecondary.tsx',
  'ButtonGhost.tsx',
  'ButtonDark.tsx',
  'IconButtonCircle.tsx',
  'ToggleSwitch.tsx',
  'PaginationControls.tsx',
  'BadgePremium.tsx',
  'BadgeNew.tsx',
  'WaxSealBadge.tsx',
  'VintageStampBadge.tsx',
  'ArchFrameCard.tsx',
  'DecorativeDivider.tsx',
  'SerifQuoteCard.tsx',
  'FloralCornerCard.tsx',
  'index.ts'
];

function verifyUiComponents() {
  console.log('=== VERIFYING HARIKITA UI COMPONENT LIBRARY (15 VARIANTS) ===\n');

  let passed = true;

  for (const comp of REQUIRED_COMPONENTS) {
    const compPath = path.join(UI_DIR, comp);
    if (!fs.existsSync(compPath)) {
      console.error(`❌ Missing component: ${comp}`);
      passed = false;
      continue;
    }

    const content = fs.readFileSync(compPath, 'utf8');
    if (comp === 'index.ts') {
      for (const req of REQUIRED_COMPONENTS.filter(c => c !== 'index.ts')) {
        const name = req.replace('.tsx', '');
        if (!content.includes(name)) {
          console.error(`❌ index.ts does not export ${name}`);
          passed = false;
        }
      }
    } else {
      if (!content.includes('export') || !content.includes('function') && !content.includes('const')) {
        console.error(`❌ ${comp} does not export a component`);
        passed = false;
      }
    }
  }

  if (passed) {
    console.log('✅ ALL 15 UI COMPONENT VARIANTS VERIFIED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.log('\n❌ UI component verification failed.');
    process.exit(1);
  }
}

verifyUiComponents();
