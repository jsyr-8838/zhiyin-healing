/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output mode - produces minimal server bundle WITHOUT source code
  // Docker deployment uses this: only .next/standalone + .next/static + public/ are copied
  // Source .ts/.tsx files are NOT included in the standalone output
  output: "standalone",

  // Required for Prisma + Cloudflare Workers
  serverExternalPackages: ["@prisma/client", ".prisma/client"],

  // Skip type checking and ESLint during build (known type conflicts in NextAuth etc.)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Allow public domain access to dev assets (Cloudflare Tunnel etc.)
  allowedDevOrigins: [
    ".trycloudflare.com",
    ".loca.lt",
  ],

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.us-east-005.backblazeb2.com',
      },
      {
        protocol: 'https',
        hostname: 'f005.backblazeb2.com',
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Permissions-Policy", value: "camera=(self), microphone=(self), bluetooth=(self), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://api.qrserver.com https://cdn.pixabay.com https://s3.us-east-005.backblazeb2.com https://f005.backblazeb2.com",
              "font-src 'self' data: blob:",
              "connect-src 'self' blob: https://integrate.api.nvidia.com https://*.nvidia.com https://ipapi.co https://api.open-meteo.com https://api.jamendo.com https://*.storage.jamendo.com https://api.qrserver.com https://s3.us-east-005.backblazeb2.com https://f005.backblazeb2.com http://localhost:5001 wss: ws:",
              "media-src 'self' blob: mediastream: https://*.storage.jamendo.com https://s3.us-east-005.backblazeb2.com https://f005.backblazeb2.com",
              "manifest-src 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },

  async redirects() {
    return [];
  },
};

module.exports = nextConfig;

// Enable OpenNext Cloudflare dev bindings for local development
const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare');
try {
  initOpenNextCloudflareForDev();
} catch (e) {
  // Silently skip if @opennextjs/cloudflare is not installed (e.g. fresh checkout)
}
