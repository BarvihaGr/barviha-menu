/**
 * DB client facade. Меню — из автогенерированного датасета (menu-generated.ts,
 * собран из «ФУЛЛ ИНФО» по локациям). Локации/кальянные настроения/анонсы —
 * из mock-data. При подключении Supabase меняем реализацию, интерфейс тот же.
 */
import {
  MOCK_HOOKAH_MOODS,
  MOCK_LOCATIONS,
  MOCK_TABLES,
  getAfishaForSlug,
  getSpotlightsForSlug,
} from './mock-data';
import { GEN_CATEGORIES, GEN_ITEMS } from './menu-generated';
import { PHOTOS } from './menu-photos';
import {
  getBarSections,
  getCatalogItems,
  getLocationSettings,
  subOrder,
  toResolvedCatalogItem,
} from './arka-content';
import type { CatalogRealm } from './arka-content';
import { isContentStoreSlug, usesArkaBarTemplate } from './onboarding';
import type { GenItem, Realm } from './menu-types';
import type {
  AfishaEvent,
  Announcement,
  Category,
  HookahMood,
  ItemLabel,
  Location,
  ResolvedMenuItem,
  Spotlight,
  Table,
} from './types';

const SPICY_RE = /остр[ыоеаяийё]|перец.{0,5}чили|чили.{0,5}перц|халапень|кайенн|спайси|spicy|кимчи|васаби|жгуч/i;
const VEGAN_RE = /\bвеган\b|\bvegan\b/i;

function detectLabels(it: GenItem): ItemLabel[] {
  const text = [it.name, it.description, it.composition].filter(Boolean).join(' ');
  const labels: ItemLabel[] = [];
  if (SPICY_RE.test(text)) labels.push('spicy');
  if (VEGAN_RE.test(text)) labels.push('vegan');
  return labels;
}

export interface BarvihaClient {
  getAllLocations(): Promise<Location[]>;
  getLocationBySlug(slug: string): Promise<Location | null>;
  getCategoriesForLocation(locationId: string): Promise<Category[]>;
  getMenuItemsForLocation(locationId: string): Promise<ResolvedMenuItem[]>;
  getMenuItemById(itemId: string, locationSlug?: string): Promise<ResolvedMenuItem | null>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  getHookahMoods(): Promise<HookahMood[]>;
  getTableByToken(token: string): Promise<Table | null>;
  getAnnouncementsForLocation(locationId: string): Promise<Announcement[]>;
  getSpotlightsForLocation(locationId: string): Promise<Spotlight[]>;
  getAfishaForLocation(locationId: string): Promise<AfishaEvent[]>;
}

function getLocationById(id: string): Location | undefined {
  const loc = MOCK_LOCATIONS.find((l) => l.id === id);
  return loc ? withContentStoreOverrides(loc) : loc;
}

/**
 * Арка + рабочие клоны — на редактируемом content-store (см. arka-content.ts,
 * packages/db/content/<slug>/**). Адрес/телефон/is_active панель правит там;
 * здесь просто накладываем поверх статичной заготовки из mock-data. Киевская
 * этот путь не проходит — без изменений (см. onboarding.ts).
 */
function withContentStoreOverrides(loc: Location): Location {
  if (!isContentStoreSlug(loc.slug)) return loc;
  const s = getLocationSettings(loc.slug);
  return { ...loc, address: s.address, phone: s.phone ?? undefined, is_active: s.is_active };
}

// ── Карты подкатегорий (для подписи/порядка/группировки) ──
const SUB_LABEL = new Map(GEN_CATEGORIES.map((c) => [`${c.realm}/${c.sub}`, c.label]));
const SUB_ORDER = new Map(GEN_CATEGORIES.map((c) => [`${c.realm}/${c.sub}`, c.order]));

const REALM_NAME: Record<Realm, string> = { kitchen: 'Кухня', bar: 'Бар', hookah: 'Кальяны', desserts: 'Десерты' };
const ALCOHOL_SUBS = new Set(['wine', 'strong', 'cocktails', 'beer']);

// Временно показываем ТОЛЬКО позиции, у которых есть фото (по просьбе:
// блюда без фото деактивируем до появления фотографий). Чтобы вернуть всё —
// поставить false. Касается кухни, бара И кальянов, на всех локациях.
const HIDE_PHOTOLESS = true;
function hasPhoto(id: string): boolean {
  return !HIDE_PHOTOLESS || PHOTOS[id] != null;
}

// Локации, реально покрытые меню в файле «ФУЛЛ ИНФО».
const COVERED_SLUGS = new Set<string>(GEN_ITEMS.flatMap((it) => Object.keys(it.prices)));
// Для непокрытых точек (Саратов, Ташкент) показываем сетевое меню-базу.
const FALLBACK_SLUG = 'baumanskaia';

/** slug локации → slug, по которому реально брать меню/цены. */
function effectiveSlug(slug: string | undefined): string | undefined {
  if (!slug) return slug;
  return COVERED_SLUGS.has(slug) ? slug : FALLBACK_SLUG;
}

function minPrice(prices: Record<string, number>): number {
  const vals = Object.values(prices);
  return vals.length ? Math.min(...vals) : 0;
}

/** GenItem -> ResolvedMenuItem с ценой выбранной локации. */
function toResolved(it: GenItem, slug?: string): ResolvedMenuItem {
  const price = (slug && it.prices[slug]) || minPrice(it.prices);
  const kb = it.kbju;
  const r = (n: number | null | undefined) => (n == null ? 0 : Math.round(n));
  return {
    id: it.id,
    name: (it.sub === 'pizza' && !/^пицц/i.test(it.name)
        ? `Пицца ${it.name}`
        : it.sub === 'milkshake' && !/milkshake|коктейль/i.test(it.name)
        ? `Молочный коктейль ${it.name}`
        : it.name)
      .replace(/,.*$/, '')
      .replace(/\s+с\s+(?:\w+\s+)?котлетой\b.+$/i, '')
      .replace(/\s+и\s+(?:\w+\s+)*соусом\s*$/i, '')
      .trim(),
    description: it.description,
    photo: PHOTOS[it.id] ?? null,
    composition: it.composition,
    category_id: it.realm,
    price,
    // Только число (граммы). Единицу подставляет UI по локали — см. item page (t('grams')).
    weight: kb && kb.weight != null ? `${kb.weight}` : null,
    labels: detectLabels(it),
    is_available: true,
    is_premium: false,
    is_alcoholic: it.realm === 'bar' && ALCOHOL_SUBS.has(it.sub),
    has_3d_model: false,
    spline_url: null,
    nutrition:
      kb && kb.kcal != null
        ? { kcal: r(kb.kcal), protein: r(kb.prot), fat: r(kb.fat), carbs: r(kb.carb) }
        : undefined,
    sub: it.sub,
    subLabel: SUB_LABEL.get(`${it.realm}/${it.sub}`) ?? it.sub,
  };
}

function contentStoreRealmHasAvailableItems(slug: string, rm: Realm): boolean {
  if (rm === 'bar' && usesArkaBarTemplate(slug)) {
    return getBarSections(slug).some(
      (e) => e.kind === 'category' && e.items.some((i) => i.is_available && !i.is_archived),
    );
  }
  if (rm === 'kitchen' || rm === 'hookah' || rm === 'bar') {
    return getCatalogItems(slug, rm).some((i) => i.is_available && !i.is_archived);
  }
  return false;
}

function realmCategory(realm: Realm): Category {
  return {
    id: realm,
    slug: realm,
    name: REALM_NAME[realm],
    realm,
    parent_id: null,
    sort_order: realm === 'kitchen' ? 1 : realm === 'bar' ? 2 : 3,
  };
}

class MockBarvihaClient implements BarvihaClient {
  async getAllLocations(): Promise<Location[]> {
    return MOCK_LOCATIONS.map(withContentStoreOverrides);
  }

  async getLocationBySlug(slug: string): Promise<Location | null> {
    const loc = MOCK_LOCATIONS.find((l) => l.slug === slug) ?? null;
    return loc ? withContentStoreOverrides(loc) : null;
  }

  async getCategoriesForLocation(locationId: string): Promise<Category[]> {
    const loc = getLocationById(locationId);
    if (loc && isContentStoreSlug(loc.slug)) {
      const realms: Realm[] = ['kitchen', 'bar', 'hookah'];
      return realms.filter((rm) => contentStoreRealmHasAvailableItems(loc.slug, rm)).map(realmCategory);
    }
    const slug = effectiveSlug(loc?.slug);
    const realms: Realm[] = ['kitchen', 'bar', 'hookah'];
    // Реалм показываем, если у локации есть видимые позиции (только с фото).
    return realms
      .filter((rm) =>
        GEN_ITEMS.some(
          (it) =>
            it.realm === rm &&
            (!slug || it.prices[slug] != null) &&
            hasPhoto(it.id),
        ),
      )
      .map(realmCategory);
  }

  async getMenuItemsForLocation(locationId: string): Promise<ResolvedMenuItem[]> {
    const loc = getLocationById(locationId);
    if (loc && isContentStoreSlug(loc.slug)) {
      // У Арки/клонов Бар — своя вёрстка/резолвер (см. toResolvedBarItems в
      // apps/menu), сюда не подмешиваем, чтобы не плодить дубли по разным
      // id-схемам. У Киевской Бар — обычный CatalogItem, подмешиваем как есть.
      const realms: CatalogRealm[] = usesArkaBarTemplate(loc.slug)
        ? ['kitchen', 'hookah']
        : ['kitchen', 'hookah', 'bar'];
      return realms
        .flatMap((realm) => getCatalogItems(loc.slug, realm).filter((i) => i.is_available && !i.is_archived))
        .map(toResolvedCatalogItem)
        .sort((a, b) => subOrder(a.category_id!, a.sub) - subOrder(b.category_id!, b.sub));
    }
    const slug = effectiveSlug(loc?.slug);
    const base = slug
      ? GEN_ITEMS.filter((it) => it.prices[slug] != null)
      : GEN_ITEMS;
    // Любые позиции без фото скрываем (кухня, бар, кальяны).
    const items = base.filter((it) => hasPhoto(it.id));
    return items
      .map((it) => toResolved(it, slug))
      .sort((a, b) => (SUB_ORDER.get(`${a.category_id}/${a.sub}`) ?? 99) - (SUB_ORDER.get(`${b.category_id}/${b.sub}`) ?? 99));
  }

  async getMenuItemById(itemId: string, locationSlug?: string): Promise<ResolvedMenuItem | null> {
    if (locationSlug && isContentStoreSlug(locationSlug)) {
      const realms: CatalogRealm[] = usesArkaBarTemplate(locationSlug)
        ? ['kitchen', 'hookah']
        : ['kitchen', 'hookah', 'bar'];
      for (const realm of realms) {
        const it = getCatalogItems(locationSlug, realm).find((i) => i.id === itemId);
        if (it) return it.is_available && !it.is_archived ? toResolvedCatalogItem(it) : null;
      }
      return null;
    }
    const it = GEN_ITEMS.find((x) => x.id === itemId);
    return it ? toResolved(it, effectiveSlug(locationSlug)) : null;
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    if (slug === 'kitchen' || slug === 'bar' || slug === 'hookah') return realmCategory(slug);
    return null;
  }

  async getHookahMoods(): Promise<HookahMood[]> {
    return MOCK_HOOKAH_MOODS;
  }

  async getTableByToken(token: string): Promise<Table | null> {
    return MOCK_TABLES.find((t) => t.qr_token === token) ?? null;
  }

  async getAnnouncementsForLocation(_locationId: string): Promise<Announcement[]> {
    return [];
  }

  async getSpotlightsForLocation(locationId: string): Promise<Spotlight[]> {
    const loc = getLocationById(locationId);
    if (!loc) return [];
    return getSpotlightsForSlug(loc.slug);
  }

  async getAfishaForLocation(locationId: string): Promise<AfishaEvent[]> {
    const loc = getLocationById(locationId);
    if (!loc) return [];
    return getAfishaForSlug(loc.slug);
  }
}

let client: BarvihaClient | null = null;

export function getClient(): BarvihaClient {
  if (!client) client = new MockBarvihaClient();
  return client;
}
