// Типы для автогенерированного меню (menu-generated.ts).
export type Realm = 'kitchen' | 'bar' | 'hookah' | 'desserts';

export interface GenKbju {
  weight: number | null;
  prot: number | null;
  fat: number | null;
  carb: number | null;
  kcal: number | null;
}

/** Подкатегория-раздел внутри реалма (Чаи, Лимонады, Салаты, …). */
export interface GenCategory {
  realm: Realm;
  sub: string;
  label: string;
  order: number;
}

/** Позиция меню: цена задаётся по каждой локации (slug -> ₽). */
export interface GenItem {
  id: string;
  realm: Realm;
  sub: string;
  name: string;
  description: string | null;
  composition: string | null;
  kbju: GenKbju | null;
  prices: Record<string, number>;
}
