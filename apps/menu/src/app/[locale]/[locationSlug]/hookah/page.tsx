import { getClient } from '@barviha/db';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
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
import { CoffeeMenuList } from '@/components/coffee/CoffeeMenuList';
import { CoffeeCategoryNav } from '@/components/coffee/CoffeeCategoryNav';
import { isCoffeeDesign, coffeeAccentStyle } from '@/lib/coffee-design';

export default async function HookahPage({
  params,
}: {
  params: Promise<{ locale: string; locationSlug: string }>;
}) {
  const { locale, locationSlug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('hookah');

  const db = getClient();
  const location = await db.getLocationBySlug(locationSlug);
  if (!location) notFound();

  const [moods, items, categories] = await Promise.all([
    db.getHookahMoods(),
    db.getMenuItemsForLocation(location.id),
    db.getCategoriesForLocation(location.id),
  ]);

  const hookahCategory = (await db.getCategoryBySlug('hookah'))!;
  const hookahs = items.filter((i) => i.category_id === hookahCategory.id);
  const premium = hookahs.find((i) => i.is_premium) ?? hookahs[0];
  const hits = hookahs.filter((i) => i.id !== premium?.id);

  // Светлый дизайн Coffeemania — Кальяны в едином стиле с Кухней/Баром:
  // тот же полноширинный фон, сайдбар категорий и сетка карточек.
  if (isCoffeeDesign(locationSlug)) {
    return (
      <div
        className="relative left-1/2 right-1/2 -mx-[50vw] w-screen -mt-2 min-h-screen bg-[var(--cm-bg)] text-[var(--cm-text)]"
        style={coffeeAccentStyle(locationSlug)}
      >
        <div className="mx-auto w-full max-w-[1200px] px-4 pb-32 pt-6 sm:px-6 lg:pt-10">
          <div className="lg:grid lg:grid-cols-[210px_1fr] lg:gap-10">
            <CoffeeCategoryNav
              categories={categories}
              currentSlug="hookah"
              locationSlug={locationSlug}
              locale={locale as Locale}
            />
            <div>
              <CoffeeMenuList
                items={hookahs}
                locationSlug={locationSlug}
                categorySlug="hookah"
                realm="hookah"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
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
                locationSlug={locationSlug}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
