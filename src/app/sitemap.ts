import { MetadataRoute } from 'next';

/**
 * sitemap.ts — 自动生成 sitemap.xml
 * 列出所有公开可索引的页面
 */

const BASE_URL = 'https://zhiyin-bay.pages.dev';

const STATIC_PAGES = [
  { url: '', priority: 1.0, changeFrequency: 'daily' as const },
  { url: '/healing', priority: 0.9, changeFrequency: 'daily' as const },
  { url: '/healing/wuyin', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/healing/liuzijue', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/healing/meridian-chart', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/healing/acupoint', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/healing/shichen', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/healing/tcm-quest', priority: 0.8, changeFrequency: 'weekly' as const },
  { url: '/healing/ai-diagnosis', priority: 0.7, changeFrequency: 'weekly' as const },
  { url: '/healing/numerology', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/healing/bianzheng', priority: 0.7, changeFrequency: 'monthly' as const },
  { url: '/healing/dashboard', priority: 0.6, changeFrequency: 'daily' as const },
  { url: '/healing/color-diagnosis', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/healing/jingfang', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/healing/bencao', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/healing/diet', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/healing/fitness', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/healing/singing-bowl', priority: 0.6, changeFrequency: 'monthly' as const },
  { url: '/healing/tea', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/healing/guasha', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/healing/wine', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/healing/flower', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/healing/zhi-yin-zhi-jing', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/healing/grounding', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/healing/chakra', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/healing/essence', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/healing/yunqi', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/healing/solar-calendar', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/healing/spine-solar', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/healing/zhishi', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/healing/mineradio', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/healing/jibing', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/healing/wuxing-clothing', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/healing/tuina-guide', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/healing/acupoint-challenge', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/healing/color-challenge', priority: 0.5, changeFrequency: 'monthly' as const },
  { url: '/healing/experts', priority: 0.6, changeFrequency: 'weekly' as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return STATIC_PAGES.map(page => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}
