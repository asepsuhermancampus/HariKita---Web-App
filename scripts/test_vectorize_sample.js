const potrace = require("potrace");
const { optimize } = require("svgo");
const fs = require("fs");
const path = require("path");

const testFile = path.resolve(__dirname, "../references/kadio-assets/kdo-library/kdo17/divider.png");

console.log("Testing potrace on:", testFile);

const params = {
  optCurve: true,
  optTolerance: 0.2,
  turdSize: 2,
  color: "currentColor",
};

potrace.trace(testFile, params, (err, svg) => {
  if (err) {
    console.error("Error tracing:", err);
    return;
  }
  console.log("Raw SVG length:", svg.length);
  console.log("Raw SVG snippet (first 300 chars):");
  console.log(svg.slice(0, 300));

  // Test SVGO optimization
  const optimized = optimize(svg, {
    multipass: true,
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            removeViewBox: false,
          },
        },
      },
    ],
  });

  console.log("\nOptimized SVG length:", optimized.data.length);
  console.log("Optimized SVG snippet:");
  console.log(optimized.data.slice(0, 400));

  const outPath = path.resolve(__dirname, "../scratch/test_divider.svg");
  fs.writeFileSync(outPath, optimized.data, "utf8");
  console.log(`\nSaved to ${outPath}`);
});
