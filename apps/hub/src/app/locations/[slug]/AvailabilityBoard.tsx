'use client';

import { useMemo, useState } from 'react';
import type { FlagListItem } from '@barviha/db';
import { menuAssetUrl } from '@/lib/menu-origin';
import { apiPath } from '@/lib/base-path';

const REALM_ORDER: FlagListItem['realm'][] = ['kitchen', 'bar', 'hookah'];
const REALM_LABEL: Record<string, string> = { kitchen: 'Кухня', bar: 'Бар', hookah: 'Кальяны' };

/**
 * Доска «в наличии / стоп-лист» — единственный экран роли manager (админ
 * локации): все действующие позиции Кухни/Бара/Кальянов, название и цена
 * только на чтение, единственное действие — тумблер. Ничего добавить,
 * удалить или переименовать отсюда нельзя (и API для manager закрыт всем,
 * кроме флага is_available — см. middleware.ts / flag-роут).
 *
 * Тумблер переключается оптимистично — сразу в UI, PATCH в фоне; при
 * ошибке откатывается обратно, чтобы экран не врал про то, что на сайте.
 */
export function AvailabilityBoard({ slug, items }: { slug: string; items: FlagListItem[] }) {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map((it) => [`${it.realm}-${it.id}`, it.is_available])),
  );
  const [pending, setPending] = useState<Set<string>>(new Set());

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/ё/g, 'е');
    const filtered = q ? items.filter((it) => it.name.toLowerCase().replace(/ё/g, 'е').includes(q)) : items;
    return REALM_ORDER.map((realm) => ({
      realm,
      label: REALM_LABEL[realm] ?? realm,
      items: filtered.filter((it) => it.realm === realm),
    })).filter((g) => g.items.length > 0);
  }, [items, query]);

  const stoppedCount = useMemo(() => Object.values(state).filter((v) => !v).length, [state]);

  async function toggle(item: FlagListItem) {
    const key = `${item.realm}-${item.id}`;
    if (pending.has(key)) return;
    const next = !(state[key] ?? item.is_available);
    setState((s) => ({ ...s, [key]: next }));
    setPending((p) => new Set(p).add(key));
    try {
      const res = await fetch(apiPath(`/api/locations/${slug}/flag/${item.realm}/${encodeURIComponent(item.id)}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: next }),
      });
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      setState((s) => ({ ...s, [key]: !next }));
    } finally {
      setPending((p) => {
        const n = new Set(p);
        n.delete(key);
        return n;
      });
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-3 px-4 pt-4 sm:px-8">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по названию…"
          className="input max-w-xs"
        />
        <div className="text-xs text-[color:var(--muted)]">
          {stoppedCount === 0 ? 'Всё в наличии' : `В стоп-листе: ${stoppedCount}`}
        </div>
      </div>
      <p className="px-4 pt-2 pb-1 text-xs text-[color:var(--muted)] sm:px-8">
        Выключенная позиция сразу пропадает с сайта этой локации. Включите обратно — вернётся.
      </p>

      {groups.length === 0 && (
        <div className="py-10 text-center text-sm text-[color:var(--muted)]">Ничего не найдено</div>
      )}

      {groups.map((g) => (
        <div key={g.realm} className="border-b border-[color:var(--border)]">
          <div className="px-4 sm:px-8 pt-4 pb-1 text-sm font-medium text-[color:var(--text-soft)]">
            {g.label} <span className="text-xs text-[color:var(--muted)]">· {g.items.length}</span>
          </div>
          <div className="divide-y divide-[color:var(--border)]">
            {g.items.map((item) => {
              const key = `${item.realm}-${item.id}`;
              const on = state[key] ?? item.is_available;
              const busy = pending.has(key);
              const photoUrl = menuAssetUrl(item.photo);
              return (
                <div key={key} className={`flex items-center gap-3 px-4 py-3 sm:px-8 ${on ? '' : 'opacity-60'}`}>
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)]">
                    {photoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element -- фото отдаёт другой Next-сервер (apps/menu)
                      <img src={photoUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`truncate text-sm text-[color:var(--text)] ${on ? '' : 'line-through'}`}>{item.name}</div>
                    <div className="text-xs text-[color:var(--muted)]">{on ? 'В наличии' : 'В стоп-листе'}</div>
                  </div>
                  <div className="shrink-0 text-sm tabular-nums text-[color:var(--text-soft)]">{item.price} ₽</div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-label={on ? `Убрать «${item.name}» в стоп-лист` : `Вернуть «${item.name}» в меню`}
                    disabled={busy}
                    onClick={() => toggle(item)}
                    className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors disabled:opacity-50 ${
                      on
                        ? 'border-[color:var(--accent)] bg-[color:var(--accent)]'
                        : 'border-[color:var(--border)] bg-[color:var(--surface-2)]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-[22px] w-[22px] rounded-full bg-white shadow transition-transform ${
                        on ? 'translate-x-[22px]' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
