import sharp from 'sharp';
import { stat, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, 'src', 'assets');

// Push the stubborn ones harder — resize to max 800px wide + very low quality
const stubborn = [
  { src: 'fabric8.jpeg',  dest: 'fabric8.webp',  quality: 40, maxW: 800 },
  { src: 'fabric9.jpeg',  dest: 'fabric9.webp',  quality: 38, maxW: 800 },
  { src: 'fabric10.jpeg', dest: 'fabric10.webp', quality: 38, maxW: 800 },
  { src: 'fabric13.jpeg', dest: 'fabric13.webp', quality: 42, maxW: 800 },
];

function kb(bytes) { return (bytes / 1024).toFixed(1) + ' KB'; }

async function finalPass() {
  console.log('💪 Final aggressive pass...\n');
  for (const { src, dest, quality, maxW } of stubborn) {
    const inputPath  = path.join(assetsDir, src);
    const outputPath = path.join(assetsDir, dest);
    try {
      const origStat = await stat(inputPath);
      const buf = await sharp(inputPath)
        .resize({ width: maxW, withoutEnlargement: true })
        .webp({ quality, effort: 6 })
        .toBuffer();
      await writeFile(outputPath, buf);
      const afterStat = await stat(outputPath);
      const saved = (((origStat.size - afterStat.size) / origStat.size) * 100).toFixed(0);
      const status = afterStat.size > 150 * 1024 ? '⚠️ ' : '✅';
      console.log(`${status} ${src.padEnd(15)} ${kb(origStat.size).padStart(10)} → ${kb(afterStat.size).padStart(10)}   (${saved}% vs original)`);
    } catch (err) {
      console.error(`❌ ${src}: ${err.message}`);
    }
  }
  console.log('\n✅ Final pass done!');
}

finalPass();
