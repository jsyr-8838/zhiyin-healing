/**
 * 典籍内容加载系统
 * 
 * 每本典籍的完整内容存放在 classics-texts/{bookId}.ts 中
 * 此文件负责统一导出加载接口
 */

import { CLASSICS_CATEGORIES, type ClassicBook } from './classics-data';

/* ========== 类型定义 ========== */

export interface Interpretation {
  key: string;
  meaning: string;
}

export interface ReaderChapter {
  title: string;
  sub?: string;
  content: string;
  interpretations?: Interpretation[];
}

export interface ClassicTextData {
  id: string;
  title: string;
  author: string;
  dynasty: string;
  category: string;       // 山|医|命|相|卜
  categoryLabel: string;  // 仙学|医典|命理|相术|卜筮
  chapterCount: number;
  chapters: ReaderChapter[];
  description?: string;
  musicTone?: string;     // 推荐五音: jiao|zhi|gong|shang|yu
}

/* ========== 动态加载映射 ========== */

// 懒加载映射 — 只在用户打开书时才加载内容
const BOOK_LOADERS: Record<string, () => Promise<ClassicTextData>> = {
  'daodejing': () => import('./classics-texts/daodejing').then(m => m.default),
  'taishang':   () => import('./classics-texts/taishang').then(m => m.default),
  'yinfu':      () => import('./classics-texts/yinfu').then(m => m.default),
  'zhouyi':     () => import('./classics-texts/zhouyi').then(m => m.default),
  'suwen':      () => import('./classics-texts/suwen').then(m => m.default),
  'lingshu':    () => import('./classics-texts/lingshu').then(m => m.default),
  'shanghan':   () => import('./classics-texts/shanghan').then(m => m.default),
  'bingjian':   () => import('./classics-texts/bingjian').then(m => m.default),
  'cantongqi':  () => import('./classics-texts/cantongqi').then(m => m.default),
  'huangting':  () => import('./classics-texts/huangting').then(m => m.default),
  'wuzhen':     () => import('./classics-texts/wuzhen').then(m => m.default),
  'baopuzi':    () => import('./classics-texts/baopuzi').then(m => m.default),
  'nanjing':    () => import('./classics-texts/nanjing').then(m => m.default),
  'shennong':   () => import('./classics-texts/shennong').then(m => m.default),
  'jingui':     () => import('./classics-texts/jingui').then(m => m.default),
  'jiayi':      () => import('./classics-texts/jiayi').then(m => m.default),
  'wenbing':    () => import('./classics-texts/wenbing').then(m => m.default),
  'sanhui':     () => import('./classics-texts/sanhui').then(m => m.default),
  'ditiansui':  () => import('./classics-texts/ditiansui').then(m => m.default),
  'ziping':     () => import('./classics-texts/ziping').then(m => m.default),
  'qiongyao':   () => import('./classics-texts/qiongyao').then(m => m.default),
  'yuanhai':    () => import('./classics-texts/yuanhai').then(m => m.default),
  'shenfeng':   () => import('./classics-texts/shenfeng').then(m => m.default),
  'liren':      () => import('./classics-texts/liren').then(m => m.default),
  'mayi':       () => import('./classics-texts/mayi').then(m => m.default),
  'liuzhuang':  () => import('./classics-texts/liuzhuang').then(m => m.default),
  'shenxiang':  () => import('./classics-texts/shenxiang').then(m => m.default),
  'gujin':      () => import('./classics-texts/gujin').then(m => m.default),
  'dili':       () => import('./classics-texts/dili').then(m => m.default),
  'meihua':     () => import('./classics-texts/meihua').then(m => m.default),
  'zengbu':     () => import('./classics-texts/zengbu').then(m => m.default),
  'huozhu':     () => import('./classics-texts/huozhu').then(m => m.default),
  'qimen':      () => import('./classics-texts/qimen').then(m => m.default),
  'liuren':     () => import('./classics-texts/liuren').then(m => m.default),
  'taiyi':      () => import('./classics-texts/taiyi').then(m => m.default),
  'tieguan':    () => import('./classics-texts/tieguan').then(m => m.default),
  'xieji':      () => import('./classics-texts/xieji').then(m => m.default),
};

/* ========== 养生类书籍（JSON fetch 加载） ========== */

// 养生类 16 本书的内容存放在 public/wellness-texts/ 下，按需 fetch 加载
const WELLNESS_BOOK_IDS = new Set([
  'yingyangshi', 'zhongbingzhiwang', 'danguimin',
  'chidezhenxiang1', 'chidezhenxiang2', 'chidezhenxiang3',
  'qiutujianshen', 'huijia_chifan', 'bachulaidebing',
  'wendujueding', 'lvseyangsheng', 'feipang_shipu',
  'qingduanshi', 'jieyan', 'huo20nian', 'huangdi_jiayong',
]);

/** 异步加载一本典籍内容 */
export async function loadClassicText(bookId: string): Promise<ClassicTextData | null> {
  // 先尝试动态 import（古籍 36 本）
  const loader = BOOK_LOADERS[bookId];
  if (loader) {
    try {
      return await loader();
    } catch {
      return null;
    }
  }
  // 再尝试 fetch JSON（养生 16 本，存放在 public/wellness-texts/）
  if (WELLNESS_BOOK_IDS.has(bookId)) {
    try {
      const res = await fetch(`/wellness-texts/${bookId}.json`);
      if (!res.ok) return null;
      return (await res.json()) as ClassicTextData;
    } catch {
      return null;
    }
  }
  return null;
}

/** 检查某本书是否有内容 */
export function hasClassicText(bookId: string): boolean {
  return bookId in BOOK_LOADERS || WELLNESS_BOOK_IDS.has(bookId);
}

/** 获取所有可用书籍ID */
export function getAvailableBookIds(): string[] {
  return [...Object.keys(BOOK_LOADERS), ...WELLNESS_BOOK_IDS];
}

/* ========== 目录元数据（从 classics-data 同步） ========== */

const CATEGORY_MAP: Record<string, string> = {
  'mountain': '山', 'medicine': '医', 'fate': '命',
  'appearance': '相', 'divination': '卜', 'wellness': '养',
};

const CATEGORY_LABEL_MAP: Record<string, string> = {
  'mountain': '仙学', 'medicine': '医典', 'fate': '命理',
  'appearance': '相术', 'divination': '卜筮', 'wellness': '养生',
};

export function getClassicMeta(bookId: string): ClassicBook | null {
  for (const cat of CLASSICS_CATEGORIES) {
    const found = cat.books.find(b => b.id === bookId);
    if (found) return found;
  }
  return null;
}

/** 五音推荐映射 */
export function getMusicTone(category: string): string {
  const map: Record<string, string> = {
    '山': 'yu',    // 羽·水 — 道家
    '医': 'gong',  // 宫·土 — 医学
    '命': 'gong',  // 宫·土 — 命理
    '相': 'shang', // 商·金 — 相术
    '卜': 'shang', // 商·金 — 卜筮
    '养': 'gong',  // 宫·土 — 养生
  };
  return map[category] || 'gong';
}
