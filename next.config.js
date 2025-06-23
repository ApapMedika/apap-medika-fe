/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'images.unsplash.com'],
  },
  async redirects() {
    return [
      {
        source: '/',
        has: [
          {
            type: 'cookie',
            key: 'token',
          },
        ],
        permanent: false,
        destination: '/dashboard',
      },
    ]
  },
}

module.exports = nextConfig