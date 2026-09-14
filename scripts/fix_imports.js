const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src/app/design-system-showcase/components/invitation-hub/studio');
let count = 0;
files.forEach((f) => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('mock-invitation-sandbox')) {
    const updated = content.replace(
      /from\s+['"][^'"]*data\/mock-invitation-sandbox['"]/g,
      "from '@/app/design-system-showcase/data/mock-invitation-sandbox'"
    );
    if (updated !== content) {
      fs.writeFileSync(f, updated, 'utf8');
      count++;
      console.log('Fixed:', f);
    }
  }
});
console.log('Total fixed files:', count);
