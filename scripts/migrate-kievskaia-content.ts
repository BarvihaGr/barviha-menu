/**
 * Одноразовая миграция текущих данных Киевской (packages/db/src/menu-generated.ts
 * + menu-photos.ts, GEN_ITEMS с ценой 'kievskaia') в редактируемый
 * content-store (packages/db/content/kievskaia/**). В отличие от Арки, Бар
 * тут — обычные CatalogItem (realm: 'bar'), а не шаблон секций/type1-2 —
 * Киевская использует свою обычную вёрстку (CoffeeMenuList), она не трогается,
 * меняется только источник данных (JSON вместо статичного TS-файла).
 *
 * Запуск: pnpm dlx tsx scripts/migrate-kievskaia-content.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { GEN_ITEMS } from '../packages/db/src/menu-generated';
import { PHOTOS } from '../packages/db/src/menu-photos';
import { MOCK_LOCATIONS } from '../packages/db/src/mock-data';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'packages/db/content/kievskaia');

function write(rel: string, data: unknown) {
  const full = join(CONTENT_DIR, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`wrote ${full}`);
}

for (const realm of ['kitchen', 'hookah', 'bar'] as const) {
  const items = GEN_ITEMS.filter((it) => it.realm === realm && it.prices['kievskaia'] != null).map((it) => ({
    id: it.id,
    realm,
    sub: it.sub,
    name: it.name,
    description: it.description,
    composition: it.composition,
    kbju: it.kbju,
    price: it.prices['kievskaia']!,
    photo: PHOTOS[it.id] ?? null,
    is_available: true,
  }));
  write(`${realm}.json`, items);
  console.log(`${realm}: ${items.length} позиций`);
}

const kievLoc = MOCK_LOCATIONS.find((l) => l.slug === 'kievskaia')!;
write('location.json', {
  address: kievLoc.address,
  phone: kievLoc.phone ?? null,
  is_active: true,
});

console.log('Готово.');
