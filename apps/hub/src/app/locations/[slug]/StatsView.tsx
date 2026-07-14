import type { StatsRow } from '@barviha/db';
import { STATS_ENABLED } from '@barviha/db/stats-flag';
import { menuAssetUrl } from '@/lib/menu-origin';

const REALM_LABEL: Record<string, string> = { kitchen: 'Кухня', hookah: 'Кальяны', bar: 'Бар' };

/** Сводка «что чаще смотрят / чаще добавляют» по всем разделам локации —
 * счётчики готовы и работают (см. @barviha/db/stats), но пока выключены
 * общим флагом STATS_ENABLED, поэтому цифры нулевые. Включить — см. project
 * memory про заготовку счётчиков. */
export function StatsView({ rows }: { rows: StatsRow[] }) {
  const totalViews = rows.reduce((sum, r) => sum + r.views, 0);
  const withViews = rows.filter((r) => r.views > 0).sort((a, b) => b.views - a.views);
  const winners = withViews.filter((r) => r.conversionPct != null).sort((a, b) => (b.conversionPct ?? 0) - (a.conversionPct ?? 0));
  const losers = [...winners].reverse();
  const byViews = [...rows].sort((a, b) => b.views - a.views);

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-8 py-6">
      {!STATS_ENABLED && (
        <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-xs text-[color:var(--muted)]">
          Счётчики просмотров и добавлений в корзину пока выключены — все цифры ниже нулевые.
          Инфраструктура готова, включаем по запросу.
        </div>
      )}

      {totalViews === 0 ? (
        <div className="py-10 text-center text-sm text-[color:var(--muted)]">
          Данных ещё нет — будут копиться после включения счётчиков.
        </div>
      ) : (
        <>
          <StatsSection title="Топ просмотров" rows={byViews.slice(0, 10)} highlight="views" />
          <StatsSection title="Выигрышная позиция (лучшая конверсия)" rows={winners.slice(0, 10)} highlight="conversion" />
          <StatsSection title="Проседает (просмотры есть, конверсия низкая)" rows={losers.slice(0, 10)} highlight="conversion" />
        </>
      )}

      <div>
        <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted)]">Все позиции</div>
        <StatsTable rows={byViews} />
      </div>
    </div>
  );
}

function StatsSection({
  title,
  rows,
  highlight,
}: {
  title: string;
  rows: StatsRow[];
  highlight: 'views' | 'conversion';
}) {
  if (rows.length === 0) return null;
  return (
    <div>
      <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[color:var(--muted)]">{title}</div>
      <StatsTable rows={rows} highlight={highlight} />
    </div>
  );
}

function StatsTable({ rows, highlight }: { rows: StatsRow[]; highlight?: 'views' | 'conversion' }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[color:var(--border)]">
      {rows.map((r) => {
        const photoUrl = menuAssetUrl(r.photo);
        return (
          <div
            key={`${r.realm}-${r.id}`}
            className="flex items-center gap-3 border-b border-[color:var(--border)] px-4 py-2.5 last:border-b-0"
          >
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-[color:var(--border)] bg-[color:var(--surface-2)]">
              {photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- фото отдаёт другой Next-сервер (apps/menu)
                <img src={photoUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-[color:var(--text)]">{r.name}</div>
              <div className="text-xs text-[color:var(--muted)]">{REALM_LABEL[r.realm] ?? r.realm}</div>
            </div>
            <div
              className={`shrink-0 text-right text-sm tabular-nums ${highlight === 'views' ? 'font-medium text-[color:var(--text)]' : 'text-[color:var(--text-soft)]'}`}
            >
              {r.views} <span className="text-[10px] text-[color:var(--muted)]">просм.</span>
            </div>
            <div className="shrink-0 text-right text-sm tabular-nums text-[color:var(--text-soft)]">
              {r.adds} <span className="text-[10px] text-[color:var(--muted)]">доб.</span>
            </div>
            <div
              className={`w-16 shrink-0 text-right text-sm tabular-nums ${highlight === 'conversion' ? 'font-medium text-[color:var(--accent)]' : 'text-[color:var(--muted)]'}`}
            >
              {r.conversionPct != null ? `${r.conversionPct}%` : '—'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
