import type { NextConfig } from 'next';
import { BASE_PATH } from './src/lib/base-path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // См. apps/menu/next.config.ts — атомарная подмена .next при деплое
  // (scripts/deploy.sh), чтобы рестарт не ловил половину пересобранного
  // билда.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  basePath: BASE_PATH,
  transpilePackages: ['@barviha/db'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.barviha.ru' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  poweredByHeader: false,
  // Бэк-офис — админка, её незачем встраивать во фреймы вообще никогда
  // (в отличие от публичного меню) — DENY строже SAMEORIGIN. CSP — только
  // свой домен (фото меню лежат на нём же), в production (dev Next-у нужен eval).
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; ');
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Permissions-Policy', value: 'geolocation=(), camera=(), microphone=(), payment=(), usb=()' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          ...(process.env.NODE_ENV === 'production' ? [{ key: 'Content-Security-Policy', value: csp }] : []),
        ],
      },
    ];
  },
};

export default nextConfig;
