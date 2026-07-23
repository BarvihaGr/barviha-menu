import { redirect } from 'next/navigation';
import { getSessionAccount } from '@/lib/auth/session';
import { defaultPathFor } from '@/lib/auth/permissions';
import { ComingSoonPage } from '@/components/ComingSoonPage';

export default async function LandingsPage() {
  const session = await getSessionAccount();
  if (session && session.role !== 'big_boss' && session.role !== 'boss_location') {
    redirect(defaultPathFor(session));
  }

  return (
    <ComingSoonPage
      title="Лендинги"
      description="Публичные лендинги локаций (/l/<slug>) — конструктор появится здесь."
    />
  );
}
