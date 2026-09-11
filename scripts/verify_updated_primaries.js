const fs = require('fs');

const files = [
  'event-bottom-right.svg',
  'bride-flower-3.svg',
  'bg-flower-3.svg',
  '1754648453_kdo54-bg-3.svg',
  '1754403915_kdo56-flower-1.svg'
];

for (const f of files) {
  const content = fs.readFileSync('references/kadio-assets/harvested/svg/' + f, 'utf8');
  const fills = content.match(/fill="([^"]+)"/g) || [];
  const mCommands = (content.match(/M/g) || []).length;
  console.log(`\n=== PRIMARY: ${f} ===`);
  console.log(`Size: ${content.length} bytes, Subpaths (M): ${mCommands}`);
  console.log(`Fills (${fills.length}):`, fills);
}
