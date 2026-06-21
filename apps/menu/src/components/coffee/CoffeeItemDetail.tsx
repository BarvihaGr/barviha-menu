'use client';

import { useState } from 'react';
import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Expand, Minus, Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ItemLabel, ResolvedMenuItem } from '@barviha/db';
import { Link, useRouter } from '@/i18n/navigation';
import { formatPrice, cn } from '@/lib/utils';
import { useCart } from '@/store/cart';
import { useToast } from '@/store/toast';
import type { RelatedItem } from '@/components/RelatedItemsRail';

interface Ingredient {
  name: string;
  amount?: string | null;
}

interface Props {
  item: ResolvedMenuItem;
  name: string;
  description: string | null;
  ingredients: Ingredient[];
  related: RelatedItem[];
  locationSlug: string;
}

/**
 * Карточка товара в светлом дизайне Coffeemania (для редизайн-локации
 * Бауманская). Крупное фото на тёплом сером фоне, чистая типографика, состав и
 * КБЖУ светлыми чипами, тёмная кнопка «Добавить» со степпером. Справа — узкая
 * лента кружков «из этой же категории». Полная параллель тёмной детальной.
 */
export function CoffeeItemDetail({
  item,
  name,
  description,
  ingredients,
  related,
  locationSlug,
}: Props) {
  const t = useTranslations('item');

  return (
    <div className="mx-auto flex w-full max-w-[1100px] gap-3 sm:gap-6">
      <article className="min-w-0 flex-1 overflow-hidden rounded-3xl border border-[#ececec] bg-white">
        <div className="px-3 pt-3 sm:px-4 sm:pt-4">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#f3f2ef]">
            {item.photo ? (
              <CoffeePhotoViewer src={item.photo} alt={name} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-7xl text-[#d8d6d0]">
                ◍
              </div>
            )}
            <CoffeeCloseButton fallbackHref={`/${locationSlug}`} />
            {item.labels.length > 0 && (
              <div className="absolute left-3 top-14 z-10 flex flex-col gap-1.5">
                {item.labels.map((l) => (
                  <LabelChip key={l} label={l} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 p-5 sm:p-8">
          <div>
            <h1 className="font-[family-name:var(--font-sans)] text-[24px] font-bold leading-tight tracking-[-0.01em] text-[#1a1a1a] sm:text-[32px]">
              {capitalize(name)}
            </h1>
            {item.weight && (
              <div className="mt-2 text-[12px] font-medium uppercase tracking-[0.16em] text-[#c49262]">
                {item.weight} {t('grams')}
              </div>
            )}
          </div>

          {description && (
            <CoffeeExpandableText
              text={description}
              moreLabel={t('more')}
              lessLabel={t('less')}
              className="text-[15px] leading-relaxed text-[#5c5c5c]"
            />
          )}

          {ingredients.length > 0 && (
            <div>
              <div className="mb-4 border-b border-[#ececec] pb-2 text-[11px] uppercase tracking-[0.22em] text-[#9b9b9b]">
                {t('composition')}
              </div>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 rounded-full bg-[#f3f2ef] px-3.5 py-2 text-[13px]"
                  >
                    <span className="text-[#1a1a1a]">{ing.name}</span>
                    {ing.amount && (
                      <span className="text-[12px] text-[#c49262] before:mr-1.5 before:text-[#d6c3ad] before:content-['·']">
                        {ing.amount}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.nutrition && (
            <div>
              <div className="mb-3 border-b border-[#ececec] pb-2 text-[11px] uppercase tracking-[0.22em] text-[#9b9b9b]">
                {t('nutrition')}
              </div>
              <div className="flex items-stretch overflow-hidden rounded-xl border border-[#ececec] bg-[#fbfbfa]">
                {(
                  [
                    ['kcal', item.nutrition.kcal],
                    ['protein', item.nutrition.protein],
                    ['fat', item.nutrition.fat],
                    ['carbs', item.nutrition.carbs],
                  ] as const
                ).map(([key, val], i) => (
                  <div
                    key={key}
                    className={cn('flex-1 py-3 text-center', i > 0 && 'border-l border-[#ececec]')}
                  >
                    <span className="block text-lg font-semibold text-[#1a1a1a]">{val}</span>
                    <span className="mt-1 block whitespace-nowrap text-[9px] uppercase tracking-[0.12em] text-[#9b9b9b]">
                      {t(key)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 border-t border-[#ececec] pt-5">
            <div className="text-[26px] font-semibold text-[#1a1a1a] sm:text-[30px]">
              {formatPrice(item.price)}
            </div>
            <CoffeeAddButton itemId={item.id} itemName={name} addLabel={t('addToCart')} />
          </div>
        </div>
      </article>

      <CoffeeRelatedRail items={related} locationSlug={locationSlug} ariaLabel={t('related')} />
    </div>
  );
}

/** Светлый ярлык (хит/новинка/острое…) поверх фото. */
function LabelChip({ label }: { label: ItemLabel }) {
  const t = useTranslations('labels');
  return (
    <span className="rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#1a1a1a] shadow-[0_1px_6px_rgba(0,0,0,0.08)] backdrop-blur">
      {t(label)}
    </span>
  );
}

/** Крестик закрытия — назад в историю, иначе на главную локации. */
function CoffeeCloseButton({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Закрыть"
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) router.back();
        else router.push(fallbackHref);
      }}
      className="absolute left-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#1a1a1a] shadow-[0_1px_8px_rgba(0,0,0,0.1)] backdrop-blur transition hover:bg-white cursor-pointer"
    >
      <X size={16} />
    </button>
  );
}

/** Фото блюда: превью кадрированное, по тапу — на весь экран целиком. */
function CoffeePhotoViewer({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('item');

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label={t('viewPhoto')}
          className="group absolute inset-0 cursor-zoom-in outline-none"
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#1a1a1a] shadow-[0_1px_8px_rgba(0,0,0,0.1)] backdrop-blur transition group-hover:bg-white">
            <Expand size={16} />
          </span>
        </button>
      </Dialog.Trigger>

      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[80] bg-[#1a1a1a]/85 backdrop-blur-md"
              />
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              aria-describedby={undefined}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
                className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-8"
              >
                <Dialog.Title className="sr-only">{alt}</Dialog.Title>

                <Dialog.Close asChild>
                  <button
                    type="button"
                    aria-label={t('closePhoto')}
                    className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[#1a1a1a] shadow-[0_1px_8px_rgba(0,0,0,0.1)] backdrop-blur transition hover:bg-white cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </Dialog.Close>

                <Dialog.Close asChild>
                  <button
                    type="button"
                    aria-label={t('closePhoto')}
                    className="relative flex max-h-full max-w-full cursor-zoom-out items-center justify-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- произвольное соотношение сторон, нужен natural-size */}
                    <img
                      src={src}
                      alt={alt}
                      className="max-h-[88vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl"
                    />
                  </button>
                </Dialog.Close>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

/** Длинное описание с плавным затуханием и кнопкой «Читать дальше». */
function CoffeeExpandableText({
  text,
  className = '',
  moreLabel,
  lessLabel,
  threshold = 180,
}: {
  text: string;
  className?: string;
  moreLabel: string;
  lessLabel: string;
  threshold?: number;
}) {
  const [open, setOpen] = useState(false);
  const long = text.length > threshold;

  if (!long) return <p className={className}>{text}</p>;

  return (
    <div>
      <div className="relative">
        <p
          className={cn(
            className,
            'overflow-hidden transition-all duration-300',
            open ? 'max-h-[1200px]' : 'max-h-[4.8em]',
          )}
        >
          {text}
        </p>
        {!open && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white to-transparent" />
        )}
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-2 text-[11px] uppercase tracking-[0.18em] text-[#c49262] transition-opacity hover:opacity-70 cursor-pointer"
      >
        {open ? lessLabel : moreLabel}
      </button>
    </div>
  );
}

/** Тёмная кнопка «Добавить» со степпером (стиль чёрных пилюль Coffeemania). */
function CoffeeAddButton({
  itemId,
  itemName,
  addLabel,
}: {
  itemId: string;
  itemName: string;
  addLabel: string;
}) {
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);
  const qty = useCart((s) => s.items.find((i) => i.itemId === itemId)?.qty ?? 0);
  const push = useToast((s) => s.push);
  const t = useTranslations();

  const firstAdd = () => {
    add(itemId, 1);
    push(t('toast.addedToCart'), 'success');
  };

  if (qty > 0) {
    return (
      <div className="inline-flex items-center gap-1 rounded-full bg-[#1a1a1a] px-1.5 py-1.5 text-white">
        <button
          type="button"
          onClick={() => setQty(itemId, qty - 1)}
          aria-label="−"
          className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/15 cursor-pointer"
        >
          <Minus size={16} strokeWidth={2.5} />
        </button>
        <span className="min-w-[24px] text-center text-[15px] font-semibold tabular-nums">{qty}</span>
        <button
          type="button"
          onClick={() => add(itemId, 1)}
          aria-label="+"
          className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/15 cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={firstAdd}
      aria-label={`${addLabel} ${itemName}`}
      className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] px-6 py-3.5 text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black cursor-pointer"
    >
      <Plus size={18} strokeWidth={2.4} />
      {addLabel}
    </button>
  );
}

/** Узкая боковая лента кружков «из этой же категории». */
function CoffeeRelatedRail({
  items,
  locationSlug,
  ariaLabel,
}: {
  items: RelatedItem[];
  locationSlug: string;
  ariaLabel: string;
}) {
  if (items.length === 0) return null;

  return (
    <aside className="hidden shrink-0 w-[72px] sm:block sm:w-[84px]" aria-label={ariaLabel}>
      <div className="sticky top-4 flex flex-col items-center gap-2 rounded-3xl border border-[#ececec] bg-[#fbfbfa] p-2">
        <div className="flex max-h-[60vh] flex-col items-center gap-3 overflow-y-auto no-scrollbar [mask-image:linear-gradient(to_bottom,transparent,#000_14px,#000_calc(100%-14px),transparent)]">
          {items.map((it) => (
            <Link
              key={it.id}
              href={`/${locationSlug}/item/${it.id}`}
              aria-label={it.name}
              title={it.name}
              className="group relative block aspect-square w-12 shrink-0 overflow-hidden rounded-full border border-[#e6e3dc] bg-[#f3f2ef] transition duration-300 hover:scale-105 hover:border-[#c49262] sm:w-14"
            >
              {it.photo ? (
                <Image
                  src={it.photo}
                  alt={it.name}
                  fill
                  sizes="56px"
                  className="object-cover transition duration-500 group-hover:scale-110"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-xl text-[#d8d6d0]">
                  ◍
                </span>
              )}
            </Link>
          ))}
        </div>

        {items.length > 4 && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#bdbdbd]">
            <ChevronDown size={15} strokeWidth={2} />
          </span>
        )}
      </div>
    </aside>
  );
}

/** Названия в данных капсом — приводим к человеческому виду. */
function capitalize(s: string): string {
  if (!s) return s;
  const lower = s.toLocaleLowerCase('ru');
  return lower.charAt(0).toLocaleUpperCase('ru') + lower.slice(1);
}
