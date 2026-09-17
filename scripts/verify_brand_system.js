const fs = require('fs');
const assert = require('assert');

console.log('Running Master Brand Health Check...');

// 1. Check all generated public brand assets
assert(fs.existsSync('public/brand/harikita-symbol.svg'), 'Missing harikita-symbol.svg');
assert(fs.existsSync('public/brand/harikita-logo-horizontal.svg'), 'Missing harikita-logo-horizontal.svg');
assert(fs.existsSync('public/brand/harikita-logo-stacked.svg'), 'Missing harikita-logo-stacked.svg');
assert(fs.existsSync('public/favicon.svg'), 'Missing favicon.svg');
assert(fs.existsSync('public/icons/icon-192x192.png'), 'Missing icon-192x192.png');
assert(fs.existsSync('public/icons/icon-512x512.png'), 'Missing icon-512x512.png');
assert(fs.existsSync('src/app/manifest.ts') || fs.existsSync('public/manifest.json'), 'Missing PWA manifest');

// 2. Check no broken raster image imports in components
const logoComp = fs.readFileSync('src/components/brand/HariKitaLogo.tsx', 'utf8');
assert(!logoComp.includes('next/image'), 'HariKitaLogo must not use raster Next Image');
assert(!logoComp.includes('<img'), 'HariKitaLogo must not use html img');

const logoBadge = fs.readFileSync('src/components/layout/LogoBadge.tsx', 'utf8');
assert(!logoBadge.includes('/logo_badge.png'), 'LogoBadge must not reference /logo_badge.png');

// 3. Check CSS tokens
const css = fs.readFileSync('src/app/globals.css', 'utf8');
assert(css.includes('--hk-canvas: #FAF8F5;'), 'Missing --hk-canvas');
assert(css.includes('--hk-champagne: #C5B39F;'), 'Missing calibrated champagne #C5B39F');
assert(css.includes('--hk-soft-beige: #E5DED5;'), 'Missing calibrated soft-beige #E5DED5');
assert(css.includes('--hk-charcoal: #2B2B2B;'), 'Missing --hk-charcoal #2B2B2B');
assert(css.includes('--hk-taupe: #88735B;'), 'Missing --hk-taupe #88735B');
assert(css.includes('--hk-ivory: #F8F6F1;'), 'Missing --hk-ivory #F8F6F1');

// 4. Check Tailwind config
const tailwind = fs.readFileSync('tailwind.config.ts', 'utf8');
assert(tailwind.includes('champagne: "var(--hk-champagne)"'), 'Tailwind missing hk.champagne');

// 5. Check Layout fonts
const layout = fs.readFileSync('src/app/layout.tsx', 'utf8');
assert(layout.includes('family=Manrope'), 'layout.tsx missing Manrope font');
assert(layout.includes('family=Cormorant+Garamond'), 'layout.tsx missing Cormorant Garamond font');

console.log('🎉 All Master Brand Checks Passed Successfully!');
