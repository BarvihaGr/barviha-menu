/**
 * Разовая миграция контент-стора: одиночное поле photo/photo_position/
 * photo_transform у позиций Кухни, Кальянов и Бара Киевской (bar.json —
 * только у kievskaia/kievskaia-network, у остальных локаций там Бар-шаблон
 * Арки — ArkaMenuItem, эта миграция его не трогает) превращается в массив
 * photos: PhotoEntry[] (см. packages/db/src/types.ts).
 *
 * Запуск: node --experimental-strip-types scripts/migrate-photos.ts <путь-до-content>
 * Например (dev): node --experimental-strip-types scripts/migrate-photos.ts ../../packages/db/content
 * На сервере путь до content-store может отличаться — передаётся явно.
 *
 * Идемпотентна: позиции, у которых уже есть photos, пропускаются. Сначала
 * читает и валидирует всё в память, пишет только если все файлы успешно
 * распарсены — при ошибке падает до записи, ничего не мигрирует частично.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Единственные локации, у которых bar.json — плоский массив позиций
// (как kitchen.json/hookah.json), а не {sections, groupPhotos} шаблона
// Арки — см. packages/db/src/onboarding.ts KIEVSKAIA_STYLE_SLUGS.
const KIEVSKAIA_STYLE_SLUGS = new Set(['kievskaia', 'kievskaia-network']);

interface OldItem {
  photo?: string | null;
  photo_position?: { x: number; y: number } | null;
  photo_transform?: { zoom: number; rotate: 0 | 90 | 180 | 270; flipH: boolean; flipV: boolean } | null;
  photos?: unknown;
  [key: string]: unknown;
}

function migrateItem(it: OldItem): { changed: boolean; item: OldItem } {
  if (it.photos !== undefined) return { changed: false, item: it };
  const { photo, photo_position, photo_transform, ...rest } = it;
  const photos = photo
    ? [{ src: photo, position: photo_position ?? null, transform: photo_transform ?? null }]
    : [];
  return { changed: true, item: { ...rest, photos } };
}

function main() {
  const contentDir = process.argv[2];
  if (!contentDir) {
    console.error('Использование: node --experimental-strip-types migrate-photos.ts <путь-до-content>');
    process.exit(1);
  }

  const slugs = readdirSync(contentDir).filter((name) => statSync(join(contentDir, name)).isDirectory());

  type PendingWrite = { path: string; data: unknown };
  const pending: PendingWrite[] = [];
  let itemsConverted = 0;
  let itemsSkipped = 0;
  let filesTouched = 0;

  for (const slug of slugs) {
    const targets = ['kitchen.json', 'hookah.json', ...(KIEVSKAIA_STYLE_SLUGS.has(slug) ? ['bar.json'] : [])];
    for (const filename of targets) {
      const path = join(contentDir, slug, filename);
      let raw: string;
      try {
        raw = readFileSync(path, 'utf-8');
      } catch {
        continue; // файла нет у этой локации — нормально (не у всех есть, например, ещё не тронутые локации)
      }
      let items: OldItem[];
      try {
        items = JSON.parse(raw);
      } catch (err) {
        console.error(`Не смог распарсить ${path}: ${(err as Error).message}`);
        process.exit(1);
      }
      if (!Array.isArray(items)) {
        console.error(`Ожидался массив позиций в ${path}, получил другую структуру — пропускаю запись, прерываю.`);
        process.exit(1);
      }
      let fileChanged = false;
      const next = items.map((it) => {
        const { changed, item } = migrateItem(it);
        if (changed) {
          itemsConverted++;
          fileChanged = true;
        } else {
          itemsSkipped++;
        }
        return item;
      });
      if (fileChanged) {
        pending.push({ path, data: next });
        filesTouched++;
      }
    }
  }

  for (const { path, data } of pending) {
    writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  }

  console.log(
    `Готово: файлов изменено ${filesTouched}, позиций сконвертировано ${itemsConverted}, уже мигрировано/пропущено ${itemsSkipped}.`,
  );
}

main();
