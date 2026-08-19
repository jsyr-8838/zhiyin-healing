// 穴位助手音乐适配器 - 将XWS音乐数据转为healing-music-catalog兼容格式
import { XWS_MUSIC_LIST, type XwsMusicItem } from './xws-data';
import { XWS_VALID_FILES } from './xws-valid-files';

// 五行英文 → 五音Key映射
const ELEMENT_TO_TONE: Record<string, 'jiao' | 'zhi' | 'gong' | 'shang' | 'yu'> = {
  wood: 'jiao',
  fire: 'zhi',
  earth: 'gong',
  metal: 'shang',
  water: 'yu',
};

const TONE_COLORS: Record<string, string> = {
  jiao: '#5d8a63',
  zhi: '#c26158',
  gong: '#c9a94f',
  shang: '#5ba09a',
  yu: '#3d7a75',
};

export interface XwsAdaptedTrack {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  element: 'jiao' | 'zhi' | 'gong' | 'shang' | 'yu';
  color: string;
  duration: number;
  credit: string;
  source: 'xws';
  author: string;
}

// 将时长字符串 "04:30" 转为秒数
function parseDuration(d: string): number {
  if (!d || !d.includes(':')) return 300;
  const parts = d.split(':');
  const min = parseInt(parts[0], 10) || 0;
  const sec = parseInt(parts[1], 10) || 0;
  return min * 60 + sec;
}

// 预处理：将XWS音乐转为适配格式（只保留文件存在的记录）
const XWS_ADAPTED_TRACKS: XwsAdaptedTrack[] = XWS_MUSIC_LIST
  .filter((item: XwsMusicItem) => {
    // 从src路径中提取文件名，如 "/audio/xws-music/清净甘露.mp3" → "清净甘露.mp3"
    const filename = item.src.split('/').pop() || '';
    return XWS_VALID_FILES.has(filename);
  })
  .map((item: XwsMusicItem) => {
    const tone = ELEMENT_TO_TONE[item.element];
    return {
      id: `xws-${item.id}`,
      title: item.name,
      subtitle: `${item.toneName} · ${item.author}`,
      src: item.src,
      element: tone,
      color: TONE_COLORS[tone] || '#8b7355',
      duration: parseDuration(item.duration),
      credit: '穴位助手',
      source: 'xws' as const,
      author: item.author,
    };
  });

// 按五音key筛选XWS曲目
export function getXwsTracksForTone(toneKey: string): XwsAdaptedTrack[] {
  return XWS_ADAPTED_TRACKS.filter(t => t.element === toneKey);
}

// 获取所有XWS适配曲目
export function getAllXwsTracks(): XwsAdaptedTrack[] {
  return XWS_ADAPTED_TRACKS;
}

// 五行分布统计
export function getXwsStats(): Record<string, number> {
  const stats: Record<string, number> = { jiao: 0, zhi: 0, gong: 0, shang: 0, yu: 0 };
  XWS_ADAPTED_TRACKS.forEach(t => { stats[t.element] = (stats[t.element] || 0) + 1; });
  return stats;
}
