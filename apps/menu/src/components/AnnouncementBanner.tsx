'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Disc3, Trophy, Sparkles } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import type { Announcement } from '@barviha/db';
import type { Locale } from '@/i18n/routing';

const ICONS = { dj: Disc3, match: Trophy, event: Sparkles } as const;

function pick(a: Announcement, field: 'title' | 'subtitle', locale: Locale): string | undefined {
  if (locale === 'en') return a[`${field}_en`] ?? a[field];
  if (locale === 'zh') return a[`${field}_zh`] ?? a[field];
  if (locale === 'hy') return a[`${field}_hy`] ?? a[field];
  return a[field];
}

/** Всплывающий анонс (DJ-сет, матч, событие) — аккуратно вылетает снизу. */
export function AnnouncementBanner({ announcements }: { announcements: Announcement[] }) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const t = useTranslations('announce');
  const locale = useLocale() as Locale;

  const active = announcements.find((a) => !dismissed.includes(a.id));
  if (!active) return null;

  const Icon = ICONS[active.type] ?? Sparkles;

  return (
    <AnimatePresence>
      <motion.div
        key={active.id}
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="fixed bottom-24 left-1/2 z-40 w-[min(92vw,420px)] -translate-x-1/2"
      >
        <div className="relative flex items-center gap-3 overflow-hidden rounded-sm border border-gold bg-card px-4 py-3 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(218,193,120,0.18),transparent_60%)]" />
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold">
            <Icon size={18} />
          </div>
          <div className="relative min-w-0 flex-1">
            <div className="text-[9px] uppercase tracking-[0.25em] text-gold">{t(active.type)}</div>
            <div className="text-sm text-foreground font-medium truncate">{pick(active, 'title', locale)}</div>
            {pick(active, 'subtitle', locale) && (
              <div className="text-[11px] text-muted truncate">{pick(active, 'subtitle', locale)}</div>
            )}
          </div>
          <button
            onClick={() => setDismissed((d) => [...d, active.id])}
            aria-label="close"
            className="relative shrink-0 text-muted hover:text-gold cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
