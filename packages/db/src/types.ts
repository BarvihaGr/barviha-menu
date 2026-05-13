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
  address: string | null;
  features: LocationFeature[];
  brand_color: string | null;
  created_at: string;
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
  description: string | null;
  description_en?: string | null;
  photo: string | null;
  composition: string | null;
  composition_en?: string | null;
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
}

export interface HookahMood {
  id: UUID;
  slug: string;
  name: string;
  name_en?: string;
  description: string;
  description_en?: string;
  gradient_from: string;
  gradient_to: string;
  icon: string;
  examples: string;
}
