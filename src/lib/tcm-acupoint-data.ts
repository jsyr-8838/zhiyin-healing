// tcm-acupoint-data.ts — TCM项目571穴数据适配层
// 将acupoints_database.json转换为组件可用的格式
// 坐标系：与human.obj一致（Y轴0~1.714, X轴-0.557~0.557, Z轴-0.099~0.368）

import acupointsRaw from '@/data/tcm/acupoints_database.json';

// ============================================================
// 类型定义
// ============================================================

export interface TcmAcupoint {
  id: number;
  code: string;
  name: string;
  meridian: string;       // LU, LI, ST, SP, HT, SI, BL, KI, PC, TE, GB, LV, DU, REN, DONG
  location: string;       // 定位描述
  indications: string;     // 主治
  needlingMethod: string; // 针刺方法
  niComment: string;      // 倪师注释（品牌差异化核心）
  contraindications: string; // 禁忌
  position3d: [number, number, number]; // 3D坐标 [x, y, z]
}

export interface TcmMeridian {
  code: string;
  name: string;
  nameZh: string;
  wuxing: string;
  color: string;
  acupoints: TcmAcupoint[];
}

// ============================================================
// 经脉元数据
// ============================================================

const MERIDIAN_META: Record<string, { nameZh: string; wuxing: string; color: string }> = {
  LU:  { nameZh: '手太阴肺经', wuxing: '金', color: '#FFD700' },
  LI:  { nameZh: '手阳明大肠经', wuxing: '金', color: '#FFD700' },
  ST:  { nameZh: '足阳明胃经', wuxing: '土', color: '#FF8C00' },
  SP:  { nameZh: '足太阴脾经', wuxing: '土', color: '#FF8C00' },
  HT:  { nameZh: '手少阴心经', wuxing: '火', color: '#FF4500' },
  SI:  { nameZh: '手太阳小肠经', wuxing: '火', color: '#FF4500' },
  BL:  { nameZh: '足太阳膀胱经', wuxing: '水', color: '#00BFFF' },
  KI:  { nameZh: '足少阴肾经', wuxing: '水', color: '#00BFFF' },
  PC:  { nameZh: '手厥阴心包经', wuxing: '火', color: '#FF4500' },
  TE:  { nameZh: '手少阳三焦经', wuxing: '金', color: '#FFD700' },
  GB:  { nameZh: '足少阳胆经', wuxing: '木', color: '#00FF7F' },
  LV:  { nameZh: '足厥阴肝经', wuxing: '木', color: '#00FF7F' },
  DU:  { nameZh: '督脉', wuxing: '土', color: '#FF8C00' },
  REN: { nameZh: '任脉', wuxing: '土', color: '#FF8C00' },
  DONG: { nameZh: '董氏奇穴', wuxing: '木', color: '#8b5cf6' },
};

// ============================================================
// 数据解析
// ============================================================

// 从JSON原始数据解析所有571穴
export function parseTcmAcupoints(): TcmAcupoint[] {
  const raw = acupointsRaw as unknown as { acupoints: Array<{
    id: number; code: string; name: string; meridian: string;
    location: string; indications: string; needling_method: string;
    ni_comment: string; contraindications: string;
    position_3d: [number, number, number];
  }> };

  return raw.acupoints.map(p => ({
    id: p.id,
    code: p.code,
    name: p.name,
    meridian: p.meridian,
    location: p.location || '',
    indications: p.indications || '',
    needlingMethod: p.needling_method || '',
    niComment: p.ni_comment || '',
    contraindications: p.contraindications || '',
    position3d: p.position_3d,
  }));
}

// 缓存解析结果
let _cachedPoints: TcmAcupoint[] | null = null;
export function getTcmAcupoints(): TcmAcupoint[] {
  if (!_cachedPoints) _cachedPoints = parseTcmAcupoints();
  return _cachedPoints;
}

// 按经脉分组
let _cachedMeridians: TcmMeridian[] | null = null;
export function getTcmMeridians(): TcmMeridian[] {
  if (_cachedMeridians) return _cachedMeridians;
  const points = getTcmAcupoints();
  const grouped = new Map<string, TcmAcupoint[]>();

  for (const p of points) {
    if (!grouped.has(p.meridian)) grouped.set(p.meridian, []);
    grouped.get(p.meridian)!.push(p);
  }

  _cachedMeridians = Array.from(grouped.entries()).map(([code, acupoints]) => {
    const meta = MERIDIAN_META[code] || { nameZh: code, wuxing: '土', color: '#888' };
    return {
      code,
      name: meta.nameZh,
      nameZh: meta.nameZh,
      wuxing: meta.wuxing,
      color: meta.color,
      acupoints,
    };
  });

  return _cachedMeridians;
}

// 按穴位code快速查找
let _pointMap: Map<string, TcmAcupoint> | null = null;
export function getTcmPointByCode(code: string): TcmAcupoint | undefined {
  if (!_pointMap) {
    _pointMap = new Map();
    for (const p of getTcmAcupoints()) {
      _pointMap.set(p.code, p);
    }
  }
  return _pointMap.get(code);
}

// 按穴位名查找
let _pointNameMap: Map<string, TcmAcupoint> | null = null;
export function getTcmPointByName(name: string): TcmAcupoint | undefined {
  if (!_pointNameMap) {
    _pointNameMap = new Map();
    for (const p of getTcmAcupoints()) {
      _pointNameMap.set(p.name, p);
    }
  }
  return _pointNameMap.get(name);
}

// 搜索穴位（支持名称、代码、主治、定位模糊匹配）
export function searchTcmAcupoints(query: string): TcmAcupoint[] {
  if (!query.trim()) return [];
  const q = query.trim().toLowerCase();
  const points = getTcmAcupoints();
  return points.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.code.toLowerCase().includes(q) ||
    p.meridian.toLowerCase().includes(q) ||
    p.indications.toLowerCase().includes(q) ||
    p.location.toLowerCase().includes(q) ||
    p.niComment.toLowerCase().includes(q)
  ).slice(0, 50);
}

// 统计
export function getTcmStats() {
  const points = getTcmAcupoints();
  const regular = points.filter(p => p.meridian !== 'DONG');
  const dong = points.filter(p => p.meridian === 'DONG');
  return {
    total: points.length,
    regular: regular.length,
    dong: dong.length,
    meridianCount: new Set(points.map(p => p.meridian)).size,
  };
}

// ============================================================
// 经脉经络线路（14正经路径，用于3D渲染管线）
// 基于TCM项目acupoints按经脉顺序连接
// ============================================================

export function getMeridianPath(meridianCode: string): [number, number, number][] {
  const meridians = getTcmMeridians();
  const m = meridians.find(m => m.code === meridianCode);
  if (!m) return [];
  // 按id排序（保持原有穴位顺序），取3D坐标
  return m.acupoints
    .sort((a, b) => a.id - b.id)
    .map(p => p.position3d);
}

// 导出经脉元数据常量
export const TCM_MERIDIAN_META = MERIDIAN_META;
