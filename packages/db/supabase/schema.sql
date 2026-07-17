-- Схема аккаунтов/ролей бэк-офиса (Фаза 1). Только структура — без данных и
-- секретов, безопасно коммитить. Данные заводятся отдельно скриптом
-- packages/db/scripts/seed-accounts.ts (пароли берутся из gitignored
-- apps/hub/.env.seed.local, в этот файл никогда не попадают).
--
-- Применить: вставить содержимое в Supabase SQL Editor проекта и выполнить
-- один раз (или через `supabase db push`, если используется Supabase CLI).

create extension if not exists pgcrypto;

create type account_role as enum ('big_boss', 'boss_location', 'manager');

create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  login text not null,
  login_key text generated always as (lower(login)) stored,
  password_hash text not null,
  role account_role not null,
  -- null только для big_boss — у остальных ролей ровно одна локация.
  location_slug text,
  display_name text not null,
  created_by uuid references accounts(id),
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),

  constraint accounts_login_key_unique unique (login_key),
  constraint accounts_big_boss_no_location check (
    (role = 'big_boss' and location_slug is null) or
    (role <> 'big_boss' and location_slug is not null)
  ),
  -- Менеджера всегда кто-то создал (управляющий локации или, в порядке
  -- поддержки/восстановления доступа, big_boss) — для истории "кто кого завёл".
  constraint accounts_manager_has_creator check (role <> 'manager' or created_by is not null)
);

create index if not exists accounts_location_slug_idx on accounts (location_slug) where location_slug is not null;
create index if not exists accounts_created_by_idx on accounts (created_by) where created_by is not null;

alter table accounts enable row level security;
-- Политик намеренно нет — доступ только через service-role ключ (обходит RLS),
-- anon/authenticated ключи сюда никогда не должны попадать. RLS тут —
-- страховка на случай случайной утечки anon-ключа в клиентский бандл.
