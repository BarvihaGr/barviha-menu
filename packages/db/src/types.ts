/**
 * Barviha DB schema types — mirror of the Supabase schema from the TZ.
 * Source of truth: TZ (see project docs). When Supabase is connected,
 * regenerate via `supabase gen types typescript` and reconcile.
 */

export type UUID = string;

export type LocationFeature = 'karaoke' | 'vip_karaoke' | 'veranda' | 'lounge' | 'terrace';
export type ItemLabel = 'new' | 'hit' | 'chef_pick' | 'premium' | 'spicy' | 'vegan';
export type CartStatus = 'open' | 'submitted' | 'cancelled';
export type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'ready' | 'served' | 'cancelled';

export interface Location {
  id: UUID;
  slug: string;
  name: string;
  name_en?: string;
  name_zh?: string;
  city?: string | null;
  address: string | null;
  /** Контактный телефон локации в международном формате (+7…) */
  phone?: string | null;
  features: LocationFeature[];
  brand_color: string | null;
  /** Hero background video (mp4) for the home screen. Filled from content drop. */
  hero_video?: string | null;
  /** Hookah realm enabled for this location (staged rollout). */
  has_hookah?: boolean;
  created_at: string;
}

/** Главный анонс на входном экране (DJ-сет, матч, событие). */
export interface Announcement {
  id: string;
  type: 'dj' | 'match' | 'event';
  title: string;
  title_en?: string;
  title_zh?: string;
  title_hy?: string;
  subtitle?: string;
  subtitle_en?: string;
  subtitle_zh?: string;
  subtitle_hy?: string;
  image?: string | null;
  /** ISO date-time когда событие; используется для показа «сегодня/скоро». */
  when?: string | null;
}

/**
 * Афиша-событие на главной — карточка мероприятия (DJ-сет, ужин-дегустация,
 * лаунж-вечер). Питает бегущую строку (маркизу) и редакционные карточки
 * «Афиша» на домашнем экране локации. Контент per-location.
 */
export interface AfishaEvent {
  id: string;
  /** Надзаголовок-рубрика: «СЕГОДНЯ», «УЖИН», «ЛАУНЖ». */
  eyebrow: string;
  eyebrow_en?: string;
  title: string;
  title_en?: string;
  /** Когда: «ПТ · 22:00». */
  when: string;
  when_en?: string;
  /** Фон карточки (фото). */
  image: string;
}

/**
 * Карточка «спотлайта» — слайд в крутящейся карусели под меню на главной
 * локации. Рассказывает про DJ-сеты, акции, спецпредложения, соцсети.
 *
 * Заготовка под реальные данные: пока наполняется из mock-data по локациям,
 * позже — из Supabase (таблица spotlights с location_id). Поле `kind`
 * определяет иконку/акцент, `links` — кнопки в раскрытой модалке (соцсети,
 * телефон, маршрут). Каждую локацию подвязываем отдельно.
 */
export type SpotlightKind = 'dj' | 'promo' | 'social' | 'event' | 'offer';

export type SpotlightLinkKind =
  | 'instagram'
  | 'telegram'
  | 'vk'
  | 'whatsapp'
  | 'web'
  | 'phone';

export interface SpotlightLink {
  kind: SpotlightLinkKind;
  /** Подпись кнопки (если пусто — берётся дефолт по kind). */
  label?: string;
  /** URL или tel: — куда ведёт кнопка. */
  href: string;
}

export interface Spotlight {
  id: string;
  kind: SpotlightKind;
  /** Короткий заголовок на карточке и в модалке. */
  title: string;
  title_en?: string;
  title_zh?: string;
  title_hy?: string;
  /** Подзаголовок — одна строка на карточке. */
  subtitle?: string;
  subtitle_en?: string;
  subtitle_zh?: string;
  subtitle_hy?: string;
  /** Развёрнутый текст — показывается только в модалке. */
  body?: string;
  body_en?: string;
  body_zh?: string;
  body_hy?: string;
  /** Угловой маркер на карточке: «−20%», «ПТ · СБ», «NEW». */
  badge?: string;
  badge_en?: string;
  badge_zh?: string;
  badge_hy?: string;
  /** Человеко-читаемое «когда»: «Пт–Сб, 22:00». */
  when?: string | null;
  when_en?: string | null;
  when_zh?: string | null;
  when_hy?: string | null;
  /** Фоновое фото слайда. Если null — рисуется градиент по акценту. */
  image?: string | null;
  /** Переопределение акцентного цвета слайда (иначе — акцент локации). */
  accent?: string | null;
  /** Кнопки-действия в модалке (соцсети, звонок, сайт). */
  links?: SpotlightLink[];
}

export interface Table {
  id: UUID;
  location_id: UUID;
  number: string;
  qr_token: string;
}

export interface Category {
  id: UUID;
  slug: string;
  name: string;
  name_en?: string;
  name_zh?: string;
  name_hy?: string;
  /** Верхний «мир» меню: кухня / бар / кальяны. Для группировки разделов. */
  realm?: 'kitchen' | 'bar' | 'hookah';
  parent_id: UUID | null;
  sort_order: number;
}

export interface MenuCatalogItem {
  id: UUID;
  name: string;
  base_description: string | null;
  base_photo: string | null;
  category_id: UUID | null;
  base_composition: string | null;
  brand_chef_id: UUID | null;
  is_premium: boolean;
  has_3d_model: boolean;
  spline_url: string | null;
  created_at: string;
}

export interface LocationMenuItem {
  id: UUID;
  location_id: UUID;
  catalog_item_id: UUID | null;
  custom_name: string | null;
  price: number;
  composition: string | null;
  local_photo: string | null;
  local_description: string | null;
  is_available: boolean;
  labels: ItemLabel[];
  sort_order: number;
  created_at: string;
}

export interface CartItem {
  menu_item_id: UUID;
  qty: number;
  notes?: string;
}

export interface Cart {
  id: UUID;
  session_id: string | null;
  guest_id: UUID | null;
  location_id: UUID;
  table_id: UUID | null;
  items: CartItem[];
  status: CartStatus;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: UUID;
  cart_id: UUID;
  location_id: UUID;
  table_id: UUID | null;
  waiter_id: UUID | null;
  status: OrderStatus;
  total: number;
  quick_resto_id: string | null;
  created_at: string;
}

export interface NutritionFacts {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface ResolvedMenuItem {
  id: UUID;
  name: string;
  name_en?: string;
  name_zh?: string;
  name_hy?: string;
  description: string | null;
  description_en?: string | null;
  description_zh?: string | null;
  description_hy?: string | null;
  photo: string | null;
  composition: string | null;
  composition_en?: string | null;
  composition_zh?: string | null;
  composition_hy?: string | null;
  category_id: UUID | null;
  price: number;
  weight: string | null;
  labels: ItemLabel[];
  is_available: boolean;
  is_premium: boolean;
  is_alcoholic: boolean;
  has_3d_model: boolean;
  spline_url: string | null;
  nutrition?: NutritionFacts;
  /** Подкатегория-раздел внутри реалма (для группировки секциями). */
  sub?: string;
  subLabel?: string;
}

export interface HookahMood {
  id: UUID;
  slug: string;
  name: string;
  name_en?: string;
  name_zh?: string;
  name_hy?: string;
  description: string;
  description_en?: string;
  description_zh?: string;
  description_hy?: string;
  gradient_from: string;
  gradient_to: string;
  icon: string;
  examples: string;
}
