/** @type {import('next').NextConfig} */

const CSP = [
  "default-src 'self'",
  // unsafe-eval required by jsPDF (invoice/receipt PDF generation) and Next.js dev source maps
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  // unsafe-inline required by Tailwind runtime + Next.js style injection
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // data: for jsPDF canvas exports, blob: for PDF previews
  "img-src 'self' data: blob: https://images.unsplash.com https://avatars.githubusercontent.com",
  // Supabase REST + realtime websocket
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ');

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: CSP },
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'X-Frame-Options',         value: 'DENY' },
          { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
};

module.exports = nextConfig;
