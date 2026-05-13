// One-shot generator: composites "AĒVUM" wordmark onto each background icon
// using @napi-rs/canvas with the bundled Inter Light OTF. The result is what
// iOS uses for the home-screen icon.
//
// Run via: npm run bake:icons
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = join(__dirname, '..', 'public', 'icons');
const FONT_PATH = join(__dirname, 'fonts', 'Inter-Light.otf');

if (!existsSync(FONT_PATH)) {
  console.error(`Font not found at ${FONT_PATH}`);
  process.exit(1);
}
GlobalFonts.registerFromPath(FONT_PATH, 'Inter');

const THEMES = ['slate', 'ivory', 'forest', 'smoke', 'dusk', 'ember'];
const TEXT = 'AĒVUM';

async function bakeOne(themeId) {
  const inputPath = join(ICONS_DIR, `icon-${themeId}.png`);
  const outPath = join(ICONS_DIR, `icon-${themeId}-mark.png`);

  const img = await loadImage(inputPath);
  const size = Math.max(img.width, img.height, 512);

  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background icon
  ctx.drawImage(img, 0, 0, size, size);

  // Text settings — Inter Light, scaled to icon size, with 0.26em letter-spacing
  const fontSize = Math.round(size * 0.14);
  ctx.font = `300 ${fontSize}px Inter`;
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Letter-spacing 0.26em via per-letter draw (canvas's `letterSpacing` is
  // not supported on every backend yet)
  const trackingPx = fontSize * 0.26;
  const letters = Array.from(TEXT);
  const widths = letters.map(L => ctx.measureText(L).width);
  const totalWidth = widths.reduce((a, b) => a + b, 0) + trackingPx * (letters.length - 1);
  let x = (size - totalWidth) / 2;
  const y = size / 2;

  // Drop shadow under the text for legibility on lighter regions
  ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
  ctx.shadowBlur = Math.round(size * 0.025);
  ctx.shadowOffsetY = Math.round(size * 0.014);

  ctx.textAlign = 'left';
  letters.forEach((L, i) => {
    ctx.fillText(L, x, y);
    x += widths[i] + trackingPx;
  });

  const buf = await canvas.encode('png');
  await writeFile(outPath, buf);
  console.log(`✓ baked ${outPath.split(/[\\/]/).pop()} (${size}×${size})`);
}

(async () => {
  for (const t of THEMES) {
    await bakeOne(t);
  }
  console.log('done.');
})().catch(e => { console.error(e); process.exit(1); });
