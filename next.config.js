/** @type {import('next').NextConfig} */

module.exports = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.karpatkey.dev',
        port: '',
      },
      {
        protocol: 'https',
        hostname: '*.karpatkey.com',
        port: '',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
      },
    ],
  },
  experimental: {
    externalDir: true,
  },
}
