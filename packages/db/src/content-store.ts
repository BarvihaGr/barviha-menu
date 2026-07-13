/**
 * Файловое хранилище редактируемого контента (этап 1 бэк-офиса — до
 * подключения Supabase). Читает/пишет JSON в packages/db/content/**.
 * Server-only (Node fs) — не импортировать из client-компонентов.
 *
 * cwd у apps/menu и apps/hub разный (pnpm --filter запускает каждый пакет
 * из его собственной директории), поэтому путь до packages/db/content
 * резолвим не от cwd, а подъёмом вверх до pnpm-workspace.yaml.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

let cachedRoot: string | null = null;

function findWorkspaceRoot(startDir: string): string {
  let dir = startDir;
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(`Не нашёл pnpm-workspace.yaml вверх от ${startDir}`);
}

function contentDir(): string {
  if (!cachedRoot) cachedRoot = findWorkspaceRoot(process.cwd());
  return join(cachedRoot, 'packages/db/content');
}

export function readContentJson<T>(relPath: string): T {
  const full = join(contentDir(), relPath);
  return JSON.parse(readFileSync(full, 'utf-8')) as T;
}

export function writeContentJson<T>(relPath: string, data: T): void {
  const full = join(contentDir(), relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

/** Абсолютный путь до public/ приложения menu — для сохранения загруженных фото. */
export function menuPublicDir(): string {
  if (!cachedRoot) cachedRoot = findWorkspaceRoot(process.cwd());
  return join(cachedRoot, 'apps/menu/public');
}
