/* ═══ 推拿手法 数据类型定义 ═══ */

export interface TuinaCase {
  p: string;   // 患者
  sy: string;  // 主诉
  t: string;   // 治法
  o: string;   // 疗效
  cs: string;  // 出处
}

export interface TuinaTechnique {
  id: number;
  img: string;        // 图片路径
  n: string;          // 名称
  c: string;          // 分类
  s: string;          // 出处来源
  d: string;          // 操作方法
  k: string[];        // 操作要点
  ind: string[];      // 主治病症
  ac: string[];       // 常用穴位
  case: TuinaCase;    // 临床案例
  th: string;         // 理论解析
  df: string;         // 难度（初级/中级/高级）
  bp: string;         // 适用部位
  ci: string;         // 禁忌
  pr: string;         // 注意事项
}

/** 8大分类 */
export const TUINA_CATEGORIES = [
  '摆动类手法',
  '摩擦类手法',
  '振动类手法',
  '挤压类手法',
  '叩击类手法',
  '运动关节类手法',
  '小儿推拿手法',
  '正骨整复手法',
  '经络腧穴手法',
] as const;

export type TuinaCategory = (typeof TUINA_CATEGORIES)[number];

/** 难度等级 */
export type Difficulty = '初级' | '中级' | '高级';

/** 体质 → 推荐分类映射（与灸疗处方逻辑平行） */
export const CONSTITUTION_TUINA_MAP: Record<string, { categories: string[]; rationale: string }> = {
  '平和质': {
    categories: ['摩擦类手法', '叩击类手法'],
    rationale: '平和质气血调和，宜保健通络，摩擦类温通、叩击类振奋',
  },
  '气虚质': {
    categories: ['摆动类手法', '经络腧穴手法'],
    rationale: '气虚质宜补益培元，摆动类柔和深透、经络类循经补气',
  },
  '阳虚质': {
    categories: ['摩擦类手法', '振动类手法'],
    rationale: '阳虚质宜温阳散寒，摩擦类温经通阳、振法温补下元',
  },
  '阴虚质': {
    categories: ['摆动类手法', '摩擦类手法'],
    rationale: '阴虚质宜滋阴润养，摆动类柔和勿燥、摩法轻柔养阴',
  },
  '痰湿质': {
    categories: ['挤压类手法', '摩擦类手法'],
    rationale: '痰湿质宜健脾化湿，挤压类按揉运化、摩擦类温通散湿',
  },
  '湿热质': {
    categories: ['叩击类手法', '挤压类手法'],
    rationale: '湿热质宜清热利湿，叩击类疏通、挤压类泻热导滞',
  },
  '血瘀质': {
    categories: ['挤压类手法', '运动关节类手法'],
    rationale: '血瘀质宜活血化瘀，挤压类拨法松解粘连、运动类滑利关节',
  },
  '气郁质': {
    categories: ['摆动类手法', '经络腧穴手法'],
    rationale: '气郁质宜疏肝理气，摆动类柔和解郁、经络类疏调肝胆',
  },
  '特禀质': {
    categories: ['摆动类手法', '摩擦类手法'],
    rationale: '特禀质宜柔和调理，摆动类手法轻柔、摩擦类温固卫气',
  },
};

/** 按体质推荐手法 */
export function recommendByConstitution(constitution: string, techniques: TuinaTechnique[], limit = 8): TuinaTechnique[] {
  const mapping = CONSTITUTION_TUINA_MAP[constitution];
  if (!mapping) return techniques.filter(t => t.df === '初级').slice(0, limit);
  return techniques
    .filter(t => mapping.categories.includes(t.c))
    .slice(0, limit);
}

/** 按病症搜索手法 */
export function searchBySymptom(query: string, techniques: TuinaTechnique[]): TuinaTechnique[] {
  const q = query.toLowerCase();
  return techniques.filter(t =>
    t.n.includes(q) ||
    t.c.includes(q) ||
    t.ind.some(i => i.includes(q)) ||
    t.ac.some(a => a.includes(q)) ||
    t.d.includes(q) ||
    t.th.includes(q)
  );
}
