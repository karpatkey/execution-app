/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    domains: ['agile.karpatkey.com', 'localhost', 'agile.karpatkey.dev']
  },
  experimental: {
    externalDir: true
  }
}

module.exports = nextConfig
