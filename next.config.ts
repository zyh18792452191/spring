import type { NextConfig } from 'next';

const path = require('path');

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['*.dev.coze.site'],
  turbopack: {},
  webpack: (config) => {
    // 解决 pnpm 严格隔离下 react-remove-scroll 等包找不到 tslib 的问题
    config.resolve.alias.tslib = path.dirname(require.resolve('tslib/package.json'));
    // 解决 @swc/helpers 在 pnpm 严格隔离下子路径找不到的问题
    const swcHelpersDir = path.dirname(require.resolve('@swc/helpers/package.json'));
    config.resolve.modules = [...(config.resolve.modules || []), swcHelpersDir, 'node_modules'];
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf-coze-web-cdn.coze.cn',
        pathname: '/**',
      },
    ],
  },
  // 构建优化：禁用类型检查（加快构建速度）
  typescript: {
    ignoreBuildErrors: true,
  },
  // 生产构建优化
  productionBrowserSourceMaps: false,
};

export default nextConfig;
