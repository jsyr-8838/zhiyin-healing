// ═══════════════════════════════════════════
// StressMusic 集成 — 共享类型定义
// ═══════════════════════════════════════════

/** StressMusic 流程状态 */
export type FlowState = 'idle' | 'detecting' | 'preference' | 'loading' | 'playing';

/** 呼吸引导阶段 */
export type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'relax';

/** 音乐流派偏好 */
export type MusicGenre = '流行' | '摇滚' | '古典' | '嘻哈' | '电子' | 'R&B' | '爵士' | '乡村' | '布鲁斯' | '雷鬼';

/** 流派元数据 */
export interface GenreOption {
  id: MusicGenre;
  labelCn: string;
  labelEn: string;
  icon: string;
}

export const GENRE_OPTIONS: GenreOption[] = [
  { id: '流行', labelCn: '流行', labelEn: 'Pop', icon: '🎵' },
  { id: '摇滚', labelCn: '摇滚', labelEn: 'Rock', icon: '🎸' },
  { id: '古典', labelCn: '古典', labelEn: 'Classic', icon: '🎹' },
  { id: '嘻哈', labelCn: '嘻哈', labelEn: 'Hip-Hop', icon: '🎧' },
  { id: '电子', labelCn: '电子', labelEn: 'Electronic', icon: '⚡' },
  { id: 'R&B', labelCn: 'R&B', labelEn: 'R&B', icon: '🎙️' },
  { id: '爵士', labelCn: '爵士', labelEn: 'Jazz', icon: '🎷' },
  { id: '乡村', labelCn: '乡村', labelEn: 'Country', icon: '🤠' },
  { id: '布鲁斯', labelCn: '布鲁斯', labelEn: 'Blues', icon: '🎺' },
  { id: '雷鬼', labelCn: '雷鬼', labelEn: 'Reggae', icon: '🥁' },
];

/** HRV 数据点 */
export interface HrvData {
  exists: boolean;
  hrv: number | null;
  bpm: number | null;
  mtime: number | null;
}

/** 模型状态 */
export interface ModelStatus {
  loaded: boolean;
  loading: boolean;
  message?: string;
  elapsed_time?: number;
}

/** 音乐生成状态 */
export interface MusicStatus {
  status: 'idle' | 'processing' | 'completed' | 'failed';
  file_id?: string;
  error?: string;
}

/** 会话追踪数据 */
export interface SessionData {
  startTime: number | null;
  startHRV: number | null;
  startBPM: number | null;
  endHRV: number | null;
  endBPM: number | null;
  history: Array<{ timestamp: number; hrv: number; bpm: number }>;
}

/** StressMusic API 基础 URL */
export const STRESS_API_BASE = 'http://localhost:5001';

/** 加载页进度日志 */
export const LOADING_LOGS = [
  { time: 0, text: '正在分析您的心率变异性 (HRV)...' },
  { time: 5000, text: '检测到压力水平，正在匹配舒缓算法...' },
  { time: 15000, text: '正在构建基础旋律...' },
  { time: 30000, text: '加载 MusicGen 模型参数...' },
  { time: 50000, text: '正在生成第一乐章：引入...' },
  { time: 90000, text: '正在生成第二乐章：发展...' },
  { time: 130000, text: '正在生成第三乐章：高潮...' },
  { time: 170000, text: '正在生成第四乐章：回归...' },
  { time: 200000, text: '正在进行声学优化与无缝循环处理...' },
  { time: 220000, text: '正在去除音频伪影 (DC Offset Removal)...' },
  { time: 240000, text: '最终渲染中，即将完成...' },
];
