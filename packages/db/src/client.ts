/**
 * DB client facade. Currently returns mock data — swap to a real Supabase
 * client when env vars are configured (Stage 2 of the TZ).
 *
 * Keep the public surface stable so consumers don't change when we swap.
 */
import {
  MOCK_CATEGORIES,
  MOCK_HOOKAH_MOODS,
  MOCK_LOCATION,
  MOCK_RESOLVED_ITEMS,
  MOCK_TABLES,
} from './mock-data';
import type { Category, HookahMood, Location, ResolvedMenuItem, Table } from './types';

export interface BarvihaClient {
  getLocationBySlug(slug: string): Promise<Location | null>;
  getCategoriesForLocation(locationId: string): Promise<Category[]>;
  getMenuItemsForLocation(locationId: string): Promise<ResolvedMenuItem[]>;
  getMenuItemById(itemId: string): Promise<ResolvedMenuItem | null>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  getHookahMoods(): Promise<HookahMood[]>;
  getTableByToken(token: string): Promise<Table | null>;
}

class MockBarvihaClient implements BarvihaClient {
  async getLocationBySlug(slug: string): Promise<Location | null> {
    return slug === MOCK_LOCATION.slug ? MOCK_LOCATION : null;
  }

  async getCategoriesForLocation(locationId: string): Promise<Category[]> {
    if (locationId !== MOCK_LOCATION.id) return [];
    return MOCK_CATEGORIES;
  }

  async getMenuItemsForLocation(locationId: string): Promise<ResolvedMenuItem[]> {
    if (locationId !== MOCK_LOCATION.id) return [];
    return MOCK_RESOLVED_ITEMS;
  }

  async getMenuItemById(itemId: string): Promise<ResolvedMenuItem | null> {
    return MOCK_RESOLVED_ITEMS.find((i) => i.id === itemId) ?? null;
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
}

let client: BarvihaClient | null = null;

export function getClient(): BarvihaClient {
  if (!client) client = new MockBarvihaClient();
  return client;
}
