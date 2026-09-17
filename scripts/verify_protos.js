const fs = require('fs');

const files = [
  'proto_event-bottom-right.svg',
  'proto_1754403915_kdo56-flower-1.svg',
  'proto_bride-flower-3.svg',
  'proto_1754648453_kdo54-bg-3.svg',
  'proto_bg-flower-3.svg'
];

for (const f of files) {
  const content = fs.readFileSync('references/kadio-assets/harvested/svg/' + f, 'utf8');
  const fills = content.match(/fill="([^"]+)"/g) || [];
  const strokes = content.match(/stroke="([^"]+)"/g) || [];
  const mCommands = (content.match(/M/g) || []).length;
  console.log(`\n=== ${f} ===`);
  console.log(`Size: ${content.length} bytes, Subpaths (M): ${mCommands}`);
  console.log(`Fills (${fills.length}):`, fills);
}
