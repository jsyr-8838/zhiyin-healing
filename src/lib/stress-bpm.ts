/**
 * 共享的 BPM → 疗愈映射工具
 *
 * 抽取自 src/components/stressmusic/useStressFlow.ts
 * 让知音之境和其他疗愈模块都能复用同一套心率分区逻辑。
 *
 * BPM 区间   | 状态        | 五行 | 意图
 * -----------|-------------|------|----------------------
 * ≥100       | 高压焦虑    | 水   | 镇静下沉
 * 90-99      | 轻度紧张    | 土/水| 安神缓和
 * 80-89      | 略有紧绷    | 金   | 沉淀清心
 * 70-79      | 接近正常    | 阴   | 温柔照见
 * 60-69      | 身心平稳    | 土   | 柔软件件
 * 50-59      | 能量偏低    | 火   | 暖阳激活
 * <50        | 需要激活    | 木   | 生发补气
 */

export type BPMZone =
  | 'high_stress'    // ≥100 高压焦虑
  | 'mild_tension'   // 90-99 轻度紧张
  | 'slight_tight'   // 80-89 略有紧绷
  | 'near_normal'    // 70-79 接近正常
  | 'calm'           // 60-69 身心平稳
  | 'low_energy'     // 50-59 能量偏低
  | 'need_activate'; // <50 需要激活

export interface BPMZoneInfo {
  zone: BPMZone;
  label: string;
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  elementCn: '木' | '火' | '土' | '金' | '水';
  description: string;
  color: string;
}

export interface BreathConfig {
  inhale: number;
  hold: number;
  exhale: number;
  total: number;
  label: string;
}

/** BPM → 区间信息 */
export function getBPMZone(bpm: number): BPMZoneInfo {
  if (bpm >= 100) {
    return {
      zone: 'high_stress',
      label: '高压焦虑',
      element: 'water',
      elementCn: '水',
      description: '心率偏高，需要镇静下沉，让重量融化',
      color: '#3d7a75',
    };
  }
  if (bpm >= 90) {
    return {
      zone: 'mild_tension',
      label: '轻度紧张',
      element: 'water',
      elementCn: '水',
      description: '心率略高，需要安神缓和，让杂音被冲走',
      color: '#5d8a63',
    };
  }
  if (bpm >= 80) {
    return {
      zone: 'slight_tight',
      label: '略有紧绷',
      element: 'metal',
      elementCn: '金',
      description: '心率稍有紧绷，需要沉淀心水，穿透云雾',
      color: '#c9a94f',
    };
  }
  if (bpm >= 70) {
    return {
      zone: 'near_normal',
      label: '接近正常',
      element: 'metal',
      elementCn: '金',
      description: '心率接近正常，需要温柔照见，沉淀余韵',
      color: '#8a9bb8',
    };
  }
  if (bpm >= 60) {
    return {
      zone: 'calm',
      label: '身心平稳',
      element: 'earth',
      elementCn: '土',
      description: '心率平稳，需要柔软前行，不焦虑远处',
      color: '#a8b0a8',
    };
  }
  if (bpm >= 50) {
    return {
      zone: 'low_energy',
      label: '能量偏低',
      element: 'fire',
      elementCn: '火',
      description: '心率偏低，需要古老暖意，激活心阳',
      color: '#c26158',
    };
  }
  return {
    zone: 'need_activate',
    label: '需要激活',
    element: 'wood',
    elementCn: '木',
    description: '心率过低，需要木行生发，把根扎进泥土',
    color: '#4a6b3a',
  };
}

/** BPM → 呼吸节奏配置 */
export function getBreathConfig(bpm: number): BreathConfig {
  if (bpm >= 100) {
    const total = 19;
    return { inhale: 4, hold: 7, exhale: 8, total, label: '4-7-8 深度镇定' };
  }
  if (bpm >= 90) {
    const total = 17;
    return { inhale: 4, hold: 6, exhale: 7, total, label: '4-6-7 缓和呼吸' };
  }
  if (bpm >= 80) {
    const total = 14.5;
    return { inhale: 3.5, hold: 5, exhale: 6, total, label: '3.5-5-6 平稳呼吸' };
  }
  if (bpm >= 70) {
    const total = 12;
    return { inhale: 3, hold: 4, exhale: 5, total, label: '3-4-5 舒缓呼吸' };
  }
  if (bpm >= 60) {
    const total = 11;
    return { inhale: 3, hold: 3.5, exhale: 4.5, total, label: '3-3.5-4.5 温和呼吸' };
  }
  const total = 9.5;
  return { inhale: 2.5, hold: 3, exhale: 4, total, label: '2.5-3-4 暖阳呼吸' };
}

/** 格式化 BPM 显示 */
export function formatBPM(bpm: number): string {
  return `${Math.round(bpm)} BPM`;
}

/** 格式化 HRV 显示 */
export function formatHRV(hrv: number): string {
  return `${Math.round(hrv)} ms`;
}
