/**
 * 知音之境 (ZhiYin ZhiJing) — 沉浸式口语疗愈解说
 *
 * 移植自 FlowHaven (心流之境)，更名「知音之境」。
 * 四境合一：深海 / 雨夜 / 钟声 / 宇宙
 * 每境配男士大师级自然解说，极强的精神疗愈导向。
 *
 * 解说文案由提示词工程师方法论设计：
 *  - 第二人称"你"建立亲密感
 *  - 感官浸入（听/触/嗅）匹配环境意象
 *  - 11 秒呼吸周期节奏同步
 *  - 哲学重构（冥想传统智慧）
 *  - "……"标记静默留白，让声音有呼吸的空间
 *  - 为男声低沉温暖音色量身定制的措辞
 */

export type FlowModeId =
  | 'deepsea' | 'rain' | 'temple' | 'universe'
  | 'mountain' | 'campfire' | 'snow' | 'moon' | 'mist';

export interface FlowSegment {
  /** 解说文本片段 */
  text: string;
  /** 该片段后建议的静默时长（毫秒），0 表示连贯朗读 */
  pause?: number;
}

export interface FlowMode {
  id: FlowModeId;
  /** 中文名 */
  name: string;
  /** 副标题 */
  subtitle: string;
  /** 一句话意象 */
  tagline: string;
  /** emoji 图标 */
  icon: string;
  /** 主题色（用于光球 / 粒子 / 渐变）*/
  theme: {
    orbGlow: string;
    orbInner: string;
    accent: string;
    particleA: string;
    particleB: string;
  };
  /** FlowHaven Web Audio 滤波器配置（环境音合成） */
  sound: {
    filterType: BiquadFilterType;
    frequency: number;
    q: number;
  };
  /** 解说分段（供进度同步与字幕显示） */
  narration: FlowSegment[];
  /** TTS 语音配置 */
  voice: {
    /** Edge TTS 男声，YunjianNeural 浑厚温润，最契合大师级解说 */
    id: string;
    rate: string;
    pitch: string;
    volume: string;
  };
}

/* ================================================================
 *  四境解说文案
 * ================================================================ */

const DEEPSEA_NARRATION: FlowSegment[] = [
  { text: '现在，请闭上眼睛。', pause: 1500 },
  { text: '跟随我的声音，缓缓下沉。', pause: 2000 },
  { text: '想象你正潜入一片深蓝的海，水面在头顶渐渐合上，所有的喧嚣，都被隔在了上面。', pause: 3000 },
  { text: '海水托着你的身体。你不需要用力，不需要挣扎，只需要放手。', pause: 3500 },
  {
    text: '每下沉一米，就有一份重量从肩上离开。那些白天的担忧、紧绷的肩膀、咬紧的牙关，都融化在这蓝色的安静里。',
    pause: 4000,
  },
  { text: '这里很深，很静。静到你能听见自己的心跳——那是你活着的证明，是你身体最古老的节奏。', pause: 4000 },
  { text: '不要去想明天，不要去回忆昨天。此刻，你只是一滴回归大海的水，完整，而安宁。', pause: 4000 },
  { text: '让我在这里，再沉一会儿。', pause: 6000 },
  { text: '当你准备好，带着这份安宁，慢慢，回到水面。', pause: 2000 },
];

const RAIN_NARRATION: FlowSegment[] = [
  { text: '听，雨落下来了。', pause: 2500 },
  { text: '落在屋檐上，落在窗外的叶子上，落在很远的地方，也落在，离你很近的地方。', pause: 3500 },
  { text: '你不需要做任何事。就坐在这里，让雨声包裹着你，像一床旧棉被，温柔而踏实。', pause: 4000 },
  {
    text: '每一滴雨落下来，就带走一点你心里的杂音。那些没说完的话、那些放不下的事，都教给这场雨吧。它会替你，把它们冲走。',
    pause: 4000,
  },
  {
    text: '还记得小时候的雨夜吗？那时你什么也不担心，只觉得安全。那份安全感，一直都在你的身体里，从未离开。',
    pause: 4000,
  },
  { text: '深吸一口气，闻到雨后泥土的味道了吗？这是大地在呼吸，你也和它一起，慢下来。', pause: 4000 },
  { text: '就让雨一直下着。你在这里，是安全的，是被照顾的。', pause: 5000 },
  { text: '这间屋子，这场雨，此刻，刚好够用。', pause: 2000 },
];

const TEMPLE_NARRATION: FlowSegment[] = [
  { text: '现在，听这一声钟。', pause: 4000 },
  { text: '让它穿过你的头顶，穿过你的脊背，穿过你一直紧绷的胸口。', pause: 3500 },
  {
    text: '钟声在走，在消散。你不必去追它，也不必抓住它。它来了，又走了，就像你心里每一个起落的念头。',
    pause: 4000,
  },
  {
    text: '古代的僧人，每天清晨敲响这口钟，不是为了让谁听见，是为了让那浑浊了一夜的心，重新变得澄澈。',
    pause: 4000,
  },
  { text: '你也是。那一下一下的余音，正在帮你，把搅动的心水，慢慢沉淀下来。', pause: 4000 },
  { text: '水静了，才能照见月亮。心静了，才能看见自己真正想要什么。', pause: 4500 },
  { text: '不用急。就让钟声的余韵，在身体里，多停留一会儿。', pause: 5000 },
  { text: '清澈的，不止是钟声，还有此刻，安静下来的你。', pause: 2000 },
];

const UNIVERSE_NARRATION: FlowSegment[] = [
  { text: '现在，把目光投向头顶的夜空。', pause: 2500 },
  {
    text: '那里有无数颗星。有的已经熄灭了千万年，可它们的光，此刻才刚刚抵达你的眼睛。',
    pause: 4000,
  },
  { text: '在想象里，缓缓飘起来。离开地面，离开城市，离开那个小小的、具体的自己。', pause: 4000 },
  {
    text: '在星星之间，没有上下，没有迟早，没有"应该"，也没有"不该"。只有无尽的宁静，和你。',
    pause: 4000,
  },
  {
    text: '从这远处望回去，那些让你焦灼的事情，变得多么小。不是它们不重要，是你终于看到，它们周围，还环绕着多大的世界。',
    pause: 4000,
  },
  {
    text: '我们不过是尘埃做的，却能用尘埃，仰望整片星空。这本身就是，一件值得流泪的好事。',
    pause: 4500,
  },
  { text: '允许自己，在这片辽阔里，渺小一会儿。', pause: 4000 },
  {
    text: '渺小，不是卑微。渺小，是终于松了那口气，不再硬撑着，要成为很大的什么。',
    pause: 4000,
  },
  { text: '就这样漂浮着，被星星照着，什么也不必成为。', pause: 5000 },
  { text: '这就够了。', pause: 2000 },
];

/* ----------------------------------------------------------------
 *  五境扩展：山林 / 篝火 / 雪夜 / 月夜 / 晨雾
 * ---------------------------------------------------------------- */

const MOUNTAIN_NARRATION: FlowSegment[] = [
  { text: '想象，你正站在一座山林的入口。', pause: 3000 },
  { text: '空气是凉的，带着松针和泥土混在一起的气息，每一次呼吸，都像在饮一杯清茶。', pause: 4000 },
  { text: '脚下是落叶，踩上去，沙沙地响。那是山林在回应你，告诉你，它已经等了你很久。', pause: 4000 },
  { text: '抬头，阳光穿过层叠的枝叶，洒下来，像被打碎的金子，落在你肩上，落在你身上每一处紧绷的地方。', pause: 4500 },
  { text: '这里的树，几百岁了。它们什么没见过？风，雷，干旱，山火。可它们依然站在这里，安静地、一根一根地，长出新的年轮。', pause: 4500 },
  { text: '你也像一棵树。在风雨里弯过腰，却没有折断。此刻，把根扎进泥土，让大地托住你。', pause: 4000 },
  { text: '听听风穿过林梢的声音。那是山林在呼吸，节奏很慢，很稳。你跟着它，慢下来，稳下来。', pause: 4500 },
  { text: '在这片林子里，你不需要证明什么。你本就是山林的一部分，被允许，只是站着，只是呼吸。', pause: 4000 },
  { text: '就让这一刻，像古树一样，稳稳地，立在你心里。', pause: 2500 },
];

const CAMPFIRE_NARRATION: FlowSegment[] = [
  { text: '夜深了。面前，是一堆篝火。', pause: 3000 },
  { text: '火苗跳动着，橙红色的光，映在你脸上，像一双温暖的手，轻轻捧住你的脸颊。', pause: 4000 },
  { text: '听，木柴在火里发出噼啪的声响。那不是破碎的声音，是木材把存了一辈子的阳光，一点一点地还回夜的怀里。', pause: 4500 },
  { text: '火光照亮的范围，很小。可这小小的光圈里，是安全的。外面再黑，再冷，也进不来。', pause: 4500 },
  { text: '人类最早的祖先，就是围在这样的火堆旁。他们害怕过、饥饿过、被野兽追逐过。但只要火还在，他们就还在。', pause: 4500 },
  { text: '你也一样。你熬过的那么多黑夜，都是心里的这团火，把你带到了今天。', pause: 4000 },
  { text: '现在，把白天那些冰冷的、扎人的事情，一件一件，扔进火里。看它们烧成灰，扬起来，变成火星，飞向星空。', pause: 5000 },
  { text: '你只需要坐在这里，被火光照着，被这份古老的暖意，包裹着。', pause: 4000 },
  { text: '火还燃着。你也还燃着。这就够了。', pause: 2500 },
];

const SNOW_NARRATION: FlowSegment[] = [
  { text: '看，下雪了。', pause: 3000 },
  { text: '雪花一片一片，慢悠悠地落下，像天地之间，有人在轻轻地撕着白色的纸。', pause: 4000 },
  { text: '雪落下来，是没有声音的。可你仔细听，那种无声，本身也是一种声音——它在说：嘘，世界，先静一静。', pause: 5000 },
  { text: '所有的颜色都被白色盖住了。所有的路，都被抹平了。此刻，你不需要急着去哪里，因为哪里，都还没被踩出来。', pause: 5000 },
  { text: '雪是冷的，可雪带来的，却是一种温柔的安静。它让喧嚣的世界，集体地、温柔地，停了下来。', pause: 4500 },
  { text: '把心里那些纷乱的念头，也想象成雪花。让它们一片一片，慢慢地，落下来，铺平，不再翻飞。', pause: 5000 },
  { text: '站在雪地里，呼出的气，变成白色的雾。那是你的温度，在和这个安静的世界，温柔地交换。', pause: 4500 },
  { text: '你不需要融化什么，也不需要被什么融化。就让自己，像这片雪一样，安静地，存在着。', pause: 4500 },
  { text: '世界静了，你也静了。', pause: 2500 },
];

const MOON_NARRATION: FlowSegment[] = [
  { text: '夜深了，月亮升起来了。', pause: 3000 },
  { text: '今晚的月，是清亮的那一种。光从很高的地方洒下来，落在屋顶，落在树梢，落在你一直没敢细看的心上。', pause: 5000 },
  { text: '月光和阳光不同。阳光要你看清楚，月光只让你看见——看见就够了，不必追问，不必判断。', pause: 5000 },
  { text: '古人说，月亮是一面镜子。它不发光，它只是把太阳的光，温柔地接住，再温柔地，还回去。', pause: 5000 },
  { text: '你也像月亮。你一直在接纳，接纳别人的期待，接纳生活给你的所有，然后在某个深夜，独自消化。', pause: 5000 },
  { text: '可是今晚，允许月亮，照一照你。它不评判你白天的疲惫，不指责你偶尔的怯懦。它只是照着，像一种古老的、沉默的善意。', pause: 5500 },
  { text: '你心里的潮湿，月光是晒不干的。但它能让那些潮湿，泛起一层银色的光，让你看见，原来悲伤，也可以是美的。', pause: 5500 },
  { text: '就让月光，在你身体里，多停留一会儿。', pause: 4500 },
  { text: '今夜，你不孤单。月亮，在替你，看着你自己。', pause: 2500 },
];

const MIST_NARRATION: FlowSegment[] = [
  { text: '清晨，雾还没散。', pause: 3000 },
  { text: '世界被一层薄薄的白纱盖着，一切轮廓都变得柔软，一切边界，都变得模糊。', pause: 4500 },
  { text: '在雾里，你看不清远处。可这也好——看不清，就不必去看，不必去规划，不必去焦虑明天。', pause: 5000 },
  { text: '雾让你只能看见眼前这一步。那就把这一步，走稳。', pause: 4000 },
  { text: '呼吸，雾是湿润的，吸进去，像在给干涸的肺腑，下了一场无声的细雨。', pause: 4500 },
  { text: '你不需要冲破雾。雾自己会散。你只需要在雾里，慢一点，再慢一点，相信前方，一定有路。', pause: 5000 },
  { text: '那些你看不清的事，就让它先藏一藏。等阳光出来，等雾散了，该清楚的，自然会清楚。', pause: 5000 },
  { text: '此刻，只和这片雾，在一起。它柔，你也柔。它慢，你也慢。', pause: 4000 },
  { text: '雾散的时候，你会看见，你还是你，只是更柔软了一些。', pause: 2500 },
];

/* ================================================================
 *  四境定义
 * ================================================================ */

export const FLOW_MODES: FlowMode[] = [
  {
    id: 'deepsea',
    name: '深海',
    subtitle: '深蓝下沉 · 重负消融',
    tagline: '潜入深蓝，让一切重量在安静中融化',
    icon: '🌊',
    theme: {
      orbGlow: '#3d7a75',
      orbInner: '#5ba09a',
      accent: '#7fc7c0',
      particleA: 'rgba(127, 199, 192, 0.9)',
      particleB: 'rgba(61, 122, 117, 0.8)',
    },
    sound: { filterType: 'lowpass', frequency: 200, q: 1 },
    narration: DEEPSEA_NARRATION,
    voice: { id: 'zh-CN-YunjianNeural', rate: '-8%', pitch: '-3Hz', volume: '+0%' },
  },
  {
    id: 'rain',
    name: '雨夜',
    subtitle: '雨声洗心 · 瓦下安身',
    tagline: '坐听一场雨，把杂音都交给它冲走',
    icon: '🌧️',
    theme: {
      orbGlow: '#5d8a63',
      orbInner: '#7fac84',
      accent: '#a8d4af',
      particleA: 'rgba(168, 212, 175, 0.9)',
      particleB: 'rgba(93, 138, 99, 0.8)',
    },
    sound: { filterType: 'highpass', frequency: 1000, q: 0.5 },
    narration: RAIN_NARRATION,
    voice: { id: 'zh-CN-YunjianNeural', rate: '-10%', pitch: '-4Hz', volume: '+0%' },
  },
  {
    id: 'temple',
    name: '钟声',
    subtitle: '一声古钟 · 穿透云雾',
    tagline: '让古钟的余韵，把搅动的心水沉淀',
    icon: '🔔',
    theme: {
      orbGlow: '#c9a94f',
      orbInner: '#e0c878',
      accent: '#f0d898',
      particleA: 'rgba(240, 216, 152, 0.9)',
      particleB: 'rgba(201, 169, 79, 0.8)',
    },
    sound: { filterType: 'bandpass', frequency: 500, q: 2 },
    narration: TEMPLE_NARRATION,
    voice: { id: 'zh-CN-YunjianNeural', rate: '-12%', pitch: '-1Hz', volume: '+0%' },
  },
  {
    id: 'universe',
    name: '宇宙',
    subtitle: '浮于星海 · 渺小即自由',
    tagline: '在星海里渺小一会儿，松开那口硬撑的气',
    icon: '✨',
    theme: {
      orbGlow: '#6b5b95',
      orbInner: '#9b8cc4',
      accent: '#c4b8e0',
      particleA: 'rgba(196, 184, 224, 0.9)',
      particleB: 'rgba(107, 91, 149, 0.8)',
    },
    sound: { filterType: 'lowpass', frequency: 150, q: 0.5 },
    narration: UNIVERSE_NARRATION,
    voice: { id: 'zh-CN-YunjianNeural', rate: '-10%', pitch: '-2Hz', volume: '+0%' },
  },
  {
    id: 'mountain',
    name: '山林',
    subtitle: '古木深根 · 稳如山岳',
    tagline: '把根扎进泥土，让大地托住你',
    icon: '🌲',
    theme: {
      orbGlow: '#4a6b3a',
      orbInner: '#7a9a65',
      accent: '#a8c890',
      particleA: 'rgba(168, 200, 144, 0.9)',
      particleB: 'rgba(74, 107, 58, 0.8)',
    },
    sound: { filterType: 'bandpass', frequency: 800, q: 0.7 },
    narration: MOUNTAIN_NARRATION,
    voice: { id: 'zh-CN-YunjianNeural', rate: '-9%', pitch: '-2Hz', volume: '+0%' },
  },
  {
    id: 'campfire',
    name: '篝火',
    subtitle: '夜火围坐 · 暖意千年',
    tagline: '心里那团火，把你带到了今天',
    icon: '🔥',
    theme: {
      orbGlow: '#c26158',
      orbInner: '#e08858',
      accent: '#f5b070',
      particleA: 'rgba(245, 176, 112, 0.9)',
      particleB: 'rgba(194, 97, 88, 0.8)',
    },
    sound: { filterType: 'lowpass', frequency: 600, q: 1.2 },
    narration: CAMPFIRE_NARRATION,
    voice: { id: 'zh-CN-YunjianNeural', rate: '-8%', pitch: '-1Hz', volume: '+0%' },
  },
  {
    id: 'snow',
    name: '雪夜',
    subtitle: '万籁俱寂 · 雪落无声',
    tagline: '让纷乱的念头像雪花一样慢慢铺平',
    icon: '❄️',
    theme: {
      orbGlow: '#9bb5d4',
      orbInner: '#c8d8ec',
      accent: '#e8f0fa',
      particleA: 'rgba(232, 240, 250, 0.9)',
      particleB: 'rgba(155, 181, 212, 0.8)',
    },
    sound: { filterType: 'highpass', frequency: 1800, q: 0.4 },
    narration: SNOW_NARRATION,
    voice: { id: 'zh-CN-YunjianNeural', rate: '-12%', pitch: '-4Hz', volume: '+0%' },
  },
  {
    id: 'moon',
    name: '月夜',
    subtitle: '银辉入怀 · 古镜照心',
    tagline: '月光像古老的善意，沉默地照着你',
    icon: '🌙',
    theme: {
      orbGlow: '#8a9bb8',
      orbInner: '#b8c8dc',
      accent: '#dae4f0',
      particleA: 'rgba(218, 228, 240, 0.9)',
      particleB: 'rgba(138, 155, 184, 0.8)',
    },
    sound: { filterType: 'lowpass', frequency: 400, q: 0.8 },
    narration: MOON_NARRATION,
    voice: { id: 'zh-CN-YunjianNeural', rate: '-11%', pitch: '-3Hz', volume: '+0%' },
  },
  {
    id: 'mist',
    name: '晨雾',
    subtitle: '薄雾濛濛 · 柔软前行',
    tagline: '看不清远处时，就把眼前这一步走稳',
    icon: '🌫️',
    theme: {
      orbGlow: '#a8b0a8',
      orbInner: '#cdd5cd',
      accent: '#e8ece4',
      particleA: 'rgba(232, 236, 228, 0.9)',
      particleB: 'rgba(168, 176, 168, 0.8)',
    },
    sound: { filterType: 'lowpass', frequency: 300, q: 0.6 },
    narration: MIST_NARRATION,
    voice: { id: 'zh-CN-YunjianNeural', rate: '-10%', pitch: '-2Hz', volume: '+0%' },
  },
];

/** 按 id 快速取境 */
export const FLOW_MODE_MAP: Record<FlowModeId, FlowMode> = FLOW_MODES.reduce(
  (acc, m) => {
    acc[m.id] = m;
    return acc;
  },
  {} as Record<FlowModeId, FlowMode>
);

/** 拼接某境的完整解说文本（供 TTS 合成） */
export function getFullNarrationText(mode: FlowMode): string {
  return mode.narration.map((s) => s.text).join('\n');
}

/* ================================================================
 *  字幕时间轴
 * ----------------------------------------------------------------
 *  由于解说 MP3 是按 narration 分段 + pause 静默生成的整体录音，
 *  没有嵌入精确时间戳。这里基于"朗读时长 + 静默时长"估算每段的
 *  时间窗口，归一化到音频实际播放时长，使字幕在循环播放时能
 *  按比例跟随音频进度。
 *
 *  - 字数 → 朗读时长（秒）：len / READING_CHARS_PER_SEC
 *    （Edge TTS 男声 rate -8%~-12% 约 4 字/秒，疗愈语速更慢）
 *  - pause 毫秒 → 静默时长（秒）：pause / 1000
 *  - 每段权重 = 朗读 + 静默，按比例映射到 duration
 * ================================================================ */

const READING_CHARS_PER_SEC = 3.6;

export interface NarrationSegmentWindow {
  text: string;
  /** 相对起点 0~1 */
  startRatio: number;
  /** 相对终点 0~1 */
  endRatio: number;
}

/** 计算某境字幕时间轴（相对比例，与 audio.duration 相乘即得到秒） */
export function getNarrationTimeline(mode: FlowMode): NarrationSegmentWindow[] {
  const weights = mode.narration.map((s) => {
    const readSec = Math.max(0.6, s.text.length / READING_CHARS_PER_SEC);
    const pauseSec = (s.pause ?? 0) / 1000;
    return readSec + pauseSec;
  });
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  return mode.narration.map((s, i) => {
    const startRatio = acc / total;
    acc += weights[i];
    const endRatio = acc / total;
    return { text: s.text, startRatio, endRatio };
  });
}

/** 在时间轴中按比例定位当前应显示的字幕段（找不到返回 null） */
export function findActiveSegment(
  timeline: NarrationSegmentWindow[],
  progressRatio: number
): NarrationSegmentWindow | null {
  if (!timeline.length) return null;
  // 循环播放时 progressRatio 始终在 [0,1)，单次播放完毕为 1
  const r = Math.min(0.9999, Math.max(0, progressRatio));
  for (const seg of timeline) {
    if (r >= seg.startRatio && r < seg.endRatio) return seg;
  }
  return timeline[timeline.length - 1];
}

/* ================================================================
 *  心率 → 境推荐映射
 * ----------------------------------------------------------------
 *  基于 StressMusic 的 BPM→五行映射，将其扩展到九境：
 *
 *  BPM 区间   | 状态        | 五行 | 推荐境     | 意图
 *  -----------|-------------|------|-----------|----------------------
 *  ≥100       | 高压焦虑    | 水   | 深海       | 镇静下沉，重负消融
 *  90-99      | 轻度紧张    | 土/水| 雨夜       | 雨声洗心，瓦下安身
 *  80-89      | 略有紧绷    | 金   | 钟声       | 古钟穿透，沉淀心水
 *  70-79      | 接近正常    | 阴   | 月夜/雪夜  | 银辉照心，万籁俱寂
 *  60-69      | 身心平稳    | 土   | 晨雾       | 柔软前行，不焦虑远处
 *  50-59      | 能量偏低    | 火   | 篝火       | 古老暖意，激活心阳
 *  <50        | 需要激活    | 木   | 山林       | 古木深根，木行生发
 *
 *  宇宙境作为"通用解压"选项，在 BPM≥80 时也可作为备选推荐。
 * ================================================================ */

export interface BPMRecommendation {
  /** 推荐的境 id */
  modeId: FlowModeId;
  /** 推荐理由 */
  reason: string;
  /** BPM 区间中文标签 */
  zoneLabel: string;
  /** 建议的呼吸节奏（秒） */
  breath: { inhale: number; hold: number; exhale: number; label: string };
}

/** 根据 BPM 推荐境（心率联动核心函数） */
export function recommendModeByBPM(bpm: number): BPMRecommendation {
  if (bpm >= 100) {
    return {
      modeId: 'deepsea',
      reason: '心率偏高，推荐深海境，让重量在深蓝中融化',
      zoneLabel: '高压焦虑',
      breath: { inhale: 4, hold: 7, exhale: 8, label: '4-7-8 深度镇定' },
    };
  }
  if (bpm >= 90) {
    return {
      modeId: 'rain',
      reason: '心率略高，推荐雨夜境，让雨声冲走杂音',
      zoneLabel: '轻度紧张',
      breath: { inhale: 4, hold: 6, exhale: 7, label: '4-6-7 缓和呼吸' },
    };
  }
  if (bpm >= 80) {
    return {
      modeId: 'temple',
      reason: '心率稍有紧绷，推荐钟声境，让古钟沉淀心水',
      zoneLabel: '略有紧绷',
      breath: { inhale: 3.5, hold: 5, exhale: 6, label: '3.5-5-6 平稳呼吸' },
    };
  }
  if (bpm >= 70) {
    return {
      modeId: 'moon',
      reason: '心率接近正常，推荐月夜境，让银辉温柔地照着你',
      zoneLabel: '接近正常',
      breath: { inhale: 3, hold: 4, exhale: 5, label: '3-4-5 舒缓呼吸' },
    };
  }
  if (bpm >= 60) {
    return {
      modeId: 'mist',
      reason: '心率平稳，推荐晨雾境，柔软地走在当下这一步',
      zoneLabel: '身心平稳',
      breath: { inhale: 3, hold: 3.5, exhale: 4.5, label: '3-3.5-4.5 温和呼吸' },
    };
  }
  if (bpm >= 50) {
    return {
      modeId: 'campfire',
      reason: '心率偏低，推荐篝火境，用古老的暖意激活心阳',
      zoneLabel: '能量偏低',
      breath: { inhale: 2.5, hold: 3, exhale: 4, label: '2.5-3-4 暖阳呼吸' },
    };
  }
  return {
    modeId: 'mountain',
    reason: '心率过低，推荐山林境，像古木一样把根扎进泥土',
    zoneLabel: '需要激活',
    breath: { inhale: 2.5, hold: 3, exhale: 4, label: '2.5-3-4 生发呼吸' },
  };
}

/** 根据 BPM 返回所有适配的境（按优先级排序），供 UI 显示多个备选 */
export function getAllRecommendedModes(bpm: number): FlowModeId[] {
  const primary = recommendModeByBPM(bpm).modeId;
  // 宇宙境作为通用解压备选
  const secondary: FlowModeId = bpm >= 80 ? 'universe' : 'snow';
  // 去重
  const result = [primary];
  if (secondary !== primary) result.push(secondary);
  return result;
}
