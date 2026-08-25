// ============================================================
// 中医修真 · TCM Quest Ultra — 数据类型定义
// ============================================================

/** 题目科目分类 */
export type QuizTag =
  | '中医思维' | '阴阳' | '五行' | '藏象' | '气血津液'
  | '经络' | '病因' | '四诊' | '辨证' | '中药'
  | '方剂' | '针灸' | '温病' | '经典';

/** 题目难度等级 */
export type QuizDifficulty = '初级' | '中级' | '高级' | '专家';

/** 题库条目 */
export interface QuizItem {
  id: string;
  tag: QuizTag;
  q: string;
  o: [string, string, string, string];
  a: number; // 正确答案索引 0-3
  e: string; // 解析
  xp: number; // 经验值
  diff: QuizDifficulty;
}

/** 中药分类 */
export type HerbCategory =
  | '解表' | '清热' | '泻下' | '祛风湿' | '化湿'
  | '利水' | '温里' | '理气' | '消食' | '止血'
  | '活血' | '化痰' | '安神' | '平肝' | '开窍'
  | '补虚' | '收涩' | '驱虫' | '外用';

/** 中药卡片 */
export interface HerbItem {
  name: string;
  cat: HerbCategory;
  temp: string;   // 性：寒/凉/平/温/热/大寒/大热/微寒/微温
  taste: string;   // 味：辛/苦/甘/酸/咸/淡/涩
  channel: string; // 归经：如"肺·膀胱"
  effect: string;  // 功效
  use: string;     // 主治应用
  caution: string; // 禁忌
  poem: string;    // 记忆口诀
}

/** 方剂分类 */
export type FormulaCategory =
  | '辛温解表' | '辛凉解表' | '寒下' | '润下' | '和解少阳'
  | '调和肝脾' | '清热泻火' | '清热凉血' | '清热燥湿' | '清热祛湿'
  | '温中祛寒' | '回阳救逆' | '补气' | '补血' | '补阴'
  | '补阳' | '补气养血' | '补气固表' | '补气养阴' | '补血复脉'
  | '补阴降火' | '活血化瘀' | '温经活血' | '降气平喘' | '宣肺平喘'
  | '燥湿化痰' | '清热化痰' | '止咳化痰' | '温化痰饮' | '行气解郁'
  | '温阳利水' | '利水渗湿' | '平肝息风' | '安神' | '养心安神'
  | '开窍' | '消食和胃' | '祛风湿' | '固涩';

/** 方剂卡片 */
export interface FormulaItem {
  name: string;
  cat: FormulaCategory;
  comp: string;   // 组成
  func: string;   // 功效
  ind: string;    // 主治
  note: string;   // 备注
  mem: string;    // 记忆口诀
}

/** 医案难度 */
export type CaseDifficulty = '初级' | '中级' | '高级' | '专家';

/** 医案卡片 */
export interface CaseItem {
  title: string;
  diff: CaseDifficulty;
  text: string;     // 病例描述
  syms: string[];   // 症状列表
  opts: string[];   // 辨证选项
  a: number;        // 正确答案索引
  e: string;        // 解析
  points: string[]; // 学习要点
}

/** 师承任务 */
export interface MissionItem {
  id: string;
  title: string;
  desc: string;
  icon: string;
  xp: number;
  coin: number;
  type: 'quiz' | 'herb' | 'formula' | 'case' | 'streak' | 'special';
  target: number;  // 目标数量
  reward: string;  // 奖励描述
}

/** 排行榜条目 */
export interface RankItem {
  name: string;
  level: number;
  xp: number;
  coin: number;
  streak: number;
  title: string;
}

/** SM-2 间隔重复条目 */
export interface SRItem {
  quizId: string;
  ef: number;       // 易度因子 (Ease Factor)
  interval: number;  // 间隔天数
  reps: number;      // 重复次数
  nextDate: string;  // 下次复习日期 ISO
  lastDate: string;  // 上次复习日期 ISO
  history: { date: string; grade: number }[];
}

/** 学习统计数据 */
export interface TCMQuestStats {
  level: number;
  xp: number;
  coin: number;
  streak: number;
  lastStudyDate: string;
  totalAnswered: number;
  totalCorrect: number;
  herbsViewed: string[];
  formulasViewed: string[];
  casesSolved: number;
  bossDefeated: number;
  missionsCompleted: string[];
  wrongAnswers: string[];   // 错题ID列表
  srData: Record<string, SRItem>; // 间隔重复数据
}

/** 等级定义 */
export interface LevelDef {
  level: number;
  title: string;
  minXp: number;
  icon: string;
}

/** Boss定义 */
export interface BossDef {
  id: string;
  name: string;
  hp: number;
  atk: number;
  desc: string;
  quizTags: QuizTag[];
  rewardXp: number;
  rewardCoin: number;
  icon: string;
}

/** 成就定义 */
export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  condition: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}
