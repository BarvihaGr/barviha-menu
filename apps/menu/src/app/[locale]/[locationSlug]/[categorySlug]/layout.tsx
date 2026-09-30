import { notFound } from 'next/navigation';

/** Разделы меню, у которых есть страница (кальяны отсюда редиректятся на свой маршрут). */
const SECTIONS = new Set(['kitchen', 'bar', 'hookah']);

/**
 * Несуществующий раздел (/paveletskaia/abc) должен отвечать 404. Проверка
 * стоит в layout, а не в page: рядом лежит loading.tsx, и notFound() из
 * страницы срабатывает уже после начала стриминга — статус остаётся 200, а
 * гость видит пустой экран. Layout выполняется до Suspense-границы loading.
 */
export default async function CategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  if (!SECTIONS.has(categorySlug)) notFound();
  return children;
}
