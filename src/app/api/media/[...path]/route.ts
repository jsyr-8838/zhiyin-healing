import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';

/**
 * B2 Media Proxy API Route
 *
 * Generates AWS Sig V4 presigned URLs for Backblaze B2 private bucket
 * and redirects the client (302) to the signed URL.
 *
 * The B2 download token is cached server-side and refreshed before expiry.
 * This avoids exposing B2 credentials to the client and keeps all media
 * accessible from China (B2 S3 endpoint is directly reachable, unlike
 * Cloudflare workers.dev which is blocked).
 */

// ── B2 Config ──────────────────────────────────────────────────────────────
const B2_KEY_ID = process.env.B2_KEY_ID || '';
const B2_APP_KEY = process.env.B2_APP_KEY || '';
const B2_BUCKET = process.env.B2_BUCKET || 'zhiyin-media';
const B2_ENDPOINT = process.env.B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com';
const B2_REGION = 'us-east-005';

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

/**
 * Generate AWS Sig V4 presigned URL for B2 S3.
 * This avoids the extra API round-trip and supports Range requests natively.
 */
function generatePresignedUrl(key: string): string {
  const datetime = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dateStamp = datetime.substring(0, 8);

  const canonicalUri = `/${B2_BUCKET}/${key}`;
  const credentialScope = `${dateStamp}/${B2_REGION}/s3/aws4_request`;

  const queryParams = new URLSearchParams({
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${B2_KEY_ID}/${credentialScope}`,
    'X-Amz-Date': datetime,
    'X-Amz-Expires': '86400', // 24 hours
    'X-Amz-SignedHeaders': 'host',
  });

  // Canonical request
  const canonicalHeaders = `host:${new URL(B2_ENDPOINT).hostname}\n`;
  const signedHeaders = 'host';
  const canonicalRequest = [
    'GET',
    canonicalUri,
    queryParams.toString(),
    canonicalHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD',
  ].join('\n');

  // String to sign
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    datetime,
    credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n');

  // Signing key
  const kDate = crypto
    .createHmac('sha256', `AWS4${B2_APP_KEY}`)
    .update(dateStamp)
    .digest();
  const kRegion = crypto
    .createHmac('sha256', kDate)
    .update(B2_REGION)
    .digest();
  const kService = crypto
    .createHmac('sha256', kRegion)
    .update('s3')
    .digest();
  const kSigning = crypto
    .createHmac('sha256', kService)
    .update('aws4_request')
    .digest();

  const signature = crypto
    .createHmac('sha256', kSigning)
    .update(stringToSign)
    .digest('hex');

  queryParams.set('X-Amz-Signature', signature);

  return `${B2_ENDPOINT}${canonicalUri}?${queryParams.toString()}`;
}

// ── Route Handler ───────────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Reconstruct file path from URL segments
  const filePath = params.path.map(decodeURIComponent).join('/');

  if (!filePath) {
    return NextResponse.json(
      { error: 'No file path provided' },
      { status: 400 }
    );
  }

  try {
    // Generate presigned URL (no API round-trip needed)
    const presignedUrl = generatePresignedUrl(filePath);

    // 302 redirect to the presigned B2 URL
    return NextResponse.redirect(presignedUrl, {
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
  { params }: { params: { path: string[] } }
) {
  return GET(request, { params });
}
