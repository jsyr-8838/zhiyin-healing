// tcm-formula-data.ts — TCM经方处方数据适配层
// 将formulas_database.json转换为组件可用的格式

import formulasRaw from '@/data/tcm/formulas_database.json';

export interface FormulaIngredient {
  name: string;
  dosage: number;
  unit: string;
}

export interface Formula {
  id: string;
  name: string;
  source: string;
  originalText: string;
  ingredients: FormulaIngredient[];
  preparation: string;
  indications: string;
  syndromeDifferentiation: string;
  niComment: string;
  contraindications: string;
  relatedMeridians: string[];
  relatedAcupoints: string[];
}

// 解析数据
export function parseFormulas(): Formula[] {
  return (formulasRaw as Array<{
    id: string; name: string; source: string; original_text: string;
    ingredients: Array<{ name: string; dosage: number; unit: string }>;
    preparation: string; indications: string; syndrome_differentiation: string;
    ni_comment: string; contraindications: string;
    related_meridians: string[]; related_acupoints: string[];
  }>).map(f => ({
    id: f.id,
    name: f.name,
    source: f.source,
    originalText: f.original_text,
    ingredients: f.ingredients,
    preparation: f.preparation,
    indications: f.indications,
    syndromeDifferentiation: f.syndrome_differentiation,
    niComment: f.ni_comment,
    contraindications: f.contraindications,
    relatedMeridians: f.related_meridians || [],
    relatedAcupoints: f.related_acupoints || [],
  }));
}

let _cached: Formula[] | null = null;
export function getFormulas(): Formula[] {
  if (!_cached) _cached = parseFormulas();
  return _cached;
}

// 按来源分类
export function getFormulasBySource(): Map<string, Formula[]> {
  const formulas = getFormulas();
  const map = new Map<string, Formula[]>();
  for (const f of formulas) {
    if (!map.has(f.source)) map.set(f.source, []);
    map.get(f.source)!.push(f);
  }
  return map;
}

// 搜索
export function searchFormulas(query: string): Formula[] {
  if (!query.trim()) return [];
  const q = query.trim().toLowerCase();
  return getFormulas().filter(f =>
    f.name.toLowerCase().includes(q) ||
    f.source.toLowerCase().includes(q) ||
    f.indications.toLowerCase().includes(q) ||
    f.syndromeDifferentiation.toLowerCase().includes(q) ||
    f.niComment.toLowerCase().includes(q) ||
    f.ingredients.some(i => i.name.toLowerCase().includes(q))
  ).slice(0, 50);
}

// 按名快速查找
export function getFormulaById(id: string): Formula | undefined {
  return getFormulas().find(f => f.id === id);
}

// 统计
export function getFormulaStats() {
  const formulas = getFormulas();
  const sources = new Set(formulas.map(f => f.source));
  return { total: formulas.length, sources: sources.size };
}
