import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const pencilPath =
  "M15.232 5.232l3.536 3.536-9.9 9.9-4.242.707.707-4.243 9.9-9.9zm1.414-1.414l1.415-1.414a2 2 0 012.828 0l.707.707a2 2 0 010 2.828l-1.414 1.414-3.536-3.535z";

// Build an SVG with purple gradient background + white pencil
function buildFullIconSvg(size) {
  const r = Math.round(size * 0.2);
  const pencilScale = (size * 0.6) / 24;
  const pencilOffset = size * 0.2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#9a82bb"/>
      <stop offset="50%" stop-color="#7a5ea0"/>
      <stop offset="100%" stop-color="#654d87"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#bg)"/>
  <g transform="translate(${pencilOffset}, ${pencilOffset}) scale(${pencilScale})">
    <path d="${pencilPath}" fill="white" stroke="none"/>
  </g>
</svg>`;
}

async function generate(svgString, outputPath, size) {
  const buffer = Buffer.from(svgString);
  await sharp(buffer).resize(size, size).png().toFile(outputPath);
  console.log(`  Created: ${path.relative(ROOT, outputPath)} (${size}x${size})`);
}

async function main() {
  console.log("Generating PWA icons...\n");

  await generate(
    buildFullIconSvg(192),
    path.join(ROOT, "public/icon-192.png"),
    192
  );

  await generate(
    buildFullIconSvg(512),
    path.join(ROOT, "public/icon-512.png"),
    512
  );

  console.log("\nDone! All icons generated.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
