/**
 * COS URL 工具函数
 *
 * 将本地 public/ 路径映射为腾讯云 COS 远程 URL。
 * 本地开发时返回原始路径；生产环境（设置了 NEXT_PUBLIC_COS_BASE_URL）走 COS。
 *
 * coscli 上传导致了路径嵌套，例如 /audio/xxx → COS 的 audio/audio/xxx，
 * 此函数自动处理嵌套映射。
 */

const COS_BASE = process.env.NEXT_PUBLIC_COS_BASE_URL || '';

/**
 * 需要嵌套映射的路径前缀。
 * key = 本地路径前缀（不含前导 /），value = COS 上的嵌套路径前缀。
 */
const NESTED_PREFIX_MAP: Record<string, string> = {
  'audio':                     'audio/audio',
  'textures':                  'textures/textures',
  'models':                    'models/models',
  'classics':                  'classics/classics',
  'wellness-texts':            'wellness-texts/wellness-texts',
  'tuina':                     'tuina/tuina',
  'images/meridians':          'images/meridians/meridians',
  'assets/acupoint/images':    'assets/acupoint/images/images',
  'assets/acupoint/videos':    'assets/acupoint/videos/videos',
  'videos/acupoints':          'videos/acupoints/acupoints',
};

/** 按前缀长度降序排列，确保更长的前缀优先匹配 */
const SORTED_PREFIXES = Object.keys(NESTED_PREFIX_MAP).sort((a, b) => b.length - a.length);

/**
 * 将本地 public 路径转换为 COS URL
 *
 * @param localPath 本地路径，如 '/audio/five-tone/jiao.mp3'
 * @returns 生产环境返回 COS URL，开发环境返回原路径
 */
export function cosUrl(localPath: string): string {
  if (!COS_BASE) return localPath;

  // 去除前导 /
  const withoutSlash = localPath.startsWith('/') ? localPath.slice(1) : localPath;

  // 查找匹配的嵌套前缀
  for (const prefix of SORTED_PREFIXES) {
    if (withoutSlash.startsWith(prefix + '/')) {
      const remainder = withoutSlash.slice(prefix.length);
      return `${COS_BASE}/${NESTED_PREFIX_MAP[prefix]}${remainder}`;
    }
    if (withoutSlash === prefix) {
      return `${COS_BASE}/${NESTED_PREFIX_MAP[prefix]}`;
    }
  }

  // 未匹配的路径直接拼接
  return `${COS_BASE}/${withoutSlash}`;
}

/**
 * 仅替换音频路径的快捷函数
 */
export function audioUrl(path: string): string {
  return cosUrl(path.startsWith('/') ? path : `/${path}`);
}
