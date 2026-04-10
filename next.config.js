/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
  // Bypass browser caching to prevent chunk 400 errors during dev
  // This forces chunks to be re-fetched when content changes
  webpack: (config) => {
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    }
    return config
  },
}

module.exports = nextConfig
