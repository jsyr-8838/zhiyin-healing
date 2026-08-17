/**
 * 疗愈推荐 Hook — 从统一辩证 store 读取体质结果，输出个性化推荐
 *
 * 各疗愈子页面只需 useHealingRecommendation() 即可获取：
 * - 推荐五行音、六字诀、灸疗穴位、脉轮、饮食等
 * - 完成辨识时自动高亮推荐项（"荐"标签）
 * - 未完成辨识时返回 null，页面正常展示
 */

import { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { consolidateDiagnosis, type ConsolidatedDiagnosis } from '@/lib/unified-diagnosis';

export interface HealingRecommendation {
  /** 是否已完成体质辨识 */
  hasDiagnosis: boolean;
  /** 综合辩证结果（null = 未辨识） */
  diagnosis: ConsolidatedDiagnosis | null;
  /** 推荐五行音 key（jiao/zhi/gong/shang/yu） */
  recommendedTone: string | null;
  /** 推荐六字诀 id（xu/he/hu/si/chui/xi） */
  recommendedLiuzijue: string | null;
  /** 推荐五行 element key（wood/fire/earth/metal/water） */
  recommendedElement: string | null;
  /** 推荐脉轮名称 */
  recommendedChakra: string | null;
  /** 推荐灸疗穴位 */
  recommendedAcupoints: string[] | null;
  /** 饮食宜忌 */
  dietFavor: string[] | null;
  dietAvoid: string[] | null;
  /** 体质五行中文 */
  primaryElementCn: string | null;
  /** 体质九种类型 */
  primaryConstitution: string | null;
}

/** 五行中文 → 英文 key */
const ELEMENT_CN_TO_KEY: Record<string, string> = {
  '木': 'wood', '火': 'fire', '土': 'earth', '金': 'metal', '水': 'water',
};

/** 五音中文 → 英文 key */
const WUYIN_CN_TO_KEY: Record<string, string> = {
  '角': 'jiao', '徵': 'zhi', '宫': 'gong', '商': 'shang', '羽': 'yu',
};

/** 五行中文 → 六字诀 id */
const ELEMENT_TO_LIUZIJUE: Record<string, string> = {
  '木': 'xu',   // 嘘
  '火': 'he',   // 呵
  '土': 'hu',   // 呼
  '金': 'si',   // 呬
  '水': 'chui', // 吹
};

/**
 * 疗愈推荐 Hook
 *
 * @example
 * ```tsx
 * const { hasDiagnosis, recommendedTone, recommendedElement } = useHealingRecommendation();
 * // 在 UI 中根据 recommendedTone 高亮推荐项
 * ```
 */
export function useHealingRecommendation(): HealingRecommendation {
  const { unifiedDiagnosis } = useAppStore();

  return useMemo(() => {
    const diagnosis = consolidateDiagnosis(unifiedDiagnosis);
    const hasDiagnosis = diagnosis.completedModules.length > 0;

    if (!hasDiagnosis) {
      return {
        hasDiagnosis: false,
        diagnosis: null,
        recommendedTone: null,
        recommendedLiuzijue: null,
        recommendedElement: null,
        recommendedChakra: null,
        recommendedAcupoints: null,
        dietFavor: null,
        dietAvoid: null,
        primaryElementCn: null,
        primaryConstitution: null,
      };
    }

    const elementCn = diagnosis.primaryElement;
    const elementKey = ELEMENT_CN_TO_KEY[elementCn] ?? null;
    const toneCn = diagnosis.healingPlan.wuyin.tone;
    const toneKey = WUYIN_CN_TO_KEY[toneCn] ?? null;
    const liuzijueId = ELEMENT_TO_LIUZIJUE[elementCn] ?? null;

    return {
      hasDiagnosis: true,
      diagnosis,
      recommendedTone: toneKey,
      recommendedLiuzijue: liuzijueId,
      recommendedElement: elementKey,
      recommendedChakra: diagnosis.healingPlan.chakra.name ?? null,
      recommendedAcupoints: diagnosis.healingPlan.jiuLiao.acupoints ?? null,
      dietFavor: diagnosis.healingPlan.diet.favor ?? null,
      dietAvoid: diagnosis.healingPlan.diet.avoid ?? null,
      primaryElementCn: elementCn,
      primaryConstitution: diagnosis.primaryConstitution,
    };
  }, [unifiedDiagnosis]);
}
