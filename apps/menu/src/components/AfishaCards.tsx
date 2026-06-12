'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import type { AfishaEvent } from '@barviha/db';
import type { Locale } from '@/i18n/routing';

function pick(e: AfishaEvent, field: 'eyebrow' | 'title' | 'when', locale: Locale): string {
  if (locale === 'en') return e[`${field}_en`] ?? e[field];
  return e[field];
}

/**
 * Редакционные карточки «Афиша» (как в макете concepts): фото-плитка слева,
 * золотой надзаголовок-рубрика, серифное имя события и дата под волосяной
 * линией. Без кнопок — тапается вся карточка. Прячется, если событий нет.
 */
export function AfishaCards({ events }: { events: AfishaEvent[] }) {
  const locale = useLocale() as Locale;
  const t = useTranslations('home');
  if (events.length === 0) return null;

  return (
    <section className="px-2 sm:px-6">
      <div className="mx-auto max-w-[680px]">
        <div className="mb-3 flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#C49262]/70">
            {t('afisha')}
          </span>
          <span className="h-px flex-1 bg-[#C49262]/20" />
        </div>

        <div className="flex flex-col gap-3">
          {events.map((e) => (
            <button key={e.id} type="button" className="group flex items-stretch gap-3 text-left">
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-sm">
                <Image
                  src={e.image}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col justify-center border-b border-[#C49262]/15 pb-2">
                <div className="text-[9px] uppercase tracking-[0.3em] text-[#C49262]">
                  {pick(e, 'eyebrow', locale)}
                </div>
                <div
                  className="text-[#F4E9D5]"
                  style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500 }}
                >
                  {pick(e, 'title', locale)}
                </div>
                <div className="text-[11px] tracking-[0.15em] text-[#F4E9D5]/45">
                  {pick(e, 'when', locale)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
