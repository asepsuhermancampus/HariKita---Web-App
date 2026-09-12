const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const ASSET_BASE = path.join(ROOT_DIR, 'public', 'assets', 'harikita');
const OUTPUT_JSON = path.join(ROOT_DIR, 'src', 'data', 'harikita-assets.json');

const CATEGORY_LABELS = {
  'ornaments': 'Floral & Botanical Ornaments',
  'lines': 'Decorative Lines & Dividers',
  'corners': 'Corner Elements',
  'abstract': 'Abstract Symbols',
  'flowers/single-stem': 'Single Stem Flowers',
  'flowers/blooms': 'Flower Blooms',
  'flowers/accents': 'Small Floral Accents',
  'leaves/sprigs': 'Leaf Sprigs',
  'leaves/branches': 'Branches',
  'leaves/stems': 'Stems',
  'compositions': 'Floral Compositions',
  'patterns': 'Background Patterns',
  'textures': 'Paper & Linen Textures',
  'icons': 'Custom Concept Icons',
  'decorative': 'UI Decorative Assets',
  'cards': 'Invitation & Card Design Elements',
  'avatars': 'Social Media Avatars'
};

function walkDir(dir, baseDir = '') {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(walkDir(filePath, path.join(baseDir, file)));
    } else {
      results.push(path.join(baseDir, file).replace(/\\/g, '/'));
    }
  }
  return results;
}

function generateManifest() {
  console.log('Generating asset manifest from public/assets/harikita...');
  const files = walkDir(ASSET_BASE);
  const catalog = [];

  for (const rel of files) {
    const ext = path.extname(rel).toLowerCase();
    const id = path.basename(rel, ext);
    const dir = path.dirname(rel).replace(/\\/g, '/');
    const category = dir;
    const categoryLabel = CATEGORY_LABELS[category] || category;
    const filePath = `assets/harikita/${rel}`;

    let viewBox = undefined;
    let format = ext === '.svg' ? 'svg' : 'webp';
    if (format === 'svg') {
      const content = fs.readFileSync(path.join(ASSET_BASE, rel), 'utf8');
      const vbMatch = content.match(/viewBox=["']([^"']+)["']/);
      if (vbMatch) viewBox = vbMatch[1];
    }

    catalog.push({
      id,
      name: id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      category,
      categoryLabel,
      filePath,
      format,
      viewBox,
      aspectRatio: viewBox ? 'square/proportional' : 'cover',
      tags: [category.split('/')[0], id],
      suggestedUsage: `Decorative element for ${categoryLabel}`
    });
  }

  // Ensure output dir exists
  const outDir = path.dirname(OUTPUT_JSON);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(catalog, null, 2));
  console.log(`✅ Generated manifest with ${catalog.length} items at src/data/harikita-assets.json`);
}

generateManifest();
