const fs = require('fs');
const assert = require('assert');

const logoBadge = fs.readFileSync('src/components/layout/LogoBadge.tsx', 'utf8');
assert(!logoBadge.includes('/logo_badge.png'), 'LogoBadge must not use old raster logo_badge.png');
assert(logoBadge.includes('HariKitaLogo'), 'LogoBadge must wrap HariKitaLogo');

const navbar = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf8');
assert(navbar.includes('LogoBadge'), 'Navbar must include logo');

const footer = fs.readFileSync('src/components/layout/Footer.tsx', 'utf8');
assert(footer.includes('LogoBadge') || footer.includes('HariKitaLogo'), 'Footer must include logo');

console.log('✅ Task 5 Layout Integration Test Passed!');
