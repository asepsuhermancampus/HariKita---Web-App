const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BASE_DIR = path.join(__dirname, '..', 'public', 'refactor_dir_sementara');

async function catalogAll() {
  const subdirs = fs.readdirSync(BASE_DIR);
  const result = {};

  for (const s of subdirs) {
    const sPath = path.join(BASE_DIR, s);
    if (!fs.statSync(sPath).isDirectory()) continue;
    result[s] = [];
    const files = fs.readdirSync(sPath);
    for (const f of files) {
      const fPath = path.join(sPath, f);
      const meta = await sharp(fPath).metadata();
      result[s].push({
        file: f,
        width: meta.width,
        height: meta.height,
        format: meta.format,
        sizeKb: Math.round(fs.statSync(fPath).size / 1024)
      });
    }
  }

  console.log(JSON.stringify(result, null, 2));
}

catalogAll().catch(console.error);
