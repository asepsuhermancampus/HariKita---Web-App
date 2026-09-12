const fs = require('fs');
const assert = require('assert');

const globals = fs.readFileSync('src/app/globals.css', 'utf8');
assert(globals.includes('--hk-canvas: #FAF8F5;'), 'globals.css must define --hk-canvas');
assert(globals.includes('--hk-ivory: #F8F6F1;'), 'globals.css must define --hk-ivory');
assert(globals.includes('--hk-soft-beige: #E5DED5;'), 'globals.css must define --hk-soft-beige');
assert(globals.includes('--hk-charcoal: #2B2B2B;'), 'globals.css must define --hk-charcoal');
assert(globals.includes('--hk-taupe: #88735B;'), 'globals.css must define --hk-taupe');
assert(globals.includes('--hk-champagne: #C5B39F;'), 'globals.css must define --hk-champagne');

const tailwind = fs.readFileSync('tailwind.config.ts', 'utf8');
assert(tailwind.includes('hk:'), 'tailwind.config.ts must extend hk color tokens');

const layout = fs.readFileSync('src/app/layout.tsx', 'utf8');
assert(layout.includes('family=Manrope'), 'layout.tsx must load Manrope font');
assert(layout.includes('family=Cormorant+Garamond'), 'layout.tsx must load Cormorant Garamond font');

console.log('✅ Task 3 Design Tokens Test Passed!');
