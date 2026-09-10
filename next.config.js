/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '', // Root-domain hosting (rehan-one.vercel.app)
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig 