const fs = require('fs');
const path = require('path');

const MOBILE_DIR = path.join(__dirname, '..', 'src', 'components', 'harikita', 'mobile');

const REQUIRED_COMPONENTS = [
  'MobileHeader.tsx',
  'MobileHero.tsx',
  'MobileServiceCard.tsx',
  'MobileInvitationPreview.tsx',
  'MobileBottomNav.tsx',
  'MobileStickyBookingBar.tsx',
  'index.ts'
];

function verifyMobileComponents() {
  console.log('=== VERIFYING HARIKITA MOBILE UI COMPONENTS ===\n');

  let passed = true;

  for (const comp of REQUIRED_COMPONENTS) {
    const compPath = path.join(MOBILE_DIR, comp);
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
      if (!content.includes('export') || (!content.includes('function') && !content.includes('const'))) {
        console.error(`❌ ${comp} does not export a component`);
        passed = false;
      }
    }
  }

  if (passed) {
    console.log('✅ ALL 6 MOBILE UI COMPONENTS VERIFIED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.log('\n❌ Mobile UI component verification failed.');
    process.exit(1);
  }
}

verifyMobileComponents();
