import type { LevelDef, MissionItem, BossDef, AchievementDef, RankItem } from './types';

// ============================================================
// 等级体系 — 30 级，从"初入杏林"到"国医大宗师"
// ============================================================
export const LEVELS: LevelDef[] = [
  { level: 1,  title: '初入杏林',    minXp: 0,     icon: '🌱' },
  { level: 2,  title: '蒙学初识',    minXp: 80,    icon: '📖' },
  { level: 3,  title: '药苗破土',    minXp: 200,   icon: '🌿' },
  { level: 4,  title: '经络入门',    minXp: 400,   icon: ' chi;' },
  { level: 5,  title: '辨证初试',    minXp: 700,   icon: '🔍' },
  { level: 6,  title: '方药启蒙',    minXp: 1100,  icon: '📜' },
  { level: 7,  title: '汤头初通',    minXp: 1600,  icon: '⚗️' },
  { level: 8,  title: '针法入门',    minXp: 2200,  icon: '📌' },
  { level: 9,  title: '脉理初通',    minXp: 3000,  icon: '🩺' },
  { level: 10, title: '杏林新秀',    minXp: 4000,  icon: '🌳' },
  { level: 11, title: '辨证有方',    minXp: 5200,  icon: '⚖️' },
  { level: 12, title: '经方在握',    minXp: 6600,  icon: '📚' },
  { level: 13, title: '药性娴熟',    minXp: 8200,  icon: '🍃' },
  { level: 14, title: '妙手回春',    minXp: 10000, icon: '✨' },
  { level: 15, title: '杏林小医',    minXp: 12000, icon: '🏥' },
  { level: 16, title: '辨证施治',    minXp: 14500, icon: '🎯' },
  { level: 17, title: '方证对应',    minXp: 17500, icon: '🔗' },
  { level: 18, title: '脉法精进',    minXp: 21000, icon: '脉搏' },
  { level: 19, title: '针灸行家',    minXp: 25000, icon: '刺' },
  { level: 20, title: '温病通晓',    minXp: 29500, icon: '🔥' },
  { level: 21, title: '经典熟读',    minXp: 34500, icon: '📖' },
  { level: 22, title: '杏林名医',    minXp: 40000, icon: '👨‍⚕️' },
  { level: 23, title: '辨证如神',    minXp: 46000, icon: '⚡' },
  { level: 24, title: '方剂大家',    minXp: 52500, icon: '🏆' },
  { level: 25, title: '针灸大师',    minXp: 59500, icon: '针刺' },
  { level: 26, title: '本草宗师',    minXp: 67000, icon: '🌿' },
  { level: 27, title: '杏林泰斗',    minXp: 75000, icon: '🏔️' },
  { level: 28, title: '医道通玄',    minXp: 84000, icon: '☯️' },
  { level: 29, title: '一代宗师',    minXp: 94000, icon: '👑' },
  { level: 30, title: '国医大宗师',  minXp: 105000,icon: '🏆' },
];

// ============================================================
// 师承任务线 — 40 个任务，从入门到精通
// ============================================================
export const MISSIONS: MissionItem[] = [
  // 第一章：入门篇
  { id: 'm01', title: '初入师门',       desc: '完成 10 道中医思维题',       icon: '🏯', xp: 100, coin: 50,  type: 'quiz',   target: 10,  reward: '解锁阴阳篇章' },
  { id: 'm02', title: '阴阳入门',       desc: '完成 15 道阴阳题目',         icon: '☯️', xp: 150, coin: 80,  type: 'quiz',   target: 15,  reward: '解锁五行篇章' },
  { id: 'm03', title: '五行初通',       desc: '完成 20 道五行题目',         icon: '🌳', xp: 200, coin: 100, type: 'quiz',   target: 20,  reward: '解锁藏象篇章' },
  { id: 'm04', title: '脏腑探秘',       desc: '完成 30 道藏象题目',         icon: '🫀', xp: 300, coin: 150, type: 'quiz',   target: 30,  reward: '解锁气血津液篇章' },
  { id: 'm05', title: '气血津液',       desc: '完成 25 道气血津液题目',     icon: '💧', xp: 250, coin: 120, type: 'quiz',   target: 25,  reward: '解锁经络篇章' },
  { id: 'm06', title: '经络初探',       desc: '完成 20 道经络题目',         icon: '📍', xp: 250, coin: 120, type: 'quiz',   target: 20,  reward: '解锁病因篇章' },
  { id: 'm07', title: '明辨病因',       desc: '完成 25 道病因题目',         icon: '🦠', xp: 250, coin: 120, type: 'quiz',   target: 25,  reward: '解锁四诊篇章' },
  { id: 'm08', title: '四诊合参',       desc: '完成 30 道四诊题目',         icon: '👁️', xp: 300, coin: 150, type: 'quiz',   target: 30,  reward: '解锁辨证篇章' },
  { id: 'm09', title: '辨证论治',       desc: '完成 35 道辨证题目',         icon: '⚖️', xp: 350, coin: 180, type: 'quiz',   target: 35,  reward: '解锁中药篇章' },
  { id: 'm10', title: '本草初识',       desc: '浏览 30 味中药卡片',         icon: '🌿', xp: 200, coin: 100, type: 'herb',   target: 30,  reward: '解锁方剂篇章' },

  // 第二章：进阶篇
  { id: 'm11', title: '方剂入门',       desc: '浏览 20 首方剂卡片',         icon: '📜', xp: 200, coin: 100, type: 'formula', target: 20,  reward: '解锁针灸篇章' },
  { id: 'm12', title: '针法初通',       desc: '完成 25 道针灸题目',         icon: '📌', xp: 250, coin: 120, type: 'quiz',   target: 25,  reward: '解锁温病篇章' },
  { id: 'm13', title: '温病探微',       desc: '完成 20 道温病题目',         icon: '🔥', xp: 250, coin: 120, type: 'quiz',   target: 20,  reward: '解锁经典篇章' },
  { id: 'm14', title: '经典必读',       desc: '完成 25 道经典题目',         icon: '📖', xp: 250, coin: 120, type: 'quiz',   target: 25,  reward: '解锁医案挑战' },
  { id: 'm15', title: '医案初探',       desc: '解开 10 个医案',             icon: '🩺', xp: 300, coin: 150, type: 'case',   target: 10,  reward: '师门认可' },
  { id: 'm16', title: '连击七日',       desc: '连续学习 7 天',              icon: '🔥', xp: 500, coin: 300, type: 'streak', target: 7,   reward: '获得"坚持"徽章' },
  { id: 'm17', title: '百题斩',         desc: '累计答对 100 道题',          icon: '⚔️', xp: 500, coin: 300, type: 'quiz',   target: 100, reward: '获得"百题斩"称号' },
  { id: 'm18', title: '草药师',         desc: '浏览 100 味中药卡片',        icon: '🍃', xp: 500, coin: 300, type: 'herb',   target: 100, reward: '获得"草药师"称号' },
  { id: 'm19', title: '方剂师',         desc: '浏览 100 首方剂卡片',        icon: '📚', xp: 500, coin: 300, type: 'formula', target: 100, reward: '获得"方剂师"称号' },
  { id: 'm20', title: '医案高手',       desc: '解开 30 个医案',             icon: '🏆', xp: 600, coin: 400, type: 'case',   target: 30,  reward: '获得"医案高手"称号' },

  // 第三章：精通篇
  { id: 'm21', title: '五百题宗',       desc: '累计答对 500 道题',          icon: '💪', xp: 1000,coin: 500, type: 'quiz',   target: 500, reward: '获得"五百题宗"称号' },
  { id: 'm22', title: '药典通读',       desc: '浏览 300 味中药卡片',        icon: '📖', xp: 800, coin: 400, type: 'herb',   target: 300, reward: '获得"药典通读"称号' },
  { id: 'm23', title: '方剂大全',       desc: '浏览全部 200 首方剂',        icon: '📜', xp: 800, coin: 400, type: 'formula', target: 200, reward: '获得"方剂大全"称号' },
  { id: 'm24', title: '医案圣手',       desc: '解开 50 个医案',             icon: '🩺', xp: 800, coin: 400, type: 'case',   target: 50,  reward: '获得"医案圣手"称号' },
  { id: 'm25', title: '千题大关',       desc: '累计答对 1000 道题',         icon: '⚡', xp: 1500,coin: 800, type: 'quiz',   target: 1000,reward: '解锁精英挑战' },
  { id: 'm26', title: '千题无错',       desc: '连续答对 50 道不犯错',       icon: '💯', xp: 1000,coin: 500, type: 'special',target: 50,  reward: '获得"满分"徽章' },
  { id: 'm27', title: '本草全鉴',       desc: '浏览全部 500 味中药',        icon: '🌿', xp: 1200,coin: 600, type: 'herb',   target: 500, reward: '获得"本草全鉴"称号' },
  { id: 'm28', title: '医案宗师',       desc: '解开 80 个医案',             icon: '🏆', xp: 1200,coin: 600, type: 'case',   target: 80,  reward: '获得"医案宗师"称号' },
  { id: 'm29', title: '三十日不断',     desc: '连续学习 30 天',             icon: '📅', xp: 2000,coin: 1000,type: 'streak', target: 30,  reward: '获得"恒心"徽章' },
  { id: 'm30', title: 'AI辨证初通',     desc: '完成 10 次 AI 辨证',         icon: '🤖', xp: 500, coin: 300, type: 'special',target: 10,  reward: '获得"AI辨证"徽章' },

  // 第四章：宗师篇
  { id: 'm31', title: '三千题通关',     desc: '累计答对 2000 道题',         icon: '👑', xp: 3000,coin: 1500,type: 'quiz',   target: 2000,reward: '获得"三千题宗"称号' },
  { id: 'm32', title: '复习达人',       desc: '完成 100 次间隔复习',       icon: '🧠', xp: 1000,coin: 500, type: 'special',target: 100, reward: '获得"复习达人"称号' },
  { id: 'm33', title: '医案百解',       desc: '解开全部 100 个医案',        icon: '🩺', xp: 2000,coin: 1000,type: 'case',   target: 100, reward: '获得"医案百解"称号' },
  { id: 'm34', title: '百炼成钢',       desc: '完成 50 次闯关',             icon: '⚔️', xp: 1500,coin: 800, type: 'special',target: 50,  reward: '获得"百炼"徽章' },
  { id: 'm35', title: 'Boss终结者',     desc: '击败全部 Boss',             icon: '👹', xp: 2000,coin: 1000,type: 'special',target: 9,   reward: '获得"终结者"称号' },
  { id: 'm36', title: '百日不辍',       desc: '连续学习 100 天',            icon: '💎', xp: 5000,coin: 2500,type: 'streak', target: 100, reward: '获得"百日恒心"称号' },
  { id: 'm37', title: '三千题满',       desc: '累计答对 3000 道题',         icon: '🌟', xp: 5000,coin: 2500,type: 'quiz',   target: 3000,reward: '获得"三千题满"称号' },
  { id: 'm38', title: '全科精通',       desc: '所有科目各答对 100 题',     icon: '🎓', xp: 5000,coin: 2500,type: 'special',target: 14,  reward: '获得"全科精通"称号' },
  { id: 'm39', title: '完美复习',       desc: '间隔复习中连续 50 个 Easy',  icon: '✨', xp: 2000,coin: 1000,type: 'special',target: 50,  reward: '获得"完美"徽章' },
  { id: 'm40', title: '国医大宗师',     desc: '达到 30 级',                icon: '🏆', xp: 10000,coin: 5000,type: 'special',target: 30,  reward: '获得"国医大宗师"称号' },
];

// ============================================================
// Boss 挑战 — 9 个 Boss，对应中医学习阶段
// ============================================================
export const BOSSES: BossDef[] = [
  { id: 'b01', name: '阴阳幻魔',   hp: 300,  atk: 30,  desc: '掌控阴阳二气，混淆虚实真假', quizTags: ['阴阳','中医思维'],           rewardXp: 500,  rewardCoin: 300,  icon: '☯️' },
  { id: 'b02', name: '五行邪灵',   hp: 500,  atk: 40,  desc: '扰乱五行生克，逆天而行',     quizTags: ['五行','藏象'],               rewardXp: 800,  rewardCoin: 500,  icon: '🌳' },
  { id: 'b03', name: '气血瘀兽',   hp: 800,  atk: 55,  desc: '阻滞气血运行，痰瘀互结',     quizTags: ['气血津液','经络'],           rewardXp: 1200, rewardCoin: 800,  icon: '🩸' },
  { id: 'b04', name: '百病毒蛟',   hp: 1200, atk: 70,  desc: '六淫七情化毒，百病丛生',     quizTags: ['病因','四诊'],               rewardXp: 1800, rewardCoin: 1200, icon: '🦠' },
  { id: 'b05', name: '辨证魔君',   hp: 1800, atk: 90,  desc: '真寒假热乱人目，虚实真假惑人心', quizTags: ['辨证','四诊'],         rewardXp: 2500, rewardCoin: 1800, icon: '👹' },
  { id: 'b06', name: '药毒蟾王',   hp: 2500, atk: 110, desc: '十八反十九畏，毒药乱配',     quizTags: ['中药'],                       rewardXp: 3500, rewardCoin: 2500, icon: '🐸' },
  { id: 'b07', name: '方剂魔王',   hp: 3500, atk: 130, desc: '君臣佐使混乱，方剂失序',     quizTags: ['方剂','中药'],               rewardXp: 5000, rewardCoin: 3500, icon: '📜' },
  { id: 'b08', name: '温疫天魔',   hp: 5000, atk: 150, desc: '卫气营血逆行，温疫横行',     quizTags: ['温病','经典'],               rewardXp: 7000, rewardCoin: 5000, icon: '🔥' },
  { id: 'b09', name: '医道终试',   hp: 8000, atk: 180, desc: '全科终极考验，通者为宗师',   quizTags: ['中医思维','阴阳','五行','藏象','气血津液','经络','病因','四诊','辨证','中药','方剂','针灸','温病','经典'], rewardXp: 10000, rewardCoin: 8000, icon: '👑' },
];

// ============================================================
// 成就系统 — 20 个成就
// ============================================================
export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'a01', name: '初出茅庐',   desc: '完成第一次答题',           icon: '🌱', condition: 'totalAnswered>=1',     tier: 'bronze' },
  { id: 'a02', name: '答题百题',   desc: '累计答对 100 道题',        icon: '⚔️', condition: 'totalCorrect>=100',   tier: 'silver' },
  { id: 'a03', name: '答题千题',   desc: '累计答对 1000 道题',       icon: '⚡', condition: 'totalCorrect>=1000',  tier: 'gold' },
  { id: 'a04', name: '答题三千',   desc: '累计答对 3000 道题',       icon: '🌟', condition: 'totalCorrect>=3000',  tier: 'platinum' },
  { id: 'a05', name: '百草辨识',   desc: '浏览 100 味中药',          icon: '🌿', condition: 'herbsViewed>=100',   tier: 'silver' },
  { id: 'a06', name: '药典通读',   desc: '浏览全部 500 味中药',      icon: '📖', condition: 'herbsViewed>=500',   tier: 'platinum' },
  { id: 'a07', name: '方剂入门',   desc: '浏览 50 首方剂',          icon: '📜', condition: 'formulasViewed>=50', tier: 'silver' },
  { id: 'a08', name: '方剂大全',   desc: '浏览全部 200 首方剂',      icon: '📚', condition: 'formulasViewed>=200',tier: 'gold' },
  { id: 'a09', name: '医案初解',   desc: '解开 10 个医案',           icon: '🩺', condition: 'casesSolved>=10',    tier: 'silver' },
  { id: 'a10', name: '医案百解',   desc: '解开全部 100 个医案',      icon: '🏆', condition: 'casesSolved>=100',   tier: 'platinum' },
  { id: 'a11', name: '连击七日',   desc: '连续学习 7 天',            icon: '🔥', condition: 'streak>=7',         tier: 'silver' },
  { id: 'a12', name: '三十日不断', desc: '连续学习 30 天',           icon: '💎', condition: 'streak>=30',        tier: 'gold' },
  { id: 'a13', name: '百日恒心',   desc: '连续学习 100 天',          icon: '👑', condition: 'streak>=100',       tier: 'platinum' },
  { id: 'a14', name: 'Boss终结者', desc: '击败 3 个 Boss',           icon: '👹', condition: 'bossDefeated>=3',    tier: 'silver' },
  { id: 'a15', name: 'Boss全通',   desc: '击败全部 9 个 Boss',       icon: '⚔️', condition: 'bossDefeated>=9',    tier: 'platinum' },
  { id: 'a16', name: '完美无错',   desc: '闯关中连续 30 题不犯错',   icon: '💯', condition: 'perfectStreak>=30',  tier: 'gold' },
  { id: 'a17', name: '复习达人',   desc: '完成 100 次间隔复习',     icon: '🧠', condition: 'reviewCount>=100',   tier: 'gold' },
  { id: 'a18', name: 'AI辨证师',   desc: '完成 50 次 AI 辨证',       icon: '🤖', condition: 'aiDxCount>=50',      tier: 'gold' },
  { id: 'a19', name: '师承全通',   desc: '完成全部 40 个师承任务',   icon: '🎓', condition: 'missionsCompleted>=40',tier: 'platinum' },
  { id: 'a20', name: '国医大宗师', desc: '达到 30 级',               icon: '🏆', condition: 'level>=30',          tier: 'platinum' },
];

// ============================================================
// AI 排行榜 — 模拟数据（与用户竞争）
// ============================================================
export const AI_LEADERBOARD: RankItem[] = [
  { name: '杏林圣手',  level: 30, xp: 108000, coin: 52000, streak: 156, title: '国医大宗师' },
  { name: '药王传人',  level: 28, xp: 88000,  coin: 41000, streak: 98,  title: '一代宗师' },
  { name: '小医仙',    level: 26, xp: 72000,  coin: 33000, streak: 67,  title: '本草宗师' },
  { name: '经方达人',  level: 25, xp: 62000,  coin: 28000, streak: 45,  title: '针灸大师' },
  { name: '辨证高手',  level: 23, xp: 49000,  coin: 22000, streak: 34,  title: '辨证如神' },
  { name: '汤头歌王',  level: 21, xp: 37000,  coin: 16000, streak: 23,  title: '经典熟读' },
  { name: '针推小徒',  level: 19, xp: 27000,  coin: 12000, streak: 18,  title: '针灸行家' },
  { name: '脉法新秀',  level: 17, xp: 19000,  coin: 8500,  streak: 12,  title: '方证对应' },
  { name: '药苗初长',  level: 14, xp: 11000,  coin: 5000,  streak: 8,   title: '妙手回春' },
  { name: '初学杏林',  level: 11, xp: 5500,   coin: 2400,  streak: 5,   title: '辨证有方' },
  { name: '慕名而来',  level: 8,  xp: 2500,   coin: 1100,  streak: 3,   title: '针法入门' },
  { name: '初入师门',  level: 5,  xp: 800,    coin: 350,   streak: 1,   title: '辨证初试' },
];

/** 根据经验值获取等级 */
export function getLevelByXp(xp: number): LevelDef {
  let result = LEVELS[0];
  for (const lv of LEVELS) {
    if (xp >= lv.minXp) result = lv;
    else break;
  }
  return result;
}

/** 获取升级所需经验 */
export function getXpToNext(level: number): number {
  const idx = LEVELS.findIndex(l => l.level === level);
  if (idx === -1 || idx === LEVELS.length - 1) return 0;
  return LEVELS[idx + 1].minXp - LEVELS[idx].minXp;
}

/** 获取当前等级进度百分比 */
export function getLevelProgress(xp: number): { percent: number; current: number; needed: number; level: LevelDef; nextLevel: LevelDef | null } {
  const level = getLevelByXp(xp);
  const idx = LEVELS.findIndex(l => l.level === level.level);
  const nextLevel = idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
  const current = xp - level.minXp;
  const needed = nextLevel ? nextLevel.minXp - level.minXp : 0;
  const percent = needed > 0 ? Math.min(100, (current / needed) * 100) : 100;
  return { percent, current, needed, level, nextLevel };
}

/** 科目列表 */
export const QUIZ_TAGS = [
  '中医思维', '阴阳', '五行', '藏象', '气血津液',
  '经络', '病因', '四诊', '辨证', '中药',
  '方剂', '针灸', '温病', '经典'
] as const;

/** 科目图标 */
export const TAG_ICONS: Record<string, string> = {
  '中医思维': '🧠', '阴阳': '☯️', '五行': '🌳', '藏象': '🫀', '气血津液': '💧',
  '经络': '📍', '病因': '🦠', '四诊': '👁️', '辨证': '⚖️', '中药': '🌿',
  '方剂': '📜', '针灸': '📌', '温病': '🔥', '经典': '📖',
};

/** 科目颜色 */
export const TAG_COLORS: Record<string, string> = {
  '中医思维': '#b5311c', '阴阳': '#2a1608', '五行': '#1f7a4a', '藏象': '#b5311c', '气血津液': '#1e5f8a',
  '经络': '#5e2d91', '病因': '#c9922a', '四诊': '#1a7070', '辨证': '#b5311c', '中药': '#1f7a4a',
  '方剂': '#c9922a', '针灸': '#5e2d91', '温病': '#b5311c', '经典': '#2a1608',
};

/** 中药分类颜色 */
export const HERB_CAT_COLORS: Record<string, string> = {
  '解表': '#1e5f8a', '清热': '#b5311c', '泻下': '#5e2d91', '祛风湿': '#1f7a4a', '化湿': '#c9922a',
  '利水': '#1a7070', '温里': '#b5311c', '理气': '#c9922a', '消食': '#1f7a4a', '止血': '#b5311c',
  '活血': '#5e2d91', '化痰': '#1e5f8a', '安神': '#2a1608', '平肝': '#1f7a4a', '开窍': '#5e2d91',
  '补虚': '#c9922a', '收涩': '#1a7070', '驱虫': '#b5311c', '外用': '#7a5c48',
};

/** 方剂分类颜色 */
export const FORMULA_CAT_COLORS: Record<string, string> = {
  '辛温解表': '#1e5f8a', '辛凉解表': '#1a7070', '寒下': '#5e2d91', '润下': '#c9922a',
  '和解少阳': '#1f7a4a', '调和肝脾': '#c9922a', '清热泻火': '#b5311c', '清热凉血': '#b5311c',
  '清热燥湿': '#b5311c', '清热祛湿': '#1f7a4a', '温中祛寒': '#b5311c', '回阳救逆': '#b5311c',
  '补气': '#c9922a', '补血': '#c9922a', '补阴': '#1a7070', '补阳': '#c9922a',
  '活血化瘀': '#5e2d91', '燥湿化痰': '#1e5f8a', '安神': '#2a1608', '开窍': '#5e2d91',
  '消食和胃': '#1f7a4a', '祛风湿': '#1f7a4a', '平肝息风': '#1f7a4a',
};
