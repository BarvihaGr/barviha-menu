/**
 * Клонирует контент Арки (content/arka/*) на все 25 «рабочих» локаций сети
 * (WORKING_SLUGS = все локации из mock-data, кроме шаблонов arka/kievskaia).
 * Каждая получает свою независимую копию — дальше редактируется в панели
 * отдельно от остальных (id позиций совпадают с Аркой намеренно, это просто
 * стартовый снимок одного и того же шаблона).
 *
 * Запуск: pnpm dlx tsx scripts/clone-arka-to-locations.ts
 * Идемпотентно: НЕ перезаписывает уже существующие content/<slug>/* — чтобы
 * повторный запуск не затирал правки, сделанные в панели. Чтобы пересоздать
 * локацию с нуля, удалите её папку в packages/db/content/ вручную.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { WORKING_SLUGS } from '../packages/db/src/onboarding';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'packages/db/content');
const ARKA_DIR = join(CONTENT_DIR, 'arka');

const FILES = ['bar.json', 'kitchen.json', 'hookah.json'] as const;

let created = 0;
let skipped = 0;

for (const slug of WORKING_SLUGS) {
  const dir = join(CONTENT_DIR, slug);
  mkdirSync(dir, { recursive: true });

  for (const file of FILES) {
    const dest = join(dir, file);
    if (existsSync(dest)) {
      skipped++;
      continue;
    }
    const src = readFileSync(join(ARKA_DIR, file), 'utf-8');
    writeFileSync(dest, src, 'utf-8');
    created++;
  }

  const locFile = join(dir, 'location.json');
  if (!existsSync(locFile)) {
    writeFileSync(
      locFile,
      JSON.stringify({ address: null, phone: null, is_active: true }, null, 2) + '\n',
      'utf-8',
    );
    created++;
  } else {
    skipped++;
  }
}

console.log(`Готово: ${WORKING_SLUGS.length} локаций, создано файлов: ${created}, пропущено (уже есть): ${skipped}`);
