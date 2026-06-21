import sharp from 'sharp';
import { existsSync, mkdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outputDir = join(root, 'public', 'landing', 'optimized');

const WIDTH = 600;
const QUALITY = 80;

const images = [
  { input: 'public/landing/scroll-robot.png', output: 'scroll-robot.webp' },
  { input: 'public/landing/scroll-dragon.png', output: 'scroll-dragon.webp' },
  { input: 'public/landing/scroll-treehouse.png', output: 'scroll-treehouse.webp' },
  { input: 'public/landing/scroll-mammoth.jpg', output: 'scroll-mammoth.webp' },
  { input: 'public/landing/hello-kitty-stars.png', output: 'hello-kitty-stars.webp' },
  { input: 'public/landing/astronaut-on-moon.png', output: 'astronaut-on-moon.webp' },
  { input: 'public/landing/mermaid-with-dolphins.png', output: 'mermaid-with-dolphins.webp' },
  { input: 'public/landing/baby-dragon-in-garden.png', output: 'baby-dragon-in-garden.webp' },
  { input: 'public/landing/bunny-with-carrot.png', output: 'bunny-with-carrot.webp' },
  { input: 'public/landing/puppy-in-garden.png', output: 'puppy-in-garden.webp' },
  { input: 'public/landing/dinosaur-reading-book.png', output: 'dinosaur-reading-book.webp' },
  { input: 'public/landing/teddy-bear-picnic.png', output: 'teddy-bear-picnic.webp' },
  { input: 'public/landing/forest-exploration.jpg', output: 'forest-exploration.webp' },
  { input: 'public/landing/forest-deep-woods.jpg', output: 'forest-deep-woods.webp' },
  { input: 'public/landing/space-rocket.jpg', output: 'space-rocket.webp' },
  { input: 'public/landing/space-planets.jpg', output: 'space-planets.webp' },
  { input: 'public/landing/farm-horse.jpg', output: 'farm-horse.webp' },
  { input: 'public/landing/farm-rooster.jpg', output: 'farm-rooster.webp' },
  { input: 'public/landing/superhero-1.jpg', output: 'superhero-1.webp' },
  { input: 'public/landing/superhero-2.jpg', output: 'superhero-2.webp' },
  { input: 'public/landing/sea-dolphin.jpg', output: 'sea-dolphin.webp' },
  { input: 'public/landing/sea-animals.jpg', output: 'sea-animals.webp' },
];

mkdirSync(outputDir, { recursive: true });

let skipped = 0;
let generated = 0;

for (const { input, output } of images) {
  const inputPath = join(root, input);
  const outputPath = join(outputDir, output);

  if (existsSync(outputPath)) {
    const inputMtime = statSync(inputPath).mtimeMs;
    const outputMtime = statSync(outputPath).mtimeMs;
    if (outputMtime >= inputMtime - 1000) {
      skipped++;
      continue;
    }
  }

  await sharp(inputPath)
    .resize(WIDTH)
    .webp({ quality: QUALITY })
    .toFile(outputPath);

  generated++;
}

console.log(`Landing images: ${generated} generated, ${skipped} skipped (up-to-date)`);
