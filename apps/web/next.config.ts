import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@turalk/config', '@turalk/shared', '@turalk/types'],
};

export default nextConfig;
