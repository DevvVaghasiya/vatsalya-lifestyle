import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, 'src', 'assets');

// Images to convert with their quality settings
const images = [
  // Fabric images — quality 75 for good balance
  { file: 'fabric.jpeg',   quality: 75 },
  { file: 'fabric2.jpeg',  quality: 75 },
  { file: 'fabric3.jpeg',  quality: 75 },
  { file: 'fabric4.jpeg',  quality: 75 },
  { file: 'fabric5.jpeg',  quality: 75 },
  { file: 'fabric6.jpeg',  quality: 75 },
  { file: 'fabric7.jpeg',  quality: 75 },
  { file: 'fabric8.jpeg',  quality: 75 },
  { file: 'fabric9.jpeg',  quality: 75 },
  { file: 'fabric10.jpeg', quality: 75 },
  { file: 'fabric11.jpeg', quality: 75 },
  { file: 'fabric12.jpeg', quality: 75 },
  { file: 'fabric13.jpeg', quality: 75 },
  { file: 'fabric14.jpeg', quality: 75 },
  { file: 'fabric15.jpeg', quality: 75 },
  { file: 'fabric16.jpeg', quality: 75 },
  // Logo & background — slightly higher quality
  { file: 'logo3.png',       quality: 85 },
  { file: 'dashboard-bg.png', quality: 72 },
  { file: 'logo.jpeg',        quality: 80 },
  { file: 'logo2.jpeg',       quality: 80 },
];

function kb(bytes) {
  return (bytes / 1024).toFixed(1) + ' KB';
}

async function convert() {
  console.log('🚀 Converting images to WebP...\n');
  let totalBefore = 0, totalAfter = 0;

  for (const { file, quality } of images) {
    const input = path.join(assetsDir, file);
    const outName = file.replace(/\.(jpeg|jpg|png)$/, '.webp');
    const output = path.join(assetsDir, outName);

    try {
      const beforeStat = await stat(input);
      totalBefore += beforeStat.size;

      await sharp(input)
        .webp({ quality, effort: 6 })
        .toFile(output);

      const afterStat = await stat(output);
      totalAfter += afterStat.size;

      const saved = (((beforeStat.size - afterStat.size) / beforeStat.size) * 100).toFixed(0);
      const status = afterStat.size > 150 * 1024 ? '⚠️ ' : '✅';
      console.log(`${status} ${file.padEnd(20)} ${kb(beforeStat.size).padStart(10)} → ${kb(afterStat.size).padStart(10)}   (${saved}% saved)`);
    } catch (err) {
      console.error(`❌ Failed: ${file} — ${err.message}`);
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`📦 Total before: ${kb(totalBefore)}`);
  console.log(`📦 Total after:  ${kb(totalAfter)}`);
  console.log(`💾 Total saved:  ${kb(totalBefore - totalAfter)} (${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(0)}%)`);
  console.log('\n✅ Done! Update your imports in Dashboard.jsx to use .webp files.');
}

convert();
