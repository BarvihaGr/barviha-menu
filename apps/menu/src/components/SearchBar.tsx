'use client';

import { Search, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useMemo, useState } from 'react';
import type { ResolvedMenuItem } from '@barviha/db';
import { pickItemName, pickItemDescription } from '@/lib/i18n-helpers';
import { searchItems } from '@/lib/search';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { formatPrice } from '@/lib/utils';

interface Props {
  items: ResolvedMenuItem[];
  locationSlug: string;
}

export function SearchBar({ items, locationSlug }: Props) {
  const [query, setQuery] = useState('');
  const t = useTranslations();
  const locale = useLocale() as Locale;

  const results = useMemo(() => searchItems(items, query, 10), [items, query]);
  const showDropdown = query.trim().length > 0;

  return (
    <div className="relative">
      <div className="flex items-center gap-3 border border-[color:var(--border)] bg-card px-4 py-3 rounded-sm focus-within:border-gold transition">
        <Search size={16} className="text-gold/70" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search.placeholder')}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
          aria-label={t('common.search')}
        />
        {query && (
          <button onClick={() => setQuery('')} aria-label="clear" className="text-muted hover:text-gold cursor-pointer">
            <X size={16} />
          </button>
        )}
      </div>
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 z-20 max-h-96 overflow-y-auto rounded-sm border border-gold bg-card shadow-2xl">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs uppercase tracking-[0.2em] text-muted">
              {t('search.noResults')}
            </div>
          ) : (
            results.map(({ item }) => (
              <Link
                key={item.id}
                href={`/${locationSlug}/item/${item.id}`}
                onClick={() => setQuery('')}
                className="flex items-center justify-between gap-3 border-b border-[color:var(--border)] px-4 py-3 last:border-b-0 hover:bg-black/30 transition cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-sm text-foreground truncate">{pickItemName(item, locale)}</div>
                  <div className="text-[11px] text-muted truncate">
                    {pickItemDescription(item, locale)}
                  </div>
                </div>
                <span className="shrink-0 text-sm text-gold">{formatPrice(item.price)}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
