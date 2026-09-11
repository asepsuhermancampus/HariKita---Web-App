const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { URL } = require("url");

const BASE_OUT_DIR = path.resolve(__dirname, "../references/kadio-assets");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(BASE_OUT_DIR);
ensureDir(path.join(BASE_OUT_DIR, "icons"));
ensureDir(path.join(BASE_OUT_DIR, "themes"));

function fetchBuffer(targetUrl) {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(targetUrl);
      const client = parsed.protocol === "https:" ? https : http;
      const req = client.get(
        targetUrl,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/*,*/*;q=0.8",
          },
          timeout: 25000,
        },
        (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            let redirectUrl = res.headers.location;
            if (!redirectUrl.startsWith("http")) {
              redirectUrl = new URL(redirectUrl, targetUrl).toString();
            }
            return resolve(fetchBuffer(redirectUrl));
          }
          if (res.statusCode !== 200) {
            return reject(new Error(`HTTP ${res.statusCode}`));
          }
          const chunks = [];
          res.on("data", (chunk) => chunks.push(chunk));
          res.on("end", () => resolve(Buffer.concat(chunks)));
        }
      );
      req.on("error", reject);
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Timeout"));
      });
    } catch (e) {
      reject(e);
    }
  });
}

function checkHeadOrGet(targetUrl) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(targetUrl);
      const client = parsed.protocol === "https:" ? https : http;
      const req = client.get(
        targetUrl,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36",
          },
          timeout: 10000,
        },
        (res) => {
          if (res.statusCode === 200) {
            const ct = res.headers["content-type"] || "";
            if (ct.startsWith("image/") || ct.includes("svg") || ct.includes("octet-stream")) {
              const chunks = [];
              res.on("data", (c) => chunks.push(c));
              res.on("end", () => resolve(Buffer.concat(chunks)));
              return;
            }
          }
          res.resume();
          resolve(null);
        }
      );
      req.on("error", () => resolve(null));
      req.on("timeout", () => {
        req.destroy();
        resolve(null);
      });
    } catch {
      resolve(null);
    }
  });
}

function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*#%]+/g, "_").trim();
}

async function main() {
  console.log("=== STARTING KADIO ASSET HARVESTER ===");
  console.log(`Destination directory: ${BASE_OUT_DIR}`);

  const manifest = {
    source: "https://kadio.id",
    downloadDate: new Date().toISOString(),
    themes: {},
    probedKdo: {},
  };

  // 1. Load or fetch daftar-design
  let catalogHtml = "";
  const localCatalogPath = path.resolve(__dirname, "../scratch/kadio_daftar_design.html");
  if (fs.existsSync(localCatalogPath)) {
    catalogHtml = fs.readFileSync(localCatalogPath, "utf8");
  } else {
    console.log("Fetching https://kadio.id/daftar-design...");
    const buf = await fetchBuffer("https://kadio.id/daftar-design");
    catalogHtml = buf.toString("utf8");
  }

  // Extract all demo URLs
  const demoRegex = /href=["'](https:\/\/kadio\.id\/demo\/[^"']+|\/demo\/[^"']+)["']/gi;
  let m;
  const demos = [];
  while ((m = demoRegex.exec(catalogHtml)) !== null) {
    demos.push(m[1].startsWith("http") ? m[1] : "https://kadio.id" + m[1]);
  }
  const uniqueDemos = Array.from(new Set(demos));
  console.log(`Found ${uniqueDemos.length} demo themes on Kadio catalogue.`);

  // 2. Crawl each demo theme
  for (let idx = 0; idx < uniqueDemos.length; idx++) {
    const demoUrl = uniqueDemos[idx];
    const themeSlug = demoUrl.split("/").pop();
    console.log(`\n[${idx + 1}/${uniqueDemos.length}] Scraping theme: ${themeSlug}...`);

    let demoHtml = "";
    try {
      const buf = await fetchBuffer(demoUrl);
      demoHtml = buf.toString("utf8");
    } catch (err) {
      console.error(`  [!] Failed to fetch ${demoUrl}: ${err.message}`);
      continue;
    }

    manifest.themes[themeSlug] = {
      demoUrl,
      assets: [],
    };

    const themeDir = path.join(BASE_OUT_DIR, "themes", themeSlug);
    ensureDir(themeDir);

    // Extract all image/media URLs
    const r = /(?:src=["']|url\(['"]?)(https?:\/\/[^"'\)\s]+|\/[^"'\)\s]+)/gi;
    const rawUrls = [];
    while ((m = r.exec(demoHtml)) !== null) {
      let u = m[1];
      if (u.startsWith("//")) u = "https:" + u;
      else if (u.startsWith("/")) u = "https://kadio.id" + u;
      rawUrls.push(u);
    }

    const uniqueUrls = Array.from(new Set(rawUrls));

    for (let u of uniqueUrls) {
      // Filter out unwanted / user photos
      if (
        u.includes("notfound") ||
        u.includes("google") ||
        u.includes("facebook") ||
        u.includes("pinterest") ||
        u.includes("double-quotes") ||
        u.includes("logo-new-white") ||
        u.includes("/upload/439/") ||
        u.includes("/upload/841/") ||
        u.includes("bride16") || // user personal couple photos
        u.match(/g-\d+\.jpg/) // user gallery sample photos
      ) {
        continue;
      }

      // Check extension
      const cleanUrl = u.split("?")[0];
      const ext = path.extname(cleanUrl).toLowerCase();
      if (![".png", ".jpg", ".jpeg", ".svg", ".webp"].includes(ext)) {
        continue;
      }

      // Determine category & destination
      const baseName = path.basename(cleanUrl);
      const safeName = sanitizeFilename(decodeURIComponent(baseName));

      let targetPath;
      if (u.includes("/icon/") || safeName.includes("icon") || safeName.includes("Prokes")) {
        targetPath = path.join(BASE_OUT_DIR, "icons", safeName);
      } else {
        targetPath = path.join(themeDir, safeName);
      }

      if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 0) {
        manifest.themes[themeSlug].assets.push(path.relative(BASE_OUT_DIR, targetPath));
        continue;
      }

      try {
        const fileBuf = await fetchBuffer(u);
        if (fileBuf && fileBuf.length > 100) {
          ensureDir(path.dirname(targetPath));
          fs.writeFileSync(targetPath, fileBuf);
          console.log(`   + Downloaded: ${safeName} (${Math.round(fileBuf.length / 1024)} KB)`);
          manifest.themes[themeSlug].assets.push(path.relative(BASE_OUT_DIR, targetPath));
        }
      } catch (e) {
        // quiet skip
      }
    }
  }

  // 3. Systematic probe for kdo1 to kdo60 directories
  console.log("\n--- SYSTEMATIC PROBE OF kdo1 TO kdo60 ASSETS ---");
  const kdoAssetNames = [
    "divider.png",
    "divider-2.png",
    "divider-top.png",
    "divider-bottom.png",
    "frame-bride.png",
    "frame-groom.png",
    "frame-couple.png",
    "frame.png",
    "bride-flower.png",
    "groom-flower.png",
    "index-flower.png",
    "rsvp-flower.png",
    "event-flower.png",
    "flower-top.png",
    "flower-bottom.png",
    "flower-left.png",
    "flower-right.png",
    "flower-corner.png",
    "corner.png",
    "corner-left.png",
    "corner-right.png",
    "event-bg.png",
    "rsvp-frame.png",
    "bg.jpg",
    "bg.png",
    "bg2.jpg",
    "bg3.jpg",
    "cover.jpg",
    "cover.png",
    "unlock.png",
    "unlock-hover.png",
    "map.png",
    "map-hover.png",
    "message.png",
    "gift.png",
    "gift-hover.png",
  ];

  const domainBases = [
    "https://kadio.id/images",
    "https://cdn.kadio.id/images",
  ];

  for (let i = 1; i <= 60; i++) {
    const codes = [`kdo${i}`, `kdo${i < 10 ? "0" + i : i}`];
    for (const kdoCode of codes) {
      let foundForCode = 0;
      for (const assetName of kdoAssetNames) {
        for (const dom of domainBases) {
          const testUrl = `${dom}/${kdoCode}/${assetName}`;
          const targetDir = path.join(BASE_OUT_DIR, "kdo-library", kdoCode);
          const targetFile = path.join(targetDir, assetName);

          if (fs.existsSync(targetFile) && fs.statSync(targetFile).size > 0) {
            foundForCode++;
            break;
          }

          const buf = await checkHeadOrGet(testUrl);
          if (buf && buf.length > 500) {
            ensureDir(targetDir);
            fs.writeFileSync(targetFile, buf);
            console.log(`   [FOUND ${kdoCode}] ${assetName} (${Math.round(buf.length / 1024)} KB)`);
            foundForCode++;
            if (!manifest.probedKdo[kdoCode]) manifest.probedKdo[kdoCode] = [];
            manifest.probedKdo[kdoCode].push(assetName);
            break;
          }
        }
      }
    }
  }

  // 4. Save manifest and README
  fs.writeFileSync(
    path.join(BASE_OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8"
  );

  const readme = `# 📁 Kadio.id Wedding Asset Library
> Sumber: \`https://kadio.id/daftar-design\` & \`https://kadio.id/images/kdo*\`  
> Diunduh: 11 September 2026

Direktori ini berisi seluruh aset ornamen grafis asli (bunga, pembatas/divider, bingkai foto/frame, dan background) dari seluruh template undangan Kadio.id.

---

## 📂 Struktur Berkas

### 1. \`kdo-library/\`
Koleksi ornamen per-kode template (\`kdo1\` s/d \`kdo60\`):
- \`divider.png\` — Pembatas section ornamental
- \`frame-bride.png\` — Bingkai foto mempelai wanita
- \`frame-groom.png\` — Bingkai foto mempelai pria
- \`bride-flower.png\` / \`index-flower.png\` — Ornamen bunga sudut/cover
- \`rsvp-frame.png\` / \`event-bg.png\` — Bingkai dekoratif kartu

### 2. \`themes/\`
Aset yang dikelompokkan berdasarkan nama tema publik dari 56 katalog Kadio:
- \`arctic-rose/\`
- \`ocean-rose/\`
- \`paper-letter/\`
- \`coffee-marble/\`
- \`iris-lotus/\`
- \`golden-luxe/\`
- ... dan 50 tema lainnya.

### 3. \`icons/\`
Ikon navigasi, peta, audio, dan lencana interaktif.
`;

  fs.writeFileSync(path.join(BASE_OUT_DIR, "README.md"), readme, "utf8");
  console.log("\n=== KADIO HARVEST COMPLETE ===");
  console.log(`Manifest & README written to: ${BASE_OUT_DIR}`);
}

main().catch(console.error);
