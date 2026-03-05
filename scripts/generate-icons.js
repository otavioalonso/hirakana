/**
 * Generate PWA icons as PNG files from the SVG template.
 * Run with: node scripts/generate-icons.js
 *
 * Uses a simple approach: creates a minimal PNG with the "あ" character
 * by rendering the SVG via a headless canvas (requires no external deps).
 *
 * Actually, since we can't use canvas in plain Node without deps,
 * we'll create a tiny HTML page that generates the PNGs and you
 * can open it in a browser to download them.
 *
 * ALTERNATIVE: We'll just embed base64-encoded PNGs directly.
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// Create a helper HTML that generates the icons in-browser
const html = `<!DOCTYPE html>
<html>
<head>
<style>
  body { background: #333; color: #fff; font-family: sans-serif; padding: 40px; }
  canvas { border: 1px solid #555; margin: 10px; }
  a { display: block; color: #22c55e; margin: 10px 0; }
</style>
</head>
<body>
<h2>Hirakana PWA Icon Generator</h2>
<p>Right-click each icon and "Save Image As" to public/ folder, or click the download links.</p>
<div id="icons"></div>
<script>
const sizes = [192, 512];
const container = document.getElementById('icons');

for (const size of sizes) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Background (no border radius)
  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 0, size, size);

  // Text
  ctx.fillStyle = '#22c55e';
  ctx.font = \`bold \${size * 0.5}px "Noto Sans JP", "Hiragino Sans", sans-serif\`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('あ', size / 2, size / 2 + size * 0.03);

  container.appendChild(canvas);

  // Download link
  const link = document.createElement('a');
  link.download = \`icon-\${size}.png\`;
  link.href = canvas.toDataURL('image/png');
  link.textContent = \`Download icon-\${size}.png\`;
  container.appendChild(link);
}
</script>
</body>
</html>`;

writeFileSync(join(publicDir, 'generate-icons.html'), html);
console.log('Created public/generate-icons.html');
console.log('Open it in a browser and download the PNG icons to public/');
