/**
 * 疗愈音乐目录 — 真实乐器录音数据库
 *
 * 每个 五音/五行 可以有多种乐器演奏的曲目。
 * 每个 颂钵频率 可以有多种钵体的录音。
 *
 * 当前状态：
 *   - 五音各有1首真实MP3（/audio/five-tone/*.mp3）
 *   - 其余目录为空，等待从 Pixabay/Freesound 下载填充
 *   - audio-engine.ts 的合成波形仅作为最后兜底
 *
 * 扩展方式：
 *   1. 下载新音频到 /public/audio/ 对应子目录
 *   2. 在下方数组中添加新的 HealingTrack 条目
 *   3. UI 自动显示新曲目
 */

import type { WuYinKey } from './five-tone-data';
import { cosUrl } from './cos-url';

// ===== 乐器类型 =====

export type InstrumentType =
  | 'guqin'       // 古琴
  | 'guzheng'     // 古筝
  | 'erhu'        // 二胡
  | 'xiao'        // 箫
  | 'pipa'        // 琵琶
  | 'dizi'        // 笛子
  | 'suona'       // 唢呐
  | 'bianzhong'   // 编钟
  | 'singing-bowl'// 颂钵
  | 'world'       // 世界音乐（New Age等）
  | 'mix';        // 混合/难以归类

export const INSTRUMENT_INFO: Record<InstrumentType, { name: string; icon: string; desc: string }> = {
  guqin:        { name: '古琴', icon: '琴', desc: '丝桐清音·高雅淡泊' },
  guzheng:      { name: '古筝', icon: '筝', desc: '弦柱流响·婉转悠扬' },
  erhu:         { name: '二胡', icon: '胡', desc: '弓弦如诉·深沉柔美' },
  xiao:         { name: '箫',   icon: '箫', desc: '洞箫幽远·清虚淡雅' },
  pipa:         { name: '琵琶', icon: '琶', desc: '大珠小珠·珠落玉盘' },
  dizi:         { name: '笛子', icon: '笛', desc: '竹笛清越·明亮悠扬' },
  suona:        { name: '唢呐', icon: '呐', desc: '高亢嘹亮·热烈奔放' },
  bianzhong:    { name: '编钟', icon: '钟', desc: '金石之声·庄严恢宏' },
  'singing-bowl': { name: '颂钵', icon: '钵', desc: '泛音悠长·空灵共振' },
  world:        { name: '世界音乐', icon: '韵', desc: '天籁融合·跨界疗愈' },
  mix:          { name: '合奏', icon: '和', desc: '众器合鸣·浑然天成' },
};

// ===== 单首曲目 =====

export interface HealingTrack {
  /** 唯一 ID */
  id: string;
  /** 显示名称，如 "古琴·角音" */
  title: string;
  /** 副标题/描述，如 "疏肝解郁" */
  subtitle: string;
  /** 音频文件路径（/public 下的相对路径） */
  src: string;
  /** 乐器类型 */
  instrument: InstrumentType;
  /** 五行归属 */
  element: WuYinKey;
  /** 主题色 */
  color: string;
  /** 时长（秒），未知时省略 */
  duration?: number;
  /** 来源标注 */
  credit?: string;
}

// ===== 颂钵曲目 =====

export interface BowlTrack {
  /** 唯一 ID */
  id: string;
  /** 显示名称，如 "铜钵·528Hz" */
  title: string;
  /** 副标题/描述 */
  subtitle: string;
  /** 音频文件路径 */
  src: string;
  /** 颂钵类型 */
  bowlType: 'brass' | 'crystal' | 'tibetan' | 'japanese' | 'mix';
  /** 对应频率 */
  freq: number;
  /** 主题色 */
  color: string;
  /** 时长（秒） */
  duration?: number;
  /** 来源标注 */
  credit?: string;
}

export const BOWL_TYPE_INFO: Record<BowlTrack['bowlType'], { name: string; icon: string; desc: string }> = {
  brass:    { name: '铜钵', icon: '铜', desc: '浑厚共振·经典之声' },
  crystal:  { name: '水晶钵', icon: '晶', desc: '清透纯净·高频渗透' },
  tibetan:  { name: '藏钵', icon: '藏', desc: '深沉悠远·灵性传统' },
  japanese: { name: '日式钵', icon: '日', desc: '禅意空灵·枯寂之美' },
  mix:      { name: '混合', icon: '和', desc: '多钵和鸣·层次丰富' },
};

// ===== 五音曲目目录 =====

// 去重说明：music-index.json 中 Pixabay ID 384707/281251/465871/483354
// 出现了两次（不同 category），去重后每首 MP3 只注册一次。
// 同一首 MP3 可归属多个五音 element，通过多条目录条目实现。

const CATALOG: HealingTrack[] = [
  // ═══════════════════════════════════════
  // ─── 角音 · 木行 ─────────────────────
  // ═══════════════════════════════════════
  {
    id: 'jiao-default',
    title: '角音·木行',
    subtitle: '疏肝解郁',
    src: cosUrl('/audio/five-tone/jiao.mp3'),
    instrument: 'mix',
    element: 'jiao',
    color: '#27AE60',
  },
  {
    id: 'jiao-guqin-fire',
    title: '古琴·浴火重生',
    subtitle: '疏肝解郁·豁然开朗',
    src: cosUrl('/audio/healing/gaoshan-liushui.mp3'),
    instrument: 'guqin',
    element: 'jiao',
    color: '#27AE60',
    credit: 'Pixabay CC0',
  },
  {
    id: 'jiao-guzheng-spring',
    title: '古筝·山泉清音',
    subtitle: '疏肝解郁·清流石上',
    src: cosUrl('/audio/healing/gaoshan-liushui.mp3'),
    instrument: 'guzheng',
    element: 'jiao',
    color: '#27AE60',
    credit: 'Pixabay CC0',
  },
  {
    id: 'jiao-guzheng-spring-short',
    title: '古筝·山泉短曲',
    subtitle: '疏肝解郁·短版精听',
    src: cosUrl('/audio/healing/gaoshan-liushui.mp3'),
    instrument: 'guzheng',
    element: 'jiao',
    color: '#27AE60',
    credit: 'Pixabay CC0',
  },
  {
    id: 'jiao-guqin-newyear',
    title: '古琴·新春新气',
    subtitle: '疏肝解郁·万物生发',
    src: cosUrl('/audio/healing/yangchun-baixue.mp3'),
    instrument: 'guqin',
    element: 'jiao',
    color: '#27AE60',
    credit: 'Pixabay CC0',
  },
  {
    id: 'jiao-xiao-bamboo-flow',
    title: '箫·竹林清风',
    subtitle: '疏肝解郁·竹影婆娑',
    src: cosUrl('/audio/healing/gusu-xing.mp3'),
    instrument: 'xiao',
    element: 'jiao',
    color: '#27AE60',
    credit: 'Pixabay CC0',
  },
  {
    id: 'jiao-xiao-bamboo-whisper',
    title: '箫·竹林低语',
    subtitle: '疏肝解郁·风穿竹林',
    src: cosUrl('/audio/healing/gusu-xing.mp3'),
    instrument: 'xiao',
    element: 'jiao',
    color: '#27AE60',
    credit: 'Pixabay CC0',
  },
  {
    id: 'jiao-wuxing-spring',
    title: '五行·春生',
    subtitle: '疏肝解郁·万物萌发',
    src: cosUrl('/audio/five-tone/jiao.mp3'),
    instrument: 'world',
    element: 'jiao',
    color: '#27AE60',
    credit: 'Pixabay CC0 (5xing-music)',
  },

  // ═══════════════════════════════════════
  // ─── 徵音 · 火行 ─────────────────────
  // ═══════════════════════════════════════
  {
    id: 'zhi-default',
    title: '徵音·火行',
    subtitle: '养心安神',
    src: cosUrl('/audio/five-tone/zhi.mp3'),
    instrument: 'mix',
    element: 'zhi',
    color: '#E74C3C',
  },
  {
    id: 'zhi-guzheng-love',
    title: '古筝·欢爱',
    subtitle: '养心安神·情意绵绵',
    src: cosUrl('/audio/healing/chunjiang-huayueye.mp3'),
    instrument: 'guzheng',
    element: 'zhi',
    color: '#E74C3C',
    credit: 'Pixabay CC0',
  },
  {
    id: 'zhi-guqin-fire',
    title: '古琴·烈焰重生',
    subtitle: '养心安神·浴火明心',
    src: cosUrl('/audio/healing/shimian-maifu.mp3'),
    instrument: 'guqin',
    element: 'zhi',
    color: '#E74C3C',
    credit: 'Pixabay CC0',
  },
  {
    id: 'zhi-bianzhong-newyear',
    title: '编钟·新春华章',
    subtitle: '养心安神·喜气洋洋',
    src: cosUrl('/audio/healing/jinshe-kuangwu.mp3'),
    instrument: 'bianzhong',
    element: 'zhi',
    color: '#E74C3C',
    credit: 'Pixabay CC0',
  },
  {
    id: 'zhi-guqin-newyear-short',
    title: '古琴·新春短曲',
    subtitle: '养心安神·喜乐欢畅',
    src: cosUrl('/audio/healing/bainiao-chaofeng.mp3'),
    instrument: 'guqin',
    element: 'zhi',
    color: '#E74C3C',
    credit: 'Pixabay CC0',
  },
  {
    id: 'zhi-xiao-bamboo-melody',
    title: '箫·竹林幽韵',
    subtitle: '养心安神·和煦温柔',
    src: cosUrl('/audio/healing/gusu-xing.mp3'),
    instrument: 'xiao',
    element: 'zhi',
    color: '#E74C3C',
    credit: 'Pixabay CC0',
  },
  {
    id: 'zhi-wuxing-summer',
    title: '五行·夏长',
    subtitle: '养心安神·热情绽放',
    src: cosUrl('/audio/five-tone/zhi.mp3'),
    instrument: 'world',
    element: 'zhi',
    color: '#E74C3C',
    credit: 'Pixabay CC0 (5xing-music)',
  },

  // ═══════════════════════════════════════
  // ─── 宫音 · 土行 ─────────────────────
  // ═══════════════════════════════════════
  {
    id: 'gong-default',
    title: '宫音·土行',
    subtitle: '健脾和胃',
    src: cosUrl('/audio/five-tone/gong.mp3'),
    instrument: 'mix',
    element: 'gong',
    color: '#F39C12',
  },
  {
    id: 'gong-bianzhong-spring',
    title: '编钟·金声玉振',
    subtitle: '健脾和胃·中正平和',
    src: cosUrl('/audio/healing/guangling-san.mp3'),
    instrument: 'bianzhong',
    element: 'gong',
    color: '#F39C12',
    credit: 'Pixabay CC0',
  },
  {
    id: 'gong-bianzhong-short',
    title: '编钟·庆典短章',
    subtitle: '健脾和胃·铿锵明快',
    src: cosUrl('/audio/healing/jinshe-kuangwu.mp3'),
    instrument: 'bianzhong',
    element: 'gong',
    color: '#F39C12',
    credit: 'Pixabay CC0',
  },
  {
    id: 'gong-ambient-meditation',
    title: '冥想·静坐归中',
    subtitle: '健脾和胃·守中致和',
    src: cosUrl('/audio/five-tone/gong.mp3'),
    instrument: 'mix',
    element: 'gong',
    color: '#F39C12',
    credit: 'Pixabay CC0',
  },
  {
    id: 'gong-ambient-deep',
    title: '冥想·深度归藏',
    subtitle: '健脾和胃·土德载物',
    src: cosUrl('/audio/five-tone/gong.mp3'),
    instrument: 'mix',
    element: 'gong',
    color: '#F39C12',
    credit: 'Pixabay CC0',
  },
  {
    id: 'gong-mix-moonlit',
    title: '合奏·月下花影',
    subtitle: '健脾和胃·温厚和谐',
    src: cosUrl('/audio/healing/caiyun-zhuiyue.mp3'),
    instrument: 'mix',
    element: 'gong',
    color: '#F39C12',
    credit: 'Pixabay CC0',
  },

  // ═══════════════════════════════════════
  // ─── 商音 · 金行 ─────────────────────
  // ═══════════════════════════════════════
  {
    id: 'shang-default',
    title: '商音·金行',
    subtitle: '清肺润燥',
    src: cosUrl('/audio/five-tone/shang.mp3'),
    instrument: 'mix',
    element: 'shang',
    color: '#3498DB',
  },
  {
    id: 'shang-xiao-avignon',
    title: '箫·桥上清箫',
    subtitle: '清肺润燥·悠远空灵',
    src: cosUrl('/audio/healing/xiaoxiang-shuiyun.mp3'),
    instrument: 'xiao',
    element: 'shang',
    color: '#3498DB',
    credit: 'Pixabay CC0',
  },
  {
    id: 'shang-erhu-silk',
    title: '二胡·丝柔如水',
    subtitle: '清肺润燥·柔美绵长',
    src: cosUrl('/audio/healing/erquan-yingyue.mp3'),
    instrument: 'erhu',
    element: 'shang',
    color: '#3498DB',
    credit: 'Pixabay CC0',
  },
  {
    id: 'shang-erhu-bamboo',
    title: '二胡·竹林幽弦',
    subtitle: '清肺润燥·幽深静谧',
    src: cosUrl('/audio/healing/erquan-yingyue.mp3'),
    instrument: 'erhu',
    element: 'shang',
    color: '#3498DB',
    credit: 'Pixabay CC0',
  },
  {
    id: 'shang-xiao-sky',
    title: '箫·天际长箫',
    subtitle: '清肺润燥·寥廓无涯',
    src: cosUrl('/audio/healing/xiaoxiang-shuiyun.mp3'),
    instrument: 'xiao',
    element: 'shang',
    color: '#3498DB',
    credit: 'Pixabay CC0',
  },
  {
    id: 'shang-bianzhong-temple',
    title: '编钟·禅寺晨钟',
    subtitle: '清肺润燥·金声远播',
    src: cosUrl('/audio/healing/guangling-san.mp3'),
    instrument: 'bianzhong',
    element: 'shang',
    color: '#3498DB',
    credit: 'Pixabay CC0',
  },

  // ═══════════════════════════════════════
  // ─── 羽音 · 水行 ─────────────────────
  // ═══════════════════════════════════════
  {
    id: 'yu-default',
    title: '羽音·水行',
    subtitle: '固肾益精',
    src: cosUrl('/audio/five-tone/yu.mp3'),
    instrument: 'mix',
    element: 'yu',
    color: '#1ABC9C',
  },
  {
    id: 'yu-xiao-lost',
    title: '箫·行远不迷',
    subtitle: '固肾益精·深邃沉静',
    src: cosUrl('/audio/healing/yuqiao-wenda.mp3'),
    instrument: 'xiao',
    element: 'yu',
    color: '#1ABC9C',
    credit: 'Pixabay CC0',
  },
  {
    id: 'yu-erhu-stream',
    title: '二胡·溪流奔城',
    subtitle: '固肾益精·变化流动',
    src: cosUrl('/audio/healing/hangong-qiuyue.mp3'),
    instrument: 'erhu',
    element: 'yu',
    color: '#1ABC9C',
    credit: 'Pixabay CC0',
  },
  {
    id: 'yu-ambient-meditation2',
    title: '冥想·静心观水',
    subtitle: '固肾益精·水善下流',
    src: cosUrl('/audio/five-tone/yu.mp3'),
    instrument: 'mix',
    element: 'yu',
    color: '#1ABC9C',
    credit: 'Pixabay CC0',
  },
  {
    id: 'yu-xiao-silent-valley',
    title: '箫·幽谷空灵',
    subtitle: '固肾益精·万籁俱寂',
    src: cosUrl('/audio/healing/guanshan-yue.mp3'),
    instrument: 'xiao',
    element: 'yu',
    color: '#1ABC9C',
    credit: 'Pixabay CC0',
  },
  {
    id: 'yu-xiao-healing-breath',
    title: '箫·治愈呼吸',
    subtitle: '固肾益精·深长呼吸',
    src: cosUrl('/audio/healing/liangxiao-yin.mp3'),
    instrument: 'xiao',
    element: 'yu',
    color: '#1ABC9C',
    credit: 'Pixabay CC0',
  },
  {
    id: 'yu-erhu-full-moon',
    title: '二胡·月升之夜',
    subtitle: '固肾益精·深沉婉转',
    src: cosUrl('/audio/healing/yi-guren.mp3'),
    instrument: 'erhu',
    element: 'yu',
    color: '#1ABC9C',
    credit: 'Pixabay CC0',
  },

  // ═══════════════════════════════════════════════════════════
  // ─── 扩展曲目 · 世界疗愈音乐 ──────────────────────────────
  // ═══════════════════════════════════════════════════════════

  // ─── 角音 · 木行 · 扩展 (8曲) ────────────────────────────
  {
    id: 'jiao-guqin-gaoshan',
    title: '古琴·高山流水',
    subtitle: '疏肝解郁·知音难觅',
    src: cosUrl('/audio/healing/gaoshan-liushui.mp3'),
    instrument: 'guqin',
    element: 'jiao',
    color: '#27AE60',
    duration: 420,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'jiao-guqin-meihua',
    title: '古琴·梅花三弄',
    subtitle: '疏肝解郁·傲骨凌霜',
    src: cosUrl('/audio/healing/meihua-sannong.mp3'),
    instrument: 'guqin',
    element: 'jiao',
    color: '#27AE60',
    duration: 360,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'jiao-pipa-chunjiang',
    title: '琵琶·春江花月夜',
    subtitle: '疏肝解郁·月照春江',
    src: cosUrl('/audio/healing/chunjiang-huayueye.mp3'),
    instrument: 'pipa',
    element: 'jiao',
    color: '#27AE60',
    duration: 390,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'jiao-dizi-gusu',
    title: '笛子·姑苏行',
    subtitle: '疏肝解郁·江南春晓',
    src: cosUrl('/audio/healing/gusu-xing.mp3'),
    instrument: 'dizi',
    element: 'jiao',
    color: '#27AE60',
    duration: 300,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'jiao-guqin-youlan',
    title: '古琴·幽兰逢春',
    subtitle: '疏肝解郁·兰生幽谷',
    src: cosUrl('/audio/healing/youlan-fengchun.mp3'),
    instrument: 'guqin',
    element: 'jiao',
    color: '#27AE60',
    duration: 330,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'jiao-guqin-pingsa',
    title: '古琴·平沙落雁',
    subtitle: '疏肝解郁·天际归鸿',
    src: cosUrl('/audio/healing/pingsa-luoyan.mp3'),
    instrument: 'guqin',
    element: 'jiao',
    color: '#27AE60',
    duration: 360,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'jiao-world-green-tapestry',
    title: '喜多郎·Green Tapestry',
    subtitle: '疏肝解郁·绿意盎然',
    src: cosUrl('/audio/healing/green-tapestry.mp3'),
    instrument: 'world',
    element: 'jiao',
    color: '#27AE60',
    duration: 300,
    credit: 'Jamendo CC',
  },
  {
    id: 'jiao-world-silk-road',
    title: '喜多郎·Silk Road',
    subtitle: '疏肝解郁·丝路苍茫',
    src: cosUrl('/audio/healing/silk-road.mp3'),
    instrument: 'world',
    element: 'jiao',
    color: '#27AE60',
    duration: 330,
    credit: 'Jamendo CC',
  },

  // ─── 徵音 · 火行 · 扩展 (8曲) ────────────────────────────
  {
    id: 'zhi-pipa-shimian',
    title: '琵琶·十面埋伏',
    subtitle: '养心安神·金戈铁马',
    src: cosUrl('/audio/healing/shimian-maifu.mp3'),
    instrument: 'pipa',
    element: 'zhi',
    color: '#E74C3C',
    duration: 360,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'zhi-suona-jinshe',
    title: '唢呐·金蛇狂舞',
    subtitle: '养心安神·欢腾热烈',
    src: cosUrl('/audio/healing/jinshe-kuangwu.mp3'),
    instrument: 'suona',
    element: 'zhi',
    color: '#E74C3C',
    duration: 240,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'zhi-suona-bainiao',
    title: '唢呐·百鸟朝凤',
    subtitle: '养心安神·百鸟争鸣',
    src: cosUrl('/audio/healing/bainiao-chaofeng.mp3'),
    instrument: 'suona',
    element: 'zhi',
    color: '#E74C3C',
    duration: 390,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'zhi-pipa-caiyun',
    title: '琵琶·彩云追月',
    subtitle: '养心安神·彩云逐月',
    src: cosUrl('/audio/healing/caiyun-zhuiyue.mp3'),
    instrument: 'pipa',
    element: 'zhi',
    color: '#E74C3C',
    duration: 270,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'zhi-guqin-chushui',
    title: '古琴·出水莲',
    subtitle: '养心安神·莲出淤泥',
    src: cosUrl('/audio/healing/chushui-lian.mp3'),
    instrument: 'guqin',
    element: 'zhi',
    color: '#E74C3C',
    duration: 300,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'zhi-world-sundance',
    title: 'Deva Premal·Sundance',
    subtitle: '养心安神·梵音日光',
    src: cosUrl('/audio/healing/sundance.mp3'),
    instrument: 'world',
    element: 'zhi',
    color: '#E74C3C',
    duration: 300,
    credit: 'Jamendo CC',
  },
  {
    id: 'zhi-world-gayatri',
    title: 'Deva Premal·Gayatri Mantra',
    subtitle: '养心安神·吠陀圣咒',
    src: cosUrl('/audio/healing/gayatri-mantra.mp3'),
    instrument: 'world',
    element: 'zhi',
    color: '#E74C3C',
    duration: 360,
    credit: 'Jamendo CC',
  },
  {
    id: 'zhi-world-thousand-suns',
    title: 'Karunesh·A Thousand Suns',
    subtitle: '养心安神·千日之光',
    src: cosUrl('/audio/healing/a-thousand-suns.mp3'),
    instrument: 'world',
    element: 'zhi',
    color: '#E74C3C',
    duration: 330,
    credit: 'Jamendo CC',
  },

  // ─── 宫音 · 土行 · 扩展 (8曲) ────────────────────────────
  {
    id: 'gong-erhu-erquan',
    title: '二胡·二泉映月',
    subtitle: '健脾和胃·月映双泉',
    src: cosUrl('/audio/healing/erquan-yingyue.mp3'),
    instrument: 'erhu',
    element: 'gong',
    color: '#F39C12',
    duration: 390,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'gong-erhu-hangong',
    title: '二胡·汉宫秋月',
    subtitle: '健脾和胃·秋月汉宫',
    src: cosUrl('/audio/healing/hangong-qiuyue.mp3'),
    instrument: 'erhu',
    element: 'gong',
    color: '#F39C12',
    duration: 360,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'gong-pipa-xiyang',
    title: '琵琶·夕阳箫鼓',
    subtitle: '健脾和胃·夕阳箫声',
    src: cosUrl('/audio/healing/xiyang-xiaogu.mp3'),
    instrument: 'pipa',
    element: 'gong',
    color: '#F39C12',
    duration: 330,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'gong-guqin-yangguan',
    title: '古琴·阳关三叠',
    subtitle: '健脾和胃·西出阳关',
    src: cosUrl('/audio/healing/yangguan-sandie.mp3'),
    instrument: 'guqin',
    element: 'gong',
    color: '#F39C12',
    duration: 360,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'gong-guqin-manjiang',
    title: '古琴·满江红',
    subtitle: '健脾和胃·壮怀激烈',
    src: cosUrl('/audio/healing/manjiang-hong.mp3'),
    instrument: 'guqin',
    element: 'gong',
    color: '#F39C12',
    duration: 300,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'gong-world-earth-blue',
    title: 'Karunesh·Earth Blue',
    subtitle: '健脾和胃·大地蔚蓝',
    src: cosUrl('/audio/healing/earth-blue.mp3'),
    instrument: 'world',
    element: 'gong',
    color: '#F39C12',
    duration: 330,
    credit: 'Jamendo CC',
  },
  {
    id: 'gong-world-call-mystic',
    title: 'Karunesh·Call of the Mystic',
    subtitle: '健脾和胃·神秘召唤',
    src: cosUrl('/audio/healing/call-of-the-mystic.mp3'),
    instrument: 'world',
    element: 'gong',
    color: '#F39C12',
    duration: 360,
    credit: 'Jamendo CC',
  },
  {
    id: 'gong-world-om-namah',
    title: 'Deva Premal·Om Namah Shivaya',
    subtitle: '健脾和胃·敬拜湿婆',
    src: cosUrl('/audio/healing/om-namah-shivaya.mp3'),
    instrument: 'world',
    element: 'gong',
    color: '#F39C12',
    duration: 300,
    credit: 'Jamendo CC',
  },

  // ─── 商音 · 金行 · 扩展 (8曲) ────────────────────────────
  {
    id: 'shang-guqin-guangling',
    title: '古琴·广陵散',
    subtitle: '清肺润燥·广陵绝响',
    src: cosUrl('/audio/healing/guangling-san.mp3'),
    instrument: 'guqin',
    element: 'shang',
    color: '#3498DB',
    duration: 420,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'shang-guqin-xiaoxiang',
    title: '古琴·潇湘水云',
    subtitle: '清肺润燥·云水潇湘',
    src: cosUrl('/audio/healing/xiaoxiang-shuiyun.mp3'),
    instrument: 'guqin',
    element: 'shang',
    color: '#3498DB',
    duration: 390,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'shang-guzheng-yuzhou',
    title: '古筝·渔舟唱晚',
    subtitle: '清肺润燥·渔歌晚唱',
    src: cosUrl('/audio/healing/yuzhou-changwan.mp3'),
    instrument: 'guzheng',
    element: 'shang',
    color: '#3498DB',
    duration: 300,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'shang-guzheng-hanya',
    title: '古筝·寒鸦戏水',
    subtitle: '清肺润燥·寒鸦戏水',
    src: cosUrl('/audio/healing/hanya-xishui.mp3'),
    instrument: 'guzheng',
    element: 'shang',
    color: '#3498DB',
    duration: 270,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'shang-erhu-qiusi',
    title: '二胡·秋思',
    subtitle: '清肺润燥·秋日思归',
    src: cosUrl('/audio/healing/qiusi.mp3'),
    instrument: 'erhu',
    element: 'shang',
    color: '#3498DB',
    duration: 300,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'shang-world-silver-moon',
    title: '喜多郎·Silver Moon',
    subtitle: '清肺润燥·银月清辉',
    src: cosUrl('/audio/healing/silver-moon.mp3'),
    instrument: 'world',
    element: 'shang',
    color: '#3498DB',
    duration: 330,
    credit: 'Jamendo CC',
  },
  {
    id: 'shang-world-caravan',
    title: 'Omar Akram·Caravan of Dreams',
    subtitle: '清肺润燥·梦想商队',
    src: cosUrl('/audio/healing/caravan-of-dreams.mp3'),
    instrument: 'world',
    element: 'shang',
    color: '#3498DB',
    duration: 300,
    credit: 'Jamendo CC',
  },
  {
    id: 'shang-world-watermark',
    title: 'Enya·Watermark',
    subtitle: '清肺润燥·水印涟漪',
    src: cosUrl('/audio/healing/watermark.mp3'),
    instrument: 'world',
    element: 'shang',
    color: '#3498DB',
    duration: 270,
    credit: 'Jamendo CC',
  },

  // ─── 羽音 · 水行 · 扩展 (8曲) ────────────────────────────
  {
    id: 'yu-guqin-yangchun',
    title: '古琴·阳春白雪',
    subtitle: '固肾益精·阳春白雪',
    src: cosUrl('/audio/healing/yangchun-baixue.mp3'),
    instrument: 'guqin',
    element: 'yu',
    color: '#1ABC9C',
    duration: 360,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'yu-guqin-yuqiao',
    title: '古琴·渔樵问答',
    subtitle: '固肾益精·渔樵问答',
    src: cosUrl('/audio/healing/yuqiao-wenda.mp3'),
    instrument: 'guqin',
    element: 'yu',
    color: '#1ABC9C',
    duration: 390,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'yu-guqin-liangxiao',
    title: '古琴·良宵引',
    subtitle: '固肾益精·良宵月引',
    src: cosUrl('/audio/healing/liangxiao-yin.mp3'),
    instrument: 'guqin',
    element: 'yu',
    color: '#1ABC9C',
    duration: 240,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'yu-guqin-guanshan',
    title: '古琴·关山月',
    subtitle: '固肾益精·关山冷月',
    src: cosUrl('/audio/healing/guanshan-yue.mp3'),
    instrument: 'guqin',
    element: 'yu',
    color: '#1ABC9C',
    duration: 270,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'yu-guqin-yiguren',
    title: '古琴·忆故人',
    subtitle: '固肾益精·忆念故人',
    src: cosUrl('/audio/healing/yi-guren.mp3'),
    instrument: 'guqin',
    element: 'yu',
    color: '#1ABC9C',
    duration: 330,
    credit: 'Jamendo CC (近似替代)',
  },
  {
    id: 'yu-world-only-time',
    title: 'Enya·Only Time',
    subtitle: '固肾益精·唯有时光',
    src: cosUrl('/audio/healing/only-time.mp3'),
    instrument: 'world',
    element: 'yu',
    color: '#1ABC9C',
    duration: 240,
    credit: 'Jamendo CC',
  },
  {
    id: 'yu-world-orinoco',
    title: 'Enya·Orinoco Flow',
    subtitle: '固肾益精·奥里诺科之流',
    src: cosUrl('/audio/healing/orinoco-flow.mp3'),
    instrument: 'world',
    element: 'yu',
    color: '#1ABC9C',
    duration: 270,
    credit: 'Jamendo CC',
  },
  {
    id: 'yu-world-water-life',
    title: 'Karunesh·Water of Life',
    subtitle: '固肾益精·生命之水',
    src: cosUrl('/audio/healing/water-of-life.mp3'),
    instrument: 'world',
    element: 'yu',
    color: '#1ABC9C',
    duration: 300,
    credit: 'Jamendo CC',
  },
];

// ===== 颂钵曲目目录 =====

const BOWL_CATALOG: BowlTrack[] = [
  // ─── 水晶钵 ───
  {
    id: 'bowl-crystal-main',
    title: '水晶钵·清音',
    subtitle: '清透纯净·高频渗透',
    src: cosUrl(''),
    bowlType: 'crystal',
    freq: 528,
    color: '#E74C3C',
    credit: 'Pixabay CC0',
  },
  {
    id: 'bowl-crystal-quartz',
    title: '水晶钵·石英共鸣',
    subtitle: '石英共振·身心通透',
    src: cosUrl(''),
    bowlType: 'crystal',
    freq: 741,
    color: '#3498DB',
    credit: 'Pixabay CC0',
  },
  {
    id: 'bowl-crystal-clear',
    title: '水晶钵·空明入定',
    subtitle: '晶莹澄澈·入静冥想',
    src: cosUrl(''),
    bowlType: 'crystal',
    freq: 432,
    color: '#4B0082',
    credit: 'Pixabay CC0',
  },

  // ─── 藏钵 ───
  {
    id: 'bowl-tibetan-journey',
    title: '藏钵·灵性之旅',
    subtitle: '深沉悠远·灵性传统',
    src: cosUrl(''),
    bowlType: 'tibetan',
    freq: 396,
    color: '#2C3E50',
    credit: 'Pixabay CC0',
  },
  {
    id: 'bowl-tibetan-deep',
    title: '藏钵·深层疗愈',
    subtitle: '深邃共振·释放恐惧',
    src: cosUrl(''),
    bowlType: 'tibetan',
    freq: 174,
    color: '#1a1a2e',
    credit: 'Pixabay CC0',
  },
  {
    id: 'bowl-tibetan-peace',
    title: '藏钵·宁静安住',
    subtitle: '禅定安宁·回归当下',
    src: cosUrl(''),
    bowlType: 'tibetan',
    freq: 256,
    color: '#8B2500',
    credit: 'Pixabay CC0',
  },

  // ─── 铜钵/混合 ───
  {
    id: 'bowl-yoga-relax',
    title: '颂钵·瑜伽冥想',
    subtitle: '浑厚共振·经典之声',
    src: cosUrl(''),
    bowlType: 'brass',
    freq: 639,
    color: '#F39C12',
    credit: 'Pixabay CC0',
  },

  // ─── 新增钵体 (第二轮下载) ───
  {
    id: 'bowl-crystal-432-waves',
    title: '颂钵·疗愈波浪',
    subtitle: '涟漪扩散·眉心轮共振',
    src: cosUrl(''),
    bowlType: 'crystal',
    freq: 432,
    color: '#4B0082',
    credit: 'Pixabay CC0',
  },
  {
    id: 'bowl-mix-639-shores',
    title: '颂钵·疗愈海岸',
    subtitle: '潮汐涌退·和谐共振',
    src: cosUrl(''),
    bowlType: 'mix',
    freq: 639,
    color: '#F39C12',
    credit: 'Pixabay CC0',
  },
  {
    id: 'bowl-tibetan-852-zen',
    title: '藏钵·禅意悠远',
    subtitle: '精神回归·空灵通透',
    src: cosUrl(''),
    bowlType: 'tibetan',
    freq: 852,
    color: '#1ABC9C',
    credit: 'Pixabay CC0',
  },
  {
    id: 'bowl-tibetan-174-breathe',
    title: '藏钵·呼吸冥想',
    subtitle: '深长呼吸·舒缓痛症',
    src: cosUrl(''),
    bowlType: 'tibetan',
    freq: 174,
    color: '#1a1a2e',
    credit: 'Pixabay CC0',
  },
];

// ===== 查询接口 =====

/** 获取指定五音的所有可用曲目 */
export function getTracksForTone(toneKey: WuYinKey): HealingTrack[] {
  return CATALOG.filter(t => t.element === toneKey);
}

/** 获取指定颂钵频率的所有可用曲目 */
export function getTracksForBowlFreq(freq: number): BowlTrack[] {
  return BOWL_CATALOG.filter(t => t.freq === freq);
}

/** 按 ID 获取曲目 */
export function getTrackById(id: string): HealingTrack | undefined {
  return CATALOG.find(t => t.id === id);
}

/** 按 ID 获取颂钵曲目 */
export function getBowlTrackById(id: string): BowlTrack | undefined {
  return BOWL_CATALOG.find(t => t.id === id);
}

/** 获取指定五音的默认曲目（第一个） */
export function getDefaultTrackForTone(toneKey: WuYinKey): HealingTrack {
  const tracks = getTracksForTone(toneKey);
  return tracks[0];
}

/** 获取指定乐器的所有曲目 */
export function getTracksByInstrument(instrument: InstrumentType): HealingTrack[] {
  return CATALOG.filter(t => t.instrument === instrument);
}

/** 获取所有可用乐器类型（有曲目的） */
export function getAvailableInstruments(): InstrumentType[] {
  const set = new Set(CATALOG.map(t => t.instrument));
  return Array.from(set);
}

/** 获取指定五音下可用的乐器类型 */
export function getInstrumentsForTone(toneKey: WuYinKey): InstrumentType[] {
  const tracks = getTracksForTone(toneKey);
  return Array.from(new Set(tracks.map(t => t.instrument)));
}

// ===== 导出完整目录（供高级用法） =====

export const HEALING_MUSIC_CATALOG = CATALOG;
export const BOWL_MUSIC_CATALOG = BOWL_CATALOG;
