/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
    // Allow data URLs for base64 images
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    unoptimized: false,
  },
}

module.exports = nextConfig