import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/zh-CN',
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
