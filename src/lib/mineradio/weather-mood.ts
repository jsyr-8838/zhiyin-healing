/**
 * 天籁 — 天气 Mood 映射引擎 v2
 * 核心理念：以情胜情，五行相克反差互补
 * 高温→水行清凉，阴雨→火行奔放，秋燥→水行润泽，雷暴→木行舒展
 */

import {
  type HealingTheme,
  COOL_WATER,
  WARM_FIRE,
  MOIST_WATER,
  GROW_WOOD,
  DAWN_GLOW,
  GOLDEN_EARTH,
  FRESH_WOOD,
  BRIGHT_METAL,
  PIERCE_METAL,
  COZY_EARTH,
  MEDITATE_WATER,
  DEFAULT_THEME,
} from '../data/weather-themes';

export type { HealingTheme } from '../data/weather-themes';
export { DEFAULT_THEME } from '../data/weather-themes';

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  weatherLabel: string;
  isDay: boolean;
  windSpeed: number;
  humidity: number;
  city: string;
}

export interface WeatherMood {
  key: string;
  title: string;
  tagline: string;
  energy: number;
  warmth: number;
  focus: number;
  melancholy: number;
  keywords: string[];
  /** 疗愈视觉主题 */
  theme: HealingTheme;
}

export interface WeatherRadioTrack {
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  duration: number;
  mood: string;
  element?: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
}

// WMO 天气码 → 中文标签
const WMO_CODES: Record<number, string> = {
  0: '晴', 1: '大部晴', 2: '多云', 3: '阴',
  45: '雾', 48: '冻雾',
  51: '细毛雨', 53: '毛毛雨', 55: '密毛雨',
  56: '冻毛雨', 57: '密冻毛雨',
  61: '小雨', 63: '中雨', 65: '大雨',
  66: '冻雨', 67: '大冻雨',
  71: '小雪', 73: '中雪', 75: '大雪',
  77: '雪粒', 80: '阵雨', 81: '中阵雨', 82: '大阵雨',
  85: '阵雪', 86: '大阵雪',
  95: '雷暴', 96: '雷暴+冰雹', 99: '强雷暴+冰雹',
};

export function getWeatherLabel(code: number): string {
  return WMO_CODES[code] || '未知';
}

function isRain(code: number): boolean {
  return [51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code);
}
function isSnow(code: number): boolean {
  return [71,73,75,77,85,86].includes(code);
}
function isStorm(code: number): boolean {
  return [95,96,99].includes(code);
}

function getTimeOfDay(hour: number): 'dawn' | 'morning' | 'afternoon' | 'dusk' | 'night' {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 20) return 'dusk';
  return 'night';
}

/** 根据天气数据生成 Mood（含疗愈视觉主题） */
export function buildWeatherMood(weather: WeatherData): WeatherMood {
  const hour = new Date().getHours();
  const timeOfDay = getTimeOfDay(hour);
  const isWarm = weather.temperature > 28;
  const isHot = weather.temperature > 35;

  // ─── 雷暴 → 木行舒展（以木疏土，化郁为生） ───
  if (isStorm(weather.weatherCode)) {
    return {
      key: 'storm', title: '雷雨生机', tagline: '电闪雷鸣后便是生长',
      energy: 0.75, warmth: 0.3, focus: 0.35, melancholy: 0.2,
      keywords: ['生机', '力量', '生长', '力量'],
      theme: GROW_WOOD,
    };
  }

  // ─── 雪天 → 土行守护（暖意包围，壁炉般温暖） ───
  if (isSnow(weather.weatherCode)) {
    return {
      key: 'snow', title: '暖雪围炉', tagline: '窗外的雪，室内的火',
      energy: 0.3, warmth: 0.85, focus: 0.7, melancholy: 0.1,
      keywords: ['温暖', '守护', '钢琴', '弦乐'],
      theme: COZY_EARTH,
    };
  }

  // ─── 雨天 → 火行奔放（以火暖水，打破阴郁） ───
  if (isRain(weather.weatherCode)) {
    if (timeOfDay === 'night') {
      return {
        key: 'rain-night', title: '雨夜暖歌', tagline: '让热情点燃雨的沉静',
        energy: 0.55, warmth: 0.75, focus: 0.4, melancholy: 0.15,
        keywords: ['热情', '燃烧', 'R&B', '灵魂'],
        theme: WARM_FIRE,
      };
    }
    return {
      key: 'rain', title: '雨中焰火', tagline: '阴雨越深，内心越燃',
      energy: 0.65, warmth: 0.7, focus: 0.3, melancholy: 0.1,
      keywords: ['奔放', '活力', '轻摇滚', '流行'],
      theme: WARM_FIRE,
    };
  }

  // ─── 雾天 → 金行穿透（以明破暗，光穿雾层） ───
  if ([45, 48].includes(weather.weatherCode)) {
    return {
      key: 'fog', title: '破雾之光', tagline: '迷茫中总有方向',
      energy: 0.4, warmth: 0.45, focus: 0.6, melancholy: 0.15,
      keywords: ['穿透', '清明', '电子', '冥想'],
      theme: PIERCE_METAL,
    };
  }

  // ─── 晴天 ───
  if (weather.weatherCode <= 2) {
    // 高温酷暑 → 水行清凉（以水克火）
    if (isHot || (isWarm && timeOfDay === 'afternoon')) {
      return {
        key: 'hot-day', title: '清凉一夏', tagline: '酷暑中寻觅一片清凉',
        energy: 0.45, warmth: 0.2, focus: 0.6, melancholy: 0.05,
        keywords: ['清凉', '冰镇', '薄荷', '静心'],
        theme: COOL_WATER,
      };
    }

    if (timeOfDay === 'dawn' || timeOfDay === 'morning') {
      return {
        key: 'sunny-morning', title: '朝霞', tagline: '新的一天在霞光中苏醒',
        energy: 0.65, warmth: 0.8, focus: 0.5, melancholy: 0.05,
        keywords: ['朝霞', '希望', '清新', '活力'],
        theme: DAWN_GLOW,
      };
    }

    if (timeOfDay === 'dusk') {
      return {
        key: 'golden-hour', title: '落日熔金', tagline: '温柔告别，暖光相送',
        energy: 0.4, warmth: 0.85, focus: 0.4, melancholy: 0.15,
        keywords: ['温暖', '怀旧', '浪漫', '原声'],
        theme: GOLDEN_EARTH,
      };
    }

    if (timeOfDay === 'night') {
      if (isWarm) {
        return {
          key: 'warm-night', title: '夏夜清凉', tagline: '夜风带来凉意',
          energy: 0.45, warmth: 0.35, focus: 0.5, melancholy: 0.1,
          keywords: ['清凉', '微风', '虫鸣', '冥想'],
          theme: COOL_WATER,
        };
      }
      return {
        key: 'clear-night', title: '星河冥想', tagline: '寂静宇宙中与自己对话',
        energy: 0.3, warmth: 0.3, focus: 0.75, melancholy: 0.15,
        keywords: ['冥想', '星尘', '后摇', '静心'],
        theme: MEDITATE_WATER,
      };
    }

    // 普通晴天 → 木行清新（微风绿意）
    return {
      key: 'sunny', title: '清风徐来', tagline: '阳光正好，绿意正浓',
      energy: 0.6, warmth: 0.7, focus: 0.45, melancholy: 0.05,
      keywords: ['欢快', '清新', '微风', '木韵'],
      theme: FRESH_WOOD,
    };
  }

  // ─── 阴天 → 金行明快（以明克阴，银白驱暗） ───
  if (weather.weatherCode === 3) {
    // 秋燥 → 水行润泽
    const isAutumnDry = weather.humidity < 40 && weather.temperature > 10 && weather.temperature < 25;
    if (isAutumnDry) {
      return {
        key: 'autumn-dry', title: '润泽秋雨', tagline: '干燥中呼唤一场心灵之雨',
        energy: 0.4, warmth: 0.3, focus: 0.6, melancholy: 0.15,
        keywords: ['润泽', '雨滴', '清凉', '舒缓'],
        theme: MOIST_WATER,
      };
    }
    if (timeOfDay === 'night') {
      return {
        key: 'cloudy-night', title: '拨云见月', tagline: '云层后面总有光芒',
        energy: 0.4, warmth: 0.55, focus: 0.55, melancholy: 0.15,
        keywords: ['明快', '银光', '爵士', '轻柔'],
        theme: BRIGHT_METAL,
      };
    }
    return {
      key: 'cloudy', title: '银光破云', tagline: '阴翳中自有明朗',
      energy: 0.45, warmth: 0.55, focus: 0.5, melancholy: 0.1,
      keywords: ['明快', '独立', '轻快', '慵懒'],
      theme: BRIGHT_METAL,
    };
  }

  // 默认
  return {
    key: 'default', title: '此刻', tagline: '随机应变的疗愈',
    energy: 0.5, warmth: 0.5, focus: 0.5, melancholy: 0.15,
    keywords: ['综合', '流行', '轻音乐', '电子'],
    theme: DEFAULT_THEME,
  };
}

/** Mood → 搜索种子 */
export function moodToSeedQueries(mood: WeatherMood): string[] {
  const seeds: Record<string, string[]> = {
    'storm':         ['epic grow', 'life power', 'green force'],
    'snow':          ['warm piano', 'cozy acoustic', 'fireplace ambient'],
    'rain':          ['fire energy', 'warm passion', 'upbeat soul'],
    'rain-night':    ['warm r&b', 'soul fire', 'cozy jazz'],
    'hot-day':       ['cool water', 'ice ambient', 'fresh mint'],
    'sunny-morning': ['fresh glow', 'dawn light', 'soft rise'],
    'golden-hour':   ['sunset amber', 'warm nostalgia', 'golden acoustic'],
    'sunny':         ['green breeze', 'fresh indie', 'nature calm'],
    'warm-night':    ['cool night', 'breeze ambient', 'insect meditation'],
    'clear-night':   ['star meditation', 'space ambient', 'deep calm'],
    'cloudy-night':  ['silver moon', 'bright jazz', 'light ambient'],
    'cloudy':        ['bright indie', 'silver pop', 'clear folk'],
    'autumn-dry':    ['moist rain', 'water meditation', 'gentle stream'],
    'fog':           ['pierce light', 'clear meditation', 'bright electronic'],
    'default':       ['chill mix', 'popular hits', 'easy listening'],
  };
  return seeds[mood.key] || seeds['default'];
}

/** 获取天气数据 */
export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.weatherCode !== undefined) {
        return {
          temperature: data.temperature,
          weatherCode: data.weatherCode,
          weatherLabel: data.weatherLabel || getWeatherLabel(data.weatherCode),
          isDay: data.isDay,
          windSpeed: data.windSpeed,
          humidity: data.humidity,
          city: data.city || '',
        };
      }
    }
  } catch { /* fallback */ }

  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'temperature_2m,weather_code,is_day,wind_speed_10m,relative_humidity_2m',
    timezone: 'auto',
  });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error('Weather API error');
    const data = await res.json();
    const current = data.current;
    return {
      temperature: current.temperature_2m,
      weatherCode: current.weather_code,
      weatherLabel: getWeatherLabel(current.weather_code),
      isDay: current.is_day === 1,
      windSpeed: current.wind_speed_10m,
      humidity: current.relative_humidity_2m,
      city: '',
    };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/** 通过服务端代理获取位置 */
export async function fetchIPLocation(): Promise<{ lat: number; lon: number; city: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch('/api/weather', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.lat && data.lon) {
        return { lat: data.lat, lon: data.lon, city: data.city || '当前位置' };
      }
    }
  } catch { /* fallback */ }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error('IP location API error');
    const data = await res.json();
    if (!data.latitude || !data.longitude) throw new Error('IP location failed');
    return { lat: data.latitude, lon: data.longitude, city: data.city || '当前位置' };
  } catch {
    return { lat: 39.9, lon: 116.4, city: '北京' };
  }
}

/** 根据Mood生成疗愈播放列表 — 五行曲目按"以情胜情"逻辑匹配 */
export function generateMoodPlaylist(mood: WeatherMood): WeatherRadioTrack[] {
  const cover = '/images/modules/liaoyu.jpg';

  const JIAO = [
    { title: '角音·木行', artist: '天籁', audioUrl: '/audio/five-tone/jiao.mp3', duration: 180, element: 'wood' as const },
    { title: '古琴·浴火重生', artist: '天籁', audioUrl: '/audio/guqin/after-the-fire.mp3', duration: 240, element: 'wood' as const },
    { title: '古筝·山泉清音', artist: '天籁', audioUrl: '/audio/guzheng/mountain-spring.mp3', duration: 300, element: 'wood' as const },
    { title: '箫·竹林清风', artist: '天籁', audioUrl: '/audio/xiao/zen-bamboo-flow.mp3', duration: 260, element: 'wood' as const },
    { title: '箫·竹林低语', artist: '天籁', audioUrl: '/audio/xiao/whispers-bamboo-forest.mp3', duration: 280, element: 'wood' as const },
  ];
  const ZHI = [
    { title: '徵音·火行', artist: '天籁', audioUrl: '/audio/five-tone/zhi.mp3', duration: 180, element: 'fire' as const },
    { title: '古筝·欢爱', artist: '天籁', audioUrl: '/audio/guzheng/happy-love.mp3', duration: 220, element: 'fire' as const },
    { title: '编钟·新春华章', artist: '天籁', audioUrl: '/audio/bianzhong/lunar-new-year.mp3', duration: 300, element: 'fire' as const },
    { title: '箫·竹林幽韵', artist: '天籁', audioUrl: '/audio/xiao/whispering-bamboo-melody.mp3', duration: 260, element: 'fire' as const },
  ];
  const GONG = [
    { title: '宫音·土行', artist: '天籁', audioUrl: '/audio/five-tone/gong.mp3', duration: 180, element: 'earth' as const },
    { title: '编钟·金声玉振', artist: '天籁', audioUrl: '/audio/bianzhong/new-year.mp3', duration: 280, element: 'earth' as const },
    { title: '冥想·静坐归中', artist: '天籁', audioUrl: '/audio/ambient/water/meditation-ambient.mp3', duration: 360, element: 'earth' as const },
    { title: '合奏·月下花影', artist: '天籁', audioUrl: '/audio/ambient/water/moonlit-blossoms.mp3', duration: 320, element: 'earth' as const },
  ];
  const SHANG = [
    { title: '商音·金行', artist: '天籁', audioUrl: '/audio/five-tone/shang.mp3', duration: 180, element: 'metal' as const },
    { title: '箫·桥上清箫', artist: '天籁', audioUrl: '/audio/xiao/bridge-of-avignon.mp3', duration: 260, element: 'metal' as const },
    { title: '二胡·丝柔如水', artist: '天籁', audioUrl: '/audio/erhu/smooth-as-silk.mp3', duration: 240, element: 'metal' as const },
    { title: '编钟·禅寺晨钟', artist: '天籁', audioUrl: '/audio/bianzhong/zen-bamboo-temple.mp3', duration: 280, element: 'metal' as const },
  ];
  const YU = [
    { title: '羽音·水行', artist: '天籁', audioUrl: '/audio/five-tone/yu.mp3', duration: 180, element: 'water' as const },
    { title: '箫·行远不迷', artist: '天籁', audioUrl: '/audio/xiao/never-be-lost.mp3', duration: 260, element: 'water' as const },
    { title: '二胡·溪流奔城', artist: '天籁', audioUrl: '/audio/erhu/stream-to-city.mp3', duration: 240, element: 'water' as const },
    { title: '冥想·静心观水', artist: '天籁', audioUrl: '/audio/ambient/water/meditation-music.mp3', duration: 360, element: 'water' as const },
    { title: '箫·幽谷空灵', artist: '天籁', audioUrl: '/audio/xiao/silent-valley.mp3', duration: 300, element: 'water' as const },
  ];

  // 以情胜情：选曲匹配反差疗愈五行
  const moodPlaylist: Record<string, { title: string; artist: string; audioUrl: string; duration: number }[]> = {
    'storm':         [...JIAO.slice(0, 3), ...GONG.slice(0, 1)],     // 雷暴→木行舒展+土行守信
    'snow':          [...GONG.slice(0, 2), ...ZHI.slice(0, 2)],      // 雪天→土行温暖+火行热力
    'rain':          [...ZHI.slice(0, 3), ...GONG.slice(0, 1)],      // 雨天→火行奔放+土行扶持
    'rain-night':    [...ZHI.slice(0, 2), ...GONG.slice(0, 2)],      // 雨夜→火行温暖+土行守护
    'hot-day':       [...YU.slice(0, 3), ...SHANG.slice(0, 1)],      // 酷暑→水行清凉+金行肃降
    'sunny-morning': [...ZHI.slice(0, 2), ...JIAO.slice(0, 2)],      // 晨光→火行霞光+木行生机
    'golden-hour':   [...GONG.slice(0, 2), ...SHANG.slice(0, 2)],    // 黄昏→土行温暖+金行澄明
    'sunny':         [...JIAO.slice(0, 2), ...ZHI.slice(0, 2)],      // 晴天→木行清新+火行活力
    'warm-night':    [...YU.slice(0, 2), ...SHANG.slice(0, 2)],      // 暑夜→水行清凉+金行静谧
    'clear-night':   [...YU.slice(0, 3), ...SHANG.slice(0, 1)],      // 星夜→水行冥想+金行清澄
    'cloudy-night':  [...SHANG.slice(0, 2), ...ZHI.slice(0, 2)],     // 阴夜→金行明快+火行暖意
    'cloudy':        [...SHANG.slice(0, 2), ...ZHI.slice(0, 2)],     // 阴天→金行明亮+火行热情
    'autumn-dry':    [...YU.slice(0, 3), ...JIAO.slice(0, 1)],       // 秋燥→水行润泽+木行生发
    'fog':           [...SHANG.slice(0, 2), ...JIAO.slice(0, 2)],    // 雾天→金行穿透+木行生长
    'default':       [...JIAO.slice(0, 1), ...ZHI.slice(0, 1), ...GONG.slice(0, 1), ...SHANG.slice(0, 1), ...YU.slice(0, 1)],
  };

  const tracks = moodPlaylist[mood.key] || moodPlaylist['default'];
  return tracks.map((t) => ({
    ...t,
    coverUrl: cover,
    mood: mood.key,
  }));
}
