import { MetadataRoute } from 'next';

/**
 * robots.ts — 生成 robots.txt
 * 允许搜索引擎爬取所有公开页面
 */

const BASE_URL = 'https://zhiyin-bay.pages.dev';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/healing/experts/admin',
          '/dashboard/settings',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
