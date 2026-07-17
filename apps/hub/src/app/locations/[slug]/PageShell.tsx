import { getSessionAccount } from '@/lib/auth/session';
import { visibleTabsFor } from '@/lib/auth/permissions';
import { TabNav } from './TabNav';

/** Оболочка страницы локации — заголовок и вкладки закреплены сверху,
 * скроллится только содержимое (см. locations/layout.tsx — родитель должен
 * быть высотой в весь экран, иначе overflow-y-auto тут не сработает).
 * Реальный запрет доступа к чужим вкладкам — в middleware.ts; здесь только
 * визуальное сужение навигации (manager не должен видеть мёртвые ссылки на
 * вкладки, которые всё равно отредиректят обратно). */
export async function PageShell({
  name,
  slug,
  children,
}: {
  name: string;
  slug: string;
  children: React.ReactNode;
}) {
  const session = await getSessionAccount();
  const visibleTabs = visibleTabsFor(session?.role ?? 'big_boss');

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0">
        <div className="glitch-text px-4 pt-6 text-xl font-black tracking-tight text-[color:var(--text)] sm:px-8">
          {name}
        </div>
        <TabNav slug={slug} visibleTabs={visibleTabs} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
