'use client';

/**
 * 图片压缩工具 — 上传前压缩到目标大小
 * 
 * 用于舌诊拍照、面诊等图片上传场景
 * 压缩到 1MB 以内，保持合理质量
 */

interface CompressOptions {
  /** 最大尺寸（字节），默认 1MB */
  maxSize?: number;
  /** 最大宽度（像素），默认 1920 */
  maxWidth?: number;
  /** 最大高度（像素），默认 1920 */
  maxHeight?: number;
  /** 初始质量 0-1，默认 0.85 */
  quality?: number;
  /** 输出格式，默认 image/jpeg */
  mimeType?: string;
}

interface CompressResult {
  /** 压缩后的 Blob */
  blob: Blob;
  /** 压缩后的 Data URL */
  dataUrl: string;
  /** 压缩后大小（字节） */
  size: number;
  /** 压缩前大小（字节） */
  originalSize: number;
  /** 压缩率 */
  ratio: number;
}

/**
 * 压缩图片文件
 * 
 * 用法：
 * const result = await compressImage(file, { maxSize: 1024 * 1024 });
 * // result.dataUrl 可直接用于预览
 * // result.blob 可用于上传
 */
export async function compressImage(
  file: File | Blob,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const {
    maxSize = 1024 * 1024, // 1MB
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    mimeType = 'image/jpeg',
  } = options;

  const originalSize = file.size;

  // 读取为 Image
  const img = await loadImage(file);

  // 计算缩放比例
  let { width, height } = img;
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }

  // 创建 Canvas 绘制
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // 白色背景（防止透明区域变黑）
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  // 逐步降低质量直到满足大小限制
  let currentQuality = quality;
  let blob: Blob;

  do {
    const dataUrl = canvas.toDataURL(mimeType, currentQuality);
    blob = await dataUrlToBlob(dataUrl);
    if (blob.size <= maxSize || currentQuality <= 0.1) break;
    currentQuality -= 0.1;
  } while (blob.size > maxSize);

  const finalDataUrl = canvas.toDataURL(mimeType, currentQuality);
  const finalBlob = await dataUrlToBlob(finalDataUrl);

  return {
    blob: finalBlob,
    dataUrl: finalDataUrl,
    size: finalBlob.size,
    originalSize,
    ratio: Math.round((1 - finalBlob.size / originalSize) * 100),
  };
}

function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const resp = await fetch(dataUrl);
  return resp.blob();
}

/**
 * 简易版：只检查文件大小，超限时压缩
 */
export async function ensureUnderSize(
  file: File | Blob,
  maxSize: number = 1024 * 1024,
  options?: CompressOptions
): Promise<{ blob: Blob; dataUrl: string; size: number; compressed: boolean }> {
  if (file.size <= maxSize) {
    // 不需要压缩
    const dataUrl = await blobToDataUrl(file);
    return { blob: file, dataUrl, size: file.size, compressed: false };
  }

  const result = await compressImage(file, { maxSize, ...options });
  return {
    blob: result.blob,
    dataUrl: result.dataUrl,
    size: result.size,
    compressed: true,
  };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
