'use client';

import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import type { AfishaEvent } from '@barviha/db';
import type { Locale } from '@/i18n/routing';

function pick(e: AfishaEvent, field: 'eyebrow' | 'title' | 'when', locale: Locale): string {
  if (locale === 'en') return e[`${field}_en`] ?? e[field];
  return e[field];
}

/**
 * Бегущая строка-маркиза с афишей под золотой линией (как в макете concepts).
 * Бесконечный горизонтальный скролл: дублируем ленту дважды и гоним от 0 до −50%.
 * Full-bleed во всю ширину экрана. Прячется, если событий нет.
 */
export function EventMarquee({ events }: { events: AfishaEvent[] }) {
  const locale = useLocale() as Locale;
  if (events.length === 0) return null;

  return (
    <section className="relative left-1/2 -translate-x-1/2 w-screen max-w-[100vw] overflow-hidden bg-[#160C06] py-3">
      <motion.div
        className="flex shrink-0 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 24, ease: 'linear', repeat: Infinity }}
      >
        {[0, 1].map((dup) => (
          <span key={dup} className="flex items-center" aria-hidden={dup === 1}>
            {events.map((e) => (
              <span
                key={e.id}
                className="flex items-center text-[11px] uppercase tracking-[0.3em] text-[#F4E9D5]/75"
              >
                <span className="mx-4 text-[#C49262]">✦</span>
                <span className="text-[#C49262]">{pick(e, 'eyebrow', locale)}</span>
                <span className="mx-2">·</span>
                {pick(e, 'title', locale)}
                <span className="mx-2 text-[#C49262]/60">{pick(e, 'when', locale)}</span>
              </span>
            ))}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
