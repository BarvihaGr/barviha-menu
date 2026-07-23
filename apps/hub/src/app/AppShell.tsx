import { getSessionAccount } from '@/lib/auth/session';
import { getSidebarLocations } from '@/lib/sidebar-locations';
import { Sidebar } from './locations/Sidebar';

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSessionAccount();
  const { templates, working } = getSidebarLocations(session);

  return (
    <div className="flex h-screen flex-col overflow-hidden md:flex-row">
      <Sidebar templates={templates} working={working} role={session?.role ?? null} />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
