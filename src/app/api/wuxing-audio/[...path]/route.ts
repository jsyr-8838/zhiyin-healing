import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';

/**
 * Wuxing Audio Proxy API
 *
 * Streams five-element audio files from Backblaze B2.
 * URL: /api/wuxing-audio/{element}/{filename}
 *
 * The element directory name is mapped to the B2 path:
 *   wood  → audio/wuxing/{filename}
 *   fire  → audio/wuxing/{filename}
 *   etc.
 *
 * Since all wuxing files are in a flat directory on B2 (audio/wuxing/),
 * the element is extracted from the URL for routing but the file lookup
 * uses the filename directly against B2.
 */

const B2_KEY_ID = process.env.B2_KEY_ID || '';
const B2_APP_KEY = process.env.B2_APP_KEY || '';
const B2_BUCKET = process.env.B2_BUCKET || 'zhiyin-media';
const B2_ENDPOINT = process.env.B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com';
const B2_REGION = 'us-east-005';
const B2_PREFIX = 'audio/wuxing/';

const ALLOWED_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac']);
const ALLOWED_SUBDIRS = new Set(['wood', 'fire', 'earth', 'metal', 'water']);

// ── B2 Presigned URL Generation ──────────────────────────────────────────────

function generatePresignedUrl(key: string): string {
  const datetime = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const dateStamp = datetime.substring(0, 8);

  const canonicalUri = `/${B2_BUCKET}/${key}`;
  const credentialScope = `${dateStamp}/${B2_REGION}/s3/aws4_request`;

  const queryParams = new URLSearchParams({
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${B2_KEY_ID}/${credentialScope}`,
    'X-Amz-Date': datetime,
    'X-Amz-Expires': '86400',
    'X-Amz-SignedHeaders': 'host',
  });

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

  const stringToSign = [
    'AWS4-HMAC-SHA256',
    datetime,
    credentialScope,
    crypto.createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n');

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

    // Generate presigned URL and redirect
    const presignedUrl = generatePresignedUrl(b2Key);

    return NextResponse.redirect(presignedUrl, {
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
