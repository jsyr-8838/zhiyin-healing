/**
 * Pixabay 音频流代理
 *
 * 代理 Pixabay CDN 音频，使其成为同源请求
 * 支持 Range 请求（音频 seek 必需）
 *
 * 使用：GET /api/pixabay/stream?url=https://cdn.pixabay.com/download/audio/...
 * 安全：只允许 cdn.pixabay.com 域名，防 SSRF
 */

import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = [
  'cdn.pixabay.com',
];

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const audioUrl = request.nextUrl.searchParams.get('url');

    if (!audioUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(audioUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    if (!ALLOWED_HOSTS.some(host => parsedUrl.hostname.endsWith(host))) {
      return NextResponse.json(
        { error: 'Only Pixabay CDN URLs are allowed' },
        { status: 403 },
      );
    }

    const upstreamHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'audio/mpeg, audio/*',
    };
    const rangeHeader = request.headers.get('Range');
    if (rangeHeader) upstreamHeaders['Range'] = rangeHeader;

    const response = await fetch(audioUrl, { headers: upstreamHeaders });

    if (!response.ok && response.status !== 206) {
      console.error(`[Pixabay Stream] Upstream error: ${response.status}`);
      return NextResponse.json({ error: `Audio source returned ${response.status}` }, { status: 502 });
    }

    const contentType = response.headers.get('Content-Type') || 'audio/mpeg';
    const contentLength = response.headers.get('Content-Length');
    const contentRange = response.headers.get('Content-Range');
    const acceptRanges = response.headers.get('Accept-Ranges');

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 'public, max-age=86400'); // Pixabay 音频缓存24h
    if (contentLength) headers.set('Content-Length', contentLength);
    headers.set('Accept-Ranges', acceptRanges || 'bytes');
    if (contentRange) headers.set('Content-Range', contentRange);

    const status = response.status === 206 ? 206 : 200;
    return new NextResponse(response.body, { status, headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Pixabay Stream] Error: ${message}`);
    return NextResponse.json({ error: 'Stream proxy error' }, { status: 500 });
  }
}
