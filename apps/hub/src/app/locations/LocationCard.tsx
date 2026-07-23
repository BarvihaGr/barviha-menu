'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiPath } from '@/lib/base-path';

export function LocationCard({
  slug,
  name,
  address,
  isActive,
  hasGeo,
}: {
  slug: string;
  name: string;
  address: string | null;
  isActive: boolean;
  hasGeo: boolean;
}) {
  const [active, setActive] = useState(isActive);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !active;
    setSaving(true);
    setActive(next);
    const res = await fetch(apiPath(`/api/locations/${slug}/location`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: next }),
    });
    if (!res.ok) setActive(!next);
    setSaving(false);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/locations/${slug}`}
            className="block truncate text-sm font-medium text-[color:var(--text)] hover:text-[color:var(--accent)]"
          >
            {name}
          </Link>
          {address && <div className="mt-0.5 truncate text-xs text-[color:var(--muted)]">{address}</div>}
        </div>
        <label className="relative inline-flex shrink-0 cursor-pointer items-center" title={active ? 'Локация активна' : 'Локация выключена'}>
          <input type="checkbox" checked={active} onChange={toggle} disabled={saving} className="peer sr-only" />
          <div className="h-6 w-11 rounded-full bg-[color:var(--surface-2)] transition-colors peer-checked:bg-[color:var(--ok)]" />
          <div className="absolute left-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
        </label>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-[color:var(--muted)]">
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${hasGeo ? 'bg-[color:var(--ok)]' : 'bg-[color:var(--muted)]'}`} />
        {hasGeo ? 'координаты есть' : 'координат нет'}
      </div>

      <div className="flex gap-2 text-xs">
        <Link href={`/locations/${slug}/kitchen`} className="rounded-lg border border-[color:var(--border)] px-2.5 py-1 text-[color:var(--text-soft)] hover:bg-[color:var(--surface-2)]">
          Кухня
        </Link>
        <Link href={`/locations/${slug}/bar`} className="rounded-lg border border-[color:var(--border)] px-2.5 py-1 text-[color:var(--text-soft)] hover:bg-[color:var(--surface-2)]">
          Бар
        </Link>
        <Link href={`/locations/${slug}/hookah`} className="rounded-lg border border-[color:var(--border)] px-2.5 py-1 text-[color:var(--text-soft)] hover:bg-[color:var(--surface-2)]">
          Кальяны
        </Link>
      </div>
    </div>
  );
}
