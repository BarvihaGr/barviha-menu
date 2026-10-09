// Новые фото осеннего меню, кальянов и горячих напитков (папка «Доп фото» от владельца, 09.10.2026).
// Файлы лежат в apps/menu/public/menu-admin/_shared/2026-10/ (общие для всех локаций, не в git —
// копируются на сервер отдельно). Прикладываем ко всем неархивным позициям с таким названием,
// у которых фото ещё нет (есть — не трогаем). Первое фото — обложка. Идемпотентно.
//
// usage: node apply.mjs <абсолютный путь к packages/db/content>
import { readFileSync, writeFileSync, renameSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const contentDir = process.argv[2];
if (!contentDir) { console.error('usage: node apply.mjs <packages/db/content>'); process.exit(2); }
const { photos } = JSON.parse(readFileSync(join(here, 'patch.json'), 'utf-8'));
const norm = (s) => String(s).toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, ' ').trim();
const entry = (src) => ({ src, position: null, transform: null });
const SKIP = new Set(['arka-network', 'kievskaia-network', 'erevan', 'taskent']);
const counts = {};
const bump = (k) => { counts[k] = (counts[k] ?? 0) + 1; };
function write(file, data, raw) {
  const out = JSON.stringify(data, null, 2) + '\n';
  if (out !== raw) { writeFileSync(`${file}.tmp`, out, 'utf-8'); renameSync(`${file}.tmp`, file); }
}
for (const slug of readdirSync(contentDir)) {
  if (slug.startsWith('.') || SKIP.has(slug) || !statSync(join(contentDir, slug)).isDirectory()) continue;
  for (const realm of ['kitchen', 'hookah']) {
    const file = join(contentDir, slug, `${realm}.json`);
    if (!existsSync(file)) continue;
    const raw = readFileSync(file, 'utf-8'); const data = JSON.parse(raw);
    for (const it of data) {
      const list = photos[`${realm}|${norm(it.name)}`];
      if (!list || it.is_archived || (it.photos && it.photos.length)) continue;
      it.photos = list.map(entry); bump(`${slug}/${realm}`);
    }
    write(file, data, raw);
  }
  const file = join(contentDir, slug, 'bar.json');
  if (!existsSync(file)) continue;
  const raw = readFileSync(file, 'utf-8'); const data = JSON.parse(raw);
  if (Array.isArray(data)) {
    for (const it of data) {
      const list = photos[`bar|${norm(it.name)}`];
      if (!list || it.is_archived || (it.photos && it.photos.length)) continue;
      it.photos = list.map(entry); bump(`${slug}/bar`);
    }
  } else {
    for (const s of data.sections) {
      if (s.kind !== 'category') continue;
      for (const it of s.items) {
        const list = photos[`bar|${norm(it.name)}`];
        if (!list || it.is_archived || it.photo) continue;
        it.photo = list[0]; it.photo_position = it.photo_position ?? null; it.photo_transform = it.photo_transform ?? null; bump(`${slug}/bar`);
      }
    }
  }
  write(file, data, raw);
}
console.log(Object.entries(counts).sort().map(([k, v]) => `${k}: ${v}`).join('\n') || 'nothing to change');
console.log(`--- всего прикреплено: ${Object.values(counts).reduce((a, b) => a + b, 0)}`);
