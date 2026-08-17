/**
 * 专家图片上传 API
 * POST /api/experts/upload
 * 接收 FormData，将图片保存到 public/images/experts/ 目录
 * 返回可访问的图片路径
 */
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'images', 'experts');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: '请选择图片文件' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `不支持的图片格式，仅支持 ${ALLOWED_TYPES.join('/')}` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: '图片大小不能超过 5MB' },
        { status: 400 }
      );
    }

    // 确保上传目录存在
    await mkdir(UPLOAD_DIR, { recursive: true });

    // 生成唯一文件名
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    const fileName = `expert-${timestamp}-${random}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // 写入文件
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // 返回可访问路径
    const publicPath = `/images/experts/${fileName}`;

    return NextResponse.json({
      success: true,
      path: publicPath,
      fileName,
    });
  } catch (error) {
    console.error('[experts/upload] POST error:', error);
    return NextResponse.json({ error: '图片上传失败' }, { status: 500 });
  }
}
