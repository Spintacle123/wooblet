import type { NextConfig } from "next";
const config: NextConfig = { allowedDevOrigins: ['192.168.1.37'], poweredByHeader: false,
  async rewrites() { return [{ source: '/api/:path*', destination: 'http://127.0.0.1:4001/api/:path*' }]; }, distDir: process.env.WOOBLET_E2E === '1' ? '.next-e2e' : '.next' };
export default config;
