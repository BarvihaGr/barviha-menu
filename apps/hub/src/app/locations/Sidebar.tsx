'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface LocationRow {
  slug: string;
  name: string;
}

export function Sidebar({ templates, working }: { templates: LocationRow[]; working: LocationRow[] }) {
  const pathname = usePathname();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filteredTemplates = templates.filter((loc) => !q || loc.name.toLowerCase().includes(q));
  const filteredWorking = working.filter((loc) => !q || loc.name.toLowerCase().includes(q));

  const row = (loc: LocationRow) => {
    const href = `/locations/${loc.slug}`;
    // pathname.startsWith(href) ложно совпадал бы для 'arka' на роуте
    // '/locations/arka-network' (тот же префикс строки) — сравниваем точное
    // совпадение или следующий сегмент пути (например, '/locations/arka/kitchen').
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        key={loc.slug}
        href={href}
        className={`flex items-center justify-between gap-2 border-l-2 px-5 py-2.5 text-sm transition-colors ${
          active
            ? 'border-l-[color:var(--accent)] bg-[color:var(--surface-2)] text-[color:var(--text)]'
            : 'border-l-transparent text-[color:var(--text-soft)] hover:bg-[color:var(--surface-2)]/60'
        }`}
      >
        <span className="truncate">{loc.name}</span>
      </Link>
    );
  };

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-[color:var(--border)] bg-[color:var(--surface)]">
      <div className="border-b border-[color:var(--border)] px-5 py-4">
        <div className="glitch-text text-[10px] font-bold uppercase tracking-[0.3em] text-[color:var(--text)]">
          Barviha
        </div>
        <div className="text-sm font-medium text-[color:var(--text-soft)]">Бэк-офис меню</div>
      </div>
      <div className="border-b border-[color:var(--border)] px-3 py-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск локации…"
          className="input"
        />
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {filteredTemplates.length > 0 && (
          <>
            <div className="px-5 pb-1 pt-3 text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted)]">
              Тест лок
            </div>
            {filteredTemplates.map(row)}
          </>
        )}

        {filteredWorking.length > 0 && (
          <>
            <div className="mt-2 border-t border-[color:var(--border)] px-5 pb-1 pt-3 text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted)]">
              Локации сети
            </div>
            {filteredWorking.map(row)}
          </>
        )}

        {filteredTemplates.length === 0 && filteredWorking.length === 0 && (
          <div className="px-5 py-6 text-center text-xs text-[color:var(--muted)]">Ничего не найдено</div>
        )}
      </nav>
    </aside>
  );
}
