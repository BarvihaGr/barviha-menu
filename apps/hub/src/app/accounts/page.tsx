import { redirect } from 'next/navigation';
import { MOCK_LOCATIONS, WORKING_SLUGS } from '@barviha/db';
import { listAccountsCreatedBy, listAllAccounts } from '@barviha/db/accounts';
import { getSessionAccount } from '@/lib/auth/session';
import { AccountsView } from './AccountsView';

export default async function AccountsPage() {
  const session = await getSessionAccount();
  // middleware.ts уже блокирует manager и анонимов раньше рендера — эта
  // проверка на всякий случай, а не основной путь.
  if (!session || session.role === 'manager') redirect('/login');

  const accounts = session.role === 'big_boss' ? await listAllAccounts() : await listAccountsCreatedBy(session.sub);

  const locationNames = new Map(MOCK_LOCATIONS.map((l) => [l.slug, l.name]));
  const locationOptions = WORKING_SLUGS.map((slug) => ({ slug, name: locationNames.get(slug) ?? slug }));

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col overflow-hidden">
      <div className="shrink-0 px-4 pt-6 sm:px-8">
        <div className="glitch-text text-xl font-black tracking-tight text-[color:var(--text)]">
          {session.role === 'big_boss' ? 'Аккаунты' : 'Менеджеры'}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-8">
        <AccountsView
          role={session.role}
          locationOptions={locationOptions}
          accounts={accounts.map((a) => ({
            id: a.id,
            login: a.login,
            role: a.role,
            locationSlug: a.location_slug,
            displayName: a.display_name,
            isActive: a.is_active,
            lastLoginAt: a.last_login_at,
          }))}
        />
      </div>
    </div>
  );
}
