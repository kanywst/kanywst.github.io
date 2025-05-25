/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/kanywst.github.io' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/kanywst.github.io' : '',
  trailingSlash: true,
}

module.exports = nextConfig
