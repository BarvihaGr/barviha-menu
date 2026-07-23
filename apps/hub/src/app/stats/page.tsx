import { redirect } from 'next/navigation';
import { getSessionAccount } from '@/lib/auth/session';
import { defaultPathFor } from '@/lib/auth/permissions';
import { ComingSoonPage } from '@/components/ComingSoonPage';

export default async function NetworkStatsPage() {
  const session = await getSessionAccount();
  if (session && session.role !== 'big_boss' && session.role !== 'boss_location') {
    redirect(defaultPathFor(session));
  }

  return (
    <ComingSoonPage
      title="Статистика сети"
      description="Агрегированная аналитика по всем 27 локациям появится здесь."
    />
  );
}
