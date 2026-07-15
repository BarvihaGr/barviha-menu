import type { NextConfig } from 'next';
import { BASE_PATH } from './src/lib/base-path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: BASE_PATH,
  transpilePackages: ['@barviha/db'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.barviha.ru' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Бэк-офис — админка, её незачем встраивать во фреймы вообще никогда
  // (в отличие от публичного меню) — DENY строже SAMEORIGIN.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
};

export default nextConfig;
