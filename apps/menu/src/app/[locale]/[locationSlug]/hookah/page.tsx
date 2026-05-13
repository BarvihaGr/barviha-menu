import { getClient } from '@barviha/db';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import {
  pickItemDescription,
  pickItemName,
  pickMoodDescription,
  pickMoodName,
} from '@/lib/i18n-helpers';
import { SectionTitle } from '@/components/SectionTitle';
import { HookahMoodCard } from '@/components/HookahMoodCard';
import { ItemCard } from '@/components/ItemCard';
import { HookahHologramCard } from '@/components/HookahHologramCard';

export default async function HookahPage({
  params,
}: {
  params: Promise<{ locale: string; locationSlug: string }>;
}) {
  const { locale, locationSlug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('hookah');
  const tCommon = await getTranslations('common');

  const db = getClient();
  const location = await db.getLocationBySlug(locationSlug);
  if (!location) notFound();

  const [moods, items] = await Promise.all([
    db.getHookahMoods(),
    db.getMenuItemsForLocation(location.id),
  ]);

  const hookahCategory = (await db.getCategoryBySlug('hookah'))!;
  const hookahs = items.filter((i) => i.category_id === hookahCategory.id);
  const premium = hookahs.find((i) => i.is_premium) ?? hookahs[0];
  const hits = hookahs.filter((i) => i.id !== premium?.id);

  return (
    <div className="flex flex-col gap-10">
      <Link
        href={`/${locationSlug}`}
        className="inline-flex items-center gap-1 self-start text-[10px] uppercase tracking-[0.25em] text-muted hover:text-gold cursor-pointer"
      >
        <ChevronLeft size={14} />
        {tCommon('back')}
      </Link>

      <section className="text-center max-w-2xl mx-auto">
        <h1
          className="text-3xl sm:text-4xl uppercase tracking-[0.15em] font-light"
          style={{
            backgroundImage:
              'linear-gradient(135deg, var(--gold-light) 0%, var(--gold) 50%, var(--gold-dark) 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {t('title')}
        </h1>
        <p className="mt-3 text-sm text-muted max-w-md mx-auto">{t('subtitle')}</p>
      </section>

      {premium && (
        <HookahHologramCard
          itemId={premium.id}
          name={pickItemName(premium, locale as Locale)}
          description={pickItemDescription(premium, locale as Locale)}
          price={premium.price}
          photo={premium.photo}
          locationSlug={locationSlug}
        />
      )}

      <section>
        <SectionTitle>{t('moodTitle')}</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {moods.map((m, idx) => (
            <HookahMoodCard
              key={m.id}
              name={pickMoodName(m, locale as Locale)}
              description={pickMoodDescription(m, locale as Locale)}
              examples={m.examples}
              icon={m.icon}
              gradientFrom={m.gradient_from}
              gradientTo={m.gradient_to}
              index={idx}
            />
          ))}
        </div>
      </section>

      {hits.length > 0 && (
        <section>
          <SectionTitle>{t('hitsTitle')}</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {hits.map((item, i) => (
              <ItemCard
                key={item.id}
                item={item}
                name={pickItemName(item, locale as Locale)}
                description={pickItemDescription(item, locale as Locale)}
                locationSlug={locationSlug}
                index={i}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
