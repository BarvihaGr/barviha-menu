import { redirect } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

export default async function LocaleRoot({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect({ href: '/mendeleevskaia', locale: locale as Locale });
}
