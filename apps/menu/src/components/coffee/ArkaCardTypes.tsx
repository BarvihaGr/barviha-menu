'use client';

/**
 * Два шаблона карточек товара для тестового контента «Арки» (сейчас — Бар,
 * см. arka-menu-data.ts). Использует те же токены `--cm-*`, что и
 * CoffeeItemCard/CoffeeMenuList — палитра/шрифт наследуются от
 * coffeeAccentStyle(locationSlug), заданного в родителе, поэтому визуально
 * ничем не отличается от остальных coffee-страниц (сейчас у Арки — палитра
 * Киевской, см. coffee-design.ts).
 *
 * Тип 1 (FullCard)  — синяя разметка в рабочем файле: у позиции есть/будет
 *                      своё фото. Фото + название + описание + объём + цена.
 * Тип 2 (GroupCard) — белая/без разметки: одно общее фото 16:9 на всю
 *                      категорию, сами позиции — простой список строк.
 *
 * Если у позиции несколько объёмов (напр. 300 мл / 1 л) — каждая вариация
 * показывается своей строкой со своей ценой, своей ссылкой на карточку
 * товара и своей кнопкой «в корзину» (см. getItemVariants в arka-menu-data) —
 * везде одинаково, что в сетке, что в простом списке.
 */

import Image from 'next/image';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getItemVariants, type ArkaMenuItem, type ArkaMenuVariant } from '@/lib/arka-menu-data';
import { Link } from '@/i18n/navigation';
import { useCart } from '@/store/cart';
import { useToast } from '@/store/toast';
import { photoTransformCss, type PhotoTransform } from '@/lib/photo-transform';

function formatRub(n: number): string {
  return n.toLocaleString('ru-RU');
}

/** Фото позиции/категории — если путь передан (item.photo из content-store), рендерим
 * реальный кадр; иначе держим место тоновым градиентом с меткой вместо
 * пустого поля (фото ещё не подтверждено/не готово). */
function PhotoPlaceholder({
  ratio,
  label,
  src,
  position,
  transform,
}: {
  ratio: 'square' | 'wide';
  label: string;
  src?: string;
  position?: { x: number; y: number } | null;
  transform?: PhotoTransform;
}) {
  return (
    <div
      className={
        (ratio === 'square' ? 'relative aspect-square w-full overflow-hidden' : 'relative aspect-video w-full overflow-hidden') +
        ' rounded-[var(--cm-card-radius,16px)] bg-[var(--cm-surface)]'
      }
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, 320px"
          style={{
            objectPosition: position ? `${position.x}% ${position.y}%` : undefined,
            transform: photoTransformCss(transform),
          }}
          className={ratio === 'wide' ? 'object-contain' : 'object-cover'}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="px-3 text-center text-[10px] uppercase tracking-[0.25em] text-[var(--cm-muted-dim)]">
            {label}
          </span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_var(--cm-border)]" />
    </div>
  );
}

/** Кнопка «+» — кладёт конкретную вариацию (свой id/цена) в корзину. */
function AddButton({ variant }: { variant: ArkaMenuVariant }) {
  const add = useCart((s) => s.add);
  const push = useToast((s) => s.push);
  const t = useTranslations();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        add(variant.id, 1);
        push(t('toast.addedToCart'), 'success');
      }}
      aria-label={`${t('item.addToCart')} ${variant.name}`}
      className="shrink-0 grid h-7 w-7 place-items-center rounded-full bg-[var(--cm-accent)] text-white shadow-sm transition-all duration-200 active:scale-90 cursor-pointer"
    >
      <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
    </button>
  );
}

/** Строка одной вариации: объём + цена, сама ссылка на карточку товара + «+». */
function VariantRow({ variant, locationSlug }: { variant: ArkaMenuVariant; locationSlug: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Link
        href={`/${locationSlug}/item/${variant.id}`}
        className="flex min-w-0 flex-1 items-baseline justify-between gap-2 focus:outline-none"
      >
        {variant.label && (
          <span className="text-[11px] text-[var(--cm-muted-dim)]">{variant.label}</span>
        )}
        <span className="text-[13.5px] font-semibold text-[var(--cm-accent-on-bg,var(--cm-accent))]">
          {formatRub(variant.price)} ₽
        </span>
      </Link>
      <AddButton variant={variant} />
    </div>
  );
}

/** Строка одной вариации в стиле Timeless: объём слева, цена + компактная
 * «+» справа — используется внутри ArkaTimelessRow (см. ниже). */
function TimelessVariantLine({ variant, locationSlug }: { variant: ArkaMenuVariant; locationSlug: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Link
        href={`/${locationSlug}/item/${variant.id}`}
        className="flex min-w-0 flex-1 items-baseline gap-3 focus:outline-none"
      >
        {variant.label && (
          <span className="shrink-0 text-[12px] uppercase tracking-[0.08em] text-[var(--cm-muted-dim)]">
            {variant.label}
          </span>
        )}
        <span className="text-[15px] font-medium text-[var(--cm-text)]">{formatRub(variant.price)} ₽</span>
      </Link>
      <AddButton variant={variant} />
    </div>
  );
}

/** Тип 1 — полная карточка (своё фото). Фото+название+описание — тоже
 * ссылка (на первую вариацию), чтобы вся верхняя часть карточки открывала
 * карточку товара, а не только строка цены. */
export function ArkaFullCard({ item, locationSlug }: { item: ArkaMenuItem; locationSlug: string }) {
  const variants = getItemVariants(item);
  const primary = variants[0]!;
  const photoSrc = item.photo ?? undefined;
  return (
    <article className="flex min-w-0 flex-col">
      <Link href={`/${locationSlug}/item/${primary.id}`} className="contents focus:outline-none">
        <PhotoPlaceholder
          ratio="square"
          label="фото позиции"
          src={photoSrc}
          position={item.photo_position}
          transform={item.photo_transform}
        />
        <div className="flex flex-1 flex-col pt-2.5">
          <h3 className="break-words font-[family-name:var(--font-display)] text-[14px] font-semibold uppercase leading-[1.25] tracking-[0.02em] text-[var(--cm-text)]">
            {item.name}
          </h3>
          {item.description && (
            <p className="mt-1 break-words text-[11.5px] leading-snug text-[var(--cm-muted)]">{item.description}</p>
          )}
        </div>
      </Link>
      <div className="mt-auto flex flex-col gap-1.5 pt-2.5">
        {variants.map((v) => (
          <VariantRow key={v.id} variant={v} locationSlug={locationSlug} />
        ))}
      </div>
    </article>
  );
}

/** Тип 2 — позиция без фото, в стиле Timeless: крупное название сверху,
 * объём + цена снизу, без фото и без плейсхолдера. Название — тоже ссылка
 * (на первую вариацию), чтобы вся ячейка открывала карточку товара. */
function ArkaTimelessRow({ item, locationSlug }: { item: ArkaMenuItem; locationSlug: string }) {
  const variants = getItemVariants(item);
  const primary = variants[0]!;
  return (
    <div className="flex flex-col gap-3 border-b border-[var(--cm-border)] py-6">
      <Link href={`/${locationSlug}/item/${primary.id}`} className="min-w-0 focus:outline-none">
        <h4 className="break-words font-[family-name:var(--font-display)] text-[19px] font-medium uppercase leading-[1.2] tracking-[0.02em] text-[var(--cm-text)] sm:text-[21px]">
          {item.name}
        </h4>
        {item.description && (
          <p className="mt-1.5 break-words text-[12px] leading-snug text-[var(--cm-muted)]">{item.description}</p>
        )}
      </Link>
      <div className="flex flex-col gap-1.5">
        {variants.map((v) => (
          <TimelessVariantLine key={v.id} variant={v} locationSlug={locationSlug} />
        ))}
      </div>
    </div>
  );
}

/** Тип 2 — сетка 2 колонки без фото (в стиле Timeless: название крупно,
 * объём/цена мелко). Раньше здесь было общее фото 16:9 на категорию —
 * убрано по просьбе пользователя в пользу чистой типографики. */
export function ArkaGroupCard({
  items,
  locationSlug,
}: {
  items: ArkaMenuItem[];
  locationSlug: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
      {items.map((it, i) => (
        <ArkaTimelessRow key={`${it.name}-${i}`} item={it} locationSlug={locationSlug} />
      ))}
    </div>
  );
}
