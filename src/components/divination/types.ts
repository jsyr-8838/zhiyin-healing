import type { DivinationMethod } from '@/lib/taibu-adapter';

export type Step = 'home' | 'profile' | 'setup' | 'result';

export const NEEDS_BIRTH_DATE: DivinationMethod[] = ['bazi', 'ziwei'];
export const NEEDS_NUMBER: DivinationMethod[] = ['meihua'];

export const METHOD_ICONS: Record<DivinationMethod, string> = {
  meihua: '🌸', zhouyi: '☯️', liuyao: '🪙', qimen: '🐉',
  daliuren: '🔮', bazi: '📅', xiaoliuren: '🎲', ziwei: '⭐',
  taiyi: '🌟', tarot: '🃏',
};

export function difficultyLabel(d: number) {
  if (d <= 1) return { text: '入门', cls: 'bg-emerald-100 text-emerald-600' };
  if (d <= 2) return { text: '初级', cls: 'bg-green-100 text-green-600' };
  if (d <= 3) return { text: '进阶', cls: 'bg-amber-100 text-amber-600' };
  if (d <= 4) return { text: '高阶', cls: 'bg-orange-100 text-orange-600' };
  return { text: '大师', cls: 'bg-red-100 text-red-600' };
}

export const ELEMENT_COLORS: Record<string, string> = {
  '金': 'bg-gray-400', '木': 'bg-emerald-500', '水': 'bg-blue-500',
  '火': 'bg-red-500', '土': 'bg-amber-500',
};

export interface HexagramInfo {
  name?: string;
  upper?: string;
  lower?: string;
  element?: string;
  keyword?: string;
  judgment?: string;
}

export interface MeihuaJson {
  mainHexagram?: HexagramInfo;
  hexagram?: HexagramInfo;
  upperGua?: string;
  lowerGua?: string;
  movingLine?: string | number;
  upperElement?: string;
  lowerElement?: string;
  interHexagram?: HexagramInfo;
  changedHexagram?: HexagramInfo;
  cuoHexagram?: HexagramInfo;
  zongHexagram?: HexagramInfo;
}

export interface LiuyaoLine {
  isMoving?: boolean;
  shiYing?: string;
  liuShen?: string;
  liushen?: string;
  liuQin?: string;
  yinYang?: string;
  diZhi?: string;
  position?: string | number;
}

export interface LiuyaoJson {
  lines?: LiuyaoLine[];
  mainHexagram?: string;
  hexagramName?: string;
  gongName?: string;
  gong?: string;
  changedHexagram?: { name?: string };
  changedHexagramName?: string;
}

export interface QimenPalace {
  position?: number;
  gong?: number;
  shen?: string;
  tianGan?: string;
  men?: string;
  xing?: string;
}

export interface QimenJson {
  dunType?: string;
  yinYang?: string;
  juNumber?: number | string;
  ju?: number | string;
  palaces?: QimenPalace[];
  zhiFu?: string;
  zhiShi?: string;
}

export interface ChuanValue {
  ganZhi?: string;
  name?: string;
}

export interface DaliurenJson {
  firstChuan?: string | ChuanValue;
  secondChuan?: string | ChuanValue;
  thirdChuan?: string | ChuanValue;
  chuChuan?: (string | ChuanValue)[];
  siKe?: unknown[];
  fourLessons?: unknown[];
}

export interface BaziPillar {
  gan: string;
  zhi: string;
  naYin?: string;
}

export interface BaziDayunItem {
  ganZhi?: string;
  name?: string;
}

export interface BaziJson {
  yearPillar?: BaziPillar;
  monthPillar?: BaziPillar;
  dayPillar?: BaziPillar;
  hourPillar?: BaziPillar;
  wuxingCount?: Record<string, number>;
  fiveElementsCount?: Record<string, number>;
  animal?: string;
  dayMaster?: string;
  dayMasterElement?: string;
  dayun?: (string | BaziDayunItem)[];
}

export interface XiaoliurenPosition {
  label?: string;
  name?: string;
}

export interface XiaoliurenJson {
  positions?: XiaoliurenPosition[];
  daAn?: string;
  name1?: string;
  firstPosition?: string;
  liuLian?: string;
  name2?: string;
  secondPosition?: string;
  suXi?: string;
  name3?: string;
  thirdPosition?: string;
  name?: string;
}

export interface ZiweiPalace {
  name?: string;
  gongName?: string;
  mainStar?: string;
  star?: string;
  zhuXing?: string;
  subStar?: string;
}

export interface ZiweiJson {
  palaces?: ZiweiPalace[];
  gong?: ZiweiPalace[];
  mingGong?: string;
  '命宫'?: string;
}

export interface TaiyiJson {
  taiyiStar?: string;
  name?: string;
  star?: string;
  jiNian?: string | number;
  accumulation?: string | number;
  zhuSuan?: string | number;
  mainCalc?: string | number;
  keSuan?: string | number;
  guestCalc?: string | number;
}

export interface TarotCard {
  reversed?: boolean;
  name: string;
  suit?: string;
  meaning?: string;
}

export interface TarotJson {
  cards?: TarotCard[];
}
