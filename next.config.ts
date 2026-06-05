import type { NextConfig } from 'next'

const config: NextConfig = {
  serverExternalPackages: ['rss-parser'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
}

export default config
