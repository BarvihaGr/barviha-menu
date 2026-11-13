// Правки меню владельца 13.11.2026 (скриншоты Павелецкой, «надо всё исправить» — по всем точкам):
//  1. бар: заголовок «Осеннее предложение» → «Сезонное предложение» (в кухне подпись в коде, catalog-shared.ts);
//  2. «Смородиновый глинтвейн» и «… б/а» — новое фото (smorodinovyi-glintvein-2);
//  3. «Бэйзил Смэш» в авторских коктейлях — сразу после «Слива Голубика»;
//  4. пустой раздел-обложка «Коктейли» убран, его фото — над «Популярными/Классическими коктейлями»;
//     так же «Чаи» → фото над «Премиальными чаями»;
//  5. кухня: «Бурый рис» — фото buryi-ris-pp (только где фото ещё нет; точки со своей кухней не трогаем).
// Идемпотентно. usage: node apply.mjs <content> [--dry]
import { readFileSync, writeFileSync, renameSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const contentDir = process.argv[2];
const DRY = process.argv.includes('--dry');
if (!contentDir) { console.error('usage: node apply.mjs <content> [--dry]'); process.exit(2); }
const norm = (s) => String(s ?? '').toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, '');
const OWN_KITCHEN = new Set(['domodedovo', 'maxackala', 'rublevka']);
const GLINT = '/menu-admin/_shared/2026-11/smorodinovyi-glintvein-2.webp';
const RICE = '/menu-admin/_shared/2026-11/buryi-ris-pp.webp';
const COVERS = [
  { from: 'Коктейли', to: ['Популярные коктейли', 'Классические коктейли'] },
  { from: 'Чаи', to: ['Премиальные чаи'] },
];

const read = (f) => JSON.parse(readFileSync(f, 'utf-8'));
const write = (f, d) => { if (DRY) return; writeFileSync(`${f}.tmp`, JSON.stringify(d, null, 2) + '\n', 'utf-8'); renameSync(`${f}.tmp`, f); };

for (const slug of readdirSync(contentDir).sort()) {
  const log = [];
  const bf = join(contentDir, slug, 'bar.json');
  if (existsSync(bf)) {
    const bar = read(bf);
    let ch = false;
    for (const s of bar.sections ?? []) {
      if (s.kind === 'header' && norm(s.title) === 'осеннеепредложение') { s.title = 'Сезонное предложение'; ch = true; log.push('бар: «Сезонное предложение»'); }
      for (const it of s.items ?? []) {
        if (/^смородиновыйглинтвейн(ба)?$/.test(norm(it.name)) && it.photo !== GLINT) {
          it.photo = GLINT; it.photo_position = null; it.photo_transform = null; ch = true; log.push(`фото «${it.name}»`);
        }
      }
      if (s.kind === 'category' && norm(s.category) === 'авторскиекоктейли') {
        const items = s.items;
        const bi = items.findIndex((x) => norm(x.name) === 'бэйзилсмэш');
        const si = items.findIndex((x) => norm(x.name) === 'сливаголубика');
        if (bi >= 0 && si >= 0 && bi !== si + 1) {
          const [b] = items.splice(bi, 1);
          items.splice(items.findIndex((x) => norm(x.name) === 'сливаголубика') + 1, 0, b);
          ch = true; log.push('«Бэйзил Смэш» после «Слива Голубика»');
        }
      }
    }
    for (const c of COVERS) {
      const idx = (bar.sections ?? []).findIndex((s) => s.kind === 'category' && norm(s.category) === norm(c.from));
      if (idx < 0) continue;
      const sec = bar.sections[idx];
      if ((sec.items ?? []).length) { log.push(`⚠ «${c.from}» не пустой — не тронут`); continue; }
      const target = c.to.map((t) => bar.sections.find((s) => s.kind === 'category' && norm(s.category) === norm(t))).find(Boolean);
      if (!target) { log.push(`⚠ нет раздела ${c.to.join('/')} — «${c.from}» не тронут`); continue; }
      const gp = bar.groupPhotos ?? {};
      if (gp[c.from] && !gp[target.category]) gp[target.category] = gp[c.from];
      delete gp[c.from];
      bar.sections.splice(idx, 1);
      ch = true; log.push(`обложка «${c.from}» → над «${target.category}»`);
    }
    if (ch) write(bf, bar);
  }
  const kf = join(contentDir, slug, 'kitchen.json');
  if (existsSync(kf) && !OWN_KITCHEN.has(slug)) {
    const k = read(kf);
    let ch = false;
    for (const it of k) {
      if (norm(it.name) === 'бурыйрис' && !it.is_archived && !(it.photos ?? []).length) {
        it.photos = [{ src: RICE, position: null, transform: null }]; ch = true; log.push('фото «Бурый рис»');
      }
    }
    if (ch) write(kf, k);
  }
  if (log.length) console.log(`${slug}: ${log.join('; ')}`);
}
