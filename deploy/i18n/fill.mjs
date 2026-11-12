// Переводы меню из общего словаря (deploy/i18n/dict.json: «русский текст» → { en, zh, hy, uz, ar }).
// Заполняет ТОЛЬКО пустые name_/description_/composition_ {en,zh,hy,uz,ar} у позиций кухни, бара и кальянов
// всех локаций; уже заданные вручную переводы не трогает. Запускается кроном сразу после sheet-sync
// (тот обнуляет переводы при переименовании и создаёт новые позиции без них) — так переводы не теряются.
// usage: node fill.mjs <content dir> [--apply] [--missing <файл.json>]
import { readFileSync, writeFileSync, renameSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const CONTENT = args.find((a) => !a.startsWith('--'));
const APPLY = args.includes('--apply');
const MISSING = args.includes('--missing') ? args[args.indexOf('--missing') + 1] : null;
if (!CONTENT) { console.error('usage: node fill.mjs <content dir> [--apply]'); process.exit(2); }

const DICT = JSON.parse(readFileSync(join(here, 'dict.json'), 'utf-8'));
const norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const byNorm = new Map(Object.entries(DICT).map(([k, v]) => [norm(k), v]));
const CY = /[А-Яа-яЁё]/;
const LANGS = ['en', 'zh', 'hy', 'uz', 'ar'];
const FIELDS = ['name', 'description', 'composition'];

let filled = 0; let files = 0; const missing = new Map();
const items = (d) => (Array.isArray(d) ? d : (d.sections ?? []).flatMap((s) => (s && s.items) || []));

for (const slug of readdirSync(CONTENT)) {
  const dir = join(CONTENT, slug);
  if (slug.startsWith('.') || !statSync(dir).isDirectory()) continue;
  for (const realm of ['kitchen', 'bar', 'hookah']) {
    const f = join(dir, `${realm}.json`);
    if (!existsSync(f)) continue;
    const raw = readFileSync(f, 'utf-8');
    const data = JSON.parse(raw);
    let n = 0;
    for (const it of items(data)) {
      if (!it || typeof it !== 'object') continue;
      for (const field of FIELDS) {
        const ru = it[field];
        if (typeof ru !== 'string' || !CY.test(ru)) continue;
        if (LANGS.every((l) => it[`${field}_${l}`])) continue;
        const tr = byNorm.get(norm(ru));
        if (!tr) { if (!it.is_archived) missing.set(norm(ru), `${slug}/${realm}`); continue; }
        for (const l of LANGS) if (!it[`${field}_${l}`] && tr[l]) { it[`${field}_${l}`] = tr[l]; n++; }
      }
    }
    if (n) {
      filled += n; files++;
      if (APPLY) { const out = JSON.stringify(data, null, 2) + '\n'; writeFileSync(`${f}.tmp`, out); renameSync(`${f}.tmp`, f); }
    }
  }
}
const stamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
console.log(`[i18n-fill ${stamp}] ${APPLY ? 'применено' : 'проверка'}: полей заполнено ${filled}, файлов ${files}, без перевода в словаре ${missing.size}`);
if (MISSING) writeFileSync(MISSING, JSON.stringify(Object.fromEntries(missing), null, 2));
