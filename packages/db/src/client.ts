/**
 * DB client facade. Currently returns mock data — swap to a real Supabase
 * client when env vars are configured (Stage 2 of the TZ).
 */
import {
  LOCATION_PRICING,
  MOCK_ALL_ITEMS,
  MOCK_CATEGORIES,
  MOCK_HOOKAH_MOODS,
  MOCK_LOCATIONS,
  MOCK_TABLES,
  resolveMenuForLocation,
} from './mock-data';
import type {
  Announcement,
  Category,
  HookahMood,
  Location,
  ResolvedMenuItem,
  Table,
} from './types';

export interface BarvihaClient {
  getAllLocations(): Promise<Location[]>;
  getLocationBySlug(slug: string): Promise<Location | null>;
  getCategoriesForLocation(locationId: string): Promise<Category[]>;
  getMenuItemsForLocation(locationId: string): Promise<ResolvedMenuItem[]>;
  getMenuItemById(itemId: string): Promise<ResolvedMenuItem | null>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  getHookahMoods(): Promise<HookahMood[]>;
  getTableByToken(token: string): Promise<Table | null>;
  getAnnouncementsForLocation(locationId: string): Promise<Announcement[]>;
}

function getLocationById(id: string): Location | undefined {
  return MOCK_LOCATIONS.find((l) => l.id === id);
}

class MockBarvihaClient implements BarvihaClient {
  async getAllLocations(): Promise<Location[]> {
    return MOCK_LOCATIONS;
  }

  async getLocationBySlug(slug: string): Promise<Location | null> {
    return MOCK_LOCATIONS.find((l) => l.slug === slug) ?? null;
  }

  async getCategoriesForLocation(locationId: string): Promise<Category[]> {
    const loc = getLocationById(locationId);
    if (!loc) return [];
    // Если у локации задан whitelist категорий (например, Рублёвка — только роллы)
    const cfg = LOCATION_PRICING[loc.slug];
    if (cfg?.allowedCategories) {
      return MOCK_CATEGORIES.filter((c) => cfg.allowedCategories!.includes(c.id));
    }
    // Иначе — все категории, кроме «Роллы» (роллы только на whitelist-локациях)
    return MOCK_CATEGORIES.filter((c) => c.id !== 'cat-rolls');
  }

  async getMenuItemsForLocation(locationId: string): Promise<ResolvedMenuItem[]> {
    const loc = getLocationById(locationId);
    if (!loc) return [];
    return resolveMenuForLocation(loc.slug);
  }

  async getMenuItemById(itemId: string): Promise<ResolvedMenuItem | null> {
    return MOCK_ALL_ITEMS.find((i) => i.id === itemId) ?? null;
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return MOCK_CATEGORIES.find((c) => c.slug === slug) ?? null;
  }

  async getHookahMoods(): Promise<HookahMood[]> {
    return MOCK_HOOKAH_MOODS;
  }

  async getTableByToken(token: string): Promise<Table | null> {
    return MOCK_TABLES.find((t) => t.qr_token === token) ?? null;
  }

  async getAnnouncementsForLocation(_locationId: string): Promise<Announcement[]> {
    // Заполняется из контента по локациям (DJ-сеты, матчи, события).
    return [];
  }
}

let client: BarvihaClient | null = null;

export function getClient(): BarvihaClient {
  if (!client) client = new MockBarvihaClient();
  return client;
}
