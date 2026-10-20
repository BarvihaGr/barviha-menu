#!/usr/bin/env node
// Уменьшенные копии `<файл>.w720.webp` и `<файл>.w1200.webp` для всех фото меню (см. apps/menu/src/lib/thumb.ts).
// Идемпотентно: делает только отсутствующие или устаревшие превью.
// sharp есть только у apps/hub, поэтому запускать из его папки:
//   cd /var/www/barviha-app/apps/hub && nice -n 19 node ../../deploy/thumbs/make-thumbs.mjs ../menu/public
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(join(process.cwd(), 'package.json'));
const sharp = require('sharp');
sharp.cache(false);
sharp.concurrency(1);

const root = process.argv[2];
if (!root) { console.error('usage: make-thumbs.mjs <apps/menu/public>'); process.exit(2); }
const DIRS = ['menu-admin', 'menu', 'arka-bar'];
const SIZES = [[720, '.w720.webp', 78], [1200, '.w1200.webp', 80]];
const IMG = /\.(webp|jpe?g|png)$/i;

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) yield* walk(p);
    else yield [p, st];
  }
}

let made = 0, skipped = 0, failed = 0;
for (const d of DIRS) {
  const dir = join(root, d);
  if (!existsSync(dir)) continue;
  for (const [file, st] of walk(dir)) {
    if (/\.w\d+\.webp$/.test(file) || !IMG.test(file)) continue;
    for (const [width, suffix, quality] of SIZES) {
      const thumb = file + suffix;
      if (existsSync(thumb) && statSync(thumb).mtimeMs >= st.mtimeMs) { skipped++; continue; }
      try {
        await sharp(file).rotate().resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(thumb);
        made++;
      } catch (e) {
        failed++; console.error(`не вышло: ${file}: ${e.message}`);
      }
    }
  }
}
console.log(`[thumbs] сделано ${made}, уже были ${skipped}, ошибок ${failed}`);
