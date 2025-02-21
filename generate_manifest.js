const fs = require('fs');
const path = require('path');

// Define the public directory and the raw files directory.
const publicDir = path.join(__dirname, 'sydocapp', 'public');
const rawDir = path.join(publicDir, 'docs_raw');
const manifestPath = path.join(publicDir, 'docs_manifest.json');

// Recursively build a manifest based on the raw files folder.
function buildManifest(dir, baseDir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  let manifest = {};
  items.forEach(item => {
    const fullPath = path.join(dir, item.name);
    // Compute the relative path within the raw folder.
    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
    if (item.isDirectory()) {
      // Recurse into subdirectories.
      manifest[item.name] = buildManifest(fullPath, baseDir);
    } else if (item.isFile()) {
      const ext = path.extname(item.name);
      const baseName = path.basename(item.name, ext);
      // Compute the HTML path by replacing the original extension with .html.
      // The HTML files are stored in docs_html preserving the same relative path but with .html extension.
      const htmlRelativePath = relativePath.replace(ext, '.html');
      manifest[baseName] = {
        html: `docs_html/${htmlRelativePath}`,
        raw: `docs_raw/${relativePath}`
      };
    }
  });
  return manifest;
}

const manifest = buildManifest(rawDir, rawDir);
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Manifest generated at ${manifestPath}`);
