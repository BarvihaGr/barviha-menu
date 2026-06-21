'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import type { Category, ResolvedMenuItem } from '@barviha/db';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import {
  pickCategoryName,
  pickItemDescription,
  pickItemName,
  pickSubLabel,
} from '@/lib/i18n-helpers';
import { formatPrice, cn } from '@/lib/utils';
import { AddToCartButton } from '../AddToCartButton';

/**
 * Полный «Coffeemania-style» макет меню (только для редизайн-локации Бауманская).
 *
 * Светлая чистая тема: слева вертикальный список категорий (сгруппирован по
 * реалму Кухня / Бар / Кальян), сверху — поиск по названию, справа — сетка
 * карточек блюд (фото / название / грамовка · цена). Переключение категории
 * мгновенное (state, без перезагрузки страницы), как на coffeemania.ru.
 */

interface Section {
  id: string;
  label: string;
  realmId: string;
  items: ResolvedMenuItem[];
}

interface RealmGroup {
  id: string;
  name: string;
  sections: Section[];
}

interface Props {
  categories: Category[];
  items: ResolvedMenuItem[];
  locationSlug: string;
}

export function CoffeemaniaMenu({ categories, items, locationSlug }: Props) {
  const locale = useLocale() as Locale;
  const t = useTranslations();

  // Карта реалмов: category_id → {имя, порядок}.
  const realmMeta = useMemo(() => {
    const order = ['kitchen', 'bar', 'hookah'];
    const map = new Map<string, { name: string; sort: number }>();
    for (const c of categories) {
      map.set(c.id, {
        name: pickCategoryName(c, locale),
        sort: order.indexOf(c.slug) === -1 ? 99 : order.indexOf(c.slug),
      });
    }
    return map;
  }, [categories, locale]);

  // Группировка всех блюд в подсекции (по item.sub), с сохранением порядка БД.
  const { groups, sections } = useMemo(() => {
    const order: string[] = [];
    const byId = new Map<string, Section>();
    for (const it of items) {
      const realmId = it.category_id ?? 'other';
      const key = it.sub ? `${realmId}/${it.sub}` : `${realmId}/__rest`;
      let s = byId.get(key);
      if (!s) {
        const label = it.sub
          ? pickSubLabel(it.sub, it.subLabel ?? it.sub, locale)
          : (realmMeta.get(realmId)?.name ?? '—');
        s = { id: key, label, realmId, items: [] };
        byId.set(key, s);
        order.push(key);
      }
      s.items.push(it);
    }
    const sections = order.map((k) => byId.get(k)!);

    // Группируем секции по реалму для левого сайдбара.
    const gOrder: string[] = [];
    const gById = new Map<string, RealmGroup>();
    for (const s of sections) {
      let g = gById.get(s.realmId);
      if (!g) {
        g = { id: s.realmId, name: realmMeta.get(s.realmId)?.name ?? '', sections: [] };
        gById.set(s.realmId, g);
        gOrder.push(s.realmId);
      }
      g.sections.push(s);
    }
    const groups = gOrder
      .map((k) => gById.get(k)!)
      .sort((a, b) => (realmMeta.get(a.id)?.sort ?? 99) - (realmMeta.get(b.id)?.sort ?? 99));

    return { groups, sections };
  }, [items, locale, realmMeta]);

  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const visibleItems = useMemo(() => {
    if (searching) {
      return items.filter((it) => pickItemName(it, locale).toLowerCase().includes(q));
    }
    return sections.find((s) => s.id === activeId)?.items ?? [];
  }, [searching, q, items, sections, activeId, locale]);

  const activeLabel = sections.find((s) => s.id === activeId)?.label ?? '';

  return (
    <div className="cm-root mx-auto w-full max-w-[1180px] px-3 pb-28 pt-3 sm:px-6 sm:pt-5">
      {/* Поиск */}
      <div className="sticky top-[52px] z-20 -mx-3 mb-4 bg-white/95 px-3 pb-3 pt-1 backdrop-blur sm:top-[64px] sm:-mx-6 sm:px-6">
        <label className="relative block">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#9a9a9a]"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Введите название блюда"
            className="w-full rounded-full border border-[#ececec] bg-[#f5f5f5] py-3 pl-12 pr-4 text-[15px] text-[#1a1a1a] outline-none transition placeholder:text-[#9a9a9a] focus:border-[#d6d6d6] focus:bg-white"
          />
        </label>
      </div>

      <div className="grid grid-cols-[118px_1fr] gap-3 sm:grid-cols-[230px_1fr] sm:gap-8">
        {/* Левый сайдбар категорий */}
        <aside className="sticky top-[112px] self-start sm:top-[132px]">
          <nav className="max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar pr-1">
            {groups.map((g) => (
              <div key={g.id} className="mb-5">
                <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b3b3b3] sm:text-[11px]">
                  {g.name}
                </p>
                <ul className="space-y-0.5">
                  {g.sections.map((s) => {
                    const on = !searching && s.id === activeId;
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setQuery('');
                            setActiveId(s.id);
                          }}
                          className={cn(
                            'block w-full rounded-lg px-2.5 py-2 text-left text-[13px] leading-snug transition sm:text-[15px]',
                            on
                              ? 'bg-[#f1efe9] font-semibold text-[#1a1a1a]'
                              : 'text-[#5c5c5c] hover:bg-[#f6f6f6] hover:text-[#1a1a1a]',
                          )}
                        >
                          {s.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Правая колонка: заголовок + сетка карточек */}
        <section className="min-w-0">
          <h1 className="mb-4 text-[20px] font-semibold tracking-[-0.01em] text-[#1a1a1a] sm:mb-6 sm:text-[28px]">
            {searching ? `Поиск: «${query.trim()}»` : activeLabel}
          </h1>

          {visibleItems.length === 0 ? (
            <p className="py-20 text-center text-sm text-[#9a9a9a]">Ничего не найдено</p>
          ) : (
            <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
              {visibleItems.map((item) => (
                <CmCard
                  key={item.id}
                  item={item}
                  name={pickItemName(item, locale)}
                  description={pickItemDescription(item, locale)}
                  locationSlug={locationSlug}
                  addLabel={t('item.addToCart')}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/** Светлая карточка блюда в стиле Coffeemania. */
function CmCard({
  item,
  name,
  description,
  locationSlug,
}: {
  item: ResolvedMenuItem;
  name: string;
  description: string | null;
  locationSlug: string;
  addLabel: string;
}) {
  const teaser = description
    ? (description.match(/^.*?[.!?…](\s|$)/)?.[0] ?? description).trim()
    : null;

  return (
    <article className="group flex flex-col">
      <Link
        href={`/${locationSlug}/item/${item.id}`}
        className="block focus:outline-none"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#f2f2f2]">
          {item.photo ? (
            <Image
              src={item.photo}
              alt={name}
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 320px"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl text-[#d8d8d8]">
              ◍
            </div>
          )}
        </div>
        <h3 className="mt-3 text-[15px] font-medium leading-snug text-[#1a1a1a] line-clamp-2 sm:text-[16px]">
          {name}
        </h3>
        {teaser && (
          <p className="mt-1 text-[12px] leading-snug text-[#9a9a9a] line-clamp-2">{teaser}</p>
        )}
      </Link>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[14px] text-[#7a7a7a]">
          {item.weight ? `${item.weight} · ` : ''}
          <span className="font-semibold text-[#1a1a1a]">{formatPrice(item.price)}</span>
        </span>
        <AddToCartButton itemId={item.id} itemName={name} className="shrink-0" />
      </div>
    </article>
  );
}
