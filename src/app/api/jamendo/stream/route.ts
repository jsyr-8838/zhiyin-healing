/**
 * Jamendo 音频流代理
 *
 * 作用：将 Jamendo CDN 音频变成同源请求
 * - 解决 Web Audio API 的 MediaElementAudioSourceNode 跨域静音问题
 * - 代理后音频为同源，createMediaElementSource 可正常分析频谱
 * - 服务端转发，浏览器看到的是 localhost:3000 的同源 URL
 *
 * 使用：GET /api/jamendo/stream?url=https://prod-1.storage.jamendo.com/...
 * 安全：只允许 proxy-1.storage.jamendo.com 域名，防 SSRF
 */

import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = [
  'prod-1.storage.jamendo.com',
  'prod-2.storage.jamendo.com',
  'ct1.storage.jamendo.com',
  'mp3d.jamendo.com',
];

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const audioUrl = request.nextUrl.searchParams.get('url');

    if (!audioUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    // 安全校验：只允许 Jamendo CDN 域名
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(audioUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    if (!ALLOWED_HOSTS.some(host => parsedUrl.hostname === host)) {
      return NextResponse.json(
        { error: 'Only Jamendo CDN URLs are allowed' },
        { status: 403 },
      );
    }

    // 透传客户端的 Range 头（音频 seek 必需）
    const upstreamHeaders: Record<string, string> = {
      'User-Agent': 'HeytcmHealingApp/1.0',
      'Accept': 'audio/mpeg, audio/*',
    };
    const rangeHeader = request.headers.get('Range');
    if (rangeHeader) {
      upstreamHeaders['Range'] = rangeHeader;
    }

    // 请求 Jamendo 音频
    const response = await fetch(audioUrl, { headers: upstreamHeaders });

    if (!response.ok && response.status !== 206) {
      console.error(`[Jamendo Stream] Upstream error: ${response.status}`);
      return NextResponse.json(
        { error: `Audio source returned ${response.status}` },
        { status: 502 },
      );
    }

    // 透传音频流，加上 CORS 头
    const contentType = response.headers.get('Content-Type') || 'audio/mpeg';
    const contentLength = response.headers.get('Content-Length');
    const contentRange = response.headers.get('Content-Range');
    const acceptRanges = response.headers.get('Accept-Ranges');

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 'public, max-age=3600');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }
    if (acceptRanges) {
      headers.set('Accept-Ranges', acceptRanges);
    } else {
      headers.set('Accept-Ranges', 'bytes');
    }
    // 206 Partial Content 响应需要透传 Content-Range
    if (contentRange) {
      headers.set('Content-Range', contentRange);
    }

    const status = response.status === 206 ? 206 : 200;
    return new NextResponse(response.body, { status, headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[Jamendo Stream] Error: ${message}`);
    return NextResponse.json({ error: 'Stream proxy error' }, { status: 500 });
  }
}
