const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSET_DIR = path.join(__dirname, '..', 'public', 'assets', 'harikita');
const REPORT_MD = path.join(__dirname, '..', 'docs', 'assets', 'AUDIT_CLIPPING_REPORT.md');

// User's manual flagged list
const USER_FLAGGED = new Set([
  'card-invitation-01.svg',
  'card-invitation-02.svg',
  'card-invitation-08.svg',
  'card-invitation-09.svg',
  'flower-bloom-10.svg',
  'flower-bloom-12.svg',
  'flower-bloom-13.svg',
  'flower-bloom-14.svg',
  'flower-bloom-15.svg',
  'flower-bloom-16.svg',
  'branch-05.svg',
  'botanical-02.svg',
  'botanical-03.svg',
  'botanical-06.svg',
  'botanical-10.svg',
  'botanical-11.svg',
  'botanical-14.svg',
  'botanical-15.svg',
  'botanical-17.svg',
  'botanical-18.svg',
  'botanical-23.svg',
  'botanical-24.svg',
  'botanical-25.svg',
  'botanical-26.svg',
  'botanical-31.svg',
  'botanical-32.svg',
]);

function getAllSvgFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllSvgFiles(fullPath));
    } else if (entry.name.toLowerCase().endsWith('.svg')) {
      results.push(fullPath);
    }
  }
  return results;
}

async function auditSvg(filePath) {
  const fileName = path.basename(filePath);
  const relPath = path.relative(path.join(__dirname, '..'), filePath).replace(/\\/g, '/');
  const svgContent = fs.readFileSync(filePath, 'utf8');

  // Render SVG to raw RGBA buffer via sharp
  // Render at normal or scaled size (minimum 400px on max dimension for high precision)
  let renderBuffer;
  try {
    const meta = await sharp(Buffer.from(svgContent)).metadata();
    const density = Math.max(72, Math.round((600 / Math.max(meta.width || 100, meta.height || 100)) * 72));
    const res = await sharp(Buffer.from(svgContent), { density })
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    const { width, height, channels } = res.info;
    const data = res.data;

    let minX = width, maxX = 0, minY = height, maxY = 0;
    let topTouchCount = 0;
    let bottomTouchCount = 0;
    let leftTouchCount = 0;
    let rightTouchCount = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * channels;
        const alpha = channels === 4 ? data[idx + 3] : (data[idx] < 240 ? 255 : 0);
        if (alpha > 15) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;

          if (y === 0) topTouchCount++;
          if (y === height - 1) bottomTouchCount++;
          if (x === 0) leftTouchCount++;
          if (x === width - 1) rightTouchCount++;
        }
      }
    }

    const topPad = minY;
    const bottomPad = height - 1 - maxY;
    const leftPad = minX;
    const rightPad = width - 1 - maxX;
    const minPad = Math.min(topPad, bottomPad, leftPad, rightPad);

    const touchedEdges = [];
    if (topTouchCount > 0 || topPad === 0) touchedEdges.push(`TOP(${topTouchCount}px)`);
    if (bottomTouchCount > 0 || bottomPad === 0) touchedEdges.push(`BOTTOM(${bottomTouchCount}px)`);
    if (leftTouchCount > 0 || leftPad === 0) touchedEdges.push(`LEFT(${leftTouchCount}px)`);
    if (rightTouchCount > 0 || rightPad === 0) touchedEdges.push(`RIGHT(${rightTouchCount}px)`);

    let status = 'SAFE';
    if (touchedEdges.length > 0) {
      status = 'CLIPPED';
    } else if (minPad <= 2) {
      status = 'TIGHT';
    }

    return {
      fileName,
      relPath,
      width,
      height,
      minPad,
      topPad,
      bottomPad,
      leftPad,
      rightPad,
      touchedEdges,
      status,
      isUserFlagged: USER_FLAGGED.has(fileName),
      error: null
    };
  } catch (err) {
    return {
      fileName,
      relPath,
      minPad: -1,
      status: 'ERROR',
      touchedEdges: [],
      isUserFlagged: USER_FLAGGED.has(fileName),
      error: err.message
    };
  }
}

async function run() {
  console.log('🔍 Starting Comprehensive SVG Boundary & Clipping Audit...\n');
  const svgFiles = getAllSvgFiles(ASSET_DIR);
  console.log(`Found ${svgFiles.length} SVG files under public/assets/harikita/\n`);

  const results = [];
  for (let i = 0; i < svgFiles.length; i++) {
    const f = svgFiles[i];
    const r = await auditSvg(f);
    results.push(r);
    if ((i + 1) % 50 === 0 || i === svgFiles.length - 1) {
      process.stdout.write(`Scanned ${i + 1}/${svgFiles.length} files...\r`);
    }
  }
  console.log('\n\n✅ Scan complete. Analyzing results...\n');

  const clipped = results.filter(r => r.status === 'CLIPPED');
  const tight = results.filter(r => r.status === 'TIGHT');
  const safe = results.filter(r => r.status === 'SAFE');
  const errors = results.filter(r => r.status === 'ERROR');

  const flaggedAndClipped = clipped.filter(r => r.isUserFlagged);
  const flaggedButSafe = results.filter(r => r.isUserFlagged && r.status === 'SAFE');
  const unflaggedClipped = clipped.filter(r => !r.isUserFlagged);

  console.log('================================================================');
  console.log('                   AUDIT SUMMARY STATISTICS                     ');
  console.log('================================================================');
  console.log(`Total SVGs Scanned       : ${results.length}`);
  console.log(`Clipped / Touching Edge : ${clipped.length}`);
  console.log(`Tight Margin (<=2px)    : ${tight.length}`);
  console.log(`Safe Margins (>2px)     : ${safe.length}`);
  console.log(`Render Errors           : ${errors.length}`);
  console.log('----------------------------------------------------------------');
  console.log(`User-Flagged Items Total: ${USER_FLAGGED.size}`);
  console.log(`User-Flagged Confirmed  : ${flaggedAndClipped.length}`);
  console.log(`User-Flagged Safe Margin: ${flaggedButSafe.length}`);
  console.log(`Additional Clipped Found: ${unflaggedClipped.length}`);
  console.log('================================================================\n');

  // Print Clipped Details
  console.log('🚨 LIST OF ALL CLIPPED ASSETS (TOUCHING VIEWBOX BOUNDARY):');
  clipped.forEach(c => {
    const flag = c.isUserFlagged ? ' [USER FLAGGED]' : ' [NEW DISCOVERY]';
    console.log(`- ${c.fileName}${flag}:`);
    console.log(`    Edges  : ${c.touchedEdges.join(', ')}`);
    console.log(`    Pads   : T=${c.topPad}px, B=${c.bottomPad}px, L=${c.leftPad}px, R=${c.rightPad}px`);
    console.log(`    Path   : ${c.relPath}`);
  });

  if (tight.length > 0) {
    console.log('\n⚠️ LIST OF TIGHT MARGIN ASSETS (<=2px, RISK OF CLIPPING):');
    tight.forEach(t => {
      const flag = t.isUserFlagged ? ' [USER FLAGGED]' : '';
      console.log(`- ${t.fileName}${flag} (minPad: ${t.minPad}px): T=${t.topPad}, B=${t.bottomPad}, L=${t.leftPad}, R=${t.rightPad}`);
    });
  }

  // Generate Markdown Report
  let md = `# LAPORAN AUDIT CLIPPING & BOUNDARY ASSET SVG HARIKITA\n\n`;
  md += `**Tanggal Audit:** ${new Date().toISOString()}\n`;
  md += `**Total Aset SVG Diperiksa:** ${results.length} file\n\n`;
  md += `## 1. Ringkasan Statistik\n\n`;
  md += `| Metrik | Jumlah | Persentase |\n`;
  md += `| :--- | :--- | :--- |\n`;
  md += `| **Total SVG Diperiksa** | ${results.length} | 100% |\n`;
  md += `| **Terindikasi Clipping / Menempel Batas (Pad = 0)** | ${clipped.length} | ${((clipped.length/results.length)*100).toFixed(1)}% |\n`;
  md += `| **Margin Sangat Sempit / Tight (Pad <= 2px)** | ${tight.length} | ${((tight.length/results.length)*100).toFixed(1)}% |\n`;
  md += `| **Margin Aman (Pad > 2px)** | ${safe.length} | ${((safe.length/results.length)*100).toFixed(1)}% |\n\n`;

  md += `## 2. Aset yang Menempel Batas / Terpotong (Clipped)\n\n`;
  md += `| File Name | Kategori | Sisi Menempel | Padding (T/B/L/R) | Status di Daftar User |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;
  clipped.forEach(c => {
    const category = c.relPath.split('/')[2];
    md += `| \`${c.fileName}\` | ${category} | ${c.touchedEdges.join(', ')} | ${c.topPad}/${c.bottomPad}/${c.leftPad}/${c.rightPad}px | ${c.isUserFlagged ? '✅ **Ada di Daftar User**' : '⚠️ *Temuan Scanner Baru*'} |\n`;
  });

  if (tight.length > 0) {
    md += `\n## 3. Aset dengan Margin Sangat Mepet (Tight Margin <= 2px)\n\n`;
    md += `| File Name | Kategori | Min Pad | Padding (T/B/L/R) | Status di Daftar User |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- |\n`;
    tight.forEach(t => {
      const category = t.relPath.split('/')[2];
      md += `| \`${t.fileName}\` | ${category} | ${t.minPad}px | ${t.topPad}/${t.bottomPad}/${t.leftPad}/${t.rightPad}px | ${t.isUserFlagged ? '✅ Ada di Daftar' : '-'} |\n`;
    });
  }

  // Cross check user items that were not detected touching pixel boundary (e.g. cut in source or neighbor overlap)
  if (flaggedButSafe.length > 0) {
    md += `\n## 4. Evaluasi Aset dalam Daftar User yang Marginnya Aman di SVG\n`;
    md += `*Catatan: Aset berikut memiliki margin aman terhadap viewBox SVG-nya, namun dilaporkan User terpotong atau memotong aset lain. Ini mengindikasikan bahwa **pemotongan atau kebocoran terjadi pada gambar sumber (crop mentah) sebelum ditrace**, bukan karena terpotong oleh viewBox SVG itu sendiri.*\n\n`;
    md += `| File Name | Padding Aktual | Analisis Penyebab Masalah |\n`;
    md += `| :--- | :--- | :--- |\n`;
    flaggedButSafe.forEach(f => {
      md += `| \`${f.fileName}\` | T=${f.topPad}, B=${f.bottomPad}, L=${f.leftPad}, R=${f.rightPad}px | Potongan mentah dari sheet terpotong atau ada elemen tetangga yang ikut ter-trace |\n`;
    });
  }

  fs.writeFileSync(REPORT_MD, md);
  console.log(`\n📄 Detailed Markdown report written to: ${REPORT_MD}`);
}

run().catch(console.error);
