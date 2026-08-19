/**
 * Jamendo API 集成 — CC许可免费音乐流媒体
 *
 * API文档: https://developer.jamendo.com/v3.0
 * 60万+曲目，完全免费，Creative Commons 许可
 *
 * 使用方式：
 *   1. 在 .env.local 中设置 JAMENDO_CLIENT_ID
 *   2. 通过 searchJamendoTracks 搜索曲目
 *   3. 通过 getHealingTracksByElement 获取五行疗愈曲目
 *   4. 通过 /api/jamendo 服务端代理（避免CORS + 保护client_id）
 */

import type { PlayerTrack } from './playlist';

// ===== 类型定义 =====

export interface JamendoTrack {
  id: string;
  name: string;
  artist_name: string;
  album_name?: string;
  duration: number;
  audioUrl: string;
  image?: string;
  tags?: string[];
}

export interface JamendoSearchOptions {
  query?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  order?: string;
}

interface JamendoApiTrack {
  id: string;
  name: string;
  artist_name: string;
  album_name?: string;
  duration: number;
  audio?: string;
  audiodownload?: string;
  image?: string;
  musicinfo?: {
    tags?: {
      genres?: string[];
      instruments?: string[];
      moods?: string[];
    };
  };
}

interface JamendoApiResponse {
  headers: {
    status: string;
    code: number;
    error_message?: string;
    results_count: number;
  };
  results: JamendoApiTrack[];
}

// ===== 缓存 =====

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 10 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttlMs = CACHE_TTL_MS): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// ===== 限流 =====

let lastRequestTime = 0;
const MIN_INTERVAL_MS = 250;

async function rateLimitedFetch(url: string, init?: RequestInit): Promise<Response> {
  const now = Date.now();
  const wait = Math.max(0, MIN_INTERVAL_MS - (now - lastRequestTime));
  if (wait > 0) {
    await new Promise(r => setTimeout(r, wait));
  }
  lastRequestTime = Date.now();
  return fetch(url, init);
}

// ===== 基础请求 =====

async function jamendoRequest(
  endpoint: string,
  params: Record<string, string>,
  clientId?: string,
): Promise<JamendoApiResponse> {
  const base = '/api/jamendo';
  const qs = new URLSearchParams({
    ...params,
    format: 'json',
    include: 'musicinfo+stats',
  });
  const url = `${base}?${qs.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Jamendo proxy error: ${res.status} ${res.statusText}`);
  }
  const data: JamendoApiResponse = await res.json();
  if (data.headers.code !== 0) {
    throw new Error(`Jamendo API error: ${data.headers.error_message || data.headers.status}`);
  }
  return data;
}

// ===== 映射 =====

function mapJamendoTrack(raw: JamendoApiTrack): JamendoTrack {
  const tags: string[] = [
    ...(raw.musicinfo?.tags?.genres || []),
    ...(raw.musicinfo?.tags?.moods || []),
    ...(raw.musicinfo?.tags?.instruments || []),
  ];
  // 原始 CDN URL
  const originalAudioUrl = raw.audio || raw.audiodownload || '';
  // 走本地代理，变成同源请求，解决 Web Audio 跨域静音问题
  const audioUrl = originalAudioUrl
    ? `/api/jamendo/stream?url=${encodeURIComponent(originalAudioUrl)}`
    : '';
  return {
    id: raw.id,
    name: raw.name,
    artist_name: raw.artist_name,
    album_name: raw.album_name,
    duration: raw.duration,
    audioUrl,
    image: raw.image || undefined,
    tags: tags.length > 0 ? tags : undefined,
  };
}

// ===== 公开 API =====

const ELEMENT_TAG_MAP: Record<string, string[]> = {
  wood: ['world', 'instrumental'],
  fire: ['world', 'instrumental'],
  earth: ['world', 'instrumental'],
  metal: ['world', 'instrumental'],
  water: ['world', 'instrumental'],
};

const ELEMENT_MOOD_QUERIES: Record<string, string[]> = {
  wood: ['guqin spring', 'guzheng forest birds', 'dizi bamboo flute', 'chinese nature flute', 'shakuhachi zen garden'],
  fire: ['erhu passionate', 'pipa fast', 'chinese drum festival', 'suona energetic', 'guzheng fire dance'],
  earth: ['guzheng grounding', 'guqin stable calm', 'yangqin harmonic', 'chinese lute steady', 'pipa earth meditation'],
  metal: ['shakuhachi clarity', 'xiao bamboo flute crystal', 'singing bowl metal', 'chinese flute pure', 'guzheng autumn clarity'],
  water: ['guqin water flowing', 'guzheng rain', 'erhu river melancholy', 'chinese stream bowl', 'xiao bamboo rain meditation'],
};

/** 中文意境搜索策略 — 按意境匹配Jamendo关键词
 *
 * 优化策略（v2）：
 *   - 每个意境优先用中文乐器名（guqin/guzheng/erhu/pipa/shakuhachi等）搜索
 *   - tags 限定 world/asian/instrumental，压低欧美电子乐权重
 *   - 关键词加入 "chinese"/"japanese"/"asian" 地域限定
 *   - 所有查询均以传统乐器/东方意象开头，西式词仅作补充
 */
export const MOOD_CATALOG: Record<string, {
  label: string;
  desc: string;
  queries: string[];
  tags?: string[];
  accent: string;
}> = {
  cangliang: {
    label: '苍凉',
    desc: '大漠孤烟，长河落日',
    queries: ['erhu', 'morin khuur mongolian', 'chinese erhu sad', 'throat singing', 'huqin desert', 'dunhuang ambience'],
    tags: ['world', 'instrumental'],
    accent: '#9CA3AF',
  },
  zhiyu: {
    label: '治愈',
    desc: '温润如玉，抚慰心灵',
    queries: ['singing bowl tibetan', 'guqin meditation', '528 hz healing bowl', 'chinese guzheng calm', 'handpan zen', 'tuning fork 432'],
    tags: ['meditation', 'world'],
    accent: '#34D399',
  },
  wennuan: {
    label: '温暖',
    desc: '围炉夜话，岁月静好',
    queries: ['guzheng warm', 'pipa gentle', 'chinese lute acoustic', 'yangqin soft', 'koto peaceful', 'shamisen cozy'],
    tags: ['instrumental', 'world'],
    accent: '#FBBF24',
  },
  caoyuan: {
    label: '草原',
    desc: '天苍苍，野茫茫',
    queries: ['morin khuur', 'mongolian horse fiddle', 'hulusi flute', 'chinese bamboo flute grassland', 'horsehead fiddle'],
    tags: ['world', 'instrumental'],
    accent: '#6EE7B7',
  },
  gufeng: {
    label: '古风',
    desc: '丝竹管弦，千年回响',
    queries: ['guqin', 'guzheng', 'pipa', 'erhu chinese', 'shakuhachi', 'chinese traditional instrument', 'dizi flute', 'xiao bamboo'],
    tags: ['world', 'instrumental'],
    accent: '#C084FC',
  },
  chanxing: {
    label: '禅行',
    desc: '空山无人，水流花开',
    queries: ['zen guqin', 'shakuhachi meditation', 'temple bells china', 'tai chi music', 'chinese zen flute', 'buddhist chant bowl'],
    tags: ['meditation', 'world'],
    accent: '#67E8F9',
  },
  ziran: {
    label: '自然',
    desc: '山间溪流，鸟鸣深涧',
    queries: ['bamboo forest stream', 'chinese nature guqin', 'rain bowl meditation', 'guzheng water flow', 'bird song asian garden'],
    tags: ['ambient', 'world'],
    accent: '#4ADE80',
  },
  shanguang: {
    label: '山光',
    desc: '云深不知处，只在此山中',
    queries: ['guzheng mountain', 'guqin clouds', 'shakuhachi mist', 'chinese highland flute', 'xiao bamboo mountain', 'tibetan bowl summit'],
    tags: ['ambient', 'world'],
    accent: '#A78BFA',
  },
};

/** 按中文意境获取在线曲目 */
export async function getTracksByMood(
  moodKey: string,
  limit = 20,
): Promise<JamendoTrack[]> {
  const catalog = MOOD_CATALOG[moodKey];
  if (!catalog) return [];

  const cacheKey = `mood:${moodKey}:${limit}`;
  const cached = getCached<JamendoTrack[]>(cacheKey);
  if (cached) return cached;

  const allResults: JamendoTrack[] = [];
  const seenIds = new Set<string>();

  // 先按标签搜索
  if (catalog.tags && catalog.tags.length > 0) {
    const tagResults = await searchJamendoTracks({
      tags: catalog.tags,
      limit: Math.ceil(limit * 0.6),
      order: 'popularity_month',
    });
    for (const t of tagResults) {
      if (!seenIds.has(t.id) && allResults.length < limit) {
        seenIds.add(t.id);
        allResults.push(t);
      }
    }
  }

  // 再按关键词补充
  for (const q of catalog.queries) {
    if (allResults.length >= limit) break;
    const qResults = await searchJamendoTracks({
      query: q,
      limit: Math.ceil(limit / catalog.queries.length) + 2,
      order: 'popularity_month',
    });
    for (const t of qResults) {
      if (!seenIds.has(t.id) && allResults.length < limit) {
        seenIds.add(t.id);
        allResults.push(t);
      }
    }
  }

  setCache(cacheKey, allResults);
  return allResults;
}

export async function searchJamendoTracks(
  options: JamendoSearchOptions,
): Promise<JamendoTrack[]> {
  const { query, tags, limit = 20, offset = 0, order = 'popularity_total' } = options;

  const cacheKey = `search:${query || ''}:${(tags || []).join(',')}:${limit}:${offset}:${order}`;
  const cached = getCached<JamendoTrack[]>(cacheKey);
  if (cached) return cached;

  const params: Record<string, string> = {
    limit: String(Math.min(limit, 200)),
    offset: String(offset),
    order,
  };
  if (query) params.search = query;
  if (tags && tags.length > 0) params.tags = tags.join('+');

  const data = await jamendoRequest('tracks', params);
  const tracks = data.results.map(mapJamendoTrack).filter(t => t.audioUrl);

  setCache(cacheKey, tracks);
  return tracks;
}

export async function getHealingTracksByElement(
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water',
  limit = 15,
): Promise<JamendoTrack[]> {
  const cacheKey = `healing:${element}:${limit}`;
  const cached = getCached<JamendoTrack[]>(cacheKey);
  if (cached) return cached;

  const tags = ELEMENT_TAG_MAP[element] || ['relaxation'];
  const queries = ELEMENT_MOOD_QUERIES[element] || ['meditation'];

  const perQuery = Math.ceil(limit / queries.length);
  const allResults: JamendoTrack[] = [];
  const seenIds = new Set<string>();

  const tagResults = await searchJamendoTracks({
    tags,
    limit: Math.ceil(limit * 1.5),
    order: 'popularity_month',
  });

  for (const t of tagResults) {
    if (!seenIds.has(t.id) && allResults.length < limit) {
      seenIds.add(t.id);
      allResults.push(t);
    }
  }

  if (allResults.length < limit) {
    for (const q of queries) {
      if (allResults.length >= limit) break;
      const qResults = await searchJamendoTracks({
        query: q,
        limit: perQuery,
        order: 'popularity_month',
      });
      for (const t of qResults) {
        if (!seenIds.has(t.id) && allResults.length < limit) {
          seenIds.add(t.id);
          allResults.push(t);
        }
      }
    }
  }

  setCache(cacheKey, allResults);
  return allResults;
}

const ELEMENT_COLORS: Record<string, string> = {
  wood: '#27AE60',
  fire: '#E74C3C',
  earth: '#F39C12',
  metal: '#3498DB',
  water: '#1ABC9C',
};

const ELEMENT_MOOD_KEYS: Record<string, string> = {
  wood: 'healing-wood',
  fire: 'healing-fire',
  earth: 'healing-earth',
  metal: 'healing-metal',
  water: 'healing-water',
};

export function jamendoToPlayerTrack(
  track: JamendoTrack,
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water',
): PlayerTrack {
  return {
    uid: `jamendo-${track.id}`,
    title: `${track.artist_name}·${track.name}`,
    artist: track.artist_name,
    coverUrl: track.image || `/images/healing/${element}-cover.svg`,
    audioUrl: track.audioUrl,
    duration: track.duration,
    mood: ELEMENT_MOOD_KEYS[element] || 'healing',
    element,
  };
}

export function clearJamendoCache(): void {
  cache.clear();
}
