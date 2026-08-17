// disease-simulation.ts — 疾病仿真引擎
// 基于 TCM 知识图谱 + 六经辨证 + 十问歌 构建
// 输入症状 → 辨证推理 → 关联分析 → 治疗方案推荐

import type { WuxingElement } from './tcm-calendar';
import { computeWuYunLiuQi, computeYunQiConstitutionAdvice } from './tcm-calendar';

// ============================================================
// 类型定义
// ============================================================

export interface SymptomInput {
  id: string;
  name: string;
  selected: boolean;
  severity?: '轻' | '中' | '重';
}

export interface SyndromeMatch {
  name: string;
  englishName: string;
  confidence: number;     // 0-1 匹配置信度
  matchedSymptoms: string[];
  totalSymptoms: number;
  description: string;
  niComment: string;
  tongue: string;
  pulse: string;
  formulas: string[];
  acupoints: string[];
}

export interface DiseaseSimulationResult {
  inputSymptoms: string[];
  matchedSyndromes: SyndromeMatch[];  // 按置信度排序
  knowledgeGraphLinks: KnowledgeLink[];
  niDiagnosis: string;
  recommendedAction: string;
  riskLevel: '低' | '中' | '高';
  constitutionAdvice?: ConstitutionAdviceResult;  // 体质-运气联动建议
}

/** 体质-运气联动诊断结果 */
export interface ConstitutionAdviceResult {
  constitutionElement: WuxingElement;
  yunQiElement: WuxingElement;
  isTaiGuo: boolean;
  relationship: string;       // 相生/相克/比和
  riskLevel: '低' | '中' | '高';
  adjustedRiskLevel: '低' | '中' | '高';  // 基于体质调整后的综合风险
  proneDiseases: string[];    // 体质+运气联合易感疾病
  preventiveMeridians: string[];
  niComment: string;
  clinicalAdvice: string;
}

export interface KnowledgeLink {
  source: string;
  sourceType: string;
  target: string;
  targetType: string;
  relation: string;
  weight: number;
}

// ============================================================
// 数据加载 — 从 TCM JSON 构建
// ============================================================

// 六经辨证数据（内联，从 syndrome_logic.json 提取）
interface SixMeridianSyndrome {
  name: string;
  englishName: string;
  keySymptoms: string[];
  tongue: string;
  pulse: string;
  formulas: string[];
  acupoints: string[];
  niComment: string;
  description: string;
}

// 十问歌症状→证候映射
interface TenQuestionMapping {
  category: string;
  symptoms: {
    name: string;
    value: string;
    relatedSyndromes: string[];
    relatedFormulas: string[];
    relatedAcupoints: string[];
  }[];
}

// 运行时加载缓存
let _syndromes: SixMeridianSyndrome[] | null = null;
let _tenQuestions: TenQuestionMapping[] | null = null;
let _graphNodes: Map<string, { name: string; type: string; description: string }> | null = null;
let _graphEdges: KnowledgeLink[] | null = null;

async function loadTCMData() {
  if (_syndromes && _tenQuestions && _graphNodes && _graphEdges) return;

  try {
    // 动态导入 JSON
    const [syndromeModule, graphModule] = await Promise.all([
      import('@/data/tcm/syndrome_logic.json'),
      import('@/data/tcm/knowledge_graph.json'),
    ]);

    const syndromeData = syndromeModule.default || syndromeModule;
    const graphData = graphModule.default || graphModule;

    // 解析六经辨证
    _syndromes = (syndromeData.six_meridian_syndromes || []).map((s: any) => ({
      name: s.name,
      englishName: s.english_name || '',
      keySymptoms: s.key_symptoms || [],
      tongue: s.tongue_pulse?.tongue || '',
      pulse: s.tongue_pulse?.pulse || '',
      formulas: s.classic_formulas || [],
      acupoints: s.key_acupoints || [],
      niComment: s.ni_comment || '',
      description: s.description || '',
    }));

    // 解析十问歌
    _tenQuestions = (syndromeData.ten_questions || []).map((q: any) => ({
      category: q.category,
      symptoms: (q.symptoms || []).map((s: any) => ({
        name: s.name,
        value: s.value,
        relatedSyndromes: s.related_syndromes || [],
        relatedFormulas: s.related_formulas || [],
        relatedAcupoints: s.related_acupoints || [],
      })),
    }));

    // 解析知识图谱
    _graphNodes = new Map();
    for (const node of graphData.nodes || []) {
      _graphNodes.set(node.id, { name: node.name, type: node.type, description: node.description || '' });
    }
    _graphEdges = (graphData.edges || []).map((e: any) => ({
      source: e.source,
      sourceType: _graphNodes?.get(e.source)?.type || '',
      target: e.target,
      targetType: _graphNodes?.get(e.target)?.type || '',
      relation: e.type,
      weight: e.weight || 0.5,
    }));
  } catch (e) {
    console.error('加载TCM数据失败:', e);
    _syndromes = [];
    _tenQuestions = [];
    _graphNodes = new Map();
    _graphEdges = [];
  }
}

// ============================================================
// 核心推理引擎
// ============================================================

/** 计算症状与六经证候的匹配置信度 */
function computeSyndromeConfidence(
  symptomNames: string[],
  syndrome: SixMeridianSyndrome,
): { confidence: number; matched: string[] } {
  if (symptomNames.length === 0) return { confidence: 0, matched: [] };

  // 模糊匹配：症状名包含关系
  const matched: string[] = [];
  for (const inputSym of symptomNames) {
    for (const keySym of syndrome.keySymptoms) {
      if (
        inputSym === keySym ||
        inputSym.includes(keySym) ||
        keySym.includes(inputSym) ||
        // 同义词近似匹配
        (inputSym.length >= 2 && keySym.length >= 2 && (
          levenshtein(inputSym, keySym) <= 1 ||
          sharedChars(inputSym, keySym) >= Math.max(inputSym.length, keySym.length) * 0.5
        ))
      ) {
        matched.push(keySym);
        break;
      }
    }
  }

  // 置信度 = 匹配症状数 / max(输入症状数, 证候症状数) × 匹配率权重
  const matchRate = matched.length / syndrome.keySymptoms.length;
  const hitRate = matched.length / symptomNames.length;
  const confidence = (matchRate * 0.6 + hitRate * 0.4);

  return { confidence: Math.min(confidence, 1), matched };
}

/** 编辑距离 */
function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

/** 共享字符数 */
function sharedChars(a: string, b: string): number {
  const setA = new Set(a.split(''));
  const setB = new Set(b.split(''));
  let count = 0;
  for (const c of setA) { if (setB.has(c)) count++; }
  return count;
}

/** 从知识图谱中查找关联 */
function findGraphLinks(symptomIds: string[]): KnowledgeLink[] {
  if (!_graphEdges || !_graphNodes) return [];

  const links: KnowledgeLink[] = [];
  const visited = new Set<string>();

  for (const edge of _graphEdges) {
    const sourceName = _graphNodes.get(edge.source)?.name || '';
    const targetName = _graphNodes.get(edge.target)?.name || '';

    for (const sym of symptomIds) {
      if (sourceName.includes(sym) || targetName.includes(sym) ||
          sym.includes(sourceName) || sym.includes(targetName)) {
        const key = `${edge.source}-${edge.target}-${edge.relation}`;
        if (!visited.has(key)) {
          visited.add(key);
          links.push({
            source: sourceName || edge.source,
            sourceType: edge.sourceType,
            target: targetName || edge.target,
            targetType: edge.targetType,
            relation: edge.relation,
            weight: edge.weight,
          });
        }
      }
    }
  }

  // 按权重排序，取前20条
  return links.sort((a, b) => b.weight - a.weight).slice(0, 20);
}

/** 从十问歌中查找症状相关证候 */
function findTenQuestionLinks(symptomNames: string[]): {
  relatedSyndromes: Set<string>;
  relatedFormulas: Set<string>;
  relatedAcupoints: Set<string>;
} {
  const syndromes = new Set<string>();
  const formulas = new Set<string>();
  const acupoints = new Set<string>();

  if (!_tenQuestions) return { relatedSyndromes: syndromes, relatedFormulas: formulas, relatedAcupoints: acupoints };

  for (const q of _tenQuestions) {
    for (const sym of q.symptoms) {
      for (const inputSym of symptomNames) {
        if (sym.name.includes(inputSym) || inputSym.includes(sym.name)) {
          sym.relatedSyndromes.forEach(s => syndromes.add(s));
          sym.relatedFormulas.forEach(f => formulas.add(f));
          sym.relatedAcupoints.forEach(a => acupoints.add(a));
        }
      }
    }
  }

  return { relatedSyndromes: syndromes, relatedFormulas: formulas, relatedAcupoints: acupoints };
}

/** 生成倪师综合诊断意见 */
function generateNiDiagnosis(matches: SyndromeMatch[]): string {
  if (matches.length === 0) return '未找到明确证候匹配，建议详细描述症状或就医。';

  const top = matches[0];
  const parts: string[] = [];

  parts.push(`辨证为${top.name}（置信度${Math.round(top.confidence * 100)}%）。`);
  parts.push(top.niComment);

  if (matches.length > 1) {
    const second = matches[1];
    if (second.confidence > 0.3) {
      parts.push(`需与${second.name}鉴别。${second.niComment}`);
    }
  }

  // 舌脉提示
  if (top.tongue || top.pulse) {
    parts.push(`舌脉参考：${top.tongue}，${top.pulse}。`);
  }

  return parts.join('');
}

/** 风险评估 */
function assessRisk(matches: SyndromeMatch[]): '低' | '中' | '高' {
  if (matches.length === 0) return '低';
  const top = matches[0];

  // 少阴、厥阴经证候为高风险
  const highRiskNames = ['少阴经', '厥阴经'];
  if (highRiskNames.some(n => top.name.includes(n)) && top.confidence > 0.5) return '高';
  // 太阳、阳明为中等风险
  const medRiskNames = ['阳明经', '太阳经'];
  if (medRiskNames.some(n => top.name.includes(n)) && top.confidence > 0.5) return '中';
  if (top.confidence > 0.7) return '中';
  return '低';
}

/** 生成推荐行动 */
function generateRecommendedAction(matches: SyndromeMatch[], risk: '低' | '中' | '高'): string {
  if (matches.length === 0) return '症状描述不足，建议补充更多症状信息。';

  const top = matches[0];
  const actions: string[] = [];

  if (risk === '高') {
    actions.push('⚠️ 病情可能较重，建议及时就医。');
  }

  if (top.formulas.length > 0) {
    actions.push(`推荐方剂：${top.formulas.slice(0, 3).join('、')}。`);
  }
  if (top.acupoints.length > 0) {
    actions.push(`推荐穴位：${top.acupoints.slice(0, 5).join('、')}。`);
  }

  actions.push(`治法：根据${top.name}辨证施治。`);

  return actions.join('');
}

// ============================================================
// 公开 API
// ============================================================

/** 计算体质与运气的生克关系 */
function getWuxingRelationship(from: WuxingElement, to: WuxingElement): '相生' | '相克' | '比和' {
  if (from === to) return '比和';
  const shengMap: Record<WuxingElement, WuxingElement> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  const keMap: Record<WuxingElement, WuxingElement> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };
  if (shengMap[from] === to) return '相生';
  if (keMap[from] === to) return '相克';
  // 反向关系
  if (shengMap[to] === from) return '相生';  // 我生彼
  if (keMap[to] === from) return '相克';    // 我克彼
  return '比和'; // 不应该到这里
}

/** 计算体质-运气联合易感疾病 */
function computeConstitutionYunQiDiseases(
  constitutionElement: WuxingElement,
  yunQiElement: WuxingElement,
  isTaiGuo: boolean,
): string[] {
  const keMap: Record<WuxingElement, WuxingElement> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };
  const shengMap: Record<WuxingElement, WuxingElement> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };

  const diseases: string[] = [];

  // 体质本身的弱点
  const constitutionWeaknesses: Record<WuxingElement, string[]> = {
    '木': ['肝气郁结', '肝阳上亢', '头痛眩晕'],
    '火': ['心火亢盛', '失眠心悸', '口舌生疮'],
    '土': ['脾虚湿盛', '食欲不振', '肌肉无力'],
    '金': ['肺气不足', '咳喘痰多', '皮肤干枯'],
    '水': ['肾阳虚衰', '腰膝酸软', '畏寒肢冷'],
  };

  // 运气太过/不及的病机
  const yunQiDiseases: Record<WuxingElement, string[]> = {
    '木': ['风病', '筋病', '中风先兆'],
    '火': ['热病', '血脉病', '烦躁不安'],
    '土': ['湿病', '肌肉病', '水湿内停'],
    '金': ['燥病', '咳喘', '皮肤病'],
    '水': ['寒病', '骨病', '水饮内停'],
  };

  // 运气克伐体质
  const beKeElement = keMap[yunQiElement]; // 运气所克的五行
  if (beKeElement === constitutionElement && isTaiGuo) {
    diseases.push(`${yunQiElement}运太过克${constitutionElement}行，${constitutionWeaknesses[constitutionElement][0]}`);
  }

  // 体质被运气所生（过度）
  const shengToElement = shengMap[yunQiElement]; // 运气所生的五行
  if (shengToElement === constitutionElement && isTaiGuo) {
    diseases.push(`${yunQiElement}运太过生${constitutionElement}行，反致壅塞`);
  }

  // 运气不及 → 所胜之脏来乘
  if (!isTaiGuo) {
    const laiKeElement = keMap[yunQiElement]; // 运气所克的五行
    if (laiKeElement === constitutionElement) {
      diseases.push(`${yunQiElement}运不及，${constitutionElement}行反侮，虚实夹杂`);
    }
  }

  // 加上基础病机
  diseases.push(...yunQiDiseases[yunQiElement]);
  if (beKeElement === constitutionElement || constitutionElement === yunQiElement) {
    diseases.push(...constitutionWeaknesses[constitutionElement]);
  }

  // 去重
  return [...new Set(diseases)];
}

/** 生成体质-运气联动临床建议 */
function generateConstitutionClinicalAdvice(
  relationship: string,
  constitutionElement: WuxingElement,
  yunQiElement: WuxingElement,
  isTaiGuo: boolean,
): string {
  if (relationship === '相克') {
    return isTaiGuo
      ? `本年${yunQiElement}运太过，克制${constitutionElement}行体质。当扶${constitutionElement}行正气，泻${yunQiElement}行盛气。预防重点在${constitutionElement}行对应脏腑，避免被克致病。`
      : `本年${yunQiElement}运不及，${constitutionElement}行虽不被克但运气生扶不足。当补${yunQiElement}行以生${constitutionElement}，扶正培本。`;
  }
  if (relationship === '相生') {
    return isTaiGuo
      ? `本年${yunQiElement}运太过，生${constitutionElement}行。体质得助但需防太过致壅，当适度泻${constitutionElement}行以保持平衡。`
      : `本年${yunQiElement}运不及，对${constitutionElement}行体质生扶不足。当补${yunQiElement}行源气，以生${constitutionElement}行。`;
  }
  // 比和
  return isTaiGuo
    ? `本年${yunQiElement}运太过，与${constitutionElement}行体质比和。同类相求则偏盛，当泻${constitutionElement}行盛气，防亢害为病。`
    : `本年${yunQiElement}运不及，与${constitutionElement}行体质比和。同气不足则两虚，当大补${constitutionElement}行，扶正固本。`;
}

/** 主入口：症状→辨证→关联→诊断（支持体质联动） */
export async function simulateDisease(
  symptomNames: string[],
  constitutionElement?: WuxingElement,
): Promise<DiseaseSimulationResult> {
  await loadTCMData();

  if (!_syndromes || _syndromes.length === 0) {
    return {
      inputSymptoms: symptomNames,
      matchedSyndromes: [],
      knowledgeGraphLinks: [],
      niDiagnosis: '数据加载失败，请稍后重试',
      recommendedAction: '',
      riskLevel: '低',
    };
  }

  // 1. 六经辨证匹配
  const matches: SyndromeMatch[] = [];
  for (const syndrome of _syndromes) {
    const { confidence, matched } = computeSyndromeConfidence(symptomNames, syndrome);
    if (confidence > 0.1) {
      matches.push({
        name: syndrome.name,
        englishName: syndrome.englishName,
        confidence,
        matchedSymptoms: matched,
        totalSymptoms: syndrome.keySymptoms.length,
        description: syndrome.description,
        niComment: syndrome.niComment,
        tongue: syndrome.tongue,
        pulse: syndrome.pulse,
        formulas: syndrome.formulas,
        acupoints: syndrome.acupoints,
      });
    }
  }

  // 按置信度降序
  matches.sort((a, b) => b.confidence - a.confidence);

  // 2. 十问歌关联
  const tenQLinks = findTenQuestionLinks(symptomNames);

  // 合并十问歌匹配的方剂/穴位到六经匹配结果
  if (matches.length > 0) {
    for (const m of matches) {
      // 用十问歌的补充推荐丰富结果
      tenQLinks.relatedFormulas.forEach(f => { if (!m.formulas.includes(f)) m.formulas.push(f); });
      tenQLinks.relatedAcupoints.forEach(a => { if (!m.acupoints.includes(a)) m.acupoints.push(a); });
    }
  }

  // 3. 知识图谱关联
  const graphLinks = findGraphLinks(symptomNames);

  // 4. 风险评估
  const riskLevel = assessRisk(matches);

  // 5. 倪师诊断
  const niDiagnosis = generateNiDiagnosis(matches);

  // 6. 推荐行动
  const recommendedAction = generateRecommendedAction(matches, riskLevel);

  // 7. 体质-运气联动（如果提供了体质）
  let constitutionAdvice: ConstitutionAdviceResult | undefined;
  if (constitutionElement) {
    const currentYear = new Date().getFullYear();
    const wylq = computeWuYunLiuQi(currentYear);
    const relationship = getWuxingRelationship(wylq.zhongYun, constitutionElement);
    const isTaiGuo = wylq.isTaiGuo;

    // 计算联合风险
    let constRisk: '低' | '中' | '高' = '低';
    if (relationship === '相克' && isTaiGuo) constRisk = '高';
    else if (relationship === '相克' || (relationship === '比和' && isTaiGuo)) constRisk = '中';

    // 综合风险 = max(症状风险, 体质风险)
    const riskPriority = { '低': 0, '中': 1, '高': 2 };
    const adjustedRiskLevel: '低' | '中' | '高' =
      riskPriority[constRisk] > riskPriority[riskLevel] ? constRisk : riskLevel;

    const proneDiseases = computeConstitutionYunQiDiseases(constitutionElement, wylq.zhongYun, isTaiGuo);
    const MERIDIAN_MAP: Record<WuxingElement, string[]> = {
      '木': ['LR', 'GB'], '火': ['HT', 'SI', 'PC', 'TE'],
      '土': ['SP', 'ST'], '金': ['LU', 'LI'], '水': ['KI', 'BL'],
    };
    const preventiveMeridians = [...new Set([...MERIDIAN_MAP[wylq.zhongYun], ...MERIDIAN_MAP[constitutionElement]])];

    const clinicalAdvice = generateConstitutionClinicalAdvice(relationship, constitutionElement, wylq.zhongYun, isTaiGuo);

    const niComment = isTaiGuo
      ? `倪师认为${wylq.zhongYun}运太过之年，${constitutionElement}行体质${relationship === '相克' ? '最易受害' : relationship === '比和' ? '同类偏盛' : '虽得生扶亦防太过'}。${clinicalAdvice}`
      : `倪师认为${wylq.zhongYun}运不及之年，${constitutionElement}行体质${relationship === '相克' ? '反侮但本气不足' : relationship === '比和' ? '同气不足两虚' : '生扶不足需补源气'}。${clinicalAdvice}`;

    constitutionAdvice = {
      constitutionElement,
      yunQiElement: wylq.zhongYun,
      isTaiGuo,
      relationship,
      riskLevel: constRisk,
      adjustedRiskLevel,
      proneDiseases,
      preventiveMeridians,
      niComment,
      clinicalAdvice,
    };
  }

  return {
    inputSymptoms: symptomNames,
    matchedSyndromes: matches.slice(0, 5), // 最多返回5个匹配
    knowledgeGraphLinks: graphLinks,
    niDiagnosis,
    recommendedAction,
    riskLevel: constitutionAdvice ? constitutionAdvice.adjustedRiskLevel : riskLevel,
    constitutionAdvice,
  };
}

/** 获取十问歌分类（用于UI展示） */
export async function getTenQuestionCategories(): Promise<TenQuestionMapping[]> {
  await loadTCMData();
  return _tenQuestions || [];
}

/** 获取所有可用症状列表 */
export async function getAllSymptoms(): Promise<{ category: string; symptoms: { name: string; value: string }[] }[]> {
  await loadTCMData();

  const result: { category: string; symptoms: { name: string; value: string }[] }[] = [];
  if (_tenQuestions) {
    for (const q of _tenQuestions) {
      result.push({
        category: q.category,
        symptoms: q.symptoms.map(s => ({ name: s.name, value: s.value })),
      });
    }
  }
  return result;
}

/** 获取知识图谱节点（用于可视化） */
export async function getGraphData() {
  await loadTCMData();
  return {
    nodes: _graphNodes ? Array.from(_graphNodes.entries()).map(([id, data]) => ({ id, ...data })) : [],
    edges: _graphEdges || [],
  };
}

/** 运气-疾病关联：根据当前运气推断疾病倾向 */
export function predictYunQiDiseaseTendency(
  zhongYun: WuxingElement,
  isTaiGuo: boolean,
  siTianElement: WuxingElement,
): { proneDiseases: string[]; preventiveMeridians: string[]; niComment: string } {
  // 中运太过/不及 → 易感疾病
  const TAI_GUO_DISEASES: Record<WuxingElement, string[]> = {
    '木': ['肝病', '风病', '头痛', '眩晕', '筋病', '中风'],
    '火': ['心病', '热病', '失眠', '烦躁', '血脉病', '口舌生疮'],
    '土': ['脾病', '湿病', '肌肉病', '泄泻', '水肿', '肥胖'],
    '金': ['肺病', '燥病', '咳喘', '皮肤病', '便秘', '鼻病'],
    '水': ['肾病', '寒病', '骨病', '畏寒', '水肿', '不孕'],
  };

  const BU_JI_DISEASES: Record<WuxingElement, string[]> = {
    '木': ['肝虚', '筋弱', '目疾', '胆虚', '易怒伤肝'],
    '火': ['心虚', '血脉弱', '失眠多梦', '心悸', '阳气不足'],
    '土': ['脾虚', '食欲不振', '肌肉消瘦', '泄泻', '气虚'],
    '金': ['肺虚', '咳喘无力', '皮毛干枯', '自汗', '气短'],
    '水': ['肾虚', '骨弱', '腰痛', '畏寒', '记忆力减退'],
  };

  const MERIDIAN_MAP: Record<WuxingElement, string[]> = {
    '木': ['LR', 'GB'],
    '火': ['HT', 'SI', 'PC', 'TE'],
    '土': ['SP', 'ST'],
    '金': ['LU', 'LI'],
    '水': ['KI', 'BL'],
  };

  const proneDiseases = isTaiGuo ? TAI_GUO_DISEASES[zhongYun] : BU_JI_DISEASES[zhongYun];
  const preventiveMeridians = MERIDIAN_MAP[zhongYun];

  // 司天加临的影响
  const siTianMeridians = MERIDIAN_MAP[siTianElement];
  preventiveMeridians.push(...siTianMeridians.filter(m => !preventiveMeridians.includes(m)));

  const niComment = isTaiGuo
    ? `倪师认为${zhongYun}运太过之年，${zhongYun}行偏盛则克其所胜之脏。当泻${zhongYun}行之盛气，扶被克之脏。预防当以泻为主，不可再补。`
    : `倪师认为${zhongYun}运不及之年，${zhongYun}行偏弱则其所不胜之脏来乘。当补${zhongYun}行之不足，扶本脏之气。预防当以补为主，不可妄泻。`;

  return { proneDiseases, preventiveMeridians, niComment };
}
