/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output required for OpenNext/Cloudflare Pages deployment
  output: "standalone",

  // Skip type checking and ESLint during build (known type conflicts in NextAuth etc.)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Allow public domain access to dev assets (Cloudflare Tunnel etc.)
  allowedDevOrigins: [
    ".trycloudflare.com",
    ".loca.lt",
  ],

  // Performance: compress responses
  compress: true,

  // Performance: tree-shake large icon/utility libraries
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      '@heroicons/react',
      'date-fns',
      'lodash-es',
    ],
  },

  // Webpack config: exclude heavy modules from server bundle to reduce handler.mjs size
  webpack: (config, { isServer }) => {
    if (isServer) {
      // These modules are client-only or have huge data that bloats the server bundle.
      // taibu-core: ~18MB of pinyin/segmentation data, runs on client via taibu-adapter
      // lucide-react: icon library, only needed for client rendering
      // react-icons: same as lucide-react
      // lunar-javascript: ~425KB calendar/astronomy data, only used in client-only pages (diagnose/wuxing)
      // node-html-to-image / puppeteer / playwright: server-only but not usable on Cloudflare
      const serverExcludes = [
        'taibu-core',
        'lucide-react',
        'react-icons',
        '@heroicons/react',
        'lunar-javascript',
        'node-html-to-image',
        'puppeteer',
        'playwright',
        'jsdom',
      ];

      // Modules to completely null-out on server (replace with empty stub)
      const serverNullModules = [
        'sharp',
        'canvas',
        '@react-pdf',
        'pdf-lib',
        'docx',
        'exceljs',
        'pdfjs-dist',
      ];

      config.externals = config.externals || [];
      // Use function externals to match sub-paths like 'taibu-core/meihua', 'lucide-react/icons'
      const existingExternals = Array.isArray(config.externals) ? config.externals : [config.externals];
      existingExternals.push(({ request }, callback) => {
        for (const mod of serverExcludes) {
          if (request === mod || request.startsWith(mod + '/')) {
            return callback(null, `commonjs ${request}`);
          }
        }
        // Null-out heavy native modules that can't run on Cloudflare
        for (const mod of serverNullModules) {
          if (request === mod || request.startsWith(mod + '/')) {
            return callback(null, `commonjs ${request}`);
          }
        }
        callback();
      });
      config.externals = existingExternals;

      // Also use IgnorePlugin for sharp to prevent it from being bundled
      const webpack = require('webpack');
      config.plugins = config.plugins || [];
      config.plugins.push(new webpack.IgnorePlugin({
        resourceRegExp: /^(sharp|canvas)$/,
      }));
    }
    return config;
  },

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

  // Security + caching headers
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
              "worker-src 'self' blob:",
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
      // Static asset caching (1 year immutable)
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Media files (audio/video/images) caching
      {
        source: "/videos/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, immutable" },
        ],
      },
      {
        source: "/audio/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, immutable" },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, immutable" },
        ],
      },
    ];
  },

  async redirects() {
    return [];
  },
};

module.exports = nextConfig;

