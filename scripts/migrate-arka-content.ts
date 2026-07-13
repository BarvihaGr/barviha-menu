/**
 * Одноразовая миграция текущих статических данных Арки в редактируемый
 * content-store (packages/db/content/arka/**). Запуск:
 *   pnpm dlx tsx scripts/migrate-arka-content.ts
 *
 * Источники (не трогаются, остаются в репо как есть):
 *  - apps/menu/src/lib/arka-menu-data.ts  (ARKA_BAR_SECTIONS) — Бар
 *  - apps/menu/src/lib/arka-photos.ts     (ARKA_GROUP_PHOTOS/ARKA_ITEM_PHOTOS)
 *  - packages/db/src/menu-generated.ts    (GEN_ITEMS) — Кухня/Кальяны
 *  - packages/db/src/menu-photos.ts       (PHOTOS)
 *  - packages/db/src/mock-data.ts         (MOCK_LOCATIONS — адрес/телефон Арки)
 *
 * Идемпотентно: перезаписывает JSON целиком при каждом запуске.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ARKA_BAR_SECTIONS, type ArkaMenuEntry as SrcEntry } from '../apps/menu/src/lib/arka-menu-data';
import { ARKA_GROUP_PHOTOS, ARKA_ITEM_PHOTOS } from '../apps/menu/src/lib/arka-photos';
import { GEN_ITEMS } from '../packages/db/src/menu-generated';
import { PHOTOS } from '../packages/db/src/menu-photos';
import { MOCK_LOCATIONS } from '../packages/db/src/mock-data';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'packages/db/content/arka');

function write(rel: string, data: unknown) {
  const full = join(CONTENT_DIR, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`wrote ${full}`);
}

// ── Бар: ARKA_BAR_SECTIONS + фото → content/arka/bar.json ──
const barSections = ARKA_BAR_SECTIONS.map((entry: SrcEntry) => {
  if (entry.kind === 'header') return entry;
  return {
    ...entry,
    items: entry.items.map((it) => ({
      ...it,
      photo: ARKA_ITEM_PHOTOS[it.id] ?? null,
      is_available: true,
    })),
  };
});
write('bar.json', { sections: barSections, groupPhotos: ARKA_GROUP_PHOTOS });

// ── Кухня / Кальяны: GEN_ITEMS (realm=kitchen|hookah, есть цена Арки) → JSON ──
for (const realm of ['kitchen', 'hookah'] as const) {
  const items = GEN_ITEMS.filter((it) => it.realm === realm && it.prices['arka'] != null).map((it) => ({
    id: it.id,
    realm,
    sub: it.sub,
    name: it.name,
    description: it.description,
    composition: it.composition,
    kbju: it.kbju,
    price: it.prices['arka']!,
    photo: PHOTOS[it.id] ?? null,
    is_available: true,
  }));
  write(`${realm}.json`, items);
  console.log(`${realm}: ${items.length} позиций`);
}

// ── Настройки локации ──
const arkaLoc = MOCK_LOCATIONS.find((l) => l.slug === 'arka')!;
write('location.json', {
  address: arkaLoc.address,
  phone: arkaLoc.phone ?? null,
  is_active: true,
});

console.log('Готово.');
