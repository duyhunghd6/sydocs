const fs = require('fs');
const path = require('path');

// Define the public directory and the raw files directory.
const publicDir = path.join(__dirname, 'sydocapp', 'public');
const rawDir = path.join(publicDir, 'docs_raw');
const manifestPath = path.join(publicDir, 'docs_manifest.json');

// Updated generateFriendly function with explicit Vietnamese character mapping.
function generateFriendly(name) {
  const vietMap = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    'đ': 'd', 'Đ': 'd'
  };
  // Replace Vietnamese characters using the mapping.
  name = name.split('').map(ch => vietMap[ch] || ch).join('');
  // Normalize any residual combined marks, convert to lowercase, and replace non-alphanumerics with dashes.
  let friendly = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  friendly = friendly.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return friendly;
}

// Recursively build a manifest based on the raw files folder.
function buildManifest(dir, baseDir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  let manifest = {};
  items.forEach(item => {
    // Skip hidden files and directories
    if (item.name.startsWith('.')) return;
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
      const htmlRelativePath = relativePath.replace(ext, '.html');
      // Compute friendly_url including parent folders.
      const dirPart = path.dirname(relativePath);
      let friendlyDir = '';
      if (dirPart && dirPart !== '.') {
        friendlyDir = dirPart.split('/').map(segment => generateFriendly(segment)).join('/');
      }
      const friendlyFile = generateFriendly(baseName);
      const friendly_url = friendlyDir ? `${friendlyDir}/${friendlyFile}` : friendlyFile;
      manifest[baseName] = {
        html_url: `docs_html/${htmlRelativePath}`,
        raw_url: `docs_raw/${relativePath}`,
        friendly_url: friendly_url
      };
    }
  });
  return manifest;
}

const manifest = buildManifest(rawDir, rawDir);
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Manifest generated at ${manifestPath}`);
