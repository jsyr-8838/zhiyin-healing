import { NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import { existsSync } from 'fs';

const EXTERNAL_AUDIO_ROOT = process.env.WUXING_AUDIO_ROOT || 'F:\\heytcm-audio';
const DEBUG_ROOT = EXTERNAL_AUDIO_ROOT; // debug
const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac']);

const ELEMENTS = ['wood', 'fire', 'earth', 'metal', 'water'] as const;
type Element = typeof ELEMENTS[number];

const ELEMENT_MAP: Record<Element, { tone: string; wuxinKey: string; color: string }> = {
  wood:  { tone: '角', wuxinKey: 'jiao', color: '#5d8a63' },
  fire:  { tone: '徵', wuxinKey: 'zhi',  color: '#c26158' },
  earth: { tone: '宫', wuxinKey: 'gong', color: '#c9a94f' },
  metal: { tone: '商', wuxinKey: 'shang', color: '#5ba09a' },
  water: { tone: '羽', wuxinKey: 'yu',   color: '#3d7a75' },
};

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!existsSync(EXTERNAL_AUDIO_ROOT)) {
      return NextResponse.json({ tracks: [], total: 0, available: false, debug: { root: DEBUG_ROOT, env: process.env.WUXING_AUDIO_ROOT || '(not set)' } });
    }

    const tracks: object[] = [];

    for (const element of ELEMENTS) {
      const dir = join(EXTERNAL_AUDIO_ROOT, element);
      if (!existsSync(dir)) continue;

      const info = ELEMENT_MAP[element];
      const entries = await readdir(dir);

      for (const entry of entries) {
        const ext = extname(entry).toLowerCase();
        if (!AUDIO_EXTENSIONS.has(ext)) continue;

        const fullPath = join(dir, entry);
        const fileStat = await stat(fullPath);
        const filename = basename(entry, ext);

        tracks.push({
          id: `wuxing300-${element}-${filename}`,
          title: filename,
          subtitle: `${info.tone}音·${element}`,
          src: `/api/wuxing-audio/${element}/${encodeURIComponent(entry)}`,
          instrument: 'mix',
          element: info.wuxinKey,
          color: info.color,
          duration: undefined,
          credit: '五行养生音源（个人研究用）',
          source: 'wuxing300',
          sizeBytes: fileStat.size,
        });
      }
    }

    return NextResponse.json({
      tracks,
      total: tracks.length,
      available: true,
      root: EXTERNAL_AUDIO_ROOT,
    });
  } catch (error) {
    console.error('Wuxing audio catalog error:', error);
    return NextResponse.json({ tracks: [], total: 0, available: false, error: String(error) });
  }
}
