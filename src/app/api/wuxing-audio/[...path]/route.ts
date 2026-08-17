import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const EXTERNAL_AUDIO_ROOT = process.env.WUXING_AUDIO_ROOT || 'F:\\heytcm-audio';
const ALLOWED_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac']);
const ALLOWED_SUBDIRS = new Set(['wood', 'fire', 'earth', 'metal', 'water']);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path;
    if (!pathSegments || pathSegments.length < 2) {
      return NextResponse.json({ error: '路径格式错误，需 /wood/filename.mp3' }, { status: 400 });
    }

    const [elementDir, ...restPath] = pathSegments;
    if (!ALLOWED_SUBDIRS.has(elementDir)) {
      return NextResponse.json({ error: `不支持的五行目录: ${elementDir}` }, { status: 400 });
    }

    const filename = restPath.join('/');
    if (!filename) {
      return NextResponse.json({ error: '缺少文件名' }, { status: 400 });
    }

    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: `不支持的音频格式: ${ext}` }, { status: 400 });
    }

    // Prevent path traversal
    if (filename.includes('..') || filename.startsWith('/') || filename.startsWith('\\')) {
      return NextResponse.json({ error: '非法路径' }, { status: 400 });
    }

    const filePath = join(EXTERNAL_AUDIO_ROOT, elementDir, filename);
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: '文件不存在', path: `${elementDir}/${filename}` }, { status: 404 });
    }

    const fileStat = await stat(filePath);
    const fileSize = fileStat.size;

    // Determine MIME type
    const mimeMap: Record<string, string> = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.flac': 'audio/flac',
      '.m4a': 'audio/mp4',
      '.aac': 'audio/aac',
    };
    const contentType = mimeMap[ext] || 'application/octet-stream';

    // Handle Range requests (for seeking)
    const rangeHeader = request.headers.get('range');
    if (rangeHeader) {
      const match = /bytes=(\d+)-(\d*)/.exec(rangeHeader);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        if (start >= fileSize || end >= fileSize) {
          return new NextResponse('Range Not Satisfiable', {
            status: 416,
            headers: { 'Content-Range': `bytes */${fileSize}` },
          });
        }

        const buffer = await readFile(filePath);
        const chunk = buffer.subarray(start, end + 1);

        return new NextResponse(chunk, {
          status: 206,
          headers: {
            'Content-Type': contentType,
            'Content-Length': chunkSize.toString(),
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'public, max-age=86400',
          },
        });
      }
    }

    // Full file response
    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': fileSize.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Wuxing audio proxy error:', error);
    return NextResponse.json({ error: '音频文件读取失败' }, { status: 500 });
  }
}
