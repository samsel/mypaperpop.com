import type { NextConfig } from 'next';

// Derive the S3 origin from AWS_ENDPOINT_URL so the CSP allows images/fetches from it.
// Known hosted bucket endpoints are allowed; custom S3-compatible endpoints are
// added when configured.
const s3Origin = process.env.AWS_ENDPOINT_URL
  ? (() => {
      const url = new URL(process.env.AWS_ENDPOINT_URL);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return '';
      }
      return url.origin;
    })()
  : '';

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  serverExternalPackages: ['@axiomhq/pino', 'pino', 'pino-pretty'],
  images: {
    qualities: [75, 80],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.railway.app',
      },
      {
        protocol: 'https',
        hostname: '*.storageapi.dev',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },
  async headers() {
    const s3Src = s3Origin ? ` ${s3Origin}` : '';
    const scriptSrc = process.env.NODE_ENV === 'production'
      ? "'self' 'unsafe-inline' https://js.stripe.com https://static.cloudflareinsights.com"
      : "'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://static.cloudflareinsights.com";
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: `default-src 'self'; script-src ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.railway.app https://*.storageapi.dev https://*.stripe.com https://*.googleusercontent.com${s3Src}; font-src 'self'; connect-src 'self' https://api.stripe.com https://*.railway.app https://*.storageapi.dev https://*.i.posthog.com${s3Src}; frame-src https://js.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self' https://accounts.google.com;` },
        ],
      },
      {
        source: '/api/storage/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, max-age=3600' },
        ],
      },
    ];
  },
};

export default nextConfig;
