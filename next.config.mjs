import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { withSentryConfig } from '@sentry/nextjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "frame-ancestors 'none'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/hotel-in-tiruchendur',
        destination: '/',
        permanent: false,
      },
      {
        source: '/rooms-in-tiruchendur',
        destination: '/',
        permanent: false,
      },
      {
        source: '/hotel-near-murugan-temple',
        destination: '/',
        permanent: false,
      },
      {
        source: '/budget-hotel-tiruchendur',
        destination: '/',
        permanent: false,
      },
      {
        source: '/family-rooms-tiruchendur',
        destination: '/',
        permanent: false,
      },
      {
        source: '/dormitory-in-tiruchendur',
        destination: '/',
        permanent: false,
      },
      {
        source: '/ac-rooms-in-tiruchendur',
        destination: '/',
        permanent: false,
      },
      {
        source: '/hotel-near-tiruchendur-beach',
        destination: '/',
        permanent: false,
      },
      {
        source: '/stay-in-tiruchendur',
        destination: '/',
        permanent: false,
      },
      {
        source: '/best-hotel-in-tiruchendur',
        destination: '/',
        permanent: false,
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  // Source-map uploads are enabled automatically when SENTRY_AUTH_TOKEN is set
  // in the deployment environment. Do not put that token in this repository.
  silent: true,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
})
