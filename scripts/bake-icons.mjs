// One-shot generator: composites "AĒVUM" wordmark onto each background icon
// and writes them out as -mark.png. The runtime app uses the original
// background-only PNGs (with an HTML/CSS overlay), but the iOS home-screen
// icon is a static raster so the text has to be baked in.
//
// Run via: npm run bake:icons
import sharp from 'sharp';
import { readdir, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = join(__dirname, '..', 'public', 'icons');
const OUT_DIR = ICONS_DIR;

const THEMES = ['slate', 'ivory', 'forest', 'smoke', 'dusk', 'ember'];

// Render the AĒVUM wordmark as an SVG. The text is rendered with `letter-spacing`
// equivalent to 0.26em via per-letter <tspan> dx, matching the in-app overlay.
// Letter widths approximate Inter Light at the chosen font-size.
function makeOverlaySvg(size) {
  const fontSize = Math.round(size * 0.14);          // 18px @ 128, ~71px @ 512
  const trackingEm = 0.26;
  const trackingPx = fontSize * trackingEm;
  const letters = ['A', 'Ē', 'V', 'U', 'M'];
  // Approximate widths for Inter Light at fontSize (em ratios per glyph)
  const widths = { A: 0.62, 'Ē': 0.52, V: 0.62, U: 0.58, M: 0.78 };
  const letterWidths = letters.map(L => widths[L] * fontSize);
  const totalText = letterWidths.reduce((a, b) => a + b, 0) + trackingPx * (letters.length - 1);
  const startX = (size - totalText) / 2;
  const baselineY = size / 2 + fontSize * 0.35;
  let x = startX;
  const tspans = letters.map((L, i) => {
    const span = `<tspan x="${(x).toFixed(2)}" y="${baselineY.toFixed(2)}">${L}</tspan>`;
    x += letterWidths[i] + trackingPx;
    return span;
  }).join('');
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <defs>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="${Math.round(size * 0.012)}" stdDeviation="${Math.max(2, Math.round(size * 0.02))}" flood-color="black" flood-opacity="0.45"/>
      </filter>
    </defs>
    <g font-family="Inter, -apple-system, system-ui, sans-serif" font-size="${fontSize}" font-weight="300" fill="white" filter="url(#shadow)">
      ${tspans}
    </g>
  </svg>`);
}

async function bakeOne(themeId) {
  const inputPath = join(ICONS_DIR, `icon-${themeId}.png`);
  const out512 = join(OUT_DIR, `icon-${themeId}-mark.png`);
  const buf = await readFile(inputPath);
  const meta = await sharp(buf).metadata();
  // Render at native resolution
  const size = Math.max(meta.width || 512, meta.height || 512);
  const resizedBuf = await sharp(buf).resize(size, size, { fit: 'cover' }).png().toBuffer();
  const overlay = makeOverlaySvg(size);
  await sharp(resizedBuf)
    .composite([{ input: overlay, blend: 'over' }])
    .png()
    .toFile(out512);
  console.log(`✓ baked icon-${themeId}-mark.png (${size}×${size})`);
}

(async () => {
  for (const t of THEMES) {
    await bakeOne(t);
  }
  console.log('done.');
})().catch(e => { console.error(e); process.exit(1); });
