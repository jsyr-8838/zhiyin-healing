import { NextResponse } from 'next/server';

/**
 * Wuxing Audio Catalog API
 * 
 * Lists five-element audio tracks from Backblaze B2.
 * Files are stored at: audio/wuxing/{filename}
 * 
 * Element mapping (by filename keyword):
 *   spring  → wood  (角)
 *   summer  → fire  (徵)
 *   late-summer / gong → earth (宫)
 *   autumn / shang → metal (商)
 *   winter / yu → water (羽)
 */

const B2_KEY_ID = process.env.B2_KEY_ID || '';
const B2_APP_KEY = process.env.B2_APP_KEY || '';
const B2_BUCKET = process.env.B2_BUCKET || 'zhiyin-media';
const B2_ENDPOINT = process.env.B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com';
const B2_REGION = 'us-east-005';
const B2_PREFIX = 'audio/wuxing/';

const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac']);

const ELEMENT_MAP: Record<string, { tone: string; wuxinKey: string; color: string }> = {
  wood:  { tone: '角', wuxinKey: 'jiao', color: '#5d8a63' },
  fire:  { tone: '徵', wuxinKey: 'zhi',  color: '#c26158' },
  earth: { tone: '宫', wuxinKey: 'gong', color: '#c9a94f' },
  metal: { tone: '商', wuxinKey: 'shang', color: '#5ba09a' },
  water: { tone: '羽', wuxinKey: 'yu',   color: '#3d7a75' },
};

/** Detect element from filename */
function detectElement(filename: string): string | null {
  const lower = filename.toLowerCase();
  if (lower.includes('spring') || lower.includes('jiao') || lower.includes('wood')) return 'wood';
  if (lower.includes('summer') && !lower.includes('late')) return 'fire';
  if (lower.includes('late-summer') || lower.includes('gong') || lower.includes('earth')) return 'earth';
  if (lower.includes('autumn') || lower.includes('shang') || lower.includes('metal')) return 'metal';
  if (lower.includes('winter') || lower.includes('yu') || lower.includes('water')) return 'water';
  return null;
}

// ── B2 Auth ──────────────────────────────────────────────────────────────────

interface B2Auth {
  apiUrl: string;
  authToken: string;
  bucketId: string;
}

let cachedAuth: B2Auth | null = null;
let cachedAuthExpiry = 0;

async function getB2Auth(): Promise<B2Auth> {
  if (cachedAuth && Date.now() < cachedAuthExpiry) {
    return cachedAuth;
  }

  const authHeader = 'Basic ' + Buffer.from(`${B2_KEY_ID}:${B2_APP_KEY}`).toString('base64');
  const authRes = await fetch(
    'https://api.backblazeb2.com/b2api/v3/b2_authorize_account',
    { headers: { Authorization: authHeader } }
  );
  if (!authRes.ok) {
    throw new Error(`B2 authorize failed: ${authRes.status}`);
  }
  const authData = await authRes.json();

  cachedAuth = {
    apiUrl: authData.apiInfo.storageApi.apiUrl,
    authToken: authData.authorizationToken,
    bucketId: authData.apiInfo.storageApi.bucketId,
  };
  cachedAuthExpiry = Date.now() + 3600000; // 1 hour

  return cachedAuth;
}

// ── Route Handler ───────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!B2_KEY_ID || !B2_APP_KEY) {
      return NextResponse.json({
        tracks: [],
        total: 0,
        available: false,
        debug: { error: 'B2 credentials not configured' },
      });
    }

    const auth = await getB2Auth();

    // List all files under audio/wuxing/
    const allFiles: { fileName: string; size: number }[] = [];
    let startFileName: string | null = null;

    do {
      const body = {
        bucketId: auth.bucketId,
        prefix: B2_PREFIX,
        maxFileCount: 100,
        ...(startFileName ? { startFileName } : {}),
      };

      const listRes = await fetch(`${auth.apiUrl}/b2api/v3/b2_list_file_names`, {
        method: 'POST',
        headers: {
          Authorization: auth.authToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!listRes.ok) {
        throw new Error(`B2 list failed: ${listRes.status}`);
      }

      const listData = await listRes.json();
      allFiles.push(...listData.files);
      startFileName = listData.nextFileName;
    } while (startFileName);

    // Build track list
    const tracks: object[] = [];

    for (const file of allFiles) {
      const filename = file.fileName.replace(B2_PREFIX, '');
      const ext = '.' + filename.split('.').pop()?.toLowerCase();

      if (!AUDIO_EXTENSIONS.has(ext)) continue;

      const baseName = filename.replace(/\.[^.]+$/, '');
      const element = detectElement(filename);

      if (!element) continue;

      const info = ELEMENT_MAP[element];

      tracks.push({
        id: `wuxing300-${element}-${baseName}`,
        title: baseName,
        subtitle: `${info.tone}音·${element}`,
        src: `/api/wuxing-audio/${element}/${encodeURIComponent(filename)}`,
        instrument: 'mix',
        element: info.wuxinKey,
        color: info.color,
        duration: undefined,
        credit: '五行养生音源（个人研究用）',
        source: 'wuxing300',
        sizeBytes: file.size,
      });
    }

    return NextResponse.json({
      tracks,
      total: tracks.length,
      available: true,
      source: 'b2',
    });
  } catch (error) {
    console.error('Wuxing audio catalog error:', error);
    return NextResponse.json({
      tracks: [],
      total: 0,
      available: false,
      error: String(error),
    });
  }
}
