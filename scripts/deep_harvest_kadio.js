const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { URL } = require("url");

const OUT_DIR = path.resolve(__dirname, "../references/kadio-assets/harvested");
const EXISTING_DIR = path.resolve(__dirname, "../references/kadio-assets");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(OUT_DIR);

function fetch(targetUrl) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(targetUrl);
      const client = parsed.protocol === "https:" ? https : http;
      const req = client.get(
        targetUrl,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
            Accept: "*/*",
          },
          timeout: 15000,
        },
        (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            let redirect = res.headers.location;
            if (!redirect.startsWith("http")) {
              redirect = new URL(redirect, targetUrl).toString();
            }
            return resolve(fetch(redirect));
          }
          if (res.statusCode !== 200) {
            res.resume();
            return resolve(null);
          }
          const chunks = [];
          res.on("data", (chunk) => chunks.push(chunk));
          res.on("end", () => resolve(Buffer.concat(chunks)));
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

function computeHash(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*#%]+/g, "_").trim();
}

// Index existing files to prevent duplicates
const existingHashes = new Set();
const existingNames = new Set();

function indexExisting(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    if (item === "harvested") continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      indexExisting(full);
    } else {
      existingNames.add(item.toLowerCase());
      try {
        const buf = fs.readFileSync(full);
        if (buf.length > 0) existingHashes.add(computeHash(buf));
      } catch {}
    }
  }
}

indexExisting(EXISTING_DIR);
console.log(`Indexed existing assets: ${existingNames.size} names, ${existingHashes.size} unique hashes.`);

async function run() {
  console.log("=== STEP 1: FETCHING DEMO URLS FROM DAFTAR-DESIGN ===");
  const catalogBuf = await fetch("https://kadio.id/daftar-design");
  if (!catalogBuf) {
    console.error("Failed to fetch daftar-design!");
    return;
  }
  const catalogHtml = catalogBuf.toString("utf8");
  const demoRegex = /href=["'](https:\/\/kadio\.id\/demo\/[^"']+|\/demo\/[^"']+)["']/gi;
  let m;
  const demos = [];
  while ((m = demoRegex.exec(catalogHtml)) !== null) {
    demos.push(m[1].startsWith("http") ? m[1] : "https://kadio.id" + m[1]);
  }
  const uniqueDemos = Array.from(new Set(demos));
  console.log(`Found ${uniqueDemos.length} demo themes.\n`);

  console.log("=== STEP 2: DEEP CRAWL ALL DEMOS (HTML + CSS BACKGROUNDS) ===");
  const allCandidateUrls = new Map(); // url -> { theme, source }

  for (let i = 0; i < uniqueDemos.length; i++) {
    const demoUrl = uniqueDemos[i];
    const slug = demoUrl.split("/").pop();
    process.stdout.write(`[${i + 1}/${uniqueDemos.length}] Scanning demo: ${slug}... `);

    const demoBuf = await fetch(demoUrl);
    if (!demoBuf) {
      console.log("failed to load HTML");
      continue;
    }
    const html = demoBuf.toString("utf8");

    // 1. Extract CSS links
    const cssRegex = /href=["']([^"']+\.css[^"']*)["']/gi;
    const cssUrls = [];
    let cm;
    while ((cm = cssRegex.exec(html)) !== null) {
      let u = cm[1];
      if (u.startsWith("//")) u = "https:" + u;
      else if (u.startsWith("/")) u = "https://kadio.id" + u;
      if (u.startsWith("http")) cssUrls.push(u);
    }

    // Also look for template kdo*.css specifically
    const kdoCssMatch = html.match(/\/css\/template\/[^"']+/g) || [];
    kdoCssMatch.forEach((k) => {
      cssUrls.push(k.startsWith("http") ? k : "https://kadio.id" + k);
    });

    const uniqueCss = Array.from(new Set(cssUrls));

    // 2. Extract media from HTML
    const htmlMediaRegex = /(?:src=["']|url\(['"]?)([^"'\)\s]+)/gi;
    let hm;
    let htmlFound = 0;
    while ((hm = htmlMediaRegex.exec(html)) !== null) {
      let u = hm[1];
      if (u.startsWith("//")) u = "https:" + u;
      else if (u.startsWith("/")) u = "https://kadio.id" + u;
      if (u.startsWith("http")) {
        allCandidateUrls.set(u, { theme: slug, source: "html" });
        htmlFound++;
      }
    }

    // 3. Extract media from each CSS
    let cssFound = 0;
    for (const cssUrl of uniqueCss) {
      const cssBuf = await fetch(cssUrl);
      if (!cssBuf) continue;
      const cssText = cssBuf.toString("utf8");
      const urlRegex = /url\(['"]?([^'"\)\s]+)['"]?\)/gi;
      let um;
      while ((um = urlRegex.exec(cssText)) !== null) {
        let raw = um[1];
        if (raw.startsWith("data:")) continue;
        let resolved;
        if (raw.startsWith("http")) {
          resolved = raw;
        } else if (raw.startsWith("//")) {
          resolved = "https:" + raw;
        } else if (raw.startsWith("/")) {
          resolved = "https://kadio.id" + raw;
        } else {
          // relative to css url
          try {
            resolved = new URL(raw, cssUrl).toString();
          } catch {
            resolved = "https://kadio.id/" + raw.replace(/^\.\.\//, "");
          }
        }
        allCandidateUrls.set(resolved, { theme: slug, source: "css" });
        cssFound++;
      }
    }

    console.log(`found ${htmlFound} HTML links, ${cssFound} CSS links from ${uniqueCss.length} stylesheets`);
  }

  console.log(`\nTotal Candidate Media URLs Collected: ${allCandidateUrls.size}\n`);

  console.log("=== STEP 3: FILTERING ORNAMENTS & DOWNLOADING MISSING ASSETS ===");
  const downloadedAssets = [];
  const skippedExisting = [];
  const filteredOut = [];

  let count = 0;
  for (const [rawUrl, meta] of allCandidateUrls.entries()) {
    count++;
    const cleanUrl = rawUrl.split("?")[0];
    const ext = path.extname(cleanUrl).toLowerCase();
    if (![".png", ".svg", ".jpg", ".jpeg", ".webp"].includes(ext)) {
      continue;
    }

    const baseName = path.basename(cleanUrl);
    const safeName = sanitizeFilename(decodeURIComponent(baseName));

    // Exclude personal couple photos, user galleries, and non-ornamental items
    const isPersonalPhoto =
      /bride16|bride\d+|groom|\/upload\/\d+\/|g-\d+\.jpg|gallery|foto|photo|notfound|double-quotes|logo-new|user|avatar|profile/i.test(
        cleanUrl
      );
    const isGenericIcon =
      /icon-play|icon-pause|icons8-copy|prokes|splide|toastify|alertify|bg-wave/i.test(
        safeName
      );

    if (isPersonalPhoto || isGenericIcon) {
      filteredOut.push({ url: rawUrl, reason: "personal/generic" });
      continue;
    }

    // Must be an ornament, flower, leaf, border, frame, lace, divider, or template asset
    const isOrnament =
      /flower|bunga|ornament|leaf|daun|divider|frame|bingkai|kdo\d+|bg-flower|splash|border|pattern|lace|cover|back|story|memp|decor/i.test(
        cleanUrl
      ) ||
      cleanUrl.includes("/kdo") ||
      cleanUrl.includes("/images/template/") ||
      cleanUrl.includes("/images/kdo");

    if (!isOrnament) {
      filteredOut.push({ url: rawUrl, reason: "not-ornament" });
      continue;
    }

    // Check if filename already exists
    if (existingNames.has(safeName.toLowerCase())) {
      skippedExisting.push({ name: safeName, url: rawUrl, reason: "name-match" });
      continue;
    }

    // Download buffer
    const buf = await fetch(rawUrl);
    if (!buf || buf.length < 200) {
      continue;
    }

    // Check if hash already exists
    const hash = computeHash(buf);
    if (existingHashes.has(hash)) {
      skippedExisting.push({ name: safeName, url: rawUrl, reason: "hash-match" });
      continue;
    }

    // Save newly discovered unique asset!
    const targetFile = path.join(OUT_DIR, safeName);
    fs.writeFileSync(targetFile, buf);
    existingNames.add(safeName.toLowerCase());
    existingHashes.add(hash);

    downloadedAssets.push({
      name: safeName,
      theme: meta.theme,
      source: meta.source,
      sizeKb: (buf.length / 1024).toFixed(1),
      ext,
      url: rawUrl,
    });

    console.log(`  [NEW DOWNLOADED] ${safeName} (${(buf.length / 1024).toFixed(1)} KB) from ${meta.theme} [${meta.source}]`);
  }

  console.log("\n=== HARVEST SUMMARY ===");
  console.log(`  - Total Candidates Examined: ${allCandidateUrls.size}`);
  console.log(`  - Filtered Out (Photos/Generic): ${filteredOut.length}`);
  console.log(`  - Skipped (Already in Local Repo): ${skippedExisting.length}`);
  console.log(`  - Newly Harvested & Downloaded: ${downloadedAssets.length}`);

  // Save metadata
  fs.writeFileSync(
    path.join(OUT_DIR, "harvested_manifest.json"),
    JSON.stringify(downloadedAssets, null, 2),
    "utf8"
  );
  console.log(`Saved harvested_manifest.json with ${downloadedAssets.length} new items.`);
}

run().catch((err) => {
  console.error("Harvest error:", err);
  process.exit(1);
});
