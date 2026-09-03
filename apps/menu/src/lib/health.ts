/**
 * Самодиагностика боевого меню — то, что читает внешний монитор (бот) через
 * GET /api/health и по чему решает, надо ли звать починку (scripts/doctor.sh).
 *
 * Проверки подобраны по реальным авариям этого проекта, а не «вообще»:
 *  - build   — 2026-08-25 деплой подменил боевую .next недособранным
 *              каталогом: `next start` падал 1200+ раз, nginx отдавал
 *              страницу техработ. Отсутствие BUILD_ID ловит это сразу;
 *  - content — packages/db/content не в git и живёт только на диске VDS
 *              (см. project memory): пустой/битый content-store = белые
 *              страницы меню при формально живом процессе;
 *  - photos  — фото лежат в apps/menu/public и раздаются nginx мимо Node;
 *              пропажа каталога не роняет процесс, но ломает всё меню;
 *  - disk    — на VDS уже копились .next-old/.next-broken и нератированные
 *              логи pm2; переполнение диска роняет и сборку, и sshd.
 *
 * Всё синхронное и дешёвое (stat + пара readFile), без сети и без git —
 * эндпоинт обязан отвечать даже когда приложению плохо.
 */
import { existsSync, readFileSync, readdirSync, statSync, statfsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { MOCK_LOCATIONS } from '@barviha/db';

export type CheckStatus = 'ok' | 'warn' | 'fail';

export interface HealthCheck {
  /** Машинный идентификатор — по нему бот решает, что чинить. */
  name: string;
  status: CheckStatus;
  /** Человекочитаемая расшифровка (по-русски — отчёт читает владелец). */
  detail: string;
}

export interface HealthReport {
  ok: boolean;
  status: CheckStatus;
  /** ISO-время ответа — чтобы монитор видел, что ответ не из кеша. */
  checkedAt: string;
  uptimeSec: number;
  buildId: string | null;
  commit: string | null;
  checks: HealthCheck[];
}

/** Корень монорепо — тем же способом, что и content-store (подъём до pnpm-workspace.yaml). */
function workspaceRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

function checkBuild(root: string): { check: HealthCheck; buildId: string | null } {
  const dist = join(root, 'apps/menu/.next');
  const buildIdPath = join(dist, 'BUILD_ID');
  if (!existsSync(dist)) {
    return {
      check: { name: 'build', status: 'fail', detail: 'нет каталога apps/menu/.next — приложение поднято без сборки' },
      buildId: null,
    };
  }
  if (!existsSync(buildIdPath)) {
    return {
      check: {
        name: 'build',
        status: 'fail',
        detail: 'в apps/menu/.next нет BUILD_ID — сборка оборвана или подменена недособранной',
      },
      buildId: null,
    };
  }
  const buildId = readFileSync(buildIdPath, 'utf-8').trim();
  return { check: { name: 'build', status: 'ok', detail: `сборка на месте, BUILD_ID ${buildId}` }, buildId };
}

function checkContent(root: string): HealthCheck {
  const contentDir = join(root, 'packages/db/content');
  if (!existsSync(contentDir)) {
    return { name: 'content', status: 'fail', detail: 'нет packages/db/content — контент-стор пропал с диска' };
  }
  let dirs: string[];
  try {
    dirs = readdirSync(contentDir).filter((d) => statSync(join(contentDir, d)).isDirectory());
  } catch (e) {
    return { name: 'content', status: 'fail', detail: `packages/db/content не читается: ${String(e)}` };
  }
  const expected = MOCK_LOCATIONS.length;
  // Каждая локация обязана иметь location.json — по нему строится страница.
  const broken: string[] = [];
  for (const slug of dirs) {
    const f = join(contentDir, slug, 'location.json');
    if (!existsSync(f)) {
      broken.push(slug);
      continue;
    }
    try {
      JSON.parse(readFileSync(f, 'utf-8'));
    } catch {
      broken.push(`${slug} (битый JSON)`);
    }
  }
  if (broken.length > 0) {
    return {
      name: 'content',
      status: 'fail',
      detail: `битые/неполные папки контента: ${broken.slice(0, 5).join(', ')}${broken.length > 5 ? ` и ещё ${broken.length - 5}` : ''}`,
    };
  }
  if (dirs.length < expected) {
    return {
      name: 'content',
      status: 'warn',
      detail: `папок контента ${dirs.length}, локаций в каталоге ${expected} — часть локаций отдаёт данные по умолчанию`,
    };
  }
  return { name: 'content', status: 'ok', detail: `контент-стор на месте: ${dirs.length} локаций` };
}

function checkPhotos(root: string): HealthCheck {
  const dir = join(root, 'apps/menu/public/menu-admin');
  if (!existsSync(dir)) {
    return { name: 'photos', status: 'fail', detail: 'нет apps/menu/public/menu-admin — фото меню не раздаются' };
  }
  try {
    const n = readdirSync(dir).length;
    if (n === 0) return { name: 'photos', status: 'warn', detail: 'каталог фото пуст' };
    return { name: 'photos', status: 'ok', detail: `каталоги фото на месте: ${n}` };
  } catch (e) {
    return { name: 'photos', status: 'fail', detail: `каталог фото не читается: ${String(e)}` };
  }
}

function checkDisk(root: string): HealthCheck {
  try {
    const s = statfsSync(root);
    const freeBytes = Number(s.bavail) * Number(s.bsize);
    const totalBytes = Number(s.blocks) * Number(s.bsize);
    const freeGb = freeBytes / 1024 ** 3;
    const usedPct = Math.round(100 - (freeBytes / totalBytes) * 100);
    if (freeGb < 2) {
      return { name: 'disk', status: 'fail', detail: `свободно ${freeGb.toFixed(1)} ГБ (${usedPct}% занято) — сборка не пройдёт` };
    }
    if (freeGb < 5) {
      return { name: 'disk', status: 'warn', detail: `свободно ${freeGb.toFixed(1)} ГБ (${usedPct}% занято) — пора чистить` };
    }
    return { name: 'disk', status: 'ok', detail: `свободно ${freeGb.toFixed(1)} ГБ (${usedPct}% занято)` };
  } catch (e) {
    return { name: 'disk', status: 'warn', detail: `не смог прочитать статистику диска: ${String(e)}` };
  }
}

/** Коммит, на котором собрано приложение — читаем .git напрямую, без запуска git. */
function readCommit(root: string): string | null {
  try {
    const head = readFileSync(join(root, '.git/HEAD'), 'utf-8').trim();
    if (!head.startsWith('ref:')) return head.slice(0, 12);
    const ref = head.slice(4).trim();
    const refPath = join(root, '.git', ref);
    if (existsSync(refPath)) return readFileSync(refPath, 'utf-8').trim().slice(0, 12);
    // Упакованные ссылки (после gc) — ищем строку в packed-refs.
    const packed = readFileSync(join(root, '.git/packed-refs'), 'utf-8');
    const line = packed.split('\n').find((l) => l.endsWith(` ${ref}`));
    const hash = line?.split(' ')[0];
    return hash ? hash.slice(0, 12) : null;
  } catch {
    return null;
  }
}

/** Итоговый статус: fail важнее warn, warn важнее ok. */
function worst(checks: HealthCheck[]): CheckStatus {
  if (checks.some((c) => c.status === 'fail')) return 'fail';
  if (checks.some((c) => c.status === 'warn')) return 'warn';
  return 'ok';
}

export function buildHealthReport(): HealthReport {
  const root = workspaceRoot();
  const { check: build, buildId } = checkBuild(root);
  const checks: HealthCheck[] = [
    { name: 'process', status: 'ok', detail: `процесс отвечает, uptime ${Math.round(process.uptime())} c` },
    build,
    checkContent(root),
    checkPhotos(root),
    checkDisk(root),
  ];
  const status = worst(checks);
  return {
    ok: status !== 'fail',
    status,
    checkedAt: new Date().toISOString(),
    uptimeSec: Math.round(process.uptime()),
    buildId,
    commit: readCommit(root),
    checks,
  };
}
