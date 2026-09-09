import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import manifest from "../src/app/manifest";

test("PWA Manifest route returns compliant Web App Manifest", () => {
  const data = manifest();

  assert.equal(typeof data, "object");
  assert.ok(data.name?.includes("HariKita"));
  assert.equal(data.short_name, "HariKita");
  assert.equal(data.start_url, "/");
  assert.equal(data.display, "standalone");
  assert.equal(data.background_color, "#FAF8F5");
  assert.equal(data.theme_color, "#FAF8F5");

  // Verify icons
  assert.ok(Array.isArray(data.icons));
  assert.ok(data.icons.length >= 3);

  const icon192 = data.icons.find((i) => i.sizes === "192x192");
  assert.ok(icon192, "Icon 192x192 must exist");
  assert.equal(icon192?.src, "/icons/icon-192x192.png");

  const icon512 = data.icons.find((i) => i.sizes === "512x512" && !i.purpose);
  assert.ok(icon512, "Icon 512x512 standard must exist");

  const iconMaskable = data.icons.find(
    (i) => i.sizes === "512x512" && i.purpose === "maskable"
  );
  assert.ok(iconMaskable, "Maskable icon 512x512 must exist");
});

test("PWA static fallback and service worker files exist in public directory", () => {
  const publicDir = path.resolve(__dirname, "../public");

  // 1. Check manifest.json
  const manifestPath = path.join(publicDir, "manifest.json");
  assert.ok(fs.existsSync(manifestPath), "public/manifest.json must exist");
  const rawJson = fs.readFileSync(manifestPath, "utf-8");
  const parsed = JSON.parse(rawJson);
  assert.equal(parsed.short_name, "HariKita");
  assert.equal(parsed.display, "standalone");

  // 2. Check sw.js
  const swPath = path.join(publicDir, "sw.js");
  assert.ok(fs.existsSync(swPath), "public/sw.js must exist");
  const swContent = fs.readFileSync(swPath, "utf-8");
  assert.ok(swContent.includes("CACHE_NAME"));
  assert.ok(swContent.includes("skipWaiting"));

  // 3. Check icon files
  const icons = [
    "icons/icon-192x192.png",
    "icons/icon-512x512.png",
    "icons/icon-maskable.png",
    "icons/apple-touch-icon.png",
    "favicon.ico",
  ];

  for (const icon of icons) {
    const iconPath = path.join(publicDir, icon);
    assert.ok(fs.existsSync(iconPath), `${icon} must exist in public directory`);
    const stat = fs.statSync(iconPath);
    assert.ok(stat.size > 0, `${icon} must not be empty`);
  }
});
