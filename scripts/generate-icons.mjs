/**
 * Run with: node scripts/generate-icons.mjs
 * Requires: npm install -D sharp
 * Generates all PWA icon sizes from public/icons/icon.png
 */
import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcIcon = join(__dirname, '../public/icons/icon.png');
const outDir = join(__dirname, '../public/icons');

mkdirSync(outDir, { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

for (const size of sizes) {
  await sharp(srcIcon)
    .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(join(outDir, `icon-${size}x${size}.png`));
  console.log(`Generated icon-${size}x${size}.png`);
}

// Maskable icons (with safe zone padding ~10%)
const padding = (size) => Math.round(size * 0.1);
for (const size of [192, 512]) {
  const pad = padding(size);
  const innerSize = size - pad * 2;
  await sharp(srcIcon)
    .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 102, b: 255, alpha: 1 } })
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 102, b: 255, alpha: 1 } })
    .png()
    .toFile(join(outDir, `icon-maskable-${size}x${size}.png`));
  console.log(`Generated icon-maskable-${size}x${size}.png`);
}

console.log('All icons generated!');
