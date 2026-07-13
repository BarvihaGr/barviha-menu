import { MOCK_LOCATIONS, TEMPLATE_SLUGS } from '@barviha/db';
import { Sidebar } from './Sidebar';

export default function LocationsLayout({ children }: { children: React.ReactNode }) {
  const templateSet = new Set<string>(TEMPLATE_SLUGS);
  const templates = MOCK_LOCATIONS.filter((l) => templateSet.has(l.slug)).map((l) => ({
    slug: l.slug,
    name: l.name,
  }));
  // «Локации сети» — реальные 27: 25 клонов + отдельные независимые копии
  // 'arka-network'/'kievskaia-network' (см. onboarding.ts) — НЕ те же
  // слаги/файлы, что у тестового эталона выше, поэтому правки не пересекаются.
  const working = MOCK_LOCATIONS.filter((l) => !templateSet.has(l.slug)).map((l) => ({
    slug: l.slug,
    name: l.name,
  }));

  return (
    <div className="flex min-h-screen">
      <Sidebar templates={templates} working={working} />
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
