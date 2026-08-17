// tcm-calendar.ts — TCM Calendar: 子午流注 + 五运六气
// 基于黄帝内经·素问、灵枢经、针灸甲乙经
// 支持年份范围: 1600-3000

export type WuxingElement = '金' | '水' | '木' | '火' | '土';

// ===== 天干地支基础 =====
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
const SHI_CHEN_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
const WUXING_ELEMENTS: WuxingElement[] = ['木', '火', '土', '金', '水'];

// ===== 年干支计算 =====
export function getYearGanZhi(year: number): { tianGan: string; diZhi: string; ganZhi: string; ganIndex: number; zhiIndex: number } {
  const ganIdx = ((year - 4) % 10 + 10) % 10;
  const zhiIdx = ((year - 4) % 12 + 12) % 12;
  return { tianGan: TIAN_GAN[ganIdx], diZhi: DI_ZHI[zhiIdx], ganZhi: TIAN_GAN[ganIdx] + DI_ZHI[zhiIdx], ganIndex: ganIdx, zhiIndex: zhiIdx };
}

// ===== 月干支计算 (五虎遁) =====
// 年干决定寅月的天干: 甲己→丙寅, 乙庚→戊寅, 丙辛→庚寅, 丁壬→壬寅, 戊癸→甲寅
const WU_HU_DUN_BASE = [2, 4, 6, 8, 0]; // 甲己=丙(2), 乙庚=戊(4), 丙辛=庚(6), 丁壬=壬(8), 戊癸=甲(0)
export function getMonthGanZhi(year: number, month: number): { tianGan: string; diZhi: string; ganZhi: string } {
  const yearGanIdx = ((year - 4) % 10 + 10) % 10;
  const baseGanIdx = WU_HU_DUN_BASE[Math.floor(yearGanIdx / 2)];
  // month is 1-12, 寅=1月, 卯=2月...
  const zhiIdx = (month + 1) % 12; // 1月=寅(2), 2月=卯(3)...
  const adjustedZhi = (month + 1) % 12;
  const ganIdx = (baseGanIdx + month - 1) % 10;
  return { tianGan: TIAN_GAN[ganIdx], diZhi: DI_ZHI[adjustedZhi], ganZhi: TIAN_GAN[ganIdx] + DI_ZHI[adjustedZhi] };
}

// ===== 日干支计算 (Julian Day Number method) =====
function dateToJD(year: number, month: number, day: number): number {
  let y = year, m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5;
}

export function getDayGanZhi(year: number, month: number, day: number): { tianGan: string; diZhi: string; ganZhi: string; ganIndex: number; zhiIndex: number } {
  const jd = dateToJD(year, month, day);
  // JD 0 (公元前4713年1月1日) 对应 甲寅日 → 干=0(甲), 支=2(寅), 偏移 50
  const offset = Math.floor(jd + 0.5) + 50;
  const ganIdx = ((offset % 10) + 10) % 10;
  const zhiIdx = ((offset % 12) + 12) % 12;
  return { tianGan: TIAN_GAN[ganIdx], diZhi: DI_ZHI[zhiIdx], ganZhi: TIAN_GAN[ganIdx] + DI_ZHI[zhiIdx], ganIndex: ganIdx, zhiIndex: zhiIdx };
}

// ===== 时干支计算 (五鼠遁) =====
// 日干决定子时的天干: 甲己→甲子, 乙庚→丙子, 丙辛→戊子, 丁壬→庚子, 戊癸→壬子
const WU_SHU_DUN_BASE = [0, 2, 4, 6, 8]; // 甲己=甲(0), 乙庚=丙(2), 丙辛=戊(4), 丁壬=庚(6), 戊癸=壬(8)
export function getHourGanZhi(dayGanIndex: number, hour: number): { tianGan: string; diZhi: string; ganZhi: string } {
  const baseGanIdx = WU_SHU_DUN_BASE[Math.floor(dayGanIndex / 2)];
  const zhiIdx = Math.floor(((hour + 1) % 24) / 2);
  const ganIdx = (baseGanIdx + zhiIdx) % 10;
  return { tianGan: TIAN_GAN[ganIdx], diZhi: DI_ZHI[zhiIdx], ganZhi: TIAN_GAN[ganIdx] + DI_ZHI[zhiIdx] };
}

// ===== 完整干支 =====
export function getFullGanZhi(year: number, month: number, day: number, hour: number) {
  const yearGZ = getYearGanZhi(year);
  const monthGZ = getMonthGanZhi(year, month);
  const dayGZ = getDayGanZhi(year, month, day);
  const hourGZ = getHourGanZhi(dayGZ.ganIndex, hour);
  return { yearGanZhi: yearGZ, monthGanZhi: monthGZ, dayGanZhi: dayGZ, hourGanZhi: hourGZ };
}

// ===== 子午流注 =====
export interface ShiChenInfo {
  index: number;
  name: string;
  timeRange: string;
  meridianCode: string;
  meridianName: string;
  organ: string;
  wuxing: WuxingElement;
  color: string;
  openPoint: string;
  openPointName: string;
}

export const SHI_CHEN_MAP: ShiChenInfo[] = [
  { index: 0, name: '子', timeRange: '23:00-01:00', meridianCode: 'GB', meridianName: '足少阳胆经', organ: '胆', wuxing: '木', color: '#2D5016', openPoint: 'GB43', openPointName: '侠溪' },
  { index: 1, name: '丑', timeRange: '01:00-03:00', meridianCode: 'LR', meridianName: '足厥阴肝经', organ: '肝', wuxing: '木', color: '#2D5016', openPoint: 'LR3', openPointName: '太冲' },
  { index: 2, name: '寅', timeRange: '03:00-05:00', meridianCode: 'LU', meridianName: '手太阴肺经', organ: '肺', wuxing: '金', color: '#F5E6CC', openPoint: 'LU8', openPointName: '经渠' },
  { index: 3, name: '卯', timeRange: '05:00-07:00', meridianCode: 'LI', meridianName: '手阳明大肠经', organ: '大肠', wuxing: '金', color: '#F5E6CC', openPoint: 'LI5', openPointName: '阳溪' },
  { index: 4, name: '辰', timeRange: '07:00-09:00', meridianCode: 'ST', meridianName: '足阳明胃经', organ: '胃', wuxing: '土', color: '#8B7355', openPoint: 'ST41', openPointName: '解溪' },
  { index: 5, name: '巳', timeRange: '09:00-11:00', meridianCode: 'SP', meridianName: '足太阴脾经', organ: '脾', wuxing: '土', color: '#8B7355', openPoint: 'SP5', openPointName: '商丘' },
  { index: 6, name: '午', timeRange: '11:00-13:00', meridianCode: 'HT', meridianName: '手少阴心经', organ: '心', wuxing: '火', color: '#8B1A1A', openPoint: 'HT8', openPointName: '少府' },
  { index: 7, name: '未', timeRange: '13:00-15:00', meridianCode: 'SI', meridianName: '手太阳小肠经', organ: '小肠', wuxing: '火', color: '#8B1A1A', openPoint: 'SI5', openPointName: '阳谷' },
  { index: 8, name: '申', timeRange: '15:00-17:00', meridianCode: 'BL', meridianName: '足太阳膀胱经', organ: '膀胱', wuxing: '水', color: '#1A1A2E', openPoint: 'BL64', openPointName: '京骨' },
  { index: 9, name: '酉', timeRange: '17:00-19:00', meridianCode: 'KI', meridianName: '足少阴肾经', organ: '肾', wuxing: '水', color: '#1A1A2E', openPoint: 'KI10', openPointName: '阴谷' },
  { index: 10, name: '戌', timeRange: '19:00-21:00', meridianCode: 'PC', meridianName: '手厥阴心包经', organ: '心包', wuxing: '火', color: '#8B1A1A', openPoint: 'PC5', openPointName: '间使' },
  { index: 11, name: '亥', timeRange: '21:00-23:00', meridianCode: 'TE', meridianName: '手少阳三焦经', organ: '三焦', wuxing: '火', color: '#8B1A1A', openPoint: 'TE6', openPointName: '支沟' },
];

export function getCurrentShiChen(date: Date = new Date()): number {
  const h = date.getHours();
  if (h >= 23 || h < 1) return 0;
  return Math.floor((h + 1) / 2);
}

export function getShiChenInfo(index: number): ShiChenInfo {
  return SHI_CHEN_MAP[((index % 12) + 12) % 12];
}

// ===== 纳甲法 (按日干推算开穴) =====
// 出自《针灸大成》子午流注纳甲法
interface NaJiaRule {
  dayGan: string;
  meridianCode: string;
  meridianName: string;
  jingWell: string;   // 井穴 - 起始穴
  jingWellName: string;
  ying: string;       // 荥穴
  yingName: string;
  shu: string;        // 输穴
  shuName: string;
  jing: string;       // 经穴
  jingName: string;
  he: string;         // 合穴
  heName: string;
}

const NA_JIA_RULES: NaJiaRule[] = [
  { dayGan: '甲', meridianCode: 'GB', meridianName: '足少阳胆经', jingWell: 'GB44', jingWellName: '窍阴', ying: 'GB43', yingName: '侠溪', shu: 'GB41', shuName: '临泣', jing: 'GB38', jingName: '阳辅', he: 'GB34', heName: '阳陵泉' },
  { dayGan: '乙', meridianCode: 'LR', meridianName: '足厥阴肝经', jingWell: 'LR1', jingWellName: '大敦', ying: 'LR2', yingName: '行间', shu: 'LR3', shuName: '太冲', jing: 'LR4', jingName: '中封', he: 'LR8', heName: '曲泉' },
  { dayGan: '丙', meridianCode: 'SI', meridianName: '手太阳小肠经', jingWell: 'SI1', jingWellName: '少泽', ying: 'SI2', yingName: '前谷', shu: 'SI3', shuName: '后溪', jing: 'SI5', jingName: '阳谷', he: 'SI8', heName: '小海' },
  { dayGan: '丁', meridianCode: 'HT', meridianName: '手少阴心经', jingWell: 'HT9', jingWellName: '少冲', ying: 'HT8', yingName: '少府', shu: 'HT7', shuName: '神门', jing: 'HT4', jingName: '灵道', he: 'HT3', heName: '少海' },
  { dayGan: '戊', meridianCode: 'ST', meridianName: '足阳明胃经', jingWell: 'ST45', jingWellName: '厉兑', ying: 'ST44', yingName: '内庭', shu: 'ST43', shuName: '陷谷', jing: 'ST41', jingName: '解溪', he: 'ST36', heName: '足三里' },
  { dayGan: '己', meridianCode: 'SP', meridianName: '足太阴脾经', jingWell: 'SP1', jingWellName: '隐白', ying: 'SP2', yingName: '大都', shu: 'SP3', shuName: '太白', jing: 'SP5', jingName: '商丘', he: 'SP9', heName: '阴陵泉' },
  { dayGan: '庚', meridianCode: 'LI', meridianName: '手阳明大肠经', jingWell: 'LI1', jingWellName: '商阳', ying: 'LI2', yingName: '二间', shu: 'LI3', shuName: '三间', jing: 'LI5', jingName: '阳溪', he: 'LI11', heName: '曲池' },
  { dayGan: '辛', meridianCode: 'LU', meridianName: '手太阴肺经', jingWell: 'LU11', jingWellName: '少商', ying: 'LU10', yingName: '鱼际', shu: 'LU9', shuName: '太渊', jing: 'LU8', jingName: '经渠', he: 'LU5', heName: '尺泽' },
  { dayGan: '壬', meridianCode: 'BL', meridianName: '足太阳膀胱经', jingWell: 'BL67', jingWellName: '至阴', ying: 'BL66', yingName: '通谷', shu: 'BL65', shuName: '束骨', jing: 'BL64', jingName: '京骨', he: 'BL40', heName: '委中' },
  { dayGan: '癸', meridianCode: 'KI', meridianName: '足少阴肾经', jingWell: 'KI1', jingWellName: '涌泉', ying: 'KI2', yingName: '然谷', shu: 'KI3', shuName: '太溪', jing: 'KI7', jingName: '复溜', he: 'KI10', heName: '阴谷' },
];

export function getNaJiaOpenPoint(date: Date = new Date()): NaJiaRule & { currentTimePoint: string; currentTimePointName: string; method: string } {
  const dayGZ = getDayGanZhi(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const rule = NA_JIA_RULES[dayGZ.ganIndex] || NA_JIA_RULES[0];
  const shiChenIdx = getCurrentShiChen(date);

  // 纳甲法按时辰推五输: 井→荥→输→经→合 对应 时辰顺序
  // 阳经: 井(甲)→荥(丙)→输(戊)→经(庚)→合(壬)
  // 阴经: 井(乙)→荥(丁)→输(己)→经(辛)→合(癸)
  const wuShu = [
    { key: 'jingWell', name: 'jingWellName', label: '井' },
    { key: 'ying', name: 'yingName', label: '荥' },
    { key: 'shu', name: 'shuName', label: '输' },
    { key: 'jing', name: 'jingName', label: '经' },
    { key: 'he', name: 'heName', label: '合' },
  ] as const;

  // 按照流注顺序，每个时辰开一个穴（简化：当日值经的时辰开井，此后每两个时辰递进一输）
  const step = Math.floor(shiChenIdx / 2.4) % 5;
  const currentWuShu = wuShu[step];
  const currentTimePoint = rule[currentWuShu.key] as string;
  const currentTimePointName = rule[currentWuShu.name] as string;

  return { ...rule, currentTimePoint, currentTimePointName, method: '纳甲法' };
}

// ===== 子午流注综合 =====
export function getZiWuLiuZhu(date: Date = new Date()) {
  const shiChenIdx = getCurrentShiChen(date);
  const shiChenInfo = getShiChenInfo(shiChenIdx);
  const naJia = getNaJiaOpenPoint(date);

  return {
    shiChen: shiChenInfo.name + '时',
    timeRange: shiChenInfo.timeRange,
    activeMeridian: shiChenInfo.meridianName,
    activeMeridianCode: shiChenInfo.meridianCode,
    wuxing: shiChenInfo.wuxing,
    naJiaMethod: {
      dayGan: naJia.dayGan,
      dayMeridian: naJia.meridianName,
      dayMeridianCode: naJia.meridianCode,
      openPoint: naJia.currentTimePoint,
      openPointName: naJia.currentTimePointName,
      method: naJia.method,
    },
    naZiMethod: {
      activeMeridian: shiChenInfo.meridianName,
      activeMeridianCode: shiChenInfo.meridianCode,
      openPoint: shiChenInfo.openPoint,
      openPointName: shiChenInfo.openPointName,
      method: '纳子法',
    },
    description: `${shiChenInfo.name}时（${shiChenInfo.timeRange}）${shiChenInfo.meridianName}气血最盛，宜调${shiChenInfo.organ}。纳甲法今日${naJia.dayGan}日，值${naJia.meridianName}，当前开${naJia.currentTimePointName}穴。`,
  };
}

// ===== 五运六气 =====
export interface WuYunLiuQi {
  year: number;
  tianGan: string;
  diZhi: string;
  yearGanZhi: string;
  zhongYun: WuxingElement;
  zhongYunName: string;
  isTaiGuo: boolean;
  isBuJi: boolean;
  siTian: string;
  siTianElement: WuxingElement;
  zaiQuan: string;
  zaiQuanElement: WuxingElement;
  liuQi: LiuQiPeriod[];
  bingJi: string;
  yangSheng: string;
  yinShi: string;
  classicRef: string;
  recommendedMeridians: string[];
  contraindicatedMeridians: string[];
}

export interface LiuQiPeriod {
  name: string;
  startDate: string;
  endDate: string;
  zhuQi: string;
  keQi: string;
  zhuQiElement: WuxingElement;
  keQiElement: WuxingElement;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

const TIAN_GAN_WUXING: Record<number, { element: WuxingElement; isTaiGuo: boolean }> = {
  0: { element: '土', isTaiGuo: true }, 1: { element: '金', isTaiGuo: false },
  2: { element: '水', isTaiGuo: true }, 3: { element: '木', isTaiGuo: false },
  4: { element: '火', isTaiGuo: true }, 5: { element: '土', isTaiGuo: false },
  6: { element: '金', isTaiGuo: true }, 7: { element: '水', isTaiGuo: false },
  8: { element: '木', isTaiGuo: true }, 9: { element: '火', isTaiGuo: false },
};

const ZHONG_YUN_NAMES: Record<WuxingElement, string> = {
  '金': '金运', '水': '水运', '木': '木运', '火': '火运', '土': '土运',
};

// 司天/在泉映射 (素问·天元纪大论)
const SI_TIAN_MAP: Record<string, { name: string; element: WuxingElement }> = {
  '子': { name: '少阴君火', element: '火' }, '午': { name: '少阴君火', element: '火' },
  '丑': { name: '太阴湿土', element: '土' }, '未': { name: '太阴湿土', element: '土' },
  '寅': { name: '少阳相火', element: '火' }, '申': { name: '少阳相火', element: '火' },
  '卯': { name: '阳明燥金', element: '金' }, '酉': { name: '阳明燥金', element: '金' },
  '辰': { name: '太阳寒水', element: '水' }, '戌': { name: '太阳寒水', element: '水' },
  '巳': { name: '厥阴风木', element: '木' }, '亥': { name: '厥阴风木', element: '木' },
};
const ZAI_QUAN_MAP: Record<string, { name: string; element: WuxingElement }> = {
  '子': { name: '阳明燥金', element: '金' }, '午': { name: '阳明燥金', element: '金' },
  '丑': { name: '太阳寒水', element: '水' }, '未': { name: '太阳寒水', element: '水' },
  '寅': { name: '厥阴风木', element: '木' }, '申': { name: '厥阴风木', element: '木' },
  '卯': { name: '少阴君火', element: '火' }, '酉': { name: '少阴君火', element: '火' },
  '辰': { name: '少阳相火', element: '火' }, '戌': { name: '少阳相火', element: '火' },
  '巳': { name: '太阴湿土', element: '土' }, '亥': { name: '太阴湿土', element: '土' },
};

// 主气 (固定不变): 初之气厥阴→二之气少阴→三之气少阳→四之气太阴→五之气阳明→终之气太阳
const ZHU_QI = [
  { name: '厥阴风木', element: '木' as WuxingElement },
  { name: '少阴君火', element: '火' as WuxingElement },
  { name: '少阳相火', element: '火' as WuxingElement },
  { name: '太阴湿土', element: '土' as WuxingElement },
  { name: '阳明燥金', element: '金' as WuxingElement },
  { name: '太阳寒水', element: '水' as WuxingElement },
];

// 客气排列: 根据 司天确定 三之气客气=司天, 六之气客气=在泉, 其余按逆行排列
const KE_QI_ORDER = ['厥阴风木', '少阴君火', '太阴湿土', '少阳相火', '阳明燥金', '太阳寒水'] as const;
const KE_QI_ELEMENTS: Record<string, WuxingElement> = {
  '厥阴风木': '木', '少阴君火': '火', '太阴湿土': '土', '少阳相火': '火', '阳明燥金': '金', '太阳寒水': '水',
};

function getKeQi(siTianName: string, zaiQuanName: string): { name: string; element: WuxingElement }[] {
  // 司天 = 三之气客气, 在泉 = 终之气客气
type KeQiName = typeof KE_QI_ORDER[number];
const siIdx = KE_QI_ORDER.indexOf(siTianName as KeQiName);
  const result: { name: string; element: WuxingElement }[] = [];
  for (let i = 0; i < 6; i++) {
    // 三之气 = 司天 (siIdx), 从三之气逆推至初之气
    // 初之气 = 司天后退两位
    const idx = ((siIdx - 2 + i) % 6 + 6) % 6;
    const name = KE_QI_ORDER[idx];
    result.push({ name, element: KE_QI_ELEMENTS[name] });
  }
  return result;
}

export function computeWuYunLiuQi(year: number): WuYunLiuQi {
  const { tianGan, diZhi, ganZhi, ganIndex, zhiIndex } = getYearGanZhi(year);
  const yunInfo = TIAN_GAN_WUXING[ganIndex];
  const zhongYun = yunInfo.element;
  const isTaiGuo = yunInfo.isTaiGuo;
  const isBuJi = !isTaiGuo;

  const siTianInfo = SI_TIAN_MAP[diZhi] || SI_TIAN_MAP['子'];
  const zaiQuanInfo = ZAI_QUAN_MAP[diZhi] || ZAI_QUAN_MAP['子'];

  const keQiList = getKeQi(siTianInfo.name, zaiQuanInfo.name);

  // 六气 6 个阶段 (大寒 → 次年大寒)
  const liuQiDates = [
    { startMonth: 1, startDay: 20, endMonth: 3, endDay: 20 },  // 初之气 大寒→春分前
    { startMonth: 3, startDay: 21, endMonth: 5, endDay: 20 },  // 二之气 春分→小满前
    { startMonth: 5, startDay: 21, endMonth: 7, endDay: 22 },  // 三之气 小满→大暑前
    { startMonth: 7, startDay: 23, endMonth: 9, endDay: 22 },  // 四之气 大暑→秋分前
    { startMonth: 9, startDay: 23, endMonth: 11, endDay: 21 }, // 五之气 秋分→小雪前
    { startMonth: 11, startDay: 22, endMonth: 1, endDay: 19 }, // 终之气 小雪→大寒前
  ];
  const liuQiNames = ['初之气', '二之气', '三之气', '四之气', '五之气', '终之气'] as const;
  const liuQiStartJieqi = ['大寒', '春分', '小满', '大暑', '秋分', '小雪'] as const;
  const liuQiEndJieqi = ['惊蛰', '立夏', '小暑', '白露', '立冬', '大寒'] as const;

  const liuQi: LiuQiPeriod[] = liuQiDates.map((d, i) => ({
    name: liuQiNames[i],
    startDate: liuQiStartJieqi[i],
    endDate: liuQiEndJieqi[i],
    zhuQi: ZHU_QI[i].name,
    keQi: keQiList[i].name,
    zhuQiElement: ZHU_QI[i].element,
    keQiElement: keQiList[i].element,
    startMonth: d.startMonth, startDay: d.startDay,
    endMonth: d.endMonth, endDay: d.endDay,
  }));

  // 病机/养生/饮食 推算
  const bingJiMap: Record<WuxingElement, string> = {
    '金': `${isTaiGuo ? '金运太过，肝木受邪' : '金运不及，炎火乃行'}。主病：肺病、咳喘、皮肤病、便秘。`,
    '水': `${isTaiGuo ? '水运太过，甚则水邪泛滥' : '水运不及，湿乃大行'}。主病：肾病、骨病、畏寒、水肿。`,
    '木': `${isTaiGuo ? '木运太过，脾土受邪' : '木运不及，燥乃大行'}。主病：肝病、风病、筋病、头痛。`,
    '火': `${isTaiGuo ? '火运太过，肺金受邪' : '火运不及，寒乃大行'}。主病：心病、热病、血脉、失眠。`,
    '土': `${isTaiGuo ? '土运太过，肾水受邪' : '土运不及，风乃大行'}。主病：脾病、湿病、肌肉、泄泻。`,
  };
  const yangShengMap: Record<WuxingElement, string> = {
    '金': '润肺养阴，早睡早起，白色食物（百合、银耳、梨），忌辛辣燥热',
    '水': '补肾填精，静心敛神，黑色食物（黑豆、核桃、芝麻），忌寒凉过度',
    '木': '疏肝理气，适度运动，绿色食物（枸杞、菊花、菠菜），忌酸涩郁闷',
    '火': '养心安神，避免暑热，红色食物（莲子、红豆、红枣），忌煎炸燥热',
    '土': '健脾祛湿，饮食规律，黄色食物（山药、小米、南瓜），忌生冷甜腻',
  };
  const yinShiMap: Record<WuxingElement, string> = {
    '金': '百合银耳梨汤、沙参麦冬粥、莲子百合羹；忌辣椒、羊肉、烈酒',
    '水': '黑豆核桃粥、枸杞山药汤、海参小米粥；忌冰饮、生冷海鲜',
    '木': '枸杞菊花茶、玫瑰花粥、芹菜合桃仁；忌酸梅、醋、浓茶',
    '火': '莲子红豆汤、百合绿豆粥、红枣桂圆汤；忌烧烤、辣椒、烈酒',
    '土': '山药小米粥、薏米红豆汤、南瓜红枣羹；忌冰淇淋、西瓜、甜食',
  };

  // 经络宜忌
  const meridianRecommendMap: Record<WuxingElement, { good: string[]; avoid: string[] }> = {
    '金': { good: ['LU', 'LI', 'ST'], avoid: ['LR'] },     // 补肺大肠，泻肝
    '水': { good: ['KI', 'BL', 'LR'], avoid: ['ST'] },     // 补肾膀胱，泻脾胃
    '木': { good: ['LR', 'GB', 'SP'], avoid: ['LU'] },     // 补肝胆，泻肺
    '火': { good: ['HT', 'SI', 'PC', 'TE'], avoid: ['KI'] }, // 补心小肠心包三焦，泻肾
    '土': { good: ['SP', 'ST', 'KI'], avoid: ['LR'] },     // 补脾胃，泻肝
  };

  const classicRefMap: Record<WuxingElement, string> = {
    '金': '《素问·气交变大论》：岁金太过，燥气流行，肝木受邪；岁金不及，炎火乃行。',
    '水': '《素问·气交变大论》：岁水太过，寒气流行，邪害心火；岁水不及，湿乃大行。',
    '木': '《素问·气交变大论》：岁木太过，风气流行，脾土受邪；岁木不及，燥乃大行。',
    '火': '《素问·气交变大论》：岁火太过，炎暑流行，肺金受邪；岁火不及，寒乃大行。',
    '土': '《素问·气交变大论》：岁土太过，雨湿流行，肾水受邪；岁土不及，风乃大行。',
  };

  const meridianRec = meridianRecommendMap[zhongYun];

  return {
    year, tianGan, diZhi, yearGanZhi: ganZhi,
    zhongYun,
    zhongYunName: (isTaiGuo ? '太' : '少') + ZHONG_YUN_NAMES[zhongYun],
    isTaiGuo, isBuJi,
    siTian: siTianInfo.name, siTianElement: siTianInfo.element,
    zaiQuan: zaiQuanInfo.name, zaiQuanElement: zaiQuanInfo.element,
    liuQi,
    bingJi: bingJiMap[zhongYun],
    yangSheng: yangShengMap[zhongYun],
    yinShi: yinShiMap[zhongYun],
    classicRef: classicRefMap[zhongYun],
    recommendedMeridians: meridianRec.good,
    contraindicatedMeridians: meridianRec.avoid,
  };
}

// ===== 当前六气阶段 =====
export function getCurrentQiPeriod(date: Date = new Date()): { period: number; name: string; hostQi: string; guestQi: string; advice: string } {
  const year = date.getFullYear();
  const wylq = computeWuYunLiuQi(year);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (let i = 0; i < wylq.liuQi.length; i++) {
    const qi = wylq.liuQi[i];
    // Simple date range check
    const afterStart = month > qi.startMonth || (month === qi.startMonth && day >= qi.startDay);
    const beforeEnd = month < qi.endMonth || (month === qi.endMonth && day <= qi.endDay);
    if (afterStart && (qi.startMonth > qi.endMonth || beforeEnd)) {
      return {
        period: i + 1,
        name: qi.name,
        hostQi: qi.zhuQi,
        guestQi: qi.keQi,
        advice: `${qi.name}主气${qi.zhuQi}，客气${qi.keQi}。${qi.zhuQiElement === qi.keQiElement ? '主客同气，顺从为稳。' : '主客异气，注意调和。'}`,
      };
    }
  }
  // Default to 终之气 for late December
  const lastQi = wylq.liuQi[5];
  return { period: 6, name: lastQi.name, hostQi: lastQi.zhuQi, guestQi: lastQi.keQi, advice: `${lastQi.name}主气${lastQi.zhuQi}，客气${lastQi.keQi}。当固本归藏。` };
}

// ===== 五运六气深化 — 倪师体系 + 运气-体质联动 =====

/** 天符岁会推算 — 《素问·六微旨大论》 */
export interface TianFuSuiHui {
  isTianFu: boolean;        // 天符：中运与司天同气
  isSuiHui: boolean;        // 岁会：中运与年支同气
  isTaiYiTianFu: boolean;   // 太一天符：天符+岁会
  description: string;
  clinicalSignificance: string;
  niComment: string;
}

export function computeTianFuSuiHui(wylq: WuYunLiuQi): TianFuSuiHui {
  // 天符：中运五行 == 司天五行
  const isTianFu = wylq.zhongYun === wylq.siTianElement;
  // 岁会：中运五行 == 年支五行（地支五行：子亥=水, 寅卯=木, 巳午=火, 申酉=金, 辰戌丑未=土）
  const DIZHI_WUXING: Record<string, WuxingElement> = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
    '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水',
  };
  const zhiElement = DIZHI_WUXING[wylq.diZhi] || '土';
  const isSuiHui = wylq.zhongYun === zhiElement;
  const isTaiYiTianFu = isTianFu && isSuiHui;

  let description = '';
  if (isTaiYiTianFu) description = `太一天符年：中运${wylq.zhongYun}与司天${wylq.siTianElement}、年支${zhiElement}三者同气，天地人三合，疫病最易流行`;
  else if (isTianFu) description = `天符年：中运${wylq.zhongYun}与司天${wylq.siTianElement}同气，运气偏盛`;
  else if (isSuiHui) description = `岁会年：中运${wylq.zhongYun}与年支${zhiElement}同气，气候变化较缓`;
  else description = '非天符岁会年，运气变化相对平稳';

  const niComment = isTaiYiTianFu
    ? '倪师认为太一天符年疫病最易流行，当以预防为主，扶正祛邪。此类年份民病多急重，辨证需审慎。'
    : isTianFu
    ? '倪师认为天符年运气偏盛，中运与司天同气则该年气象偏极。如木运太过又逢厥阴风木司天，则风木尤盛，肝病多作。'
    : isSuiHui
    ? '倪师认为岁会年气候变化较缓和，病势亦相对缓和。但不可掉以轻心，仍需据六气分期辨证施治。'
    : '倪师认为此年运气平和，但仍需关注客气加临对主气的影响，尤其是主客异气时的顺逆关系。';

  const clinicalSignificance = isTaiYiTianFu
    ? '疫病高风险年，建议提前预防；清热解毒方剂储备，重点保护易感人群'
    : isTianFu
    ? '偏盛之气易致对应脏腑疾病，加强该脏腑的预防和调养'
    : isSuiHui
    ? '运气变化和缓，可按常规养生节奏调理'
    : '运气平稳，但需关注六气分期中的主客顺逆';

  return { isTianFu, isSuiHui, isTaiYiTianFu, description, clinicalSignificance, niComment };
}

/** 运气同化分析 — 主客气顺逆关系 */
export interface YunQiTongHua {
  periodName: string;
  zhuQi: string;
  keQi: string;
  relationship: '顺化' | '逆化' | '同气';
  description: string;
  clinicalAdvice: string;
}

export function computeYunQiTongHua(wylq: WuYunLiuQi): YunQiTongHua[] {
  // 五行生克关系：主气客气之间
  const SHENG_MAP: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  const KE_MAP: Record<string, string> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };

  return wylq.liuQi.map((lq, i) => {
    const zhu = lq.zhuQiElement;
    const ke = lq.keQiElement;

    let relationship: '顺化' | '逆化' | '同气';
    let description: string;
    let clinicalAdvice: string;

    if (zhu === ke) {
      relationship = '同气';
      description = `主客同气（${zhu}），气运平和，病势较缓`;
      clinicalAdvice = '同气无争，当以调和为主，不可妄攻妄补';
    } else if (SHENG_MAP[zhu] === ke) {
      relationship = '顺化';
      description = `主气生客气（${zhu}生${ke}），客气得助，病从客气`;
      clinicalAdvice = `客气${ke}得助偏盛，注意${ke}行相关脏腑病变，当泻客气、扶主气`;
    } else if (KE_MAP[zhu] === ke) {
      relationship = '逆化';
      description = `主气克客气（${zhu}克${ke}），主气为胜，但客气不甘受制`;
      clinicalAdvice = `主气克客气，争斗激烈，疾病多急重。当调和主客，不可偏泻一方`;
    } else if (SHENG_MAP[ke] === zhu) {
      // 客气生主气
      relationship = '顺化';
      description = `客气生主气（${ke}生${zhu}），主气得助，病从主气`;
      clinicalAdvice = `主气${zhu}得助偏盛，注意${zhu}行相关脏腑病变，泻主气之盛`;
    } else {
      // 客气克主气
      relationship = '逆化';
      description = `客气克主气（${ke}克${zhu}），客气为胜，主气受制`;
      clinicalAdvice = `客气偏盛克主气，疾病多急暴。当先泻客气之盛，后扶主气`;
    }

    return {
      periodName: lq.name,
      zhuQi: lq.zhuQi,
      keQi: lq.keQi,
      relationship,
      description,
      clinicalAdvice,
    };
  });
}

/** 运气-体质联动 — 根据用户体质和当年运气给出个性化建议 */
export interface YunQiConstitutionAdvice {
  constitutionElement: WuxingElement;
  currentYearElement: WuxingElement;
  isTaiGuo: boolean;
  relationship: '相生助益' | '相克风险' | '同气偏盛' | '正常';
  riskLevel: '高' | '中' | '低';
  advice: string;
  niComment: string;
  recommendedFormulas: string[];
  recommendedAcupoints: string[];
}

const SHENG_PAIRS: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
const KE_PAIRS: Record<string, string> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };

// 体质→运气风险方剂推荐
const CONSTITUTION_FORMULA_MAP: Record<WuxingElement, Record<string, string[]>> = {
  '木': { '相克风险': ['F003', 'F017', 'F018'], '同气偏盛': ['F039', 'F040', 'F079'], '相生助益': ['F001', 'F002'], '正常': ['F003'] },
  '火': { '相克风险': ['F030', 'F031', 'F136'], '同气偏盛': ['F042', 'F043', 'F044'], '相生助益': ['F003', 'F017'], '正常': ['F003'] },
  '土': { '相克风险': ['F042', 'F043', 'F165'], '同气偏盛': ['F030', 'F031'], '相生助益': ['F039', 'F040'], '正常': ['F039'] },
  '金': { '相克风险': ['F003', 'F051'], '同气偏盛': ['F042', 'F043'], '相生助益': ['F030', 'F031'], '正常': ['F030'] },
  '水': { '相克风险': ['F030', 'F036'], '同气偏盛': ['F042', 'F044'], '相生助益': ['F042', 'F043'], '正常': ['F042'] },
};

// 体质→运气风险穴位推荐
const CONSTITUTION_ACUPOINT_MAP: Record<WuxingElement, Record<string, string[]>> = {
  '木': { '相克风险': ['LR3', 'GB34', 'LV8'], '同气偏盛': ['SP6', 'ST36', 'CV12'], '相生助益': ['HT7', 'PC6'], '正常': ['LR3', 'GB34'] },
  '火': { '相克风险': ['HT7', 'PC6', 'CV14'], '同气偏盛': ['KI3', 'KI7', 'CV4'], '相生助益': ['LR3', 'GB34'], '正常': ['HT7', 'PC6'] },
  '土': { '相克风险': ['SP6', 'ST36', 'CV12'], '同气偏盛': ['KI3', 'KI7', 'CV4'], '相生助益': ['LU9', 'LU5'], '正常': ['SP6', 'ST36'] },
  '金': { '相克风险': ['LU9', 'LU5', 'LI11'], '同气偏盛': ['KI3', 'KI7'], '相生助益': ['SP6', 'ST36'], '正常': ['LU9', 'LU5'] },
  '水': { '相克风险': ['KI3', 'KI7', 'CV4'], '同气偏盛': ['LR3', 'GB34'], '相生助益': ['HT7', 'PC6'], '正常': ['KI3', 'KI7'] },
};

export function computeYunQiConstitutionAdvice(
  constitutionElement: WuxingElement,
  wylq: WuYunLiuQi,
): YunQiConstitutionAdvice {
  const yearElement = wylq.zhongYun;
  let relationship: '相生助益' | '相克风险' | '同气偏盛' | '正常';
  let riskLevel: '高' | '中' | '低';
  let advice: string;

  if (constitutionElement === yearElement) {
    relationship = '同气偏盛';
    riskLevel = wylq.isTaiGuo ? '高' : '中';
    advice = `体质${constitutionElement}行与当年${yearElement}运同气${wylq.isTaiGuo ? '太过' : '不及'}。${wylq.isTaiGuo ? '同气太过则偏盛，该行脏腑易过亢，需泻其盛、抑其过。' : '同气不及则该行偏弱，需补其不足、扶助本气。'}`;
  } else if (SHENG_PAIRS[yearElement] === constitutionElement) {
    relationship = '相生助益';
    riskLevel = '低';
    advice = `年运${yearElement}生体质${constitutionElement}行，得运气之助，今年体质相关脏腑得养。但仍需注意运气太过反致偏盛。`;
  } else if (KE_PAIRS[yearElement] === constitutionElement) {
    relationship = '相克风险';
    riskLevel = '高';
    advice = `年运${yearElement}克体质${constitutionElement}行，今年该行脏腑最易受邪。需提前预防，加强补益${constitutionElement}行，避免耗损。`;
  } else if (SHENG_PAIRS[constitutionElement] === yearElement) {
    relationship = '相生助益';
    riskLevel = '低';
    advice = `体质${constitutionElement}行生年运${yearElement}，虽耗散本气但关系和缓。注意勿过泄本气。`;
  } else if (KE_PAIRS[constitutionElement] === yearElement) {
    relationship = '相克风险';
    riskLevel = '中';
    advice = `体质${constitutionElement}行克年运${yearElement}，体质克运气虽不为大害，但争斗易致气血不和。需调和二者关系。`;
  } else {
    relationship = '正常';
    riskLevel = '低';
    advice = '体质与年运关系平和，按常规养生即可。';
  }

  const niComment = relationship === '相克风险'
    ? `倪师强调：年运克体质，该脏腑最虚。如${yearElement}运克${constitutionElement}行体质，则${constitutionElement}行脏腑今年最易受邪，治当扶正祛邪、先安未受邪之地。`
    : relationship === '同气偏盛'
    ? `倪师认为：同气之年需辨太过不及。太过者泻之，不及者补之。治同气之病最忌攻伐太过。`
    : `倪师认为：运气相生之年体质得助，但仍需关注六气分期中客气加临的变化，不可大意。`;

  return {
    constitutionElement,
    currentYearElement: yearElement,
    isTaiGuo: wylq.isTaiGuo,
    relationship,
    riskLevel,
    advice,
    niComment,
    recommendedFormulas: CONSTITUTION_FORMULA_MAP[constitutionElement]?.[relationship] || [],
    recommendedAcupoints: CONSTITUTION_ACUPOINT_MAP[constitutionElement]?.[relationship] || [],
  };
}

/** 五运推算法 — 五步推运（《素问·六元正纪大论》） */
export interface WuBuTuiYun {
  step: number;
  name: string;
  element: WuxingElement;
  isTaiGuo: boolean;
  period: string;
  clinicalNote: string;
}

export function computeWuBuTuiYun(wylq: WuYunLiuQi): WuBuTuiYun[] {
  const WUXING_ORDER: WuxingElement[] = ['木', '火', '土', '金', '水'];
  const baseElement = wylq.zhongYun;
  const baseIdx = WUXING_ORDER.indexOf(baseElement);

  // 五步推运：初运→二运→三运→四运→终运
  // 从中运开始按五行相生顺序排列
  const steps: WuBuTuiYun[] = [];
  const stepNames = ['初运', '二运', '三运', '四运', '终运'];
  const periods = ['大寒→春分后13日', '春分后13日→芒种后10日', '芒种后10日→处暑后7日', '处暑后7日→立冬后4日', '立冬后4日→大寒'];
  const clinicalNotes: Record<string, string[]> = {
    '木': ['风气当令，注意疏肝', '肝旺乘脾，健脾为要', '肝心同旺，清心泻火', '肝气渐收，收敛为度', '肝木休囚，养肝之阴'],
    '火': ['心火初动，养心安神', '心火旺盛，泻火存阴', '心脾同旺，健脾泻心', '心火渐收，滋阴降火', '心火休囚，温阳养心'],
    '土': ['湿土当令，健脾祛湿', '脾胃旺盛，和胃降逆', '脾肺同旺，补脾益肺', '湿土渐收，燥湿并用', '脾土休囚，温中健脾'],
    '金': ['燥金当令，润肺养阴', '肺金旺盛，泻肺平喘', '肺肾同旺，补肺益肾', '燥金渐收，清余热存阴', '肺金休囚，补肺固表'],
    '水': ['寒水当令，补肾填精', '肾水旺盛，泻水存阴', '肾肝同旺，滋水涵木', '寒水渐收，温肾助阳', '肾水休囚，补肾固精'],
  };

  for (let i = 0; i < 5; i++) {
    const idx = (baseIdx + i) % 5;
    const element = WUXING_ORDER[idx];
    const isTaiGuo = i === 0 ? wylq.isTaiGuo : (i % 2 === 0 ? !wylq.isTaiGuo : wylq.isTaiGuo);
    steps.push({
      step: i + 1,
      name: stepNames[i],
      element,
      isTaiGuo,
      period: periods[i],
      clinicalNote: clinicalNotes[element]?.[i] || '',
    });
  }
  return steps;
}

/** 综合运气临床决策 — 整合所有推算结果 */
export interface YunQiClinicalDecision {
  wylq: WuYunLiuQi;
  tianFuSuiHui: TianFuSuiHui;
  yunQiTongHua: YunQiTongHua[];
  wuBuTuiYun: WuBuTuiYun[];
  currentPeriod: { period: number; name: string; hostQi: string; guestQi: string; advice: string };
  summary: string;
  niSummary: string;
}

export function computeYunQiClinicalDecision(year: number, date: Date = new Date()): YunQiClinicalDecision {
  const wylq = computeWuYunLiuQi(year);
  const tianFuSuiHui = computeTianFuSuiHui(wylq);
  const yunQiTongHua = computeYunQiTongHua(wylq);
  const wuBuTuiYun = computeWuBuTuiYun(wylq);
  const currentPeriod = getCurrentQiPeriod(date);

  const summary = `${year}年${wylq.yearGanZhi}年，中运${wylq.zhongYunName}，${tianFuSuiHui.isTaiYiTianFu ? '太一天符' : tianFuSuiHui.isTianFu ? '天符' : tianFuSuiHui.isSuiHui ? '岁会' : ''}年。司天${wylq.siTian}，在泉${wylq.zaiQuan}。当前${currentPeriod.name}，主气${currentPeriod.hostQi}，客气${currentPeriod.guestQi}。`;

  const niSummary = `倪师运气观：${tianFuSuiHui.niComment} ${wylq.isTaiGuo ? '太过之年当泻其盛' : '不及之年当补其衰'}。${currentPeriod.advice}`;

  return { wylq, tianFuSuiHui, yunQiTongHua, wuBuTuiYun, currentPeriod, summary, niSummary };
}
