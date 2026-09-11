const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const { URL } = require("url");

const BASE_OUT_DIR = path.resolve(__dirname, "../references/awh-assets");

// Ensure directories
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(BASE_OUT_DIR);
ensureDir(path.join(BASE_OUT_DIR, "covers"));
ensureDir(path.join(BASE_OUT_DIR, "backgrounds"));
ensureDir(path.join(BASE_OUT_DIR, "ornaments"));
ensureDir(path.join(BASE_OUT_DIR, "icons"));

function fetchUrl(targetUrl) {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(targetUrl);
      const client = parsed.protocol === "https:" ? https : http;
      const req = client.get(
        targetUrl,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/*,*/*;q=0.8",
          },
          timeout: 20000,
        },
        (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            let redirectUrl = res.headers.location;
            if (!redirectUrl.startsWith("http")) {
              redirectUrl = new URL(redirectUrl, targetUrl).toString();
            }
            return resolve(fetchUrl(redirectUrl));
          }
          if (res.statusCode !== 200) {
            return reject(new Error(`HTTP ${res.statusCode} for ${targetUrl}`));
          }
          const chunks = [];
          res.on("data", (chunk) => chunks.push(chunk));
          res.on("end", () => resolve(Buffer.concat(chunks)));
        }
      );
      req.on("error", reject);
      req.on("timeout", () => {
        req.destroy();
        reject(new Error(`Timeout fetching ${targetUrl}`));
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function downloadFile(fileUrl, destPath) {
  try {
    if (fs.existsSync(destPath)) {
      const stat = fs.statSync(destPath);
      if (stat.size > 0) return true; // Already downloaded
    }
    const cleanUrl = fileUrl.replace(/\\/g, "/");
    const buf = await fetchUrl(cleanUrl);
    ensureDir(path.dirname(destPath));
    fs.writeFileSync(destPath, buf);
    return true;
  } catch (err) {
    console.error(`  [!] Failed download ${fileUrl}: ${err.message}`);
    return false;
  }
}

function sanitizeFilename(name) {
  return name.replace(/[<>:"/\\|?*#]+/g, "_").trim();
}

async function main() {
  console.log("=== STARTING AWH ASSET HARVESTER ===");
  console.log(`Target directory: ${BASE_OUT_DIR}`);

  const catalogUrl = "https://undangan.awh.co.id/select-theme?type=wedding&theme=lite";
  console.log(`1. Fetching catalogue from: ${catalogUrl}`);
  
  let catalogHtml = "";
  try {
    const catBuf = await fetchUrl(catalogUrl);
    catalogHtml = catBuf.toString("utf8");
  } catch (err) {
    console.error(`Failed to fetch catalog: ${err.message}`);
    return;
  }

  // Find theme covers and backgrounds
  // E.g. https://atlas.awh.co.id/awhp001/datamember/26/media-library/cover-lavenderhaven.png?v=17483082370381
  const mediaLibraryRegex = /https:\/\/atlas\.awh\.co\.id\/awhp001\/datamember\/26\/media-library\/([^"'?\s>]+)(?:\?[^"'\s>]*)?/gi;
  const catalogMedia = new Set();
  let m;
  while ((m = mediaLibraryRegex.exec(catalogHtml)) !== null) {
    catalogMedia.add(m[0]);
  }

  console.log(`Found ${catalogMedia.size} catalogue preview assets (covers/backgrounds).`);
  for (const mediaUrl of catalogMedia) {
    const rawName = path.basename(new URL(mediaUrl).pathname);
    const safeName = sanitizeFilename(rawName);
    let dest;
    if (safeName.startsWith("cover-")) {
      dest = path.join(BASE_OUT_DIR, "covers", safeName);
    } else if (safeName.startsWith("background-")) {
      dest = path.join(BASE_OUT_DIR, "backgrounds", safeName);
    } else {
      dest = path.join(BASE_OUT_DIR, "covers", safeName);
    }
    process.stdout.write(`Downloading ${safeName}... `);
    const ok = await downloadFile(mediaUrl, dest);
    console.log(ok ? "OK" : "SKIP");
  }

  // Extract demoCard URLs
  const demoUrlRegex = /demoCard\(['"]([^'"]+)['"]/g;
  const demoUrls = new Set();
  while ((m = demoUrlRegex.exec(catalogHtml)) !== null) {
    demoUrls.add(m[1]);
  }

  console.log(`\n2. Found ${demoUrls.size} demo wedding links to crawl for section ornaments:`);
  for (const u of demoUrls) {
    console.log(`   - ${u}`);
  }

  const manifest = {
    crawlDate: new Date().toISOString(),
    sourceCatalog: catalogUrl,
    themes: {},
  };

  for (const demoUrl of demoUrls) {
    // Extract theme slug: e.g. wedding-of-lavender-haven -> lavender-haven
    const urlObj = new URL(demoUrl);
    const themeSlug = urlObj.pathname.replace(/^\/wedding-of-/, "").replace(/^\//, "");
    console.log(`\n--- Crawling Theme: ${themeSlug} (${demoUrl}) ---`);

    let demoHtml = "";
    try {
      const demoBuf = await fetchUrl(demoUrl);
      demoHtml = demoBuf.toString("utf8");
    } catch (err) {
      console.error(`Failed to fetch ${demoUrl}: ${err.message}`);
      continue;
    }

    // Extract all image sources (img tag src and css url())
    const assetUrls = new Set();

    // 1. img src
    const imgSrcRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    while ((m = imgSrcRegex.exec(demoHtml)) !== null) {
      const src = m[1].trim();
      if (src && !src.startsWith("data:") && !src.includes("google") && !src.includes("facebook")) {
        assetUrls.add(src);
      }
    }

    // 2. background-image: url(...)
    const bgUrlRegex = /url\((['"]?)([^)'"\s]+)\1\)/gi;
    while ((m = bgUrlRegex.exec(demoHtml)) !== null) {
      const src = m[2].trim();
      if (src && !src.startsWith("data:") && !src.includes("google") && !src.includes("facebook")) {
        assetUrls.add(src);
      }
    }

    console.log(`Found ${assetUrls.size} media references in ${themeSlug}`);

    manifest.themes[themeSlug] = {
      demoUrl,
      assets: [],
    };

    const themeDir = path.join(BASE_OUT_DIR, "ornaments", themeSlug);
    ensureDir(themeDir);

    for (let assetUrl of assetUrls) {
      // Normalize URL
      if (!assetUrl.startsWith("http")) {
        if (assetUrl.startsWith("/")) {
          assetUrl = "https://undangan.awh.co.id" + assetUrl;
        } else {
          assetUrl = "https://undangan.awh.co.id/" + assetUrl;
        }
      }

      // Filter out user personal photos (mempelai / splash / slider photos) if we only want ornaments/templates
      // Or keep them in a clean manner
      const cleanPath = new URL(assetUrl).pathname;
      const rawFilename = path.basename(cleanPath);
      const safeFilename = sanitizeFilename(decodeURIComponent(rawFilename));

      // Categorize
      let targetPath;
      if (safeFilename.toLowerCase().includes("icon") || cleanPath.includes("icon_menu")) {
        targetPath = path.join(BASE_OUT_DIR, "icons", safeFilename);
      } else if (cleanPath.includes("grid_depan") || cleanPath.includes("grid_isi")) {
        // preserve grid subfolder
        const sub = cleanPath.includes("grid_depan") ? "grid_depan" : "grid_isi";
        targetPath = path.join(themeDir, sub, safeFilename);
      } else {
        targetPath = path.join(themeDir, safeFilename);
      }

      const ok = await downloadFile(assetUrl, targetPath);
      if (ok) {
        manifest.themes[themeSlug].assets.push({
          originalUrl: assetUrl,
          savedFile: path.relative(BASE_OUT_DIR, targetPath).replace(/\\/g, "/"),
        });
      }
    }
  }

  // Save manifest
  const manifestPath = path.join(BASE_OUT_DIR, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`\n=== HARVEST COMPLETE ===`);
  console.log(`Manifest written to: ${manifestPath}`);
}

main().catch(console.error);
