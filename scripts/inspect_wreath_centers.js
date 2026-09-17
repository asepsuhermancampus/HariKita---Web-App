const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const RAW_DIR = path.join(__dirname, '..', 'public', 'refactor_dir_sementara');
const sheetLingkaran = path.join(RAW_DIR, 'asset-mentah-ornamen-and-element', '16 asset yang harus dibuat-lingkaran.jpeg');

async function inspectWreathAnatomy() {
  const { data, info } = await sharp(sheetLingkaran).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;

  // Let's find each wreath's center of mass
  // In a 4x4 grid, each nominal quadrant is around (c * 512 + 256, r * 512 + 256)
  // Let's check how far each wreath spreads from (c*512 + 256, r*512 + 256)
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const idx = r * 4 + c + 1;
      const nominalCx = c * 512 + 256;
      const nominalCy = r * 512 + 256;

      // Find average position of dark pixels in [c*512..c*512+512, r*512..r*512+512]
      let sumX = 0, sumY = 0, count = 0;
      for (let y = r * 512 + 20; y < (r + 1) * 512 - 20; y++) {
        for (let x = c * 512 + 20; x < (c + 1) * 512 - 20; x++) {
          if (data[y * w + x] < 200) {
            sumX += x;
            sumY += y;
            count++;
          }
        }
      }
      const actualCx = Math.round(sumX / count);
      const actualCy = Math.round(sumY / count);
      console.log(`Wreath ${idx} (r=${r}, c=${c}): actualCenter=(${actualCx}, ${actualCy}), darkCount=${count}`);
    }
  }
}

inspectWreathAnatomy().catch(console.error);
