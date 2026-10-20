// «Ctrl-C / Ctrl-V» с Павелецкой (21.10.2026, по просьбе владельца): владелец
// довёл фото, кадрирование и описания на Павелецкой в бэк-офисе — переносим
// на одноимённые живые позиции всех остальных локаций.
//
// Что копируем (кухня, кальяны — photos[]; бар — photo + кадрирование):
//  - фото и кадрирование: если у цели фото нет, или её фото — из общей
//    библиотеки (/menu/…, /menu-admin/_shared/…) или тоже с Павелецкой; свои
//    фото локации (/menu-admin/<её slug>/…) не трогаем;
//  - описание, состав, КБЖУ, вес, теги для фильтров, переводы названий и
//    описаний — только в пустые поля.
// Идемпотентно. usage: node apply.mjs <абсолютный путь к packages/db/content> [--dry]
import { readFileSync, writeFileSync, renameSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const contentDir = process.argv[2];
const DRY = process.argv.includes('--dry');
if (!contentDir) { console.error('usage: node apply.mjs <packages/db/content> [--dry]'); process.exit(2); }
const SRC = 'paveletskaia';
const norm = (s) => String(s ?? '').toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, '');
const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
// фото «своё для локации» — лежит в её папке menu-admin/<slug>/
const ownPhoto = (src, slug) => typeof src === 'string' && src.startsWith(`/menu-admin/${slug}/`);
const TEXT_FIELDS = ['description', 'composition', 'kbju', 'weight', 'tags', 'name_en', 'name_zh', 'name_hy', 'description_en', 'description_zh', 'description_hy', 'composition_en', 'composition_zh', 'composition_hy'];

function loadFlat(slug, realm) {
  const f = join(contentDir, slug, `${realm}.json`);
  return existsSync(f) ? { f, raw: readFileSync(f, 'utf-8') } : null;
}
function indexFlat(items) {
  const m = new Map();
  for (const it of items) if (!it.is_archived) { const k = norm(it.name); if (!m.has(k)) m.set(k, it); }
  return m;
}
function write(f, data, raw) {
  const out = JSON.stringify(data, null, 2) + '\n';
  if (out === raw) return false;
  if (!DRY) { writeFileSync(`${f}.tmp`, out, 'utf-8'); renameSync(`${f}.tmp`, f); }
  return true;
}

const src = {};
for (const realm of ['kitchen', 'hookah']) { const l = loadFlat(SRC, realm); src[realm] = l ? indexFlat(JSON.parse(l.raw)) : new Map(); }
{
  const l = loadFlat(SRC, 'bar'); const b = l ? JSON.parse(l.raw) : null;
  const items = b && !Array.isArray(b) ? b.sections.filter((s) => s.kind === 'category').flatMap((s) => s.items) : [];
  src.bar = indexFlat(items);
}

const stats = {};
const bump = (slug, k, n = 1) => { stats[slug] ??= {}; stats[slug][k] = (stats[slug][k] ?? 0) + n; };

function copyText(from, to, slug) {
  for (const k of TEXT_FIELDS) {
    const v = from[k];
    if (v == null || v === '' || (Array.isArray(v) && !v.length)) continue;
    const cur = to[k];
    if (cur == null || cur === '' || (Array.isArray(cur) && !cur.length)) { to[k] = v; bump(slug, `текст:${k}`); }
  }
}

for (const slug of readdirSync(contentDir)) {
  if (slug === SRC || slug.startsWith('.') || !existsSync(join(contentDir, slug, 'kitchen.json'))) continue;
  // кухня и кальяны
  for (const realm of ['kitchen', 'hookah']) {
    const l = loadFlat(slug, realm); if (!l) continue;
    const data = JSON.parse(l.raw);
    for (const it of data) {
      if (it.is_archived) continue;
      const from = src[realm].get(norm(it.name)); if (!from) continue;
      bump(slug, `${realm}: совпало`);
      const fromPhotos = from.photos ?? [];
      if (fromPhotos.length) {
        const cur = it.photos ?? [];
        const keep = cur.some((p) => ownPhoto(p.src, slug));
        if (keep) bump(slug, `${realm}: своё фото оставлено`);
        else if (!same(cur, fromPhotos)) { it.photos = fromPhotos.map((p) => ({ src: p.src, position: p.position ?? null, transform: p.transform ?? null })); bump(slug, `${realm}: фото`); }
      }
      copyText(from, it, slug);
    }
    if (write(l.f, data, l.raw)) bump(slug, 'файлов');
  }
  // бар
  const l = loadFlat(slug, 'bar'); if (!l) continue;
  const b = JSON.parse(l.raw);
  const items = Array.isArray(b) ? b : b.sections.filter((s) => s.kind === 'category').flatMap((s) => s.items);
  for (const it of items) {
    if (it.is_archived) continue;
    const from = src.bar.get(norm(it.name)); if (!from) continue;
    bump(slug, 'bar: совпало');
    if (Array.isArray(b)) {
      // плоский бар Киевской: photos[]
      if (from.photo) {
        const cur = it.photos ?? [];
        if (cur.some((p) => ownPhoto(p.src, slug))) bump(slug, 'bar: своё фото оставлено');
        else { const want = [{ src: from.photo, position: from.photo_position ?? null, transform: from.photo_transform ?? null }]; if (!same(cur, want)) { it.photos = want; bump(slug, 'bar: фото'); } }
      }
    } else if (from.photo) {
      if (ownPhoto(it.photo, slug)) bump(slug, 'bar: своё фото оставлено');
      else if (it.photo !== from.photo || !same(it.photo_position, from.photo_position) || !same(it.photo_transform, from.photo_transform)) {
        it.photo = from.photo; it.photo_position = from.photo_position ?? null; it.photo_transform = from.photo_transform ?? null; bump(slug, 'bar: фото');
      }
    }
    copyText(from, it, slug);
  }
  if (write(l.f, b, l.raw)) bump(slug, 'файлов');
}

for (const [slug, s] of Object.entries(stats).sort()) {
  console.log(`${slug}: ` + Object.entries(s).map(([k, v]) => `${k} ${v}`).join(', '));
}
if (DRY) console.log('(dry — ничего не записано)');
