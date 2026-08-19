import {
  SYMPTOM_RULES,
  SHICHEN_DATA,
  ORGAN_ACUPOINT_MAP,
  QUICK_COMMANDS,
  type SymptomRule,
  type ShichenData,
} from '@/lib/data/dialectic-data';

export type { SymptomRule, ShichenData };
export { SYMPTOM_RULES, SHICHEN_DATA, ORGAN_ACUPOINT_MAP, QUICK_COMMANDS };

export interface DialecticResult {
  matchedRules: SymptomRule[];
  currentShichen: ShichenData;
  organAffinity: Record<string, number>;
  primaryOrgan: string;
  acupointRecommendations: string[];
  summary: string;
}

function getCurrentShichen() {
  const hour = new Date().getHours();
  let index: number;
  if (hour === 23 || hour === 0) index = 0;
  else if (hour >= 1 && hour < 3) index = 1;
  else if (hour >= 3 && hour < 5) index = 2;
  else if (hour >= 5 && hour < 7) index = 3;
  else if (hour >= 7 && hour < 9) index = 4;
  else if (hour >= 9 && hour < 11) index = 5;
  else if (hour >= 11 && hour < 13) index = 6;
  else if (hour >= 13 && hour < 15) index = 7;
  else if (hour >= 15 && hour < 17) index = 8;
  else if (hour >= 17 && hour < 19) index = 9;
  else if (hour >= 19 && hour < 21) index = 10;
  else index = 11;
  return SHICHEN_DATA[index];
}

export function analyzeSymptoms(symptoms: string[]): DialecticResult {
  const matchedRules: SymptomRule[] = [];
  const organAffinity: Record<string, number> = {};

  for (const rule of SYMPTOM_RULES) {
    let matchCount = 0;
    for (const symptom of symptoms) {
      for (const keyword of rule.keywords) {
        if (symptom.includes(keyword) || keyword.includes(symptom)) {
          matchCount++;
          break;
        }
      }
    }
    if (matchCount > 0) {
      matchedRules.push(rule);
      organAffinity[rule.organ] = (organAffinity[rule.organ] || 0) + matchCount;
    }
  }

  matchedRules.sort((a, b) => {
    const aCount = organAffinity[a.organ] || 0;
    const bCount = organAffinity[b.organ] || 0;
    return bCount - aCount;
  });

  const currentShichen = getCurrentShichen();

  if (organAffinity[currentShichen.organ]) {
    organAffinity[currentShichen.organ] += 0.5;
  }

  const primaryOrgan = Object.entries(organAffinity).sort(([, a], [, b]) => b - a)[0]?.[0] || '脾';

  const acupointRecommendations: string[] = [];
  const topOrgans = Object.entries(organAffinity)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  for (const [organ] of topOrgans) {
    const points = ORGAN_ACUPOINT_MAP[organ];
    if (points) {
      acupointRecommendations.push(...points.slice(0, 3));
    }
  }

  if (acupointRecommendations.length === 0) {
    acupointRecommendations.push(
      ...ORGAN_ACUPOINT_MAP[currentShichen.organ]?.slice(0, 3) || ['足三里', '合谷', '太冲']
    );
  }

  const uniqueAcupoints = [...new Set(acupointRecommendations)].slice(0, 5);

  const categoryList = matchedRules.map(r => r.category).join('、');
  const summary = matchedRules.length > 0
    ? `根据症状分析，您可能存在${categoryList}等问题。当前${currentShichen.name}时${currentShichen.meridian}当令，建议重点关注${primaryOrgan}的调理。`
    : `当前${currentShichen.name}时${currentShichen.meridian}当令，${currentShichen.healthTip}。如需更精准分析，请描述更多症状。`;

  return {
    matchedRules,
    currentShichen,
    organAffinity,
    primaryOrgan,
    acupointRecommendations: uniqueAcupoints,
    summary,
  };
}
