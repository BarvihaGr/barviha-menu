import { TabNav } from './TabNav';

/** Оболочка страницы локации — заголовок и вкладки закреплены сверху,
 * скроллится только содержимое (см. locations/layout.tsx — родитель должен
 * быть высотой в весь экран, иначе overflow-y-auto тут не сработает). */
export function PageShell({
  name,
  slug,
  children,
}: {
  name: string;
  slug: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0">
        <div className="glitch-text px-4 pt-6 text-xl font-black tracking-tight text-[color:var(--text)] sm:px-8">
          {name}
        </div>
        <TabNav slug={slug} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
