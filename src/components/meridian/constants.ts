import type { WuxingElement, Acupoint } from '@/lib/meridian-data';
import { type BoneModel, BONE_MODELS, CATEGORY_LABELS } from '@/lib/data/bone-models';

export type ViewMode = 'bones' | 'meridians' | 'points' | 'all';

export { type BoneModel, BONE_MODELS, CATEGORY_LABELS };

export const POINT_TYPE_BADGES: Record<string, { label: string; color: string }> = {
  isJingWell: { label: '井', color: '#ef4444' },
  isYuan: { label: '原', color: '#f59e0b' },
  isLuo: { label: '络', color: '#3b82f6' },
  isXi: { label: '郄', color: '#8b5cf6' },
  isMu: { label: '募', color: '#10b981' },
};

export const WUXING_COLORS_DISPLAY: Record<WuxingElement, string> = {
  '金': '#FFD700', '水': '#00BFFF', '木': '#00FF7F', '火': '#FF4500', '土': '#FF8C00',
};

export const WUXING_LABELS: WuxingElement[] = ['金', '木', '水', '火', '土'];

export function getPointBadges(p: Acupoint): string[] {
  const badges: string[] = [];
  if (p.isJingWell) badges.push('井');
  if (p.isYuan) badges.push('原');
  if (p.isLuo) badges.push('络');
  if (p.isXi) badges.push('郄');
  if (p.isMu) badges.push('募');
  return badges;
}

export function getBadgeColor(badge: string): string {
  return POINT_TYPE_BADGES[`is${badge === '井' ? 'JingWell' : badge === '原' ? 'Yuan' : badge === '络' ? 'Luo' : badge === '郄' ? 'Xi' : 'Mu'}`]?.color || '#666';
}

export function getBadgeLabel(badge: string): string {
  return badge === '井' ? '井穴' : badge === '原' ? '原穴' : badge === '络' ? '络穴' : badge === '郄' ? '郄穴' : '募穴';
}

export const MERIDIAN_CLASSIC_QUOTES: Record<string, string> = {
  LU: '肺者，相傅之官，治节出焉。 ──《素问·灵兰秘典论》',
  LI: '大肠者，传道之官，变化出焉。 ──《素问·灵兰秘典论》',
  ST: '胃者，仓廪之官，五味出焉。 ──《素问·灵兰秘典论》',
  SP: '脾胃者，仓廪之官，营之居也。 ──《素问·灵兰秘典论》',
  HT: '心者，君主之官，神明出焉。 ──《素问·灵兰秘典论》',
  SI: '小肠者，受盛之官，化物出焉。 ──《素问·灵兰秘典论》',
  BL: '膀胱者，州都之官，津液藏焉。 ──《素问·灵兰秘典论》',
  KI: '肾者，作强之官，伎巧出焉。 ──《素问·灵兰秘典论》',
  PC: '心包者，臣使之官，喜乐出焉。 ──《素问·灵兰秘典论》',
  TE: '三焦者，决渎之官，水道出焉。 ──《素问·灵兰秘典论》',
  GB: '胆者，中正之官，决断出焉。 ──《素问·灵兰秘典论》',
  LR: '肝者，将军之官，谋虑出焉。 ──《素问·灵兰秘典论》',
  RN: '任脉者，起于中极之下，以上毛际。 ──《素问·骨空论》',
  DU: '督脉者，起于少腹以下骨中央。 ──《素问·骨空论》',
};

export const MOXIBUSTION_PRESCRIPTIONS = [
  { name: '补气培元方', points: '足三里、气海、关元', time: '每穴15分钟', target: '气虚/阳虚' },
  { name: '疏肝理气方', points: '太冲、期门、膻中', time: '每穴10分钟', target: '气郁' },
  { name: '温阳散寒方', points: '命门、肾俞、神阙', time: '每穴20分钟', target: '阳虚' },
  { name: '活血化瘀方', points: '血海、三阴交、合谷', time: '每穴12分钟', target: '血瘀' },
  { name: '健脾祛湿方', points: '中脘、阴陵泉、丰隆', time: '每穴15分钟', target: '痰湿' },
];
