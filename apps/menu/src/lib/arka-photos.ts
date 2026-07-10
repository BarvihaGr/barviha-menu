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
  // Атмосферное фото (Космополитен/Куба Либре/Нью-Йорк Сауэр — таких позиций
  // в меню нет), пользователь подтвердил ставить как настроенческое фото
  // категории, не как буквальную иллюстрацию конкретных напитков.
  'Классические коктейли': '/arka-bar/groups/koktein-klassika.png',
};

// Сольные фото (Тип 1, своя позиция) — id из arka-menu-data.ts. Названия на
// фото (Доминант/Росе Гласс/Френч/Ласт Ворд/Пина Колада/Дранк Дюшес) не
// совпадают с текущими позициями меню — сопоставил по цвету/составу/подаче
// напитка на фото (решение принял я, по просьбе пользователя):
//   Росе Гласс (розовый, пена, роза-гарнир)         → Пинко (Сарти Роза, клубника)
//   Пина Колада (кокос, ром, ананас, "колада")        → Манго Колада (манго, маракуйя, кокос, ром)
//   Ласт Ворд (красный, тёмно-фиолетовая зелень)      → Земляничный Негрони (земляника, шисо, кампари)
//   Френч (зелёный, флюте, лимонная цедра)            → Бэйзил Смэш (джин, базилик)
//   Дранк Дюшес (янтарный, высокий бокал, лёд)        → Оранж Тоник (джин, апельсин, юдзу, тоник) —
//     самое слабое совпадение из шести (гарнир на фото — груша, не апельсин),
//     но ближе всего по цвету/подаче из оставшихся позиций.
// Доминант (сливочно-шоколадный, ни один коктейль в меню не кремовый) — без
// совпадения вообще, оставлен неподключённым (плейсхолдер до точного фото).
//
// Остальные пустые позиции (по просьбе «поставь фотки, какие используются
// на Киевской») — те же Unsplash-заглушки, что и в packages/db/src/mock-data.ts
// (PIC/UNSPLASH), той же логикой: один и тот же стоковый кадр переиспользуется
// на нескольких похожих по цвету/типу напитках — ровно как на Киевской
// (там cocktailBerry/martiniYellow/mojitoMint/cocktailIced/teapot тоже висят
// на нескольких разных позициях одновременно).
const UNSPLASH = (id: string): string => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;
const STOCK = {
  martiniYellow: UNSPLASH('1587223962930-cb7f31384c19'),
  cocktailBerry: UNSPLASH('1536935338788-846bb9981813'),
  cocktailIced: UNSPLASH('1556679343-c7306c1976bc'),
  mojitoMint: UNSPLASH('1551538827-9c037cb4f32a'),
  teapot: UNSPLASH('1551024601-bec78aea704b'),
};

export const ARKA_ITEM_PHOTOS: Record<string, string> = {
  // Реальные тестовые фото (см. выше) — не трогать.
  'arka-bar-0060': '/arka-bar/solo/rose-glass.png',
  'arka-bar-0066': '/arka-bar/solo/pina-colada.png',
  'arka-bar-0069': '/arka-bar/solo/last-word.png',
  'arka-bar-0067': '/arka-bar/solo/french.png',
  'arka-bar-0065': '/arka-bar/solo/drunk-duchess.png',

  // Лимонады
  'arka-bar-0000': STOCK.cocktailIced, // Манго Маракуйя Кокос
  'arka-bar-0001': STOCK.martiniYellow, // Апельсин Юдзу Миндаль
  'arka-bar-0002': STOCK.cocktailBerry, // Гранат Клубника
  'arka-bar-0003': STOCK.mojitoMint, // Киви Крыжовник Фейхоа
  'arka-bar-0004': STOCK.cocktailIced, // Ананас Щавель

  // Авторские чаи — все на одном чайнике, как itm-bar-tea-dahongpao на Киевской
  'arka-bar-0021': STOCK.teapot,
  'arka-bar-0022': STOCK.teapot,
  'arka-bar-0023': STOCK.teapot,
  'arka-bar-0024': STOCK.teapot,
  'arka-bar-0025': STOCK.teapot,

  // Авторские коктейли — оставшиеся без реального фото
  'arka-bar-0059': STOCK.cocktailBerry, // Виолет
  'arka-bar-0061': STOCK.martiniYellow, // Хуго
  'arka-bar-0062': STOCK.cocktailBerry, // Клубника Тонка
  'arka-bar-0063': STOCK.cocktailIced, // Грейп Тоник
  'arka-bar-0064': STOCK.mojitoMint, // Бэйзил Тоник
  'arka-bar-0068': STOCK.cocktailBerry, // Апероль Клубника Сауэр
  'arka-bar-0070': STOCK.cocktailBerry, // Слива Голубика
};
