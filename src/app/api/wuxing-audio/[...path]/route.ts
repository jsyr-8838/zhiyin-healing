import { NextRequest, NextResponse } from 'next/server';

/**
 * Wuxing Audio Proxy API
 *
 * Streams five-element audio files from Backblaze B2.
 * URL: /api/wuxing-audio/{element}/{filename}
 *
 * Uses B2 native API download authorization (7-day token) to generate
 * download URLs that redirect the client (302) to B2.
 *
 * Simpler and more reliable than AWS Sig V4 for filenames containing
 * non-ASCII characters.
 */

const B2_KEY_ID = process.env.B2_KEY_ID || '';
const B2_APP_KEY = process.env.B2_APP_KEY || '';
const B2_BUCKET = process.env.B2_BUCKET || 'zhiyin-media';
const B2_PREFIX = 'audio/wuxing/';

const ALLOWED_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac']);
const ALLOWED_SUBDIRS = new Set(['wood', 'fire', 'earth', 'metal', 'water']);

// ── Token Cache ─────────────────────────────────────────────────────────────
interface CachedAuth {
  apiUrl: string;
  downloadUrl: string;
  authToken: string;
  downloadAuthToken: string;
  expiresAt: number;
}

let cachedAuth: CachedAuth | null = null;

/**
 * Authenticate with B2 native API and get a download authorization token.
 * The download token is valid for 7 days; we refresh at 6 days.
 */
async function getB2Auth(): Promise<CachedAuth> {
  if (cachedAuth && Date.now() < cachedAuth.expiresAt) {
    return cachedAuth;
  }

  const authHeader =
    'Basic ' + Buffer.from(`${B2_KEY_ID}:${B2_APP_KEY}`).toString('base64');

  // Step 1: Authorize account
  const authRes = await fetch(
    'https://api.backblazeb2.com/b2api/v3/b2_authorize_account',
    { headers: { Authorization: authHeader } }
  );
  if (!authRes.ok) {
    throw new Error(`B2 authorize failed: ${authRes.status}`);
  }
  const authData = await authRes.json();
  const apiUrl = authData.apiInfo.storageApi.apiUrl;
  const downloadUrl = authData.apiInfo.storageApi.downloadUrl;
  const authToken = authData.authorizationToken;

  // Step 2: Get download authorization (valid 7 days)
  const dlRes = await fetch(`${apiUrl}/b2api/v3/b2_get_download_authorization`, {
    method: 'POST',
    headers: {
      Authorization: authToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bucketId: authData.apiInfo.storageApi.bucketId,
      fileNamePrefix: '',
      validDurationInSeconds: 604800,
    }),
  });
  if (!dlRes.ok) {
    throw new Error(`B2 download auth failed: ${dlRes.status}`);
  }
  const dlData = await dlRes.json();

  cachedAuth = {
    apiUrl,
    downloadUrl,
    authToken,
    downloadAuthToken: dlData.authorizationToken,
    expiresAt: Date.now() + 518400000, // Refresh at 6 days
  };

  return cachedAuth;
}

// ── Route Handler ───────────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path;
    if (!pathSegments || pathSegments.length < 2) {
      return NextResponse.json(
        { error: '路径格式错误，需 /wood/filename.mp3' },
        { status: 400 }
      );
    }

    const [elementDir, ...restPath] = pathSegments;
    if (!ALLOWED_SUBDIRS.has(elementDir)) {
      return NextResponse.json(
        { error: `不支持的五行目录: ${elementDir}` },
        { status: 400 }
      );
    }

    const filename = restPath.join('/');
    if (!filename) {
      return NextResponse.json({ error: '缺少文件名' }, { status: 400 });
    }

    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: `不支持的音频格式: ${ext}` },
        { status: 400 }
      );
    }

    // Prevent path traversal
    if (filename.includes('..') || filename.startsWith('/') || filename.startsWith('\\')) {
      return NextResponse.json({ error: '非法路径' }, { status: 400 });
    }

    // Build B2 key: audio/wuxing/{filename}
    const b2Key = `${B2_PREFIX}${filename}`;
    const auth = await getB2Auth();

    // Encode each path segment individually to preserve / separators
    const encodedPath = b2Key.split('/').map(seg => encodeURIComponent(seg)).join('/');

    const downloadUrl = `${auth.downloadUrl}/file/${B2_BUCKET}/${encodedPath}?Authorization=${encodeURIComponent(auth.downloadAuthToken)}`;

    return NextResponse.redirect(downloadUrl, {
      headers: {
        'Cache-Control': 'public, max-age=3600, immutable',
      },
    });
  } catch (error) {
    console.error('Wuxing audio proxy error:', error);
    return NextResponse.json({ error: '音频文件获取失败' }, { status: 500 });
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return GET(request, { params });
}
