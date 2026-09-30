import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Позволяет деплой-скрипту собирать в отдельную папку (.next-building) и
  // атомарно подменять её на боевую .next одним rename — иначе `next build`
  // поверх работающего .next у живого `next start` время от времени ловит
  // гонку (сервер читает файл манифеста в момент, когда сборка его как раз
  // переписывает) и падает с ошибками вида "client reference manifest does
  // not exist" / "Failed to find Server Action" — что раньше вызывало шквал
  // рестартов pm2 прямо во время работы пользователя в бэк-офисе и роняло
  // сохранения на середине запроса. См. scripts/deploy.sh.
  distDir: process.env.NEXT_DIST_DIR || '.next',
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
  // Не раскрываем стек в заголовке X-Powered-By (security-audit 30.09, M15).
  poweredByHeader: false,
  // Security-заголовки. X-Frame-Options закрывает clickjacking, CSP — загрузку
  // чужих скриптов/шрифтов/картинок (после переноса шрифтов на свой домен весь
  // сайт ходит только к себе; единственное исключение — тайлы карты на
  // «Контактах», и те грузятся только по нажатию гостя, см. LocationMap).
  // CSP только в production: dev-сервер Next использует eval и websocket.
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://tile.openstreetmap.org",
      "font-src 'self' data:",
      "media-src 'self' blob:",
      "connect-src 'self'",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join('; ');
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Permissions-Policy', value: 'geolocation=(self), camera=(), microphone=(), payment=(), usb=()' },
          ...(process.env.NODE_ENV === 'production' ? [{ key: 'Content-Security-Policy', value: csp }] : []),
        ],
      },
      // Песочницы дизайна и «Тест лок»-шаблоны открыты по прямой ссылке (ими
      // пользуется владелец), но в поиске им делать нечего.
      {
        source: '/:locale/:service(board|buttons|concepts|arka-lab|arka-network|kievskaia-network)/:rest*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
