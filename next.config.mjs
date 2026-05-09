/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["playwright", "playwright-core"],
  devIndicators: false,
};

export default nextConfig;
