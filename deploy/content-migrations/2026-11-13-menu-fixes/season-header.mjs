// 13.11.2026: у 8 точек сезонные горячие напитки стояли в середине бара без шапки — подняты наверх под «Сезонное предложение» (пустые разделы не трогаем, Саратов пропущен). Прогнано на ams руками.
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
const DRY = process.argv.includes('--dry');
const C = '/var/www/barviha-data/content';
for (const slug of ['ramenki', 'barvixa-lounge-saratov', 'domodedovo', 'likerka', 'nevskii', 'niznii-novgorod', 'penza', 'arka']) {
  const f = `${C}/${slug}/bar.json`; const b = JSON.parse(readFileSync(f, 'utf-8')); const S = b.sections;
  if (S.some((s) => s.kind === 'header' && /сезон|осен/i.test(s.title))) { console.log(slug, 'уже есть шапка'); continue; }
  const hot = S.filter((s) => s.kind === 'category' && /^горячие (алкогольные )?напитки$/i.test(s.category) && s.items.some((i) => !i.is_archived));
  console.log(slug, hot.map((s) => `${s.category}: ${s.items.filter((i) => !i.is_archived).map((i) => i.name).join(', ')}`).join(' || '));
  if (!hot.length) continue;
  b.sections = [{ kind: 'header', sheet: 'БА', title: 'Сезонное предложение' }, ...hot, ...S.filter((s) => !hot.includes(s))];
  if (!DRY) { writeFileSync(`${f}.tmp`, JSON.stringify(b, null, 2) + '\n'); renameSync(`${f}.tmp`, f); }
}
