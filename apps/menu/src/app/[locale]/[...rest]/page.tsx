import { notFound } from 'next/navigation';

/**
 * Ловит всё, что не совпало ни с одним маршрутом внутри локали, и отдаёт
 * локализованную 404 ([locale]/not-found.tsx) с настоящим статусом 404.
 * Сюда же middleware переписывает несуществующие локации и разделы: у
 * разделов есть loading.tsx, а после начала стриминга статус уже не
 * поменять — notFound() оттуда уходил с кодом 200.
 */
export default function CatchAllNotFound() {
  notFound();
}
