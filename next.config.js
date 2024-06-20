/** @type {import('next').NextConfig} */

module.exports = {
  output: 'standalone',
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=10000, must-revalidate',
          },
        ],
      },
    ]
  },
  images: {
    minimumCacheTTL: 3000,
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
}
