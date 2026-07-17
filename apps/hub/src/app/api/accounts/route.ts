import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { WORKING_SLUGS } from '@barviha/db';
import {
  createAccount,
  findAccountByLoginKey,
  listAccountsCreatedBy,
  listAllAccounts,
  type AccountRow,
} from '@barviha/db/accounts';

function safe(account: AccountRow) {
  const rest: Partial<AccountRow> = { ...account };
  delete rest.password_hash;
  return rest;
}

/**
 * Роль/локация/created_by запрашивающего берутся ТОЛЬКО из заголовков,
 * проставленных проверенной сессией в middleware.ts — никогда из тела
 * запроса, иначе boss_location мог бы прислать role:"big_boss" и создать
 * себе полный доступ. См. план "Бэк-офис: аккаунты, роли, реальный вход".
 */
export async function GET(request: NextRequest) {
  const role = request.headers.get('x-hub-role');
  const accountId = request.headers.get('x-hub-account-id');

  if (role === 'big_boss') {
    return NextResponse.json({ ok: true, accounts: (await listAllAccounts()).map(safe) });
  }
  if (role === 'boss_location' && accountId) {
    return NextResponse.json({ ok: true, accounts: (await listAccountsCreatedBy(accountId)).map(safe) });
  }
  return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
}

const BigBossCreateSchema = z.object({
  role: z.enum(['big_boss', 'boss_location', 'manager']),
  locationSlug: z.string().nullable(),
  login: z.string().min(2).max(60),
  password: z.string().min(4).max(200),
  displayName: z.string().min(1).max(120),
});

const BossLocationCreateSchema = z.object({
  displayName: z.string().min(1).max(120), // фамилия менеджера — становится логином
  password: z.string().regex(/^\d{4}$/, 'код доступа — 4 цифры'),
});

export async function POST(request: NextRequest) {
  const role = request.headers.get('x-hub-role');
  const accountId = request.headers.get('x-hub-account-id');
  const ownLocation = request.headers.get('x-hub-location');
  const body = await request.json().catch(() => null);

  if (role === 'big_boss' && accountId) {
    const parsed = BigBossCreateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false, error: 'некорректные данные' }, { status: 400 });
    const { role: newRole, locationSlug, login, password, displayName } = parsed.data;

    if (newRole !== 'big_boss' && !(locationSlug && WORKING_SLUGS.includes(locationSlug))) {
      return NextResponse.json({ ok: false, error: 'неизвестная локация' }, { status: 400 });
    }
    if (await findAccountByLoginKey(login.trim().toLowerCase())) {
      return NextResponse.json({ ok: false, error: 'логин уже занят' }, { status: 409 });
    }

    const account = await createAccount({
      login,
      password,
      role: newRole,
      locationSlug: newRole === 'big_boss' ? null : locationSlug,
      displayName,
      createdBy: accountId,
    });
    return NextResponse.json({ ok: true, account: safe(account) });
  }

  if (role === 'boss_location' && accountId && ownLocation) {
    const parsed = BossLocationCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'некорректные данные' }, { status: 400 });
    }
    const { displayName, password } = parsed.data;

    // Логин управляющего — фамилия менеджера; при совпадении подбираем
    // свободный вариант (Иванов, Иванов2, ...), не даём создателю самому
    // придумывать техническое имя.
    const base = displayName.trim();
    let login = base;
    for (let i = 2; i <= 5 && (await findAccountByLoginKey(login.toLowerCase())); i += 1) {
      login = `${base}${i}`;
    }
    if (await findAccountByLoginKey(login.toLowerCase())) {
      return NextResponse.json({ ok: false, error: 'не удалось подобрать свободный логин' }, { status: 409 });
    }

    const account = await createAccount({
      login,
      password,
      role: 'manager',
      locationSlug: ownLocation,
      displayName: base,
      createdBy: accountId,
    });
    return NextResponse.json({ ok: true, account: safe(account) });
  }

  return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
}
