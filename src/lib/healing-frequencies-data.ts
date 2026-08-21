/**
 * 疗愈频率扩展数据源
 *
 * 来源: healing-frequencies (MIT, by Olivier Guilieri)
 * https://github.com/evoluteur/healing-frequencies
 *
 * 与现有 BOWL_FREQUENCIES (five-tone-data.ts) 去重：
 * - Solfeggio 174/396/417/528/639/741/852/963 已存在于 BOWL_FREQUENCIES → 不重复
 * - 新增类别: Solfeggio 扩展(285/1152/2172)、Healing、Organs、Minerals、Ohm、
 *   Cosmic Octave、Angels、Tesla 3-6-9、Schumann、DNA
 *
 * 集成方式：
 * - 颂钵页面: 新增"扩展频率"区域，按类别展示可选频率
 * - 脉轮页面: 新增脉轮补充频率（带波长 l 字段）+ Cosmic Octave
 */

// ===== 类型定义 =====

export type FreqCategory =
  | 'solfeggio'      // 索尔菲吉欧
  | 'solfeggio-ext'  // 索尔菲吉欧扩展
  | 'healing'        // 基础疗愈频率
  | 'organs'         // 器官共振
  | 'minerals'       // 矿物频率
  | 'ohm'            // 唵音
  | 'cosmic'         // 宇宙八度
  | 'angels'         // 天使频率
  | 'tesla'          // 特斯拉 3-6-9
  | 'schumann'       // 舒曼共振
  | 'dna';           // DNA 修复

export interface HealingFrequency {
  /** 频率 Hz */
  f: number;
  /** 波长 cm (仅部分有) */
  l?: number;
  /** 名称 */
  name: string;
  /** 类别 */
  category: FreqCategory;
  /** 中文名 */
  cn: string;
  /** 简述 */
  desc: string;
}

export const CATEGORY_INFO: Record<FreqCategory, { name: string; cn: string; desc: string; color: string; icon: string }> = {
  solfeggio:     { name: 'Solfeggio',         cn: '索尔菲吉欧',   desc: '古代六音阶·灵性修复',         color: '#9B59B6', icon: '索' },
  'solfeggio-ext': { name: 'Solfeggio Ext',   cn: '索尔菲吉欧扩展', desc: '高频扩展·意识扬升',         color: '#8E44AD', icon: '扩' },
  healing:       { name: 'Healing',           cn: '基础疗愈',     desc: '2的幂次·身体修复',           color: '#27AE60', icon: '愈' },
  organs:        { name: 'Organs',            cn: '器官共振',     desc: '器官对应频率·生理调节',       color: '#E74C3C', icon: '脏' },
  minerals:      { name: 'Minerals',          cn: '矿物频率',     desc: '矿物振动·微量元素调节',       color: '#F39C12', icon: '矿' },
  ohm:           { name: 'Ohm',               cn: '唵音',         desc: '宇宙基音·地球共振',           color: '#3498DB', icon: '唵' },
  cosmic:        { name: 'Cosmic Octave',      cn: '宇宙八度',     desc: '行星频率·宇宙和声',           color: '#1ABC9C', icon: '宙' },
  angels:        { name: 'Angels',             cn: '天使频率',     desc: '重复数字·灵性连接',           color: '#E67E22', icon: '天' },
  tesla:         { name: 'Tesla 3-6-9',       cn: '特斯拉369',   desc: '宇宙密钥·能量放大',           color: '#C0392B', icon: '特' },
  schumann:      { name: 'Schumann',           cn: '舒曼共振',     desc: '地球电磁共振·接地',           color: '#2C3E50', icon: '舒' },
  dna:           { name: 'DNA',                cn: 'DNA修复',     desc: 'DNA修复频率·基因活化',        color: '#16A085', icon: '基' },
};

// ===== 频率数据（去重后） =====

export const HEALING_FREQUENCIES: HealingFrequency[] = [
  // -- Solfeggio 扩展（已有 174/396/417/528/639/741/852/963 在 BOWL_FREQUENCIES，仅加新值） --
  { f: 285,   name: 'Solfeggio: 285', category: 'solfeggio-ext', cn: '能量场修复',   desc: '修复能量场·恢复量子完整性' },
  { f: 1152,  name: 'Solfeggio: 1152', category: 'solfeggio-ext', cn: '高维觉醒',     desc: '超越时空·高维意识连接' },
  { f: 2172,  name: 'Solfeggio: 2172', category: 'solfeggio-ext', cn: '神圣秩序',     desc: '宇宙神圣秩序·灵性进化' },

  // -- Healing（基础疗愈，2的幂次） --
  { f: 128,   name: 'Healing: 128',  category: 'healing', cn: '低频疗愈',     desc: '深度修复·细胞再生基频' },
  { f: 256,   name: 'Healing: 256',  category: 'healing', cn: 'C音疗愈',      desc: '中央C· grounding·海底轮' },
  { f: 512,   name: 'Healing: 512',  category: 'healing', cn: '高频疗愈',     desc: '高八度C·身心净化' },
  { f: 1024,  name: 'Healing: 1024', category: 'healing', cn: '超高频疗愈',   desc: '极高八度·灵性净化' },

  // -- Organs（器官共振） --
  { f: 110,   name: 'Organs: 110',   category: 'organs', cn: '胸腺·心脏',     desc: '胸腺·心脏·免疫系统调节' },
  { f: 117.3, name: 'Organs: 117.3', category: 'organs', cn: '胃·脾',        desc: '胃·脾·消化系统调节' },
  { f: 164.3, name: 'Organs: 164.3', category: 'organs', cn: '肺',           desc: '肺·呼吸系统共振' },
  { f: 176,   name: 'Organs: 176',   category: 'organs', cn: '结肠',         desc: '结肠·排泄系统调节' },
  { f: 220,   name: 'Organs: 220',   category: 'organs', cn: '肝',           desc: '肝脏·解毒代谢共振' },
  { f: 281,   name: 'Organs: 281',   category: 'organs', cn: '膀胱·肾脏',     desc: '膀胱·肾脏·泌尿系统' },
  { f: 295.8, name: 'Organs: 295.8', category: 'organs', cn: '胆囊',         desc: '胆囊·胆汁代谢调节' },
  { f: 315.8, name: 'Organs: 315.8', category: 'organs', cn: '皮肤',         desc: '皮肤·体表能量场' },
  { f: 317.83,name: 'Organs: 317.83',category: 'organs', cn: '神经系统',     desc: '中枢神经·自主神经平衡' },
  { f: 319.88,name: 'Organs: 319.88',category: 'organs', cn: '肌肉系统',     desc: '骨骼肌·平滑肌张力调节' },
  { f: 321.9, name: 'Organs: 321.9', category: 'organs', cn: '细胞代谢',     desc: '细胞新陈代谢·ATP合成' },
  { f: 324,   name: 'Organs: 324',   category: 'organs', cn: '血液',         desc: '血液循环·血氧代谢' },
  { f: 352,   name: 'Organs: 352',   category: 'organs', cn: '肾上腺',       desc: '肾上腺·应激激素调节' },
  { f: 418.3, name: 'Organs: 418.3', category: 'organs', cn: '小肠',         desc: '小肠·营养吸收' },
  { f: 492.8, name: 'Organs: 492.8', category: 'organs', cn: '甲状腺',       desc: '甲状腺·代谢率调节' },

  // -- Minerals（矿物频率） --
  { f: 272,   name: 'Minerals: 272',  category: 'minerals', cn: '钙',         desc: '钙·骨骼牙齿·神经传导' },
  { f: 304,   name: 'Minerals: 304',  category: 'minerals', cn: '钾',         desc: '钾·心脏·肌肉收缩' },
  { f: 312,   name: 'Minerals: 312',  category: 'minerals', cn: '铁',         desc: '铁·血红蛋白·携氧' },
  { f: 316,   name: 'Minerals: 316',  category: 'minerals', cn: '镁',         desc: '镁·300+酶反应·放松' },
  { f: 320,   name: 'Minerals: 320',  category: 'minerals', cn: '锌',         desc: '锌·免疫·伤口愈合' },
  { f: 336,   name: 'Minerals: 336',  category: 'minerals', cn: '硒',         desc: '硒·抗氧化·甲状腺' },
  { f: 341,   name: 'Minerals: 341',  category: 'minerals', cn: '铜',         desc: '铜·铁代谢·黑色素' },
  { f: 376,   name: 'Minerals: 376',  category: 'minerals', cn: '碘',         desc: '碘·甲状腺激素' },
  { f: 384,   name: 'Minerals: 384',  category: 'minerals', cn: '锰',         desc: '锰·骨骼·结缔组织' },
  { f: 400,   name: 'Minerals: 400',  category: 'minerals', cn: '铬',         desc: '铬·血糖代谢' },
  { f: 416,   name: 'Minerals: 416',  category: 'minerals', cn: '钼',         desc: '钼·酶辅因子·解毒' },
  { f: 424,   name: 'Minerals: 424',  category: 'minerals', cn: '磷',         desc: '磷·骨骼·能量代谢' },
  { f: 448,   name: 'Minerals: 448',  category: 'minerals', cn: '硫',         desc: '硫·蛋白质·排毒' },
  { f: 464,   name: 'Minerals: 464',  category: 'minerals', cn: '钠',         desc: '钠·体液平衡·神经' },
  { f: 480,   name: 'Minerals: 480',  category: 'minerals', cn: '硅',         desc: '硅·结缔组织·皮肤' },

  // -- Ohm（唵音，宇宙基音） --
  { f: 68.05,  name: 'Ohm: 68.05',  category: 'ohm', cn: '地球唵音',     desc: '地球基音·一年周期·接地' },
  { f: 136.1,  name: 'Ohm: 136.1', category: 'ohm', cn: '心轮唵音',     desc: '心轮·太阳频率·慈悲' },
  { f: 272.2,  name: 'Ohm: 272.2', category: 'ohm', cn: '灵魂星唵音',   desc: '灵魂星·高八度唵音' },
  { f: 544.4,  name: 'Ohm: 544.4', category: 'ohm', cn: '超高频唵音',   desc: '极高八度·灵性升华' },

  // -- Cosmic Octave（宇宙八度，行星频率） --
  { f: 126.22, name: 'Cosmic: 126.22', category: 'cosmic', cn: '太阳·脐轮',    desc: '太阳频率·意志力·生命力' },
  { f: 140.25, name: 'Cosmic: 140.25', category: 'cosmic', cn: '水星',         desc: '水星频率·沟通·智慧' },
  { f: 141.27, name: 'Cosmic: 141.27', category: 'cosmic', cn: '金星·喉轮',    desc: '金星频率·爱·美感' },
  { f: 144.72, name: 'Cosmic: 144.72', category: 'cosmic', cn: '火星',         desc: '火星频率·勇气·行动力' },
  { f: 147.85, name: 'Cosmic: 147.85', category: 'cosmic', cn: '木星',         desc: '木星频率·扩张·智慧' },
  { f: 183.58, name: 'Cosmic: 183.58', category: 'cosmic', cn: '土星',         desc: '土星频率·纪律·结构' },
  { f: 194.18, name: 'Cosmic: 194.18', category: 'cosmic', cn: '天王星·根轮',  desc: '天王星频率·变革·自由' },
  { f: 207.36, name: 'Cosmic: 207.36', category: 'cosmic', cn: '海王星',       desc: '海王星频率·梦境·灵性' },
  { f: 210.42, name: 'Cosmic: 210.42', category: 'cosmic', cn: '冥王星·骶轮',  desc: '冥王星频率·转化·重生' },
  { f: 211.44, name: 'Cosmic: 211.44', category: 'cosmic', cn: '月亮·骶轮',    desc: '月亮频率·情感·直觉' },
  { f: 221.23, name: 'Cosmic: 221.23', category: 'cosmic', cn: '水星·眉心轮',  desc: '水星高频·眉心轮共振' },

  // -- Angels（天使频率） --
  { f: 111,  name: 'Angels: 111',  category: 'angels', cn: '天使111', desc: '门户开启·灵性觉醒' },
  { f: 222,  name: 'Angels: 222',  category: 'angels', cn: '天使222', desc: '信念·信任·新循环' },
  { f: 333,  name: 'Angels: 333',  category: 'angels', cn: '天使333', desc: '扬升大师·圣三位一体' },
  { f: 444,  name: 'Angels: 444',  category: 'angels', cn: '天使444', desc: '天使在侧·保护与引导' },
  { f: 555,  name: 'Angels: 555',  category: 'angels', cn: '天使555', desc: '巨大变化·转型时刻' },
  { f: 666,  name: 'Angels: 666',  category: 'angels', cn: '天使666', desc: '回归灵性·放下物质执着' },
  { f: 777,  name: 'Angels: 777',  category: 'angels', cn: '天使777', desc: '奇迹时刻·神圣指引' },
  { f: 888,  name: 'Angels: 888',  category: 'angels', cn: '天使888', desc: '丰盛流动·财富与繁荣' },
  { f: 999,  name: 'Angels: 999',  category: 'angels', cn: '天使999', desc: '完成与结束·新纪元开启' },
  { f: 4096, name: 'Angels: 4096', category: 'angels', cn: '天使4096', desc: '宇宙最高天使频率' },
  { f: 4160, name: 'Angels: 4160', category: 'angels', cn: '天使4160', desc: '高维灵性门户' },
  { f: 4225, name: 'Angels: 4225', category: 'angels', cn: '天使4225', desc: '神圣圆满·终极和声' },

  // -- Tesla 3-6-9（特斯拉密钥） --
  { f: 333,  name: 'Tesla: 333',  category: 'tesla', cn: '特斯拉3', desc: '宇宙密钥3·创造之力' },
  { f: 639,  name: 'Tesla: 639',  category: 'tesla', cn: '特斯拉6', desc: '宇宙密钥6·和谐·已有于BOWL' },
  { f: 999,  name: 'Tesla: 999',  category: 'tesla', cn: '特斯拉9', desc: '宇宙密钥9·完成与扬升' },

  // -- Schumann（舒曼共振） --
  { f: 7.83, name: 'Schumann: 7.83', category: 'schumann', cn: '舒曼基频',  desc: '地球电磁基频·7.83Hz接地' },
  { f: 32,   name: 'Schumann: 32',   category: 'schumann', cn: '舒曼第二',  desc: '32Hz·冥想·深放松' },
  { f: 64,   name: 'Schumann: 64',   category: 'schumann', cn: '舒曼第三',  desc: '64Hz·能量激活' },
  { f: 128,  name: 'Schumann: 128',  category: 'schumann', cn: '舒曼第四',  desc: '128Hz·深度修复' },

  // -- DNA 修复 --
  { f: 537.8, name: 'DNA: 537.8', category: 'dna', cn: 'DNA修复',  desc: 'DNA修复频率·基因修复' },
  { f: 543,   name: 'DNA: 543',   category: 'dna', cn: 'DNA活化',  desc: 'DNA活化·唤醒沉睡基因' },
  { f: 545.6, name: 'DNA: 545.6', category: 'dna', cn: 'DNA扩展',  desc: 'DNA扩展·意识扩展' },
  { f: 550,   name: 'DNA: 550',   category: 'dna', cn: 'DNA觉醒',  desc: 'DNA觉醒·灵性进化' },
];

// ===== 脉轮补充频率（healing-frequencies 的 Chakras 数据，带波长） =====

export interface ChakraExtendedFreq {
  /** 脉轮英文名 */
  chakra: string;
  /** 脉轮中文名 */
  cn: string;
  /** 频率 Hz */
  f: number;
  /** 波长 cm */
  l: number;
  /** 描述 */
  desc: string;
}

export const CHAKRA_EXTENDED_FREQS: ChakraExtendedFreq[] = [
  { chakra: 'Earth Star',   cn: '地球之星',  f: 68.05,  l: 336, desc: '地球之星脉轮·连接大地' },
  { chakra: 'Root',         cn: '根轮',     f: 194.18, l: 0,   desc: '根轮·安全感·生存基础' },
  { chakra: 'Sacral',       cn: '腹轮',     f: 210.42, l: 0,   desc: '腹轮·创造力·情感流动' },
  { chakra: 'Solar Plexus', cn: '脐轮',     f: 126.22, l: 307, desc: '脐轮·意志力·个人力量' },
  { chakra: 'Heart',        cn: '心轮',     f: 136.1,  l: 337, desc: '心轮·慈悲·爱·连结' },
  { chakra: 'Throat',       cn: '喉轮',     f: 141.27, l: 0,   desc: '喉轮·表达·沟通' },
  { chakra: 'Third Eye',    cn: '眉心轮',   f: 221.23, l: 0,   desc: '眉心轮·直觉·洞察' },
  { chakra: 'Crown',        cn: '顶轮',     f: 172.06, l: 0,   desc: '顶轮·灵性连接·超越' },
  { chakra: 'Soul Star',    cn: '灵魂星',   f: 272.2,  l: 337, desc: '灵魂星脉轮·灵性进化' },
];

// ===== 便捷查找 =====

/** 按类别分组 */
export const FREQ_BY_CATEGORY: Record<FreqCategory, HealingFrequency[]> = (() => {
  const map: Record<string, HealingFrequency[]> = {};
  for (const f of HEALING_FREQUENCIES) {
    if (!map[f.category]) map[f.category] = [];
    map[f.category].push(f);
  }
  return map as Record<FreqCategory, HealingFrequency[]>;
})();

/** 获取所有去重频率值 */
export const ALL_HEALING_FREQ_VALUES: number[] = [...new Set(HEALING_FREQUENCIES.map(f => f.f))];

/** 检查某频率是否已存在于现有 BOWL_FREQUENCIES（避免重复展示） */
export const EXISTING_BOWL_FREQS: number[] = [174, 256, 288, 324, 342, 384, 396, 417, 432, 480, 528, 639, 741, 852, 963];

/** 获取未重复的扩展频率（排除已在 BOWL_FREQUENCIES 中的） */
export const NEW_HEALING_FREQS: HealingFrequency[] = HEALING_FREQUENCIES.filter(
  f => !EXISTING_BOWL_FREQS.includes(f.f)
);
