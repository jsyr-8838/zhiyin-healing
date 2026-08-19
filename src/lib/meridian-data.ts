// meridian-data.ts — TCM 3D Meridian/Acupoint Data Foundation
// 基于《灵枢·骨度》骨度分寸法 as the ONLY quantifiable positioning standard
// All cunX = lateral offset from midline (left+, right-)
// All cunY = vertical height from sole (0 = ground, 75 = vertex)

// ============================================================
// TYPES
// ============================================================

export type Side = 'left' | 'right' | 'midline';
export type WuxingElement = '金' | '水' | '木' | '火' | '土';

export interface BoneMeasurement {
  segment: string;
  segmentEn: string;
  cun: number;
  source: string;
}

export interface Acupoint {
  code: string;
  name: string;
  cunX: number;
  cunY: number;
  cunZ: number;
  side: Side;
  isJingWell: boolean;
  isYuan: boolean;
  isLuo: boolean;
  isXi: boolean;
  isMu: boolean;
  intersections: string[];
  classicRef: string;
  location: string;       // 定位描述 (如: "在肘横纹中，肱二头肌腱桡侧")
  indications: string;    // 主治 (如: "咳嗽，气喘，咯血，咽喉肿痛")
  method: string;         // 取穴方法 (如: "手掌向上，肘部稍微弯曲...")
  specialPoint: string;   // 特定穴类别 (如: "合穴", "输穴，原穴，八会穴（脉会）")
  // ── TCM 增强字段 (倪海厦体系) ──
  niComment?: string;          // 倪师注释 (如: "肺之募穴，治肺病要穴")
  needlingMethod?: string;     // 针刺方法 (如: "向外斜刺0.5～0.8寸")
  contraindications?: string;  // 禁忌 (如: "不可深刺，避免气胸")
  position3d?: { x: number; y: number; z: number }; // TCM 3D坐标 (OBJ模型空间)
}

export interface PathWaypoint {
  cunX: number;
  cunY: number;
  side: Side;
  cunZ: number;
}

export interface Meridian {
  code: string;
  name: string;
  nameEn: string;
  wuxing: WuxingElement;
  organ: string;
  color: string;
  points: Acupoint[];
  pathCun: PathWaypoint[];
}

// ============================================================
// BONE MEASUREMENT — 骨度分寸法标准 (灵枢·骨度)
// ============================================================

export const BONE_MEASUREMENT: BoneMeasurement[] = [
  { segment: '前发际→后发际', segmentEn: 'Front hairline→Occipital protuberance', cun: 12, source: '灵枢·骨度' },
  { segment: '眉心→前发际', segmentEn: 'Glabella→Front hairline', cun: 3, source: '灵枢·骨度' },
  { segment: '后发际→大椎', segmentEn: 'Occipital hairline→C7', cun: 2.5, source: '灵枢·骨度' },
  { segment: '两完骨之间', segmentEn: 'Between two mastoid processes', cun: 9, source: '灵枢·骨度' },
  { segment: '天突→歧骨', segmentEn: 'Sternal notch→Xiphoid process', cun: 9, source: '灵枢·骨度' },
  { segment: '歧骨→脐中', segmentEn: 'Xiphoid→Umbilicus', cun: 8, source: '灵枢·骨度' },
  { segment: '脐中→横骨上廉', segmentEn: 'Umbilicus→Pubic symphysis', cun: 5, source: '灵枢·骨度' },
  { segment: '两乳头之间', segmentEn: 'Between two nipples', cun: 8, source: '灵枢·骨度' },
  { segment: '肩→肘', segmentEn: 'Shoulder→Elbow', cun: 17, source: '灵枢·骨度' },
  { segment: '肘→腕', segmentEn: 'Elbow→Wrist', cun: 12.5, source: '灵枢·骨度' },
  { segment: '腕→中指尖', segmentEn: 'Wrist→Middle fingertip', cun: 8, source: '灵枢·骨度' },
  { segment: '髀枢→膝中', segmentEn: 'Greater trochanter→Knee center', cun: 19, source: '灵枢·骨度' },
  { segment: '膝中→外踝', segmentEn: 'Knee→Lateral malleolus', cun: 16, source: '灵枢·骨度' },
  { segment: '外踝→地', segmentEn: 'Lateral malleolus→Ground', cun: 3, source: '灵枢·骨度' },
  { segment: '内踝→地', segmentEn: 'Medial malleolus→Ground', cun: 3, source: '灵枢·骨度' },
  { segment: '大椎以下至尾骶', segmentEn: 'C7→Coccyx (21 vertebrae)', cun: 30, source: '灵枢·骨度' },
  { segment: '结喉以下至缺盆中', segmentEn: 'Adam\'s apple→Supraclavicular fossa', cun: 4, source: '灵枢·骨度' },
  { segment: '发以下至颐', segmentEn: 'Front hairline→Chin', cun: 12, source: '灵枢·骨度' },
  { segment: '两颧之间', segmentEn: 'Between two zygomatic arches', cun: 7, source: '灵枢·骨度' },
  { segment: '耳前当耳门', segmentEn: 'Width of ear gate area', cun: 3, source: '灵枢·骨度' },
  { segment: '头之大骨围', segmentEn: 'Head circumference', cun: 26, source: '灵枢·骨度' },
  { segment: '胸围', segmentEn: 'Chest circumference', cun: 45, source: '灵枢·骨度' },
  { segment: '腰围', segmentEn: 'Waist circumference', cun: 42, source: '灵枢·骨度' },
  { segment: '两髀之间', segmentEn: 'Between two anterior superior iliac spines', cun: 6.5, source: '灵枢·骨度' },
  { segment: '足长', segmentEn: 'Foot length', cun: 12, source: '灵枢·骨度' },
  { segment: '足广', segmentEn: 'Foot width', cun: 4.5, source: '灵枢·骨度' },
  { segment: '横骨长', segmentEn: 'Pubic bone width', cun: 6.5, source: '灵枢·骨度' },
  { segment: '天枢以下至横骨', segmentEn: 'Umbilicus level→Pubic bone (abdominal)', cun: 6.5, source: '灵枢·骨度' },
];

// ============================================================
// WUXING MAP — 五行经络映射
// ============================================================

export const WUXING_MAP: Record<WuxingElement, { meridians: string[]; color: string; nameEn: string }> = {
  '金': { meridians: ['LU', 'LI'], color: '#F5E6CC', nameEn: 'Metal' },
  '水': { meridians: ['KI', 'BL'], color: '#1A1A2E', nameEn: 'Water' },
  '木': { meridians: ['LR', 'GB'], color: '#2D5016', nameEn: 'Wood' },
  '火': { meridians: ['HT', 'SI', 'PC', 'TE'], color: '#8B1A1A', nameEn: 'Fire' },
  '土': { meridians: ['SP', 'ST'], color: '#8B7355', nameEn: 'Earth' },
};

// ============================================================
// CUN → 3D CONVERSION  — 分段映射，基于BodyParts3D模型实测
// ============================================================
// 模型实测关键地标（scale=0.1, rotX=-π/2）:
//   跟骨 Y=-3.75,  外踝 Y≈2.7,  膝 Y≈36.5,  脐 Y≈98.8
//   歧骨 Y≈113.7,  天突 Y≈132.9,  C1 Y≈147.1,  额骨 Y≈156.4
//   胸骨 X=0 Z=20.6(前面),  骶骨 X=0 Z=2.9(后面)

// 分段映射表：cunY(骨度分寸) → modelY(3D世界坐标)
// 每个分段用线性插值，避免全局线性映射的巨大偏差
const CUN_Y_SEGMENTS: Array<{ cunFrom: number; cunTo: number; modelFrom: number; modelTo: number }> = [
  // 足部: cunY 0→3 → model Y -3.75→2.7
  { cunFrom: 0, cunTo: 3, modelFrom: -3.75, modelTo: 2.7 },
  // 小腿: cunY 3→19 → model Y 2.7→36.5 (踝3寸→膝19寸,胫骨范围)
  { cunFrom: 3, cunTo: 19, modelFrom: 2.7, modelTo: 36.5 },
  // 大腿: cunY 19→48 → model Y 36.5→98.8 (膝→脐水平/骨盆)
  { cunFrom: 19, cunTo: 48, modelFrom: 36.5, modelTo: 98.8 },
  // 腹部: cunY 48→55 → model Y 98.8→113.7 (脐→歧骨)
  { cunFrom: 48, cunTo: 55, modelFrom: 98.8, modelTo: 113.7 },
  // 胸部: cunY 55→64 → model Y 113.7→132.9 (歧骨→天突)
  { cunFrom: 55, cunTo: 64, modelFrom: 113.7, modelTo: 132.9 },
  // 颈部: cunY 64→69 → model Y 132.9→143.6 (天突→下巴)
  { cunFrom: 64, cunTo: 69, modelFrom: 132.9, modelTo: 143.6 },
  // 头部: cunY 69→82 → model Y 143.6→156.4 (下巴→头顶)
  { cunFrom: 69, cunTo: 82, modelFrom: 143.6, modelTo: 156.4 },
];

// ============================================================
// ARM MAPPING — 椭圆体表投影模型 (经络贴附皮肤表面)
// ============================================================
// 核心思路：将手臂截面视为椭圆，cunX/cunZ 共同决定穴位在椭圆表面上的位置
// 模型坐标系: X=横向(左+), Y=纵向(上+), Z=前后(前+)
//   cunX > 0 → 桡侧(外侧) → 椭圆右侧 → X增大
//   cunZ < 0 → 屈侧(前面) → 椭圆上部 → Z增大
//   cunZ > 0 → 伸侧(后面) → 椭圆下部 → Z减小
//
// 基于 BodyParts3D 骨骼顶点实测 + 1.5单位皮肤/肌肉厚度
// 实测: 肱骨centerX=19, halfW≈5; 桡骨centerX=25, halfW≈3
//       肱骨centerZ≈7.6, halfD≈2.5; 桡骨centerZ≈9.4, halfD≈3.3

// 手经编号集合
const ARM_MERIDIANS = new Set(['LU', 'LI', 'HT', 'SI', 'PC', 'TE']);

// 判断是否为手臂穴位
export function isArmPoint(meridianCode: string, cunY: number): boolean {
  return ARM_MERIDIANS.has(meridianCode) && cunY >= 19 && cunY <= 63;
}

// ──────────────────────────────────────────────────────────
// Y轴：体表cunY → 模型Y (沿手臂纵向高度)
// ──────────────────────────────────────────────────────────
const ARM_BODY_Y_SEGMENTS: Array<{ cunFrom: number; cunTo: number; modelFrom: number; modelTo: number }> = [
  { cunFrom: 19, cunTo: 28, modelFrom: 66.2, modelTo: 73.0 },
  { cunFrom: 28, cunTo: 34.5, modelFrom: 73.0, modelTo: 80.6 },
  { cunFrom: 34.5, cunTo: 47, modelFrom: 80.6, modelTo: 102.9 },
  { cunFrom: 47, cunTo: 54, modelFrom: 102.9, modelTo: 120.0 },
  { cunFrom: 54, cunTo: 60, modelFrom: 120.0, modelTo: 133.7 },
  { cunFrom: 60, cunTo: 63, modelFrom: 133.7, modelTo: 130.8 },
];

// ──────────────────────────────────────────────────────────
// 手臂截面椭圆中心 X (模型坐标, 左侧正值)
// 指尖→腕: 朝外侧延伸; 腕→肘→肩: 逐渐收回
// ──────────────────────────────────────────────────────────
const ARM_CENTER_X_SEGMENTS: Array<{ cunFrom: number; cunTo: number; modelFrom: number; modelTo: number }> = [
  { cunFrom: 19, cunTo: 28, modelFrom: 30.0, modelTo: 27.5 },
  { cunFrom: 28, cunTo: 34.5, modelFrom: 27.5, modelTo: 24.5 },
  { cunFrom: 34.5, cunTo: 47, modelFrom: 24.5, modelTo: 19.5 },
  { cunFrom: 47, cunTo: 54, modelFrom: 19.5, modelTo: 17.5 },
  { cunFrom: 54, cunTo: 60, modelFrom: 17.5, modelTo: 14.0 },
  { cunFrom: 60, cunTo: 63, modelFrom: 14.0, modelTo: 6.0 },       // 肩→体壁收敛
];

// ──────────────────────────────────────────────────────────
// 手臂截面椭圆中心 Z (模型坐标, 前面+)
// 手臂偏前外方, 从肘到指尖Z逐渐增大(手伸向前方)
// ──────────────────────────────────────────────────────────
const ARM_CENTER_Z_SEGMENTS: Array<{ cunFrom: number; cunTo: number; modelFrom: number; modelTo: number }> = [
  { cunFrom: 19, cunTo: 28, modelFrom: 17.0, modelTo: 14.0 },
  { cunFrom: 28, cunTo: 34.5, modelFrom: 14.0, modelTo: 10.0 },
  { cunFrom: 34.5, cunTo: 47, modelFrom: 10.0, modelTo: 7.5 },
  { cunFrom: 47, cunTo: 54, modelFrom: 7.5, modelTo: 7.0 },
  { cunFrom: 54, cunTo: 60, modelFrom: 7.0, modelTo: 8.5 },
  { cunFrom: 60, cunTo: 63, modelFrom: 8.5, modelTo: 10.0 },
];

// ──────────────────────────────────────────────────────────
// 手臂截面椭圆半宽 X (含皮肤, 模型单位)
// 指(0.8) → 腕(3.0) → 前臂(4.0) → 肘(6.5) → 上臂(7.0) → 肩(5.0) → 体壁(2.0)
// ──────────────────────────────────────────────────────────
const ARM_HALF_W_SEGMENTS: Array<{ cunFrom: number; cunTo: number; modelFrom: number; modelTo: number }> = [
  { cunFrom: 19, cunTo: 28, modelFrom: 0.8, modelTo: 2.0 },
  { cunFrom: 28, cunTo: 34.5, modelFrom: 2.0, modelTo: 3.0 },
  { cunFrom: 34.5, cunTo: 47, modelFrom: 3.0, modelTo: 5.0 },
  { cunFrom: 47, cunTo: 54, modelFrom: 5.0, modelTo: 6.5 },
  { cunFrom: 54, cunTo: 60, modelFrom: 6.5, modelTo: 5.0 },
  { cunFrom: 60, cunTo: 63, modelFrom: 5.0, modelTo: 2.0 },
];

// ──────────────────────────────────────────────────────────
// 手臂截面椭圆半深 Z (含皮肤, 模型单位)
// 指(0.8) → 腕(2.5) → 前臂(3.5) → 肘(4.0) → 上臂(4.5) → 肩(4.0) → 体壁(2.0)
// ──────────────────────────────────────────────────────────
const ARM_HALF_D_SEGMENTS: Array<{ cunFrom: number; cunTo: number; modelFrom: number; modelTo: number }> = [
  { cunFrom: 19, cunTo: 28, modelFrom: 0.8, modelTo: 2.0 },
  { cunFrom: 28, cunTo: 34.5, modelFrom: 2.0, modelTo: 2.8 },
  { cunFrom: 34.5, cunTo: 47, modelFrom: 2.8, modelTo: 3.8 },
  { cunFrom: 47, cunTo: 54, modelFrom: 3.8, modelTo: 4.2 },
  { cunFrom: 54, cunTo: 60, modelFrom: 4.2, modelTo: 4.0 },
  { cunFrom: 60, cunTo: 63, modelFrom: 4.0, modelTo: 2.0 },
];

// ──────────────────────────────────────────────────────────
// LEG MAPPING — 椭圆体表投影模型 (经络贴附腿部皮肤表面)
// ──────────────────────────────────────────────────────────
// 核心思路：将腿部截面视为椭圆，左腿中心约在 X≈7.5
// cunX/cunZ + 经络类别(内侧/外侧/后侧) 共同决定穴位在椭圆表面上的位置
// 基于 BodyParts3D 骨骼顶点实测 + 皮肤/肌肉厚度

// 足经编号集合
const LEG_MERIDIANS = new Set(['ST', 'SP', 'GB', 'BL', 'KI', 'LR']);

// 内侧足经（脾、肾、肝经走行于腿内侧）
const MEDIAL_LEG_MERIDIANS = new Set(['SP', 'KI', 'LR']);

// 判断是否为腿部穴位 (足经 + cunY 在腿部范围)
export function isLegPoint(meridianCode: string, cunY: number): boolean {
  return LEG_MERIDIANS.has(meridianCode) && cunY < 43;
}

// 左腿截面椭圆中心 X (模型坐标)
// 踝→膝: 约7.5-8.5, 膝→大腿上: 逐渐外展至9-10
const LEG_CENTER_X_SEGMENTS: Array<{ cunFrom: number; cunTo: number; modelFrom: number; modelTo: number }> = [
  { cunFrom: 0, cunTo: 3, modelFrom: 7.0, modelTo: 7.5 },
  { cunFrom: 3, cunTo: 12, modelFrom: 7.5, modelTo: 7.5 },
  { cunFrom: 12, cunTo: 19, modelFrom: 7.5, modelTo: 8.0 },
  { cunFrom: 19, cunTo: 30, modelFrom: 8.5, modelTo: 9.5 },
  { cunFrom: 30, cunTo: 43, modelFrom: 9.5, modelTo: 10.0 },
];

// 左腿截面椭圆中心 Z (模型坐标, 前面+)
// 踝→小腿: 胫骨前缘偏后, 膝处前移, 大腿处偏前(股骨前弓)
const LEG_CENTER_Z_SEGMENTS: Array<{ cunFrom: number; cunTo: number; modelFrom: number; modelTo: number }> = [
  { cunFrom: 0, cunTo: 3, modelFrom: 10.0, modelTo: 7.5 },
  { cunFrom: 3, cunTo: 12, modelFrom: 7.5, modelTo: 7.5 },
  { cunFrom: 12, cunTo: 19, modelFrom: 7.5, modelTo: 8.5 },
  { cunFrom: 19, cunTo: 30, modelFrom: 9.5, modelTo: 9.0 },
  { cunFrom: 30, cunTo: 43, modelFrom: 9.0, modelTo: 8.0 },
];

// 左腿截面椭圆半宽 X (含皮肤, 模型单位)
// 踝(1.5) → 小腿(3.0) → 膝(4.5) → 大腿(5.5) → 髋(7.0)
const LEG_HALF_W_SEGMENTS: Array<{ cunFrom: number; cunTo: number; modelFrom: number; modelTo: number }> = [
  { cunFrom: 0, cunTo: 3, modelFrom: 2.0, modelTo: 2.5 },
  { cunFrom: 3, cunTo: 12, modelFrom: 2.5, modelTo: 3.0 },
  { cunFrom: 12, cunTo: 19, modelFrom: 3.0, modelTo: 4.0 },
  { cunFrom: 19, cunTo: 30, modelFrom: 4.5, modelTo: 5.5 },
  { cunFrom: 30, cunTo: 43, modelFrom: 5.5, modelTo: 7.0 },
];

// 左腿截面椭圆半深 Z (含皮肤, 模型单位)
// 踝(2.5) → 小腿(3.0) → 膝(4.5) → 大腿(5.0) → 髋(6.0)
const LEG_HALF_D_SEGMENTS: Array<{ cunFrom: number; cunTo: number; modelFrom: number; modelTo: number }> = [
  { cunFrom: 0, cunTo: 3, modelFrom: 2.0, modelTo: 2.5 },
  { cunFrom: 3, cunTo: 12, modelFrom: 2.5, modelTo: 3.0 },
  { cunFrom: 12, cunTo: 19, modelFrom: 3.0, modelTo: 4.0 },
  { cunFrom: 19, cunTo: 30, modelFrom: 4.5, modelTo: 5.0 },
  { cunFrom: 30, cunTo: 43, modelFrom: 5.0, modelTo: 6.0 },
];

// ──────────────────────────────────────────────────────────
// TORSO MAPPING — 椭圆体表投影模型 (经络贴附躯干皮肤表面)
// ──────────────────────────────────────────────────────────
// 躯干截面为大型椭圆，中心在中线 X=0
// cunX = 旁开寸数(从中线到外侧), cunZ = 前后深度(负=前/正=后)
// 骨度分寸: 两乳间8寸→半宽4寸, 胸廓前后径≈12寸→半深6寸

// 躯干截面椭圆中心 Z (模型坐标, 前面+)
// 髋(5.5) → 脐(7.0) → 下腹(7.0) → 歧骨(10.0) → 胸中(10.0) → 天突(8.0) → 颈(7.0) → 头(8.0)
const TORSO_CENTER_Z_SEGMENTS: Array<{ cunFrom: number; cunTo: number; modelFrom: number; modelTo: number }> = [
  { cunFrom: 43, cunTo: 47, modelFrom: 5.5, modelTo: 7.0 },
  { cunFrom: 47, cunTo: 51, modelFrom: 7.0, modelTo: 7.0 },
  { cunFrom: 51, cunTo: 55, modelFrom: 7.0, modelTo: 10.0 },
  { cunFrom: 55, cunTo: 59, modelFrom: 10.0, modelTo: 10.0 },
  { cunFrom: 59, cunTo: 64, modelFrom: 10.0, modelTo: 8.0 },
  { cunFrom: 64, cunTo: 69, modelFrom: 8.0, modelTo: 7.0 },
  { cunFrom: 69, cunTo: 82, modelFrom: 7.0, modelTo: 8.0 },
];

// 躯干截面椭圆半宽 X (从中线到体表外侧, 含皮肤)
// 髋(26) → 脐(24) → 下腹(24) → 歧骨(22) → 胸(20) → 天突(19) → 颈(5) → 头(8)
const TORSO_HALF_W_SEGMENTS: Array<{ cunFrom: number; cunTo: number; modelFrom: number; modelTo: number }> = [
  { cunFrom: 43, cunTo: 47, modelFrom: 26.0, modelTo: 24.0 },
  { cunFrom: 47, cunTo: 51, modelFrom: 24.0, modelTo: 24.0 },
  { cunFrom: 51, cunTo: 55, modelFrom: 24.0, modelTo: 22.0 },
  { cunFrom: 55, cunTo: 59, modelFrom: 22.0, modelTo: 20.0 },
  { cunFrom: 59, cunTo: 64, modelFrom: 20.0, modelTo: 19.0 },
  { cunFrom: 64, cunTo: 69, modelFrom: 19.0, modelTo: 5.0 },
  { cunFrom: 69, cunTo: 82, modelFrom: 5.0, modelTo: 8.0 },
];

// 躯干截面椭圆半深 Z (从中心到前/后体表, 含皮肤)
// 髋(7) → 脐(4.5) → 下腹(5.5) → 歧骨(10) → 胸(10.5) → 天突(8) → 颈(3) → 头(9)
const TORSO_HALF_D_SEGMENTS: Array<{ cunFrom: number; cunTo: number; modelFrom: number; modelTo: number }> = [
  { cunFrom: 43, cunTo: 47, modelFrom: 7.0, modelTo: 4.5 },
  { cunFrom: 47, cunTo: 51, modelFrom: 4.5, modelTo: 5.5 },
  { cunFrom: 51, cunTo: 55, modelFrom: 5.5, modelTo: 10.0 },
  { cunFrom: 55, cunTo: 59, modelFrom: 10.0, modelTo: 10.5 },
  { cunFrom: 59, cunTo: 64, modelFrom: 10.5, modelTo: 8.0 },
  { cunFrom: 64, cunTo: 69, modelFrom: 8.0, modelTo: 3.5 },
  { cunFrom: 69, cunTo: 82, modelFrom: 3.5, modelTo: 9.0 },
];

export function cunTo3D(cunX: number, cunY: number, side: Side, cunZ: number = 0, isArm: boolean = false, meridianCode: string = ''): { x: number; y: number; z: number } {
  const xSign = side === 'right' ? -1 : 1;

  if (isArm) {
    // ── 手臂椭圆体表投影 ──
    const y = 分段插值(cunY, ARM_BODY_Y_SEGMENTS);
    const cx = 分段插值(cunY, ARM_CENTER_X_SEGMENTS);
    const cz = 分段插值(cunY, ARM_CENTER_Z_SEGMENTS);
    const hw = 分段插值(cunY, ARM_HALF_W_SEGMENTS);
    const hd = 分段插值(cunY, ARM_HALF_D_SEGMENTS);

    const lateralFrac = Math.max(0.1, cunX / 5.0);
    const anteriorFrac = -cunZ / 4.0;
    const theta = Math.atan2(anteriorFrac, lateralFrac);

    const finalX = cx + hw * Math.cos(theta);
    const finalZ = cz + hd * Math.sin(theta);

    if (!isFinite(finalX) || !isFinite(y) || !isFinite(finalZ)) {
      return { x: 14.4 * xSign, y: 133.7, z: 10.0 };
    }
    return { x: finalX * xSign, y, z: finalZ };
  }

  // Y轴：统一使用全局分段映射
  const y = 分段插值(cunY, CUN_Y_SEGMENTS);

  // ── 腿部椭圆体表投影 ──
  if (isLegPoint(meridianCode, cunY)) {
    const legCX = 分段插值(cunY, LEG_CENTER_X_SEGMENTS);
    const legCZ = 分段插值(cunY, LEG_CENTER_Z_SEGMENTS);
    const legHW = 分段插值(cunY, LEG_HALF_W_SEGMENTS);
    const legHD = 分段插值(cunY, LEG_HALF_D_SEGMENTS);

    // 内侧经(脾/肾/肝) vs 外侧/后侧经(胃/胆/膀胱)
    const isMedial = MEDIAL_LEG_MERIDIANS.has(meridianCode);
    // 膀胱经走后侧，cunX≈0-3, cunZ≈4-6 → 后侧
    const isPosterior = meridianCode === 'BL';

    // 映射到腿部椭圆角度:
    //   外侧(ST,GB): cunX>0 → 外侧方向(椭圆右侧, +X from legCenter)
    //   内侧(SP,KI,LR): cunX>0 → 内侧方向(椭圆左侧, -X from legCenter)
    //   后侧(BL): cunX方向偏外侧, cunZ>0 → 后侧方向(椭圆下方)
    let lateralFrac: number;
    let anteriorFrac: number;

    if (isMedial) {
      // 内侧：cunX表示向中线方向偏移 → 椭圆左侧
      lateralFrac = -cunX / 3.0;
      anteriorFrac = -cunZ / 4.0; // cunZ<0=前方=+Z
    } else if (isPosterior) {
      // 后侧：cunX表示后侧偏移 → 混合映射
      lateralFrac = cunX / 4.0; // 向外侧偏移
      anteriorFrac = -cunZ / 5.0; // cunZ>0=后方=-Z (正角度向下)
    } else {
      // 外侧(ST,GB): cunX → 椭圆右侧
      lateralFrac = cunX / 4.0;
      anteriorFrac = -cunZ / 4.0;
    }

    // atan2自然处理(0,0)→0°, (正,0)→90°, (负,0)→-90°
    const theta = Math.atan2(anteriorFrac, lateralFrac === 0 ? 0.001 : lateralFrac);
    const finalX = legCX + legHW * Math.cos(theta);
    const finalZ = legCZ + legHD * Math.sin(theta);

    if (!isFinite(finalX) || !isFinite(y) || !isFinite(finalZ)) {
      return { x: 7.5 * xSign, y: 2.7, z: 7.5 };
    }
    return { x: finalX * xSign, y, z: finalZ };
  }

  // ── 躯干椭圆体表投影 (cunY ≥ 43 或头颈部) ──
  if (cunY >= 43 && cunY <= 82) {
    const torsoCZ = 分段插值(cunY, TORSO_CENTER_Z_SEGMENTS);
    const torsoHW = 分段插值(cunY, TORSO_HALF_W_SEGMENTS);
    const torsoHD = 分段插值(cunY, TORSO_HALF_D_SEGMENTS);

    // cunX = 旁开寸数 (0=中线, 4=乳头线, 6=体侧)
    // cunZ = 深度 (负=前/正=后, 范围约 -6~+6)
    // atan2自然处理中线点: cunX=0 → theta=±90° (正前/正后)
    const lateralFrac = cunX / 4.5;
    const anteriorFrac = -cunZ / 5.5;
    const theta = Math.atan2(anteriorFrac, Math.abs(lateralFrac) < 0.01 ? 0.001 * Math.sign(lateralFrac || 1) : lateralFrac);

    // 躯干中心X = 0 (中线)
    const finalX = torsoHW * Math.cos(theta);
    const finalZ = torsoCZ + torsoHD * Math.sin(theta);

    if (!isFinite(finalX) || !isFinite(y) || !isFinite(finalZ)) {
      return { x: 0, y: 98.8, z: 7 };
    }
    return { x: finalX * xSign, y, z: finalZ };
  }

  // ── 兜底：头部/足部等边缘区域 ──
  const x = cunX * 2.5 * xSign;
  const z = 10.0 + cunZ * 1.5;
  return { x, y, z };
}

function 分段插值(cunY: number, segments: Array<{ cunFrom: number; cunTo: number; modelFrom: number; modelTo: number }>): number {
  // 低于最小段
  if (cunY <= segments[0].cunFrom) return segments[0].modelFrom;
  // 高于最大段
  if (cunY >= segments[segments.length - 1].cunTo) return segments[segments.length - 1].modelTo;
  // 找到所在段
  for (const seg of segments) {
    if (cunY >= seg.cunFrom && cunY <= seg.cunTo) {
      const t = (cunY - seg.cunFrom) / (seg.cunTo - seg.cunFrom);
      return seg.modelFrom + t * (seg.modelTo - seg.modelFrom);
    }
  }
  // 兜底：线性全局
  return segments[0].modelFrom + (cunY / segments[segments.length - 1].cunTo) * (segments[segments.length - 1].modelTo - segments[0].modelFrom);
}

// 骨度分寸法关键地标（cunY = 体表高度, 从足底起算）
export const LANDMARK_Y: Record<string, number> = {
  sole:        0,    malleolus:   3,    knee:        19,
  navel:       47,   xiphoid:     55,   sternalNotch: 64,
  // 手臂关节体表高度 (手臂自然下垂时关节对应的体壁高度)
  shoulder:    57,   elbow:       47,   wrist:       34.5,
  fingertip:   28,
  chin:        69,   philtrum:    71,
  glabella:    73,   hairline:    76,   vertex:      82,
  c7:          64,
};

// ============================================================
// ACUPOINT FACTORY
// ============================================================

function pt(
  code: string,
  name: string,
  cunX: number,
  cunY: number,
  side: Side,
  overrides?: Partial<Acupoint>,
): Acupoint {
  return {
    code,
    name,
    cunX,
    cunY,
    cunZ: 0,
    side,
    isJingWell: false,
    isYuan: false,
    isLuo: false,
    isXi: false,
    isMu: false,
    intersections: [],
    classicRef: '',
    location: '',
    indications: '',
    method: '',
    specialPoint: '',
    niComment: undefined,
    needlingMethod: undefined,
    contraindications: undefined,
    position3d: undefined,
    ...overrides,
  };
}

function wp(cunX: number, cunY: number, side: Side, cunZ: number = 0): PathWaypoint {
  return { cunX, cunY, side, cunZ };
}

// ============================================================
// TWELVE MERIDIANS + REN + DU
// ============================================================

export const TWELVE_MERIDIANS: Meridian[] = [

  // ──────────────────────────────────────────────────────────
  // 1. 手太阴肺经 LUNG (LU) — 11 points
  // ──────────────────────────────────────────────────────────
  {
    code: 'LU',
    name: '手太阴肺经',
    nameEn: 'Lung Meridian of Hand-Taiyin',
    wuxing: '金',
    organ: '肺（脏）',
    color: '#F5E6CC',
    points: [
      pt('LU1', '中府', 6, 58, 'left', { cunZ: -4, isMu: true, intersections: ['SP'], classicRef: '肺之募穴，《甲乙经》云：在胸上行三寸，两旁各二寸', location: '在胸前壁外上方，前正中线旁开6寸，平第1肋间隙', indications: '咳嗽，气喘，胸痛，肩背痛', method: '正立或正坐位，双手叉腰；在锁骨外侧下缘的三角窝处即是云门穴；从此窝正中垂直向下量1横指（大拇指指间关节部位的横径为1寸）处即为本穴。', specialPoint: '肺募穴，手、足太阴交会穴',  niComment: '肺之募穴，治肺病要穴。配合谷治咳嗽特效。倪师常用于治疗肺癌、肺气肿等肺系重症', needlingMethod: '向外斜刺或平刺0.5～0.8寸，不可向内深刺，以免伤及肺脏', contraindications: '不可深刺，避免气胸；孕妇慎用', position3d: { x: 0.141371, y: 1.359129, z: 0.091341 }, }),
      pt('LU2', '云门', 6, 60, 'left', { cunZ: -4, classicRef: '《甲乙经》云：在巨骨下，气户两旁各二寸', location: '在胸前壁外上方，肩胛骨喙突上方，前正中线旁开6寸', indications: '咳嗽，气喘，胸痛，肩痛' , niComment: '治肩臂痛不举特效穴。倪师常与中府同用治疗肺系疾病', needlingMethod: '向外斜刺0.5～0.8寸，可灸', contraindications: '不可向内深刺，避免气胸', position3d: { x: 0.2198, y: 1.3627, z: 0.0746 }, }),
      pt('LU3', '天府', 5, 55, 'left', { cunZ: -2, location: '在臂内侧面，腋前纹头下3寸，肱二头肌桡侧', indications: '咳嗽，气喘，鼻衄，上臂内侧痛' , niComment: '治鼻病特效穴，尤善治鼻衄。倪师认为此穴可清肺热、止鼻血', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.2304, y: 1.2811, z: 0.0266 }, }),
      pt('LU4', '侠白', 4.5, 53, 'left', { cunZ: -2, location: '在臂内侧面，腋前纹头下4寸，肱二头肌桡侧', indications: '咳嗽，气喘，心悸，上臂内侧痛' , niComment: '善治肺气上逆之咳嗽气喘。倪师常配合天府穴使用', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.2619, y: 1.254, z: 0.03 }, }),
      pt('LU5', '尺泽', 3.5, 47, 'left', { cunZ: -2, classicRef: '《甲乙经》云：在肘中约纹上动脉', location: '在肘横纹中，肱二头肌腱桡侧凹陷处', indications: '咳嗽，气喘，咯血，潮热，咽喉肿痛，肘臂挛痛', method: '手掌向上，肘部稍微弯曲；用一手食指（示指）沿肘横纹从外（桡）侧向内（尺）侧触摸，在肘弯正中可摸到一条粗大的筋腱（肱二头肌腱）；这条大筋的外（桡）侧凹陷处，即为本穴。', specialPoint: '合穴',  niComment: '肺经合穴，治肺病要穴。倪师常用三棱针点刺出血治疗急性腰扭伤，特效。合穴治脏腑病，此穴为肺经之水穴，泻肺热特效', needlingMethod: '直刺0.8～1.2寸，或点刺出血', contraindications: '禁灸（一说可灸），局部有血管注意避开', position3d: { x: 0.3719, y: 1.1571, z: 0.0622 }, }),
      pt('LU6', '孔最', 2.5, 41, 'left', { cunZ: -2, isXi: true, location: '在前臂掌面桡侧，腕横纹上7寸', indications: '咳嗽，气喘，咯血，咽喉肿痛，肘臂挛痛', method: '伸臂侧掌。先确定尺泽与太渊的位置。从尺泽与太渊连线的中点处向上量1横指，桡骨内侧缘处，即为本穴。', specialPoint: '郄穴',  niComment: '肺经郄穴，治急性病、出血证特效。倪师常用于治咳血、痔疮出血', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.5373, y: 0.958, z: 0.3103 }, }),
      pt('LU7', '列缺', 1.5, 36, 'left', { cunZ: -1, isLuo: true, intersections: ['LI'], classicRef: '《甲乙经》云：去腕上一寸五分，络手阳明', location: '在前臂桡侧缘，腕横纹上1.5寸', indications: '咳嗽，气喘，咽喉肿痛，口眼歪斜，牙痛', method: '两虎口相交；一手食指压在另一手的桡骨茎突（掌心向前，手腕外侧突起的骨头）上；在食指尖端到达的凹陷处，触摸时可感有一裂隙，即为本穴。', specialPoint: '络脉，八脉交会穴，通任脉',  niComment: '四总穴之一，头项寻列缺。倪师认为此穴治偏头痛、颈项强痛特效，为八脉交会穴通任脉', needlingMethod: '向上斜刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.475, y: 1.0458, z: 0.2442 }, }),
      pt('LU8', '经渠', 1, 35.5, 'left', { cunZ: -1, classicRef: '《甲乙经》云：在寸口陷者中', location: '在前臂掌面桡侧，腕横纹上1寸，桡骨茎突与桡动脉之间', indications: '咳嗽，气喘，咽喉肿痛，手腕痛', method: '伸臂侧掌。从腕横纹上1横指桡骨茎突的高点向内侧推至骨边处，可感觉其与桡动脉之间有一凹陷处，即为本穴。', specialPoint: '经穴',  niComment: '肺经经穴，倪师认为此穴可宣肺止咳，但针刺时须避开动脉', needlingMethod: '避开桡动脉，直刺0.3～0.5寸', contraindications: '避开桡动脉，禁灸', position3d: { x: 0.4751, y: 1.045, z: 0.2455 }, }),
      pt('LU9', '太渊', 1, 34.5, 'left', { cunZ: -1, isYuan: true, intersections: ['LI'], classicRef: '《甲乙经》云：在掌后陷者中，肺之原', location: '在腕掌侧横纹桡侧端，桡动脉桡侧凹陷处', indications: '咳嗽，气喘，咯血，咽喉肿痛，腕臂痛，无脉症', method: '坐位伸臂侧掌。在腕横纹桡侧轻触桡动脉，从感觉到搏动处稍往桡侧移动，至凹陷处即为本穴。本穴正对经渠上方。', specialPoint: '输穴，原穴，八会穴（脉会）',  niComment: '肺经原穴、输穴、八会穴之脉会。倪师认为此穴治脉管病、无脉症特效，为补肺气要穴', needlingMethod: '避开桡动脉，直刺0.3～0.5寸', contraindications: '避开桡动脉', position3d: { x: 0.475, y: 1.035, z: 0.285 }, }),
      pt('LU10', '鱼际', 1.5, 32, 'left', { cunZ: -1, location: '在手拇指本节后凹陷处，第1掌骨中点桡侧赤白肉际处', indications: '咳嗽，咯血，咽喉肿痛，失音，发热', method: '仰掌；在第1掌指关节后，第1掌骨中点，掌后白肉隆起（大鱼际肌）的边缘（赤白肉际），按压有酸胀处，即为本穴。', specialPoint: '荥穴',  niComment: '肺经荥穴，泻肺热特效。倪师常用于治扁桃体炎、咽喉肿痛、发热等症', needlingMethod: '直刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.515, y: 1.005, z: 0.31 }, }),
      pt('LU11', '少商', 1, 30.5, 'left', { cunZ: -1, isJingWell: true, classicRef: '《甲乙经》云：在手大指端内侧，去爪甲如韭叶', location: '在拇指桡侧指甲角旁约0.1寸', indications: '咽喉肿痛，咳嗽，鼻衄，中风昏迷，癫狂', method: '坐位，伸指俯掌。沿手指指抓甲底部与外（桡）侧缘引线（即掌背交界线，或称赤白肉际处）的交点处，距指甲角0.1寸，即为本穴。', specialPoint: '井穴',  niComment: '肺经井穴，倪师认为三棱针点刺出血治扁桃体炎、急性咽喉炎特效，为急救要穴', needlingMethod: '浅刺0.1寸，或点刺出血', contraindications: '孕妇慎用，体质虚弱者慎用放血', position3d: { x: 0.554, y: 0.927, z: 0.314 }, }),
    ],
    pathCun: [
      wp(6, 58, 'left', -4), wp(6, 60, 'left', -4), wp(5, 55, 'left', -2),
      wp(3.5, 47, 'left', -2), wp(1.5, 36, 'left', -1), wp(1, 34.5, 'left', -1),
      wp(1.5, 32, 'left', -1), wp(1, 30.5, 'left', -1),
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 2. 手阳明大肠经 LARGE INTESTINE (LI) — 20 points
  // ──────────────────────────────────────────────────────────
  {
    code: 'LI',
    name: '手阳明大肠经',
    nameEn: 'Large Intestine Meridian of Hand-Yangming',
    wuxing: '金',
    organ: '大肠（腑）',
    color: '#F5E6CC',
    points: [
      pt('LI1', '商阳', 2, 28, 'left', { cunZ: 1, isJingWell: true, classicRef: '《甲乙经》云：在手大指次指内侧，去爪甲如韭叶', location: '在食指末节桡侧指甲角旁0.1寸', indications: '咽喉肿痛，齿痛，耳聋，中风昏迷', method: '坐位，伸指俯掌。沿手食指爪甲底部与拇（桡）侧缘引线（即掌背交界线，或称赤白肉际处）的交点处，距指甲角0.1寸，即为本穴。',  niComment: '大肠经井穴，倪师认为点刺出血可退热、治咽喉肿痛。急救穴之一', needlingMethod: '浅刺0.1寸，或点刺出血', contraindications: '孕妇慎用', position3d: { x: 0.54, y: 0.95, z: 0.28 }, }),
      pt('LI2', '二间', 2, 30, 'left', { cunZ: 1, location: '在食指本节前桡侧凹陷处', indications: '咽喉肿痛，齿痛，目昏，鼻衄' , niComment: '大肠经荥穴，倪师认为此穴可清阳明热，治牙痛、鼻衄', needlingMethod: '直刺0.2～0.3寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.52, y: 1, z: 0.285 }, }),
      pt('LI3', '三间', 2.2, 32, 'left', { cunZ: 1, location: '在食指本节后桡侧凹陷处', indications: '咽喉肿痛，齿痛，目痛，腹胀，肠鸣' , niComment: '大肠经输穴，倪师认为此穴治下牙痛特效，配合谷使用效果更佳', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.51, y: 1.01, z: 0.278 }, }),
      pt('LI4', '合谷', 2.5, 33.5, 'left', { cunZ: 1, isYuan: true, classicRef: '《甲乙经》云：在手大指次指间，一名虎口', location: '在手背第1、2掌骨间，第2掌骨桡侧中点', indications: '头痛，齿痛，面肿，口眼歪斜，发热，无汗', method: '伸臂，拇、食两指张开；以一手的拇指指间横纹，放在另一手拇、食指之间的指蹼缘上；屈指，拇指尖所指处，按压有明显酸胀感，即为本穴。',  niComment: '四总穴之一，面口合谷收。倪师认为此穴为全身止痛要穴，治头痛、牙痛、痛经特效。孕妇禁用，因能催产。倪师临床极常用此穴', needlingMethod: '直刺0.5～1寸，针刺时手呈半握拳状', contraindications: '孕妇禁用', position3d: { x: 0.505, y: 1.018, z: 0.27 }, }),
      pt('LI5', '阳溪', 2, 34.5, 'left', { cunZ: 1, location: '在腕背横纹桡侧端，拇指翘起时凹陷处', indications: '头痛，耳鸣，齿痛，咽喉肿痛，手腕痛' , niComment: '大肠经经穴，倪师认为此穴治腕关节疼痛、头痛有效', needlingMethod: '直刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.475, y: 1.04, z: 0.24 }, }),
      pt('LI6', '偏历', 2.5, 37.5, 'left', { cunZ: 1, isLuo: true, location: '在前臂背面桡侧，阳溪上3寸', indications: '鼻衄，耳聋，口眼歪斜，手臂酸痛，水肿', method: '两虎口垂直交；当中指端落于前臂背面，指端下有一凹陷，即为本穴。',  niComment: '大肠经络穴，倪师认为此穴可治水肿、鼻衄', needlingMethod: '直刺或斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.4725, y: 1.065, z: 0.1818 }, }),
      pt('LI7', '温溜', 3, 39.5, 'left', { cunZ: 1, isXi: true, location: '在前臂背面桡侧，阳溪上5寸', indications: '头痛，面肿，咽喉肿痛，肠鸣腹痛，肩背酸痛', method: '伸臂，掌向下。先确定阳溪（参见“阳溪”）与曲池（参见“曲池”）的位置，从阳溪与曲池连线的中点处向下量1横指处，即为本穴。',  niComment: '大肠经郄穴，倪师认为此穴治急性肠鸣腹痛、头痛有效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.4546, y: 1.08, z: 0.1553 }, }),
      pt('LI8', '下廉', 3, 41, 'left', { cunZ: 1, location: '在前臂背面桡侧，阳溪上8寸', indications: '头痛，眩晕，腹痛，腹胀，肘臂痛' , niComment: '倪师认为此穴可治肘臂酸痛、腹痛', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.4422, y: 1.09, z: 0.1391 }, }),
      pt('LI9', '上廉', 3, 43, 'left', { cunZ: 1, location: '在前臂背面桡侧，阳溪上9寸', indications: '手臂肩膊酸痛，半身不遂，肠鸣腹痛' , niComment: '倪师认为此穴治肩臂痛、上肢不遂有效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.431, y: 1.1, z: 0.1207 }, }),
      pt('LI10', '手三里', 3.5, 45, 'left', { cunZ: 1, location: '在前臂背面桡侧，阳溪上10寸', indications: '齿痛，颊肿，上肢不遂，腹痛，腹泻', method: '伸臂俯掌；确定阳溪穴：将拇指向上翘起，在腕横纹前露出的两筋之间的凹陷处，即为阳溪穴；确定曲池穴：屈肘成45°，肘关节外侧，肘横纹头处即为曲池穴；在阳溪与曲池连线上，肘横纹下量2横指（大拇指指间关节部位的横径为1寸）处，即为本穴。',  niComment: '倪师极常用此穴，治手臂酸痛、肩周炎特效。配合谷、曲池使用效果更佳', needlingMethod: '直刺0.8～1.2寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.5398, y: 0.9536, z: 0.29 }, }),
      pt('LI11', '曲池', 4, 47, 'left', { cunZ: 1, classicRef: '《甲乙经》云：在肘外辅骨肘骨之中', location: '在肘横纹外侧端，屈肘时尺泽与肱骨外上髁连线中点', indications: '发热，咽喉肿痛，齿痛，目赤，上肢不遂，腹痛吐泻', method: '屈肘成45°；在肘关节的外侧，肘横纹头处，即为本穴。', specialPoint: '合穴',  niComment: '大肠经合穴，倪师极常用此穴。降血压特效，治皮肤病（荨麻疹、湿疹）特效，泻阳明热要穴。配合谷为倪师治疗高血压的标准配穴', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.3677, y: 1.1571, z: 0.0414 }, }),
      pt('LI12', '肘髎', 4.5, 48, 'left', { cunZ: 1, location: '在臂外侧，曲池上方1寸，肱骨边缘', indications: '肘臂酸痛，挛急，麻木，嗜卧' , niComment: '倪师认为此穴治肘关节周围疼痛有效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.3737, y: 1.1512, z: 0.0486 }, }),
      pt('LI13', '手五里', 5, 50, 'left', { cunZ: 1, location: '在臂外侧，曲池上3寸', indications: '肘臂挛痛，瘰疬，咳嗽' , niComment: '倪师认为此穴治肘臂挛痛、瘰疬有效', needlingMethod: '避开动脉，直刺0.5～1寸', contraindications: '避开动脉', position3d: { x: 0.3428, y: 1.18, z: 0.0235 }, }),
      pt('LI14', '臂臑', 5.5, 54, 'left', { cunZ: 1, intersections: ['SI'], location: '在臂外侧，曲池上7寸，三角肌止点处', indications: '肩臂痛，颈项拘急，瘰疬', method: '屈肘，紧握拳；上肢用力令其紧张，则上臂可见的明显隆起为三角肌；在三角肌下端偏内侧处，即为本穴。',  niComment: '倪师认为此穴治肩臂不举、瘰疬有效。为手阳明络之会', needlingMethod: '直刺或向上斜刺0.8～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.292, y: 1.2242, z: 0.0191 }, }),
      pt('LI15', '肩髃', 7, 62, 'left', { cunZ: 0, intersections: ['TE'], classicRef: '《甲乙经》云：在肩端两骨间', location: '在肩峰前下方，三角肌上部，上臂外展平举时肩前凹陷处', indications: '肩臂挛痛不遂，瘾疹，瘰疬', method: '坐位，上臂外展至水平位；在肩部高骨（锁骨肩峰端）外，可见肩关节上出现两个凹陷；前面的凹陷，即为本穴。', specialPoint: '手阳明、阳蹻交会穴',  niComment: '倪师极常用此穴治疗肩周炎、肩臂不遂。为手阳明与阳跷脉之会', needlingMethod: '直刺或向下斜刺0.8～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.2216, y: 1.3231, z: 0.0108 }, }),
      pt('LI16', '巨骨', 6, 63, 'left', { cunZ: 1, location: '在肩上方，锁骨肩峰端与肩胛冈之间凹陷处', indications: '肩臂痛，抬举不利，瘰疬' , niComment: '倪师认为此穴治肩臂疼痛、瘿气有效', needlingMethod: '直刺，微斜向外下方0.5～1寸', contraindications: '不可深刺，避免气胸', position3d: { x: 0.2319, y: 1.371, z: 0.0608 }, }),
      pt('LI17', '天鼎', 4, 66.5, 'left', { cunZ: 0, location: '在颈外侧部，胸锁乳突肌后缘，扶突直下1寸', indications: '咽喉肿痛，暴喑，气梗，瘰疬' , niComment: '倪师认为此穴治咽喉肿痛、甲状腺肿大有效', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.067335, y: 1.453023, z: 0.035229 }, }),
      pt('LI18', '扶突', 3.5, 67, 'left', { cunZ: -1, location: '在颈外侧部，喉结旁3寸，胸锁乳突肌前后缘之间', indications: '咳嗽，气喘，咽喉肿痛，暴喑' , niComment: '倪师认为此穴治甲状腺疾病、咽喉肿痛有效', needlingMethod: '直刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.049862, y: 1.482449, z: 0.047255 }, }),
      pt('LI19', '禾髎', 1.2, 70.5, 'left', { cunZ: -4, location: '在上唇部，鼻孔外缘直下，平水沟穴', indications: '鼻疮，鼻衄，口歪，口噤' , niComment: '倪师认为此穴治鼻塞、鼻衄、面瘫有效', needlingMethod: '直刺0.3～0.5寸，或斜刺', contraindications: '一般无特殊禁忌', position3d: { x: 0.0383, y: 1.5108, z: 0.127 }, }),
      pt('LI20', '迎香', 1.5, 70, 'left', { cunZ: -4, intersections: ['ST'], classicRef: '《甲乙经》云：在鼻孔旁', location: '在鼻翼外缘中点旁开0.5寸，鼻唇沟中', indications: '鼻塞，鼻衄，口歪，面痒，胆道蛔虫症', method: '坐位；用手指沿鼻唇沟向上推，至鼻翼中点旁，可触及一凹陷，即为本穴。', specialPoint: '手、足阳明经交会穴',  niComment: '倪师认为此穴治鼻塞、过敏性鼻炎特效。为治鼻病第一要穴', needlingMethod: '斜刺或平刺0.3～0.5寸', contraindications: '禁灸', position3d: { x: 0.0362, y: 1.5159, z: 0.1334 }, }),
    ],
    pathCun: [
      wp(2, 28, 'left', 1), wp(2.5, 33.5, 'left', 1), wp(2, 34.5, 'left', 1),
      wp(4, 47, 'left', 1), wp(7, 62, 'left', 0), wp(6, 63, 'left', 1),
      wp(4, 66.5, 'left', 0), wp(3.5, 67, 'left', -1), wp(1.5, 70, 'left', -4),
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 3. 足阳明胃经 STOMACH (ST) — 45 points
  // ──────────────────────────────────────────────────────────
  {
    code: 'ST',
    name: '足阳明胃经',
    nameEn: 'Stomach Meridian of Foot-Yangming',
    wuxing: '土',
    organ: '胃（腑）',
    color: '#8B7355',
    points: [
      pt('ST1', '承泣', 1.2, 71, 'left', { cunZ: -4, location: '在面部，瞳孔直下，眼球与眶下缘之间', indications: '目赤肿痛，流泪，夜盲，眼睑瞤动，口眼歪斜', method: '正坐或仰卧位，直视前方。此时瞳孔正下方眼球与眼眶下缘之间的眶骨边缘即为本穴。', specialPoint: '足阳明、阳蹻、任脉交会穴',  niComment: '倪师认为此穴治眼部疾病特效，但针刺需非常小心，避免刺伤眼球', needlingMethod: '以左手拇指向上轻推眼球，紧靠眶缘缓慢直刺0.3～0.7寸，不宜提插，以防刺破血管引起血肿', contraindications: '针刺时须缓慢，严禁提插捻转', position3d: { x: 0.0287, y: 1.5117, z: 0.1388 }, }),
      pt('ST2', '四白', 1.2, 70.5, 'left', { cunZ: -4, location: '在面部，瞳孔直下，眶下孔凹陷处', indications: '目赤痛痒，目翳，眼睑瞤动，口眼歪斜，头痛眩晕', method: '正坐或仰卧位，直视前方。瞳孔直下，沿眼眶骨向下约半横指可触及一凹陷（眶下孔），按之酸胀，即为本穴。',  niComment: '倪师认为此穴治面部神经麻痹、三叉神经痛有效', needlingMethod: '直刺或斜刺0.3～0.5寸，不可深刺', contraindications: '不可深刺', position3d: { x: 0.0277, y: 1.5022, z: 0.1348 }, }),
      pt('ST3', '巨髎', 1.5, 70, 'left', { cunZ: -4, location: '在面部，瞳孔直下，平鼻翼下缘处', indications: '口眼歪斜，眼睑瞤动，鼻衄，齿痛，唇颊肿' , niComment: '倪师认为此穴治面瘫、鼻衄有效', needlingMethod: '斜刺或平刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.0297, y: 1.4993, z: 0.1288 }, }),
      pt('ST4', '地仓', 1.5, 69, 'left', { cunZ: -4, intersections: ['LI'], location: '在面部，口角外侧，上直瞳孔', indications: '口眼歪斜，流涎，眼睑瞤动', method: '正坐平视，瞳孔直下垂线与口角水平线相交点处。',  niComment: '倪师认为此穴治面瘫、口角歪斜特效。常与颊车穴配合使用', needlingMethod: '斜刺或平刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.0314, y: 1.4991, z: 0.1253 }, }),
      pt('ST5', '大迎', 2, 69, 'left', { cunZ: -3, location: '在下颌角前方，咬肌附着部前缘凹陷处', indications: '口歪，口噤，颊肿，齿痛' , niComment: '倪师认为此穴治面颊肿痛、牙关紧闭有效', needlingMethod: '避开动脉，斜刺或平刺0.3～0.5寸', contraindications: '避开面动脉', position3d: { x: 0.038793, y: 1.506329, z: 0.101308 }, }),
      pt('ST6', '颊车', 2.5, 69.5, 'left', { cunZ: -2, location: '在面颊部，下颌角前上方约一横指凹陷处', indications: '口眼歪斜，齿痛，颊肿，口噤不语', method: '正坐或仰卧位；将上下齿咬紧时，隆起的肌肉即为咬肌；在咬肌最高点处，按之凹陷、有酸胀感处，即为本穴。',  niComment: '倪师极常用此穴，治面瘫、牙关紧闭、腮腺炎特效。与地仓配伍为治面瘫经典组合', needlingMethod: '直刺0.3～0.5寸，平刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.038793, y: 1.506329, z: 0.101308 }, }),
      pt('ST7', '下关', 2.5, 70, 'left', { cunZ: -2.5, intersections: ['GB'], location: '在面部耳前方，颧弓与下颌切迹所形成的凹陷中', indications: '牙关紧闭，下颌疼痛，口噤，齿痛，耳鸣', method: '正坐或仰卧位；由耳屏向前1横指可触及一高骨，即为颧弓；在此高骨的下方有一凹陷处即为本穴，张口该凹陷闭合、突起。', specialPoint: '足阳明、少阳交会穴',  niComment: '倪师认为此穴治三叉神经痛、下颌关节炎、牙痛特效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.049216, y: 1.51594, z: 0.088541 }, }),
      pt('ST8', '头维', 3.5, 73, 'left', { cunZ: -2, intersections: ['GB'], location: '在头侧部，额角发际上0.5寸，头正中线旁开4.5寸', indications: '头痛，目眩，目痛，流泪，眼睑瞤动', method: '正坐或仰卧位；从额角发际向上量0.5横指（大拇指指间关节部位的横径为1寸）处，即为本穴。', specialPoint: '足阳明、少阳、阳维交会穴',  niComment: '倪师认为此穴治偏头痛、眩晕有效。为足少阳、足阳明之会', needlingMethod: '平刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.0641, y: 1.5663, z: 0.1095 }, }),
      pt('ST9', '人迎', 1.5, 67, 'left', { cunZ: -3, location: '在颈部，喉结旁1.5寸，胸锁乳突肌前缘', indications: '咽喉肿痛，气喘，瘰疬，瘿气，高血压' , niComment: '倪师认为此穴可治高血压、甲状腺疾病。针刺须非常小心避开动脉', needlingMethod: '避开颈总动脉，直刺0.3～0.5寸', contraindications: '避开颈总动脉，禁灸', position3d: { x: 0.044, y: 1.4871, z: 0.0774 }, }),
      pt('ST10', '水突', 1.8, 66, 'left', { cunZ: -3, location: '在颈部，人迎与气舍连线的中点，胸锁乳突肌前缘', indications: '咽喉肿痛，咳嗽，气喘' , niComment: '倪师认为此穴治咽喉肿痛、甲状腺肿有效', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.042351, y: 1.475027, z: 0.059684 }, }),
      pt('ST11', '气舍', 2, 65, 'left', { cunZ: -2, location: '在颈部，锁骨内侧端上缘，胸锁乳突肌胸骨头与锁骨头之间', indications: '咽喉肿痛，气喘，呃逆，瘿瘤，颈项强痛' , niComment: '倪师认为此穴治咽喉病、颈项强痛有效', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.1503, y: 1.3717, z: 0.0877 }, }),
      pt('ST12', '缺盆', 3, 64, 'left', { cunZ: -2, location: '在锁骨上窝中央，前正中线旁开4寸', indications: '咳嗽，气喘，咽喉肿痛，缺盆中痛，瘰疬' , niComment: '倪师认为此穴治咳嗽气喘、胸满有效。不可深刺', needlingMethod: '直刺或斜刺0.3～0.5寸', contraindications: '不可深刺，避免气胸', position3d: { x: 0.1802, y: 1.3615, z: 0.0876 }, }),
      pt('ST13', '气户', 4, 62, 'left', { cunZ: -5, location: '在胸部，锁骨下缘，前正中线旁开4寸', indications: '咳嗽，气喘，呃逆，胸胁胀满' , niComment: '倪师认为此穴治胸满气喘有效', needlingMethod: '斜刺或平刺0.5～0.8寸', contraindications: '不可深刺', position3d: { x: 0.171, y: 1.3534, z: 0.0911 }, }),
      pt('ST14', '库房', 4, 61, 'left', { cunZ: -5, location: '在胸部，第1肋间隙，前正中线旁开4寸', indications: '咳嗽，气喘，胸胁胀满' , niComment: '倪师认为此穴治胸胁胀满、咳喘有效', needlingMethod: '斜刺或平刺0.5～0.8寸', contraindications: '不可深刺', position3d: { x: 0.1388, y: 1.3164, z: 0.1111 }, }),
      pt('ST15', '屋翳', 4, 60, 'left', { cunZ: -5, location: '在胸部，第2肋间隙，前正中线旁开4寸', indications: '咳嗽，气喘，胸胁胀满，乳痈' , niComment: '倪师认为此穴治乳腺炎、胸胁胀痛有效', needlingMethod: '斜刺或平刺0.5～0.8寸', contraindications: '不可深刺', position3d: { x: 0.1308, y: 1.2956, z: 0.1247 }, }),
      pt('ST16', '膺窗', 4, 59, 'left', { cunZ: -5, location: '在胸部，第3肋间隙，前正中线旁开4寸', indications: '咳嗽，气喘，胸胁胀痛，乳痈' , niComment: '倪师认为此穴治乳腺增生、乳痈有效', needlingMethod: '斜刺或平刺0.5～0.8寸', contraindications: '不可深刺', position3d: { x: 0.1323, y: 1.2837, z: 0.1269 }, }),
      pt('ST17', '乳中', 4, 58, 'left', { cunZ: -5, location: '在胸部，第4肋间隙，乳头中央', indications: '本次不针不灸，仅作定位标志' , niComment: '此穴为定位标志，不针不灸。倪师强调此穴不可针刺', needlingMethod: '不针不灸，仅作定位标志', contraindications: '禁针禁灸', position3d: { x: 0.1235, y: 1.2582, z: 0.125 }, }),
      pt('ST18', '乳根', 4, 57, 'left', { cunZ: -5, location: '在胸部，第5肋间隙，乳头直下，前正中线旁开4寸', indications: '咳嗽，气喘，胸痛，乳痈，乳汁少' , niComment: '倪师认为此穴治产后缺乳、乳腺炎、胸痛有效', needlingMethod: '斜刺或平刺0.5～0.8寸', contraindications: '不可深刺', position3d: { x: 0.1201, y: 1.2415, z: 0.125 }, }),
      pt('ST19', '不容', 2, 53, 'left', { cunZ: -5, location: '在上腹部，脐中上6寸，前正中线旁开2寸', indications: '呕吐，胃痛，食欲不振，腹胀' , niComment: '倪师认为此穴治胃痛、呕吐有效', needlingMethod: '直刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.061, y: 1.2329, z: 0.1485 }, }),
      pt('ST20', '承满', 2, 52, 'left', { cunZ: -5, location: '在上腹部，脐中上5寸，前正中线旁开2寸', indications: '胃痛，呕吐，腹胀，食欲不振' , niComment: '倪师认为此穴治腹胀、胃痛有效', needlingMethod: '直刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.0718, y: 1.2268, z: 0.1471 }, }),
      pt('ST21', '梁门', 2, 51, 'left', { cunZ: -5, location: '在上腹部，脐中上4寸，前正中线旁开2寸', indications: '胃痛，呕吐，食欲不振，腹胀，泄泻', method: '仰卧位；沿前正中线向下触摸，找出胸骨体与剑突间形成的凹陷，即胸剑联合；从胸剑联合与脐中连线的中点作一水平线；该线与乳中线（过乳头的垂直线）有一交点；两个交点的中间处，即为本穴。',  niComment: '倪师极常用此穴，治胃溃疡、胃炎特效。为治胃病要穴', needlingMethod: '直刺0.8～1.2寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.0678, y: 1.187, z: 0.1408 }, }),
      pt('ST22', '关门', 2, 50, 'left', { cunZ: -5, location: '在上腹部，脐中上3寸，前正中线旁开2寸', indications: '腹痛，腹胀，肠鸣，泄泻，水肿' , niComment: '倪师认为此穴治腹胀、肠鸣、水肿有效', needlingMethod: '直刺0.8～1.2寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.0671, y: 1.1643, z: 0.1399 }, }),
      pt('ST23', '太乙', 2, 49, 'left', { cunZ: -5, location: '在上腹部，脐中上2寸，前正中线旁开2寸', indications: '胃痛，心烦，癫狂' , niComment: '倪师认为此穴治胃痛、癫狂有效', needlingMethod: '直刺0.8～1.2寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.0708, y: 1.1378, z: 0.1369 }, }),
      pt('ST24', '滑肉门', 2, 48, 'left', { cunZ: -5, location: '在上腹部，脐中上1寸，前正中线旁开2寸', indications: '胃痛，呕吐，癫狂' , niComment: '倪师认为此穴治肥胖、胃痛有效。常用于减肥配方', needlingMethod: '直刺0.8～1.2寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.076, y: 1.1156, z: 0.1327 }, }),
      pt('ST25', '天枢', 2, 47, 'left', { cunZ: -5, isMu: true, classicRef: '大肠募穴，《甲乙经》云：去盲俞一寸五分，挟脐两旁各二寸', location: '在腹中部，脐中旁开2寸', indications: '腹胀肠鸣，绕脐痛，便秘，泄泻，痢疾，月经不调', method: '仰卧位；过乳头作一与前正中线平行的直线；沿脐中作一水平线；两线的交点到脐中连线的中点，即为本穴。', specialPoint: '大肠募穴',  niComment: '大肠募穴，倪师极常用此穴。治便秘、腹泻、肠胃病特效。倪师认为天枢为调整肠道功能之要穴', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.0734, y: 1.028, z: 0.1265 }, }),
      pt('ST26', '外陵', 2, 46, 'left', { cunZ: -4, location: '在下腹部，脐中下1寸，前正中线旁开2寸', indications: '腹痛，疝气，痛经' , niComment: '倪师认为此穴治下腹痛、疝气有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.0758, y: 1.0064, z: 0.127 }, }),
      pt('ST27', '大巨', 2, 45, 'left', { cunZ: -4, location: '在下腹部，脐中下2寸，前正中线旁开2寸', indications: '小腹胀满，小便不利，疝气，遗精' , niComment: '倪师认为此穴治小便不利、遗精有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.0775, y: 0.9808, z: 0.1245 }, }),
      pt('ST28', '水道', 2, 44, 'left', { cunZ: -4, location: '在下腹部，脐中下3寸，前正中线旁开2寸', indications: '小腹胀满，小便不利，痛经，不孕', method: '仰卧位；确定耻骨联合：沿下腹部前正中线垂直向下推，可触及一骨头，此骨头即为耻骨联合；将脐中与耻骨联合上缘中点的连线平分为5等分；从该连线的上3/5与下2/5交点处作一水平线；该线与乳中线（过乳头的垂直线）有一交点；两个交点的中间处，即为本穴。',  niComment: '倪师认为此穴治水肿、小便不利特效。常配合中极穴使用', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.0734, y: 0.9528, z: 0.1232 }, }),
      pt('ST29', '归来', 2, 43, 'left', { cunZ: -4, location: '在下腹部，脐中下4寸，前正中线旁开2寸', indications: '腹痛，疝气，月经不调，白带，阴挺', method: '仰卧位；确定耻骨联合：沿下腹部前正中线垂直向下推，可触及一骨头，此骨头即为耻骨联合；将脐中与耻骨联合上缘中点的连线平分为5等分；',  niComment: '倪师认为此穴治妇科疾病特效，尤善治月经不调、子宫脱垂', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.0749, y: 0.9254, z: 0.1198 }, }),
      pt('ST30', '气冲', 2, 42, 'left', { cunZ: -4, location: '在腹股沟稍上方，脐中下5寸，前正中线旁开2寸', indications: '腹痛，疝气，月经不调，不孕，阳痿' , niComment: '倪师认为此穴治疝气、阳痿、不孕有效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.0671, y: 0.9028, z: 0.1178 }, }),
      pt('ST31', '髀关', 3, 38, 'left', { cunZ: -2, location: '在大腿前面，髂前上棘与髌底外侧端连线上，会阴水平线下1寸', indications: '髀股痿痹，下肢不遂，腰膝冷痛' , niComment: '倪师认为此穴治腰腿痛、下肢痿痹有效', needlingMethod: '直刺1～2寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.1653, y: 0.8966, z: 0.0527 }, }),
      pt('ST32', '伏兔', 3, 30, 'left', { cunZ: -2, location: '在大腿前面，髂前上棘与髌底外侧端连线上，髌底上6寸', indications: '腰膝冷痛，下肢痿痹，脚气' , niComment: '倪师认为此穴治下肢痿痹、膝痛有效', needlingMethod: '直刺1～2寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.1808, y: 0.795, z: 0.0808 }, }),
      pt('ST33', '阴市', 3, 25, 'left', { cunZ: -1, location: '在大腿前面，髂前上棘与髌底外侧端连线上，髌底上3寸', indications: '腰膝冷痛，下肢痿痹，腹胀，疝气' , niComment: '倪师认为此穴治膝关节炎、下肢痿软有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.150312, y: 0.671799, z: 0.112085 }, }),
      pt('ST34', '梁丘', 3, 23, 'left', { cunZ: -1, isXi: true, location: '在大腿前面，髂前上棘与髌底外侧端连线上，髌底上2寸', indications: '膝肿痛，下肢不遂，胃痛，乳痈', method: '正坐屈膝；从膝盖骨（髌骨）外侧最高点，垂直往上量2横指（大拇指指间关节部位的横径为1寸）；', specialPoint: '郄穴',  niComment: '胃经郄穴，倪师认为此穴治急性胃痛特效。亦治膝关节炎', needlingMethod: '直刺1～1.2寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.1385, y: 0.6345, z: 0.1107 }, }),
      pt('ST35', '犊鼻', 3, 19, 'left', { cunZ: -1, location: '在膝部，髌骨与髌韧带外侧凹陷中', indications: '膝痛，下肢痿痹，脚气' , niComment: '倪师认为此穴治膝关节炎、膝关节积液特效。常与膝眼穴配合使用', needlingMethod: '向后内斜刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.0998, y: 0.53, z: 0.0551 }, }),
      pt('ST36', '足三里', 2, 16, 'left', { cunZ: 0, classicRef: '《甲乙经》云：在膝下三寸，胻骨外廉，足阳明脉气所入', location: '在小腿前外侧，犊鼻下3寸，距胫骨前缘一横指', indications: '胃痛，呕吐，腹胀，泄泻，痢疾，便秘，下肢痿痹，虚劳赢瘦', method: '坐位；同侧手张开，食指第二指关节桡侧缘对准犊鼻穴下缘，小指第二指关节处即是本穴。', specialPoint: '合穴',  niComment: '足三里为全身第一保健要穴。倪师极常用此穴，认为足三里可治一切胃肠疾病，强壮身体，延年益寿。为胃经合穴，合治内腑。倪师临床几乎每方必用', needlingMethod: '直刺1～2寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.15, y: 0.41, z: 0.055 }, }),
      pt('ST37', '上巨虚', 2, 13, 'left', { cunZ: 0, location: '在小腿前外侧，犊鼻下6寸，距胫骨前缘一横指', indications: '肠鸣，腹痛，泄泻，便秘，肠痈，下肢痿痹', method: '坐位屈膝；在膝盖外侧可触及一凹陷，即为犊鼻穴；从犊鼻穴往下量两个4横指（食指、中指、无名指、小指四指并拢，以中指近端指间关节横纹水平的四指宽度为3寸，也称一夫法），距胫骨外侧前缘1横指（中指）处，即为本穴。', specialPoint: '大肠下合穴',  niComment: '大肠下合穴，倪师认为此穴治肠道疾病特效。治便秘、腹泻、阑尾炎', needlingMethod: '直刺1～2寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.155, y: 0.29, z: 0.045 }, }),
      pt('ST38', '条口', 2, 11, 'left', { cunZ: 0, location: '在小腿前外侧，犊鼻下8寸，距胫骨前缘一横指', indications: '脘腹疼痛，下肢痿痹，跗肿，转筋', method: '坐位屈膝；先确定腘横纹端与外踝尖连线中点（腘横纹与外踝尖连线的距离为16寸）；再从胫骨前缘沿该中点水平线往外量1横指（中指）处，即为本穴。',  niComment: '倪师认为此穴治肩周炎特效，取对侧条口透承山。亦治小腿转筋', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.15, y: 0.21, z: 0.035 }, }),
      pt('ST39', '下巨虚', 2, 10, 'left', { cunZ: 0, location: '在小腿前外侧，犊鼻下9寸，距胫骨前缘一横指', indications: '小腹痛，泄泻，痢疾，乳痈，下肢痿痹', method: '坐位屈膝。先确定条口位置（参见“条口”），从条口向下量1横指，在胫、腓骨之间可触及一凹陷处，即为本穴。', specialPoint: '小肠下合穴',  niComment: '小肠下合穴，倪师认为此穴治小肠疾病、乳腺炎有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.16, y: 0.17, z: 0.03 }, }),
      pt('ST40', '丰隆', 4, 12, 'left', { cunZ: 1, isLuo: true, classicRef: '《甲乙经》云：在外踝上八寸，下廉胻外廉陷者中', location: '在小腿前外侧，外踝尖上8寸，条口外1寸', indications: '头痛，眩晕，痰多咳嗽，呕吐，便秘，水肿，下肢痿痹', method: '正坐屈膝；先确定腘横纹端与外踝尖连线中点（腘横纹与外踝尖连线的距离为16寸）；', specialPoint: '络穴',  niComment: '胃经络穴，为化痰第一要穴。倪师极常用此穴，认为一切痰证皆可取丰隆。治高血脂、肥胖特效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.16, y: 0.475, z: 0.06 }, }),
      pt('ST41', '解溪', 1.5, 3.5, 'left', { cunZ: -1, location: '在足背与小腿交界处横纹中央凹陷中，拇长伸肌腱与趾长伸肌腱之间', indications: '头痛，眩晕，癫狂，腹胀，便秘，下肢痿痹', method: '正坐垂足或仰卧，足背屈；在足背踝关节前横纹中点，与第2足趾正对处，即为本穴。', specialPoint: '经穴',  niComment: '胃经经穴，倪师认为此穴治头痛、眩晕、足踝肿痛有效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.19, y: 0.08, z: 0.055 }, }),
      pt('ST42', '冲阳', 1.5, 2.5, 'left', { cunZ: -1, isYuan: true, location: '在足背最高处，拇长伸肌腱与趾长伸肌腱之间，足背动脉搏动处', indications: '口眼歪斜，面肿，齿痛，癫狂痫，胃痛，足痿无力', method: '正坐垂足或仰卧；在足背最高点，两筋之间可触及一凹陷，按之有搏动感，即为本穴。', specialPoint: '原穴',  niComment: '胃经原穴，倪师认为此穴可治胃病、面瘫。针刺须避开足背动脉', needlingMethod: '避开动脉，直刺0.3～0.5寸', contraindications: '避开足背动脉', position3d: { x: 0.186, y: 0.035, z: 0.155 }, }),
      pt('ST43', '陷谷', 1.5, 1.5, 'left', { cunZ: -1, location: '在足背，第2、3跖骨结合部前方凹陷处', indications: '面目浮肿，肠鸣腹痛，足背肿痛' , niComment: '胃经输穴，倪师认为此穴治面部浮肿、足背肿痛有效', needlingMethod: '直刺或斜刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.175, y: 0.03, z: 0.168 }, }),
      pt('ST44', '内庭', 1.5, 0.8, 'left', { cunZ: -1, location: '在足背，第2、3趾间，趾蹼缘后方赤白肉际处', indications: '齿痛，咽喉肿痛，口歪，鼻衄，胃痛吐酸，腹胀，热病', method: '坐位或仰卧位；在足背第2、3趾的趾蹼缘略后一些（约半横指）的地方，按压有酸胀感处，即为本穴。', specialPoint: '荥穴',  niComment: '胃经荥穴，倪师认为此穴泻胃火特效。治牙痛、胃热、口臭、便秘', needlingMethod: '直刺或斜刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.18, y: 0.018, z: 0.192 }, }),
      pt('ST45', '厉兑', 1.5, 0, 'left', { cunZ: -1, isJingWell: true, classicRef: '《甲乙经》云：在足大指次指之端，去爪甲角如韭叶', location: '在足第2趾末节外侧，趾甲角旁0.1寸', indications: '鼻衄，齿痛，咽喉肿痛，腹胀热病，多梦，癫狂', method: '正坐垂足或仰卧。在足第2趾，由足背第2趾趾甲外侧缘（即掌背交界线，又称赤白肉际）与趾甲下缘各作一垂线之交点处，即为本穴。', specialPoint: '井穴',  niComment: '胃经井穴，倪师认为此穴点刺出血可治失眠多梦、胃热。为急救穴之一', needlingMethod: '浅刺0.1寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.18, y: 0.012, z: 0.205 }, }),
    ],
    pathCun: [
      wp(1.2, 71, 'left', -4), wp(1.5, 69, 'left', -4), wp(2.5, 69.5, 'left', -2),
      wp(3.5, 73, 'left', -2), wp(1.5, 67, 'left', -3), wp(3, 64, 'left', -2),
      wp(4, 58, 'left', -5), wp(2, 47, 'left', -5), wp(2, 42, 'left', -4),
      wp(3, 38, 'left', -2), wp(3, 30, 'left', -2), wp(3, 19, 'left', -1),
      wp(2, 16, 'left', 0), wp(2, 10, 'left', 0), wp(1.5, 3.5, 'left', -1),
      wp(1.5, 0, 'left', -1),
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 4. 足太阴脾经 SPLEEN (SP) — 21 points
  // ──────────────────────────────────────────────────────────
  {
    code: 'SP',
    name: '足太阴脾经',
    nameEn: 'Spleen Meridian of Foot-Taiyin',
    wuxing: '土',
    organ: '脾（脏）',
    color: '#8B7355',
    points: [
      pt('SP1', '隐白', 1, 0, 'left', { cunZ: -1, isJingWell: true, classicRef: '《甲乙经》云：在足大指端内侧，去爪甲角如韭叶', location: '在足大趾内侧，趾甲角旁0.1寸', indications: '崩漏，月经过多，便血，尿血，腹胀，癫狂，多梦', method: '正坐垂足或仰卧。在足大趾内侧，由足大趾趾甲内侧缘（即掌背交界线，又称赤白肉际）与下缘各作一垂线之交点处，即为本穴。', specialPoint: '井穴',  niComment: '脾经井穴，倪师认为此穴治崩漏特效。艾灸隐白可止崩漏，为妇科止血要穴', needlingMethod: '浅刺0.1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.22, y: 0.012, z: 0.2 }, }),
      pt('SP2', '大都', 1.2, 0.5, 'left', { cunZ: -1, location: '在足内侧缘，足大趾本节前下方赤白肉际凹陷处', indications: '腹胀，胃痛，呕吐，泄泻，便秘，热病无汗' , niComment: '脾经荥穴，倪师认为此穴治脾胃虚寒之腹胀、泄泻有效', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.21, y: 0.02, z: 0.185 }, }),
      pt('SP3', '太白', 1.5, 1.5, 'left', { cunZ: -1, isYuan: true, location: '在足内侧缘，足大趾本节后下方赤白肉际凹陷处', indications: '胃痛，腹胀，肠鸣，泄泻，便秘，痔漏，脚气', method: '正坐垂足或仰卧。在足大趾与足掌所构成的关节（第1跖趾关节）后下方掌背交界线处可触及一凹陷，按压有酸胀感，即为本穴。', specialPoint: '输穴，原穴',  niComment: '脾经原穴、输穴，倪师认为此穴为补脾要穴。治脾胃虚弱、消化不良特效', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.2, y: 0.025, z: 0.17 }, }),
      pt('SP4', '公孙', 2, 3, 'left', { cunZ: -1, isLuo: true, intersections: ['LR'], classicRef: '《甲乙经》云：在足大指本节后一寸，别走阳明', location: '在足内侧缘，第1跖骨基底前下方', indications: '胃痛，呕吐，腹痛，泄泻，痢疾，心烦失眠', method: '正坐垂足或仰卧；由足大趾与足掌所构成的关节（第1跖趾关节）内侧，往后用手推有一弓形骨（足弓）；在弓形骨前端下缘，可触及一凹陷，按压有酸胀感，即为本穴。', specialPoint: '络穴，八脉交会穴，通冲脉',  niComment: '脾经络穴，八脉交会穴通冲脉。倪师极常用此穴，治胃痛、呕吐特效。与内关配伍为倪师治疗胃病经典组合', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.205, y: 0.03, z: 0.155 }, }),
      pt('SP5', '商丘', 1.5, 3.5, 'left', { cunZ: -1, location: '在内踝前下方凹陷中，舟骨结节与内踝尖连线中点', indications: '腹胀，泄泻，便秘，黄疸，足踝痛', method: '正坐垂足或仰卧。足内踝前下方可触及一凹陷，按压有酸胀感，即为本穴。', specialPoint: '经穴',  niComment: '脾经经穴，倪师认为此穴治脾虚腹胀、足踝肿痛有效', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.188, y: 0.082, z: 0.05 }, }),
      pt('SP6', '三阴交', 1.5, 6, 'left', { cunZ: 0, intersections: ['KI', 'LR'], classicRef: '《甲乙经》云：在内踝上三寸，骨下陷者中，足太阴厥阴少阴之会', location: '在小腿内侧，内踝尖上3寸，胫骨内侧缘后方', indications: '肠鸣腹胀，泄泻，月经不调，带下，阴挺，不孕，遗精，阳痿，失眠', method: '正坐或仰卧位；手4指并拢，小指下边缘紧靠内踝尖上，食指（示指）上缘处，小腿内侧骨（胫骨）后方，即为本穴。', specialPoint: '足太阴、少阴、厥阴经交会穴',  niComment: '三阴交为肝脾肾三经交会穴，倪师极常用此穴。为妇科第一要穴，治一切妇科病。亦治失眠、遗精。孕妇禁用', needlingMethod: '直刺1～1.5寸', contraindications: '孕妇禁用', position3d: { x: -0.19, y: 0.288, z: 0.045 }, }),
      pt('SP7', '漏谷', 1.5, 9, 'left', { cunZ: 0, location: '在小腿内侧，内踝尖上6寸，胫骨内侧缘后方', indications: '腹胀，肠鸣，小便不利，遗精，下肢痿痹' , niComment: '倪师认为此穴治小便不利、下肢水肿有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.187, y: 0.408, z: 0.05 }, }),
      pt('SP8', '地机', 1.5, 12, 'left', { cunZ: 0, isXi: true, location: '在小腿内侧，阴陵泉下3寸', indications: '腹痛，泄泻，小便不利，水肿，月经不调，痛经', method: '正坐或仰卧位；确定阴陵泉:用拇指沿小腿内侧骨内缘（胫骨内缘）由下往上推，至拇指抵膝关节时，在小腿内侧骨（胫骨）向上弯曲处可触及一凹陷,即为阴陵泉；从阴陵泉垂直向下量4横指（食指（示指）、中指、无名指、小指四指并拢，以中指近端指间关节横纹水平的四指宽度为3寸，也称一夫法），小腿内侧骨（胫骨）后缘，即为本穴。', specialPoint: '郄穴',  niComment: '脾经郄穴，倪师认为此穴治痛经特效。为妇科止痛要穴', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.188, y: 0.33, z: 0.054 }, }),
      pt('SP9', '阴陵泉', 1.5, 18, 'left', { cunZ: 0, classicRef: '《甲乙经》云：在膝下内侧辅骨下陷者中', location: '在小腿内侧，胫骨内侧髁后下方凹陷处', indications: '腹胀，泄泻，水肿，黄疸，小便不利，膝痛', method: '正坐屈膝或仰卧位；用拇指沿小腿内侧骨内缘（胫骨内缘）由下往上推，至拇指抵膝关节时，在小腿内侧骨（胫骨）向上弯曲处可触及一凹陷，即为本穴。', specialPoint: '合穴',  niComment: '脾经合穴，倪师极常用此穴。为利水消肿第一要穴。治水肿、小便不利、黄疸特效。与足三里配伍为倪师健脾利湿经典组合', needlingMethod: '直刺1～2寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.187, y: 0.45, z: 0.055 }, }),
      pt('SP10', '血海', 2.5, 20, 'left', { cunZ: -1, classicRef: '《甲乙经》云：在膝髌上内廉白肉际二寸半', location: '在大腿内侧，髌底内侧端上2寸，股四头肌内侧头隆起处', indications: '月经不调，崩漏，经闭，瘾疹，湿疹，丹毒', method: '坐位，屈膝成90度；用左手掌心对准右膝盖骨（髌骨）上缘；二至五指向上伸直，拇指与其余四指约成45度斜置，拇指尖下，即为本穴。同样方法取左侧血海穴。',  niComment: '倪师极常用此穴。治血证第一要穴，治一切出血证、皮肤病（荨麻疹、湿疹）特效。活血化瘀要穴', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.19, y: 0.53, z: 0.05 }, }),
      pt('SP11', '箕门', 3, 28, 'left', { cunZ: -1, location: '在大腿内侧，血海与冲门连线上，血海上6寸', indications: '小便不利，遗尿，腹股沟肿痛' , niComment: '倪师认为此穴治小便不利、遗尿有效', needlingMethod: '避开动脉，直刺0.5～1寸', contraindications: '避开股动脉', position3d: { x: -0.1168, y: 0.6979, z: 0.1218 }, }),
      pt('SP12', '冲门', 3.5, 42, 'left', { cunZ: -4, intersections: ['LR'], location: '在腹股沟外侧，耻骨联合上缘中点旁开3.5寸', indications: '腹痛，疝气，崩漏，带下' , niComment: '倪师认为此穴治疝气、妇科疾病有效', needlingMethod: '避开动脉，直刺0.5～1寸', contraindications: '避开髂外动脉', position3d: { x: -0.1102, y: 0.8809, z: 0.1157 }, }),
      pt('SP13', '府舍', 3.5, 44, 'left', { cunZ: -4, intersections: ['LR'], location: '在下腹部，脐中下4寸，前正中线旁开4寸', indications: '腹痛，疝气，结聚' , niComment: '倪师认为此穴治腹痛、疝气有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1143, y: 0.9098, z: 0.1128 }, }),
      pt('SP14', '腹结', 3.5, 46, 'left', { cunZ: -4, location: '在下腹部，大横下1.3寸，前正中线旁开4寸', indications: '腹痛，泄泻，便秘，疝气' , niComment: '倪师认为此穴治腹痛、腹泻、疝气有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0859, y: 0.956, z: 0.1192 }, }),
      pt('SP15', '大横', 3.5, 47, 'left', { cunZ: -4, intersections: ['LR'], location: '在腹中部，脐中旁开4寸', indications: '泄泻，便秘，腹痛', method: '仰卧位；过乳头作一与前正中线平行的直线；沿脐中作一水平线；两线的交点，即为本穴。', specialPoint: '足太阴、阴维脉交会穴',  niComment: '倪师认为此穴治腹痛、便秘有效。常与天枢配伍', needlingMethod: '直刺1～2寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0849, y: 1.0256, z: 0.1224 }, }),
      pt('SP16', '腹哀', 3.5, 50, 'left', { cunZ: -4, location: '在上腹部，脐中上3寸，前正中线旁开4寸', indications: '消化不良，腹痛，便秘，痢疾' , niComment: '倪师认为此穴治腹痛、消化不良有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0842, y: 1.0957, z: 0.1251 }, }),
      pt('SP17', '食窦', 4, 56, 'left', { cunZ: -5, location: '在胸部，第5肋间隙，前正中线旁开6寸', indications: '胸胁胀痛，噫气，反胃，腹胀' , niComment: '倪师认为此穴治胸胁胀痛、腹胀有效', needlingMethod: '斜刺或向外平刺0.5～0.8寸', contraindications: '不可深刺', position3d: { x: -0.1246, y: 1.2334, z: 0.1231 }, }),
      pt('SP18', '天溪', 4, 57.5, 'left', { cunZ: -5, location: '在胸部，第4肋间隙，前正中线旁开6寸', indications: '胸胁疼痛，咳嗽，乳痈，乳汁少' , niComment: '倪师认为此穴治乳腺疾病、胸胁痛有效', needlingMethod: '斜刺或向外平刺0.5～0.8寸', contraindications: '不可深刺', position3d: { x: -0.1339, y: 1.2535, z: 0.1222 }, }),
      pt('SP19', '胸乡', 4, 59, 'left', { cunZ: -5, location: '在胸部，第3肋间隙，前正中线旁开6寸', indications: '胸胁胀痛' , niComment: '倪师认为此穴治胸胁胀满有效', needlingMethod: '斜刺或向外平刺0.5～0.8寸', contraindications: '不可深刺', position3d: { x: -0.14, y: 1.2812, z: 0.1184 }, }),
      pt('SP20', '周荣', 4, 60, 'left', { cunZ: -5, location: '在胸部，第2肋间隙，前正中线旁开6寸', indications: '咳嗽，气逆，胸胁胀满' , niComment: '倪师认为此穴治胸胁胀满、咳嗽有效', needlingMethod: '斜刺或向外平刺0.5～0.8寸', contraindications: '不可深刺', position3d: { x: -0.1425, y: 1.2931, z: 0.1146 }, }),
      pt('SP21', '大包', 5, 58, 'left', { cunZ: -4, classicRef: '《甲乙经》云：在渊腋下三寸，脾之大络', location: '在侧胸部，腋中线上，第6肋间隙处', indications: '气喘，胸胁痛，全身疼痛，四肢无力', method: '正坐侧身或仰卧；从乳头向下循摸两个间隙（乳头约平第4肋间隙）；该肋间隙与腋中线（沿腋窝中点向下所作的垂线）的交点处，即为本穴。', specialPoint: '脾之大络',  niComment: '脾之大络，倪师认为此穴治全身疼痛、胸胁痛有效。为总统诸络之穴', needlingMethod: '斜刺或向后平刺0.5～0.8寸', contraindications: '不可深刺', position3d: { x: -0.148147, y: 1.21397, z: 0.047313 }, }),
    ],
    pathCun: [
      wp(1, 0, 'left', -1), wp(1.5, 1.5, 'left', -1), wp(2, 3, 'left', -1),
      wp(1.5, 6, 'left', 0), wp(1.5, 18, 'left', 0), wp(2.5, 20, 'left', -1),
      wp(3.5, 42, 'left', -4), wp(3.5, 47, 'left', -4), wp(4, 58, 'left', -5),
      wp(5, 58, 'left', -4),
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 5. 手少阴心经 HEART (HT) — 9 points
  // ──────────────────────────────────────────────────────────
  {
    code: 'HT',
    name: '手少阴心经',
    nameEn: 'Heart Meridian of Hand-Shaoyin',
    wuxing: '火',
    organ: '心（脏）',
    color: '#8B1A1A',
    points: [
      pt('HT1', '极泉', 4, 60, 'left', { cunZ: -2, classicRef: '《甲乙经》云：在腋下筋间动脉入胸', location: '在腋窝顶点，腋动脉搏动处', indications: '心痛，心悸，胸闷，胁痛，肘臂冷痛', method: '上臂外展；在腋窝顶点，可触摸到动脉搏动处，按压有酸胀感，即为本穴。',  niComment: '倪师认为此穴治心脏病、胸闷、肩臂痛有效。针刺须避开腋动脉', needlingMethod: '避开腋动脉，直刺或斜刺0.3～0.5寸', contraindications: '避开腋动脉', position3d: { x: -0.2088, y: 1.3231, z: 0.0284 }, }),
      pt('HT2', '青灵', 3, 52, 'left', { cunZ: -2, location: '在臂内侧，少海与极泉连线上，肘横纹上3寸', indications: '头痛振寒，目黄，胁痛，肩臂痛' , niComment: '倪师认为此穴治肩臂疼痛、胁痛有效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.2369, y: 1.254, z: 0.03 }, }),
      pt('HT3', '少海', 2.5, 47, 'left', { cunZ: -2, classicRef: '《甲乙经》云：在肘内廉节后陷者中', location: '在肘横纹内侧端，屈肘时肘横纹尺侧端凹陷处', indications: '心痛，肘臂挛痛，腋胁痛，瘰疬', method: '屈肘成直角；肘横纹内侧端可触及一凹陷，按压有酸麻感，即为本穴。', specialPoint: '合穴',  niComment: '心经合穴，倪师认为此穴治肘臂挛痛、心痛有效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.3467, y: 1.1571, z: 0.0622 }, }),
      pt('HT4', '灵道', 1, 36.5, 'left', { cunZ: -1, location: '在前臂掌侧，腕横纹上1.5寸，尺侧腕屈肌腱桡侧', indications: '心痛，心悸，悲恐善笑，肘臂挛痛' , niComment: '心经经穴，倪师认为此穴治心痛、手臂挛急有效', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.457, y: 1.053, z: 0.2293 }, }),
      pt('HT5', '通里', 1, 35.5, 'left', { cunZ: -1, isLuo: true, classicRef: '《甲乙经》云：在腕后一寸，别走太阳', location: '在前臂掌侧，腕横纹上1寸，尺侧腕屈肌腱桡侧', indications: '心悸怔忡，暴喑，舌强，腕臂痛', method: '伸肘仰掌，用力握拳。在手前臂内侧可触摸到一条大筋（尺侧腕屈肌腱），从腕横纹沿此肌腱的外侧向上量1横指，按压有酸胀感，即为本穴。', specialPoint: '络穴',  niComment: '心经络穴，倪师认为此穴治心悸、失语有效。为沟通心经与心包经之要穴', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.4571, y: 1.052, z: 0.2316 }, }),
      pt('HT6', '阴郄', 1, 35, 'left', { cunZ: -1, isXi: true, location: '在前臂掌侧，腕横纹上0.5寸，尺侧腕屈肌腱桡侧', indications: '心痛，惊悸，骨蒸盗汗，吐血，衄血', method: '伸肘仰掌，用力握拳；在手前臂内侧可触摸到一条大筋（尺侧腕屈肌腱）；从近掌侧腕横纹沿此筋的外侧向上量半横指处（拇指指甲中点所对），即为本穴。', specialPoint: '郄穴',  niComment: '心经郄穴，倪师认为此穴治盗汗、心悸、心痛特效。为治盗汗要穴', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.4577, y: 1.051, z: 0.2335 }, }),
      pt('HT7', '神门', 1, 34.5, 'left', { cunZ: -1, isYuan: true, classicRef: '《甲乙经》云：在掌后兑骨之端陷者中', location: '在腕掌侧横纹尺侧端，尺侧腕屈肌腱桡侧凹陷处', indications: '心痛，心烦，惊悸怔忡，健忘失眠，癫狂', method: '伸肘仰掌，用力握拳；在手前臂内侧可触摸到一条大筋（尺侧腕屈肌腱）；在近掌侧腕横纹上，此筋的内侧，即为本穴。', specialPoint: '输穴，原穴',  niComment: '心经原穴、输穴，倪师极常用此穴。治失眠、心悸、焦虑特效。为宁心安神第一要穴。倪师临床治失眠几乎必用此穴', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.475, y: 1.038, z: 0.258 }, }),
      pt('HT8', '少府', 1.5, 32.5, 'left', { cunZ: -1, location: '在手掌面，第4、5掌骨之间，握拳时小指尖处', indications: '心悸，胸痛，小便不利，遗尿，阴痒，手小指拘挛' , niComment: '心经荥穴，倪师认为此穴治心胸烦闷、掌中热有效', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.49, y: 0.995, z: 0.315 }, }),
      pt('HT9', '少冲', 1, 28.5, 'left', { cunZ: -1, isJingWell: true, classicRef: '《甲乙经》云：在手小指内廉之端，去爪甲如韭叶', location: '在小指桡侧指甲角旁0.1寸', indications: '心悸，心痛，胸胁痛，癫狂，热病昏迷', method: '俯掌伸指。沿手小指指甲底部与小拇指桡侧缘引线（即掌背交界线，或称赤白肉际处）的交点处，即为本穴。', specialPoint: '井穴',  niComment: '心经井穴，倪师认为此穴点刺出血可急救昏迷、治心胸痛。为急救要穴', needlingMethod: '浅刺0.1寸，或点刺出血', contraindications: '一般无特殊禁忌', position3d: { x: -0.53, y: 0.95, z: 0.27 }, }),
    ],
    pathCun: [
      wp(4, 60, 'left', -2), wp(2.5, 47, 'left', -2), wp(1, 35.5, 'left', -1),
      wp(1, 34.5, 'left', -1), wp(1.5, 32.5, 'left', -1), wp(1, 28.5, 'left', -1),
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 6. 手太阳小肠经 SMALL INTESTINE (SI) — 19 points
  // ──────────────────────────────────────────────────────────
  {
    code: 'SI',
    name: '手太阳小肠经',
    nameEn: 'Small Intestine Meridian of Hand-Taiyang',
    wuxing: '火',
    organ: '小肠（腑）',
    color: '#8B1A1A',
    points: [
      pt('SI1', '少泽', 2.5, 28.5, 'left', { cunZ: 2, isJingWell: true, classicRef: '《甲乙经》云：在手小指之端外侧，去爪甲一分陷者中', location: '在小指尺侧指甲角旁0.1寸', indications: '乳痈，乳汁少，头痛，咽喉肿痛，中风昏迷，热病', method: '俯掌伸指。沿手小指指甲底部与小指尺侧缘引线（即掌背交界线，或称赤白肉际处）的交点处，距指甲角约0.1寸，即为本穴。', specialPoint: '井穴',  niComment: '小肠经井穴，倪师认为此穴治产后缺乳特效。点刺出血可退热', needlingMethod: '浅刺0.1寸，或点刺出血', contraindications: '孕妇慎用', position3d: { x: -0.535, y: 0.95, z: 0.255 }, }),
      pt('SI2', '前谷', 2.5, 29.5, 'left', { cunZ: 2, location: '在手尺侧，第5掌指关节前凹陷处', indications: '头痛，目痛，耳鸣，咽喉肿痛，手指麻木' , niComment: '小肠经荥穴，倪师认为此穴治耳鸣、咽喉肿痛有效', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.52, y: 1, z: 0.255 }, }),
      pt('SI3', '后溪', 2.5, 31, 'left', { cunZ: 2, intersections: ['DU'], location: '在手尺侧，第5掌指关节后凹陷处，赤白肉际', indications: '头项强痛，腰背痛，手指挛痛，癫狂，疟疾', method: '仰掌握拳；在手掌内（尺）侧，小指掌指关节后，有一皮肤皱襞突起，其尖端（远侧掌横纹头赤白肉际）处，即为本穴。', specialPoint: '输穴，八脉交会穴，通督脉',  niComment: '八脉交会穴通督脉，倪师极常用此穴。治颈项强痛、腰背痛、癫痫特效。倪师认为后溪通督脉，可治脊柱相关疾病', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.51, y: 1.012, z: 0.248 }, }),
      pt('SI4', '腕骨', 3, 33, 'left', { cunZ: 2, isYuan: true, location: '在手尺侧，第5掌骨基底与三角骨之间凹陷处', indications: '头项强痛，耳鸣，目翳，黄疸，热病，指挛腕痛', method: '微握拳，掌心向胸。由后溪（参见“后溪”）向腕部推，可摸到两块骨头（第5掌骨基底与三角骨），在两骨的结合部、掌背面交界处可触及一凹陷处，即为本穴。', specialPoint: '原穴',  niComment: '小肠经原穴，倪师认为此穴治黄疸、腕关节疼痛有效', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.495, y: 1.03, z: 0.24 }, }),
      pt('SI5', '阳谷', 3, 34.5, 'left', { cunZ: 2, location: '在腕背横纹尺侧端，尺骨茎突前凹陷处', indications: '头痛目眩，耳鸣耳聋，腕臂酸痛，癫狂' , niComment: '小肠经经穴，倪师认为此穴治耳鸣、腕痛有效', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.48, y: 1.038, z: 0.228 }, }),
      pt('SI6', '养老', 3, 35.5, 'left', { cunZ: 2, isXi: true, location: '在前臂背面尺侧，尺骨小头近端桡侧凹陷处', indications: '目视不明，肩背肘臂酸痛，急性腰痛', method: '屈肘，掌心向胸；在手腕部小指侧可摸到一凸起的高骨；沿高骨的最高点往大拇指侧（桡侧）推，可触及一骨缝，即为本穴。', specialPoint: '郄穴',  niComment: '小肠经郄穴，倪师认为此穴治急性腰痛、目视不明特效。为治疗老年眼病要穴', needlingMethod: '直刺或斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.4469, y: 1.075, z: 0.1638 }, }),
      pt('SI7', '支正', 3, 38, 'left', { cunZ: 1.5, isLuo: true, location: '在前臂背面尺侧，阳谷上5寸', indications: '头痛目眩，项强，肘臂手指挛痛，癫狂', method: '屈肘俯掌。先确定阳谷（参见“阳谷”）与小海（参见“小海”）的位置。取阳谷与小海连线的中点处再向下量1横指处，即为本穴。', specialPoint: '络穴',  niComment: '小肠经络穴，倪师认为此穴治癫狂、项强有效', needlingMethod: '直刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.4284, y: 1.09, z: 0.1391 }, }),
      pt('SI8', '小海', 3.5, 47, 'left', { cunZ: 2, location: '在肘内侧，尺骨鹰嘴与肱骨内上髁之间凹陷处', indications: '肘臂疼痛，癫痫，耳鸣', method: '屈肘；在肘尖（尺骨鹰嘴嘴）最高点与肘部内侧高骨（肱骨内上髁）最高点之间可触及一凹陷，即为本穴。', specialPoint: '合穴',  niComment: '小肠经合穴，倪师认为此穴治肘臂疼痛、癫痫有效', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.3575, y: 1.1512, z: 0.0486 }, }),
      pt('SI9', '肩贞', 5, 62, 'left', { cunZ: 1.5, location: '在肩关节后下方，腋后纹头上1寸', indications: '肩臂疼痛，耳鸣耳聋，瘰疬', method: '正坐垂肩，上臂内收；从腋后纹头向上量1横指处，即为本穴。',  niComment: '倪师认为此穴治肩周炎、肩臂疼痛有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.2113, y: 1.3231, z: 0.0108 }, }),
      pt('SI10', '臑俞', 5, 63, 'left', { cunZ: 2, intersections: ['TE'], location: '在肩部，腋后纹头直上，肩胛冈下缘凹陷处', indications: '肩臂酸痛无力，瘰疬' , niComment: '倪师认为此穴治肩臂不举有效。为手太阳、阳维、阳跷之会', needlingMethod: '直刺或斜刺0.5～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.2118, y: 1.3262, z: 0.0108 }, }),
      pt('SI11', '天宗', 4, 62, 'left', { cunZ: 3, location: '在肩胛部，冈下窝中央凹陷处，与第4胸椎相平', indications: '肩胛疼痛，肘臂外后侧痛，气喘，乳痈', method: '正坐垂肩；确定肩胛冈：肩胛冈是肩膀后一横行的突起，自己右手搭左肩手指摸到的骨头；将肩胛冈下缘中点与肩胛下角连线分为三等分，当连线的上1/3与下2/3交点处即为本穴。',  niComment: '倪师极常用此穴，治肩胛痛特效。按揉天宗穴可治乳腺增生、乳痈', needlingMethod: '直刺或斜刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.2134, y: 1.2703, z: 0.0111 }, }),
      pt('SI12', '秉风', 4.5, 63, 'left', { cunZ: 3, intersections: ['TE', 'BL'], location: '在肩胛部，冈上窝中央，天宗直上', indications: '肩胛疼痛，上肢酸麻', method: '正坐位。由天宗（参见“天宗”）直上跨过一斜向骨头（即肩胛冈）至凹陷中点处，用力按压有明显酸胀感，即为本穴。', specialPoint: '手三阳与足少阳经交会穴',  niComment: '倪师认为此穴治肩胛部疼痛有效', needlingMethod: '直刺或斜刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.2134, y: 1.2703, z: 0.0111 }, }),
      pt('SI13', '曲垣', 3.5, 64, 'left', { cunZ: 3, location: '在肩胛部，冈上窝内侧端，臑俞与第2胸椎连线中点', indications: '肩胛疼痛拘挛' , niComment: '倪师认为此穴治肩胛疼痛有效', needlingMethod: '直刺或斜刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.2118, y: 1.3262, z: 0.0108 }, }),
      pt('SI14', '肩外俞', 2.5, 64, 'left', { cunZ: 3, location: '在背部，第1胸椎棘突下旁开3寸', indications: '肩背酸痛，颈项强痛，咳嗽', method: '坐位低头或俯伏位；在后正中线上，可见颈背部交界处椎骨上有一高突；从此高突往下推1个椎骨，在这一椎骨下凹陷作一水平线；该水平线与肩胛骨内侧缘延长线的交点处，即为本穴。',  niComment: '倪师认为此穴治肩背疼痛、颈项强急有效', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.211, y: 1.3439, z: 0.011 }, }),
      pt('SI15', '肩中俞', 1.5, 65, 'left', { cunZ: 3, location: '在背部，第7颈椎棘突下旁开2寸', indications: '咳嗽，气喘，肩背疼痛，目视不明', method: '坐位低头或俯伏位；在后正中线上，可见颈背部交界处椎骨上有一高突；这一高突能随颈部左右摆动而转动即是第7颈椎棘突；在第7颈椎棘突下，即大椎穴，旁开2横指（大拇指指间关节部位的横径为1寸）即为本穴。',  niComment: '倪师认为此穴治肩背疼痛、咳嗽有效', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.2077, y: 1.4023, z: -0.0121 }, }),
      pt('SI16', '天窗', 2.5, 67, 'left', { cunZ: 0, location: '在颈外侧，胸锁乳突肌后缘，扶突后0.5寸', indications: '耳鸣耳聋，咽喉肿痛，颈项强痛，暴喑' , niComment: '倪师认为此穴治耳鸣、耳聋、咽喉肿痛有效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.2043, y: 1.4056, z: -0.0094 }, }),
      pt('SI17', '天容', 2, 68, 'left', { cunZ: -1, location: '在颈外侧部，下颌角后方，胸锁乳突肌前缘凹陷处', indications: '耳鸣耳聋，咽喉肿痛，颈项肿痛' , niComment: '倪师认为此穴治耳鸣、咽喉肿痛有效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1975, y: 1.416, z: 0.002 }, }),
      pt('SI18', '颧髎', 1.8, 70.5, 'left', { cunZ: -3, location: '在面部，颧骨下缘凹陷处，目外眦直下', indications: '口眼歪斜，眼睑瞤动，齿痛，面痛' , niComment: '倪师认为此穴治面瘫、三叉神经痛有效', needlingMethod: '直刺0.3～0.5寸，斜刺或平刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.041, y: 1.5058, z: 0.1146 }, }),
      pt('SI19', '听宫', 2, 71, 'left', { cunZ: -2, intersections: ['TE', 'GB'], classicRef: '《甲乙经》云：在耳中如珠子大', location: '在耳屏前，下颌骨髁状突后方，张口凹陷处', indications: '耳鸣耳聋，聤耳，齿痛，癫狂痫', method: '侧坐位，微张口；在耳屏前与下颌关节之间可触及一凹陷，闭口是凹陷即闭处，即为本穴。', specialPoint: '手足少阳、手太阳交会穴',  niComment: '倪师极常用此穴，治耳鸣、耳聋特效。为治耳病要穴。须张口取穴', needlingMethod: '张口，直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.051211, y: 1.51999, z: 0.0748 }, }),
    ],
    pathCun: [
      wp(2.5, 28.5, 'left', 2), wp(3, 34.5, 'left', 2), wp(3.5, 47, 'left', 2),
      wp(5, 62, 'left', 1.5), wp(4, 62, 'left', 3), wp(2.5, 64, 'left', 3),
      wp(2, 67, 'left', 0), wp(1.8, 70.5, 'left', -3), wp(2, 71, 'left', -2),
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 7. 足太阳膀胱经 BLADDER (BL) — 67 points (key points listed)
  // ──────────────────────────────────────────────────────────
  {
    code: 'BL',
    name: '足太阳膀胱经',
    nameEn: 'Bladder Meridian of Foot-Taiyang',
    wuxing: '水',
    organ: '膀胱（腑）',
    color: '#1A1A2E',
    points: [
      pt('BL1', '睛明', 0.5, 71, 'left', { cunZ: -4, intersections: ['TE', 'GB', 'DU'], classicRef: '《甲乙经》云：在目内眦外', location: '在面部，目内眦角稍上方凹陷处', indications: '目赤肿痛，流泪，视物不明，目眩，近视', method: '正坐合眼。手指置于内侧眼角稍上方，轻轻按压可感有一凹陷处，即为本穴。', specialPoint: '手、足太阳、足阳明、阴蹻、阳蹻脉交会穴',  niComment: '倪师认为此穴治一切眼病特效。针刺须非常小心，禁捻转提插。治近视、青光眼、白内障等眼疾', needlingMethod: '嘱患者闭目，医者左手轻推眼球向外侧固定，右手缓慢进针，紧靠眶缘直刺0.5～1寸。不捻转，不提插，出针后按压针孔片刻，以防出血', contraindications: '禁捻转提插，出针后按压防出血', position3d: { x: -0.0301, y: 1.5109, z: 0.1372 }, }),
      pt('BL2', '攒竹', 0.8, 72, 'left', { cunZ: -4, location: '在面部，眉头凹陷中，眶上切迹处', indications: '头痛，眉棱骨痛，目视不明，目赤肿痛，面瘫', method: '正坐或仰卧位；皱眉，可见眉毛内侧端有一隆起，即为本穴。',  niComment: '倪师极常用此穴，治眉棱骨痛、前额头痛特效。亦治眼睑下垂、面瘫', needlingMethod: '平刺0.5～0.8寸，或向鱼腰穴透刺', contraindications: '一般无特殊禁忌', position3d: { x: -0.0289, y: 1.5351, z: 0.1468 }, }),
      pt('BL3', '眉冲', 1, 73, 'left', { cunZ: -3, location: '在头部，攒竹直上，入发际0.5寸', indications: '头痛，眩晕，鼻塞，痫证' , niComment: '倪师认为此穴治前额头痛、鼻塞有效', needlingMethod: '平刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.033, y: 1.5548, z: 0.1444 }, }),
      pt('BL4', '曲差', 1.5, 73, 'left', { cunZ: -3, location: '在头部，前发际正中直上0.5寸，旁开1.5寸', indications: '头痛，鼻塞，鼻衄，目视不明' , niComment: '倪师认为此穴治头痛、鼻塞有效', needlingMethod: '平刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0482, y: 1.5687, z: 0.1368 }, }),
      pt('BL5', '五处', 1.5, 74, 'left', { cunZ: -2, intersections: ['DU'], location: '在头部，前发际正中直上1寸，旁开1.5寸', indications: '头痛，目眩，痫证' , niComment: '倪师认为此穴治头痛、癫痫有效', needlingMethod: '平刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0511, y: 1.5725, z: 0.1352 }, }),
      pt('BL6', '承光', 1.8, 75, 'left', { cunZ: -1, location: '在头部，前发际正中直上2.5寸，旁开1.5寸', indications: '头痛，眩晕，鼻塞，热病无汗' , niComment: '倪师认为此穴治头痛、目眩有效', needlingMethod: '平刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0523, y: 1.5867, z: 0.1329 }, }),
      pt('BL7', '通天', 2, 75, 'left', { cunZ: 0, location: '在头部，前发际正中直上4寸，旁开1.5寸', indications: '头痛，眩晕，鼻塞，鼻衄，鼻炎', method: '正坐位。取一标明三等分的弹性皮筋，拉长皮筋，使其两端点分别对应前后发际起点，从前发际往后1/3点旁开2横指（食、中指），按压有痛感处，即为本穴。',  niComment: '倪师认为此穴治鼻渊、鼻塞特效。为治鼻病要穴', needlingMethod: '平刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0517, y: 1.6037, z: 0.1323 }, }),
      pt('BL8', '络却', 2, 75, 'left', { cunZ: 1, location: '在头部，前发际正中直上5.5寸，旁开1.5寸', indications: '头晕，目视不明，耳鸣，癫狂' , niComment: '倪师认为此穴治眩晕、耳鸣有效', needlingMethod: '平刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0584, y: 1.618, z: 0.1285 }, }),
      pt('BL9', '玉枕', 1.5, 74, 'left', { cunZ: 4, location: '在后头部，后发际正中直上2.5寸，旁开1.3寸', indications: '头项痛，目痛，鼻塞' , niComment: '倪师认为此穴治后头痛、目痛有效', needlingMethod: '平刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0628, y: 1.6199, z: -0.0136 }, }),
      pt('BL10', '天柱', 1.5, 66, 'left', { cunZ: 4, location: '在项部，后发际正中直上0.5寸，旁开1.3寸', indications: '头痛，项强，鼻塞，肩背痛，热病', method: '正坐低头；触摸颈后部，有两条大筋（斜方肌）；在该大筋外侧缘、后发际缘可触及一凹陷，即为本穴。',  niComment: '倪师认为此穴治颈项强痛、后头痛特效。为治颈椎病要穴', needlingMethod: '直刺或斜刺0.5～0.8寸，不可向内上方深刺', contraindications: '不可向内上方深刺', position3d: { x: -0.0863, y: 1.4542, z: -0.0296 }, }),
      pt('BL11', '大杼', 1.5, 63, 'left', { position3d: { x: -0.074145, y: 1.393198, z: -0.066929 }, cunZ: 5, intersections: ['TE'], classicRef: '《甲乙经》云：在项第一椎下两旁各一寸五分陷者中', location: '在背部，第1胸椎棘突下，旁开1.5寸', indications: '咳嗽，发热，鼻塞，头痛，肩背痛，颈项强急', method: '正坐低头；在后正中线上，颈背部交界处，可触及一椎骨高突（第7颈椎棘突）；从该高突向下推1个椎体棘突，在从其下缘旁开量2横指(食指、中指并拢，以中指近端指间关节横纹水平的二指宽度为1.5寸）处，即为本穴。', specialPoint: '八会穴',  niComment: '八会穴之骨会，倪师认为此穴治骨病、颈项强痛有效。为督脉别络', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌'}),
      pt('BL12', '风门', 1.5, 62.5, 'left', { cunZ: 5, intersections: ['DU'], location: '在背部，第2胸椎棘突下，旁开1.5寸', indications: '伤风咳嗽，发热头痛，项强，胸背痛', method: '正坐低头；确定后正中线：即在背部中央所作的垂直线；在后正中线上，可见颈背部交界处椎骨上有一高突；这一高突能随颈部左右摆动而转动即是第7颈椎棘突；由第7颈椎棘突垂直往下推2个椎体棘突即是第2胸椎棘突；在第2胸椎棘突下与肩胛内缘作一水平线，此水平线中点即为本穴。', specialPoint: '足太阳、督脉交会穴',  niComment: '倪师极常用此穴，治感冒、咳嗽特效。为风邪入侵之门户，艾灸风门可预防感冒', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1512, y: 1.3807, z: -0.0623 }, }),
      pt('BL13', '肺俞', 1.5, 61.5, 'left', { cunZ: 5, classicRef: '《甲乙经》云：在第三椎下两旁各一寸五分', location: '在背部，第3胸椎棘突下，旁开1.5寸', indications: '咳嗽，气喘，咯血，鼻塞，潮热盗汗， skin瘙痒', method: '正坐低头；确定后正中线：即在背部中央所作的垂直线；在后正中线上，可见颈背部交界处椎骨上有一高突；这一高突能随颈部左右摆动而转动即是第7颈椎棘突；由第7颈椎棘突垂直往下推3个椎体棘突即是第3胸椎棘突；在第3胸椎棘突下与肩胛内缘作一水平线，此水平线中点即为本穴。', specialPoint: '肺之背俞穴',  niComment: '肺之背俞穴，倪师极常用此穴。治一切肺系疾病特效。治哮喘、慢性支气管炎、肺气肿。倪师认为肺俞为治肺病第一要穴', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1524, y: 1.3608, z: -0.0653 }, }),
      pt('BL14', '厥阴俞', 1.5, 61, 'left', { cunZ: 5, location: '在背部，第4胸椎棘突下，旁开1.5寸', indications: '心痛，心悸，胸闷，咳嗽，呕吐', method: '正坐低头。由第7颈椎棘突往下推4个椎体棘突（即第4胸椎棘突），再从其下缘旁开量2横指，按压有酸胀感处，即为本穴。', specialPoint: '心包之背俞穴',  niComment: '心包之背俞穴，倪师认为此穴治心痛、胸闷有效', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.148184, y: 1.343933, z: -0.063628 }, }),
      pt('BL15', '心俞', 1.5, 60.5, 'left', { position3d: { x: -0.160934, y: 1.337126, z: -0.056469 }, cunZ: 5, classicRef: '《甲乙经》云：在第五椎下两旁各一寸五分', location: '在背部，第5胸椎棘突下，旁开1.5寸', indications: '心痛，惊悸，失眠，健忘，癫痫，咳嗽，盗汗', method: '俯卧位或正坐位；在上臂自然下垂时贴于胸侧壁时确定肩胛下角；从两侧肩胛下角连线与后正中线相交处所在椎体为第7胸椎；从第7胸椎棘突垂直向上推2个椎体棘突即是第5胸椎棘突；在第5胸椎棘突下有一凹陷，此凹陷旁开2横指(食指、中指并拢，以中指近端指间关节横纹水平的二指宽度为1.5寸），即为本穴。', specialPoint: '心之背俞穴',  niComment: '心之背俞穴，倪师极常用此穴。治心脏病、失眠、心悸特效。倪师认为心俞为治心病第一要穴', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌'}),
      pt('BL16', '督俞', 1.5, 60, 'left', { cunZ: 5, location: '在背部，第6胸椎棘突下，旁开1.5寸', indications: '心痛，胸闷，腹胀，肠鸣，呃逆' , niComment: '倪师认为此穴治心痛、腹胀有效', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1485, y: 1.3004, z: -0.0587 }, }),
      pt('BL17', '膈俞', 1.5, 59.5, 'left', { position3d: { x: -0.16146, y: 1.336529, z: -0.056136 }, cunZ: 5, classicRef: '《甲乙经》云：在第七椎下两旁各一寸五分，血会', location: '在背部，第7胸椎棘突下，旁开1.5寸', indications: '呕吐，呃逆，气喘，咳嗽，吐血，潮热盗汗，血虚', method: '俯卧位或正坐位；在上臂自然下垂时贴于胸侧壁时确定肩胛下角；从两侧肩胛下角连线与后正中线相交处所在椎体为第7胸椎；在第7胸椎的棘突下有一凹陷，此凹陷旁开2横指(食指、中指并拢，以中指近端指间关节横纹水平的二指宽度为1.5寸），即为本穴。', specialPoint: '八会穴（血会）',  niComment: '八会穴之血会，倪师极常用此穴。治一切血证特效。治贫血、出血、瘀血。倪师认为血病皆可取膈俞', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌'}),
      pt('BL18', '肝俞', 1.5, 58.5, 'left', { position3d: { x: -0.160714, y: 1.336431, z: -0.056497 }, cunZ: 5, classicRef: '《甲乙经》云：在第九椎下两旁各一寸五分', location: '在背部，第9胸椎棘突下，旁开1.5寸', indications: '黄疸，胁痛，目赤，目眩，癫狂痫，脊背痛', method: '俯卧位或正坐位在上臂自然下垂时贴于胸侧壁时确定肩胛下角；从两侧肩胛下角连线与后正中线相交处所在椎体为第7胸椎；从第7胸椎棘突垂直向下推2个椎体棘突即是第9胸椎棘突；在第9胸椎棘突下有一凹陷，此凹陷旁开2横指(食指、中指并拢，以中指近端指间关节横纹水平的二指宽度为1.5寸），即为本穴。', specialPoint: '肝之背俞穴',  niComment: '肝之背俞穴，倪师极常用此穴。治肝病、眼病、胁痛特效。倪师认为肝开窍于目，肝俞可治一切眼疾', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌'}),
      pt('BL19', '胆俞', 1.5, 58, 'left', { position3d: { x: -0.122568, y: 1.316431, z: -0.073417 }, cunZ: 5, location: '在背部，第10胸椎棘突下，旁开1.5寸', indications: '黄疸，口苦，胁痛，呕吐，食不下，潮热', method: '俯卧位或正坐位在上臂自然下垂时贴于胸侧壁时确定肩胛下角；从两侧肩胛下角连线与后正中线相交处所在椎体为第7胸椎；从第7胸椎棘突垂直向下推3个椎体棘突即是第10胸椎棘突；在第10胸椎棘突下有一凹陷，此凹陷旁开2横指(食指、中指并拢，以中指近端指间关节横纹水平的二指宽度为1.5寸），即为本穴。', specialPoint: '胆之背俞穴',  niComment: '胆之背俞穴，倪师认为此穴治胆囊炎、胆结石、黄疸特效', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌'}),
      pt('BL20', '脾俞', 1.5, 57.5, 'left', { position3d: { x: -0.122644, y: 1.315917, z: -0.073367 }, cunZ: 5, classicRef: '《甲乙经》云：在第十一椎下两旁各一寸五分', location: '在背部，第11胸椎棘突下，旁开1.5寸', indications: '腹胀，泄泻，呕吐，黄疸，水肿，背痛', method: '正坐或俯卧位；取一线过肚脐中点，水平绕腰腹一周；该线与后正中线交点，即为第2腰椎；从第2腰椎棘突垂直向上推3个椎体，即是第11胸椎棘突；在第11胸椎棘突下有一凹陷，此凹陷旁开2横指(食指、中指并拢，以中指近端指间关节横纹水平的二指宽度为1.5寸），即为本穴。', specialPoint: '脾之背俞穴',  niComment: '脾之背俞穴，倪师极常用此穴。治脾胃虚弱、消化不良、水肿特效。倪师认为脾为后天之本，脾俞为健脾要穴', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌'}),
      pt('BL21', '胃俞', 1.5, 57, 'left', { position3d: { x: -0.096856, y: 1.290987, z: -0.08191 }, cunZ: 5, location: '在背部，第12胸椎棘突下，旁开1.5寸', indications: '胃脘痛，呕吐，腹胀，肠鸣，胸胁痛', method: '正坐或俯卧位；两侧骨盆最高点（髂嵴最高点)连线与后正中线的交点处，为第4腰椎棘突；从第4腰椎棘突垂直往上推4个椎体，即是第12胸椎棘突；在第12胸椎棘突下有一凹陷，此凹陷旁开2横指(食指、中指并拢，以中指近端指间关节横纹水平的二指宽度为1.5寸），即为本穴。', specialPoint: '胃之背俞穴',  niComment: '胃之背俞穴，倪师极常用此穴。治胃痛、呕吐、消化不良特效。与足三里配伍为倪师治胃病经典组合', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌'}),
      pt('BL22', '三焦俞', 1.5, 55.5, 'left', { position3d: { x: -0.021657, y: 1.176946, z: -0.05851 }, cunZ: 5, location: '在腰部，第1腰椎棘突下，旁开1.5寸', indications: '腹胀，呕吐，泄泻，痢疾，水肿，腰背强痛', method: '正坐或俯卧位；两侧骨盆最高点（髂嵴最高点)连线与后正中线的交点处，为第4腰椎棘突；从第4腰椎棘突垂直往上推3个椎体，即是第1腰椎棘突；在第1腰椎棘突下有一凹陷，此凹陷旁开2横指(食指、中指并拢，以中指近端指间关节横纹水平的二指宽度为1.5寸），即为本穴。', specialPoint: '三焦之背俞穴',  niComment: '三焦之背俞穴，倪师认为此穴治水肿、腹胀、腰痛有效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌'}),
      pt('BL23', '肾俞', 1.5, 55, 'left', { position3d: { x: -0.020544, y: 1.176023, z: -0.058463 }, cunZ: 5, classicRef: '《甲乙经》云：在第十四椎下两旁各一寸五分', location: '在腰部，第2腰椎棘突下，旁开1.5寸', indications: '腰痛，遗精，阳痿，遗尿，月经不调，耳聋，耳鸣，水肿', method: '坐位；过肚脐中点绕腰腹一周作一线；该线与后正中线的交点即为第2腰椎棘突；在第2腰椎棘突下有一凹陷，此凹陷旁开2横指(食指、中指并拢，以中指近端指间关节横纹水平的二指宽度为1.5寸），即为本穴。', specialPoint: '肾之背俞穴',  niComment: '肾之背俞穴，倪师极常用此穴。治肾虚诸证特效。治腰痛、耳鸣、遗精、阳痿。倪师认为肾俞为补肾第一要穴，肾为先天之本', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌'}),
      pt('BL24', '气海俞', 1.5, 54, 'left', { cunZ: 5, location: '在腰部，第3腰椎棘突下，旁开1.5寸', indications: '腰痛，痛经，痔漏' , niComment: '倪师认为此穴治腰痛、痛经有效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1142, y: 1.1101, z: -0.0273 }, }),
      pt('BL25', '大肠俞', 1.5, 53, 'left', { position3d: { x: -0.04841, y: 1.131446, z: -0.05482 }, cunZ: 5, location: '在腰部，第4腰椎棘突下，旁开1.5寸', indications: '腹胀，泄泻，便秘，腰痛，腿痛', method: '正坐或俯卧位；两侧骨盆最高点（髂嵴最高点)连线与后正中线的交点处，为第4腰椎棘突；在第4腰椎棘突下有一凹陷，此凹陷旁开2横指(食指、中指并拢，以中指近端指间关节横纹水平的二指宽度为1.5寸），即为本穴。', specialPoint: '大肠之背俞穴',  niComment: '大肠之背俞穴，倪师极常用此穴。治腰痛、便秘、腹泻特效。倪师认为此穴治腰椎间盘突出症有效', needlingMethod: '直刺0.8～1.2寸', contraindications: '一般无特殊禁忌'}),
      pt('BL26', '关元俞', 1.5, 52, 'left', { cunZ: 5, location: '在腰部，第5腰椎棘突下，旁开1.5寸', indications: '腹胀泄泻，小便频数，腰痛，遗尿' , niComment: '倪师认为此穴治腰痛、遗尿、腹胀有效', needlingMethod: '直刺0.8～1.2寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1122, y: 1.06, z: -0.0217 }, }),
      pt('BL27', '小肠俞', 1.5, 50, 'left', { position3d: { x: -0.079013, y: 1.113591, z: -0.045195 }, cunZ: 5, location: '在骶部，第1骶椎棘突下，旁开1.5寸', indications: '遗精，遗尿，尿血，白带，小腹胀痛，泄泻痢疾', method: '俯卧位；从骨盆后面髂嵴最高点向内下方骶角两侧循摸，可触及一高骨突起（即髂后上棘）；与此高骨平齐的髂骨正中突起处是第1骶椎，从第1骶椎旁开2横指(食指、中指并拢，以中指近端指间关节横纹水平的二指宽度为1.5寸），即为本穴。', specialPoint: '小肠之背俞穴',  niComment: '小肠之背俞穴，倪师认为此穴治小腹胀痛、遗精、泄泻有效', needlingMethod: '直刺或斜刺0.8～1.2寸', contraindications: '一般无特殊禁忌'}),
      pt('BL28', '膀胱俞', 1.5, 49, 'left', { position3d: { x: -0.064378, y: 1.115558, z: -0.050527 }, cunZ: 5, location: '在骶部，第2骶椎棘突下，旁开1.5寸', indications: '小便不利，遗尿，泄泻，便秘，腰脊强痛', method: '俯卧位；骨盆后，从髂嵴最高点向内下方骶角两侧循摸一高谷突起，即是髂后上棘；髂后上棘内缘下与背脊正中线之间为第2骶后孔；从第2骶后孔作一水平线与骶后正中线相交；从该交点旁开2横指(食指、中指并拢，以中指近端指间关节横纹水平的二指宽度为1.5寸），即为本穴。', specialPoint: '膀胱之背俞穴',  niComment: '膀胱之背俞穴，倪师认为此穴治小便不利、遗尿、腰骶痛有效', needlingMethod: '直刺或斜刺0.8～1.2寸', contraindications: '一般无特殊禁忌'}),
      pt('BL29', '中膂俞', 1.5, 47, 'left', { cunZ: 5, location: '在骶部，第3骶椎棘突下，旁开1.5寸', indications: '泄泻，疝气，腰脊强痛' , niComment: '倪师认为此穴治腰骶痛、痢疾有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1237, y: 0.9874, z: -0.0361 }, }),
      pt('BL30', '白环俞', 1.5, 45, 'left', { cunZ: 5, location: '在骶部，第4骶椎棘突下，旁开1.5寸', indications: '遗尿，疝气，白带，月经不调，腰腿痛' , niComment: '倪师认为此穴治白带过多、遗精、腰骶痛有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1255, y: 0.9664, z: -0.0378 }, }),
      pt('BL31', '上髎', 1.5, 43, 'left', { cunZ: 5, location: '在骶部，第1骶后孔中', indications: '大小便不利，月经不调，带下，阴挺，腰痛' , niComment: '倪师认为此穴治腰骶痛、妇科病有效。八髎穴之一', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1315, y: 0.9544, z: -0.0336 }, }),
      pt('BL32', '次髎', 1.5, 42, 'left', { cunZ: 5, location: '在骶部，第2骶后孔中', indications: '疝气，月经不调，痛经，带下，小便不利，腰痛', method: '俯卧；从骨盆后面髂嵴最高点向内下方骶角两侧循摸可及一高骨突起（即髂后上棘），与之平齐的髂骨正中突起处为第1骶椎；在第1骶椎之下的椎体，即为第2骶椎；髂后上棘与第2骶椎之间的凹陷处，即为本穴。',  niComment: '倪师极常用此穴，治痛经特效。为八髎穴中最常用者。治妇科病、腰骶痛要穴', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1364, y: 0.936, z: -0.0353 }, }),
      pt('BL33', '中髎', 1.5, 41, 'left', { cunZ: 5, location: '在骶部，第3骶后孔中', indications: '便秘，泄泻，小便不利，月经不调，腰痛' , niComment: '倪师认为此穴治腰骶痛、月经不调有效。八髎穴之一', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.136457, y: 0.907794, z: -0.050647 }, }),
      pt('BL34', '下髎', 1.5, 40, 'left', { cunZ: 5, location: '在骶部，第4骶后孔中', indications: '腹痛，便秘，小便不利，带下，腰痛' , niComment: '倪师认为此穴治腰骶痛、小腹痛有效。八髎穴之一', needlingMethod: '直刺1～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.136457, y: 0.907794, z: -0.050647 }, }),
      pt('BL35', '会阳', 1.5, 39, 'left', { cunZ: 5, location: '在骶部，尾骨端旁开0.5寸', indications: '痢疾，泄泻，痔疾，阳痿，带下' , niComment: '倪师认为此穴治痔疮、泄泻有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1137, y: 0.8811, z: -0.0844 }, }),
      pt('BL36', '承扶', 0, 36, 'left', { cunZ: 6, location: '在大腿后面，臀下横纹中点', indications: '腰骶臀股部疼痛，痔疾' , niComment: '倪师认为此穴治腰腿痛、坐骨神经痛有效', needlingMethod: '直刺1～2寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1097, y: 0.8698, z: -0.0874 }, }),
      pt('BL37', '殷门', 0, 28, 'left', { cunZ: 5, location: '在大腿后面，承扶下6寸', indications: '腰痛，下肢痿痹', method: '取臀后横纹中点及腘横纹中点之连线的中点（臀横纹至膝中可作14寸折量），由此往上1横指处为取穴部位。',  niComment: '倪师极常用此穴，治急性腰扭伤、坐骨神经痛特效。倪师认为殷门为治腰痛要穴', needlingMethod: '直刺1～2寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1235, y: 0.7175, z: -0.0523 }, }),
      pt('BL38', '浮郄', 1, 21, 'left', { cunZ: 4, location: '在腘横纹外侧端，委阳上1寸', indications: '便秘，股腘部疼痛，麻木' , niComment: '倪师认为此穴治腘窝部疼痛有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.13, y: 0.5257, z: -0.0312 }, }),
      pt('BL39', '委阳', 1.5, 19, 'left', { cunZ: 4, intersections: ['TE'], location: '在腘横纹外侧端，股二头肌腱内侧', indications: '腹满，小便不利，腰脊强痛，腿足拘挛疼痛', method: '俯卧位；在腘横纹外侧端可触及一大筋（股二头肌腱）；在该筋内侧有凹陷处，即为本穴。', specialPoint: '三焦下合穴',  niComment: '三焦下合穴，倪师认为此穴治小便不利、腰腿痛有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1471, y: 0.4987, z: -0.043 }, }),
      pt('BL40', '委中', 0, 19, 'left', { cunZ: 5, classicRef: '《甲乙经》云：在腘中央约纹中动脉', location: '在腘横纹中点，股二头肌腱与半腱肌腱中间', indications: '腰痛，下肢痿痹，腹痛，吐泻，小便不利，丹毒', method: '俯卧或立位；在腘横纹上，左右两大筋（股二头肌腱、半腱肌腱）之间的中点处，即为本穴。', specialPoint: '合穴，膀胱下合穴',  niComment: '四总穴之一，腰背委中求。倪师极常用此穴，治腰背痛特效。三棱针点刺出血治急性腰扭伤有奇效。为膀胱经合穴', needlingMethod: '直刺1～1.5寸，或用三棱针点刺腘静脉出血', contraindications: '一般无特殊禁忌', position3d: { x: -0.131, y: 0.4877, z: -0.0372 }, }),
      pt('BL41', '譩譆', 3, 60, 'left', { cunZ: 5, location: '在背部，第6胸椎棘突下，旁开3寸', indications: '咳嗽，气喘，疟疾，热病，肩背痛' , niComment: '倪师认为此穴治颈项强痛、肩背拘急有效', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.211, y: 1.374, z: -0.0349 }, }),
      pt('BL42', '膈关', 3, 59.5, 'left', { cunZ: 5, location: '在背部，第7胸椎棘突下，旁开3寸', indications: '胸闷，嗳气，呕吐，脊背强痛' , niComment: '倪师认为此穴治肺痨、咳嗽气喘有效', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.2096, y: 1.3568, z: -0.0394 }, }),
      pt('BL43', '魂门', 3, 58.5, 'left', { cunZ: 5, location: '在背部，第9胸椎棘突下，旁开3寸', indications: '胸胁痛，呕吐，泄泻，背痛', method: '正坐或俯卧位。从第7胸椎棘突往下推2个椎体棘突（即第9胸椎棘突），再从其下缘旁开4横指，按压有酸胀感处，即为本穴。',  niComment: '倪师极常用此穴，治慢性病、虚劳百损特效。古人云病入膏肓则不可治，艾灸膏肓可治百病。倪师认为此穴为补虚要穴', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.148184, y: 1.343933, z: -0.063628 }, }),
      pt('BL44', '阳纲', 3, 58, 'left', { cunZ: 5, location: '在背部，第10胸椎棘突下，旁开3寸', indications: '肠鸣，腹痛，黄疸，消渴' , niComment: '倪师认为此穴治胸闷、气喘有效', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.146841, y: 1.326208, z: -0.061674 }, }),
      pt('BL45', '意舍', 3, 57.5, 'left', { cunZ: 5, location: '在背部，第11胸椎棘突下，旁开3寸', indications: '腹胀，肠鸣，呕吐，泄泻', method: '正坐或仰卧位。取一线过肚脐绕腹腰一周，与肚脐中相对应处即第2腰椎，由此往上推3个椎体（即第11胸椎），再从其棘突下缘旁开量4横指，按压有酸胀感处，即为本穴。',  niComment: '倪师认为此穴治疟疾、肩背痛有效', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.146841, y: 1.326208, z: -0.061674 }, }),
      pt('BL46', '胃仓', 3, 57, 'left', { cunZ: 5, location: '在背部，第12胸椎棘突下，旁开3寸', indications: '胃脘痛，腹胀，水肿，背脊痛' , niComment: '倪师认为此穴治饮食不下、呕吐有效', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.146215, y: 1.270255, z: -0.04221 }, }),
      pt('BL47', '肓门', 3, 55.5, 'left', { cunZ: 5, location: '在腰部，第1腰椎棘突下，旁开3寸', indications: '腹痛，便秘，痞块，乳疾' , niComment: '倪师认为此穴治胸胁痛、肝胆疾病有效', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.148333, y: 1.230605, z: -0.02016 }, }),
      pt('BL48', '志室', 3, 55, 'left', { cunZ: 5, location: '在腰部，第2腰椎棘突下，旁开3寸', indications: '遗精，阳痿，小便不利，腰脊强痛', method: '坐位；过肚脐中点绕腰腹一周作一线；该线与后正中线的交点即为第2腰椎棘突；在第2腰椎棘突下有一凹陷，此凹陷旁开4横指（食指、中指、无名指、小指四指并拢，以中指近端指间关节横纹水平的四指宽度为3寸，也称一夫法）处，即为本穴。',  niComment: '倪师认为此穴治黄疸、腹痛有效', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.148333, y: 1.230605, z: -0.02016 }, }),
      pt('BL49', '胞肓', 3, 49, 'left', { cunZ: 5, location: '在臀部，第2骶椎棘突下，旁开3寸', indications: '肠鸣，腹胀，便秘，小便不利，腰脊痛' , niComment: '倪师认为此穴治腹胀、泄泻有效', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.148333, y: 1.230605, z: -0.02016 }, }),
      pt('BL50', '秩边', 3, 46, 'left', { cunZ: 5, location: '在臀部，第4骶椎棘突下，旁开3寸', indications: '腰骶痛，下肢痿痹，小便不利，便秘，痔疾' , niComment: '倪师认为此穴治胃脘痛、腹胀有效', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.148333, y: 1.230605, z: -0.02016 }, }),
      pt('BL51', '合阳', 0, 17, 'left', { cunZ: 5, location: '在小腿后面，委中下2寸', indications: '腰脊强痛，下肢痿痹，疝气，崩漏' , niComment: '倪师认为此穴治腹痛、便秘、腹部痞块有效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.148381, y: 1.207503, z: 0.003297 }, }),
      pt('BL52', '承筋', 0, 14, 'left', { cunZ: 4, location: '在小腿后面，合阳与承山连线中点，腓肠肌肌腹中央', indications: '痔疾，腰腿拘急疼痛' , niComment: '倪师认为此穴治遗精、阳痿、腰痛有效。为补肾固精要穴', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1323, y: 1.1363, z: -0.0032 }, }),
      pt('BL53', '承山', 0, 11, 'left', { cunZ: 4, classicRef: '《甲乙经》云：在兑腨肠下分肉间陷者中', location: '在小腿后面正中，委中与昆仑之间，伸直小腿时腓肠肌肌腹下角凹陷处', indications: '痔疾，脚气，便秘，腰腿拘急疼痛', method: '俯卧或侧卧位；取腘横纹中点与外踝尖连线中点处，即为本穴。',  niComment: '倪师认为此穴治腹胀、便秘、腰骶痛有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1347, y: 1.0064, z: -0.0113 }, }),
      pt('BL54', '飞扬', 1.5, 10, 'left', { cunZ: 3, location: '在小腿后面，昆仑直上7寸，承山外下方', indications: '头痛，目眩，腰腿疼痛，痔疾', method: '腘横纹中点至外踝尖连线的中点再往外下方量1横指处为取穴部位。', specialPoint: '络穴',  niComment: '倪师极常用此穴，治坐骨神经痛、腰骶痛、下肢痿痹特效。深刺可治前列腺疾病', needlingMethod: '直刺1.5～3寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1337, y: 0.9356, z: -0.0432 }, }),
      pt('BL55', '跗阳', 2, 6, 'left', { cunZ: 2, location: '在小腿后面，外踝后，昆仑直上3寸', indications: '头痛，腰骶痛，下肢痿痹，外踝肿痛' , niComment: '倪师认为此穴治腰脊痛、下肢痿痹有效', needlingMethod: '直刺1～2寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.135, y: 0.4347, z: -0.049 }, }),
      pt('BL56', '昆仑', 2, 4, 'left', { cunZ: 2, classicRef: '《甲乙经》云：在外踝后跟骨上陷者中', location: '在足部外踝后方，外踝尖与跟腱之间凹陷处', indications: '头痛，项强，目眩，腰痛，脚跟痛，难产，癫痫', method: '正坐垂足着地或俯卧位；在外踝尖与脚踝后的跟腱之间可触及一凹陷，按压有酸胀感，即为本穴。', specialPoint: '经穴',  niComment: '倪师认为此穴治小腿痉挛、痔疮有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1368, y: 0.4009, z: -0.0526 }, }),
      pt('BL57', '仆参', 2, 2.5, 'left', { cunZ: 2, location: '在足外侧部，外踝后下方，昆仑直下，跟骨外侧赤白肉际处', indications: '下肢痿痹，足跟痛，癫痫' , niComment: '倪师极常用此穴，治痔疮、小腿转筋特效。为治痔疮第一要穴。条口透承山治肩周炎', needlingMethod: '直刺1～2寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1395, y: 0.3574, z: -0.0523 }, }),
      pt('BL58', '申脉', 2, 2, 'left', { cunZ: 2, intersections: ['DU'], location: '在足外侧部，外踝直下方凹陷中', indications: '头痛，眩晕，癫狂痫，失眠，腰腿酸痛' , niComment: '膀胱经络穴，倪师认为此穴治腰腿痛、头痛有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.145586, y: 0.324659, z: -0.047049 }, }),
      pt('BL59', '金门', 2, 1.5, 'left', { cunZ: 1, isXi: true, location: '在足外侧，申脉前下方，骰骨外侧凹陷处', indications: '癫狂痫，小儿惊风，腰痛，外踝痛', method: '正坐垂足着地或俯卧位。当脚趾向上翘起可见一骨头凸起，即是骰骨，骰骨外侧可触及一凹陷，按压有酸胀感，即为本穴。', specialPoint: '郄穴',  niComment: '阳跷郄穴，倪师认为此穴治腰腿痛、外踝肿痛有效', needlingMethod: '直刺0.8～1.2寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1698, y: 0.1589, z: -0.0287 }, }),
      pt('BL60', '京骨', 2, 1, 'left', { cunZ: 1, isYuan: true, location: '在足外侧，第5跖骨粗隆下方，赤白肉际处', indications: '头痛，项强，腰腿痛，癫狂痫', method: '正坐垂足着地或俯卧位。沿着小趾后面的长骨往后推，可触摸到一凸起（即第5跖骨粗隆），其凸起下方掌背交界线（即赤白肉际处），按压可及一凹陷处，即为本穴。', specialPoint: '原穴',  niComment: '膀胱经经穴，倪师极常用此穴。治腰背痛、足跟痛、头痛特效。孕妇禁用，因能催产', needlingMethod: '直刺0.5～0.8寸', contraindications: '孕妇禁用', position3d: { x: -0.1807, y: 0.0806, z: -0.0255 }, }),
      pt('BL61', '束骨', 2, 0.5, 'left', { cunZ: 1, location: '在足外侧，第5跖趾关节后方，赤白肉际处', indications: '头痛，项强，目眩，腰腿痛，癫狂' , niComment: '倪师认为此穴治足跟痛、癫痫有效', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1798, y: 0.0536, z: -0.0342 }, }),
      pt('BL62', '足通谷', 2, 0.3, 'left', { cunZ: 1, location: '在足外侧，第5跖趾关节前方，赤白肉际处', indications: '头痛，项强，目眩，鼻衄，癫狂' , niComment: '八脉交会穴通阳跷脉，倪师极常用此穴。治失眠、癫痫、腰腿痛特效。倪师认为申脉为治失眠要穴之一', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1752, y: 0.0469, z: -0.0301 }, }),
      pt('BL63', '至阴', 2, 0, 'left', { cunZ: 1, isJingWell: true, classicRef: '《甲乙经》云：在足小指外侧，去爪甲角如韭叶', location: '在足小趾外侧，趾甲角旁0.1寸', indications: '头痛，目痛，鼻塞，鼻衄，胎位不正，难产', method: '在足小趾外侧，由足小趾趾甲外侧缘（即掌背交界线，又称赤白肉际）与下缘各作一垂线之交点处，即为本穴。', specialPoint: '井穴',  niComment: '膀胱经郄穴，倪师认为此穴治癫痫、头痛有效', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.169, y: 0.047, z: -0.0123 }, }),
    ],
    pathCun: [
      wp(0.5, 71, 'left', -4), wp(1.5, 73, 'left', -3), wp(2, 75, 'left', 0),
      wp(1.5, 66, 'left', 4), wp(1.5, 63, 'left', 5), wp(1.5, 55, 'left', 5),
      wp(1.5, 43, 'left', 5), wp(0, 36, 'left', 6), wp(0, 19, 'left', 5),
      wp(0, 11, 'left', 4), wp(2, 4, 'left', 2), wp(2, 0, 'left', 1),
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 8. 足少阴肾经 KIDNEY (KI) — 27 points
  // ──────────────────────────────────────────────────────────
  {
    code: 'KI',
    name: '足少阴肾经',
    nameEn: 'Kidney Meridian of Foot-Shaoyin',
    wuxing: '水',
    organ: '肾（脏）',
    color: '#1A1A2E',
    points: [
      pt('KI1', '涌泉', 1, 1, 'left', { cunZ: -1.5, isJingWell: true, classicRef: '《甲乙经》云：在足心陷者中，屈足卷指宛宛中', location: '在足底部，蜷足时足前部凹陷处，约足底前1/3与后2/3交点', indications: '头痛，头晕，昏厥，中暑，癫狂痫，小儿惊风，足心热', method: '俯卧或仰卧位，足趾屈曲；足底第2、3趾趾缝纹头端与足跟连线的前1/3与后2/3交点上，可见一凹陷，即为本穴。', specialPoint: '井穴',  niComment: '肾经井穴，倪师极常用此穴。急救要穴，治昏迷、中暑、休克特效。亦治失眠、头痛。倪师认为涌泉为引火归元要穴，可治高血压', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.19, y: 0.002, z: 0.113 }, }),
      pt('KI2', '然谷', 1.5, 2, 'left', { cunZ: -1, location: '在足内侧缘，足舟骨粗隆下方，赤白肉际处', indications: '月经不调，带下，遗精，消渴，泄泻，足跗肿痛', method: '坐位或仰卧位；在内踝前下方可触及一明显骨性标志——舟骨；在舟骨粗隆前下方可触及一凹陷，按压有酸胀感处，即为本穴。', specialPoint: '荥穴',  niComment: '肾经荥穴，倪师认为此穴治消渴、遗精、月经不调有效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.2, y: 0.055, z: 0.09 }, }),
      pt('KI3', '太溪', 1.5, 3, 'left', { cunZ: 0, isYuan: true, classicRef: '《甲乙经》云：在足内踝后跟骨上动脉陷者中', location: '在足内侧，内踝后方，内踝尖与跟腱之间凹陷处', indications: '头痛目眩，咽喉肿痛，齿痛，耳聋，失眠，遗精，腰痛', method: '坐位垂足或仰卧位；由足内踝尖向后推至与跟腱之间的凹陷处（大约当内踝尖与跟腱之间中点），按压有酸胀感，即为本穴。', specialPoint: '输穴；原穴',  niComment: '肾经原穴、输穴，倪师极常用此穴。为补肾第一要穴。治肾虚诸证特效。治耳鸣、耳聋、腰痛、遗精、阳痿。倪师认为太溪为诊断肾气盛衰之要穴', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.195, y: 0.155, z: -0.005 }, }),
      pt('KI4', '大钟', 1.5, 3.5, 'left', { cunZ: 0.5, isLuo: true, intersections: ['BL'], location: '在足内侧，内踝后下方，跟骨附着部内侧前方凹陷处', indications: '癃闭，遗尿，便秘，咯血，气喘，痴呆，足跟痛', method: '坐位垂足或仰卧位。先取太溪（参见“太溪”），由太溪向下量半横指，再向后平推，于跟腱前缘可感有一凹陷处，即为本穴。', specialPoint: '络穴',  niComment: '肾经络穴，倪师认为此穴治痴呆、足跟痛、腰脊强痛有效', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.2, y: 0.12, z: -0.015 }, }),
      pt('KI5', '水泉', 1, 2.5, 'left', { cunZ: 0.5, isXi: true, location: '在足内侧，内踝后下方，太溪直下1寸', indications: '月经不调，痛经，小便不利', method: '坐位垂足或仰卧位。由太溪（参见“太溪”）直下量拇指1横指处，按压有酸胀感，即为本穴。', specialPoint: '郄穴',  niComment: '肾经郄穴，倪师认为此穴治痛经、月经不调特效', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.205, y: 0.115, z: -0.025 }, }),
      pt('KI6', '照海', 1, 2, 'left', { cunZ: 0, intersections: ['DU'], location: '在足内侧，内踝尖下方凹陷处', indications: '咽喉干燥，失眠，嗜卧，癫痫，小便频数，月经不调', method: '坐位垂足或仰卧位；由内踝尖垂直向下推，至其下缘凹陷处，即为本穴。', specialPoint: '八脉交会穴（通于阴跷脉）',  niComment: '八脉交会穴通阴跷脉，倪师极常用此穴。治失眠、咽喉干燥、癫痫特效。与申脉配伍为倪师治失眠经典组合', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.192, y: 0.133, z: 0.049 }, }),
      pt('KI7', '复溜', 1.5, 5, 'left', { cunZ: 0, location: '在小腿内侧，太溪上2寸，跟腱前方', indications: '水肿，腹胀，泄泻，盗汗，热病汗不出，下肢痿痹', method: '坐位垂足或仰卧位；确定太溪穴：由足内踝尖向后推至与跟腱之间的凹陷处（大约当内踝尖与跟腱之间中点），即为太溪穴；从太溪穴直上量2横指（大拇指指间关节部位的横径为1寸），跟腱的前方，即为本穴。', specialPoint: '经穴',  niComment: '肾经经穴，倪师极常用此穴。治水肿、盗汗特效。合谷配复溜，一汗一止汗。倪师认为此穴为利水要穴', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.19, y: 0.235, z: 0.015 }, }),
      pt('KI8', '交信', 1.5, 5, 'left', { cunZ: -0.5, intersections: ['LR'], location: '在小腿内侧，太溪上2寸，复溜前0.5寸', indications: '月经不调，崩漏，阴挺，疝气，泄泻，便秘', method: '坐位垂足或仰卧位；确定太溪穴：由足内踝尖向后推至与跟腱之间的凹陷处（大约当内踝尖与跟腱之间中点），即为太溪穴；第3步:确定复溜穴：从太溪穴直上量2横指（大拇指指间关节部位的横径为1寸），跟腱的前方，即为复溜穴；在复溜穴前半横指处，即为本穴。', specialPoint: '阴跷脉之郄穴',  niComment: '阴跷郄穴，倪师认为此穴治月经不调、崩漏有效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.185, y: 0.235, z: 0.035 }, }),
      pt('KI9', '筑宾', 1.5, 8, 'left', { cunZ: -0.5, location: '在小腿内侧，太溪上5寸，腓肠肌肌腹内下方', indications: '癫狂，呕吐，疝气，小腿疼痛', method: '仰卧位或正坐垂足。由太溪（参见“太溪”）沿太溪-阴谷（参见“阴谷”）连线向上量2横指（拇指），再量4横指，同时从胫骨由后量2横指，二者相交处，按压有酸胀感，即为本穴。', specialPoint: '阴维脉之郄穴',  niComment: '阴维郄穴，倪师认为此穴治癫狂、呕吐有效', needlingMethod: '直刺0.5～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.185, y: 0.355, z: 0.03 }, }),
      pt('KI10', '阴谷', 2, 17, 'left', { cunZ: -1, location: '在腘窝内侧，半腱肌腱与半膜肌腱之间', indications: '阳痿，疝气，月经不调，崩漏，膝股内侧痛', method: '站位或俯卧位；从膝内侧高骨向外推，可在腘横纹内侧触及两条筋（触摸明显条索状，用力弹拨有滑动感）；在两筋之间凹陷处，即为本穴。', specialPoint: '合穴',  niComment: '肾经合穴，倪师认为此穴治阳痿、疝气、膝痛有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.152, y: 0.45, z: -0.035 }, }),
      pt('KI11', '横骨', 0.5, 42, 'left', { cunZ: -5, intersections: ['RN'], location: '在下腹部，脐中下5寸，前正中线旁开0.5寸', indications: '少腹胀痛，小便不利，遗尿，遗精，阳痿，疝气' , niComment: '倪师认为此穴治遗精、阳痿、小便不利有效', needlingMethod: '直刺0.8～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.035, y: 0.895, z: 0.127 }, }),
      pt('KI12', '大赫', 0.5, 43, 'left', { cunZ: -5, intersections: ['RN'], location: '在下腹部，脐中下4寸，前正中线旁开0.5寸', indications: '遗精，阳痿，阴挺，带下，月经不调' , niComment: '倪师认为此穴治男科、妇科疾病有效', needlingMethod: '直刺0.8～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.035, y: 0.928, z: 0.131 }, }),
      pt('KI13', '气穴', 0.5, 44, 'left', { cunZ: -5, intersections: ['RN'], location: '在下腹部，脐中下3寸，前正中线旁开0.5寸', indications: '月经不调，带下，小便不利，泄泻' , niComment: '倪师认为此穴治月经不调、泄泻有效', needlingMethod: '直刺0.8～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.034, y: 0.955, z: 0.132 }, }),
      pt('KI14', '四满', 0.5, 45, 'left', { cunZ: -5, intersections: ['RN'], location: '在下腹部，脐中下2寸，前正中线旁开0.5寸', indications: '月经不调，带下，遗精，遗尿，疝气，便秘' , niComment: '倪师认为此穴治月经不调、遗精、水肿有效', needlingMethod: '直刺0.8～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.034, y: 0.981, z: 0.133 }, }),
      pt('KI15', '中注', 0.5, 46, 'left', { cunZ: -5, intersections: ['RN'], location: '在下腹部，脐中下1寸，前正中线旁开0.5寸', indications: '月经不调，腹痛，便秘，泄泻' , niComment: '倪师认为此穴治腹痛、便秘有效', needlingMethod: '直刺0.8～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.034, y: 1.006, z: 0.136 }, }),
      pt('KI16', '肓俞', 0.5, 47, 'left', { cunZ: -5, intersections: ['RN'], location: '在腹中部，脐中旁开0.5寸', indications: '腹痛，腹胀，呕吐，便秘，泄泻', method: '仰卧位；自肚脐中点旁开量半横指（大拇指指间关节部位的横径为1寸）处，即为本穴。', specialPoint: '足少阴、冲脉交会穴',  niComment: '倪师认为此穴治绕脐腹痛、腹胀有效', needlingMethod: '直刺0.8～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.034, y: 1.026, z: 0.138 }, }),
      pt('KI17', '商曲', 0.5, 48, 'left', { cunZ: -5, intersections: ['RN'], location: '在上腹部，脐中上2寸，前正中线旁开0.5寸', indications: '腹痛，泄泻，便秘，腹中积聚' , niComment: '倪师认为此穴治腹痛、腹中积聚有效', needlingMethod: '直刺0.8～1.2寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.034, y: 1.052, z: 0.137 }, }),
      pt('KI18', '石关', 0.5, 49, 'left', { cunZ: -5, intersections: ['RN'], location: '在上腹部，脐中上3寸，前正中线旁开0.5寸', indications: '呕吐，腹痛，便秘，不孕' , niComment: '倪师认为此穴治呕吐、不孕有效', needlingMethod: '直刺0.8～1.2寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.034, y: 1.079, z: 0.136 }, }),
      pt('KI19', '阴都', 0.5, 50, 'left', { cunZ: -5, intersections: ['RN'], location: '在上腹部，脐中上4寸，前正中线旁开0.5寸', indications: '腹胀，腹痛，便秘，不孕' , niComment: '倪师认为此穴治腹胀、腹痛有效', needlingMethod: '直刺0.8～1.2寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.034, y: 1.104, z: 0.138 }, }),
      pt('KI20', '腹通谷', 0.5, 51, 'left', { cunZ: -5, intersections: ['RN'], location: '在上腹部，脐中上5寸，前正中线旁开0.5寸', indications: '腹痛，腹胀，呕吐，心痛' , niComment: '倪师认为此穴治腹痛、呕吐有效', needlingMethod: '直刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.034, y: 1.129, z: 0.14 }, }),
      pt('KI21', '幽门', 0.5, 52, 'left', { cunZ: -5, intersections: ['RN'], location: '在上腹部，脐中上6寸，前正中线旁开0.5寸', indications: '腹痛，呕吐，泄泻，消化不良' , niComment: '倪师认为此穴治腹胀、呕吐有效', needlingMethod: '直刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.034, y: 1.145, z: 0.14 }, }),
      pt('KI22', '步廊', 2, 57, 'left', { cunZ: -5, location: '在胸部，第5肋间隙，前正中线旁开2寸', indications: '咳嗽，气喘，胸胁胀满，呕吐' , niComment: '倪师认为此穴治咳嗽、气喘有效', needlingMethod: '斜刺或平刺0.5～0.8寸', contraindications: '不可深刺', position3d: { x: -0.08, y: 1.237, z: 0.149 }, }),
      pt('KI23', '神封', 2, 58, 'left', { cunZ: -5, location: '在胸部，第4肋间隙，前正中线旁开2寸', indications: '咳嗽，气喘，胸胁胀满，乳痈' , niComment: '倪师认为此穴治咳嗽、乳腺疾病有效', needlingMethod: '斜刺或平刺0.5～0.8寸', contraindications: '不可深刺', position3d: { x: -0.086, y: 1.25, z: 0.149 }, }),
      pt('KI24', '灵墟', 2, 59, 'left', { cunZ: -5, location: '在胸部，第3肋间隙，前正中线旁开2寸', indications: '咳嗽，气喘，胸胁胀满，呕吐' , niComment: '倪师认为此穴治咳嗽、痰多有效', needlingMethod: '斜刺或平刺0.5～0.8寸', contraindications: '不可深刺', position3d: { x: -0.092, y: 1.271, z: 0.146 }, }),
      pt('KI25', '神藏', 2, 60, 'left', { cunZ: -5, location: '在胸部，第2肋间隙，前正中线旁开2寸', indications: '咳嗽，气喘，胸痛，呕吐' , niComment: '倪师认为此穴治胸痛、咳嗽有效', needlingMethod: '斜刺或平刺0.5～0.8寸', contraindications: '不可深刺', position3d: { x: -0.092, y: 1.293, z: 0.14 }, }),
      pt('KI26', '彧中', 2, 61, 'left', { cunZ: -5, location: '在胸部，第1肋间隙，前正中线旁开2寸', indications: '咳嗽，气喘，胸胁胀满，痰壅' , niComment: '倪师认为此穴治咳嗽、气喘有效', needlingMethod: '斜刺或平刺0.5～0.8寸', contraindications: '不可深刺', position3d: { x: -0.065, y: 1.309, z: 0.132 }, }),
      pt('KI27', '俞府', 2, 62, 'left', { cunZ: -5, classicRef: '《甲乙经》云：在巨骨下，去璇玑旁各二寸陷者中', location: '在胸部，锁骨下缘，前正中线旁开2寸', indications: '咳嗽，气喘，胸痛，呕吐', method: '仰卧位；从乳中线（过乳头的垂直线）与锁骨下缘的交点处作一水平线该线与前正中线有一交点，两点之间的中点处，即为本穴。',  niComment: '倪师认为此穴治咳嗽、气喘、胸痛有效。为肾经最后一穴', needlingMethod: '斜刺或平刺0.5～0.8寸', contraindications: '不可深刺', position3d: { x: -0.065, y: 1.319, z: 0.126 }, }),
    ],
    pathCun: [
      wp(1, 1, 'left', -1.5), wp(1.5, 3, 'left', 0), wp(1.5, 5, 'left', 0),
      wp(2, 17, 'left', -1), wp(0.5, 42, 'left', -5), wp(0.5, 47, 'left', -5),
      wp(0.5, 52, 'left', -5), wp(2, 58, 'left', -5), wp(2, 62, 'left', -5),
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 9. 手厥阴心包经 PERICARDIUM (PC) — 9 points
  // ──────────────────────────────────────────────────────────
  {
    code: 'PC',
    name: '手厥阴心包经',
    nameEn: 'Pericardium Meridian of Hand-Jueyin',
    wuxing: '火',
    organ: '心包（脏）',
    color: '#8B1A1A',
    points: [
      pt('PC1', '天池', 4, 58, 'left', { cunZ: -4, intersections: ['LR'], classicRef: '《甲乙经》云：在乳后一寸，腋下三寸', location: '在胸部，第4肋间隙，乳头外1寸，前正中线旁开5寸', indications: '咳嗽，气喘，胸闷，心烦，腋下肿痛', method: '仰卧位；自乳头沿水平线向外侧旁开量1横指（大拇指指间关节部位的横径为1寸）处，即为本穴。',  niComment: '倪师认为此穴治胸闷、乳腺疾病有效', needlingMethod: '斜刺或平刺0.3～0.5寸', contraindications: '不可深刺', position3d: { x: -0.2446, y: 1.2582, z: 0.0295 }, }),
      pt('PC2', '天泉', 4, 55, 'left', { cunZ: -2, location: '在臂内侧，腋前纹头下2寸，肱二头肌长短头之间', indications: '心痛，咳嗽，胸胁胀痛，臂内侧痛' , niComment: '倪师认为此穴治心痛、胸胁胀满有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.2164, y: 1.3231, z: 0.0284 }, }),
      pt('PC3', '曲泽', 2.5, 47, 'left', { cunZ: -2, location: '在肘横纹中，肱二头肌腱尺侧缘', indications: '心痛，心悸，胃痛，呕吐，泄泻，热病，肘臂挛痛', method: '伸肘仰掌，肘部稍微弯曲；在肘弯处可摸到一条大筋（肱二头肌腱），在其内侧可触及一凹陷，即为本穴。', specialPoint: '合穴',  niComment: '心包经合穴，倪师认为此穴治心痛、胃痛、中暑特效。三棱针点刺出血可治急性胃肠炎', needlingMethod: '直刺1～1.5寸，或点刺出血', contraindications: '一般无特殊禁忌', position3d: { x: -0.3594, y: 1.157, z: 0.0624 }, }),
      pt('PC4', '郄门', 2, 40, 'left', { cunZ: -1, isXi: true, location: '在前臂掌侧，腕横纹上5寸，掌长肌腱与桡侧腕屈肌腱之间', indications: '心痛，心悸，疔疮，呕血，咳血，癫痫', method: '伸臂仰掌，微曲腕握拳；在手臂内侧可触摸到两条明显条索状筋（掌长肌腱与桡侧腕屈肌腱）；将近掌侧腕横纹到肘横纹的距离平分为2等份；从1/2交点处向下量1横指（大拇指指间关节部位的横径为1寸），两筋之间的凹陷处，即为本穴。', specialPoint: '郄穴',  niComment: '心包经郄穴，倪师认为此穴治急性心痛、心悸特效。为治心脏急症要穴', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.4231, y: 1.1, z: 0.1429 }, }),
      pt('PC5', '间使', 2, 38, 'left', { cunZ: -1, location: '在前臂掌侧，腕横纹上3寸，掌长肌腱与桡侧腕屈肌腱之间', indications: '心痛，心悸，胃痛，呕吐，热病，疟疾，癫狂', method: '伸臂仰掌，微屈腕握拳。从腕横纹向上量4横指，在掌长肌腱和桡侧腕屈肌腱（手臂内侧可触摸到的两条索状筋，握拳用力屈腕明显可见）之间的凹陷中，按压有酸胀感处，即为本穴。', specialPoint: '经穴',  niComment: '心包经经穴，倪师认为此穴治心痛、疟疾、癫狂有效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.4414, y: 1.085, z: 0.1694 }, }),
      pt('PC6', '内关', 2, 36.5, 'left', { cunZ: -1, isLuo: true, classicRef: '《甲乙经》云：在腕后二寸，别走少阳', location: '在前臂掌侧，腕横纹上2寸，掌长肌腱与桡侧腕屈肌腱之间', indications: '心痛，心悸，胸闷，胃痛，呕吐，眩晕，偏头痛', method: '伸臂仰掌，微曲腕握拳；在手臂内侧可触摸到两条明显条索状筋（掌长肌腱与桡侧腕屈肌腱）；从近掌侧腕横纹向上量2横指（大拇指指间关节部位的横径为1寸），两筋之间的凹陷处，即为本穴。', specialPoint: '络穴；八脉交会穴（通于阴维脉）',  niComment: '八脉交会穴通阴维脉，倪师极常用此穴。为全身四大要穴之一。治心脏病、胃痛、呕吐、失眠、晕车特效。与公孙配伍治胃病。倪师临床极常用', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.4622, y: 1.068, z: 0.2014 }, }),
      pt('PC7', '大陵', 2, 34.5, 'left', { cunZ: -1, isYuan: true, classicRef: '《甲乙经》云：在掌后两筋间陷者中', location: '在腕掌横纹中央，掌长肌腱与桡侧腕屈肌腱之间', indications: '心痛，心悸，胃痛，呕吐，癫狂，疮疡，胸闷', method: '伸臂仰掌，微曲腕握拳；在手臂内侧可触摸到两条明显条索状筋（掌长肌腱与桡侧腕屈肌腱）；在近掌侧腕横纹中点，两筋之间的凹陷处，即为本穴。', specialPoint: '输穴，原穴',  niComment: '心包经原穴、输穴，倪师认为此穴治心痛、腕关节疼痛有效', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.475, y: 1.035, z: 0.285 }, }),
      pt('PC8', '劳宫', 2, 32, 'left', { cunZ: -1, classicRef: '《甲乙经》云：在掌中央动脉', location: '在手掌心，第2、3掌骨之间偏于第3掌骨，握拳屈指时中指尖处', indications: '中风昏迷，中暑，心痛，癫狂痫，口疮，鹅掌风', method: '握拳屈指；中指尖所指掌心处，在第二掌横纹稍下方，偏于第3掌骨侧处，按压有酸胀感，即为本穴。', specialPoint: '荥穴',  niComment: '心包经荥穴，倪师认为此穴治中风昏迷、口臭、手心多汗特效。为急救要穴', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.5, y: 0.988, z: 0.318 }, }),
      pt('PC9', '中冲', 2, 27.5, 'left', { cunZ: -1, isJingWell: true, classicRef: '《甲乙经》云：在手中指之端，去爪甲如韭叶', location: '在中指尖端中央', indications: '中风昏迷，中暑，舌强不语，小儿惊风，热病', method: '俯掌。在手中指尖端的中央取穴。', specialPoint: '井穴',  niComment: '心包经井穴，倪师认为此穴点刺出血可急救中暑、中风昏迷。为急救要穴', needlingMethod: '浅刺0.1寸，或点刺出血', contraindications: '一般无特殊禁忌', position3d: { x: -0.53, y: 0.95, z: 0.318 }, }),
    ],
    pathCun: [
      wp(4, 58, 'left', -4), wp(4, 55, 'left', -2), wp(2.5, 47, 'left', -2),
      wp(2, 36.5, 'left', -1), wp(2, 34.5, 'left', -1), wp(2, 32, 'left', -1),
      wp(2, 27.5, 'left', -1),
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 10. 手少阳三焦经 TRIPLE ENERGIZER (TE) — 23 points
  // ──────────────────────────────────────────────────────────
  {
    code: 'TE',
    name: '手少阳三焦经',
    nameEn: 'Triple Energizer Meridian of Hand-Shaoyang',
    wuxing: '火',
    organ: '三焦（腑）',
    color: '#8B1A1A',
    points: [
      pt('TE1', '关冲', 2.5, 28, 'left', { cunZ: 2, isJingWell: true, classicRef: '《甲乙经》云：在手小指次指之端，去爪甲角如韭叶', location: '在无名指尺侧指甲角旁0.1寸', indications: '头痛，目赤，耳聋，咽喉肿痛，热病，中暑', method: '仰掌虚握拳。沿手无名指指甲底部与环指小指（尺）侧缘引线（即掌背交界线，或称赤白肉际处）的交点处，即为本穴。', specialPoint: '井穴',  niComment: '三焦经井穴，倪师认为此穴点刺出血可退热、治咽喉肿痛', needlingMethod: '浅刺0.1寸，或点刺出血', contraindications: '一般无特殊禁忌', position3d: { x: -0.53, y: 0.95, z: 0.25 }, }),
      pt('TE2', '液门', 2.5, 29.5, 'left', { cunZ: 2, location: '在手背部，第4、5指间，指蹼缘后方赤白肉际处', indications: '头痛，目赤，耳聋，咽喉肿痛，疟疾' , niComment: '三焦经荥穴，倪师认为此穴治耳鸣、咽喉肿痛有效', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.51, y: 0.998, z: 0.26 }, }),
      pt('TE3', '中渚', 2.5, 31, 'left', { cunZ: 2, location: '在手背部，第4、5掌骨间凹陷处', indications: '头痛，目赤，耳鸣耳聋，咽喉肿痛，手指拘挛', method: '掌心向下；在手背部第4、5指指缝间，掌指关节后可触及一凹陷，即为本穴。', specialPoint: '输穴',  niComment: '三焦经输穴，倪师认为此穴治偏头痛、耳鸣特效。为治偏头痛要穴', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.5, y: 1.01, z: 0.25 }, }),
      pt('TE4', '阳池', 2.5, 34.5, 'left', { cunZ: 2, isYuan: true, location: '在腕背横纹中，指总伸肌腱尺侧缘凹陷处', indications: '耳聋，目赤，咽喉肿痛，腕臂痛，消渴', method: '抬臂垂腕；在腕关节背面，沿第4掌骨向上推至腕关节横纹，可触及一凹陷，此凹陷相当于腕背横纹中点处，即为本穴。', specialPoint: '原穴',  niComment: '三焦经原穴，倪师认为此穴治腕关节疼痛、消渴有效', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.475, y: 1.038, z: 0.24 }, }),
      pt('TE5', '外关', 2.5, 36.5, 'left', { cunZ: 2, isLuo: true, classicRef: '《甲乙经》云：在腕后二寸陷者中，别走心主', location: '在前臂背侧，腕横纹上2寸，尺骨与桡骨之间', indications: '热病，头痛，耳鸣耳聋，目赤肿痛，上肢痹痛', method: '第1步:抬臂，掌心向下；从掌腕背横纹中点处直上量2横指（大拇指指间关节部位的横径为1寸）；在前臂两骨头之间的凹陷处，按压有酸胀感，即为本穴。', specialPoint: '络穴；八脉交会穴（通于阳维脉）',  niComment: '八脉交会穴通阳维脉，三焦经络穴，倪师极常用此穴。治感冒发热、偏头痛、耳鸣、上肢疼痛特效。倪师认为外关为解表退热要穴', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.4719, y: 1.06, z: 0.1848 }, }),
      pt('TE6', '支沟', 2.5, 38, 'left', { cunZ: 2, classicRef: '《甲乙经》云：在腕后三寸两骨之间陷者中', location: '在前臂背侧，腕横纹上3寸，尺骨与桡骨之间', indications: '便秘，热病，耳鸣耳聋，暴喑，肩背酸痛', method: '抬臂，掌心向下；从掌腕背横纹中点处直上量4横指（食指（示指）、中指、无名指、小指）四指并拢，以中指近端指间关节横纹水平的四指宽度为3寸，也称一夫法）；在前臂两骨头之间的凹陷处，按压有酸胀感，即为本穴。', specialPoint: '经穴',  niComment: '倪师极常用此穴，治便秘特效。亦治胁肋痛、耳鸣。倪师认为支沟为治便秘第一要穴', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.4536, y: 1.075, z: 0.1587 }, }),
      pt('TE7', '会宗', 2.5, 38.5, 'left', { cunZ: 2, isXi: true, location: '在前臂背侧，腕横纹上3寸，支沟尺侧', indications: '耳聋，癫痫，上肢痹痛' , niComment: '三焦经郄穴，倪师认为此穴治耳聋、癫痫有效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.4353, y: 1.09, z: 0.135 }, }),
      pt('TE8', '三阳络', 2.5, 40, 'left', { cunZ: 2, location: '在前臂背侧，腕横纹上4寸，尺骨与桡骨之间', indications: '耳聋，暴喑，齿痛，上肢痹痛' , niComment: '倪师认为此穴治暴喑、手臂痛有效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.4231, y: 1.1, z: 0.1162 }, }),
      pt('TE9', '四渎', 3, 42, 'left', { cunZ: 2, location: '在前臂背侧，阳池上5寸，尺骨与桡骨之间', indications: '耳聋，咽喉肿痛，前臂痛' , niComment: '倪师认为此穴治耳聋、前臂痛有效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.4041, y: 1.115, z: 0.0861 }, }),
      pt('TE10', '天井', 3.5, 47, 'left', { cunZ: 2, location: '在臂外侧，肘尖直上1寸凹陷处', indications: '耳聋，偏头痛，瘰疬，癫痫，肘臂痛', method: '坐位屈肘。从肘尖（参见“肘尖”）向上量1寸（拇指上1横指），即为本穴。', specialPoint: '合穴',  niComment: '三焦经合穴，倪师认为此穴治偏头痛、瘰疬有效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.3656, y: 1.1512, z: 0.0444 }, }),
      pt('TE11', '清冷渊', 3.5, 49, 'left', { cunZ: 2, location: '在臂外侧，肘尖直上2寸', indications: '头痛，目黄，肩臂痛不举' , niComment: '倪师认为此穴治肩臂痛有效', needlingMethod: '直刺0.8～1.2寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.3656, y: 1.1512, z: 0.0444 }, }),
      pt('TE12', '消泺', 4, 51, 'left', { cunZ: 2, location: '在臂外侧，清冷渊与臑会连线中点', indications: '头痛，颈项强痛，臂痛，齿痛' , niComment: '倪师认为此穴治颈项强痛、臂痛有效', needlingMethod: '直刺0.8～1.2寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.3025, y: 1.2077, z: 0.017 }, }),
      pt('TE13', '臑会', 5, 54, 'left', { cunZ: 2, intersections: ['SI'], location: '在臂外侧，肩髎下3寸，三角肌后缘', indications: '肩臂痛，瘿气，瘰疬' , niComment: '倪师认为此穴治甲状腺肿大、肩臂痛有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.2836, y: 1.2242, z: 0.0162 }, }),
      pt('TE14', '肩髎', 6, 62, 'left', { cunZ: 1, location: '在肩部，肩髃后方，肩峰后下方，上臂外展时肩峰后下方凹陷处', indications: '肩臂挛痛不遂' , niComment: '倪师认为此穴治肩周炎、肩臂不举有效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.2164, y: 1.3231, z: 0.0073 }, }),
      pt('TE15', '天髎', 4, 63, 'left', { cunZ: 3, intersections: ['GB'], location: '在肩胛部，肩井与曲垣之间凹陷处', indications: '肩臂痛，颈项强痛' , niComment: '倪师认为此穴治肩臂痛、颈项强急有效', needlingMethod: '直刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.2149, y: 1.3439, z: 0.0074 }, }),
      pt('TE16', '天牖', 3, 67, 'left', { cunZ: 1, location: '在颈侧部，乳突后方直下，胸锁乳突肌后缘', indications: '头痛，目痛，耳聋，瘰疬，颈项强痛' , niComment: '倪师认为此穴治头晕、头痛、项强有效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.2163, y: 1.4027, z: 0.0018 }, }),
      pt('TE17', '翳风', 3, 69, 'left', { cunZ: 0, intersections: ['GB'], classicRef: '《甲乙经》云：在耳后陷者中，按之引耳中', location: '在耳垂后方，乳突与下颌角之间凹陷处', indications: '耳鸣耳聋，口眼歪斜，牙关紧闭，颊肿，瘰疬', method: '正坐或侧卧位；在耳垂后方可触及一凹陷，此凹陷张口时更明显处，即为本穴。',  niComment: '倪师极常用此穴，治耳鸣、耳聋、面瘫特效。为治耳病要穴', needlingMethod: '直刺0.8～1.2寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1913, y: 1.4064, z: 0.0554 }, }),
      pt('TE18', '瘈脉', 3, 70, 'left', { cunZ: 0, location: '在头部，耳后乳突中央，角孙与翳风沿耳轮连线中下1/3交点处', indications: '头痛，耳聋耳鸣，小儿惊风' , niComment: '倪师认为此穴治小儿惊风、耳鸣有效', needlingMethod: '平刺0.3～0.5寸，或点刺出血', contraindications: '一般无特殊禁忌', position3d: { x: -0.1807, y: 1.4203, z: 0.0408 }, }),
      pt('TE19', '颅息', 3, 71, 'left', { cunZ: 0, location: '在头部，耳后乳突中央，角孙与翳风沿耳轮连线中上1/3交点处', indications: '头痛，耳聋耳鸣，小儿惊风，呕吐' , niComment: '倪师认为此穴治头痛、耳鸣有效', needlingMethod: '平刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1541, y: 1.431, z: 0.0392 }, }),
      pt('TE20', '角孙', 3.5, 73, 'left', { cunZ: 0, intersections: ['GB'], location: '在头部，耳尖正对发际处', indications: '耳部肿痛，目赤肿痛，齿痛，项强，头痛', method: '正坐或侧卧位。将耳翼向前方折曲，当耳翼尖所指之发际处，即为本穴。',  niComment: '倪师认为此穴治偏头痛、目赤肿痛有效', needlingMethod: '平刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0779, y: 1.5552, z: 0.0504 }, }),
      pt('TE21', '耳门', 2.5, 71.5, 'left', { cunZ: -2, location: '在面部，耳屏上切迹前方，下颌骨髁状突后缘凹陷处', indications: '耳聋耳鸣，聤耳，齿痛，颈颔痛', method: '正坐或侧卧位。手指置于耳屏上方、下颌骨髁状突后缘，轻按压有一浅凹陷，张口时凹陷更明显处，即为本穴。',  niComment: '倪师认为此穴治耳鸣、耳聋特效。须张口取穴', needlingMethod: '张口，直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.051736, y: 1.52335, z: 0.064084 }, }),
      pt('TE22', '耳和髎', 2.5, 71, 'left', { cunZ: -2, intersections: ['GB'], location: '在头侧部，鬓发后缘，耳廓根前方', indications: '头痛，耳鸣，牙关紧闭，口歪' , niComment: '倪师认为此穴治头痛、耳鸣、面瘫有效', needlingMethod: '避开动脉，斜刺或平刺0.3～0.5寸', contraindications: '避开颞浅动脉', position3d: { x: -0.054851, y: 1.528452, z: 0.044486 }, }),
      pt('TE23', '丝竹空', 2, 72, 'left', { cunZ: -3, location: '在面部，眉梢凹陷处', indications: '头痛，目赤痛，眼睑瞤动，齿痛，癫狂痫', method: '正坐或侧卧位。手指沿眉毛走形从内向外后推，至眉梢处可触及一凹陷处，按压有酸胀感，即为本穴。',  niComment: '倪师认为此穴治偏头痛、目赤肿痛有效。禁灸', needlingMethod: '平刺0.3～0.5寸', contraindications: '禁灸', position3d: { x: -0.0511, y: 1.5336, z: 0.1196 }, }),
    ],
    pathCun: [
      wp(2.5, 28, 'left', 2), wp(2.5, 34.5, 'left', 2), wp(2.5, 38, 'left', 2),
      wp(3.5, 47, 'left', 2), wp(5, 54, 'left', 2), wp(6, 62, 'left', 1),
      wp(3, 67, 'left', 1), wp(3, 69, 'left', 0), wp(3.5, 73, 'left', 0),
      wp(2, 72, 'left', -3),
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 11. 足少阳胆经 GALLBLADDER (GB) — 44 points (key points)
  // ──────────────────────────────────────────────────────────
  {
    code: 'GB',
    name: '足少阳胆经',
    nameEn: 'Gallbladder Meridian of Foot-Shaoyang',
    wuxing: '木',
    organ: '胆（腑）',
    color: '#2D5016',
    points: [
      pt('GB1', '瞳子髎', 2, 71.5, 'left', { cunZ: -3, intersections: ['TE'], classicRef: '《甲乙经》云：在目外眦旁', location: '在面部，目外眦旁0.5寸，眶骨外缘凹陷处', indications: '头痛，目赤肿痛，目翳，青盲，口眼歪斜', method: '正坐或侧卧位；在外眼角旁约1厘米，眼角纹头尽处，即为本穴。', specialPoint: '手太阳、手足少阳经交会穴',  niComment: '倪师认为此穴治目赤肿痛、头痛有效', needlingMethod: '平刺0.3～0.5寸，或用三棱针点刺出血', contraindications: '一般无特殊禁忌', position3d: { x: -0.0467, y: 1.5151, z: 0.1152 }, }),
      pt('GB2', '听会', 2.5, 71, 'left', { cunZ: -2, location: '在面部，耳屏间切迹前方，下颌骨髁状突后缘凹陷处', indications: '耳鸣耳聋，齿痛，口歪，腮肿', method: '正坐或侧卧位；用手指置于耳屏下方，在下颌骨髁状突后缘按压有一浅凹，张口时该凹陷更明显处，即为本穴。',  niComment: '倪师认为此穴治耳鸣、耳聋有效。须张口取穴', needlingMethod: '张口，直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.051022, y: 1.512524, z: 0.047995 }, }),
      pt('GB3', '上关', 3, 70.5, 'left', { cunZ: -2, intersections: ['ST'], location: '在耳前，颧弓上缘中央与下颌切迹之间凹陷中', indications: '偏头痛，耳鸣耳聋，口眼歪斜，齿痛，口噤' , niComment: '倪师认为此穴治偏头痛、耳鸣有效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0662, y: 1.5228, z: 0.0665 }, }),
      pt('GB4', '颔厌', 3.5, 72, 'left', { cunZ: -2, location: '在头部鬓发上，头维与曲鬓弧形连线上1/4与下3/4交点处', indications: '偏头痛，眩晕，耳鸣，齿痛，癫痫' , niComment: '倪师认为此穴治偏头痛、眩晕有效', needlingMethod: '平刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0638, y: 1.5653, z: 0.1097 }, }),
      pt('GB5', '悬颅', 3.5, 73, 'left', { cunZ: -1, location: '在头部鬓发上，头维与曲鬓弧形连线中点', indications: '偏头痛，目赤肿痛，齿痛' , niComment: '倪师认为此穴治偏头痛特效', needlingMethod: '平刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0653, y: 1.5562, z: 0.0933 }, }),
      pt('GB6', '悬厘', 3.5, 73.5, 'left', { cunZ: -1, location: '在头部鬓发上，头维与曲鬓弧形连线上1/4与下3/4交点处', indications: '偏头痛，目赤肿痛，耳鸣' , niComment: '倪师认为此穴治偏头痛、耳鸣有效', needlingMethod: '平刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0701, y: 1.545, z: 0.0803 }, }),
      pt('GB7', '曲鬓', 3.5, 74, 'left', { cunZ: 0, location: '在头部，耳前鬓角发际后缘与耳尖水平线交点处', indications: '偏头痛，颌颊肿痛，牙关紧闭' , niComment: '倪师认为此穴治偏头痛、牙关紧闭有效', needlingMethod: '平刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0713, y: 1.538, z: 0.059 }, }),
      pt('GB8', '率谷', 4, 75, 'left', { position3d: { x: -0.06738, y: 1.59255, z: 0.084394 }, cunZ: 1, location: '在头部，耳尖直上入发际1.5寸', indications: '偏头痛，眩晕，呕吐，小儿惊风', method: '正坐或侧卧位；折耳廓向前，当耳尖直上入发际2横指(食指、中指并拢，以中指近端指间关节横纹水平的二指宽度为1.5寸）处，即为本穴。', specialPoint: '足少阳、足太阳经交会穴',  niComment: '倪师认为此穴治偏头痛、眩晕有效', needlingMethod: '平刺0.5～0.8寸', contraindications: '一般无特殊禁忌'}),
      pt('GB9', '天冲', 4, 75, 'left', { cunZ: 2, location: '在头部，耳根后缘直上入发际2寸，率谷后0.5寸', indications: '头痛，牙龈肿痛，癫痫' , niComment: '倪师认为此穴治头痛、癫痫有效', needlingMethod: '平刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0852, y: 1.5767, z: 0.0335 }, }),
      pt('GB10', '浮白', 3.5, 74, 'left', { cunZ: 3, location: '在头部，耳后乳突后上方，天冲与完骨弧形连线上1/3与下2/3交点处', indications: '头痛，耳鸣，耳聋，齿痛，瘿气' , niComment: '倪师认为此穴治头痛、耳鸣、甲状腺肿有效', needlingMethod: '平刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0823, y: 1.5861, z: 0.0263 }, }),
      pt('GB11', '头窍阴', 3.5, 73, 'left', { cunZ: 3, location: '在头部，耳后乳突后上方，天冲与完骨弧形连线中1/3与下1/3交点处', indications: '头痛，耳鸣耳聋，颈项强痛' , niComment: '倪师认为此穴治头痛、眩晕有效', needlingMethod: '平刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0831, y: 1.5902, z: 0.0264 }, }),
      pt('GB12', '完骨', 3, 72, 'left', { cunZ: 3, location: '在头部，耳后乳突后下方凹陷处', indications: '头痛，颈项强痛，颊肿，喉痹，癫痫' , niComment: '倪师认为此穴治颈项强痛、头痛有效', needlingMethod: '斜刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.050519, y: 1.527396, z: 0.016865 }, }),
      pt('GB13', '本神', 2.5, 73, 'left', { cunZ: -2, location: '在头部，前发际上0.5寸，神庭旁开3寸', indications: '头痛，目眩，癫痫，小儿惊风' , niComment: '倪师认为此穴治头痛、癫痫有效', needlingMethod: '平刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0611, y: 1.5703, z: 0.1216 }, }),
      pt('GB14', '阳白', 2, 72, 'left', { cunZ: -3, location: '在前额部，瞳孔直上，眉上1寸', indications: '头痛，目眩，目痛，眼睑瞤动，面瘫' , niComment: '倪师认为此穴治前额头痛、眼病有效。为治额头痛要穴', needlingMethod: '平刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0327, y: 1.5417, z: 0.1451 }, }),
      pt('GB15', '头临泣', 2, 73, 'left', { cunZ: -2, intersections: ['DU'], location: '在头部，瞳孔直上，前发际上0.5寸', indications: '头痛，目眩，流泪，鼻塞，小儿惊风', method: '正坐或仰卧位，眼向前平视；自瞳孔直上，入前发际量半横指（大拇指指间关节部位的横径为1寸）处，即为本穴。', specialPoint: '足少阳、太阳与阳维脉交会穴',  niComment: '倪师认为此穴治头痛、目眩、鼻渊有效', needlingMethod: '平刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0445, y: 1.5567, z: 0.1376 }, }),
      pt('GB16', '目窗', 2.5, 74, 'left', { cunZ: -2, location: '在头部，前发际上1.5寸，头正中线旁开2.25寸', indications: '头痛，目眩，目赤肿痛，鼻塞' , niComment: '倪师认为此穴治头痛、目赤肿痛有效', needlingMethod: '平刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0585, y: 1.5746, z: 0.1274 }, }),
      pt('GB17', '正营', 3, 75, 'left', { cunZ: -1, location: '在头部，前发际上2.5寸，头正中线旁开2.25寸', indications: '头痛，头晕，目眩，齿痛' , niComment: '倪师认为此穴治头痛、眩晕有效', needlingMethod: '平刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0646, y: 1.5925, z: 0.1151 }, }),
      pt('GB18', '承灵', 3, 75, 'left', { cunZ: 1, location: '在头部，前发际上4寸，头正中线旁开2.25寸', indications: '头痛，眩晕，目痛，鼻塞，鼻衄' , niComment: '倪师认为此穴治头痛、鼻渊有效', needlingMethod: '平刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0668, y: 1.6108, z: 0.1067 }, }),
      pt('GB19', '脑空', 3, 74, 'left', { cunZ: 3, location: '在头部，枕外隆凸上缘外侧，头正中线旁开2.25寸', indications: '头痛，颈项强痛，目眩，心悸，癫痫' , niComment: '倪师认为此穴治头痛、颈项强痛有效', needlingMethod: '平刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0767, y: 1.6141, z: 0.0401 }, }),
      pt('GB20', '风池', 3, 67, 'left', { cunZ: 4, intersections: ['DU', 'TE'], classicRef: '《甲乙经》云：在颞颥后发际陷者中', location: '在项部，枕骨之下，胸锁乳突肌与斜方肌上端之间凹陷处', indications: '头痛，眩晕，颈项强痛，目赤肿痛，鼻渊，感冒，中风', method: '正坐或俯卧位；在后头骨下两条大筋外缘有两凹陷；此凹陷大致与耳垂齐平，用力按压有酸胀感，即为本穴。', specialPoint: '足少阳、阳维脉交会穴',  niComment: '倪师极常用此穴。治头痛、感冒、颈项强痛、眼病特效。为治风要穴，风池可治一切风证。倪师认为风池为临床最常用穴位之一', needlingMethod: '向鼻尖方向斜刺0.5～1.5寸', contraindications: '不可向内上方深刺，避免刺入枕骨大孔', position3d: { x: -0.105, y: 1.4506, z: -0.0232 }, }),
      pt('GB21', '肩井', 4, 63, 'left', { cunZ: 2, intersections: ['TE'], classicRef: '《甲乙经》云：在肩上陷者中，缺盆上大骨前', location: '在肩上，大椎与肩峰端连线中点', indications: '肩背痹痛，手臂不举，颈项强痛，乳痈，中风，难产', method: '坐位，低头；确定后正中线：即在背部中央所作的垂直线；在后正中线上，可见颈背部交界处椎骨上有一高突；这一高突能随颈部左右摆动而转动即是第7颈椎棘突，该棘突下有一凹陷即为大椎穴；大椎与肩部最高点连线中点，前对乳中即为本穴。', specialPoint: '手足少阳、足阳明与阳维脉交会穴',  niComment: '倪师极常用此穴。治肩背痛、乳腺炎特效。亦治难产。为手足少阳、阳维之会。注意不可深刺，避免气胸', needlingMethod: '直刺0.5～0.8寸', contraindications: '孕妇禁用，不可深刺避免气胸', position3d: { x: -0.1764, y: 1.4187, z: -0.0159 }, }),
      pt('GB22', '渊腋', 5, 58, 'left', { cunZ: -3, location: '在侧胸部，举臂，腋中线上，第4肋间隙', indications: '胸满，胁痛，腋下肿，臂痛不举' , niComment: '倪师认为此穴治胸胁胀满有效。不可深刺', needlingMethod: '斜刺或平刺0.5～0.8寸', contraindications: '不可深刺', position3d: { x: -0.147023, y: 1.254024, z: 0.084284 }, }),
      pt('GB23', '辄筋', 5, 57, 'left', { cunZ: -3, location: '在侧胸部，渊腋前1寸，第4肋间隙', indications: '胸胁痛，喘息，呕吐，吞酸', method: '正坐举臂。从渊腋穴向前下量1横指，与乳头相平处，即为本穴。',  niComment: '倪师认为此穴治胸胁痛、呕吐有效', needlingMethod: '斜刺或平刺0.5～0.8寸', contraindications: '不可深刺', position3d: { x: -0.147023, y: 1.254024, z: 0.084284 }, }),
      pt('GB24', '日月', 3.5, 56, 'left', { cunZ: -4, isMu: true, intersections: ['LR'], classicRef: '胆募穴，《甲乙经》云：在期门下一寸五分', location: '在上腹部，乳头直下，第7肋间隙', indications: '胁肋疼痛，呕吐，吞酸，呃逆，黄疸', method: '正坐或仰卧位；自乳头垂直向下推3个肋间隙（乳头平第四肋间隙），按压有酸胀感处，即为本穴。', specialPoint: '胆之募穴，足少阳、足太阴经交会穴',  niComment: '胆之募穴，倪师认为此穴治胆囊炎、黄疸、胁痛特效', needlingMethod: '斜刺或平刺0.5～0.8寸', contraindications: '不可深刺', position3d: { x: -0.1166, y: 1.2315, z: 0.131 }, }),
      pt('GB25', '京门', 4, 48, 'left', { cunZ: 2, isMu: true, classicRef: '肾募穴，在十二肋端', location: '在侧腰部，第12肋骨游离端下方', indications: '腰痛，小便不利，水肿，腹胀，泄泻' , niComment: '肾之募穴，倪师认为此穴治腰痛、肾炎、水肿有效', needlingMethod: '直刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.143284, y: 1.187999, z: 0.002792 }, }),
      pt('GB26', '带脉', 5, 48, 'left', { cunZ: 0, intersections: ['LR'], location: '在侧腹部，第11肋骨游离端下方垂线与脐水平线交点', indications: '月经不调，赤白带下，疝气，腰胁痛', method: '坐位，双臂外展或仰卧位，双臂上举；确定腋中线：从腋窝中点向下所作的垂线为腋中线；过脐中作一水平线；腋中线与脐水平线的交点，即为本穴；', specialPoint: '足少阳、带脉交会穴',  niComment: '倪师极常用此穴，治带下病、月经不调特效。为带脉所过之穴', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1433, y: 1.0098, z: 0.048 }, }),
      pt('GB27', '五枢', 5.5, 46, 'left', { cunZ: 0, location: '在侧腹部，髂前上棘前方，带脉下3寸', indications: '腰胯痛，带下，疝气，月经不调' , niComment: '倪师认为此穴治腰胯痛、带下有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.153, y: 0.9355, z: 0.0662 }, }),
      pt('GB28', '维道', 6, 44, 'left', { cunZ: 0, location: '在侧腹部，髂前上棘前方，五枢前下0.5寸', indications: '腰胯痛，带下，少腹痛，疝气' , niComment: '倪师认为此穴治腰胯痛、带下有效', needlingMethod: '直刺或向前下方斜刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1588, y: 0.9329, z: 0.0474 }, }),
      pt('GB29', '居髎', 6, 40, 'left', { cunZ: 2, location: '在髋部，髂前上棘与股骨大转子最凸点连线中点', indications: '腰腿痹痛，瘫痪，疝气', method: '侧卧位。拇指按于髂后上棘，中指按于股骨大转子（在髋骨的中下方，可摸到一圆而大的骨突起，手按于上面，下肢屈伸时明显触摸其活动），食指（示指）自然张开置于两指之间，食指（示指）所致凹陷处，即为本穴。', specialPoint: '足少阳、阳蹻脉交会穴',  niComment: '倪师认为此穴治腰腿痛、髋关节疼痛有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1613, y: 0.908, z: 0.0677 }, }),
      pt('GB30', '环跳', 5, 36, 'left', { cunZ: 4, classicRef: '《甲乙经》云：在髀枢中', location: '在股外侧部，股骨大转子最凸点与骶管裂孔连线的外1/3与中1/3交点处', indications: '腰胯疼痛，下肢痿痹，半身不遂', method: '侧卧屈股；以拇指关节横纹按在股骨大转子头上；拇指指向脊柱，拇指尖所指的凹陷处，即为本穴。', specialPoint: '足少阳、太阳经交会穴',  niComment: '倪师极常用此穴，治坐骨神经痛、腰腿痛、下肢痿痹特效。为治腰腿痛第一要穴。倪师认为环跳须深刺方效', needlingMethod: '直刺2～3寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.155, y: 0.8832, z: -0.0288 }, }),
      pt('GB31', '风市', 4, 30, 'left', { cunZ: 2, classicRef: '在大腿外侧中线上，腘横纹上七寸', location: '在大腿外侧中线上，腘横纹上7寸', indications: '下肢痿痹，遍身瘙痒，脚气', method: '直立，两手自然下垂；掌心贴于大腿，中指尖到达的地方，按压有酸胀感，即为本穴。',  niComment: '倪师极常用此穴，治下肢痿痹、中风后遗症、荨麻疹特效。为祛风要穴', needlingMethod: '直刺1～2寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1948, y: 0.7728, z: 0.0415 }, }),
      pt('GB32', '中渎', 4, 26, 'left', { cunZ: 2, location: '在大腿外侧中线上，风市下2寸', indications: '下肢痿痹，半身不遂' , niComment: '倪师认为此穴治下肢痿痹有效', needlingMethod: '直刺1～2寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.196263, y: 0.705407, z: 0.025915 }, }),
      pt('GB33', '膝阳关', 4, 20, 'left', { cunZ: 2, location: '在膝外侧，阳陵泉上3寸，股骨外上髁上方凹陷处', indications: '膝髌肿痛，腘筋挛急，小腿麻木' , niComment: '倪师认为此穴治膝关节炎、膝腘肿痛有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.18527, y: 0.55074, z: 0.041686 }, }),
      pt('GB34', '阳陵泉', 2, 19, 'left', { cunZ: 2, classicRef: '《甲乙经》云：在膝下一寸，胻外廉陷者中，筋会', location: '在小腿外侧，腓骨小头前下方凹陷处', indications: '胁痛，口苦，呕吐，黄疸，膝肿痛，下肢痿痹，小儿惊风', method: '坐位，屈膝成90度，膝关节下方，腓骨小头前缘与下缘交叉处有一凹陷，为取穴部位。坐位，屈膝成90度；在小腿部，膝关节外下方，可见一明显凸起（腓骨小头）；在该凸起前方可触及一凹陷，即为本穴。', specialPoint: '合穴；胆下合穴；八会穴之筋会',  niComment: '八会穴之筋会，胆经合穴，倪师极常用此穴。治胁痛、下肢痿痹、半身不遂特效。倪师认为阳陵泉为治筋病要穴，一切筋病皆可取此穴', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.1737, y: 0.4278, z: 0.0669 }, }),
      pt('GB35', '阳交', 2, 16, 'left', { cunZ: 2, location: '在小腿外侧，外踝尖上7寸，腓骨后缘', indications: '惊狂，癫痫，胸胁胀满，下肢痿痹', method: '坐位或仰卧位。从外踝尖与腘横纹头连线中点，向下量1横指，当腓骨后缘处为取穴部位。', specialPoint: '阳维脉之郄穴',  niComment: '倪师认为此穴治胸胁胀满、癫狂有效。阳维郄穴', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.215, y: 0.435, z: 0.02 }, }),
      pt('GB36', '外丘', 2.5, 14, 'left', { cunZ: 2, isXi: true, location: '在小腿外侧，外踝尖上7寸，腓骨前缘', indications: '胸胁胀满，下肢痿痹，癫狂', method: '坐位或仰卧位。从外踝尖与腘横纹头连线中点，向下量1横指，当腓骨前缘处为取穴部位。', specialPoint: '郄穴',  niComment: '胆经郄穴，倪师认为此穴治胸胁胀满、颈项强痛有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.215, y: 0.435, z: 0.035 }, }),
      pt('GB37', '光明', 2.5, 10, 'left', { cunZ: 2, isLuo: true, location: '在小腿外侧，外踝尖上5寸，腓骨前缘', indications: '目痛，夜盲，视物不明，下肢痿痹，乳房胀痛', method: '坐位或仰卧位；取外踝尖到腘横纹头的中点（外踝尖到过横纹头的距离为16寸）；从此中点往下量4横指（食指（示指）、中指、无名指、小指四指并拢，以中指近端指间关节横纹水平的四指宽度为3寸，也称一夫法），在小腿外侧骨头（腓骨）前缘处，即为本穴。', specialPoint: '络穴',  niComment: '胆经络穴，倪师认为此穴治眼病特效。为治目疾要穴，治夜盲、近视有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.216, y: 0.355, z: 0.037 }, }),
      pt('GB38', '阳辅', 2.5, 8, 'left', { cunZ: 2, location: '在小腿外侧，外踝尖上4寸，腓骨前缘稍前', indications: '偏头痛，目外眦痛，瘰疬，下肢痿痹' , niComment: '胆经经穴，倪师认为此穴治偏头痛、腋下肿痛有效', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.216, y: 0.315, z: 0.035 }, }),
      pt('GB39', '悬钟', 2.5, 7, 'left', { cunZ: 2, classicRef: '髓会，绝骨穴，《甲乙经》云：在足外踝上三寸', location: '在小腿外侧，外踝尖上3寸，腓骨前缘', indications: '颈项强痛，胸胁胀痛，下肢痿痹，痔疾', method: '坐位或侧卧位；从外踝尖直上量4横指（食指（示指）、中指、无名指、小指四指并拢，以中指近端指间关节横纹水平的四指宽度为3寸，也称一夫法），小腿外侧骨（腓骨）前缘，即为本穴。', specialPoint: '八会穴之髓会',  niComment: '八会穴之髓会，倪师极常用此穴。治落枕、颈项强痛特效。为治髓病要穴。倪师认为此穴可治贫血、白细胞减少', needlingMethod: '直刺1～1.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.215, y: 0.275, z: 0 }, }),
      pt('GB40', '丘墟', 2.5, 3.5, 'left', { cunZ: 2, isYuan: true, location: '在足外踝前下方，趾长伸肌腱外侧凹陷处', indications: '胸胁胀痛，下肢痿痹，外踝肿痛，疟疾', method: '坐位或仰卧位。取足外踝前缘垂线与下缘水平线的交点，按压有凹陷处，即为本穴。', specialPoint: '原穴',  niComment: '胆经原穴，倪师认为此穴治胸胁痛、外踝肿痛有效', needlingMethod: '直刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.196, y: 0.091, z: 0.063 }, }),
      pt('GB41', '足临泣', 2.5, 2, 'left', { cunZ: 1, intersections: ['LR'], location: '在足背外侧，第4跖趾关节后方，小趾伸肌腱外侧凹陷处', indications: '头痛，目赤肿痛，胁肋疼痛，月经不调，乳痈', method: '坐位或仰卧位，小趾向上跷起；在足背4、5跖骨间可触及一条索状筋（小趾伸肌腱）；在此筋外侧缘，足4、5跖骨结合部前方可触及一凹陷，即为本穴。', specialPoint: '输穴；八脉交会穴（通于带脉）',  niComment: '八脉交会穴通带脉，倪师极常用此穴。治偏头痛、乳腺炎、胁痛特效。与外关配伍为倪师常用组合', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.175, y: 0.035, z: 0.155 }, }),
      pt('GB42', '地五会', 2.5, 1.5, 'left', { cunZ: 1, location: '在足背外侧，第4跖趾关节后方，小趾伸肌腱内侧凹陷处', indications: '头痛，目赤，耳鸣，乳痈，足背肿痛' , niComment: '倪师认为此穴治耳鸣、头痛有效', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.17, y: 0.028, z: 0.168 }, }),
      pt('GB43', '侠溪', 2.5, 0.5, 'left', { cunZ: 1, location: '在足背外侧，第4、5趾间，趾蹼缘后方赤白肉际处', indications: '头痛，眩晕，耳鸣，耳聋，目赤肿痛，颊肿' , niComment: '胆经荥穴，倪师认为此穴治偏头痛、耳鸣有效', needlingMethod: '直刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.17, y: 0.015, z: 0.195 }, }),
      pt('GB44', '足窍阴', 2.5, 0, 'left', { cunZ: 1, isJingWell: true, classicRef: '《甲乙经》云：在足小指次指之端，去爪甲角如韭叶', location: '在足第4趾末节外侧，趾甲角旁0.1寸', indications: '偏头痛，目赤肿痛，耳聋，咽喉肿痛，胸胁痛，热病', method: '正坐垂足或仰卧位。在第4趾外侧，由第4趾趾甲外侧缘（即掌背交界线，又称赤白肉际处）与下缘各作一垂线之交点处，即为本穴。', specialPoint: '井穴',  niComment: '胆经井穴，倪师认为此穴点刺出血可治头痛、失眠。为急救穴之一', needlingMethod: '浅刺0.1寸，或点刺出血', contraindications: '一般无特殊禁忌', position3d: { x: -0.168, y: 0.012, z: 0.205 }, }),
    ],
    pathCun: [
      wp(2, 71.5, 'left', -3), wp(3.5, 73, 'left', -1), wp(4, 75, 'left', 1),
      wp(3, 67, 'left', 4), wp(4, 63, 'left', 2), wp(3.5, 56, 'left', -4),
      wp(5, 36, 'left', 4), wp(4, 30, 'left', 2), wp(2, 19, 'left', 2),
      wp(2.5, 7, 'left', 2), wp(2.5, 3.5, 'left', 2), wp(2.5, 0, 'left', 1),
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 12. 足厥阴肝经 LIVER (LR) — 14 points
  // ──────────────────────────────────────────────────────────
  {
    code: 'LR',
    name: '足厥阴肝经',
    nameEn: 'Liver Meridian of Foot-Jueyin',
    wuxing: '木',
    organ: '肝（脏）',
    color: '#2D5016',
    points: [
      pt('LR1', '大敦', 1, 0, 'left', { cunZ: 0, isJingWell: true, classicRef: '《甲乙经》云：在足大指端，去爪甲角如韭叶及三毛中', location: '在足大趾外侧，趾甲角旁0.1寸', indications: '疝气，遗尿，崩漏，阴挺，痫证，经闭', method: '坐位或仰卧位。于足大趾背外侧，从拇趾爪甲外侧缘与基底部各作一线，其交点处即为本穴。', specialPoint: '井穴', position3d: { x: -0.215, y: 0.015, z: 0.200 }, }),
      pt('LR2', '行间', 1.2, 0.5, 'left', { cunZ: 0, location: '在足背，第1、2趾间，趾蹼缘后方赤白肉际处', indications: '头痛，目赤肿痛，胁痛，疝气，月经不调，崩漏', method: '坐位或仰卧位；在足背侧，第1、2趾两趾之间连接处的缝纹头，按压有凹陷处，即为本穴。', specialPoint: '荥穴', position3d: { x: -0.195, y: 0.020, z: 0.188 }, }),
      pt('LR3', '太冲', 1.5, 1.5, 'left', { cunZ: 0, isYuan: true, classicRef: '《甲乙经》云：在足大指本节后二寸，或曰一寸五分陷者中', location: '在足背，第1、2跖骨结合部前方凹陷处', indications: '头痛，眩晕，目赤肿痛，胁痛，疝气，月经不调，癫狂', method: '坐位或仰卧位；由第1、2足趾间缝纹头向足背推；至第1、2跖骨之间跖骨结合部前方，可感有一凹陷处，即为本穴。', specialPoint: '输穴；原穴', position3d: { x: -0.195, y: 0.032, z: 0.155 }, }),
      pt('LR4', '中封', 1.5, 3.5, 'left', { cunZ: 0, location: '在足内踝前，胫骨前肌腱内侧凹陷处', indications: '疝气，阴茎痛，遗精，小便不利，胸腹胀满', method: '坐位或仰卧位，拇趾上跷；足背内侧可见一大筋（胫骨前肌腱），在其内侧、足内踝前下方可触及一凹陷处，即为本穴。', specialPoint: '经穴', position3d: { x: -0.190, y: 0.080, z: 0.055 }, }),
      pt('LR5', '蠡沟', 1.5, 6, 'left', { cunZ: 0, isLuo: true, location: '在小腿内侧，内踝尖上5寸，胫骨内侧面上', indications: '月经不调，赤白带下，阴挺，小便不利，疝气', method: '坐位或仰卧位。从内踝尖垂直向上量4横指，再直上量2横指（拇指），在胫骨内侧缘凹陷中，按压有酸胀感处，即为本穴。', specialPoint: '络穴', position3d: { x: -0.187, y: 0.368, z: 0.050 } }),
      pt('LR6', '中都', 1.5, 9, 'left', { cunZ: 0, isXi: true, location: '在小腿内侧，内踝尖上7寸，胫骨内侧面上', indications: '疝气，崩漏，腹痛，泄泻，恶露不尽', method: '坐位或仰卧位。取一标有二等分线的弹性皮筋，将皮筋的两端分别与内踝尖及胫骨内侧髁（膝关节上下、小腿上端内侧的骨性膨大）对齐拉紧，皮筋中点稍下方（约0.5寸）处，即为本穴。', specialPoint: '郄穴', position3d: { x: -0.190, y: 0.448, z: 0.045 } }),
      pt('LR7', '膝关', 1.5, 18, 'left', { cunZ: 0, location: '在小腿内侧，阴陵泉后1寸', indications: '膝髌肿痛，下肢痿痹', position3d: { x: -0.190, y: 0.450, z: 0.020 } }),
      pt('LR8', '曲泉', 2, 19, 'left', { position3d: { x: -0.130334, y: 0.469534, z: 0.053935 }, cunZ: 0, classicRef: '《甲乙经》云：在膝内辅骨下，大筋上小筋下陷者中', location: '在膝内侧，屈膝时膝关节内侧面横纹内侧端，股骨内侧髁后缘', indications: '月经不调，痛经，带下，阴挺，疝气，小便不利，膝痛', method: '屈膝端坐，双腿略张开。在膝内侧可摸及一高骨（即股骨内侧髁），从高骨向后，可触及两筋（半腱肌、半膜肌），在高骨后缘、两筋前方，腘横纹头上方凹陷处，按压有酸胀感，即为本穴。', specialPoint: '合穴', }),
      pt('LR9', '阴包', 2.5, 25, 'left', { position3d: { x: 0.105453, y: 0.726424, z: 0.124901 }, cunZ: -1, location: '在大腿内侧，股骨内上髁上4寸，缝匠肌后缘', indications: '月经不调，腰骶痛，腹痛，遗尿' }),
      pt('LR10', '足五里', 3, 32, 'left', { position3d: { x: -0.03861, y: 0.985128, z: 0.147208 }, cunZ: -1, location: '在大腿内侧，气冲直下3寸', indications: '小腹痛，小便不通，阴挺，睾丸肿痛' }),
      pt('LR11', '阴廉', 3, 36, 'left', { position3d: { x: -0.07681, y: 1.046344, z: 0.131653 }, cunZ: -1, location: '在大腿内侧，气冲直下2寸', indications: '月经不调，小腹痛' }),
      pt('LR12', '急脉', 3, 40, 'left', { position3d: { x: 0.017951, y: 0.986151, z: 0.137901 }, cunZ: -2, location: '在耻骨联合下缘中点旁开2.5寸', indications: '疝气，小腹痛，阴挺' }),
      pt('LR13', '章门', 4, 48, 'left', { position3d: { x: -0.089309, y: 1.084319, z: 0.112169 }, cunZ: -3, isMu: true, intersections: ['SP'], classicRef: '脾募穴，脏会，《甲乙经》云：在大横外直脐季胁端', location: '在侧腹部，第11肋骨游离端下方', indications: '腹胀，泄泻，胁痛，痞块', method: '正坐，屈肘合腋；肘尖所指处，按压有酸胀感，即为本穴。', specialPoint: '脾之募穴；八会穴之脏会；足厥阴、足少阳经', }),
      pt('LR14', '期门', 3.5, 56, 'left', { position3d: { x: -0.114568, y: 1.232735, z: 0.128172 }, cunZ: -4, isMu: true, intersections: ['SP'], classicRef: '肝募穴，《甲乙经》云：在第二肋端，不容旁各一寸五分', location: '在胸部，乳头直下，第6肋间隙，前正中线旁开4寸', indications: '胸胁胀痛，呕吐，呃逆，腹胀，乳痈', method: '正坐或仰卧位（女性取仰卧位）；自乳头垂直向下推2个肋间隙（乳头平第四肋间隙），按压有酸胀感处，即为本穴。', specialPoint: '肝之募穴', }),
    ],
    pathCun: [
      wp(1, 0, 'left', 0), wp(1.5, 1.5, 'left', 0), wp(1.5, 6, 'left', 0),
      wp(2, 19, 'left', 0), wp(3, 36, 'left', -1), wp(4, 48, 'left', -3),
      wp(3.5, 56, 'left', -4),
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 13. 任脉 CONCEPTION VESSEL (RN) — 24 points
  // ──────────────────────────────────────────────────────────
  {
    code: 'RN',
    name: '任脉',
    nameEn: 'Conception Vessel (Ren Mai)',
    wuxing: '土',
    organ: '阴脉之海',
    color: '#8B7355',
    points: [
      pt('RN1', '会阴', 0, 41, 'midline', { position3d: { x: 0.001, y: 0.905063, z: 0.125344 }, cunZ: -5, classicRef: '《甲乙经》云：在大便前小便后两阴之间', location: '在会阴部，男性阴囊根部与肛门连线中点，女性大阴唇后联合与肛门连线中点', indications: '溺水窒息，昏迷，癫狂，小便不利，痔疾，遗精，月经不调' }),
      pt('RN2', '曲骨', 0, 42, 'midline', { position3d: { x: 0.001, y: 0.904263, z: 0.125687 }, cunZ: -5, intersections: ['LR'], location: '在下腹部，前正中线上，耻骨联合上缘中点处', indications: '小便淋沥，遗尿，遗精，阳痿，月经不调，带下' }),
      pt('RN3', '中极', 0, 43, 'midline', { position3d: { x: 0.001, y: 0.92735, z: 0.128689 }, cunZ: -5, isMu: true, classicRef: '膀胱募穴，《甲乙经》云：在脐下四寸', location: '在下腹部，前正中线上，脐中下4寸', indications: '小便不利，遗尿，疝气，遗精，阳痿，月经不调，崩漏，带下', method: '仰卧位或正坐位；确定耻骨联合：沿下腹部前正中线垂直向下推，可触及一骨头，此骨头即为耻骨联合；将脐中与耻骨联合上缘中点的连线平分为5等分；该连线的上4/5与下1/5交点处即为本穴。', specialPoint: '膀胱募穴，任脉、足三阴经交会穴', }),
      pt('RN4', '关元', 0, 44, 'midline', { position3d: { x: 0.001, y: 0.957013, z: 0.128656 }, cunZ: -5, isMu: true, intersections: ['SP', 'KI', 'LR'], classicRef: '小肠募穴，《甲乙经》云：在脐下三寸', location: '在下腹部，前正中线上，脐中下3寸', indications: '遗尿，小便频数，尿闭，遗精，阳痿，月经不调，崩漏，虚劳赢瘦', method: '仰卧位或正坐位；确定耻骨联合：沿下腹部前正中线垂直向下推，可触及一骨头，此骨头即为耻骨联合；将脐中与耻骨联合上缘中点的连线平分为5等分；该连线的上3/5与下2/5交点处即为本穴。', specialPoint: '小肠募穴，任脉、足三阴经交会穴', }),
      pt('RN5', '石门', 0, 45, 'midline', { position3d: { x: 0.001, y: 0.986213, z: 0.132894 }, cunZ: -5, isMu: true, classicRef: '三焦募穴，《甲乙经》云：在脐下二寸', location: '在下腹部，前正中线上，脐中下2寸', indications: '腹胀，泄泻，小便不利，遗精，阳痿，闭经，带下', method: '仰卧位或正坐位；确定耻骨联合：沿下腹部前正中线垂直向下推，可触及一骨头，此骨头即为耻骨联合；将脐中与耻骨联合上缘中点的连线平分为5等分；该连线的上2/5与下3/5交点处即为本穴。', specialPoint: '三焦募穴', }),
      pt('RN6', '气海', 0, 46, 'midline', { position3d: { x: 0.001, y: 1.016095, z: 0.135051 }, cunZ: -5, classicRef: '《甲乙经》云：在脐下一寸五分', location: '在下腹部，前正中线上，脐中下1.5寸', indications: '腹痛，泄泻，便秘，遗尿，疝气，虚脱，虚劳赢瘦', method: '仰卧位或正坐位。从肚脐起沿下腹部前正中线直下量2横指(食指、中指并拢，以中指近端指间关节横纹水平的二指宽度为1.5寸）处，即为本穴。', }),
      pt('RN7', '阴交', 0, 46.5, 'midline', { position3d: { x: 0.001, y: 1.019452, z: 0.135483 }, cunZ: -5, intersections: ['KI'], location: '在下腹部，前正中线上，脐中下1寸', indications: '腹痛，水肿，疝气，月经不调，带下' }),
      pt('RN8', '神阙', 0, 47, 'midline', { position3d: { x: 0.001, y: 1.019983, z: 0.135522 }, cunZ: -5, classicRef: '肚脐正中，《甲乙经》云：脐中，禁刺', location: '在脐窝正中', indications: '腹痛，泄泻，脱肛，水肿，虚脱', method: '仰卧位或正坐位；肚脐中央，即为本穴。', }),
      pt('RN9', '水分', 0, 48, 'midline', { position3d: { x: 0.001, y: 1.044348, z: 0.134623 }, cunZ: -5, location: '在上腹部，前正中线上，脐中上1寸', indications: '腹痛，腹胀，肠鸣，泄泻，水肿，小便不利' }),
      pt('RN10', '下脘', 0, 49, 'midline', { position3d: { x: 0.001, y: 1.085146, z: 0.132731 }, cunZ: -5, intersections: ['SP'], location: '在上腹部，前正中线上，脐中上2寸', indications: '腹痛，腹胀，呕吐，泄泻，食谷不化，痞块', method: '仰卧位；沿前正中线向下触摸，找出胸骨体与剑突间行成的凹陷，即胸剑联合；将胸剑联合与脐中连线分为4等分；该连线的下1/4与上3/4交点处，即为本穴。', specialPoint: '任脉、足太阴经交会穴', }),
      pt('RN11', '建里', 0, 50, 'midline', { position3d: { x: 0.001, y: 1.108768, z: 0.13426 }, cunZ: -5, location: '在上腹部，前正中线上，脐中上3寸', indications: '胃痛，呕吐，食欲不振，腹胀，水肿', method: '仰卧位或正坐位。从肚脐起沿腹部前正中线直上量4横指处，即为本穴。', }),
      pt('RN12', '中脘', 0, 51, 'midline', { position3d: { x: 0.001, y: 1.134247, z: 0.136171 }, cunZ: -5, isMu: true, intersections: ['SP', 'KI', 'LR'], classicRef: '胃募穴，腑会，《甲乙经》云：在上脘下一寸', location: '在上腹部，前正中线上，脐中上4寸', indications: '胃痛，呕吐，腹胀，泄泻，黄疸，脾胃虚弱', method: '仰卧位；沿前正中线向下触摸，找出胸骨体与剑突间行成的凹陷，即胸剑联合；胸剑联合与脐中连线的中点，即为本穴。', specialPoint: '胃募穴；八会穴之腑会；任脉、手太阳、少阳', }),
      pt('RN13', '上脘', 0, 52, 'midline', { position3d: { x: 0.001, y: 1.16217, z: 0.137647 }, cunZ: -5, intersections: ['SP'], location: '在上腹部，前正中线上，脐中上5寸', indications: '胃痛，呕吐，腹胀，痞满，癫痫', method: '仰卧位。取一标有二等分的弹性皮筋，将皮筋的两头与肚脐、胸剑联合部对齐拉紧，从皮筋的中点直上量1横指处，即为本穴。', specialPoint: '任脉、手太阳、足阳明经交会穴', }),
      pt('RN14', '巨阙', 0, 53, 'midline', { position3d: { x: 0.001, y: 1.190883, z: 0.137924 }, cunZ: -5, isMu: true, classicRef: '心募穴，《甲乙经》云：在鸠尾下一寸', location: '在上腹部，前正中线上，脐中上6寸', indications: '胸痛，心悸，呕吐，吞酸，癫狂痫', method: '仰卧位；沿前正中线向下触摸，找出胸骨体与剑突间行成的凹陷，即胸剑联合；将胸剑联合与脐中连线分为4等分，上1/4与下3/4交点处，即为本穴。', specialPoint: '心之募穴', }),
      pt('RN15', '鸠尾', 0, 54, 'midline', { position3d: { x: 0.001, y: 1.191554, z: 0.137981 }, cunZ: -5, classicRef: '《甲乙经》云：在臆前蔽骨下五分', location: '在上腹部，前正中线上，胸剑结合部下1寸', indications: '胸痛，心悸，腹胀，癫狂痫', method: '仰卧位。从胸剑结合部沿前正中线直下量1横指处，即为本穴。', specialPoint: '络穴', }),
      pt('RN16', '中庭', 0, 55, 'midline', { position3d: { x: 0.001, y: 1.220007, z: 0.137843 }, cunZ: -5, location: '在胸部，前正中线上，平第5肋间隙', indications: '胸胁胀满，心痛，呕吐，噎膈' }),
      pt('RN17', '膻中', 0, 58, 'midline', { position3d: { x: 0.001, y: 1.267407, z: 0.143746 }, cunZ: -5, isMu: true, intersections: ['SP', 'KI', 'LR'], classicRef: '心包募穴，气会，《甲乙经》云：在玉堂下一寸六分', location: '在胸部，前正中线上，平第4肋间隙，两乳头连线中点', indications: '咳嗽，气喘，胸痛，心悸，乳少，呕吐', method: '仰卧位或正坐位；确定前正中线：前正中线是指胸骨正前方正中的一条垂直线；两乳头连线与前正中线的交点，即为本穴。', specialPoint: '心包募穴；八会穴之气会', }),
      pt('RN18', '玉堂', 0, 59, 'midline', { position3d: { x: 0.001, y: 1.267859, z: 0.143654 }, cunZ: -5, location: '在胸部，前正中线上，平第3肋间隙', indications: '咳嗽，气喘，胸痛，呕吐' }),
      pt('RN19', '紫宫', 0, 60, 'midline', { position3d: { x: 0.001, y: 1.290863, z: 0.137106 }, cunZ: -5, location: '在胸部，前正中线上，平第2肋间隙', indications: '咳嗽，气喘，胸痛，喉痹' }),
      pt('RN20', '华盖', 0, 61, 'midline', { position3d: { x: 0.001, y: 1.291271, z: 0.136954 }, cunZ: -5, location: '在胸部，前正中线上，平第1肋间隙', indications: '咳嗽，气喘，胸胁胀痛', method: '仰卧位，或仰靠坐位。确定胸部前正中线：前正中线是指胸骨正前方正中的一条垂直线；在胸部前正中线上可见胸骨前部有一微向前突的角（胸骨角），此角中点处即为本穴。', }),
      pt('RN21', '璇玑', 0, 62, 'midline', { position3d: { x: 0.001, y: 1.313773, z: 0.124007 }, cunZ: -5, location: '在胸部，前正中线上，天突下1寸', indications: '咳嗽，气喘，胸痛，咽喉肿痛' }),
      pt('RN22', '天突', 0, 64, 'midline', { position3d: { x: 0.001, y: 1.396357, z: 0.078661 }, cunZ: -4, classicRef: '《甲乙经》云：在颈结喉下五寸中央宛宛中', location: '在颈部，前正中线上，胸骨上窝中央', indications: '咳嗽，哮喘，咽喉肿痛，暴喑，瘿气，梅核气', method: '仰卧位或仰靠坐位；由喉结直下可摸到一凹陷，在此凹陷中央，即为本穴。', specialPoint: '任脉、阴维脉交会穴', }),
      pt('RN23', '廉泉', 0, 66, 'midline', { position3d: { x: 0.001, y: 1.494285, z: 0.099401 }, cunZ: -4, classicRef: '《甲乙经》云：在颔下结喉上舌本下', location: '在颈部，前正中线上，喉结上方，舌骨体上缘凹陷处', indications: '舌强不语，舌下肿痛，吞咽困难，中风失语', method: '仰卧位。从下巴沿颈前正中线向下推，在喉结上方可触及舌骨体，舌骨上缘中点的凹陷处，即为本穴。', specialPoint: '任脉、阴维脉交会穴', }),
      pt('RN24', '承浆', 0, 68, 'midline', { position3d: { x: 0.001, y: 1.506732, z: 0.146674 }, cunZ: -4, intersections: ['DU', 'ST'], classicRef: '《甲乙经》云：在颐前下唇之下', location: '在面部，颏唇沟正中凹陷处', indications: '口歪，齿痛，面肿，癫狂，口腔溃疡', method: '正坐仰靠。颏唇沟的正中按压有凹陷处，即为本穴。', specialPoint: '任脉、足阳明经交会穴', }),
    ],
    pathCun: [
      wp(0, 41, 'midline', -5), wp(0, 47, 'midline', -5), wp(0, 51, 'midline', -5),
      wp(0, 58, 'midline', -5), wp(0, 64, 'midline', -4), wp(0, 68, 'midline', -4),
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 14. 督脉 GOVERNING VESSEL (DU) — 28 points
  // ──────────────────────────────────────────────────────────
  {
    code: 'DU',
    name: '督脉',
    nameEn: 'Governing Vessel (Du Mai)',
    wuxing: '火',
    organ: '阳脉之海',
    color: '#8B1A1A',
    points: [
      pt('DU1', '长强', 0, 39, 'midline', { cunZ: 6, classicRef: '《甲乙经》云：在脊骶端', location: '在尾骨端下，尾骨端与肛门连线中点处', indications: '痔疾，脱肛，便秘，腰脊痛，癫狂痫', method: '仰卧屈膝；在尾骨端下，尾骨端与肛门连线的中点，即为本穴。', specialPoint: '络穴，督脉、足少阳、足少阴经交会穴',  niComment: '督脉络穴，倪师认为此穴治痔疮、脱肛特效。为治肛肠疾病要穴', needlingMethod: '斜刺，紧靠尾骨前面刺入0.8～1寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.0018, y: 0.8593, z: -0.0604 }, }),
      pt('DU2', '腰俞', 0, 43, 'midline', { cunZ: 6, location: '在骶部，后正中线上，骶管裂孔处', indications: '腰脊强痛，下肢痿痹，痔疾，脱肛，月经不调' , niComment: '倪师认为此穴治腰骶痛、痔疾有效', needlingMethod: '向上斜刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: 0.0019, y: 0.92, z: -0.0808 }, }),
      pt('DU3', '腰阳关', 0, 47, 'midline', { cunZ: 6, classicRef: '《甲乙经》云：在第十六椎节下间', location: '在腰部，后正中线上，第4腰椎棘突下凹陷中', indications: '腰骶疼痛，下肢痿痹，月经不调，遗精，阳痿', method: '正坐或俯卧位；确定两髂嵴高点；两髂嵴连线的中点与后正中线的交点为第4腰椎棘突；在第4腰椎棘突下有一凹陷，即为本穴。',  niComment: '倪师极常用此穴，治腰骶痛、下肢痿痹特效。为治腰痛要穴', needlingMethod: '直刺或向上斜刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0046, y: 1.0587, z: -0.0531 }, }),
      pt('DU4', '命门', 0, 49, 'midline', { cunZ: 6, classicRef: '《甲乙经》云：在第十四椎节下间', location: '在腰部，后正中线上，第2腰椎棘突下凹陷中', indications: '腰脊强痛，遗精，阳痿，带下，月经不调，泄泻，虚损腰痛', method: '正坐或俯卧位；取一线过肚脐中点，水平绕腰腹一周；该线与后正中线交点，按压有凹陷处，即为本穴。',  niComment: '倪师极常用此穴。为补肾壮阳第一要穴。治肾阳虚诸证特效。治腰痛、阳痿、遗精、宫寒不孕。倪师认为命门为生命之火', needlingMethod: '直刺或向上斜刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0003, y: 1.1239, z: -0.0604 }, }),
      pt('DU5', '悬枢', 0, 51, 'midline', { cunZ: 6, location: '在腰部，后正中线上，第1腰椎棘突下凹陷中', indications: '腰脊强痛，泄泻，腹痛' , niComment: '倪师认为此穴治腰脊强痛、泄泻有效', needlingMethod: '直刺或向上斜刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0001, y: 1.1514, z: -0.0639 }, }),
      pt('DU6', '脊中', 0, 53, 'midline', { cunZ: 6, location: '在背部，后正中线上，第11胸椎棘突下凹陷中', indications: '泄泻，黄疸，痔疾，脱肛，小儿疳积' , niComment: '倪师认为此穴治黄疸、腹泻、痔疮有效', needlingMethod: '斜刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0005, y: 1.2006, z: -0.0659 }, }),
      pt('DU7', '中枢', 0, 54, 'midline', { cunZ: 6, location: '在背部，后正中线上，第10胸椎棘突下凹陷中', indications: '黄疸，呕吐，腹满，腰脊强痛' , niComment: '倪师认为此穴治腰脊强痛、黄疸有效', needlingMethod: '斜刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0012, y: 1.2208, z: -0.0672 }, }),
      pt('DU8', '筋缩', 0, 55, 'midline', { cunZ: 6, location: '在背部，后正中线上，第9胸椎棘突下凹陷中', indications: '癫狂痫，抽搐，脊强，胃痛' , niComment: '倪师认为此穴治脊背强痛、癫痫有效', needlingMethod: '斜刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0013, y: 1.2409, z: -0.0687 }, }),
      pt('DU9', '至阳', 0, 57, 'midline', { cunZ: 6, classicRef: '《甲乙经》云：在第七椎节下间', location: '在背部，后正中线上，第7胸椎棘突下凹陷中', indications: '黄疸，胸胁胀满，咳嗽，脊强，背痛', method: '俯卧位或正坐位在上臂自然下垂时贴于胸侧壁时确定肩胛下角；从两侧肩胛下角连线与后正中线相交处所在椎体为第7胸椎；在该椎体棘突下凹陷处，即为本穴。',  niComment: '倪师极常用此穴，治黄疸、胸胁胀满特效。亦治心绞痛。倪师认为至阳为治黄疸要穴', needlingMethod: '斜刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0018, y: 1.2802, z: -0.0699 }, }),
      pt('DU10', '灵台', 0, 58, 'midline', { cunZ: 6, location: '在背部，后正中线上，第6胸椎棘突下凹陷中', indications: '咳嗽，气喘，脊背强痛，疔疮' , niComment: '倪师认为此穴治咳嗽、疔疮有效', needlingMethod: '斜刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0017, y: 1.2992, z: -0.0693 }, }),
      pt('DU11', '神道', 0, 59, 'midline', { cunZ: 6, location: '在背部，后正中线上，第5胸椎棘突下凹陷中', indications: '心悸，健忘，失眠，咳嗽，脊背强痛' , niComment: '倪师认为此穴治心痛、失眠有效', needlingMethod: '斜刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0018, y: 1.3194, z: -0.0676 }, }),
      pt('DU12', '身柱', 0, 61, 'midline', { cunZ: 6, classicRef: '《甲乙经》云：在第三椎节下间', location: '在背部，后正中线上，第3胸椎棘突下凹陷中', indications: '咳嗽，气喘，癫痫，脊背强痛，疔疮', method: '正坐或俯卧位；在上臂自然下垂时贴于胸侧壁时确定肩胛下角；从两侧肩胛下角连线与后正中线相交处所在椎体为第7胸椎；从第7胸椎棘突垂直向上推4个椎体棘突即是第3胸椎棘突；在第3胸椎棘突下有一凹陷，即为本穴。',  niComment: '倪师极常用此穴，治小儿癫痫、咳嗽有效。为小儿保健要穴。倪师认为身柱可增强小儿体质', needlingMethod: '斜刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0031, y: 1.3579, z: -0.0616 }, }),
      pt('DU13', '陶道', 0, 62, 'midline', { cunZ: 6, intersections: ['BL'], location: '在背部，后正中线上，第1胸椎棘突下凹陷中', indications: '热病，疟疾，脊强，头痛' , niComment: '倪师认为此穴治感冒发热、疟疾有效', needlingMethod: '斜刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0037, y: 1.3929, z: -0.0538 }, }),
      pt('DU14', '大椎', 0, 63, 'midline', { cunZ: 5, intersections: ['TE', 'GB', 'BL'], classicRef: '《甲乙经》云：在第一椎上陷者中，三阳督脉之会', location: '在后正中线上，第7颈椎棘突下凹陷中', indications: '热病，疟疾，咳嗽，气喘，骨蒸盗汗，癫痫，项强', method: '取俯卧位或坐位低头；确定后正中线：即在背部中央所作的垂直线；在后正中线上，可见颈背部交界处椎骨上有一高突；这一高突能随颈部左右摆动而转动即是第7颈椎棘突；在第7颈椎棘突下有一凹陷，即为本穴。', specialPoint: '督脉、手足三阳经交会穴',  niComment: '倪师极常用此穴。为诸阳之会，退热特效。治感冒发热、疟疾、癫痫。倪师认为大椎为退热第一要穴，三棱针点刺出血可退高热', needlingMethod: '斜刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0032, y: 1.4398, z: -0.0406 }, }),
      pt('DU15', '哑门', 0, 66, 'midline', { cunZ: 4, classicRef: '《甲乙经》云：在项后发际宛宛中', location: '在项部，后正中线上，第1颈椎下，入发际0.5寸', indications: '暴喑，舌强不语，癫狂痫，头痛项强', method: '正坐伏案低头或俯卧位；从后发际正中直上拇指半横指（大拇指指间关节部位的横径为1寸），按压有酸胀感处，即为本穴。', specialPoint: '督脉、阳维脉交会穴',  niComment: '倪师认为此穴治哑巴、舌强不语有效。针刺须非常小心，不可向上深刺', needlingMethod: '伏案正坐位，头微前倾，项部放松，向下颌方向缓慢刺入0.5～1寸', contraindications: '不可向上深刺，避免刺入枕骨大孔损伤延髓', position3d: { x: 0, y: 1.4703, z: -0.0309 }, }),
      pt('DU16', '风府', 0, 67, 'midline', { cunZ: 4, classicRef: '《甲乙经》云：在项上入发际一寸，大筋内宛宛中', location: '在项部，后正中线上，枕外隆凸直下，两侧斜方肌之间凹陷中', indications: '头痛，项强，眩晕，咽喉肿痛，癫狂，中风不语', method: '正坐低头或俯卧位；于枕部可摸到一突出的隆起（枕外隆突）在该隆起下、后发际两条大筋（斜方肌）之间可触及一凹陷，按压有酸痛感处，即为本穴。', specialPoint: '督脉、阳维脉交会穴',  niComment: '倪师极常用此穴。治头痛、感冒、中风特效。为治风要穴。针刺须小心不可深刺', needlingMethod: '伏案正坐位，头微前倾，向下颌方向缓慢刺入0.5～1寸', contraindications: '不可深刺，避免损伤延髓', position3d: { x: -0.0001, y: 1.4847, z: -0.0267 }, }),
      pt('DU17', '脑户', 0, 69, 'midline', { cunZ: 4, location: '在头部，后正中线上，枕外隆凸上缘凹陷处', indications: '头晕，项强，失音，癫痫' , niComment: '倪师认为此穴治头痛、眩晕有效', needlingMethod: '平刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: 0, y: 1.5944, z: 0.0126 }, }),
      pt('DU18', '强间', 0, 72, 'midline', { cunZ: 3, location: '在头部，后正中线上，脑户上1.5寸', indications: '头痛，目眩，颈项强痛，癫痫' , niComment: '倪师认为此穴治头痛、癫狂有效', needlingMethod: '平刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: 0, y: 1.6343, z: 0.0274 }, }),
      pt('DU19', '后顶', 0, 73.5, 'midline', { cunZ: 1, location: '在头部，后正中线上，强间上1.5寸', indications: '头痛，眩晕，癫狂痫，颈项强痛' , niComment: '倪师认为此穴治头痛、眩晕有效', needlingMethod: '平刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: 0, y: 1.6741, z: 0.0422 }, }),
      pt('DU20', '百会', 0, 75, 'midline', { cunZ: 0, intersections: ['BL'], classicRef: '《甲乙经》云：在前顶后一寸五分，顶中央旋毛中', location: '在头部，前发际正中直上5寸，或两耳尖连线中点处', indications: '头痛，眩晕，中风失语，癫狂，脱肛，阴挺，不寐', method: '正坐或仰卧位；两耳尖与头正中线相交处，即为本穴。', specialPoint: '督脉、足太阳经交会穴',  niComment: '倪师极常用此穴。为诸阳之会，升阳举陷特效。治脱肛、子宫脱垂、头痛、中风。倪师认为百会为急救要穴，艾灸百会可升提阳气', needlingMethod: '平刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: 0, y: 1.714, z: 0.057 }, }),
      pt('DU21', '前顶', 0, 74, 'midline', { cunZ: -1, location: '在头部，前发际正中直上3.5寸', indications: '头痛，眩晕，鼻渊，癫痫' , niComment: '倪师认为此穴治头痛、眩晕、鼻渊有效', needlingMethod: '平刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: 0, y: 1.6732, z: 0.075 }, }),
      pt('DU22', '囟会', 0, 73.5, 'midline', { cunZ: -2, location: '在头部，前发际正中直上2寸', indications: '头痛，眩晕，鼻渊，癫痫' , niComment: '倪师认为此穴治头痛、鼻渊有效。小儿前囟未闭者禁针', needlingMethod: '平刺0.5～0.8寸', contraindications: '小儿前囟未闭者禁针', position3d: { x: 0, y: 1.6324, z: 0.093 }, }),
      pt('DU23', '上星', 0, 73, 'midline', { cunZ: -3, classicRef: '《甲乙经》云：在颅上直鼻中央入发际一寸', location: '在头部，前发际正中直上1寸', indications: '头痛，目痛，鼻渊，鼻衄，癫狂，疟疾' , niComment: '倪师认为此穴治鼻渊、头痛有效。三棱针点刺出血可治鼻衄', needlingMethod: '平刺0.5～1寸', contraindications: '一般无特殊禁忌', position3d: { x: 0, y: 1.6052, z: 0.105 }, }),
      pt('DU24', '神庭', 0, 72.5, 'midline', { cunZ: -3, location: '在头部，前发际正中直上0.5寸', indications: '头痛，眩晕，失眠，鼻渊，癫痫', method: '正坐或仰卧位；从前发际正中直上量1横指，拇指指甲中点处，即为本穴。', specialPoint: '督脉、足太阳、足阳明经交会穴',  niComment: '倪师认为此穴治失眠、头痛、癫痫有效', needlingMethod: '平刺0.5～0.8寸', contraindications: '一般无特殊禁忌', position3d: { x: 0, y: 1.5916, z: 0.111 }, }),
      pt('DU25', '素髎', 0, 70.5, 'midline', { cunZ: -4, location: '在面部，鼻尖正中', indications: '鼻渊，鼻衄，鼻塞，昏迷，惊厥', method: '正坐或仰卧。在面部鼻尖的正中央（最高点处），即为本穴。',  niComment: '倪师认为此穴为急救要穴，治昏迷、休克、鼻病有效', needlingMethod: '向上斜刺0.3～0.5寸，或点刺出血', contraindications: '一般无特殊禁忌', position3d: { x: -0.0003, y: 1.5352, z: 0.1594 }, }),
      pt('DU26', '水沟（人中）', 0, 69.5, 'midline', { cunZ: -4, classicRef: '《甲乙经》云：在鼻柱下人中，督脉手阳明之会', location: '在面部，人中沟上1/3与下2/3交点处', indications: '昏迷，晕厥，中暑，癫狂痫，急性腰痛，口眼歪斜' , niComment: '倪师极常用此穴。为第一急救要穴，治一切昏迷、休克、中暑、溺水。倪师认为水沟为急救第一穴', needlingMethod: '向上斜刺0.3～0.5寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0006, y: 1.5181, z: 0.1535 }, }),
      pt('DU27', '兑端', 0, 69, 'midline', { cunZ: -4, location: '在面部，上唇尖端，红唇与皮肤移行处', indications: '癫狂痫，齿痛，口歪唇动' , niComment: '倪师认为此穴为急救穴之一，治昏迷、口歪有效', needlingMethod: '向上斜刺0.2～0.3寸', contraindications: '一般无特殊禁忌', position3d: { x: -0.0007, y: 1.5122, z: 0.1527 }, }),
      pt('DU28', '龈交', 0, 68.5, 'midline', { cunZ: -4, classicRef: '《甲乙经》云：在唇内唇系带上', location: '在上唇内，唇系带与齿龈连接处', indications: '齿龈肿痛，鼻渊，癫狂，痔疮' , niComment: '倪师认为此穴治口臭、鼻渊、齿龈肿痛有效', needlingMethod: '向上斜刺0.2～0.3寸，或点刺出血', contraindications: '一般无特殊禁忌', position3d: { x: -0.0007, y: 1.5068, z: 0.1525 }, }),
    ],
    pathCun: [
      wp(0, 39, 'midline', 6), wp(0, 47, 'midline', 6), wp(0, 55, 'midline', 6),
      wp(0, 63, 'midline', 5), wp(0, 67, 'midline', 4), wp(0, 75, 'midline', 0),
      wp(0, 73, 'midline', -3), wp(0, 69.5, 'midline', -4), wp(0, 68.5, 'midline', -4),
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 15. 经外奇穴 EXTRA (EX) — 11 points
  // ──────────────────────────────────────────────────────────
  {
    code: 'EX',
    name: '经外奇穴',
    nameEn: 'Extraordinary Points',
    wuxing: '土',
    organ: '经外',
    color: '#8B7355',
    points: [
      pt('EX-HN4', '鱼腰', 1.5, 72, 'left', { cunZ: -4, position3d: { x: 0.033961, y: 1.538157, z: 0.138551 }, location: '在额部，瞳孔直上，眉毛中', method: '正坐或仰卧位。从瞳孔直上眉毛中，即为本穴', indications: '眉棱骨痛，目赤肿痛，目翳，眼睑瞤动，眼睑下垂' }),
      pt('EX-HN5', '太阳', 2.5, 71, 'left', { cunZ: -3, position3d: { x: 0.047478, y: 1.514223, z: 0.080221 }, location: '在颞部，当眉梢与目外眦之间，向后约1横指的凹陷处', method: '正坐或仰卧位。从目外眦与眉梢连线中点向后外量1横指，可触及一凹陷，用力按压有明显酸胀感', indications: '头痛，目赤肿痛，口眼歪斜' }),
      pt('EX-CA1', '子宫', 3, 43, 'left', { cunZ: -4, position3d: { x: 0.097229, y: 0.925793, z: 0.112654 }, location: '在下腹部，当脐中下4寸，中极旁开3寸', method: '仰卧位；从中极穴左、右旁开4横指', indications: '阴挺，痛经，崩漏，不孕，月经不调' }),
      pt('EX-B1', '定喘', 1.5, 64.5, 'left', { cunZ: 5, position3d: { x: 0.152851, y: 1.417311, z: -0.029413 }, location: '在背部，第7颈椎棘突下，旁开0.5寸', method: '坐位低头或俯伏位；在第7颈椎棘突下（大椎穴）旁开半横指处', indications: '哮喘，咳嗽，落枕，肩背痛' }),
      pt('EX-B2', '夹脊', 2, 55, 'left', { cunZ: 5, position3d: { x: 0.116633, y: 1.136281, z: -0.027101 }, location: '在背腰部，当第1胸椎至第5腰椎棘突下两侧，后正中线旁开0.5寸', method: '俯卧位或坐位，低头。从各椎棘突下旁开量半横指处，按压有酸胀感', indications: '上胸部穴治疗心肺上肢病证，下胸部穴治疗胃肠病证，腰部穴治疗腰腹下肢病证' }),
      pt('EX-B4', '腰眼', 3.5, 47, 'left', { cunZ: 5, position3d: { x: 0.115223, y: 1.11845, z: -0.021959 }, location: '在腰部，当第4腰椎棘突下，旁开约3.5寸凹陷中', method: '坐位或仰卧位。取一线过两侧髂前上棘绕腰腹一周，从该线与脊柱交点旁开量一横掌，按压有凹陷处', indications: '腰痛，月经不调，带下，尿频，遗尿' }),
      pt('EX-UE11', '十宣', 1.5, 27, 'left', { cunZ: -1, position3d: { x: 0.542315, y: 0.923715, z: 0.30774 }, location: '在手十指尖端，距指甲游离缘0.1寸，左右共10个穴位', method: '仰掌，十指微屈。在手十指尖端，距指甲游离缘0.1寸', indications: '昏迷，休克，中暑，咽喉肿痛' }),
      pt('EX-UE10', '四缝', 1, 29, 'left', { cunZ: -1, position3d: { x: 0.519564, y: 0.963856, z: 0.314202 }, location: '在第2～5指掌侧，近端指关节的中央，一手4穴', method: '仰掌。第2指至第5指的第2指关节横纹的中点处', indications: '小儿疳积，腹泻，百日咳，气喘' }),
      pt('EX-UE9', '八邪', 2, 32, 'left', { cunZ: 1, position3d: { x: 0.51112, y: 0.979559, z: 0.265212 }, location: '在手背侧，第1至第5指间，指蹼缘后方赤白肉际处，左右共8穴', method: '伸臂俯掌。手背掌指关节前，第1至第5指间的缝纹端后方赤白肉际处', indications: '毒蛇咬伤，手背红肿，手指麻木，目痛' }),
      pt('EX-UE8', '外劳宫', 2, 34, 'left', { cunZ: 1, position3d: { x: 0.512717, y: 0.976873, z: 0.245547 }, location: '在手背侧，第2、3掌骨之间，掌指关节后0.5寸', method: '抬臂俯掌。在手背第2、3掌骨间，从掌指关节向后量半横指处', indications: '落枕，手背红肿，手指麻木' }),
      pt('EX-LE6', '胆囊', 2.5, 19, 'left', { cunZ: 2, position3d: { x: 0.16231, y: 0.5563, z: -0.000469 }, location: '在小腿外侧，阳陵泉直下2寸', method: '正坐垂足或仰卧；确定阳陵泉后往下量2横指处', indications: '胆囊炎，胆石症，胆绞痛，下肢痿痹' }),
    ],
    pathCun: [
      // 经外奇穴无连续经络路径
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 16. 董氏奇穴 DONG (DONG) — 210 points
  // ──────────────────────────────────────────────────────────
  {
    code: 'DONG',
    name: '董氏奇穴',
    nameEn: "Dong's Extraordinary Acupoints",
    wuxing: '木',
    organ: '奇穴',
    color: '#2D5016',
    points: [
      pt('DONG01-01', '还巢穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在无名指中线之中央处', indications: '子宫痛，子宫瘤，子宫炎，月经不调，赤白带下，输卵管不通，子宫不正，不孕症', niComment: '倪师认为此穴治妇科子宫疾病特效。为董氏奇穴治妇科要穴之一', needlingMethod: '五分针，针深一分至二分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-02', '妇科穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在大指第一节之外侧（桡侧），距指甲角三分处', indications: '子宫炎，子宫胀痛，月经不调，赤白带下，输卵管不通', niComment: '倪师认为此穴治妇科炎症特效。常与还巢穴配伍', needlingMethod: '五分针，针深一分至二分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-03', '止涎穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在大指第一节之内侧（尺侧），距指甲角三分处', indications: '流口水，小儿流涎', niComment: '倪师认为此穴治小儿流涎特效', needlingMethod: '五分针，针深一分至二分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-04', '心膝穴', 0, 0, 'midline', { position3d: { x: 0.483574, y: 1.05696, z: 0.251955 }, location: '在中指背第一节中央线上', indications: '膝盖痛，肩臂痛', niComment: '倪师认为此穴治膝盖疼痛有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-05', '木火穴', 0, 0, 'midline', { position3d: { x: 0.483574, y: 1.05696, z: 0.251955 }, location: '在中指背第三节横纹中央', indications: '半身不遂，中风，手脚麻木', niComment: '倪师认为此穴治半身不遂特效。三棱针点刺出血', needlingMethod: '三棱针点刺出血', contraindications: '不可针刺，只可点刺出血' }),
      pt('DONG01-06', '指驷马穴', 0, 0, 'midline', { position3d: { x: 0.483574, y: 1.05696, z: 0.251955 }, location: '在食指背第二节中央线外开二分直线上', indications: '肋膜炎，肋膜痛，皮肤病，脸面黑斑', niComment: '倪师认为此穴治肋膜炎、皮肤病有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-07', '指肾穴', 0, 0, 'midline', { position3d: { x: 0.471059, y: 1.058266, z: 0.252105 }, location: '在无名指背第一节中央线外开二分直线上', indications: '口干，肾亏，心脏衰弱', niComment: '倪师认为此穴治口干、肾亏有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-08', '指三重穴', 0, 0, 'midline', { position3d: { x: 0.471059, y: 1.058266, z: 0.252105 }, location: '在无名指背第二节中央线外开二分直线上', indications: '颈项扭伤，落枕，肩臂痛', niComment: '倪师认为此穴治落枕、颈项扭伤有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-09', '胆穴', 0, 0, 'midline', { position3d: { x: 0.483574, y: 1.05696, z: 0.251955 }, location: '在中指背第一节中央线外开二分直线上', indications: '心惊，小儿夜哭', niComment: '倪师认为此穴治小儿夜哭有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-10', '指驷马上穴', 0, 0, 'midline', { position3d: { x: 0.483574, y: 1.05696, z: 0.251955 }, location: '在食指背第二节中央线上', indications: '肋膜炎，肋痛，乳房胀痛', niComment: '倪师认为此穴治肋膜炎、乳房胀痛有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-11', '指驷马中穴', 0, 0, 'midline', { position3d: { x: 0.483574, y: 1.05696, z: 0.251955 }, location: '在食指背第二节中央线外开二分处', indications: '肋膜炎，气喘，鼻炎', niComment: '倪师认为此穴治气喘、肋膜炎有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-12', '指驷马下穴', 0, 0, 'midline', { position3d: { x: 0.483574, y: 1.05696, z: 0.251955 }, location: '在食指背第二节中央线外开四分处', indications: '肋膜炎，皮肤病，耳鸣', niComment: '倪师认为此穴治皮肤病、耳鸣有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-13', '小指穴', 0, 0, 'midline', { position3d: { x: 0.458871, y: 1.052614, z: 0.262036 }, location: '在小指背第一节中央线上', indications: '肩臂痛，坐骨神经痛', niComment: '倪师认为此穴治肩臂痛有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-14', '大间穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在食指掌面第一节正中央偏桡侧三分', indications: '心悸，心脏性喘息，疝气', niComment: '倪师认为此穴治心悸、疝气有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-15', '小间穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在食指掌面第一节正中央偏桡侧六分', indications: '支气管炎，支气管扩张，疝气', niComment: '倪师认为此穴治支气管炎、疝气有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-16', '浮间穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在食指掌面第二节正中央偏桡侧三分', indications: '疝气，尿道炎，牙痛', niComment: '倪师认为此穴治疝气、牙痛有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-17', '外间穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在食指掌面第二节正中央偏桡侧六分', indications: '疝气，牙痛，胃痛', niComment: '倪师认为此穴治疝气、胃痛有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-18', '中间穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在食指掌面第一节与第二节之间横纹中央偏桡侧三分', indications: '疝气，腰痛', niComment: '倪师认为此穴治疝气、腰痛有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-19', '人宗穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在无名指掌面第一节正中央', indications: '子宫炎，子宫痛', niComment: '倪师认为此穴治子宫疾病有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-20', '地宗穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在无名指掌面第二节正中央', indications: '能治阳痿，早泄，遗精', niComment: '倪师认为此穴治阳痿、早泄有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-21', '天宗穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在无名指掌面第三节正中央', indications: '妇科病，不孕症', niComment: '倪师认为此穴治妇科病有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-22', '制污穴', 0, 0, 'midline', { position3d: { x: 0.483574, y: 1.05696, z: 0.251955 }, location: '在大指背第一节中央线上', indications: '久年恶疮，恶瘤，刀伤，烫伤', niComment: '倪师认为此穴治久年恶疮、刀伤不愈特效。三棱针点刺出血', needlingMethod: '三棱针点刺出血', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-23', '五虎穴', 0, 0, 'midline', { position3d: { x: 0.361031, y: 1.16344, z: -0.005075 }, location: '在大指掌面第一节之外侧（桡侧），每二分一穴，共五穴', indications: '治全身骨肿，关节炎', niComment: '倪师极常用此穴，治全身骨痛、关节炎特效。五虎一治手指痛，五虎三治足趾痛，五虎五治脚踝痛', needlingMethod: '五分针，针深二分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-24', '五虎一', 0, 0, 'midline', { position3d: { x: 0.361031, y: 1.16344, z: -0.005075 }, location: '在大指掌面第一节外侧，距指甲角一分', indications: '手指痛，腱鞘炎', niComment: '倪师认为此穴治手指疼痛特效', needlingMethod: '五分针，针深二分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-25', '五虎二', 0, 0, 'midline', { position3d: { x: 0.361031, y: 1.16344, z: -0.005075 }, location: '在大指掌面第一节外侧，距五虎一穴二分', indications: '手掌痛，手背痛', niComment: '倪师认为此穴治手掌痛有效', needlingMethod: '五分针，针深二分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-26', '五虎三', 0, 0, 'midline', { position3d: { x: 0.361031, y: 1.16344, z: -0.005075 }, location: '在大指掌面第一节外侧，距五虎二穴二分', indications: '足趾痛，脚跟痛', niComment: '倪师认为此穴治足趾疼痛特效', needlingMethod: '五分针，针深二分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-27', '五虎四', 0, 0, 'midline', { position3d: { x: 0.361031, y: 1.16344, z: -0.005075 }, location: '在大指掌面第一节外侧，距五虎三穴二分', indications: '脚背痛，脚踝痛', niComment: '倪师认为此穴治脚背痛有效', needlingMethod: '五分针，针深二分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-28', '五虎五', 0, 0, 'midline', { position3d: { x: 0.361031, y: 1.16344, z: -0.005075 }, location: '在大指掌面第一节外侧，距五虎四穴二分', indications: '脚跟痛，脚底痛', niComment: '倪师认为此穴治脚跟痛特效', needlingMethod: '五分针，针深二分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-29', '指驷马穴组', 0, 0, 'midline', { position3d: { x: 0.483574, y: 1.05696, z: 0.251955 }, location: '在食指背第二节中央线上，共三穴', indications: '肺弱，肺虚，气喘，各种肺系疾病', niComment: '倪师认为此组穴治气喘、肺虚特效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-30', '双灵穴', 0, 0, 'midline', { position3d: { x: 0.483574, y: 1.05696, z: 0.251955 }, location: '在中指背第一节两侧', indications: '腰痛，背痛', niComment: '倪师认为此穴治腰背痛有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-31', '木穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在食指掌面第一节正中央内侧（尺侧）', indications: '肝火旺，脾气暴躁，眼发干', niComment: '倪师认为此穴泻肝火特效。治眼干、脾气暴躁有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-32', '脾肿穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在掌面中指第二节中央线', indications: '脾肿大，脾脏疾病', niComment: '倪师认为此穴治脾肿大有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-33', '三叉一穴', 0, 0, 'midline', { position3d: { x: 0.480226, y: 1.067405, z: 0.222222 }, location: '在食指与中指叉口处', indications: '肩背痛，肩臂不举', niComment: '倪师认为此穴治肩背痛有效', needlingMethod: '针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-34', '三叉二穴', 0, 0, 'midline', { position3d: { x: 0.469902, y: 1.077087, z: 0.207079 }, location: '在中指与无名指叉口处', indications: '腰痛，坐骨神经痛', niComment: '倪师认为此穴治腰痛有效', needlingMethod: '针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-35', '三叉三穴', 0, 0, 'midline', { position3d: { x: 0.45534, y: 1.082963, z: 0.199799 }, location: '在无名指与小指叉口处', indications: '头痛，偏头痛', niComment: '倪师认为此穴治偏头痛有效', needlingMethod: '针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-36', '还原穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面，中指第二节中央偏桡侧', indications: '手指麻木，手臂麻木', niComment: '倪师认为此穴治手指麻木有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-37', '复原穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面，无名指第二节中央偏桡侧', indications: '腿痛，坐骨神经痛', niComment: '倪师认为此穴治坐骨神经痛有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-38', '太阳穴', 0, 0, 'midline', { position3d: { x: 0.458871, y: 1.052614, z: 0.262036 }, location: '在小指背第一节中央线', indications: '偏头痛，头晕', niComment: '倪师认为此穴治偏头痛有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-39', '失音穴', 0, 0, 'midline', { position3d: { x: 0.17126, y: 0.85733, z: 0.013522 }, location: '在膝盖内侧，股骨内上髁之上方', indications: '声音沙哑，失音', niComment: '倪师认为此穴治声音沙哑、失语有效', needlingMethod: '针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG01-40', '火星上穴', 0, 0, 'midline', { position3d: { x: 0.483574, y: 1.05696, z: 0.251955 }, location: '在食指背第二节中央偏桡侧', indications: '高血压，眼疾', niComment: '倪师认为此穴治高血压有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-01', '重子穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面虎口下约一寸，即大指掌骨与食指掌骨之间', indications: '背痛，肺炎，感冒，咳嗽，气喘', niComment: '倪师极常用此穴，治背痛特效。为董氏奇穴治背痛第一要穴', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-02', '重仙穴', 0, 0, 'midline', { position3d: { x: 0.348601, y: 1.188796, z: -0.01273 }, location: '在手掌面虎口下约二寸，即重子穴下一寸', indications: '背痛，肺炎，膝盖痛', niComment: '倪师认为此穴与重子穴配伍治背痛特效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-03', '大白穴', 0, 0, 'midline', { position3d: { x: 0.348601, y: 1.188796, z: -0.01273 }, location: '在手掌面，拇指与食指间之凹陷处后约一寸', indications: '小儿气喘，发高烧，肺弱，坐骨神经痛', niComment: '倪师极常用此穴，治小儿气喘、坐骨神经痛特效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-04', '灵骨穴', 0, 0, 'midline', { position3d: { x: 0.449002, y: 1.109961, z: 0.164329 }, location: '在手背拇指与食指叉骨间，第一掌骨与第二掌骨接合处', indications: '肺机能不够之坐骨神经痛，腰痛，脚痛，半身不遂，骨刺，头痛', niComment: '倪师极常用此穴。为董氏奇穴第一要穴。治坐骨神经痛、腰痛、半身不遂特效。与大白穴配伍使用。倪师认为灵骨穴可补肺气、治百病', needlingMethod: '一寸半至二寸针，针深五分至一寸半', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-05', '中白穴', 0, 0, 'midline', { position3d: { x: 0.424818, y: 1.126572, z: 0.148891 }, location: '在手背，第四、五掌骨之间，距指蹼缘约一寸', indications: '肾脏炎，腰痛，背痛，头晕，眼花', niComment: '倪师认为此穴治肾虚腰痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-06', '下白穴', 0, 0, 'midline', { position3d: { x: 0.416904, y: 1.150011, z: 0.120252 }, location: '在手背，第四、五掌骨之间，中白穴下一寸', indications: '牙齿痛，背痛，腰痛', niComment: '倪师认为此穴治牙痛、腰背痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-07', '腕顺一穴', 0, 0, 'midline', { position3d: { x: 0.416904, y: 1.150011, z: 0.120252 }, location: '在手腕背面，小指侧，当尺骨茎突下方凹陷处', indications: '肾亏，头痛，眼花，坐骨神经痛', niComment: '倪师认为此穴治肾亏头痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-08', '腕顺二穴', 0, 0, 'midline', { position3d: { x: 0.416904, y: 1.150011, z: 0.120252 }, location: '在手腕背面，腕顺一穴下二分', indications: '鼻出血，肾亏，手背痛', niComment: '倪师认为此穴治鼻出血有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-09', '手解穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在小指掌侧第一节与第二节之间横纹处', indications: '解晕针，解针后之不适', niComment: '倪师认为此穴为解晕针要穴。针刺后若患者头晕不适，取此穴可缓解', needlingMethod: '五分针，针深一分至二分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-10', '上里穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面，食指第二节中央', indications: '胃痛，腹痛', niComment: '倪师认为此穴治胃痛有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-11', '四花上穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面，中指第二节中央', indications: '心脏疾病', niComment: '倪师认为此穴治心脏病有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-12', '四花中穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面，中指第三节中央', indications: '哮喘，支气管炎', niComment: '倪师认为此穴治哮喘有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-13', '四花下穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面，无名指第二节中央', indications: '肠胃病', niComment: '倪师认为此穴治肠胃病有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-14', '小节穴', 0, 0, 'midline', { position3d: { x: 0.348601, y: 1.188796, z: -0.01273 }, location: '在手掌面，大指掌骨与食指掌骨之间，第一节横纹处', indications: '踝关节扭伤，踝关节疼痛', niComment: '倪师极常用此穴，治踝关节扭伤特效。为董氏奇穴治踝痛要穴', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-15', '大腰穴', 0, 0, 'midline', { position3d: { x: 0.449002, y: 1.109961, z: 0.164329 }, location: '在手背，第二、三掌骨之间', indications: '腰痛，背痛', niComment: '倪师认为此穴治腰背痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-16', '腰灵穴', 0, 0, 'midline', { position3d: { x: 0.449002, y: 1.109961, z: 0.164329 }, location: '在手背，第三、四掌骨之间', indications: '腰痛，坐骨神经痛', niComment: '倪师认为此穴治腰痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-17', '水源穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面，小指第二节中央', indications: '肾脏病，腰痛', niComment: '倪师认为此穴治肾脏病有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-18', '分金穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面，中指第一节中央偏桡侧', indications: '感冒，咳嗽', niComment: '倪师认为此穴治感冒咳嗽有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-19', '后椎穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面，中指第一节中央偏尺侧', indications: '脊椎痛，背痛', niComment: '倪师认为此穴治脊椎痛有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-20', '首英穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面，无名指第一节中央', indications: '头痛，偏头痛', niComment: '倪师认为此穴治头痛有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-21', '形中穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面，无名指第一节中央偏桡侧', indications: '肩臂痛，手臂不举', niComment: '倪师认为此穴治肩臂痛有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-22', '火膝穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面，中指第二节中央偏尺侧', indications: '膝盖痛，关节炎', niComment: '倪师认为此穴治膝盖痛有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-23', '火连穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面，中指第二节中央偏桡侧', indications: '心脏痛，胸闷', niComment: '倪师认为此穴治心脏痛有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-24', '火菊穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面，中指第三节中央偏桡侧', indications: '手麻，手指痛', niComment: '倪师认为此穴治手麻有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-25', '火散穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面，中指第三节中央偏尺侧', indications: '头痛，头晕', niComment: '倪师认为此穴治头痛有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-26', '天皇穴', 0, 0, 'midline', { position3d: { x: 0.17126, y: 0.85733, z: 0.013522 }, location: '在膝盖内侧，胫骨内侧髁下方凹陷处', indications: '胃酸过多，反胃，肾脏炎，糖尿病', niComment: '倪师极常用此穴，治胃酸过多、反胃特效。为董氏奇穴治胃病要穴', needlingMethod: '一寸针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-27', '人皇穴', 0, 0, 'midline', { position3d: { x: 0.101584, y: 0.534315, z: 0.051408 }, location: '在胫骨内侧，内踝上三寸', indications: '淋病，阳痿，早泄，遗精，梦遗，肌肉萎缩', niComment: '倪师认为此穴治泌尿生殖系统疾病有效', needlingMethod: '一寸针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-28', '地皇穴', 0, 0, 'midline', { position3d: { x: 0.064466, y: 0.67322, z: -0.017749 }, location: '在胫骨内侧，内踝上七寸', indications: '肾脏炎，糖尿病，腰痛', niComment: '倪师认为此穴治肾脏炎、糖尿病有效', needlingMethod: '一寸针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-29', '四肢穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面，中指第二节中央', indications: '四肢痛，手脚麻木', niComment: '倪师认为此穴治四肢疼痛有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-30', '七里穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面，食指第一节中央', indications: '肘痛，臂痛', niComment: '倪师认为此穴治肘臂痛有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-31', '九里穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面，食指第三节中央', indications: '肩痛，颈痛', niComment: '倪师认为此穴治肩颈痛有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-32', '十十穴', 0, 0, 'midline', { position3d: { x: 0.449002, y: 1.109961, z: 0.164329 }, location: '在手背，第二、三掌骨之间', indications: '肠炎，腹泻', niComment: '倪师认为此穴治肠炎有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-33', '外间穴', 0, 0, 'midline', { position3d: { x: 0.449002, y: 1.109961, z: 0.164329 }, location: '在手背，拇指与食指之间', indications: '头痛，眼疾', niComment: '倪师认为此穴治头痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-34', '水相穴', 0, 0, 'midline', { position3d: { x: 0.424818, y: 1.126572, z: 0.148891 }, location: '在手背，第四、五掌骨之间', indications: '肾病，水肿', niComment: '倪师认为此穴治肾病水肿有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-35', '水仙穴', 0, 0, 'midline', { position3d: { x: 0.449002, y: 1.109961, z: 0.164329 }, location: '在手背，第三、四掌骨之间', indications: '肾病，腰痛', niComment: '倪师认为此穴治肾病腰痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-36', '木枝穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面，食指第二节中央偏尺侧', indications: '肝痛，胁痛', niComment: '倪师认为此穴治肝痛有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-37', '木神穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面，中指第一节中央偏尺侧', indications: '失眠，心悸', niComment: '倪师认为此穴治失眠有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-38', '土兴穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面，无名指第一节中央偏尺侧', indications: '脾胃虚弱，消化不良', niComment: '倪师认为此穴治脾胃虚弱有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-39', '土水穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面，小指第一节中央', indications: '水肿，腹胀', niComment: '倪师认为此穴治水肿有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG02-40', '金营穴', 0, 0, 'midline', { position3d: { x: 0.350773, y: 1.174062, z: -0.01342 }, location: '在手掌面，小指第二节中央', indications: '肺病，咳嗽', niComment: '倪师认为此穴治肺病咳嗽有效', needlingMethod: '五分针，针深一分至三分', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-01', '其门穴', 0, 0, 'midline', { position3d: { x: 0.366858, y: 1.204157, z: 0.066644 }, location: '在桡骨之外侧，手腕横纹后三寸处', indications: '月经不调，赤白带下，肠炎', niComment: '倪师认为此穴治月经不调、肠炎有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-02', '其角穴', 0, 0, 'midline', { position3d: { x: 0.337592, y: 1.233851, z: 0.055743 }, location: '在桡骨之外侧，手腕横纹后四寸处', indications: '月经不调，赤白带下', niComment: '倪师认为此穴与其门穴配伍治妇科病有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-03', '其正穴', 0, 0, 'midline', { position3d: { x: 0.312136, y: 1.259878, z: 0.051973 }, location: '在桡骨之外侧，手腕横纹后五寸处', indications: '月经不调，赤白带下，急慢性肠炎', niComment: '倪师认为此穴治肠炎、妇科病有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-04', '火串穴', 0, 0, 'midline', { position3d: { x: 0.325833, y: 1.246282, z: 0.054063 }, location: '在前臂背面桡侧，腕横纹后四寸', indications: '便秘，感冒，手臂痛', niComment: '倪师认为此穴治便秘有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-05', '火陵穴', 0, 0, 'midline', { position3d: { x: 0.312136, y: 1.259878, z: 0.051973 }, location: '在前臂背面桡侧，腕横纹后五寸', indications: '手臂痛，胸痛', niComment: '倪师认为此穴治手臂痛有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-06', '火山穴', 0, 0, 'midline', { position3d: { x: 0.281213, y: 1.294298, z: 0.046913 }, location: '在前臂背面桡侧，腕横纹后六寸', indications: '手背红肿，手指痛', niComment: '倪师认为此穴治手背红肿有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-07', '火密穴', 0, 0, 'midline', { position3d: { x: 0.259255, y: 1.339511, z: 0.036435 }, location: '在前臂背面桡侧，腕横纹后七寸', indications: '鼻塞，鼻炎', niComment: '倪师认为此穴治鼻塞、鼻炎有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-08', '火山穴', 0, 0, 'midline', { position3d: { x: 0.325833, y: 1.246282, z: 0.054063 }, location: '在前臂背面尺侧，腕横纹后三寸', indications: '腿痛，坐骨神经痛', niComment: '倪师认为此穴治坐骨神经痛有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-09', '火腑海穴', 0, 0, 'midline', { position3d: { x: 0.325833, y: 1.246282, z: 0.054063 }, location: '在前臂背面尺侧，腕横纹后四寸', indications: '哮喘，咳嗽', niComment: '倪师认为此穴治哮喘有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-10', '火主穴', 0, 0, 'midline', { position3d: { x: 0.312136, y: 1.259878, z: 0.051973 }, location: '在前臂背面尺侧，腕横纹后五寸', indications: '心悸，心脏痛', niComment: '倪师认为此穴治心悸有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-11', '火胜穴', 0, 0, 'midline', { position3d: { x: 0.259255, y: 1.339511, z: 0.036435 }, location: '在前臂背面尺侧，腕横纹后六寸', indications: '头痛，感冒', niComment: '倪师认为此穴治头痛有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-12', '肠门穴', 0, 0, 'midline', { position3d: { x: 0.359174, y: 1.203517, z: 0.002001 }, location: '在前臂桡侧，腕横纹后二寸', indications: '肠炎，腹泻', niComment: '倪师认为此穴治肠炎、腹泻有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-13', '肝门穴', 0, 0, 'midline', { position3d: { x: 0.304686, y: 1.278774, z: -0.003659 }, location: '在前臂桡侧，腕横纹后六寸', indications: '肝炎，肝痛', niComment: '倪师认为此穴治肝炎有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-14', '心门穴', 0, 0, 'midline', { position3d: { x: 0.323627, y: 1.239899, z: -0.009885 }, location: '在前臂尺侧，腕横纹后一寸半', indications: '心脏痛，心悸', niComment: '倪师认为此穴治心脏痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-15', '人士穴', 0, 0, 'midline', { position3d: { x: 0.336646, y: 1.226274, z: -0.005817 }, location: '在前臂掌面，腕横纹后二寸', indications: '胃痛，腹痛', niComment: '倪师认为此穴治胃痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-16', '地士穴', 0, 0, 'midline', { position3d: { x: 0.304686, y: 1.278774, z: -0.003659 }, location: '在前臂掌面，腕横纹后四寸', indications: '胃炎，贫血', niComment: '倪师认为此穴治胃炎有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-17', '天士穴', 0, 0, 'midline', { position3d: { x: 0.287703, y: 1.303804, z: -0.004213 }, location: '在前臂掌面，腕横纹后六寸', indications: '心脏病，胸闷', niComment: '倪师认为此穴治心脏病有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-18', '曲陵穴', 0, 0, 'midline', { position3d: { x: 0.253267, y: 1.355537, z: 0.01801 }, location: '在手肘横纹上，肱二头肌腱外侧', indications: '肘关节炎，肘痛', niComment: '倪师认为此穴治肘关节炎有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-19', '建中穴', 0, 0, 'midline', { position3d: { x: 0.318706, y: 1.260116, z: -0.000552 }, location: '在前臂掌面正中线，腕横纹后三寸', indications: '胃痛，消化不良', niComment: '倪师认为此穴治胃痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-20', '中九里穴', 0, 0, 'midline', { position3d: { x: 0.259255, y: 1.339511, z: 0.036435 }, location: '在前臂背面，腕横纹后七寸', indications: '背痛，腰痛', niComment: '倪师认为此穴治背腰痛有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-21', '上九里穴', 0, 0, 'midline', { position3d: { x: 0.25254, y: 1.348897, z: 0.037713 }, location: '在前臂背面，腕横纹后八寸', indications: '背痛，肩痛', niComment: '倪师认为此穴治背肩痛有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-22', '下九里穴', 0, 0, 'midline', { position3d: { x: 0.281213, y: 1.294298, z: 0.046913 }, location: '在前臂背面，腕横纹后六寸', indications: '腰痛，腿痛', niComment: '倪师认为此穴治腰腿痛有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-23', '三肩穴', 0, 0, 'midline', { position3d: { x: 0.146984, y: 1.434335, z: -0.006942 }, location: '在肩关节前方，三角肌前缘', indications: '肩周炎，肩臂不举', niComment: '倪师认为此穴治肩周炎有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-24', '肩中穴', 0, 0, 'midline', { position3d: { x: 0.085175, y: 1.598087, z: 0.032684 }, location: '在肩关节上方，三角肌中央', indications: '肩痛，手臂不举', niComment: '倪师认为此穴治肩痛有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-25', '背面穴', 0, 0, 'midline', { position3d: { x: 0.08357, y: 1.591582, z: 0.030382 }, location: '在肩关节后方，三角肌后缘', indications: '肩背痛', niComment: '倪师认为此穴治肩背痛有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-26', '分金穴', 0, 0, 'midline', { position3d: { x: 0.354967, y: 1.219972, z: 0.012335 }, location: '在前臂掌面，腕横纹后三寸偏桡侧', indications: '感冒，咳嗽，气喘', niComment: '倪师认为此穴治感冒咳嗽有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-27', '后椎穴', 0, 0, 'midline', { position3d: { x: 0.325833, y: 1.246282, z: 0.054063 }, location: '在前臂背面，腕横纹后四寸', indications: '脊椎痛，背痛', niComment: '倪师认为此穴治脊椎痛有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-28', '首英穴', 0, 0, 'midline', { position3d: { x: 0.312136, y: 1.259878, z: 0.051973 }, location: '在前臂背面，腕横纹后五寸', indications: '头痛，偏头痛', niComment: '倪师认为此穴治头痛有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-29', '富顶穴', 0, 0, 'midline', { position3d: { x: 0.25254, y: 1.348897, z: 0.037713 }, location: '在前臂背面，腕横纹后八寸', indications: '腿痛，坐骨神经痛', niComment: '倪师认为此穴治坐骨神经痛有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG03-30', '后枝穴', 0, 0, 'midline', { position3d: { x: 0.25254, y: 1.348897, z: 0.037713 }, location: '在前臂背面，腕横纹后九寸', indications: '背痛，腰痛', niComment: '倪师认为此穴治背腰痛有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-01', '七里穴', 0, 0, 'midline', { position3d: { x: 0.194677, y: 0.634582, z: 0.032408 }, location: '在小腿外侧，腓骨前缘，外踝上七寸', indications: '腹痛，腹胀', niComment: '倪师认为此穴治腹胀有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-02', '九里穴', 0, 0, 'midline', { position3d: { x: 0.196495, y: 0.708371, z: 0.047931 }, location: '在小腿外侧，腓骨前缘，外踝上九寸', indications: '腿痛，腰痛', niComment: '倪师认为此穴治腿痛有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-03', '驷马中穴', 0, 0, 'midline', { position3d: { x: 0.132277, y: 1.113179, z: 0.056064 }, location: '在大腿外侧正中线，髌骨上缘上七寸', indications: '肋膜炎，肋痛，肺炎，气喘，乳房胀痛，皮肤病', niComment: '倪师极常用此穴。治肋膜炎、气喘、乳房胀痛特效。为董氏奇穴治肺系疾病要穴', needlingMethod: '二寸针，针深一寸至一寸半', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-04', '驷马上穴', 0, 0, 'midline', { position3d: { x: 0.136849, y: 1.15119, z: 0.053279 }, location: '在大腿外侧正中线，驷马中穴上二寸', indications: '肋膜炎，肺弱，气喘', niComment: '倪师认为此穴与驷马中穴配伍治肺系疾病有效', needlingMethod: '二寸针，针深一寸至一寸半', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-05', '驷马下穴', 0, 0, 'midline', { position3d: { x: 0.132353, y: 1.0724, z: 0.056162 }, location: '在大腿外侧正中线，驷马中穴下二寸', indications: '肋膜炎，鼻炎，耳鸣', niComment: '倪师认为此穴与驷马中穴配伍使用效果更佳', needlingMethod: '二寸针，针深一寸至一寸半', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-06', '下泉穴', 0, 0, 'midline', { position3d: { x: 0.166457, y: 0.874299, z: 0.012956 }, location: '在膝内侧，腘窝横纹内侧端', indications: '膝盖痛，关节炎', niComment: '倪师认为此穴治膝盖痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-07', '中泉穴', 0, 0, 'midline', { position3d: { x: 0.155249, y: 0.913154, z: 0.013479 }, location: '在膝内侧，腘窝横纹内侧端上一寸', indications: '腰痛，背痛', niComment: '倪师认为此穴治腰背痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-08', '上泉穴', 0, 0, 'midline', { position3d: { x: 0.15127, y: 0.935923, z: 0.016073 }, location: '在膝内侧，腘窝横纹内侧端上二寸', indications: '腿痛，坐骨神经痛', niComment: '倪师认为此穴治坐骨神经痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-09', '天皇副穴', 0, 0, 'midline', { position3d: { x: 0.082451, y: 0.550807, z: 0.036547 }, location: '在胫骨内侧，内踝上四寸', indications: '胃酸过多，胃痛', niComment: '倪师认为此穴治胃酸过多有效', needlingMethod: '一寸针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-10', '四花上穴', 0, 0, 'midline', { position3d: { x: 0.14902, y: 0.958068, z: 0.042446 }, location: '在膝眼下三寸，胫骨外侧一寸', indications: '哮喘，牙痛，心脏病，转筋', niComment: '倪师极常用此穴，治哮喘、牙痛特效。为董氏奇穴要穴', needlingMethod: '一寸半至二寸针，针深一寸至一寸半', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-11', '四花中穴', 0, 0, 'midline', { position3d: { x: 0.165251, y: 0.871416, z: 0.064842 }, location: '在四花上穴直下二寸', indications: '肠胃病，腹痛，腹胀', niComment: '倪师认为此穴治肠胃病有效', needlingMethod: '一寸半至二寸针，针深一寸至一寸半', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-12', '四花下穴', 0, 0, 'midline', { position3d: { x: 0.051279, y: 0.731277, z: 0.083423 }, location: '在四花中穴直下二寸', indications: '肠炎，腹部发胀', niComment: '倪师认为此穴治肠炎有效', needlingMethod: '一寸半至二寸针，针深一寸至一寸半', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-13', '四花副穴', 0, 0, 'midline', { position3d: { x: 0.173284, y: 0.857356, z: 0.041195 }, location: '在四花中穴旁开一寸五分', indications: '心脏病，膝盖痛', niComment: '倪师认为此穴治心脏病有效', needlingMethod: '一寸半针，针深一寸至一寸半', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-14', '四花里穴', 0, 0, 'midline', { position3d: { x: 0.190934, y: 0.773022, z: 0.050629 }, location: '在四花副穴直下二寸', indications: '腹痛，腹胀', niComment: '倪师认为此穴治腹痛有效', needlingMethod: '一寸半针，针深一寸至一寸半', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-15', '腑肠穴', 0, 0, 'midline', { position3d: { x: 0.190934, y: 0.773022, z: 0.050629 }, location: '在四花下穴旁开一寸五分', indications: '肠炎，痔疮', niComment: '倪师认为此穴治肠炎、痔疮有效', needlingMethod: '一寸半针，针深一寸至一寸半', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-16', '侧三里穴', 0, 0, 'midline', { position3d: { x: 0.14902, y: 0.958068, z: 0.042446 }, location: '在腓骨外侧，膝下三寸', indications: '牙痛，面部神经麻痹', niComment: '倪师认为此穴治牙痛特效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-17', '侧下三里穴', 0, 0, 'midline', { position3d: { x: 0.173284, y: 0.857356, z: 0.041195 }, location: '在侧三里穴下二寸', indications: '三叉神经痛，面痛', niComment: '倪师认为此穴治三叉神经痛有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-18', '足三重穴', 0, 0, 'midline', { position3d: { x: 0.130254, y: 0.468706, z: 0.054683 }, location: '在腓骨外侧，外踝上三寸、五寸、七寸各一穴', indications: '甲状腺肿大，颈项强痛，肩臂痛', niComment: '倪师极常用此穴组，治甲状腺肿大特效。三穴同用效果更佳', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-19', '足三重一', 0, 0, 'midline', { position3d: { x: 0.130254, y: 0.468706, z: 0.054683 }, location: '在腓骨外侧，外踝上三寸', indications: '甲状腺肿，颈项痛', niComment: '倪师认为此穴治甲状腺肿有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-20', '足三重二', 0, 0, 'midline', { position3d: { x: 0.181404, y: 0.550343, z: 0.055403 }, location: '在腓骨外侧，外踝上五寸', indications: '甲状腺肿，肩臂痛', niComment: '倪师认为此穴与足三重一配伍使用', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-21', '足三重三', 0, 0, 'midline', { position3d: { x: 0.194677, y: 0.634582, z: 0.032408 }, location: '在腓骨外侧，外踝上七寸', indications: '甲状腺肿，颈项强痛', niComment: '倪师认为三重三穴同用治甲状腺肿大特效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-22', '正筋穴', 0, 0, 'midline', { position3d: { x: 0.149906, y: 0.209295, z: 0.013752 }, location: '在足跟后，跟腱前缘，踝关节上方', indications: '脊椎骨胀痛，筋痛', niComment: '倪师认为此穴治脊椎骨痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-23', '正宗穴', 0, 0, 'midline', { position3d: { x: 0.149906, y: 0.209295, z: 0.013752 }, location: '在正筋穴上二寸', indications: '脊椎骨胀痛，腰痛', niComment: '倪师认为此穴治腰痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-24', '正士穴', 0, 0, 'midline', { position3d: { x: 0.132107, y: 0.268131, z: 0.012898 }, location: '在正宗穴上二寸', indications: '背痛，腰痛', niComment: '倪师认为此穴治背腰痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-25', '搏球穴', 0, 0, 'midline', { position3d: { x: 0.173169, y: 0.052322, z: 0.110423 }, location: '在足背，第三、四跖骨之间', indications: '腿痛，脚痛', niComment: '倪师认为此穴治腿脚痛有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-26', '水曲穴', 0, 0, 'midline', { position3d: { x: 0.160014, y: 0.034536, z: 0.152149 }, location: '在足背，第四、五跖骨之间', indications: '水肿，腹胀', niComment: '倪师认为此穴治水肿有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-27', '木关穴', 0, 0, 'midline', { position3d: { x: 0.173169, y: 0.052322, z: 0.110423 }, location: '在足背，第二、三跖骨之间', indications: '腰痛，坐骨神经痛', niComment: '倪师认为此穴治坐骨神经痛有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-28', '木妇科穴', 0, 0, 'midline', { position3d: { x: 0.173169, y: 0.052322, z: 0.110423 }, location: '在足背，第一、二跖骨之间', indications: '月经不调，赤白带下', niComment: '倪师认为此穴治妇科病有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-29', '六完穴', 0, 0, 'midline', { position3d: { x: -0.155294, y: 0.028024, z: 0.150126 }, location: '在足背，第一跖骨内侧', indications: '手脚麻木', niComment: '倪师认为此穴治手脚麻木有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-30', '火主穴', 0, 0, 'midline', { position3d: { x: 0.155294, y: 0.028024, z: 0.150126 }, location: '在足背，第一、二跖骨结合部前方', indications: '难产，胎衣不下', niComment: '倪师认为此穴治难产有效', needlingMethod: '五分针，针深三分至五分', contraindications: '孕妇禁用' }),
      pt('DONG04-31', '火硬穴', 0, 0, 'midline', { position3d: { x: 0.160014, y: 0.034536, z: 0.152149 }, location: '在足背，第一、二跖骨之间，太冲穴后', indications: '难产，痛经', niComment: '倪师认为此穴治痛经有效', needlingMethod: '五分针，针深三分至五分', contraindications: '孕妇禁用' }),
      pt('DONG04-32', '门金穴', 0, 0, 'midline', { position3d: { x: 0.155734, y: 0.025478, z: 0.156685 }, location: '在足背，第二、三趾间，趾蹼缘后方', indications: '肠炎，腹痛', niComment: '倪师认为此穴治肠炎有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-33', '木斗穴', 0, 0, 'midline', { position3d: { x: 0.155294, y: 0.028024, z: 0.150126 }, location: '在足背，第三、四趾间，趾蹼缘后方', indications: '脾肿大，消化不良', niComment: '倪师认为此穴治脾肿大有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-34', '木留穴', 0, 0, 'midline', { position3d: { x: 0.153499, y: 0.019255, z: 0.147849 }, location: '在足背，第四、五趾间，趾蹼缘后方', indications: '白内障，眼疾', niComment: '倪师认为此穴治白内障有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-35', '姐妹穴', 0, 0, 'midline', { position3d: { x: 0.155294, y: 0.028024, z: 0.150126 }, location: '在足背，第二跖骨两侧', indications: '子宫痛，赤白带下', niComment: '倪师认为此穴治妇科病有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-36', '九里穴', 0, 0, 'midline', { position3d: { x: 0.196495, y: 0.708371, z: 0.047931 }, location: '在小腿外侧，腓骨前缘，外踝上九寸', indications: '腰痛，背痛', niComment: '倪师认为此穴治腰背痛有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-37', '中九里穴', 0, 0, 'midline', { position3d: { x: 0.194677, y: 0.634582, z: 0.032408 }, location: '在小腿外侧，腓骨前缘，外踝上七寸半', indications: '半身不遂，腿痛', niComment: '倪师认为此穴治半身不遂有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-38', '上九里穴', 0, 0, 'midline', { position3d: { x: 0.187481, y: 0.795591, z: 0.04815 }, location: '在小腿外侧，腓骨前缘，外踝上十寸', indications: '肩痛，背痛', niComment: '倪师认为此穴治肩背痛有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-39', '下九里穴', 0, 0, 'midline', { position3d: { x: 0.188052, y: 0.578178, z: 0.042025 }, location: '在小腿外侧，腓骨前缘，外踝上六寸', indications: '腰痛，腿痛', niComment: '倪师认为此穴治腰腿痛有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-40', '通肾穴', 0, 0, 'midline', { position3d: { x: 0.169752, y: 0.82458, z: -0.0145 }, location: '在膝内侧，股骨内上髁下方', indications: '阳痿，早泄，遗精，腰痛', niComment: '倪师认为此穴治阳痿、遗精有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-41', '通胃穴', 0, 0, 'midline', { position3d: { x: 0.166457, y: 0.874299, z: 0.012956 }, location: '在通肾穴上二寸', indications: '胃痛，消化不良', niComment: '倪师认为此穴治胃痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-42', '通背穴', 0, 0, 'midline', { position3d: { x: 0.155249, y: 0.913154, z: 0.013479 }, location: '在通胃穴上二寸', indications: '背痛，腰痛', niComment: '倪师认为此穴治背腰痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-43', '通关穴', 0, 0, 'midline', { position3d: { x: 0.15127, y: 0.935923, z: 0.016073 }, location: '在通背穴上二寸', indications: '心脏病，心悸', niComment: '倪师认为此穴治心脏病有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-44', '通天穴', 0, 0, 'midline', { position3d: { x: 0.109954, y: 0.963376, z: -0.052212 }, location: '在通关穴上二寸', indications: '鼻病，鼻炎', niComment: '倪师认为此穴治鼻炎有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-45', '明黄穴', 0, 0, 'midline', { position3d: { x: 0.092132, y: 1.110574, z: -0.038614 }, location: '在大腿内侧正中线，股骨内侧', indications: '肝病，肝硬化', niComment: '倪师极常用此穴，治肝病特效。为董氏奇穴治肝要穴', needlingMethod: '二寸针，针深一寸至一寸半', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-46', '天黄穴', 0, 0, 'midline', { position3d: { x: 0.110023, y: 1.184259, z: -0.049904 }, location: '在明黄穴上三寸', indications: '肝病，黄疸', niComment: '倪师认为此穴治黄疸有效', needlingMethod: '二寸针，针深一寸至一寸半', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-47', '其黄穴', 0, 0, 'midline', { position3d: { x: 0.097566, y: 1.030103, z: -0.033226 }, location: '在明黄穴下三寸', indications: '肝病，脾肿大', niComment: '倪师认为此穴治脾肿大有效', needlingMethod: '二寸针，针深一寸至一寸半', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-48', '火枝穴', 0, 0, 'midline', { position3d: { x: 0.092132, y: 1.110574, z: -0.038614 }, location: '在大腿内侧，明黄穴旁开一寸', indications: '黄疸，肝炎', niComment: '倪师认为此穴治肝炎有效', needlingMethod: '二寸针，针深一寸至一寸半', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-49', '火全穴', 0, 0, 'midline', { position3d: { x: 0.110023, y: 1.184259, z: -0.049904 }, location: '在大腿内侧，天黄穴旁开一寸', indications: '肝病，心脏衰弱', niComment: '倪师认为此穴治肝病有效', needlingMethod: '二寸针，针深一寸至一寸半', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-50', '火主穴', 0, 0, 'midline', { position3d: { x: 0.097566, y: 1.030103, z: -0.033226 }, location: '在大腿内侧，其黄穴旁开一寸', indications: '黄疸，脾脏病', niComment: '倪师认为此穴治黄疸有效', needlingMethod: '二寸针，针深一寸至一寸半', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-51', '李白穴', 0, 0, 'midline', { position3d: { x: 0.160014, y: 0.034536, z: 0.152149 }, location: '在足背，第三跖骨外侧', indications: '腰痛，坐骨神经痛', niComment: '倪师认为此穴治坐骨神经痛有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-52', '云白穴', 0, 0, 'midline', { position3d: { x: 0.160014, y: 0.034536, z: 0.152149 }, location: '在足背，第二跖骨外侧', indications: '腰痛，背痛', niComment: '倪师认为此穴治腰背痛有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-53', '曲陵穴', 0, 0, 'midline', { position3d: { x: -0.155294, y: 0.028024, z: 0.150126 }, location: '在足背，第一跖骨外侧', indications: '脚痛，脚麻', niComment: '倪师认为此穴治脚痛有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-54', '花骨一穴', 0, 0, 'midline', { position3d: { x: 0.166826, y: 0.045006, z: 0.048278 }, location: '在足底，第一跖骨底下方', indications: '脚跟痛', niComment: '倪师认为此穴治脚跟痛有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-55', '花骨二穴', 0, 0, 'midline', { position3d: { x: 0.166826, y: 0.045006, z: 0.048278 }, location: '在足底，第二跖骨底下方', indications: '脚底痛', niComment: '倪师认为此穴治脚底痛有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-56', '花骨三穴', 0, 0, 'midline', { position3d: { x: 0.166826, y: 0.045006, z: 0.048278 }, location: '在足底，第三跖骨底下方', indications: '脚趾痛', niComment: '倪师认为此穴治脚趾痛有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-57', '花骨四穴', 0, 0, 'midline', { position3d: { x: 0.166826, y: 0.045006, z: 0.048278 }, location: '在足底，第四跖骨底下方', indications: '脚背痛', niComment: '倪师认为此穴治脚背痛有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-58', '妇灵一穴', 0, 0, 'midline', { position3d: { x: 0.173169, y: 0.052322, z: 0.110423 }, location: '在足背，第一、二跖骨之间', indications: '子宫炎，赤白带下', niComment: '倪师认为此穴治妇科炎症有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-59', '妇灵二穴', 0, 0, 'midline', { position3d: { x: 0.173169, y: 0.052322, z: 0.110423 }, location: '在足背，第二、三跖骨之间', indications: '月经不调，痛经', niComment: '倪师认为此穴治月经不调有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG04-60', '海豹穴', 0, 0, 'midline', { position3d: { x: 0.160014, y: 0.034536, z: 0.152149 }, location: '在足背，第三、四跖骨之间', indications: '腰痛，背痛', niComment: '倪师认为此穴治腰背痛有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-01', '正会穴', 0, 0, 'midline', { position3d: { x: 0, y: 1.703348, z: -0.009301 }, location: '在头顶正中央', indications: '中风，昏迷，四肢无力', niComment: '倪师认为此穴治中风昏迷有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-02', '州昆穴', 0, 0, 'midline', { position3d: { x: 0, y: 1.703348, z: -0.009301 }, location: '在正会穴前二分', indications: '头痛，头晕', niComment: '倪师认为此穴治头痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-03', '州仑穴', 0, 0, 'midline', { position3d: { x: 0, y: 1.703348, z: -0.009301 }, location: '在正会穴后二分', indications: '后头痛，颈项强痛', niComment: '倪师认为此穴治后头痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-04', '州火穴', 0, 0, 'midline', { position3d: { x: 0, y: 1.703348, z: -0.009301 }, location: '在正会穴左二分', indications: '半身不遂', niComment: '倪师认为此穴治半身不遂有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-05', '州水穴', 0, 0, 'midline', { position3d: { x: 0, y: 1.703348, z: -0.009301 }, location: '在正会穴右二分', indications: '半身不遂', niComment: '倪师认为此穴治半身不遂有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-06', '州金穴', 0, 0, 'midline', { position3d: { x: 0, y: 1.703348, z: -0.009301 }, location: '在正会穴左前二分', indications: '头痛，头晕', niComment: '倪师认为此穴治头痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-07', '州土穴', 0, 0, 'midline', { position3d: { x: 0, y: 1.703348, z: -0.009301 }, location: '在正会穴右前二分', indications: '头痛，头晕', niComment: '倪师认为此穴治头痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-08', '州木穴', 0, 0, 'midline', { position3d: { x: 0, y: 1.703348, z: -0.009301 }, location: '在正会穴左后二分', indications: '后头痛', niComment: '倪师认为此穴治后头痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-09', '镇静穴', 0, 0, 'midline', { position3d: { x: 0, y: 1.665747, z: -0.043724 }, location: '在两眉头之间', indications: '失眠，烦躁', niComment: '倪师认为此穴治失眠有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-10', '马快水穴', 0, 0, 'midline', { position3d: { x: 0.061573, y: 1.665367, z: 0.080554 }, location: '在侧头部，耳尖上方', indications: '腰痛，背痛', niComment: '倪师认为此穴治腰背痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-11', '腑快穴', 0, 0, 'midline', { position3d: { x: 0.071353, y: 1.608945, z: 0.045656 }, location: '在侧头部，耳后', indications: '耳鸣，耳聋', niComment: '倪师认为此穴治耳鸣有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-12', '水愈穴', 0, 0, 'midline', { position3d: { x: 0.066972, y: 1.581998, z: 0.049923 }, location: '在耳垂后方', indications: '牙痛，三叉神经痛', niComment: '倪师认为此穴治牙痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-13', '木枝穴', 0, 0, 'midline', { position3d: { x: 0, y: 1.665747, z: -0.043724 }, location: '在前额，眉弓上方', indications: '前额痛，眉棱骨痛', niComment: '倪师认为此穴治前额头痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-14', '木神穴', 0, 0, 'midline', { position3d: { x: 0.043217, y: 1.692604, z: -0.004748 }, location: '在头顶两侧', indications: '偏头痛，眩晕', niComment: '倪师认为此穴治偏头痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-15', '九里穴', 0, 0, 'midline', { position3d: { x: 0.033304, y: 1.61595, z: 0.114141 }, location: '在耳前，颧弓下方', indications: '面瘫，三叉神经痛', niComment: '倪师认为此穴治面瘫有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-16', '十十穴', 0, 0, 'midline', { position3d: { x: 0, y: 1.703348, z: -0.009301 }, location: '在头顶，百会穴旁开', indications: '头痛，头晕', niComment: '倪师认为此穴治头痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-17', '七里穴', 0, 0, 'midline', { position3d: { x: 0.071353, y: 1.608945, z: 0.045656 }, location: '在耳后，乳突上方', indications: '颈项强痛', niComment: '倪师认为此穴治颈项强痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-18', '上瘤穴', 0, 0, 'midline', { position3d: { x: 0, y: 1.703348, z: -0.009301 }, location: '在头顶，正会穴旁开一寸', indications: '脑瘤，头痛', niComment: '倪师认为此穴治脑部疾病有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-19', '下瘤穴', 0, 0, 'midline', { position3d: { x: 0, y: 1.703348, z: -0.009301 }, location: '在头顶，正会穴旁开一寸五分', indications: '头痛，眩晕', niComment: '倪师认为此穴治头痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-20', '足五金穴', 0, 0, 'midline', { position3d: { x: 0.155294, y: 0.028024, z: 0.150126 }, location: '在足背，第四跖骨外侧', indications: '坐骨神经痛', niComment: '倪师认为此穴治坐骨神经痛有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-21', '足五成穴', 0, 0, 'midline', { position3d: { x: 0.155294, y: 0.028024, z: 0.150126 }, location: '在足背，第五跖骨外侧', indications: '腿痛，脚痛', niComment: '倪师认为此穴治腿脚痛有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-22', '五金穴', 0, 0, 'midline', { position3d: { x: 0.188052, y: 0.578178, z: 0.042025 }, location: '在小腿外侧，腓骨前缘', indications: '腿痛，腰痛', niComment: '倪师认为此穴治腰腿痛有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-23', '五成穴', 0, 0, 'midline', { position3d: { x: 0.194677, y: 0.634582, z: 0.032408 }, location: '在小腿外侧，腓骨前缘', indications: '坐骨神经痛', niComment: '倪师认为此穴治坐骨神经痛有效', needlingMethod: '一寸半针，针深五分至一寸', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-24', '火菊穴', 0, 0, 'midline', { position3d: { x: -0.155294, y: 0.028024, z: 0.150126 }, location: '在足背，第一跖骨内侧', indications: '脚趾痛', niComment: '倪师认为此穴治脚趾痛有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-25', '火散穴', 0, 0, 'midline', { position3d: { x: 0.155294, y: 0.028024, z: 0.150126 }, location: '在足背，第二跖骨内侧', indications: '脚背痛', niComment: '倪师认为此穴治脚背痛有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-26', '水相穴', 0, 0, 'midline', { position3d: { x: 0.166826, y: 0.045006, z: 0.048278 }, location: '在足底，涌泉穴旁', indications: '肾病，水肿', niComment: '倪师认为此穴治肾病水肿有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-27', '水仙穴', 0, 0, 'midline', { position3d: { x: 0.166826, y: 0.045006, z: 0.048278 }, location: '在足底，涌泉穴后', indications: '腰痛，背痛', niComment: '倪师认为此穴治腰背痛有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-28', '三叉穴', 0, 0, 'midline', { position3d: { x: 0.449002, y: 1.109961, z: 0.164329 }, location: '在手背，第二、三掌骨之间', indications: '肩背痛', niComment: '倪师认为此穴治肩背痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-29', '三齿穴', 0, 0, 'midline', { position3d: { x: 0.449002, y: 1.109961, z: 0.164329 }, location: '在手背，第三、四掌骨之间', indications: '牙痛', niComment: '倪师认为此穴治牙痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-30', '三神穴', 0, 0, 'midline', { position3d: { x: 0.449002, y: 1.109961, z: 0.164329 }, location: '在手背，第四、五掌骨之间', indications: '失眠，心悸', niComment: '倪师认为此穴治失眠有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-31', '分枝穴', 0, 0, 'midline', { position3d: { x: 0.155294, y: 0.028024, z: 0.150126 }, location: '在足背，第一跖骨外侧', indications: '头痛，眩晕', niComment: '倪师认为此穴治头痛有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-32', '分枝上穴', 0, 0, 'midline', { position3d: { x: 0.155294, y: 0.028024, z: 0.150126 }, location: '在足背，第二跖骨外侧', indications: '腰痛', niComment: '倪师认为此穴治腰痛有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-33', '分枝下穴', 0, 0, 'midline', { position3d: { x: 0.155294, y: 0.028024, z: 0.150126 }, location: '在足背，第三跖骨外侧', indications: '坐骨神经痛', niComment: '倪师认为此穴治坐骨神经痛有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-34', '分枝里穴', 0, 0, 'midline', { position3d: { x: 0.155294, y: 0.028024, z: 0.150126 }, location: '在足背，第四跖骨外侧', indications: '腿痛', niComment: '倪师认为此穴治腿痛有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-35', '分枝外穴', 0, 0, 'midline', { position3d: { x: 0.155294, y: 0.028024, z: 0.150126 }, location: '在足背，第五跖骨外侧', indications: '脚踝痛', niComment: '倪师认为此穴治脚踝痛有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-36', '七虎穴', 0, 0, 'midline', { position3d: { x: 0.173169, y: 0.052322, z: 0.110423 }, location: '在足背，第一、二跖骨之间', indications: '脚痛，脚麻', niComment: '倪师认为此穴治脚痛有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-37', '九猴穴', 0, 0, 'midline', { position3d: { x: 0.173169, y: 0.052322, z: 0.110423 }, location: '在足背，第二、三跖骨之间', indications: '脚趾痛', niComment: '倪师认为此穴治脚趾痛有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-38', '十猴穴', 0, 0, 'midline', { position3d: { x: 0.160014, y: 0.034536, z: 0.152149 }, location: '在足背，第三、四跖骨之间', indications: '脚背痛', niComment: '倪师认为此穴治脚背痛有效', needlingMethod: '五分针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-39', '骨关穴', 0, 0, 'midline', { position3d: { x: 0.449002, y: 1.109961, z: 0.164329 }, location: '在手背，拇指与食指叉口后一寸', indications: '坐骨神经痛', niComment: '倪师认为此穴治坐骨神经痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
      pt('DONG05-40', '木关穴', 0, 0, 'midline', { position3d: { x: 0.449002, y: 1.109961, z: 0.164329 }, location: '在手背，拇指与食指叉口后二寸', indications: '腰痛', niComment: '倪师认为此穴治腰痛有效', needlingMethod: '一寸针，针深三分至五分', contraindications: '一般无特殊禁忌' }),
    ],
    pathCun: [], // 董氏奇穴无连续经络路径
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getPointsByMeridian(meridianCode: string): Acupoint[] {
  const m = TWELVE_MERIDIANS.find((m) => m.code === meridianCode);
  return m ? m.points : [];
}

export function getIntersectingMeridians(pointCode: string): string[] {
  for (const m of TWELVE_MERIDIANS) {
    const pt = m.points.find((p) => p.code === pointCode);
    if (pt && pt.intersections.length > 0) return pt.intersections;
  }
  return [];
}

export function getWuxingColor(meridianCode: string): string {
  for (const [, val] of Object.entries(WUXING_MAP)) {
    if (val.meridians.includes(meridianCode)) return val.color;
  }
  for (const m of TWELVE_MERIDIANS) {
    if (m.code === meridianCode) return m.color;
  }
  return '#666666';
}

export function getMeridianPath3D(meridianCode: string): { x: number; y: number; z: number }[] {
  const m = TWELVE_MERIDIANS.find((m) => m.code === meridianCode);
  if (!m) return [];
  return m.pathCun.map((p) => {
    const arm = isArmPoint(meridianCode, p.cunY);
    return cunTo3D(p.cunX, p.cunY, p.side, p.cunZ, arm, meridianCode);
  });
}

export function getAcupoint3D(point: Acupoint, useObjSpace: boolean = false): { x: number; y: number; z: number } {
  // 优先使用TCM 3D坐标（OBJ模型空间，校准后贴合模型表面）
  // 仅在TcmBodyModel场景中使用OBJ空间坐标
  // MeridianCanvas场景（BodyParts3D空间）始终用cunTo3D()
  if (useObjSpace && point.position3d) return point.position3d;
  const meridianCode = point.code.match(/^[A-Z]+/)?.[0] || '';
  const arm = isArmPoint(meridianCode, point.cunY);
  return cunTo3D(point.cunX, point.cunY, point.side, point.cunZ, arm, meridianCode);
}

export function getMeridianByCode(meridianCode: string): Meridian | undefined {
  return TWELVE_MERIDIANS.find((m) => m.code === meridianCode);
}

export function getPointByCode(pointCode: string): Acupoint | undefined {
  for (const m of TWELVE_MERIDIANS) {
    const found = m.points.find((p) => p.code === pointCode);
    if (found) return found;
  }
  return undefined;
}

export function getSpecialPoints(type: 'isJingWell' | 'isYuan' | 'isLuo' | 'isXi' | 'isMu'): Acupoint[] {
  const result: Acupoint[] = [];
  for (const m of TWELVE_MERIDIANS) {
    for (const p of m.points) {
      if (p[type]) result.push(p);
    }
  }
  return result;
}

export function getMuPoints(): Acupoint[] {
  return getSpecialPoints('isMu');
}

export function getYuanPoints(): Acupoint[] {
  return getSpecialPoints('isYuan');
}

export function getLuoPoints(): Acupoint[] {
  return getSpecialPoints('isLuo');
}

export function getXiPoints(): Acupoint[] {
  return getSpecialPoints('isXi');
}

export function getJingWellPoints(): Acupoint[] {
  return getSpecialPoints('isJingWell');
}

// ============================================================
// TCM ENHANCED HELPERS — 倪师体系查询函数
// ============================================================

/** 获取有倪师注释的穴位 */
export function getNiCommentPoints(): Acupoint[] {
  const result: Acupoint[] = [];
  for (const m of TWELVE_MERIDIANS) {
    for (const p of m.points) {
      if (p.niComment) result.push(p);
    }
  }
  return result;
}

/** 获取有3D坐标的穴位（OBJ模型空间，校准后贴合human.obj表面） */
export function get3DEnabledPoints(): Acupoint[] {
  const result: Acupoint[] = [];
  for (const m of TWELVE_MERIDIANS) {
    for (const p of m.points) {
      if (p.position3d) result.push(p);
    }
  }
  return result;
}

/** 获取董氏奇穴列表 */
export function getDongPoints(): Acupoint[] {
  return getPointsByMeridian('DONG');
}

/** 按关键词搜索倪师注释 */
export function searchNiComments(keyword: string): Acupoint[] {
  const result: Acupoint[] = [];
  for (const m of TWELVE_MERIDIANS) {
    for (const p of m.points) {
      if (p.niComment && p.niComment.includes(keyword)) result.push(p);
    }
  }
  return result;
}

/** 获取所有经脉数量（含董氏奇穴） */
export function getMeridianCount(): number {
  return TWELVE_MERIDIANS.length;
}
