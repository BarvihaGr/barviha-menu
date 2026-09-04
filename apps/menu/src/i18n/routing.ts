import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ru', 'en', 'zh', 'hy'],
  defaultLocale: 'ru',
  localePrefix: 'always',
  // Без cookie: язык на "голых" входах (ссылка/QR без /{locale}/ в пути)
  // определяется заново по Accept-Language при каждом заходе, а не
  // залипает на первый когда-либо определённый язык.
  localeCookie: false,
});

export type Locale = (typeof routing.locales)[number];
