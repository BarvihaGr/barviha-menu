'use client';

import { useMemo, useState } from 'react';
import type { FlagListItem } from '@barviha/db';
import { menuAssetUrl } from '@/lib/menu-origin';
import { apiPath } from '@/lib/base-path';

type Realm = FlagListItem['realm'];
const REALM_ORDER: Realm[] = ['kitchen', 'bar', 'hookah'];
const REALM_LABEL: Record<string, string> = { kitchen: 'Кухня', bar: 'Бар', hookah: 'Кальяны' };

/**
 * Доска «в наличии / стоп-лист» — единственный экран роли manager (админ
 * локации): позиции Кухни/Бара/Кальянов по разделам-вкладкам, внутри —
 * по подкатегориям; название и цена только на чтение, единственное
 * действие — тумблер. Ничего добавить, удалить или переименовать отсюда
 * нельзя (и API для manager закрыт всем, кроме флага is_available — см.
 * middleware.ts / flag-роут).
 *
 * Тумблер переключается оптимистично — сразу в UI, PATCH в фоне; при
 * ошибке откатывается, чтобы экран не врал про то, что на сайте.
 */
export function AvailabilityBoard({ slug, items }: { slug: string; items: FlagListItem[] }) {
  const realms = useMemo(() => REALM_ORDER.filter((r) => items.some((it) => it.realm === r)), [items]);
  const [realm, setRealm] = useState<Realm>(realms[0] ?? 'kitchen');
  const [query, setQuery] = useState('');
  const [state, setState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map((it) => [keyOf(it), it.is_available])),
  );
  const [pending, setPending] = useState<Set<string>>(new Set());

  const stoppedByRealm = useMemo(() => {
    const out: Record<string, number> = {};
    for (const it of items) if (!(state[keyOf(it)] ?? it.is_available)) out[it.realm] = (out[it.realm] ?? 0) + 1;
    return out;
  }, [items, state]);

  // Группы внутри активного раздела — в порядке первого появления (он
  // совпадает с порядком подкатегорий в меню), без сортировки по алфавиту.
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/ё/g, 'е');
    const inRealm = items.filter(
      (it) => it.realm === realm && (!q || it.name.toLowerCase().replace(/ё/g, 'е').includes(q)),
    );
    const order: string[] = [];
    const map = new Map<string, FlagListItem[]>();
    for (const it of inRealm) {
      const g = it.group ?? '';
      if (!map.has(g)) {
        map.set(g, []);
        order.push(g);
      }
      map.get(g)!.push(it);
    }
    return order.map((g) => ({ label: g, items: map.get(g)! }));
  }, [items, realm, query]);

  async function toggle(item: FlagListItem) {
    const key = keyOf(item);
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
      {/* Разделы */}
      <div className="sticky top-0 z-10 border-b border-[color:var(--border)] bg-[color:var(--bg)]/95 px-4 pt-3 pb-3 backdrop-blur sm:px-8">
        <div className="flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {realms.map((r) => {
            const active = r === realm;
            const stopped = stoppedByRealm[r] ?? 0;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRealm(r)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--accent-text)]'
                    : 'border-[color:var(--border)] text-[color:var(--text-soft)] hover:bg-[color:var(--surface-2)]'
                }`}
              >
                {REALM_LABEL[r] ?? r}
                {stopped > 0 && (
                  <span
                    className={`rounded-full px-1.5 text-[11px] tabular-nums ${
                      active ? 'bg-black/20' : 'bg-[color:var(--surface-2)] text-[color:var(--muted)]'
                    }`}
                  >
                    стоп {stopped}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Поиск в разделе «${REALM_LABEL[realm] ?? realm}»…`}
            className="input max-w-xs"
          />
          <span className="text-xs text-[color:var(--muted)]">Выключил — пропало с сайта. Включил — вернулось.</span>
        </div>
      </div>

      {groups.length === 0 && (
        <div className="py-10 text-center text-sm text-[color:var(--muted)]">Ничего не найдено</div>
      )}

      {groups.map((g) => (
        <section key={g.label || '—'}>
          {g.label && (
            <div className="px-4 pt-5 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)] sm:px-8">
              {g.label} <span className="font-normal normal-case tracking-normal">· {g.items.length}</span>
            </div>
          )}
          <div className="divide-y divide-[color:var(--border)] border-y border-[color:var(--border)]">
            {g.items.map((item) => {
              const key = keyOf(item);
              const on = state[key] ?? item.is_available;
              const busy = pending.has(key);
              const photoUrl = menuAssetUrl(item.photo);
              return (
                <div key={key} className={`flex items-center gap-3 px-4 py-3 sm:px-8 ${on ? '' : 'opacity-55'}`}>
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)]">
                    {photoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element -- фото отдаёт другой Next-сервер (apps/menu)
                      <img src={photoUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`truncate text-sm text-[color:var(--text)] ${on ? '' : 'line-through'}`}>{item.name}</div>
                    <div className={`text-xs ${on ? 'text-[color:var(--muted)]' : 'text-[#ff4d6d]'}`}>
                      {on ? 'В наличии' : 'В стоп-листе'}
                    </div>
                  </div>
                  <div className="shrink-0 text-sm tabular-nums text-[color:var(--text-soft)]">{item.price} ₽</div>
                  <Toggle on={on} busy={busy} label={item.name} onClick={() => toggle(item)} />
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

function keyOf(it: FlagListItem): string {
  return `${it.realm}-${it.id}`;
}

/** Геометрия инлайн-стилями нарочно: утилиты Tailwind тут однажды
 * перебились каскадом (трек растянулся, кружок вылетел за трек) — размеры
 * тумблера не должны зависеть ни от чего снаружи. */
function Toggle({ on, busy, label, onClick }: { on: boolean; busy: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={on ? `Убрать «${label}» в стоп-лист` : `Вернуть «${label}» в меню`}
      disabled={busy}
      onClick={onClick}
      style={{
        position: 'relative',
        flexShrink: 0,
        width: 46,
        height: 26,
        padding: 0,
        margin: 0,
        borderRadius: 999,
        border: '1px solid',
        borderColor: on ? '#2fb457' : 'var(--border)',
        background: on ? '#34c759' : 'var(--surface-2)',
        cursor: busy ? 'wait' : 'pointer',
        opacity: busy ? 0.6 : 1,
        transition: 'background-color .15s, border-color .15s',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: 2,
          left: on ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: 999,
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,.35)',
          transition: 'left .15s',
        }}
      />
    </button>
  );
}
