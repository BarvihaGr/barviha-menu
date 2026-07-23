import { redirect } from 'next/navigation';
import { getClient, TEMPLATE_SLUGS } from '@barviha/db';
import { getSessionAccount } from '@/lib/auth/session';
import { defaultPathFor } from '@/lib/auth/permissions';
import { LocationCard } from './LocationCard';

/**
 * Дашборд-главная бэк-офиса — сетка всех рабочих локаций сети со статусом
 * (вкл/выкл прямо тут, координаты проставлены или нет) и быстрым переходом
 * в Кухню/Бар/Кальяны. Только для big_boss/boss_location — у manager своя
 * локация как единственная точка входа (см. defaultPathFor), сюда ему
 * попадать незачем.
 */
export default async function LocationsDashboardPage() {
  const session = await getSessionAccount();
  if (session && session.role !== 'big_boss' && session.role !== 'boss_location') {
    redirect(defaultPathFor(session));
  }

  const db = getClient();
  const all = await db.getAllLocations();
  const templateSet = new Set<string>(TEMPLATE_SLUGS);
  const working = all.filter((l) => !templateSet.has(l.slug));

  const activeCount = working.filter((l) => l.is_active !== false).length;
  const geoCount = working.filter((l) => l.latitude != null && l.longitude != null).length;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 px-4 pt-6 sm:px-8">
        <h1 className="glitch-text text-xl font-black tracking-tight text-[color:var(--text)]">
          Пульт управления
        </h1>
        <p className="mt-1 text-sm text-[color:var(--muted)]">
          {working.length} локаций сети · {activeCount} активны · {geoCount} с проставленными координатами
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {working.map((loc) => (
            <LocationCard
              key={loc.slug}
              slug={loc.slug}
              name={loc.name}
              address={loc.address}
              isActive={loc.is_active !== false}
              hasGeo={loc.latitude != null && loc.longitude != null}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
