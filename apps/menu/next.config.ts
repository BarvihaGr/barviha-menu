// Деплой-маркер: триггерит пересборку Railway (watch на apps/menu).
// Правки в packages/db теперь тоже деплоятся — см. watchPatterns в railway.toml.
import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@barviha/ui', '@barviha/db'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.barviha.ru' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    // Все фото уже сжаты и приведены к веб-размеру на этапе загрузки (см.
    // apps/hub api/upload) — серверный оптимизатор Next тут не нужен, а на
    // тесной VDS ещё и создавал проблемы: разово споткнувшись на свежем
    // файле (гонка сразу после аплоада), он кэширует сбой на часы вперёд
    // (minimumCacheTTL) и потом отдаёт битую картинку, даже когда файл уже
    // в порядке. Раздаём как есть — nginx уже отдаёт эти файлы напрямую.
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  // Базовые security-заголовки — раньше их не было вообще ни на одном
  // ответе. X-Frame-Options закрывает clickjacking (сайт в невидимом
  // iframe поверх которого кликает жертва), остальные — стандартная
  // гигиена, ничего не меняют в поведении самого приложения.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
