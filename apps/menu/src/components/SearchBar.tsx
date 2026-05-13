'use client';

import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { ResolvedMenuItem } from '@barviha/db';
import { useLocale } from 'next-intl';
import { pickItemName, pickItemDescription } from '@/lib/i18n-helpers';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/utils';

interface Props {
  items: ResolvedMenuItem[];
  locationSlug: string;
}

export function SearchBar({ items, locationSlug }: Props) {
  const [query, setQuery] = useState('');
  const t = useTranslations('common');
  const locale = useLocale() as Locale;

  const filtered = query
    ? items
        .filter((i) => {
          const n = pickItemName(i, locale).toLowerCase();
          const d = (pickItemDescription(i, locale) ?? '').toLowerCase();
          const q = query.toLowerCase();
          return n.includes(q) || d.includes(q);
        })
        .slice(0, 8)
    : [];

  return (
    <div className="relative">
      <div className="flex items-center gap-3 border border-[color:var(--border)] bg-card px-4 py-3 rounded-sm focus-within:border-gold transition">
        <Search size={16} className="text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search')}
          className="flex-1 bg-transparent text-sm text-white placeholder:text-muted outline-none"
        />
        {query && (
          <button onClick={() => setQuery('')} aria-label="clear" className="text-muted hover:text-gold cursor-pointer">
            <X size={16} />
          </button>
        )}
      </div>
      {filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-20 max-h-80 overflow-y-auto border border-gold bg-card shadow-2xl">
          {filtered.map((it) => (
            <Link
              key={it.id}
              href={`/${locationSlug}/item/${it.id}`}
              onClick={() => setQuery('')}
              className="flex items-center justify-between border-b border-[color:var(--border)] px-4 py-3 last:border-b-0 hover:bg-black/30 cursor-pointer"
            >
              <div className="min-w-0">
                <div className="text-sm text-white truncate">{pickItemName(it, locale)}</div>
                <div className="text-[11px] text-muted truncate">
                  {pickItemDescription(it, locale)}
                </div>
              </div>
              <span className="ml-3 shrink-0 text-sm text-gold">{formatPrice(it.price)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
