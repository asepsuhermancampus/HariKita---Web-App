const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const potrace = require("potrace");

const KDO_DIR = path.resolve(__dirname, "../references/kadio-assets/kdo-library");
const SVG_DIR = path.join(KDO_DIR, "svg");
const THEMES_DIR = path.resolve(__dirname, "../references/kadio-assets/themes");

// 1. Read Canonical Vector Icon Paths from Themes
const withLuvMapRaw = fs.readFileSync(path.join(THEMES_DIR, "with-luv/map.svg"), "utf8");
const withLuvUnlockRaw = fs.readFileSync(path.join(THEMES_DIR, "with-luv/unlock.svg"), "utf8");
const withLuvGiftRaw = fs.readFileSync(path.join(THEMES_DIR, "with-luv/gift.svg"), "utf8");
const withLuvMessageRaw = fs.readFileSync(path.join(THEMES_DIR, "with-luv/message.svg"), "utf8");

const auroraGiftRaw = fs.readFileSync(path.join(THEMES_DIR, "aurora-cempaka/gift.svg"), "utf8");
const arcticMessageRaw = fs.readFileSync(path.join(THEMES_DIR, "arctic-bloom/message.svg"), "utf8");

function extractInnerPaths(svgContent) {
  // Extract all <path ... /> elements
  const paths = svgContent.match(/<path[^>]+>/g) || [];
  return paths.map(p => {
    // replace fill with currentColor, remove existing style
    let clean = p.replace(/fill="[^"]*"/g, 'fill="currentColor"');
    clean = clean.replace(/style="[^"]*"/g, '');
    return clean;
  }).join("\n  ");
}

function extractViewBox(svgContent, fallback) {
  const m = svgContent.match(/viewBox="([^"]+)"/);
  return m ? m[1] : fallback;
}

const CANONICAL_TEMPLATES = {
  map: {
    viewBox: extractViewBox(withLuvMapRaw, "0 0 20 20"),
    paths: extractInnerPaths(withLuvMapRaw)
  },
  unlock: {
    viewBox: extractViewBox(withLuvUnlockRaw, "0 0 36 37"),
    paths: extractInnerPaths(withLuvUnlockRaw)
  },
  gift: {
    viewBox: extractViewBox(withLuvGiftRaw, "0 0 28 27"),
    paths: extractInnerPaths(withLuvGiftRaw)
  },
  message: {
    viewBox: extractViewBox(withLuvMessageRaw, "0 0 28 28"),
    paths: extractInnerPaths(withLuvMessageRaw)
  },
  gift_kdo9: {
    viewBox: extractViewBox(auroraGiftRaw, "0 0 24 24"),
    paths: extractInnerPaths(auroraGiftRaw)
  },
  message_kdo9: {
    viewBox: extractViewBox(arcticMessageRaw, "0 0 21 21"),
    paths: extractInnerPaths(arcticMessageRaw)
  }
};

function getDominantHex(pngPath) {
  if (!fs.existsSync(pngPath)) return "#a76300";
  const png = PNG.sync.read(fs.readFileSync(pngPath));
  const counts = {};
  for (let i = 0; i < png.data.length; i += 4) {
    if (png.data[i + 3] > 60) {
      const hex = "#" + [png.data[i], png.data[i + 1], png.data[i + 2]]
        .map(c => c.toString(16).padStart(2, "0"))
        .join("");
      counts[hex] = (counts[hex] || 0) + 1;
    }
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0] ? sorted[0][0] : "#3F3209";
}

function buildVectorSvg(template, hexColor, width, height) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${template.viewBox}" fill="currentColor" style="color: var(--ornament-color, ${hexColor}); width: 100%; height: 100%;">
  ${template.paths}
</svg>
`;
}

function traceAlphaMask(pngPath, defaultColor) {
  return new Promise((resolve, reject) => {
    const png = PNG.sync.read(fs.readFileSync(pngPath));
    const maskPng = new PNG({ width: png.width, height: png.height });
    for (let i = 0; i < png.data.length; i += 4) {
      const alpha = png.data[i + 3];
      const val = alpha > 60 ? 0 : 255;
      maskPng.data[i] = val;
      maskPng.data[i + 1] = val;
      maskPng.data[i + 2] = val;
      maskPng.data[i + 3] = 255;
    }
    const maskBuf = PNG.sync.write(maskPng);
    potrace.trace(
      maskBuf,
      {
        threshold: 128,
        optTolerance: 0.2,
        turdSize: 2,
        color: defaultColor
      },
      (err, svg) => {
        if (err) return reject(err);
        const cleanSvg = svg.replace(
          new RegExp(`fill="${defaultColor}"`, "g"),
          `fill="currentColor" style="color: var(--ornament-color, ${defaultColor})"`
        );
        resolve(cleanSvg);
      }
    );
  });
}

async function fixAllAnomalies() {
  console.log("=== STARTING COMPREHENSIVE KDO ANOMALY FIXES ===");

  const stats = {
    iconsFixed: 0,
    laceFixed: 0,
    bgsOptimized: 0,
    framesFixed: 0,
  };

  // 1. Fix Micro-Icons across kdo9 through kdo25
  const iconDirs = [
    "kdo9", "kdo12", "kdo15", "kdo16", "kdo17", "kdo18",
    "kdo19", "kdo20", "kdo21", "kdo22", "kdo23", "kdo24", "kdo25"
  ];

  for (const d of iconDirs) {
    const dPngDir = path.join(KDO_DIR, d);
    const dSvgDir = path.join(SVG_DIR, d);
    if (!fs.existsSync(dPngDir)) continue;
    if (!fs.existsSync(dSvgDir)) fs.mkdirSync(dSvgDir, { recursive: true });

    const files = fs.readdirSync(dPngDir);
    for (const f of files) {
      const base = f.replace(".png", "");
      const isGift = base === "gift" || base === "gift-hover";
      const isMap = base === "map" || base === "map-hover";
      const isMessage = base === "message";
      const isUnlock = base === "unlock" || base === "unlock-hover";

      if (!isGift && !isMap && !isMessage && !isUnlock) continue;

      const pngPath = path.join(dPngDir, f);
      const svgPath = path.join(dSvgDir, `${base}.svg`);

      let dominantColor = getDominantHex(pngPath);
      if (base.includes("hover")) dominantColor = "#ffffff";

      let template;
      if (isGift) {
        template = d === "kdo9" ? CANONICAL_TEMPLATES.gift_kdo9 : CANONICAL_TEMPLATES.gift;
      } else if (isMap) {
        template = CANONICAL_TEMPLATES.map;
      } else if (isMessage) {
        template = d === "kdo9" ? CANONICAL_TEMPLATES.message_kdo9 : CANONICAL_TEMPLATES.message;
      } else if (isUnlock) {
        template = CANONICAL_TEMPLATES.unlock;
      }

      const svgContent = buildVectorSvg(template, dominantColor);
      fs.writeFileSync(svgPath, svgContent, "utf8");
      stats.iconsFixed++;
      console.log(`  [ICON FIXED] ${d}/${base}.svg (${dominantColor})`);
    }
  }

  // 2. Fix kdo15/event-bg.png (Periwinkle Floral Lace Border)
  const kdo15BgPng = path.join(KDO_DIR, "kdo15/event-bg.png");
  if (fs.existsSync(kdo15BgPng)) {
    console.log("  [LACE TRACING] kdo15/event-bg.png as single-color periwinkle lace border...");
    const laceSvg = await traceAlphaMask(kdo15BgPng, "#7998c7");
    fs.writeFileSync(path.join(SVG_DIR, "kdo15/event-bg.svg"), laceSvg, "utf8");
    stats.laceFixed++;
    console.log(`  [LACE FIXED] kdo15/event-bg.svg (${(laceSvg.length / 1024).toFixed(1)} KB)`);
  }

  // 3. Fix kdo16/frame.png (Ornate White Frame)
  const kdo16FramePng = path.join(KDO_DIR, "kdo16/frame.png");
  if (fs.existsSync(kdo16FramePng)) {
    console.log("  [FRAME TRACING] kdo16/frame.png as crisp white ornate frame...");
    const frameSvg = await traceAlphaMask(kdo16FramePng, "#ffffff");
    fs.writeFileSync(path.join(SVG_DIR, "kdo16/frame.svg"), frameSvg, "utf8");
    stats.framesFixed++;
    console.log(`  [FRAME FIXED] kdo16/frame.svg (${(frameSvg.length / 1024).toFixed(1)} KB)`);
  }

  // 4. Optimize Solid Wallpaper Backgrounds (kdo3, kdo10, kdo16, kdo22, kdo24, kdo33)
  const wallpapers = [
    {
      kdo: "kdo3",
      file: "event-bg.svg",
      w: 600,
      h: 334,
      stops: [
        { offset: "0%", color: "#c9c9c9" },
        { offset: "50%", color: "#e6e5e6" },
        { offset: "100%", color: "#c6c6c6" }
      ],
      type: "linear"
    },
    {
      kdo: "kdo10",
      file: "event-bg.svg",
      w: 360,
      h: 947,
      stops: [
        { offset: "0%", color: "#71898d" },
        { offset: "100%", color: "#6a8183" }
      ],
      type: "linear"
    },
    {
      kdo: "kdo16",
      file: "event-bg.svg",
      w: 414,
      h: 1341,
      stops: [
        { offset: "0%", color: "#ddc1c0" },
        { offset: "50%", color: "#b2a2a1" },
        { offset: "100%", color: "#8395b3" }
      ],
      type: "linear"
    },
    {
      kdo: "kdo22",
      file: "event-bg.svg",
      w: 414,
      h: 1064,
      stops: [
        { offset: "0%", color: "#86786f" },
        { offset: "50%", color: "#6e5d4f" },
        { offset: "100%", color: "#4f4540" }
      ],
      type: "linear"
    },
    {
      kdo: "kdo24",
      file: "event-bg.svg",
      w: 286,
      h: 419,
      stops: [
        { offset: "0%", color: "#e2d4c4" },
        { offset: "100%", color: "#2d3748" }
      ],
      type: "radial"
    },
    {
      kdo: "kdo33",
      file: "event-bg.svg",
      w: 414,
      h: 462,
      stops: [
        { offset: "0%", color: "#fbe8ae" },
        { offset: "60%", color: "#ebebe4" },
        { offset: "100%", color: "#e2ddcf" }
      ],
      type: "linear"
    }
  ];

  for (const wp of wallpapers) {
    const outPath = path.join(SVG_DIR, wp.kdo, wp.file);
    let gradDef = "";
    if (wp.type === "linear") {
      gradDef = `<linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      ${wp.stops.map(s => `<stop offset="${s.offset}" stop-color="${s.color}"/>`).join("\n      ")}
    </linearGradient>`;
    } else {
      gradDef = `<radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
      ${wp.stops.map(s => `<stop offset="${s.offset}" stop-color="${s.color}"/>`).join("\n      ")}
    </radialGradient>`;
    }

    const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${wp.w} ${wp.h}" width="100%" height="100%">
  <defs>
    ${gradDef}
  </defs>
  <rect width="${wp.w}" height="${wp.h}" fill="url(#bgGrad)"/>
</svg>
`;
    fs.writeFileSync(outPath, bgSvg, "utf8");
    stats.bgsOptimized++;
    console.log(`  [BG OPTIMIZED] ${wp.kdo}/${wp.file} (replaced 12MB noise with sleek vector gradient)`);
  }

  // 5. Update Shared Directory Canonical Templates
  const sharedDir = path.join(SVG_DIR, "shared");
  if (!fs.existsSync(sharedDir)) fs.mkdirSync(sharedDir, { recursive: true });

  fs.writeFileSync(
    path.join(sharedDir, "canonical_gift.svg"),
    buildVectorSvg(CANONICAL_TEMPLATES.gift, "#a76300"),
    "utf8"
  );
  fs.writeFileSync(
    path.join(sharedDir, "canonical_map.svg"),
    buildVectorSvg(CANONICAL_TEMPLATES.map, "#a76300"),
    "utf8"
  );
  fs.writeFileSync(
    path.join(sharedDir, "canonical_message.svg"),
    buildVectorSvg(CANONICAL_TEMPLATES.message, "#a76300"),
    "utf8"
  );
  fs.writeFileSync(
    path.join(sharedDir, "canonical_unlock.svg"),
    buildVectorSvg(CANONICAL_TEMPLATES.unlock, "#a76300"),
    "utf8"
  );

  console.log("\n=== COMPLETED FIXES ===");
  console.log(`  - Total Icons Fixed: ${stats.iconsFixed}`);
  console.log(`  - Lace Assets Repaired: ${stats.laceFixed}`);
  console.log(`  - Wallpaper Bloat Eliminated: ${stats.bgsOptimized}`);
  console.log(`  - Frames Restored: ${stats.framesFixed}`);
}

fixAllAnomalies().catch(err => {
  console.error("Error fixing anomalies:", err);
  process.exit(1);
});
