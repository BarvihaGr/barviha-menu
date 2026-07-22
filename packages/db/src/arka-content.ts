/**
 * Редактируемый контент локаций на content-store (этап 1 бэк-офиса) —
 * файловый content-store, packages/db/content/<slug>/{bar,kitchen,hookah,location}.json.
 * Название файла осталось историческим (Арка была первой), но функции тут
 * генерик по slug — используются Аркой, Киевской и 25 рабочими клонами
 * (см. onboarding.ts: isContentStoreSlug/usesArkaBarTemplate).
 *
 * Бар: у Арки и её клонов — своя вёрстка-шаблон (секции + type1/type2
 * карточки, см. apps/menu ArkaMenuSections/ArkaCardTypes), файл bar.json.
 * У Киевской Бар — обычные CatalogItem (realm: 'bar'), как Кухня/Кальяны,
 * своя вёрстка (CoffeeMenuList) не задета. Оба хранилища читает/пишет и
 * меню, и бэк-офис (hub).
 */
import { readContentJson, writeContentJson } from './content-store';
import { subLabel, subOrder } from './catalog-shared';
import { getItemVariants } from './arka-shared';
import type { ArkaMenuEntry, ArkaMenuItem } from './arka-shared';
import { usesArkaBarTemplate } from './onboarding';
import type { GenKbju } from './menu-types';
import type { PhotoEntry, ResolvedMenuItem } from './types';

export type { ArkaMenuEntry, ArkaMenuItem, ArkaMenuVariant } from './arka-shared';
export { getItemVariants } from './arka-shared';

// ── Бар: секции + type1/type2 карточки ──

interface BarFile {
  sections: ArkaMenuEntry[];
  /** На диске исторически просто путь-строка (без кадрирования) — читаем
   * оба варианта (см. normalizeGroupPhoto), пишем уже в новом формате. */
  groupPhotos: Record<string, string | PhotoEntry>;
}

function flattenBarItems(sections: ArkaMenuEntry[]): ArkaMenuItem[] {
  return sections.flatMap((e) => (e.kind === 'category' ? e.items : []));
}

export function getBarSections(slug: string): ArkaMenuEntry[] {
  return readContentJson<BarFile>(`${slug}/bar.json`).sections;
}

function normalizeGroupPhoto(v: string | PhotoEntry): PhotoEntry {
  return typeof v === 'string' ? { src: v, position: null, transform: null } : v;
}

export function getBarGroupPhotos(slug: string): Record<string, PhotoEntry> {
  const raw = readContentJson<BarFile>(`${slug}/bar.json`).groupPhotos;
  const out: Record<string, PhotoEntry> = {};
  for (const [category, v] of Object.entries(raw)) out[category] = normalizeGroupPhoto(v);
  return out;
}

/** "Фейковые" ResolvedMenuItem для Бара — чтобы работали корзина и /item/[itemId]. */
export function toResolvedBarItems(slug: string): ResolvedMenuItem[] {
  const sections = getBarSections(slug);
  return flattenBarItems(sections)
    .filter((item) => item.is_available && !item.is_archived)
    .flatMap((item) =>
      getItemVariants(item).map((v) => ({
        id: v.id,
        name: v.name,
        description: v.description,
        photos: item.photo
          ? [{ src: item.photo, position: item.photo_position ?? null, transform: item.photo_transform ?? null }]
          : [],
        photo: item.photo,
        photo_position: item.photo_position ?? null,
        photo_transform: item.photo_transform ?? null,
        composition: null,
        category_id: 'bar',
        price: v.price,
        weight: item.volume,
        labels: [],
        is_available: item.is_available,
        is_premium: false,
        is_alcoholic: false,
        has_3d_model: false,
        spline_url: null,
      })),
    );
}

/** Точечная правка одной позиции Бара (панель шлёт id + изменённые поля). */
export function updateBarItem(slug: string, id: string, patch: Partial<ArkaMenuItem>): void {
  const file = readContentJson<BarFile>(`${slug}/bar.json`);
  let found = false;
  for (const entry of file.sections) {
    if (entry.kind !== 'category') continue;
    const idx = entry.items.findIndex((i) => i.id === id);
    if (idx >= 0) {
      entry.items[idx] = { ...entry.items[idx]!, ...patch };
      found = true;
      break;
    }
  }
  if (!found) throw new Error(`Позиция бара не найдена: ${slug}/${id}`);
  writeContentJson(`${slug}/bar.json`, file);
}

/** Новая загрузка общего фото категории — кадрирование сбрасывается (новый кадр). */
export function updateBarGroupPhoto(slug: string, category: string, src: string): void {
  const file = readContentJson<BarFile>(`${slug}/bar.json`);
  file.groupPhotos[category] = { src, position: null, transform: null };
  writeContentJson(`${slug}/bar.json`, file);
}

/** Правка позиции/зума общего фото категории — без замены самого файла фото. */
export function updateBarGroupPhotoCrop(
  slug: string,
  category: string,
  patch: { position?: PhotoEntry['position']; transform?: PhotoEntry['transform'] },
): void {
  const file = readContentJson<BarFile>(`${slug}/bar.json`);
  const current = file.groupPhotos[category];
  if (!current) throw new Error(`Общее фото категории не найдено: ${slug}/${category}`);
  file.groupPhotos[category] = { ...normalizeGroupPhoto(current), ...patch };
  writeContentJson(`${slug}/bar.json`, file);
}

export function removeBarGroupPhoto(slug: string, category: string): void {
  const file = readContentJson<BarFile>(`${slug}/bar.json`);
  delete file.groupPhotos[category];
  writeContentJson(`${slug}/bar.json`, file);
}

/** Сдвиг позиции Бара (шаблон Арки) на место соседней внутри своего раздела
 * (entry.items) — раздел позиции ищем перебором, id уникален по файлу.
 * Переставляем только внутри своего типа (1/2): на сайте (ArkaMenuSections)
 * type1 и type2 рендерятся двумя отдельными группами — сеткой фото и
 * списком без фото, — а не единым списком, поэтому и «вверх/вниз» должны
 * двигать позицию в пределах её группы, иначе стрелка молча переставляла бы
 * позицию к соседу другого типа и итоговый порядок расходился бы с тем, что
 * видно на сайте. */
export function moveBarItem(slug: string, id: string, direction: 'up' | 'down'): void {
  const file = readContentJson<BarFile>(`${slug}/bar.json`);
  for (const entry of file.sections) {
    if (entry.kind !== 'category') continue;
    const idx = entry.items.findIndex((i) => i.id === id);
    if (idx < 0) continue;
    const type = entry.items[idx]!.type;
    const sameTypeIndices = entry.items.reduce<number[]>((acc, it, i) => {
      if (it.type === type) acc.push(i);
      return acc;
    }, []);
    const pos = sameTypeIndices.indexOf(idx);
    const targetPos = direction === 'up' ? pos - 1 : pos + 1;
    if (targetPos < 0 || targetPos >= sameTypeIndices.length) return;
    const j = sameTypeIndices[targetPos]!;
    [entry.items[idx], entry.items[j]] = [entry.items[j]!, entry.items[idx]!];
    writeContentJson(`${slug}/bar.json`, file);
    return;
  }
  throw new Error(`Позиция бара не найдена: ${slug}/${id}`);
}

/** Уникальный ключ для новой позиции — не для показа, просто внутренний id. */
function slugPart(s: string): string {
  return (
    s
      .trim()
      .toLowerCase()
      .replace(/[^a-zа-яё0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'item'
  );
}

function uniqueSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

export interface BarCategoryOption {
  /** Индекс в исходном массиве sections — категории могут повторяться по
   * имени (историческое наполнение), поэтому идентифицируем позицией, а не
   * названием. */
  index: number;
  category: string;
}

/** Разделы Бара для выпадающего списка в бэк-офисе — с индексом, потому что
 * названия разделов не гарантированно уникальны (см. addBarItem). */
export function getBarCategories(slug: string): BarCategoryOption[] {
  return getBarSections(slug)
    .map((e, index) => ({ e, index }))
    .filter((x): x is { e: Extract<ArkaMenuEntry, { kind: 'category' }>; index: number } => x.e.kind === 'category')
    .map(({ e, index }) => ({ index, category: e.category }));
}

/** Новый раздел Бара (шаблон Арки) — пустая категория, без заголовка-секции. Возвращает индекс нового раздела в sections (для addBarItem). */
export function addBarCategory(slug: string, category: string): number {
  const file = readContentJson<BarFile>(`${slug}/bar.json`);
  file.sections.push({ kind: 'category', sheet: 'custom', category, items: [] });
  writeContentJson(`${slug}/bar.json`, file);
  return file.sections.length - 1;
}

export interface NewBarItemInput {
  name: string;
  price: string;
  volume?: string | null;
  description?: string | null;
  type?: 1 | 2;
}

/** Новая позиция в существующий раздел Бара (шаблон Арки) — раздел выбирается по индексу в sections, не по имени (см. getBarCategories). */
export function addBarItem(slug: string, categoryIndex: number, input: NewBarItemInput): ArkaMenuItem {
  const file = readContentJson<BarFile>(`${slug}/bar.json`);
  const entry = file.sections[categoryIndex];
  if (!entry || entry.kind !== 'category') throw new Error(`Раздел бара не найден: ${slug}/${categoryIndex}`);
  const item: ArkaMenuItem = {
    id: `bar-${slugPart(entry.category)}-${uniqueSuffix()}`,
    name: input.name,
    type: input.type ?? 1,
    priceParts: [input.price],
    volume: input.volume ?? null,
    description: input.description ?? null,
    photo: null,
    is_available: true,
  };
  entry.items.push(item);
  writeContentJson(`${slug}/bar.json`, file);
  return item;
}

/**
 * Секции Бара с позициями, отфильтрованными предикатом — категории, у
 * которых после фильтра не осталось позиций, выпадают целиком, а их
 * заголовок-секция (kind: 'header') не показывается, если под ним не
 * осталось ни одной категории. Используется бэк-офисом, чтобы прятать
 * архив из обычной вкладки «Бар» (см. getArchiveItems/getStopListItems).
 *
 * Категории, у которых позиций не было ещё ДО фильтра (пустой items —
 * banner-контейнер вроде «Безалкогольная продукция», нужен только чтобы
 * держать общее фото-обложку), под это правило не подпадают — предикат
 * ничего у них не «отфильтровал», прятать нечего.
 */
export function filterBarSections(
  sections: ArkaMenuEntry[],
  predicate: (item: ArkaMenuItem) => boolean,
): ArkaMenuEntry[] {
  const result: ArkaMenuEntry[] = [];
  let pendingHeader: ArkaMenuEntry | null = null;
  let headerUsed = false;
  for (const entry of sections) {
    if (entry.kind === 'header') {
      pendingHeader = entry;
      headerUsed = false;
      continue;
    }
    const items = entry.items.filter(predicate);
    if (entry.items.length > 0 && items.length === 0) continue;
    if (pendingHeader && !headerUsed) {
      result.push(pendingHeader);
      headerUsed = true;
    }
    result.push({ ...entry, items });
  }
  return result;
}

// ── Кухня / Кальяны: обычные позиции меню ──

export type CatalogRealm = 'kitchen' | 'hookah' | 'bar';

export interface CatalogItem {
  id: string;
  realm: CatalogRealm;
  sub: string;
  name: string;
  description: string | null;
  composition: string | null;
  kbju: GenKbju | null;
  price: number;
  /** Все фото позиции, первое — обложка/витрина (см. PhotoEntry). */
  photos: PhotoEntry[];
  is_available: boolean;
  /** В архиве (сезонное/неактуальное меню) — не показывается на живом меню независимо от is_available, и скрыто из обычных списков бэк-офиса (см. «Архив»). */
  is_archived?: boolean;
  /** Позиция-баннер — рендерится на всю ширину сетки (широкая карточка с описанием) вместо обычной квадратной ячейки. */
  is_featured?: boolean;
}

const ALCOHOL_SUBS = new Set(['wine', 'strong', 'cocktails', 'beer']);

/** Форма позиции до перехода на массив photos — единственное фото плюс кадрирование. */
interface LegacyPhotoFields {
  photo?: string | null;
  photo_position?: PhotoEntry['position'];
  photo_transform?: PhotoEntry['transform'];
}

/** Ни один файл content-store фактически ещё не переписан в новом формате
 * (все позиции на диске — старый одиночный `photo`, не `photos[]`) —
 * приводим на чтении, без миграции самих файлов, чтобы не мешать
 * параллельной работе над галереей фото (она пишет уже в новом формате). */
function normalizePhotos(it: CatalogItem & LegacyPhotoFields): PhotoEntry[] {
  if (Array.isArray(it.photos)) return it.photos;
  if (it.photo) {
    return [{ src: it.photo, position: it.photo_position ?? null, transform: it.photo_transform ?? null }];
  }
  return [];
}

export function getCatalogItems(slug: string, realm: CatalogRealm): CatalogItem[] {
  const items = readContentJson<(CatalogItem & LegacyPhotoFields)[]>(`${slug}/${realm}.json`);
  return items.map((it) => ({ ...it, photos: normalizePhotos(it) }));
}

export function updateCatalogItem(
  slug: string,
  realm: CatalogRealm,
  id: string,
  patch: Partial<CatalogItem>,
): void {
  const items = getCatalogItems(slug, realm);
  const idx = items.findIndex((i) => i.id === id);
  if (idx < 0) throw new Error(`Позиция ${realm} не найдена: ${slug}/${id}`);
  items[idx] = { ...items[idx]!, ...patch };
  writeContentJson(`${slug}/${realm}.json`, items);
}

/** Сдвиг позиции на место соседней внутри своей подкатегории (sub) — порядок
 * между подкатегориями задаёт subOrder, не порядок в файле, поэтому ищем
 * ближайшего соседа с тем же sub, а не просто idx±1. */
export function moveCatalogItem(slug: string, realm: CatalogRealm, id: string, direction: 'up' | 'down'): void {
  const items = getCatalogItems(slug, realm);
  const idx = items.findIndex((i) => i.id === id);
  if (idx < 0) throw new Error(`Позиция ${realm} не найдена: ${slug}/${id}`);
  const sub = items[idx]!.sub;
  const step = direction === 'up' ? -1 : 1;
  let j = idx + step;
  while (j >= 0 && j < items.length && items[j]!.sub !== sub) j += step;
  if (j < 0 || j >= items.length) return;
  [items[idx], items[j]] = [items[j]!, items[idx]!];
  writeContentJson(`${slug}/${realm}.json`, items);
}

/** Категории, реально встречающиеся у этой локации в разделе (для выпадающего списка в форме добавления). */
export function getCatalogCategories(slug: string, realm: CatalogRealm): { sub: string; label: string }[] {
  const subs = [...new Set(getCatalogItems(slug, realm).map((it) => it.sub))];
  return subs
    .map((sub) => ({ sub, label: subLabel(realm, sub) }))
    .sort((a, b) => subOrder(realm, a.sub) - subOrder(realm, b.sub));
}

export interface NewCatalogItemInput {
  name: string;
  sub: string;
  price: number;
  weight?: number | null;
  description?: string | null;
  composition?: string | null;
}

/** Новая позиция Кухни/Кальянов/Бара-каталога — sub может быть новой категорией (ещё не встречавшейся у локации). */
export function addCatalogItem(slug: string, realm: CatalogRealm, input: NewCatalogItemInput): CatalogItem {
  const items = getCatalogItems(slug, realm);
  const item: CatalogItem = {
    id: `${realm}-${slugPart(input.sub)}-${uniqueSuffix()}`,
    realm,
    sub: input.sub,
    name: input.name,
    description: input.description ?? null,
    composition: input.composition ?? null,
    kbju: input.weight != null ? { weight: input.weight, prot: null, fat: null, carb: null, kcal: null } : null,
    price: input.price,
    photos: [],
    is_available: true,
  };
  items.push(item);
  writeContentJson(`${slug}/${realm}.json`, items);
  return item;
}

function detectLabelsFromText(text: string): ResolvedMenuItem['labels'] {
  const SPICY_RE = /остр[ыоеаяийё]|перец.{0,5}чили|чили.{0,5}перц|халапень|кайенн|спайси|spicy|кимчи|васаби|жгуч/i;
  const VEGAN_RE = /\bвеган\b|\bvegan\b/i;
  const labels: ResolvedMenuItem['labels'] = [];
  if (SPICY_RE.test(text)) labels.push('spicy');
  if (VEGAN_RE.test(text)) labels.push('vegan');
  return labels;
}

export function toResolvedCatalogItem(it: CatalogItem): ResolvedMenuItem {
  const kb = it.kbju;
  const r = (n: number | null | undefined) => (n == null ? 0 : Math.round(n));
  const text = [it.name, it.description, it.composition].filter(Boolean).join(' ');
  return {
    id: it.id,
    name: it.name,
    description: it.description,
    photos: it.photos,
    photo: it.photos[0]?.src ?? null,
    photo_position: it.photos[0]?.position ?? null,
    photo_transform: it.photos[0]?.transform ?? null,
    composition: it.composition,
    category_id: it.realm,
    price: it.price,
    weight: kb && kb.weight != null ? `${kb.weight}` : null,
    labels: detectLabelsFromText(text),
    is_available: it.is_available,
    is_premium: false,
    is_alcoholic: it.realm === 'bar' && ALCOHOL_SUBS.has(it.sub),
    has_3d_model: false,
    spline_url: null,
    nutrition:
      kb && kb.kcal != null
        ? { kcal: r(kb.kcal), protein: r(kb.prot), fat: r(kb.fat), carbs: r(kb.carb) }
        : undefined,
    sub: it.sub,
    subLabel: subLabel(it.realm, it.sub),
    is_featured: it.is_featured ?? false,
  };
}

export { subOrder } from './catalog-shared';

// ── Настройки локации ──

export interface LocationSettings {
  address: string | null;
  phone: string | null;
  is_active: boolean;
  /** Координаты для геолокации («предложить ближайшую локацию» на живом
   * меню) — заполняются постепенно, см. apps/menu NearbyLocationPrompt. */
  latitude: number | null;
  longitude: number | null;
}

export function getLocationSettings(slug: string): LocationSettings {
  const raw = readContentJson<Partial<LocationSettings>>(`${slug}/location.json`);
  return {
    address: raw.address ?? null,
    phone: raw.phone ?? null,
    is_active: raw.is_active ?? true,
    latitude: raw.latitude ?? null,
    longitude: raw.longitude ?? null,
  };
}

export function updateLocationSettings(slug: string, patch: Partial<LocationSettings>): void {
  const current = getLocationSettings(slug);
  writeContentJson(`${slug}/location.json`, { ...current, ...patch });
}

// ── Стоп-лист / Архив: сводка по всем разделам (Кухня + Бар + Кальяны) ──

export interface FlagListItem {
  id: string;
  realm: CatalogRealm;
  name: string;
  photo: string | null;
  price: number;
  is_available: boolean;
  is_archived: boolean;
}

function barItemPrice(it: ArkaMenuItem): number {
  const n = Number(it.priceParts[0]?.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function allFlagItems(slug: string): FlagListItem[] {
  const fromCatalog = (realm: CatalogRealm): FlagListItem[] =>
    getCatalogItems(slug, realm).map((it) => ({
      id: it.id,
      realm,
      name: it.name,
      photo: it.photos[0]?.src ?? null,
      price: it.price,
      is_available: it.is_available,
      is_archived: it.is_archived ?? false,
    }));

  const bar: FlagListItem[] = usesArkaBarTemplate(slug)
    ? flattenBarItems(getBarSections(slug)).map((it) => ({
        id: it.id,
        realm: 'bar' as const,
        name: it.name,
        photo: it.photo,
        price: barItemPrice(it),
        is_available: it.is_available,
        is_archived: it.is_archived ?? false,
      }))
    : fromCatalog('bar');

  return [...fromCatalog('kitchen'), ...fromCatalog('hookah'), ...bar];
}

/** Позиции временно выключены («актуально» = нет), но не в архиве — быстрый возврат в меню. */
export function getStopListItems(slug: string): FlagListItem[] {
  return allFlagItems(slug).filter((it) => !it.is_available && !it.is_archived);
}

/** Позиции в архиве (сезонное/неактуальное меню) — не показываются на живом меню независимо от «актуально». */
export function getArchiveItems(slug: string): FlagListItem[] {
  return allFlagItems(slug).filter((it) => it.is_archived);
}

/** Точечная правка is_available/is_archived для позиции любого раздела — сама выбирает верное хранилище (Бар-шаблон vs каталог). */
export function setItemFlag(
  slug: string,
  realm: CatalogRealm,
  id: string,
  patch: { is_available?: boolean; is_archived?: boolean },
): void {
  if (realm === 'bar' && usesArkaBarTemplate(slug)) {
    updateBarItem(slug, id, patch);
  } else {
    updateCatalogItem(slug, realm, id, patch);
  }
}
