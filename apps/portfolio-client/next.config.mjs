/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@monorepo/ui', '@monorepo/database', '@monorepo/types'],
  reactStrictMode: true,
};

export default nextConfig;
