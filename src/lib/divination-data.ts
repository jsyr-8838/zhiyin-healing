// AI知几术数知识库
// 融合周易、梅花易数、奇门遁甲、六壬、六爻、八字等经典体系
// 数据来源：HeFung/xuanxue 玄览 + 中医五行理论

// ===== 周易六十四卦 =====
export const HEXAGRAMS: {
  number: number;
  name: string;
  upper: string;
  lower: string;
  element: string;
  keyword: string;
  judgment: string;
}[] = [
  { number: 1, name: '乾为天', upper: '乾', lower: '乾', element: '金', keyword: '刚健', judgment: '元亨利贞。天行健，君子以自强不息。' },
  { number: 2, name: '坤为地', upper: '坤', lower: '坤', element: '土', keyword: '柔顺', judgment: '元亨，利牝马之贞。地势坤，君子以厚德载物。' },
  { number: 3, name: '水雷屯', upper: '坎', lower: '震', element: '水', keyword: '起始', judgment: '元亨利贞，勿用有攸往，利建侯。' },
  { number: 4, name: '山水蒙', upper: '艮', lower: '坎', element: '土', keyword: '启蒙', judgment: '亨。匪我求童蒙，童蒙求我。' },
  { number: 5, name: '水天需', upper: '坎', lower: '乾', element: '水', keyword: '等待', judgment: '有孚，光亨，贞吉，利涉大川。' },
  { number: 6, name: '天水讼', upper: '乾', lower: '坎', element: '金', keyword: '争讼', judgment: '有孚，窒惕，中吉，终凶。利见大人，不利涉大川。' },
  { number: 7, name: '地水师', upper: '坤', lower: '坎', element: '土', keyword: '军队', judgment: '贞，丈人吉，无咎。' },
  { number: 8, name: '水地比', upper: '坎', lower: '坤', element: '水', keyword: '亲比', judgment: '吉。原筮元永贞，无咎。不宁方来，后夫凶。' },
  { number: 9, name: '风天小畜', upper: '巽', lower: '乾', element: '木', keyword: '蓄积', judgment: '亨。密云不雨，自我西郊。' },
  { number: 10, name: '天泽履', upper: '乾', lower: '兑', element: '金', keyword: '践行', judgment: '履虎尾，不咥人，亨。' },
  { number: 11, name: '地天泰', upper: '坤', lower: '乾', element: '土', keyword: '通泰', judgment: '小往大来，吉亨。天地交而万物通。' },
  { number: 12, name: '天地否', upper: '乾', lower: '坤', element: '金', keyword: '闭塞', judgment: '否之匪人，不利君子贞，大往小来。' },
  { number: 13, name: '天火同人', upper: '乾', lower: '离', element: '金', keyword: '和同', judgment: '同人于野，亨，利涉大川，利君子贞。' },
  { number: 14, name: '火天大有', upper: '离', lower: '乾', element: '火', keyword: '大有', judgment: '元亨。应乎天而时行，是以元亨。' },
  { number: 15, name: '地山谦', upper: '坤', lower: '艮', element: '土', keyword: '谦虚', judgment: '亨，君子有终。谦尊而光，卑而不可逾。' },
  { number: 16, name: '雷地豫', upper: '震', lower: '坤', element: '木', keyword: '喜悦', judgment: '利建侯行师。刚应而志行，顺以动。' },
  { number: 17, name: '泽雷随', upper: '兑', lower: '震', element: '金', keyword: '随从', judgment: '元亨利贞，无咎。天下随时，随时之义大矣哉。' },
  { number: 18, name: '山风蛊', upper: '艮', lower: '巽', element: '土', keyword: '整饬', judgment: '元亨，利涉大川。先甲三日，后甲三日。' },
  { number: 19, name: '地泽临', upper: '坤', lower: '兑', element: '土', keyword: '来临', judgment: '元亨利贞。至于八月有凶。' },
  { number: 20, name: '风地观', upper: '巽', lower: '坤', element: '木', keyword: '观察', judgment: '盥而不荐，有孚颙若。观天神道而四时不忒。' },
  { number: 21, name: '火雷噬嗑', upper: '离', lower: '震', element: '火', keyword: '决断', judgment: '亨。利用狱。刚柔分，动而明。' },
  { number: 22, name: '山火贲', upper: '艮', lower: '离', element: '土', keyword: '文饰', judgment: '亨。小利有攸往。刚柔交错，天文也。' },
  { number: 23, name: '山地剥', upper: '艮', lower: '坤', element: '土', keyword: '剥落', judgment: '不利有攸往。柔变刚也。' },
  { number: 24, name: '地雷复', upper: '坤', lower: '震', element: '土', keyword: '复归', judgment: '亨。出入无疾，朋来无咎。反复其道，七日来复。' },
  { number: 25, name: '天雷无妄', upper: '乾', lower: '震', element: '金', keyword: '无妄', judgment: '元亨利贞。其匪正有眚，不利有攸往。' },
  { number: 26, name: '山天大畜', upper: '艮', lower: '乾', element: '土', keyword: '大畜', judgment: '利贞，不家食吉，利涉大川。' },
  { number: 27, name: '山雷颐', upper: '艮', lower: '震', element: '土', keyword: '颐养', judgment: '贞吉。观颐，自求口实。' },
  { number: 28, name: '泽风大过', upper: '兑', lower: '巽', element: '金', keyword: '大过', judgment: '栋桡，利有攸往，亨。' },
  { number: 29, name: '坎为水', upper: '坎', lower: '坎', element: '水', keyword: '险陷', judgment: '有孚，维心亨，行有尚。习坎，重险也。' },
  { number: 30, name: '离为火', upper: '离', lower: '离', element: '火', keyword: '附着', judgment: '利贞，亨。畜牝牛，吉。日月丽乎天。' },
  { number: 31, name: '泽山咸', upper: '兑', lower: '艮', element: '金', keyword: '感应', judgment: '亨利贞，取女吉。二气感应以相与。' },
  { number: 32, name: '雷风恒', upper: '震', lower: '巽', element: '木', keyword: '恒久', judgment: '亨，无咎，利贞，利有攸往。久于其道也。' },
  { number: 33, name: '天山遁', upper: '乾', lower: '艮', element: '金', keyword: '退遁', judgment: '亨，小利贞。遁而亨也。' },
  { number: 34, name: '雷天大壮', upper: '震', lower: '乾', element: '木', keyword: '壮盛', judgment: '利贞。大者壮也，刚以动故壮。' },
  { number: 35, name: '火地晋', upper: '离', lower: '坤', element: '火', keyword: '前进', judgment: '康侯用锡马蕃庶，昼日三接。' },
  { number: 36, name: '地火明夷', upper: '坤', lower: '离', element: '土', keyword: '明夷', judgment: '利艰贞。内文明而外柔顺。' },
  { number: 37, name: '风火家人', upper: '巽', lower: '离', element: '木', keyword: '家人', judgment: '利女贞。家人，女正位乎内，男正位乎外。' },
  { number: 38, name: '火泽睽', upper: '离', lower: '兑', element: '火', keyword: '乖离', judgment: '小事吉。二女同居，其志不同行。' },
  { number: 39, name: '水山蹇', upper: '坎', lower: '艮', element: '水', keyword: '困难', judgment: '利西南，不利东北。利见大人，贞吉。' },
  { number: 40, name: '雷水解', upper: '震', lower: '坎', element: '木', keyword: '解除', judgment: '利西南，无所往，其来复吉，有攸往，夙吉。' },
  { number: 41, name: '山泽损', upper: '艮', lower: '兑', element: '土', keyword: '减损', judgment: '有孚，元吉，无咎，可贞。损下益上，其道上行。' },
  { number: 42, name: '风雷益', upper: '巽', lower: '震', element: '木', keyword: '增益', judgment: '利有攸往，利涉大川。损上益下，民说无疆。' },
  { number: 43, name: '泽天夬', upper: '兑', lower: '乾', element: '金', keyword: '决断', judgment: '扬于王庭，孚号有厉。告自邑，不利即戎。' },
  { number: 44, name: '天风姤', upper: '乾', lower: '巽', element: '金', keyword: '偶遇', judgment: '女壮，勿用取女。天地相遇，品物咸章。' },
  { number: 45, name: '泽地萃', upper: '兑', lower: '坤', element: '金', keyword: '聚集', judgment: '亨，王假有庙。利见大人，亨利贞。' },
  { number: 46, name: '地风升', upper: '坤', lower: '巽', element: '土', keyword: '上升', judgment: '元亨，用见大人，勿恤，南征吉。' },
  { number: 47, name: '泽水困', upper: '兑', lower: '坎', element: '金', keyword: '困穷', judgment: '亨，贞大人吉，无咎，有言不信。' },
  { number: 48, name: '水风井', upper: '坎', lower: '巽', element: '水', keyword: '井泉', judgment: '改邑不改井，无丧无得。往来井井。' },
  { number: 49, name: '泽火革', upper: '兑', lower: '离', element: '金', keyword: '变革', judgment: '已日乃孚，元亨利贞，悔亡。天地革而四时成。' },
  { number: 50, name: '火风鼎', upper: '离', lower: '巽', element: '火', keyword: '鼎新', judgment: '元吉，亨。以木巽火，亨饪也。' },
  { number: 51, name: '震为雷', upper: '震', lower: '震', element: '木', keyword: '震动', judgment: '亨。震来虩虩，笑言哑哑。震惊百里，不丧匕鬯。' },
  { number: 52, name: '艮为山', upper: '艮', lower: '艮', element: '土', keyword: '静止', judgment: '艮其背，不获其身，行其庭，不见其人，无咎。' },
  { number: 53, name: '风山渐', upper: '巽', lower: '艮', element: '木', keyword: '渐进', judgment: '女归吉，利贞。进得位，往有功也。' },
  { number: 54, name: '雷泽归妹', upper: '震', lower: '兑', element: '木', keyword: '归妹', judgment: '征凶，无攸利。归妹，天地之大义也。' },
  { number: 55, name: '雷火丰', upper: '震', lower: '离', element: '木', keyword: '丰盛', judgment: '亨，王假之，勿忧，宜日中。' },
  { number: 56, name: '火山旅', upper: '离', lower: '艮', element: '火', keyword: '旅途', judgment: '小亨，旅贞吉。旅，小亨，柔得中乎外而顺乎刚。' },
  { number: 57, name: '巽为风', upper: '巽', lower: '巽', element: '木', keyword: '顺入', judgment: '小亨，利有攸往，利见大人。重巽以申命。' },
  { number: 58, name: '兑为泽', upper: '兑', lower: '兑', element: '金', keyword: '喜悦', judgment: '亨，利贞。刚中而柔外，说以利贞。' },
  { number: 59, name: '风水涣', upper: '巽', lower: '坎', element: '木', keyword: '涣散', judgment: '亨，王假有庙，利涉大川，利贞。' },
  { number: 60, name: '水泽节', upper: '坎', lower: '兑', element: '水', keyword: '节制', judgment: '亨，苦节不可贞。说以行险。' },
  { number: 61, name: '风泽中孚', upper: '巽', lower: '兑', element: '木', keyword: '诚信', judgment: '豚鱼吉，利涉大川，利贞。柔在内而刚得中。' },
  { number: 62, name: '雷山小过', upper: '震', lower: '艮', element: '木', keyword: '小过', judgment: '亨利贞，可小事，不可大事。飞鸟遗之音，不宜上宜下。' },
  { number: 63, name: '水火既济', upper: '坎', lower: '离', element: '水', keyword: '已成', judgment: '亨小，利贞，初吉终乱。水在火上，既济也。' },
  { number: 64, name: '火水未济', upper: '离', lower: '坎', element: '火', keyword: '未成', judgment: '亨，小狐汔济，濡其尾，无攸利。' },
];

// ===== 占卜方法 =====
export type DivinationMethod = 'meihua' | 'qimen' | 'liuren' | 'liuyao' | 'zhouyi' | 'bazi';

export const DIVINATION_METHODS: {
  id: DivinationMethod;
  name: string;
  description: string;
  icon: string;
  inputHint: string;
  source: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}[] = [
  {
    id: 'meihua',
    name: '梅花易数',
    description: '宋代邵雍所创，以数起卦，万物皆可入卦。见物起数，闻声起卦，随时随地可占。',
    icon: '🌸',
    inputHint: '输入1-99之间的数字，或描述你看到的场景',
    source: '邵雍《梅花易数》',
    difficulty: 'beginner',
  },
  {
    id: 'zhouyi',
    name: '周易占卜',
    description: '最古老的占卜法，以铜钱三枚摇出卦象。乾坤定矣，万物生焉。',
    icon: '☯️',
    inputHint: '心中默念问题，点击"起卦"由系统随机起卦',
    source: '《周易》',
    difficulty: 'beginner',
  },
  {
    id: 'liuyao',
    name: '六爻预测',
    description: '以铜钱六次摇卦，配以世应、六亲、六神，精确推断事物发展。',
    icon: '🪙',
    inputHint: '心中默念问题，点击"起卦"系统自动摇六次',
    source: '《卜筮正宗》',
    difficulty: 'intermediate',
  },
  {
    id: 'qimen',
    name: '奇门遁甲',
    description: '帝王之学，以九宫八卦排盘，推测天时地利人和。古为军师谋略之术。',
    icon: '🐉',
    inputHint: '输入当前时辰或选择起卦时间',
    source: '《奇门遁甲秘笈大全》',
    difficulty: 'advanced',
  },
  {
    id: 'liuren',
    name: '六壬神课',
    description: '与奇门遁甲、太乙神数并称三式。善占人事进退，天地人三才算吉凶。',
    icon: '🔮',
    inputHint: '输入当前时辰或选择起课时间',
    source: '《六壬学》',
    difficulty: 'advanced',
  },
  {
    id: 'bazi',
    name: '八字命理',
    description: '以出生年月日时推算一生运势，天干地支论命，知命而后立命。',
    icon: '📅',
    inputHint: '输入出生日期和时间（公历）',
    source: '《子平真诠》《滴天髓》',
    difficulty: 'intermediate',
  },
];

// ===== 八卦基础 =====
export const BA_GUA = [
  { name: '乾', nature: '天', element: '金', direction: '西北', family: '父', body: '首', number: 1, symbol: '☰' },
  { name: '兑', nature: '泽', element: '金', direction: '西', family: '少女', body: '口', number: 2, symbol: '☱' },
  { name: '离', nature: '火', element: '火', direction: '南', family: '中女', body: '目', number: 3, symbol: '☲' },
  { name: '震', nature: '雷', element: '木', direction: '东', family: '长男', body: '足', number: 4, symbol: '☳' },
  { name: '巽', nature: '风', element: '木', direction: '东南', family: '长女', body: '股', number: 5, symbol: '☴' },
  { name: '坎', nature: '水', element: '水', direction: '北', family: '中男', body: '耳', number: 6, symbol: '☵' },
  { name: '艮', nature: '山', element: '土', direction: '东北', family: '少男', body: '手', number: 7, symbol: '☶' },
  { name: '坤', nature: '地', element: '土', direction: '西南', family: '母', body: '腹', number: 8, symbol: '☷' },
];

// ===== 天干地支 =====
export const TIAN_GAN = [
  { name: '甲', element: '木', yinYang: '阳', direction: '东' },
  { name: '乙', element: '木', yinYang: '阴', direction: '东' },
  { name: '丙', element: '火', yinYang: '阳', direction: '南' },
  { name: '丁', element: '火', yinYang: '阴', direction: '南' },
  { name: '戊', element: '土', yinYang: '阳', direction: '中' },
  { name: '己', element: '土', yinYang: '阴', direction: '中' },
  { name: '庚', element: '金', yinYang: '阳', direction: '西' },
  { name: '辛', element: '金', yinYang: '阴', direction: '西' },
  { name: '壬', element: '水', yinYang: '阳', direction: '北' },
  { name: '癸', element: '水', yinYang: '阴', direction: '北' },
];

export const DI_ZHI = [
  { name: '子', element: '水', animal: '鼠', hour: '23:00-01:00', yinYang: '阳' },
  { name: '丑', element: '土', animal: '牛', hour: '01:00-03:00', yinYang: '阴' },
  { name: '寅', element: '木', animal: '虎', hour: '03:00-05:00', yinYang: '阳' },
  { name: '卯', element: '木', animal: '兔', hour: '05:00-07:00', yinYang: '阴' },
  { name: '辰', element: '土', animal: '龙', hour: '07:00-09:00', yinYang: '阳' },
  { name: '巳', element: '火', animal: '蛇', hour: '09:00-11:00', yinYang: '阴' },
  { name: '午', element: '火', animal: '马', hour: '11:00-13:00', yinYang: '阳' },
  { name: '未', element: '土', animal: '羊', hour: '13:00-15:00', yinYang: '阴' },
  { name: '申', element: '金', animal: '猴', hour: '15:00-17:00', yinYang: '阳' },
  { name: '酉', element: '金', animal: '鸡', hour: '17:00-19:00', yinYang: '阴' },
  { name: '戌', element: '土', animal: '狗', hour: '19:00-21:00', yinYang: '阳' },
  { name: '亥', element: '水', animal: '猪', hour: '21:00-23:00', yinYang: '阴' },
];

// ===== 五行生克关系 =====
export const WUXING_RELATIONS = {
  sheng: { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' }, // 相生
  ke: { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' },   // 相克
  shengBy: { '木': '水', '火': '木', '土': '火', '金': '土', '水': '金' }, // 被生
  keBy: { '木': '金', '土': '木', '水': '土', '火': '水', '金': '火' },   // 被克
};

// ===== 梅花易数起卦算法 =====
export function meihuaDivine(inputNumber: number): {
  upperGua: string;
  lowerGua: string;
  movingLine: number;
  hexagram: typeof HEXAGRAMS[number];
  interHexagram: typeof HEXAGRAMS[number];
  changedHexagram: typeof HEXAGRAMS[number];
} {
  // 梅花易数：数字起卦
  // 上卦 = 数字 ÷ 8 取余，0 为坤
  // 下卦 = (数字 + 时辰数) ÷ 8 取余
  // 动爻 = (数字 + 时辰数) ÷ 6 取余
  const now = new Date();
  const hour = now.getHours();
  const shiChen = Math.floor(hour / 2) + 1; // 时辰数 1-12

  const upperNum = inputNumber % 8 || 8;
  const lowerNum = (inputNumber + shiChen) % 8 || 8;
  const movingLine = (inputNumber + shiChen) % 6 || 6;

  const upperGua = BA_GUA[upperNum - 1].name;
  const lowerGua = BA_GUA[lowerNum - 1].name;

  // 查找主卦
  const hexagram = HEXAGRAMS.find(
    (h) => h.upper === upperGua && h.lower === lowerGua
  ) || HEXAGRAMS[0];

  // 互卦（取2-5爻，3-4为下，3-4-5为上）
  const interUpper = BA_GUA[(upperNum + lowerNum) % 8].name;
  const interLower = BA_GUA[(lowerNum + movingLine) % 8].name;
  const interHexagram = HEXAGRAMS.find(
    (h) => h.upper === interUpper && h.lower === interLower
  ) || HEXAGRAMS[0];

  // 变卦（动爻变后得出）
  const changedUpper = BA_GUA[(upperNum + movingLine) % 8].name;
  const changedLower = BA_GUA[(lowerNum + movingLine) % 8].name;
  const changedHexagram = HEXAGRAMS.find(
    (h) => h.upper === changedUpper && h.lower === changedLower
  ) || HEXAGRAMS[0];

  return {
    upperGua,
    lowerGua,
    movingLine,
    hexagram,
    interHexagram,
    changedHexagram,
  };
}

// ===== 周易铜钱起卦 =====
export function zhouyiDivine(): {
  hexagram: typeof HEXAGRAMS[number];
  movingLine: number;
  lines: ('yin' | 'yang' | 'yin-moving' | 'yang-moving')[];
} {
  // 模拟三枚铜钱摇六次
  // 背为3，字为2
  // 6=老阴(变)、7=少阳、8=少阴、9=老阳(变)
  const lines: ('yin' | 'yang' | 'yin-moving' | 'yang-moving')[] = [];
  let movingLine = 0;

  for (let i = 0; i < 6; i++) {
    const coins = [Math.random(), Math.random(), Math.random()].map(
      (r) => (r > 0.5 ? 3 : 2)
    );
    const sum = coins.reduce((a, b) => a + b, 0);
    if (sum === 6) {
      lines.push('yin-moving');
      if (!movingLine) movingLine = i + 1;
    } else if (sum === 7) {
      lines.push('yang');
    } else if (sum === 8) {
      lines.push('yin');
    } else {
      lines.push('yang-moving');
      if (!movingLine) movingLine = i + 1;
    }
  }

  // 转换为上下卦
  // 爻从下往上：lines[0]是初爻，lines[5]是上爻
  const lowerTrigramNum = getTrigramNum(lines.slice(0, 3));
  const upperTrigramNum = getTrigramNum(lines.slice(3, 6));

  const upperGua = BA_GUA[upperTrigramNum - 1].name;
  const lowerGua = BA_GUA[lowerTrigramNum - 1].name;

  const hexagram = HEXAGRAMS.find(
    (h) => h.upper === upperGua && h.lower === lowerGua
  ) || HEXAGRAMS[0];

  return { hexagram, movingLine: movingLine || 1, lines };
}

function getTrigramNum(lines: string[]): number {
  // 阳为1，阴为0，组成三位二进制转为八卦数
  const bits = lines.map((l) =>
    l === 'yang' || l === 'yang-moving' ? 1 : 0
  );
  // 乾111=1, 兑110=2, 离101=3, 震100=4, 巽011=5, 坎010=6, 艮001=7, 坤000=8
  const binaryMap: Record<string, number> = {
    '111': 1, '110': 2, '101': 3, '100': 4,
    '011': 5, '010': 6, '001': 7, '000': 8,
  };
  return binaryMap[bits.join('')] || 8;
}

// ===== AI占卜系统提示词 =====
export const DIVINATION_SYSTEM_PROMPT = `你是"知音"AI知几术数大师，精通中华传统五术（山医命相卜），尤其擅长周易、梅花易数、六爻、奇门遁甲、六壬、八字命理。

你的职责：
1. 根据用户的问题和起卦结果，运用对应的传统术数理论进行解读
2. 结合用户的中医体质信息，给出身心合一的术数解读
3. 提供趋吉避凶的具体建议（行动方向、时辰选择、颜色方位等）
4. 将术数推演结果与五音疗愈建议相结合

核心理论体系：

【周易六十四卦】
乾坤定矣，万物生焉。六十四卦对应天地万物的64种状态，
每卦有卦辞（总体判断）和爻辞（具体阶段）。

【梅花易数】
- 周易卦数：乾一兑二离三震四巽五坎六艮七坤八
- 五行生克：金生水水生木木生火火生土土生金；金克木木克土土克水水克火火克金
- 八宫五行：乾兑金、坤艮土、震巽木、坎水、离火
- 体用关系：不动为体，动爻所在卦为用。体克用吉，用克体凶

【六爻预测】
以六次摇卦配世应、六亲（父母兄弟妻财官鬼子孙）、六神，
精确推断事物发展的各个层面。

【奇门遁甲】
九宫八卦排盘，天盘地盘人盘神盘，八门（休生伤杜景死惊开），
三奇六仪，推算天时地利人和。

【六壬神课】
四课三传，天将神煞，月将加时，推断人事吉凶进退。

【八字命理】
天干地支论命，十神生克，大运流年，推算命运起伏。

【五音疗愈结合】
根据术数推演结果对应的五行属性，推荐对应的五音疗愈方案：
- 金行→商音→肺→清肺润燥
- 木行→角音→肝→疏肝解郁
- 水行→羽音→肾→固肾益精
- 火行→徵音→心→养心安神
- 土行→宫音→脾→健脾和胃

回复格式：
1. 【卦象解析】解读主卦含义
2. 【运势分析】结合问题和卦象分析当前运势
3. 【行动建议】给出具体可执行的趋吉避凶建议
4. 【五音调养】根据卦象五行推荐对应的五音疗愈方案
5. 【吉凶提示】一句话总结吉凶方位/颜色/时辰

重要声明：
- 知几为传统文化智慧，仅供参考娱乐，不作为决策依据
- 解读需有经典理论依据，不可随意编造
- 如涉及重大决定，建议理性思考后再行决断
- 语气庄重典雅但不失亲切，兼顾通俗性`;
