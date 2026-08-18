/**
 * Media URL 工具函数
 *
 * 将本地 public/ 路径映射为远程媒体 URL。
 * 本地开发时返回原始路径；生产环境（设置了 NEXT_PUBLIC_COS_BASE_URL）走媒体代理。
 *
 * 媒体文件存储在 Backblaze B2 私有桶中，通过 Next.js API Route
 * /api/media/[...path] 生成 S3 预签名 URL 并 302 重定向。
 * B2 文件保持原始目录结构，无路径嵌套。
 */

const MEDIA_BASE = process.env.NEXT_PUBLIC_COS_BASE_URL || '';

/**
 * 将本地 public 路径转换为媒体 URL
 *
 * @param localPath 本地路径，如 '/audio/five-tone/jiao.mp3'
 * @returns 生产环境返回代理 URL，开发环境返回原路径
 */
export function cosUrl(localPath: string): string {
  if (!MEDIA_BASE) return localPath;

  // 去除前导 /
  const withoutSlash = localPath.startsWith('/') ? localPath.slice(1) : localPath;

  // 直接拼接，无嵌套映射
  return `${MEDIA_BASE}/${withoutSlash}`;
}

/**
 * 仅替换音频路径的快捷函数
 */
export function audioUrl(path: string): string {
  return cosUrl(path.startsWith('/') ? path : `/${path}`);
}
