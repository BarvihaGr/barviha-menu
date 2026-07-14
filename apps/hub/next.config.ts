import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: '/back-off',
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
