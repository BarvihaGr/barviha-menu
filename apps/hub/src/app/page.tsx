import { redirect } from 'next/navigation';
import { getSessionAccount } from '@/lib/auth/session';
import { defaultPathFor } from '@/lib/auth/permissions';

export default async function RootPage() {
  const session = await getSessionAccount();
  // Без сессии middleware уже увёл бы на /login раньше, чем страница
  // отрендерится — эта ветка на всякий случай, а не основной путь.
  redirect(session ? defaultPathFor(session) : '/login');
}
