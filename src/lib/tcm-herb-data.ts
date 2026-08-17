// tcm-herb-data.ts — TCM本草药典数据适配层
// 将herbs_database.json转换为组件可用的格式

import herbsRaw from '@/data/tcm/herbs_database.json';

export interface Herb {
  id: string;
  name: string;
  pinyin: string;
  category: string;
  nature: string;
  flavor: string;
  meridianTropism: string;
  effects: string;
  indications: string;
  dosage: string;
  contraindications: string;
  niComment: string;
  classicFormulas: string[];
  relatedAcupoints: string[];
}

// 解析数据
export function parseHerbs(): Herb[] {
  const raw = herbsRaw as { herbs_database: Array<{
    id: string; name: string; pinyin: string; category: string;
    nature: string; flavor: string; meridian_tropism: string;
    effects: string; indications: string; dosage: string;
    contraindications: string; ni_comment: string;
    classic_formulas: string[]; related_acupoints: string[];
  }> };

  return raw.herbs_database.map(h => ({
    id: h.id,
    name: h.name,
    pinyin: h.pinyin,
    category: h.category,
    nature: h.nature,
    flavor: h.flavor,
    meridianTropism: h.meridian_tropism,
    effects: h.effects,
    indications: h.indications,
    dosage: h.dosage,
    contraindications: h.contraindications,
    niComment: h.ni_comment,
    classicFormulas: h.classic_formulas || [],
    relatedAcupoints: h.related_acupoints || [],
  }));
}

let _cached: Herb[] | null = null;
export function getHerbs(): Herb[] {
  if (!_cached) _cached = parseHerbs();
  return _cached;
}

// 按分类分组
export function getHerbsByCategory(): Map<string, Herb[]> {
  const herbs = getHerbs();
  const map = new Map<string, Herb[]>();
  for (const h of herbs) {
    if (!map.has(h.category)) map.set(h.category, []);
    map.get(h.category)!.push(h);
  }
  return map;
}

// 搜索
export function searchHerbs(query: string): Herb[] {
  if (!query.trim()) return [];
  const q = query.trim().toLowerCase();
  return getHerbs().filter(h =>
    h.name.toLowerCase().includes(q) ||
    h.pinyin.toLowerCase().includes(q) ||
    h.category.toLowerCase().includes(q) ||
    h.effects.toLowerCase().includes(q) ||
    h.indications.toLowerCase().includes(q) ||
    h.niComment.toLowerCase().includes(q) ||
    h.meridianTropism.toLowerCase().includes(q)
  ).slice(0, 50);
}

// 按名查找
export function getHerbById(id: string): Herb | undefined {
  return getHerbs().find(h => h.id === id);
}

// 统计
export function getHerbStats() {
  const herbs = getHerbs();
  const categories = new Set(herbs.map(h => h.category));
  return { total: herbs.length, categories: categories.size };
}
