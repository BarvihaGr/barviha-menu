'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiPath } from '@/lib/base-path';

type Role = 'big_boss' | 'boss_location' | 'manager';

interface AccountItem {
  id: string;
  login: string;
  role: Role;
  locationSlug: string | null;
  displayName: string;
  isActive: boolean;
  lastLoginAt: string | null;
}

interface LocationOption {
  slug: string;
  name: string;
}

const ROLE_LABEL: Record<Role, string> = {
  big_boss: 'Главный',
  boss_location: 'Управляющий',
  manager: 'Менеджер',
};

function randomCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function AccountsView({
  role,
  accounts,
  locationOptions,
}: {
  role: Role;
  accounts: AccountItem[];
  locationOptions: LocationOption[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetId, setResetId] = useState<string | null>(null);
  const [resetValue, setResetValue] = useState('');

  // Форма создания — поля общие, значимые зависят от роли текущего пользователя.
  const [newRole, setNewRole] = useState<Role>('boss_location');
  const [newLocation, setNewLocation] = useState(locationOptions[0]?.slug ?? '');
  const [newLogin, setNewLogin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newCode, setNewCode] = useState(randomCode());

  async function refresh() {
    router.refresh();
  }

  async function createBigBoss(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch(apiPath('/api/accounts'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: newRole,
        locationSlug: newRole === 'big_boss' ? null : newLocation,
        login: newLogin,
        password: newPassword,
        displayName: newDisplayName || newLogin,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? 'не удалось создать аккаунт');
      return;
    }
    setNewLogin('');
    setNewPassword('');
    setNewDisplayName('');
    await refresh();
  }

  async function createManager(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch(apiPath('/api/accounts'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: newDisplayName, password: newCode }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? 'не удалось создать менеджера');
      return;
    }
    setNewDisplayName('');
    setNewCode(randomCode());
    await refresh();
  }

  async function toggleActive(account: AccountItem) {
    setBusy(true);
    await fetch(apiPath(`/api/accounts/${account.id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !account.isActive }),
    });
    setBusy(false);
    await refresh();
  }

  async function submitReset(id: string) {
    if (!resetValue) return;
    setBusy(true);
    await fetch(apiPath(`/api/accounts/${id}`), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: resetValue }),
    });
    setBusy(false);
    setResetId(null);
    setResetValue('');
    await refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={role === 'big_boss' ? createBigBoss : createManager}
        className="flex flex-col gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4"
      >
        <div className="text-sm font-semibold text-[color:var(--text)]">
          {role === 'big_boss' ? 'Новый аккаунт' : 'Новый менеджер'}
        </div>

        {role === 'big_boss' ? (
          <>
            <div className="flex flex-wrap gap-2">
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className="input flex-1 min-w-[140px]"
              >
                <option value="boss_location">Управляющий локации</option>
                <option value="manager">Менеджер</option>
                <option value="big_boss">Главный</option>
              </select>
              {newRole !== 'big_boss' && (
                <select
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="input flex-1 min-w-[160px]"
                >
                  {locationOptions.map((l) => (
                    <option key={l.slug} value={l.slug}>
                      {l.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                value={newLogin}
                onChange={(e) => setNewLogin(e.target.value)}
                placeholder="Логин"
                className="input flex-1 min-w-[140px]"
                required
              />
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Пароль"
                className="input flex-1 min-w-[140px]"
                required
              />
              <input
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="Отображаемое имя (необязательно)"
                className="input flex-1 min-w-[160px]"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-wrap gap-2">
            <input
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder="Фамилия"
              className="input flex-1 min-w-[140px]"
              required
            />
            <div className="flex items-center gap-2">
              <input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="0000"
                className="input w-24 text-center tracking-widest"
                required
              />
              <button
                type="button"
                onClick={() => setNewCode(randomCode())}
                className="shrink-0 rounded-lg border border-[color:var(--border)] px-3 py-2 text-xs text-[color:var(--muted)] hover:bg-[color:var(--surface-2)]"
              >
                Сгенерировать
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-[color:var(--danger)]">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="self-start rounded-lg px-4 py-2 text-sm font-semibold text-[color:var(--accent-text)] transition disabled:opacity-50"
          style={{ background: 'linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 55%, var(--accent-2)))' }}
        >
          Создать
        </button>
      </form>

      <div className="flex flex-col divide-y divide-[color:var(--border)] rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)]">
        {accounts.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-[color:var(--muted)]">Пока пусто</div>
        )}
        {accounts.map((account) => (
          <div key={account.id} className="flex flex-col gap-2 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-[color:var(--text)]">
                  {account.login}
                  {!account.isActive && (
                    <span className="ml-2 rounded bg-[color:var(--surface-2)] px-1.5 py-0.5 text-[10px] uppercase text-[color:var(--muted)]">
                      отключён
                    </span>
                  )}
                </div>
                <div className="text-xs text-[color:var(--muted)]">
                  {ROLE_LABEL[account.role]}
                  {account.locationSlug ? ` · ${account.locationSlug}` : ''} · вход: {fmtDate(account.lastLoginAt)}
                </div>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => toggleActive(account)}
                className="shrink-0 rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs text-[color:var(--text-soft)] hover:bg-[color:var(--surface-2)]"
              >
                {account.isActive ? 'Отключить' : 'Включить'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setResetId(resetId === account.id ? null : account.id);
                  setResetValue('');
                }}
                className="shrink-0 rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs text-[color:var(--text-soft)] hover:bg-[color:var(--surface-2)]"
              >
                {account.role === 'manager' ? 'Новый код' : 'Сбросить пароль'}
              </button>
            </div>
            {resetId === account.id && (
              <div className="flex items-center gap-2 pl-1">
                <input
                  value={resetValue}
                  onChange={(e) =>
                    setResetValue(account.role === 'manager' ? e.target.value.replace(/\D/g, '').slice(0, 4) : e.target.value)
                  }
                  placeholder={account.role === 'manager' ? '0000' : 'Новый пароль'}
                  className="input w-40"
                />
                <button
                  type="button"
                  disabled={busy || !resetValue}
                  onClick={() => submitReset(account.id)}
                  className="rounded-lg border border-[color:var(--border)] px-3 py-1.5 text-xs text-[color:var(--accent)] hover:bg-[color:var(--surface-2)] disabled:opacity-50"
                >
                  Сохранить
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
