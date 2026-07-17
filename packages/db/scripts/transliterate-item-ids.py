#!/usr/bin/env python3
"""
Разовая миграция: заменяет кириллицу в id позиций меню на транслитерацию,
чтобы карточка товара и все API-роуты, сравнивающие id по строке, работали
без зависимости от decode-слоя (см. apps/menu/src/lib/decode-param.ts,
apps/hub/src/lib/decode-param.ts — тот фикс остаётся как страховка, этот
скрипт чинит первопричину в самих данных).

Затронуты только 'arka' и 'kievskaia' (боевые данные с историческим
неаккуратным импортом) — их клоны/тестовые версии (arka-network,
kievskaia-network, 25 рабочих клонов) уже на чистых ASCII id.

Транслитерация — только не-ASCII части id, разделители и already-ASCII
суффиксы (например случайный '-cb5y1') не трогаются. Схема подобрана по
образцу уже существующих ASCII id в тех же файлах (grecheskii, tarelka,
kuricei — т.е. ц→c, а не ts; й→i; я→ia; ю→iu).

Запуск:
  python3 packages/db/scripts/transliterate-item-ids.py --dry-run
  python3 packages/db/scripts/transliterate-item-ids.py --content-dir /var/www/barviha-data/content
"""
import argparse
import json
import os
import re
import sys

TRANSLIT = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'i', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'iu', 'я': 'ia',
}
NON_ASCII_RE = re.compile(r'[^\x00-\x7f]')


def transliterate(s: str) -> str:
    out = []
    for ch in s:
        low = ch.lower()
        if low in TRANSLIT:
            out.append(TRANSLIT[low])
        elif ord(ch) < 128:
            out.append(ch)
        else:
            out.append('')  # неизвестный символ — выкидываем, не оставляем мусор в id
    return ''.join(out)


def new_id_for(old_id: str) -> str:
    return transliterate(old_id)


def migrate_item_list(items, stats, location, realm):
    seen_ids = {it['id'] for it in items}
    for it in items:
        old_id = it.get('id', '')
        if not NON_ASCII_RE.search(old_id):
            continue
        new_id = new_id_for(old_id)
        if new_id == old_id:
            continue
        if new_id in seen_ids and new_id != old_id:
            # коллизия (не встретилась на практике — суффиксы уникальны) —
            # добавляем счётчик, чтобы не потерять позицию.
            base = new_id
            i = 2
            while new_id in seen_ids:
                new_id = f'{base}-dup{i}'
                i += 1
        seen_ids.discard(old_id)
        seen_ids.add(new_id)
        stats.append((location, realm, old_id, new_id))
        it['id'] = new_id


def process_location(content_dir: str, slug: str, dry_run: bool, stats: list):
    locdir = os.path.join(content_dir, slug)
    for realm in ['kitchen', 'hookah', 'bar']:
        path = os.path.join(locdir, f'{realm}.json')
        if not os.path.exists(path):
            continue
        with open(path, encoding='utf-8') as f:
            data = json.load(f)

        if isinstance(data, list):
            migrate_item_list(data, stats, slug, realm)
        elif isinstance(data, dict) and 'sections' in data:
            items = []
            for section in data['sections']:
                if section.get('kind') == 'category':
                    items.extend(section.get('items', []))
            migrate_item_list(items, stats, slug, realm)
        else:
            continue

        if not dry_run:
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                f.write('\n')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--content-dir', default='packages/db/content')
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--locations', default='arka,kievskaia')
    args = parser.parse_args()

    stats = []
    for slug in args.locations.split(','):
        process_location(args.content_dir, slug, args.dry_run, stats)

    print(f'{"[DRY RUN] " if args.dry_run else ""}Переименовано id: {len(stats)}')
    for location, realm, old_id, new_id in stats[:20]:
        print(f'  {location}/{realm}: {old_id!r} -> {new_id!r}')
    if len(stats) > 20:
        print(f'  ... и ещё {len(stats) - 20}')

    if args.dry_run:
        print('\nЗапусти без --dry-run, чтобы применить.')


if __name__ == '__main__':
    main()
