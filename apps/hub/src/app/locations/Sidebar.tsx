'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { apiPath } from '@/lib/base-path';

interface LocationRow {
  slug: string;
  name: string;
}

type Role = 'big_boss' | 'boss_location' | 'manager' | null;

export function Sidebar({
  templates,
  working,
  role,
}: {
  templates: LocationRow[];
  working: LocationRow[];
  role: Role;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch(apiPath('/api/logout'), { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  // Закрыть мобильную панель при переходе на другую локацию/вкладку — правим
  // стейт прямо во время рендера (без useEffect), см. React docs "Adjusting
  // state when a prop changes": так нет лишнего каскадного ре-рендера после
  // коммита. pathname — примитив, сравнение по значению безопасно.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }

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
    <>
      {/* Мобильный топ-бар — вместо постоянного сайдбара на узких экранах */}
      <div className="flex shrink-0 items-center justify-between border-b border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Открыть список локаций"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--text-soft)] hover:bg-[color:var(--surface-2)]"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>
        <div className="glitch-text text-[10px] font-bold uppercase tracking-[0.3em] text-[color:var(--text)]">
          Barviha
        </div>
        <span className="w-8" />
      </div>

      {/* Затемнение фона при открытой мобильной панели */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col border-r border-[color:var(--border)] bg-[color:var(--surface)] transition-transform duration-200 md:static md:z-auto md:h-full md:w-64 md:shrink-0 md:translate-x-0 ${
          open ? 'translate-x-0' : ''
        }`}
      >
        <div className="flex items-center justify-between border-b border-[color:var(--border)] px-5 py-4">
          <div>
            <div className="glitch-text text-[10px] font-bold uppercase tracking-[0.3em] text-[color:var(--text)]">
              Barviha
            </div>
            <div className="text-sm font-medium text-[color:var(--text-soft)]">Бэк-офис меню</div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Закрыть"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[color:var(--muted)] hover:bg-[color:var(--surface-2)] md:hidden"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
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
          {(role === 'big_boss' || role === 'boss_location') && (
            <Link
              href="/locations"
              className={`flex items-center gap-2 border-l-2 px-5 py-2.5 text-sm font-medium transition-colors ${
                pathname === '/locations'
                  ? 'border-l-[color:var(--accent)] bg-[color:var(--surface-2)] text-[color:var(--text)]'
                  : 'border-l-transparent text-[color:var(--text-soft)] hover:bg-[color:var(--surface-2)]/60'
              }`}
            >
              Дашборд
            </Link>
          )}

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
        <div className="border-t border-[color:var(--border)] p-3">
          {(role === 'big_boss' || role === 'boss_location') && (
            <Link
              href="/accounts"
              className={`mb-1 block rounded-lg px-3 py-2 text-left text-xs transition hover:bg-[color:var(--surface-2)] ${
                pathname === '/accounts' ? 'text-[color:var(--accent)]' : 'text-[color:var(--muted)]'
              }`}
            >
              {role === 'big_boss' ? 'Аккаунты' : 'Менеджеры'}
            </Link>
          )}
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-lg px-3 py-2 text-left text-xs text-[color:var(--muted)] transition hover:bg-[color:var(--surface-2)] hover:text-[color:var(--danger)]"
          >
            Выйти
          </button>
        </div>
      </aside>
    </>
  );
}
