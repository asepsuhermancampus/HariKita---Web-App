const fs = require('fs');

const svg = fs.readFileSync('references/kadio-assets/harvested/svg/1754403915_kdo56-flower-1.svg', 'utf8');
const paths = svg.match(/<path[^>]+>/g) || [];
console.log('Total paths:', paths.length);
paths.forEach((p, i) => {
  const fill = p.match(/fill="([^"]+)"/)?.[1];
  const dLen = p.match(/d="([^"]+)"/)?.[1]?.length || 0;
  console.log(`Path ${i}: fill=${fill}, path length=${dLen}`);
});
