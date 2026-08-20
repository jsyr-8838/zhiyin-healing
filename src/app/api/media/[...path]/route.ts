import { NextRequest, NextResponse } from 'next/server';

/**
 * B2 Media Proxy API Route
 *
 * Uses B2 native API download authorization (7-day token) to generate
 * download URLs that redirect the client (302) to B2.
 *
 * Simpler and more reliable than AWS Sig V4 for filenames containing
 * non-ASCII characters (Chinese acupoint names, etc.).
 * The download token is cached server-side and refreshed before expiry.
 */

// ── B2 Config ──────────────────────────────────────────────────────────────
const B2_KEY_ID = process.env.B2_KEY_ID || '';
const B2_APP_KEY = process.env.B2_APP_KEY || '';
const B2_BUCKET = process.env.B2_BUCKET || 'zhiyin-media';

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
  // Return cached if still valid (refresh at 6 days = 518400s)
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
    // Refresh at 6 days (518400000 ms) to be safe
    expiresAt: Date.now() + 518400000,
  };

  return cachedAuth;
}

// ── Route Handler ───────────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // Reconstruct file path from URL segments
  const { path: pathSegments } = await params;
  const filePath = pathSegments.map(decodeURIComponent).join('/');

  if (!filePath) {
    return NextResponse.json(
      { error: 'No file path provided' },
      { status: 400 }
    );
  }

  try {
    // Get B2 download auth (cached for 6 days)
    const auth = await getB2Auth();

    // Build B2 download URL: downloadUrl/bucketName/fileName?Authorization=token
    // Encode each path segment individually to preserve / separators
    const encodedPath = filePath.split('/').map(seg => encodeURIComponent(seg)).join('/');

    const downloadUrl = `${auth.downloadUrl}/file/${B2_BUCKET}/${encodedPath}?Authorization=${encodeURIComponent(auth.downloadAuthToken)}`;

    // 302 redirect to the B2 download URL
    return NextResponse.redirect(downloadUrl, {
      headers: {
        'Cache-Control': 'public, max-age=3600, immutable',
      },
    });
  } catch (err) {
    console.error('[B2 proxy] Error:', err);
    return NextResponse.json(
      { error: 'Failed to generate media URL' },
      { status: 500 }
    );
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return GET(request, { params });
}
