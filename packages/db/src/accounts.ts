import 'server-only';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { readContentJson, writeContentJson } from './content-store';

/**
 * Аккаунты бэк-офиса — файловое хранилище packages/db/content/accounts.json
 * (вне git, как и весь content-store; пароли только bcrypt-хэшами).
 *
 * Раньше это была таблица `accounts` в Supabase (см. supabase-client.ts) —
 * 2026-09-07 хост проекта перестал резолвиться (NXDOMAIN), логин в /back-off
 * отдавал 500, и это была ЕДИНСТВЕННАЯ внешняя зависимость всего бэк-офиса:
 * меню, настройки локаций, фото — всё и так лежит в файлах на VDS. Перенос
 * аккаунтов в тот же content-store убирает точку отказа; интерфейс модуля
 * оставлен 1:1, вызывающий код (login/accounts API, AccountsView) не менялся.
 *
 * Первичное наполнение — deploy/content-migrations/*-backoffice-accounts
 * (идемпотентно, едет на прод через обычный деплой-крон, без SSH).
 *
 * Read-modify-write по одному маленькому JSON — тот же компромисс, что у
 * позиций меню (см. content-store.ts): при ~30 аккаунтах и редких правках
 * гонки практически исключены.
 */

export type AccountRole = 'big_boss' | 'boss_location' | 'manager';

export interface AccountRow {
  id: string;
  login: string;
  /** login в нижнем регистре — ключ поиска/уникальности (вход не чувствителен к регистру логина). */
  login_key: string;
  password_hash: string;
  role: AccountRole;
  location_slug: string | null;
  display_name: string;
  created_by: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

const ACCOUNTS_FILE = 'accounts.json';

export function loginKeyOf(login: string): string {
  return login.trim().toLowerCase();
}

function readAll(): AccountRow[] {
  try {
    const rows = readContentJson<AccountRow[]>(ACCOUNTS_FILE);
    return Array.isArray(rows) ? rows : [];
  } catch {
    // Файла ещё нет (свежий стенд до первой миграции) — пустой список, а не 500.
    return [];
  }
}

function writeAll(rows: AccountRow[]): void {
  writeContentJson(ACCOUNTS_FILE, rows);
}

const ROLE_ORDER: Record<AccountRole, number> = { big_boss: 0, boss_location: 1, manager: 2 };

export async function findAccountByLoginKey(loginKey: string): Promise<AccountRow | null> {
  return readAll().find((r) => r.login_key === loginKey) ?? null;
}

export async function getAccountById(id: string): Promise<AccountRow | null> {
  return readAll().find((r) => r.id === id) ?? null;
}

export async function listAllAccounts(): Promise<AccountRow[]> {
  return [...readAll()].sort(
    (a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || a.display_name.localeCompare(b.display_name, 'ru'),
  );
}

/** Менеджеры, созданные конкретным управляющим локации — для его собственного экрана «Менеджеры». */
export async function listAccountsCreatedBy(creatorId: string): Promise<AccountRow[]> {
  return readAll()
    .filter((r) => r.created_by === creatorId)
    .sort((a, b) => a.display_name.localeCompare(b.display_name, 'ru'));
}

export interface CreateAccountInput {
  login: string;
  password: string;
  role: AccountRole;
  locationSlug: string | null;
  displayName: string;
  createdBy: string | null;
}

export async function createAccount(input: CreateAccountInput): Promise<AccountRow> {
  const rows = readAll();
  const login_key = loginKeyOf(input.login);
  if (rows.some((r) => r.login_key === login_key)) {
    // Тот же контракт, что был у unique-индекса в БД: вызывающий код
    // (api/accounts) проверяет занятость заранее, это — страховка от гонки.
    throw new Error(`login already taken: ${input.login}`);
  }
  const row: AccountRow = {
    id: randomUUID(),
    login: input.login.trim(),
    login_key,
    password_hash: await hashPassword(input.password),
    role: input.role,
    location_slug: input.locationSlug,
    display_name: input.displayName,
    created_by: input.createdBy,
    is_active: true,
    last_login_at: null,
    created_at: new Date().toISOString(),
  };
  writeAll([...rows, row]);
  return row;
}

function patchAccount(id: string, patch: Partial<AccountRow>): void {
  const rows = readAll();
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return;
  rows[idx] = { ...rows[idx]!, ...patch };
  writeAll(rows);
}

export async function setAccountActive(id: string, isActive: boolean): Promise<void> {
  patchAccount(id, { is_active: isActive });
}

export async function resetAccountPassword(id: string, newPassword: string): Promise<void> {
  patchAccount(id, { password_hash: await hashPassword(newPassword) });
}

export async function touchLastLogin(id: string): Promise<void> {
  patchAccount(id, { last_login_at: new Date().toISOString() });
}

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Валидный bcrypt-хэш заведомо неверного пароля — сравниваем с ним, когда
 * логин не найден, чтобы неудачный вход занимал примерно то же время, что и
 * "логин есть, пароль неверный" (не палим таймингом существование аккаунта).
 */
export const DUMMY_PASSWORD_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8G0dONn8hj/aOCwYYzZOzUEahfoJI.';
