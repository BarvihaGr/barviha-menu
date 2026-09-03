import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { buildHealthReport } from '@/lib/health';

/**
 * Точка мониторинга для внешнего бота-наблюдателя.
 *
 * Два уровня ответа намеренно:
 *  - без токена — только `ok`/`status`/время. Столько же знает любой, кто
 *    просто откроет сайт, поэтому эндпоинт безопасно скармливать обычным
 *    uptime-мониторам и не надо прятать;
 *  - с токеном — расшифровка по каждой проверке, BUILD_ID и коммит. Это уже
 *    внутренности сервера (пути, состояние сборки, свободное место), их не
 *    отдаём в открытый интернет.
 *
 * Токен задаётся переменной BARVIHA_HEALTH_TOKEN в окружении процесса меню.
 * Если она не задана — подробный режим просто недоступен; эндпоинт при этом
 * продолжает работать в публичном режиме (health-check не имеет права падать
 * из-за собственной конфигурации, иначе он бесполезен именно тогда, когда
 * нужен).
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function tokenMatches(provided: string): boolean {
  const expected = process.env.BARVIHA_HEALTH_TOKEN;
  if (!expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // timingSafeEqual падает на разной длине — сравниваем длину отдельно.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Токен принимаем и заголовком (для ботов), и query-параметром (для curl вручную). */
function extractToken(request: NextRequest): string {
  const auth = request.headers.get('authorization') ?? '';
  if (auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim();
  return request.nextUrl.searchParams.get('token') ?? '';
}

export async function GET(request: NextRequest) {
  const report = buildHealthReport();
  const full = tokenMatches(extractToken(request));

  const body = full
    ? report
    : {
        ok: report.ok,
        status: report.status,
        checkedAt: report.checkedAt,
      };

  // HTTP-код осмысленный: монитору достаточно кода, разбирать тело не обязано.
  // 503 при fail — стандартный признак «сервис нездоров» для любого uptime-робота.
  return NextResponse.json(body, {
    status: report.status === 'fail' ? 503 : 200,
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  });
}
