// Adapted from the oficial Alpine.js file:
// https://github.com/alpinejs/alpine/blob/main/scripts/build.js

let fs = require("fs");
let zlib = require("zlib");

bundle();

function bundle() {
  // Give esbuild specific configurations to build.

  // This output file is meant to be loaded in a browser's <script> tag.
  build({
    entryPoints: ["builds/cdn.js"],
    outfile: "dist/cdn.js",
    bundle: true,
    platform: "browser",
    define: { CDN: "true" },
  });

  // Build a minified version.
  build({
    entryPoints: ["builds/cdn.js"],
    outfile: "dist/cdn.min.js",
    bundle: true,
    minify: true,
    platform: "browser",
    define: { CDN: "true" },
  }).then(() => {
    outputSize("dist/cdn.min.js");
  });

  // Then output two files: an esm module and a cjs module.
  // The ESM one is meant for "import" statements (bundlers and new browsers)
  // and the cjs one is meant for "require" statements (node).
  build({
    entryPoints: ["builds/module.js"],
    outfile: "dist/module.esm.js",
    bundle: true,
    platform: "neutral",
    mainFields: ["module", "main"],
  });

  build({
    entryPoints: ["builds/module.js"],
    outfile: "dist/module.cjs.js",
    bundle: true,
    target: ["node10.4"],
    platform: "node",
  });
}

function build(options) {
  options.define || (options.define = {});
  options.define["process.env.NODE_ENV"] = process.argv.includes("--watch")
    ? `'production'`
    : `'development'`;

  return require("esbuild")
    .build({
      watch: process.argv.includes("--watch"),
      // external: ['alpinejs'],
      ...options,
    })
    .catch(() => process.exit(1));
}

function outputSize(file) {
  let size = bytesToSize(zlib.brotliCompressSync(fs.readFileSync(file)).length);

  console.log("\x1b[32m", `${file}: ${size}`);
}

function bytesToSize(bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "n/a";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  if (i === 0) return `${bytes} ${sizes[i]}`;
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
}
