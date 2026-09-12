const fs = require('fs');
const assert = require('assert');

const file = 'src/components/brand/HariKitaLogo.tsx';
assert(fs.existsSync(file), 'HariKitaLogo.tsx must exist');

const content = fs.readFileSync(file, 'utf8');
assert(content.includes('export const HariKitaLogo'), 'Must export HariKitaLogo');
assert(content.includes('viewBox="602 13 741 678"'), 'Must use normalized symbol viewBox');
assert(content.includes('viewBox="26 36 1898 388"'), 'Must use normalized wordmark viewBox');
assert(content.includes('fill="currentColor"'), 'Must support currentColor');

console.log('✅ Task 4 Logo Component Test Passed!');
