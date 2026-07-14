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
};

export default nextConfig;
