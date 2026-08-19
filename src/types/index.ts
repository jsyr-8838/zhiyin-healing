// 五音疗愈 - 核心类型定义

// 五音对应关系：角徵宫商羽 -> 木火土金水 -> 肝心脾肺肾
export const WUYIN_MAP = {
  jiao: { element: 'wood', organ: 'liver', color: '#4CAF50', name: '角', emotion: '怒' },
  zhi:  { element: 'fire', organ: 'heart', color: '#F44336', name: '徵', emotion: '喜' },
  gong: { element: 'earth', organ: 'spleen', color: '#FFC107', name: '宫', emotion: '思' },
  shang:{ element: 'metal', organ: 'lung', color: '#FFFFFF', name: '商', emotion: '悲' },
  yu:   { element: 'water', organ: 'kidney', color: '#2196F3', name: '羽', emotion: '恐' },
} as const;

export type WuYinKey = keyof typeof WUYIN_MAP;
export type WuXingElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export interface WuYinProfile {
  dominant: WuYinKey;
  scores: Record<WuYinKey, number>;
  recommendation: string;
  organFocus: string;
  emotionTendency: string;
}

export interface TestQuestion {
  id: number;
  audioKey: WuYinKey;
  question: string;
  description: string;
}

export interface TestAnswer {
  questionId: number;
  audioKey: WuYinKey;
  score: number; // 1-5
}

export interface HealingSession {
  id: string;
  title: string;
  wuyin: WuYinKey;
  duration: number; // minutes
  description: string;
  frequency: string;
  benefits: string[];
  isPremium: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface UserProfile {
  nickname: string;
  avatar: string;
  vipLevel: 'free' | 'pro';
  joinDate: string;
  testHistory: WuYinProfile[];
  streakDays: number;
  // 体验者注册字段
  name?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  role?: 'visitor' | 'registered' | 'admin';
  isRegistered?: boolean;
}

export interface HealthRecord {
  date: string;
  mood: number; // 1-5
  sleepHours: number;
  sessionsCompleted: number;
  dominantEmotion: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  period: string;
  features: string[];
  highlighted: boolean;
  vipLevel: 'free' | 'pro';
}

// ============================================================
// TCM 数据库类型定义
// ============================================================

// --- 方剂数据库 (formulas_database.json) ---

/** 方剂药物组成项 */
export interface FormulaIngredient {
  name: string;
  dosage: number;
  unit: string;
}

/** 方剂记录 */
export interface TcmFormula {
  id: string;
  name: string;
  source: string;
  original_text: string;
  ingredients: FormulaIngredient[];
  preparation: string;
  indications: string;
  syndrome_differentiation: string;
  ni_comment: string;
  contraindications: string;
  related_meridians: string[];
  related_acupoints: string[];
}

// --- 中药数据库 (herbs_database.json) ---

/** 中药记录 */
export interface TcmHerb {
  id: string;
  name: string;
  pinyin: string;
  category: string;
  nature: string;
  flavor: string;
  meridian_tropism: string;
  effects: string;
  indications: string;
  dosage: string;
  contraindications: string;
  ni_comment: string;
  classic_formulas: string[];
  related_acupoints: string[];
}

// --- 知识图谱 (knowledge_graph.json) ---

/** 知识图谱节点类型枚举 */
export type KnowledgeGraphNodeType =
  | 'symptom'
  | 'syndrome'
  | 'six_meridian'
  | 'herb'
  | 'meridian'
  | 'acupoint'
  | 'dong_acupoint'
  | 'classic_text'
  | 'ni_comment'
  | 'formula'
  | 'shennong_classic';

/** 知识图谱节点基类 */
export interface KnowledgeGraphNodeBase {
  id: string;
  name: string;
  type: KnowledgeGraphNodeType;
}

/** 症状节点 */
export interface SymptomNode extends KnowledgeGraphNodeBase {
  type: 'symptom';
  description: string;
  category: string;
}

/** 证候节点 */
export interface SyndromeNode extends KnowledgeGraphNodeBase {
  type: 'syndrome';
  description: string;
  six_meridian: string | null;
}

/** 六经节点 */
export interface SixMeridianNode extends KnowledgeGraphNodeBase {
  type: 'six_meridian';
  description: string;
  english_name: string;
}

/** 中药节点（知识图谱版） */
export interface HerbNode extends KnowledgeGraphNodeBase {
  type: 'herb';
  properties: string;
  meridians: string[];
}

/** 经络节点 */
export interface MeridianNode extends KnowledgeGraphNodeBase {
  type: 'meridian';
  pinyin: string;
  english: string;
  code: string;
}

/** 腧穴节点 */
export interface AcupointNode extends KnowledgeGraphNodeBase {
  type: 'acupoint';
  code: string;
  location: string;
  functions: string;
}

/** 董氏奇穴节点 */
export interface DongAcupointNode extends KnowledgeGraphNodeBase {
  type: 'dong_acupoint';
  location: string;
  functions: string;
}

/** 经典文献节点 */
export interface ClassicTextNode extends KnowledgeGraphNodeBase {
  type: 'classic_text';
  author: string;
  dynasty: string;
  description: string;
}

/** 倪师注释节点 */
export interface NiCommentNode extends KnowledgeGraphNodeBase {
  type: 'ni_comment';
  formula_id: string | null;
  key_point: string;
}

/** 方剂节点（知识图谱版） */
export interface FormulaNode extends KnowledgeGraphNodeBase {
  type: 'formula';
  description: string;
  source: string;
  ingredients: string;
  indications: string;
}

/** 神农本草经典节点 */
export interface ShennongClassicNode extends KnowledgeGraphNodeBase {
  type: 'shennong_classic';
  description: string;
}

/** 知识图谱节点联合类型 */
export type KnowledgeGraphNode =
  | SymptomNode
  | SyndromeNode
  | SixMeridianNode
  | HerbNode
  | MeridianNode
  | AcupointNode
  | DongAcupointNode
  | ClassicTextNode
  | NiCommentNode
  | FormulaNode
  | ShennongClassicNode;

/** 知识图谱边类型 */
export type KnowledgeGraphEdgeType = 'causes' | 'belongs_to' | 'treats';

/** 知识图谱边 */
export interface KnowledgeGraphEdge {
  source: string;
  target: string;
  type: KnowledgeGraphEdgeType;
  weight: number;
}

/** 知识图谱完整结构 */
export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

// --- 辨证逻辑 (syndrome_logic.json) ---

/** 舌脉信息 */
export interface TonguePulse {
  tongue: string;
  pulse: string;
}

/** 六经证候 */
export interface SixMeridianSyndrome {
  name: string;
  english_name: string;
  description: string;
  key_symptoms: string[];
  tongue_pulse: TonguePulse;
  classic_formulas: string[];
  key_acupoints: string[];
  ni_comment: string;
}

/** 十问歌症状项 */
export interface TenQuestionSymptom {
  name: string;
  value: string;
  related_syndromes: string[];
  related_formulas: string[];
  related_acupoints: string[];
}

/** 十问歌分类 */
export interface TenQuestion {
  category: string;
  description: string;
  symptoms: TenQuestionSymptom[];
}

/** 症状-证候映射规则 */
export interface SymptomSyndromeMapping {
  symptom: string;
  syndromes: string[];
  rules: string;
  key_discriminators: string;
  formulas: string[];
}

/** 辨证逻辑完整结构 */
export interface SyndromeLogic {
  six_meridian_syndromes: SixMeridianSyndrome[];
  ten_questions: TenQuestion[];
  symptom_syndrome_mapping: SymptomSyndromeMapping[];
}
