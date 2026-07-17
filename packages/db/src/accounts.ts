import 'server-only';
import bcrypt from 'bcryptjs';
import { supabase } from './supabase-client';

export type AccountRole = 'big_boss' | 'boss_location' | 'manager';

export interface AccountRow {
  id: string;
  login: string;
  password_hash: string;
  role: AccountRole;
  location_slug: string | null;
  display_name: string;
  created_by: string | null;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

const SELECT_COLUMNS =
  'id, login, password_hash, role, location_slug, display_name, created_by, is_active, last_login_at, created_at';

export async function findAccountByLoginKey(loginKey: string): Promise<AccountRow | null> {
  const { data, error } = await supabase()
    .from('accounts')
    .select(SELECT_COLUMNS)
    .eq('login_key', loginKey)
    .maybeSingle();
  if (error) throw error;
  return (data as AccountRow | null) ?? null;
}

export async function getAccountById(id: string): Promise<AccountRow | null> {
  const { data, error } = await supabase().from('accounts').select(SELECT_COLUMNS).eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as AccountRow | null) ?? null;
}

export async function listAllAccounts(): Promise<AccountRow[]> {
  const { data, error } = await supabase()
    .from('accounts')
    .select(SELECT_COLUMNS)
    .order('role', { ascending: true })
    .order('display_name', { ascending: true });
  if (error) throw error;
  return (data as AccountRow[]) ?? [];
}

/** Менеджеры, созданные конкретным управляющим локации — для его собственного экрана «Менеджеры». */
export async function listAccountsCreatedBy(creatorId: string): Promise<AccountRow[]> {
  const { data, error } = await supabase()
    .from('accounts')
    .select(SELECT_COLUMNS)
    .eq('created_by', creatorId)
    .order('display_name', { ascending: true });
  if (error) throw error;
  return (data as AccountRow[]) ?? [];
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
  const password_hash = await hashPassword(input.password);
  const { data, error } = await supabase()
    .from('accounts')
    .insert({
      login: input.login,
      password_hash,
      role: input.role,
      location_slug: input.locationSlug,
      display_name: input.displayName,
      created_by: input.createdBy,
    })
    .select(SELECT_COLUMNS)
    .single();
  if (error) throw error;
  return data as AccountRow;
}

export async function setAccountActive(id: string, isActive: boolean): Promise<void> {
  const { error } = await supabase().from('accounts').update({ is_active: isActive }).eq('id', id);
  if (error) throw error;
}

export async function resetAccountPassword(id: string, newPassword: string): Promise<void> {
  const password_hash = await hashPassword(newPassword);
  const { error } = await supabase().from('accounts').update({ password_hash }).eq('id', id);
  if (error) throw error;
}

export async function touchLastLogin(id: string): Promise<void> {
  const { error } = await supabase()
    .from('accounts')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
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
