// Тестовые фото для Арки из папки "фото для арки тест" (переданы 2026-07-09).
// Групповые — общее фото на категорию (Тип 2, см. ArkaCardTypes/ArkaMenuSections).
// Один и тот же файл может обслуживать несколько категорий, если по составу
// они совпадают с тем, что на фото (напр. смузи/сок/молочный коктейль —
// одна и та же группа напитков на фото-сете).

export const ARKA_GROUP_PHOTOS: Record<string, string> = {
  Смузи: '/arka-bar/groups/napitki-ba.png',
  'Молочный коктейль': '/arka-bar/groups/napitki-ba.png',
  Сок: '/arka-bar/groups/napitki-ba.png',
  'Классические чаи': '/arka-bar/groups/chai.png',
  'Премиальные чаи': '/arka-bar/groups/chai.png',
  Тизаны: '/arka-bar/groups/chai.png',
  Закуски: '/arka-bar/groups/zakuski-sladosti.png',
  Сладости: '/arka-bar/groups/zakuski-sladosti.png',
  Кофе: '/arka-bar/groups/kofe.png',
};

// Сольные фото (Тип 1, своя позиция) — id из arka-menu-data.ts. Названия на
// фото (Доминант/Росе Гласс/Френч/Ласт Ворд/Пина Колада/Дранк Дюшес) не
// совпадают с текущими позициями меню один в один — соответствие не
// проставляю, пока пользователь не подтвердит, какое фото к какой позиции.
export const ARKA_ITEM_PHOTOS: Record<string, string> = {};
