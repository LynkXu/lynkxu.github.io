/**
 * 批量压缩 public/ 目录下的图片
 * 用法: node scripts/compress-images.mjs
 * 仅压缩大于 200KB 的 JPEG/PNG，使用 sharp Node API
 */
import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';

const TARGET_DIRS = ['public/blog', 'public'];
const MIN_SIZE_BYTES = 200 * 1024; // 200KB
const JPEG_QUALITY = 82;
const MAX_WIDTH = 1400; // 限制最大宽度，避免超大图

async function getImageFiles(dir) {
  const files = [];
  async function walk(current) {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (/\.(jpe?g|png)$/i.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }
  await walk(dir);
  return files;
}

async function compress(file) {
  const info = await stat(file);
  if (info.size < MIN_SIZE_BYTES) {
    console.log(`⏭️  Skip (under 200KB): ${file}`);
    return;
  }

  const ext = extname(file).toLowerCase();
  const originalSize = (info.size / 1024).toFixed(1);

  try {
    const pipeline = sharp(file);
    const metadata = await pipeline.metadata();

    // Resize if too wide
    if (metadata.width && metadata.width > MAX_WIDTH) {
      pipeline.resize(MAX_WIDTH, undefined, { withoutEnlargement: true });
    }

    if (ext === '.png') {
      await pipeline.png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(file + '.tmp');
    } else {
      await pipeline.jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true }).toFile(file + '.tmp');
    }

    const newInfo = await stat(file + '.tmp');
    const newSize = (newInfo.size / 1024).toFixed(1);

    if (newInfo.size < info.size) {
      await import('fs/promises').then(({ rename }) => rename(file + '.tmp', file));
      console.log(`✅ ${file} — ${originalSize}KB → ${newSize}KB`);
    } else {
      await import('fs/promises').then(({ unlink }) => unlink(file + '.tmp'));
      console.log(`⏭️  Skip (no reduction): ${file} (${originalSize}KB)`);
    }
  } catch (err) {
    console.error(`❌ Failed: ${file} — ${err.message}`);
    try {
      await import('fs/promises').then(({ unlink }) => unlink(file + '.tmp'));
    } catch {}
  }
}

async function main() {
  console.log('🖼️  Compressing images...\n');
  const allFiles = [];
  for (const dir of TARGET_DIRS) {
    try {
      const files = await getImageFiles(dir);
      allFiles.push(...files);
    } catch (e) {
      // ignore missing dirs
    }
  }

  for (const file of allFiles) {
    await compress(file);
  }
  console.log('\n🎉 Done!');
}

main();
