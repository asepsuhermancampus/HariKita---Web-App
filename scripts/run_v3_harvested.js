const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const { vectorizeV3, rgbToHex } = require("./ultra_fidelity_vectorizer_v3");

const HARVESTED_DIR = path.resolve(__dirname, "../references/kadio-assets/harvested");
const SVG_OUT_DIR = path.join(HARVESTED_DIR, "svg");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(SVG_OUT_DIR);

async function runHarvestedV3() {
  console.log("=== TASK 3: BATCH RE-VECTORIZATION OF ALL 280 HARVESTED ASSETS (V3 ENGINE) ===");
  const rawFiles = fs.readdirSync(HARVESTED_DIR).filter(
    (f) =>
      (f.endsWith(".png") || f.endsWith(".svg") || f.endsWith(".jpg") || f.endsWith(".jpeg")) &&
      !f.startsWith("test_")
  );

  console.log(`Found ${rawFiles.length} raw assets in harvested directory.\n`);

  const catalogData = [];
  let count = 0;

  for (const f of rawFiles) {
    count++;
    const ext = path.extname(f).toLowerCase();
    const base = path.basename(f, ext);
    const srcPath = path.join(HARVESTED_DIR, f);
    const outSvgPath = path.join(SVG_OUT_DIR, `${base}.svg`);

    // 1. Existing SVG files
    if (ext === ".svg") {
      let content = fs.readFileSync(srcPath, "utf8");
      // Check if it's a fake SVG with embedded base64
      const m = content.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/);
      if (m) {
        // Decode base64 PNG and vectorize with V3
        const pngBuf = Buffer.from(m[1], "base64");
        const png = PNG.sync.read(pngBuf);
        const cleanSvg = await vectorizeV3(png, f);
        fs.writeFileSync(outSvgPath, cleanSvg, "utf8");
        const newSizeKb = (cleanSvg.length / 1024).toFixed(1);
        catalogData.push({
          file: f,
          svgFile: `${base}.svg`,
          type: "multicolor",
          category: "Multicolor Floral & Botanical",
          w: png.width,
          h: png.height,
          origSizeKb: (fs.statSync(srcPath).size / 1024).toFixed(1),
          newSizeKb,
          isMono: false,
        });
        console.log(`[${count}/${rawFiles.length}] [DECODED FAKE SVG -> V3] ${base}.svg -> ${newSizeKb} KB`);
        continue;
      }

      if (!content.includes("currentColor") && !content.includes("linearGradient")) {
        content = content.replace(/fill="[^"]*"/, 'fill="currentColor"');
      }
      fs.writeFileSync(outSvgPath, content, "utf8");
      catalogData.push({
        file: f,
        svgFile: `${base}.svg`,
        type: "existing-svg",
        category: "Vector Asli",
        sizeKb: (content.length / 1024).toFixed(1),
        isMono: true,
      });
      console.log(`[${count}/${rawFiles.length}] [EXISTING SVG] ${base}.svg`);
      continue;
    }

    // 2. JPG files (Wallpapers)
    if (ext === ".jpg" || ext === ".jpeg") {
      if (fs.existsSync(outSvgPath)) {
        const svgContent = fs.readFileSync(outSvgPath, "utf8");
        catalogData.push({
          file: f,
          svgFile: `${base}.svg`,
          type: "solid-bg",
          category: "Background Wallpaper",
          origSizeKb: (fs.statSync(srcPath).size / 1024).toFixed(1),
          newSizeKb: (svgContent.length / 1024).toFixed(1),
          isMono: false,
        });
        console.log(`[${count}/${rawFiles.length}] [WALLPAPER GRADIENT] ${base}.svg`);
      }
      continue;
    }

    // 3. PNG files
    const png = PNG.sync.read(fs.readFileSync(srcPath));
    const origSizeKb = (fs.statSync(srcPath).size / 1024).toFixed(1);

    let transparent = 0;
    for (let i = 0; i < png.data.length; i += 16) {
      if (png.data[i + 3] < 30) transparent++;
    }
    const pctTrans = (transparent / (png.data.length / 16)) * 100;
    const isSolid = pctTrans < 5;

    let svgContent = "";
    let category = "";
    let isMono = false;

    if (isSolid) {
      category = "Background Wallpaper";
      const cTop = rgbToHex(png.data[0], png.data[1], png.data[2]);
      const midIdx = Math.floor(png.height / 2) * png.width * 4;
      const cMid = rgbToHex(png.data[midIdx], png.data[midIdx + 1], png.data[midIdx + 2]);
      const botIdx = (png.height - 1) * png.width * 4;
      const cBot = rgbToHex(png.data[botIdx], png.data[botIdx + 1], png.data[botIdx + 2]);

      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${png.width} ${png.height}" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${cTop}"/>
      <stop offset="50%" stop-color="${cMid}"/>
      <stop offset="100%" stop-color="${cBot}"/>
    </linearGradient>
  </defs>
  <rect width="${png.width}" height="${png.height}" fill="url(#bgGrad)"/>
</svg>
`;
    } else {
      svgContent = await vectorizeV3(png, f);
      if (svgContent.includes("currentColor")) {
        category = "Monokrom / Line Art / Divider";
        isMono = true;
      } else {
        category = "Multicolor Floral & Botanical";
      }
    }

    fs.writeFileSync(outSvgPath, svgContent, "utf8");
    const newSizeKb = (svgContent.length / 1024).toFixed(1);

    catalogData.push({
      file: f,
      svgFile: `${base}.svg`,
      type: isSolid ? "solid-bg" : isMono ? "monochrome" : "multicolor",
      category,
      w: png.width,
      h: png.height,
      origSizeKb,
      newSizeKb,
      isMono,
    });

    console.log(
      `[${count}/${rawFiles.length}] [${category}] ${base}.svg (${png.width}x${png.height}) -> ${newSizeKb} KB`
    );
  }

  fs.writeFileSync(
    path.join(SVG_OUT_DIR, "harvested_catalog_data.json"),
    JSON.stringify(catalogData, null, 2),
    "utf8"
  );
  console.log(`\n=== TASK 3 FINISHED: ALL ${catalogData.length} ASSETS PROCESSED WITH V3 ENGINE! ===`);
}

runHarvestedV3().catch((err) => {
  console.error("V3 batch error:", err);
  process.exit(1);
});
