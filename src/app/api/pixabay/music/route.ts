/**
 * Pixabay 音乐搜索 API 代理
 *
 * 策略（三层降级）：
 *   1. 尝试 HTML 抓取 Pixabay 音乐搜索页
 *   2. 若抓取失败，返回空列表 + fallback 标记
 *   3. 前端组件负责本地降级展示
 *
 * 音频通过 /api/pixabay/stream 代理播放
 * 环境变量：PIXABAY_API_KEY（可选，预留）
 */

import { NextRequest, NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { cosUrl } from '@/lib/cos-url';

const CACHE_TTL = 30 * 60 * 1000;

interface CacheEntry { data: unknown; expiresAt: number; }
const cache = new Map<string, CacheEntry>();

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.data;
}

function setCache(key: string, data: unknown): void {
  if (cache.size > 200) {
    const oldest = Array.from(cache.entries()).sort((a, b) => a[1].expiresAt - b[1].expiresAt).slice(0, 50);
    for (const [k] of oldest) cache.delete(k);
  }
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

/** Pixabay 音乐分类预设 */
export const PIXABAY_PRESETS: Record<string, {
  label: string; desc: string; accent: string; searchTerms: string[];
}> = {
  guoyue: {
    label: '国乐', desc: '古琴古筝，千年回响', accent: '#C084FC',
    searchTerms: ['chinese traditional', 'guqin', 'guzheng', 'erhu', 'pipa'],
  },
  shijie: {
    label: '世界', desc: '万邦之音，寰宇共振', accent: '#34D399',
    searchTerms: ['world music', 'asian', 'oriental', 'ethnic', 'folk'],
  },
  chanxiu: {
    label: '禅修', desc: '空山寂寂，万籁俱寂', accent: '#67E8F9',
    searchTerms: ['zen meditation', 'tibetan bowl', 'singing bowl', 'temple', 'mantra'],
  },
  zhuangzhong: {
    label: '庄重', desc: '钟磬齐鸣，天地肃穆', accent: '#D97706',
    searchTerms: ['orchestral epic', 'cinematic dramatic', 'ceremony', 'grand', 'solemn'],
  },
};

/** 扫描 public/audio/pixabay/ 中的本地 MP3 文件 */
async function scanLocalPixabayFiles() {
  try {
    const dir = join(process.cwd(), 'public', 'audio', 'pixabay');
    const files = await readdir(dir).catch(() => [] as string[]);
    return files
      .filter(f => f.endsWith('.mp3'))
      .map(f => ({
        id: `px-local-${Buffer.from(f).toString('base64').slice(0, 12)}`,
        name: f.replace(/\.mp3$/, '').replace(/[-_]/g, ' '),
        artist: 'Pixabay 精选',
        duration: 0,
        audioUrl: cosUrl(`/audio/pixabay/${f}`),
        image: '',
        tags: ['local'],
        source: 'pixabay-local' as const,
      }));
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'presets';

    if (action === 'presets') {
      const presets = Object.entries(PIXABAY_PRESETS).map(([key, val]) => ({ key, ...val }));
      const localFiles = await scanLocalPixabayFiles();
      return NextResponse.json({ presets, localFiles, localCount: localFiles.length });
    }

    if (action === 'local') {
      const localFiles = await scanLocalPixabayFiles();
      return NextResponse.json({ tracks: localFiles, source: 'pixabay-local' });
    }

    // 在线搜索
    const query = searchParams.get('q') || 'chinese traditional';
    const page = searchParams.get('page') || '1';

    const cacheKey = `pixabay-music:${query}:${page}`;
    const cached = getCached(cacheKey);
    if (cached) return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });

    const result = await fetchPixabayMusic(query, parseInt(page));

    // 在线搜索失败时自动挂载本地文件
    if (result.tracks.length === 0) {
      const localFiles = await scanLocalPixabayFiles();
      if (localFiles.length > 0) {
        result.tracks = localFiles;
        result.source = 'pixabay-local';
      }
    }

    setCache(cacheKey, result);
    return NextResponse.json(result, { headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=1800' } });
  } catch (error) {
    console.error('[pixabay/music] Error:', error);
    return NextResponse.json({ error: 'Pixabay 音乐搜索失败' }, { status: 500 });
  }
}

async function fetchPixabayMusic(query: string, page: number) {
  const url = `https://pixabay.com/music/search/${encodeURIComponent(query)}/?pagi=${page}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Ch-Ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Upgrade-Insecure-Requests': '1',
      },
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
    });

    if (!response.ok) throw new Error(`Pixabay ${response.status}`);

    const html = await response.text();

    // 检查是否返回了有效内容（非空页或验证码页）
    if (html.length < 5000 || html.includes('cf-challenge') || html.includes('captcha')) {
      throw new Error('Pixabay 返回验证页或空内容');
    }

    const tracks = parsePixabayHtml(html, query);
    return { tracks, source: 'pixabay', query, page };
  } catch (err) {
    console.error('[pixabay/music] Fetch failed:', err);
    return { tracks: [], source: 'pixabay-fallback', query, page, error: 'Pixabay 暂不可用，仅显示本地精选' };
  }
}

function parsePixabayHtml(html: string, query: string) {
  const tracks: Array<{
    id: string; name: string; artist: string; duration: number;
    audioUrl: string; image: string; tags: string[]; source: string;
  }> = [];

  try {
    // 提取 cdn.pixabay.com/download/audio MP3 链接
    const audioRegex = /https?:\/\/cdn\.pixabay\.com\/download\/audio\/[^\s"'<>\\]+\.mp3[^\s"'<>\\]*/g;
    const audioMatches = html.match(audioRegex) || [];

    // 提取曲目信息（Pixabay 页面中的 JSON-LD 或 script 数据）
    const titleRegex = /"title"\s*:\s*"([^"]+?)"/g;
    const titles = [...html.matchAll(titleRegex)].map((m) => m[1]);

    const artistRegex = /"user"\s*:\s*\{[^}]*?"name"\s*:\s*"([^"]+?)"/g;
    const artists = [...html.matchAll(artistRegex)].map((m) => m[1]);

    // 提取缩略图
    const imageRegex = /https?:\/\/cdn\.pixabay\.com\/audio\/[^\s"'<>\\]+_200x200\.jpg/g;
    const imageMatches = html.match(imageRegex) || [];

    const count = Math.min(audioMatches.length, 20);
    for (let i = 0; i < count; i++) {
      const audioUrl = audioMatches[i];
      if (!audioUrl) continue;

      const proxiedUrl = `/api/pixabay/stream?url=${encodeURIComponent(audioUrl)}`;
      tracks.push({
        id: `px-${Buffer.from(audioUrl).toString('base64').slice(0, 16)}`,
        name: titles[i] || `Pixabay ${query} #${i + 1}`,
        artist: artists[i] || 'Pixabay Artist',
        duration: 0,
        audioUrl: proxiedUrl,
        image: imageMatches[i] || '',
        tags: [query],
        source: 'pixabay',
      });
    }
  } catch (err) {
    console.error('[pixabay/music] Parse error:', err);
  }

  return tracks;
}
