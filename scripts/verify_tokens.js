const fs = require('fs');
const path = require('path');

function verifyTokens() {
  console.log('=== VERIFYING HARIKITA COLOR & TYPOGRAPHY TOKENS ===\n');

  const globalsCssPath = path.join(__dirname, '..', 'src', 'app', 'globals.css');
  const tokensCssPath = path.join(__dirname, '..', 'src', 'styles', 'harikita-tokens.css');
  const tailwindPath = path.join(__dirname, '..', 'tailwind.config.ts');
  const layoutPath = path.join(__dirname, '..', 'src', 'app', 'layout.tsx');

  let passed = true;

  // 1. Check harikita-tokens.css exists and has exact colors
  if (!fs.existsSync(tokensCssPath)) {
    console.error('❌ Missing src/styles/harikita-tokens.css');
    passed = false;
  } else {
    const tokensCss = fs.readFileSync(tokensCssPath, 'utf8');
    const requiredTokens = [
      ['--color-charcoal', '#2B2B2B'],
      ['--color-taupe', '#88735B'],
      ['--color-champagne', '#C9A88A'],
      ['--color-soft-beige', '#E8DED1'],
      ['--color-ivory', '#F8F6F1']
    ];
    for (const [prop, val] of requiredTokens) {
      if (!tokensCss.includes(prop) || !tokensCss.includes(val)) {
        console.error(`❌ Token ${prop}: ${val} not found in harikita-tokens.css`);
        passed = false;
      }
    }
  }

  // 2. Check globals.css imports or defines tokens and sets font
  if (fs.existsSync(globalsCssPath)) {
    const globalsCss = fs.readFileSync(globalsCssPath, 'utf8');
    if (!globalsCss.includes('#2B2B2B') || !globalsCss.includes('#88735B') || !globalsCss.includes('#C9A88A') || !globalsCss.includes('#E8DED1') || !globalsCss.includes('#F8F6F1')) {
      console.error('❌ globals.css does not contain the calibrated 5 official hex colors');
      passed = false;
    }
  } else {
    console.error('❌ Missing src/app/globals.css');
    passed = false;
  }

  // 3. Check tailwind.config.ts has hk palette
  if (fs.existsSync(tailwindPath)) {
    const tw = fs.readFileSync(tailwindPath, 'utf8');
    if (!tw.includes('charcoal') || !tw.includes('taupe') || !tw.includes('champagne') || !tw.includes('soft-beige') || !tw.includes('ivory')) {
      console.error('❌ tailwind.config.ts missing hk color palette keys');
      passed = false;
    }
    if (!tw.includes('Cormorant Garamond') || !tw.includes('Manrope')) {
      console.error('❌ tailwind.config.ts missing Cormorant Garamond or Manrope font definitions');
      passed = false;
    }
  }

  // 4. Check layout.tsx has Cormorant Garamond and Manrope links
  if (fs.existsSync(layoutPath)) {
    const layout = fs.readFileSync(layoutPath, 'utf8');
    if (!layout.includes('Cormorant+Garamond') || !layout.includes('Manrope')) {
      console.error('❌ layout.tsx missing Google Fonts for Cormorant Garamond or Manrope');
      passed = false;
    }
  }

  if (passed) {
    console.log('✅ ALL COLOR & TYPOGRAPHY TOKENS VERIFIED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.log('\n❌ Token verification failed.');
    process.exit(1);
  }
}

verifyTokens();
