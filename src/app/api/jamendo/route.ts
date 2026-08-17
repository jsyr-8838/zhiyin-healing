/**
 * Jamendo API 服务端代理
 *
 * 作用：
 *   1. 避免 CORS 限制（浏览器无法直接请求 api.jamendo.com）
 *   2. 保护 client_id（不暴露到前端）
 *   3. 服务端缓存减少 API 调用
 *
 * 使用：GET /api/jamendo?endpoint=tracks&search=meditation&tags=relaxation&limit=10
 *
 * 环境变量：JAMENDO_CLIENT_ID（必需）
 */

import { NextRequest, NextResponse } from 'next/server';

const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';
const CACHE_TTL = 10 * 60 * 1000;

interface ServerCacheEntry {
  data: unknown;
  expiresAt: number;
}

const serverCache = new Map<string, ServerCacheEntry>();

function getClientId(): string {
  const id = process.env.JAMENDO_CLIENT_ID;
  if (!id) {
    throw new Error('JAMENDO_CLIENT_ID environment variable is not set');
  }
  return id;
}

function getServerCached(key: string): unknown | null {
  const entry = serverCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    serverCache.delete(key);
    return null;
  }
  return entry.data;
}

function setServerCache(key: string, data: unknown): void {
  if (serverCache.size > 500) {
    const oldest = Array.from(serverCache.entries())
      .sort((a, b) => a[1].expiresAt - b[1].expiresAt)
      .slice(0, 100);
    for (const [k] of oldest) serverCache.delete(k);
  }
  serverCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

const ALLOWED_ENDPOINTS = new Set(['tracks', 'artists', 'albums']);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const endpoint = searchParams.get('endpoint') || 'tracks';
    if (!ALLOWED_ENDPOINTS.has(endpoint)) {
      return NextResponse.json(
        { error: `Endpoint "${endpoint}" not allowed. Use: ${Array.from(ALLOWED_ENDPOINTS).join(', ')}` },
        { status: 400 },
      );
    }

    const cacheKey = `jamendo:${endpoint}:${searchParams.toString()}`;
    const cached = getServerCached(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT' },
      });
    }

    const clientId = getClientId();

    const jamendoParams = new URLSearchParams();
    jamendoParams.set('client_id', clientId);
    jamendoParams.set('format', searchParams.get('format') || 'json');

    const include = searchParams.get('include');
    if (include) jamendoParams.set('include', include);
    else jamendoParams.set('include', 'musicinfo+stats');

    for (const key of ['search', 'tags', 'limit', 'offset', 'order', 'artist_id', 'album_id', 'track_id', 'namesearch', 'groupby', 'audioformat', 'audiodlformat']) {
      const val = searchParams.get(key);
      if (val) jamendoParams.set(key, val);
    }

    const jamendoUrl = `${JAMENDO_API_BASE}/${endpoint}/?${jamendoParams.toString()}`;

    const response = await fetch(jamendoUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HeytcmHealingApp/1.0',
      },
      next: { revalidate: 600 },
    });

    if (!response.ok) {
      console.error(`[Jamendo Proxy] Upstream error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Jamendo API returned ${response.status}` },
        { status: 502 },
      );
    }

    const data = await response.json();

    if (data.headers && data.headers.code !== 0) {
      console.error(`[Jamendo Proxy] API error: ${data.headers.error_message}`);
      return NextResponse.json(
        { error: data.headers.error_message || 'Jamendo API error' },
        { status: 502 },
      );
    }

    setServerCache(cacheKey, data);

    const filtered = { ...data };
    if (filtered.headers) {
      delete (filtered.headers as Record<string, unknown>).warning;
    }

    return NextResponse.json(filtered, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=600, s-maxage=600',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    if (message.includes('JAMENDO_CLIENT_ID')) {
      console.error('[Jamendo Proxy] Missing JAMENDO_CLIENT_ID env var');
      return NextResponse.json(
        { error: 'Jamendo integration not configured. Set JAMENDO_CLIENT_ID in .env.local' },
        { status: 503 },
      );
    }

    console.error(`[Jamendo Proxy] Error: ${message}`);
    return NextResponse.json(
      { error: 'Internal proxy error' },
      { status: 500 },
    );
  }
}
