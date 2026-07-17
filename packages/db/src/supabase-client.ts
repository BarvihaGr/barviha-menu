import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { AccountRole } from './accounts';

interface AccountsTable {
  Row: {
    id: string;
    login: string;
    login_key: string;
    password_hash: string;
    role: AccountRole;
    location_slug: string | null;
    display_name: string;
    created_by: string | null;
    is_active: boolean;
    last_login_at: string | null;
    created_at: string;
  };
  Insert: {
    login: string;
    password_hash: string;
    role: AccountRole;
    location_slug: string | null;
    display_name: string;
    created_by: string | null;
  };
  Update: Partial<AccountsTable['Row']>;
  Relationships: [];
}

/** Минимальный ручной аналог `supabase gen types typescript` — только то,
 * что реально используется (таблица accounts). Расширять по мере
 * подключения новых таблиц, не пытаться отразить всю схему заранее. */
export interface Database {
  public: {
    Tables: {
      accounts: AccountsTable;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

/**
 * Единственный Supabase-клиент пакета — всегда на service-role ключе,
 * только на сервере (RSC/route handlers/скрипты). Никогда не импортировать
 * из клиентских компонентов — 'server-only' роняет сборку, если это
 * случайно попадёт в браузерный бандл (ключ даёт полный доступ к БД в обход RLS).
 */
let client: ReturnType<typeof createClient<Database>> | null = null;

export function supabase() {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY не заданы в окружении');
  }
  client = createClient<Database>(url, key, { auth: { persistSession: false } });
  return client;
}
