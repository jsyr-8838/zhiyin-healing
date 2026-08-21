export type LiuzijueItem = {
  id: 'xu' | 'he' | 'hu' | 'si' | 'chui' | 'xi';
  char: string;
  pinyin: string;
  organ: string;
  element: string;
  wuyin: string;
  color: string;
  desc: string;
  chant: string;
  freq: number;
};

export const LIUZIJUE: readonly LiuzijueItem[] = [
  { id: 'xu',   char: '嘘', pinyin: 'xū',   organ: '肝',   element: '木', wuyin: '角', color: '#4ADE80', desc: '疏肝理气，解郁明目',   chant: '嘘——', freq: 261.63 },
  { id: 'he',   char: '呵', pinyin: 'hē',   organ: '心',   element: '火', wuyin: '徵', color: '#FB7185', desc: '清心火，安心神',       chant: '呵——', freq: 293.66 },
  { id: 'hu',   char: '呼', pinyin: 'hū',   organ: '脾',   element: '土', wuyin: '宫', color: '#FBBF24', desc: '健脾和胃，消食导滞',   chant: '呼——', freq: 329.63 },
  { id: 'si',   char: '呬', pinyin: 'sī',   organ: '肺',   element: '金', wuyin: '商', color: '#60A5FA', desc: '清肺热，润肺燥',       chant: '呬——', freq: 392.00 },
  { id: 'chui', char: '吹', pinyin: 'chuī', organ: '肾',   element: '水', wuyin: '羽', color: '#818CF8', desc: '固肾益精，强腰壮骨',   chant: '吹——', freq: 440.00 },
  { id: 'xi',   char: '嘻', pinyin: 'xī',   organ: '三焦', element: '少阳', wuyin: '调和', color: '#C084FC', desc: '通调三焦，利水消肿', chant: '嘻——', freq: 523.25 },
] as const;

export type BreathMode = 'liuzijue' | 'box' | 'relax478' | 'energize446' | 'reset333';

export type BreathModeConfig = {
  id: BreathMode;
  name: string;
  desc: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  icon: string;
  color: string;
};

export const BREATH_MODES: BreathModeConfig[] = [
  { id: 'liuzijue',   name: '六字诀',     desc: '嘘呵呼呬吹嘻 · 中医导引',  inhale: 4, hold1: 2, exhale: 6, hold2: 1, icon: '气', color: '#4ADE80' },
  { id: 'box',        name: '四序安澜',   desc: '4-4-4-4 · 专注安神',       inhale: 4, hold1: 4, exhale: 4, hold2: 4, icon: '方', color: '#60A5FA' },
  { id: 'relax478',   name: '安寝引息',   desc: '4-7-8 · 深度入眠',         inhale: 4, hold1: 7, exhale: 8, hold2: 1, icon: '月', color: '#818CF8' },
  { id: 'energize446', name: '清神醒息',  desc: '4-4-6 · 清醒明神',         inhale: 4, hold1: 4, exhale: 6, hold2: 2, icon: '阳', color: '#FBBF24' },
  { id: 'reset333',   name: '轻序稳息',   desc: '3-3-3 · 平复安和',         inhale: 3, hold1: 3, exhale: 3, hold2: 2, icon: '速', color: '#FB7185' },
];

export const COMPLETION_SCIENCE = {
  vagusNerve: {
    title: '迷走神经激活',
    desc: '缓慢深呼吸刺激迷走神经，将大脑与心脏和消化系统连接，促进副交感神经系统的平静状态。',
    icon: '🧠',
  },
  gasExchange: {
    title: '最佳气体交换',
    desc: '每分钟4-6次的呼吸频率可优化氧气输送与CO₂平衡，减少伴随焦虑的过度换气。',
    icon: '🌬️',
  },
  cortisol: {
    title: '压力荷尔蒙减少',
    desc: '定期练习可降低皮质醇水平，为身体的基线压力反应创造持久改善。',
    icon: '📉',
  },
};

export const COMPLETION_STUDIES = [
  { title: '减少焦虑', metric: '43%', desc: 'COVID-19患者5天深呼吸后DASS-21焦虑评分从14.86降至8.44' },
  { title: '惊恐障碍治疗', metric: '显著', desc: '16项研究综述：慢呼吸可减少惊恐发作频率并使CO₂水平正常化' },
  { title: '广泛性焦虑改善', metric: '68%', desc: '3个月每日呼吸练习使BAI焦虑评分从40.90降至13.24' },
];

export const WHEN_TO_PRACTICE = [
  '感到不知所措或压力大时',
  '重要对话或决定之前',
  '焦虑或恐慌发作期间',
  '压力事件后重置神经系统',
];

export const WHAT_YOU_NOTICE = [
  '第一分钟内立即产生镇静效果',
  '思维更清晰，决策能力提高',
  '心率减慢，肌肉紧张减少',
  '定期练习可提高抗压能力',
];

export const BEST_TIPS = [
  { title: '姿势', desc: '坐直或站直，确保肺部完全扩张，肩膀放松不要弯腰驼背。' },
  { title: '环境', desc: '找安静的地方不被打扰，舒适的温度有助于集中注意力。' },
  { title: '坚持', desc: '先练习同一种技巧一周再更换，建立熟悉感可提高效果。' },
];

export const RECOMMENDED_PRACTICES = [
  { name: '5-4-3-2-1 正念接地法', desc: '运用五种感官的正念技巧，帮助从焦虑思绪中回到当下', color: '#818CF8', emoji: '🔄' },
  { name: '六字诀呼吸法', desc: '嘘呵呼呬吹嘻，中医导引五脏调养呼吸法', color: '#4ADE80', emoji: '气' },
  { name: '颂钵音疗', desc: '聆听颂钵共振频率，深层放松身心', color: '#C084FC', emoji: '🔔' },
  { name: '五音疗愈', desc: '角徵宫商羽五行音乐调和脏腑', color: '#FBBF24', emoji: '🎵' },
];
