const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

/** @type {import('next').NextConfig} */
module.exports = (phase) => ({
  images: { unoptimized: true },
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next' : '.next-build',
})
