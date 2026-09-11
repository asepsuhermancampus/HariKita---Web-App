const fs = require("fs");
const path = require("path");

const KDO_LIB_DIR = path.resolve(__dirname, "../references/kadio-assets/kdo-library");

const targets = [
  "kdo17/divider.png",
  "kdo17/frame-bride.png",
  "kdo16/divider.png",
  "kdo4/bride-flower.png",
  "kdo10/frame.png"
];

// Let's use pngjs or read RGBA pixels
// Let's see if pngjs or Jimp or canvas is available, or write a lightweight pure-JS PNG decoder!
// Let's check if pngjs or jimp is in node_modules
let PNG;
try {
  PNG = require("pngjs").PNG;
  console.log("pngjs is available!");
} catch (e) {
  console.log("pngjs not installed");
}

let Jimp;
try {
  Jimp = require("jimp");
  console.log("jimp is available!");
} catch (e) {
  console.log("jimp not installed directly, checking @jimp/custom or potrace dependencies...");
}
