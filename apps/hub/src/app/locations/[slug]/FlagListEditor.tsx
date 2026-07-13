'use client';

import { useRouter } from 'next/navigation';
import type { FlagListItem } from '@barviha/db';
import { menuAssetUrl } from '@/lib/menu-origin';

const REALM_LABEL: Record<string, string> = { kitchen: 'Кухня', hookah: 'Кальяны', bar: 'Бар' };

/** Плоский список позиций из «Стоп-лист» и «Архив» — сводка по всем разделам
 * (Кухня/Бар/Кальяны) в одном месте, с одной кнопкой возврата в меню, без
 * полной формы редактирования (для этого — обычные вкладки разделов). */
export function FlagListEditor({
  slug,
  items,
  mode,
}: {
  slug: string;
  items: FlagListItem[];
  mode: 'stop-list' | 'archive';
}) {
  const router = useRouter();

  async function restore(item: FlagListItem) {
    const patch = mode === 'stop-list' ? { is_available: true } : { is_archived: false };
    await fetch(`/api/locations/${slug}/flag/${item.realm}/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className="px-8 py-10 text-center text-sm text-[color:var(--muted)]">
        {mode === 'stop-list' ? 'Стоп-лист пуст' : 'Архив пуст'}
      </div>
    );
  }

  return (
    <div className="divide-y divide-[color:var(--border)]">
      {items.map((item) => {
        const photoUrl = menuAssetUrl(item.photo);
        return (
          <div key={`${item.realm}-${item.id}`} className="flex items-center gap-3 px-8 py-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)]">
              {photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- фото отдаёт другой Next-сервер (apps/menu)
                <img src={photoUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-[color:var(--text)]">{item.name}</div>
              <div className="text-xs text-[color:var(--muted)]">{REALM_LABEL[item.realm] ?? item.realm}</div>
            </div>
            <div className="shrink-0 text-sm text-[color:var(--text-soft)]">{item.price} ₽</div>
            <button
              type="button"
              onClick={() => restore(item)}
              className="shrink-0 rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs text-[color:var(--text-soft)] hover:bg-[color:var(--surface-2)]"
            >
              {mode === 'stop-list' ? 'Вернуть в меню' : 'Вернуть из архива'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
