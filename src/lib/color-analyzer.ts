/**
 * 肤色采样 + 五维评分 + 最终排名
 * 五维度: 肤色提升度(30%) / 冷暖匹配(20%) / 五官清晰度(20%) / 对比度和谐(15%) / 气质匹配(15%)
 */

export interface DimensionScores {
  skinLift: number;
  warmth: number;
  clarity: number;
  harmony: number;
  vibe: number;
}

export interface AnalyzeResult extends DimensionScores {
  total: number;
}

export interface RoundHistory {
  round: number;
  seasonKey: string;
  color: string;
  colorName: string;
  phase: 1 | 2;
  aiScores: AnalyzeResult;
  userScore: number;
  systemScore: number;
}

export interface FinalResult {
  key: string;
  score: number;
  dimensions: DimensionScores;
}

/**
 * 肤色采样 + 五维评分
 */
export async function analyzeImageMetrics(imageBase64: string, bgHex: string): Promise<AnalyzeResult> {
  const skinRGB = await sampleSkinColor(imageBase64);
  const bgRGB = hexToRGB(bgHex);

  const dist = Math.sqrt(
    (skinRGB.r - bgRGB.r) ** 2 +
    (skinRGB.g - bgRGB.g) ** 2 +
    (skinRGB.b - bgRGB.b) ** 2
  );

  const skinLift = Math.max(0, Math.min(10, 10 - Math.abs(dist - 50) / 15));

  const skinWarmth = (skinRGB.r - skinRGB.b) / (skinRGB.r + skinRGB.b + 1);
  const bgWarmth = (bgRGB.r - bgRGB.b) / (bgRGB.r + bgRGB.b + 1);
  const warmth = Math.max(0, Math.min(10, 10 - (skinWarmth - bgWarmth) ** 2 * 50));

  const clarity = dist > 100 && dist < 250 ? 9 : 5;
  const harmony = dist > 60 && dist < 180 ? 9 : 3;
  const vibe = 8;

  const total = skinLift * 0.3 + warmth * 0.2 + clarity * 0.2 + harmony * 0.15 + vibe * 0.15;

  return { skinLift, warmth, clarity, harmony, vibe, total };
}

async function sampleSkinColor(imageBase64: string): Promise<{ r: number; g: number; b: number }> {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d')!;
      const sx = img.width * 0.4, sy = img.height * 0.4;
      const sw = img.width * 0.2, sh = img.height * 0.2;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 100, 100);
      const data = ctx.getImageData(0, 0, 100, 100).data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        const pr = data[i], pg = data[i + 1], pb = data[i + 2];
        if (pr > pg && pr > pb) {
          r += pr; g += pg; b += pb; count++;
        }
      }
      if (count > 0) {
        resolve({ r: r / count, g: g / count, b: b / count });
      } else {
        resolve({ r: 200, g: 180, b: 160 });
      }
    };
    img.onerror = () => resolve({ r: 200, g: 180, b: 160 });
    img.src = imageBase64;
  });
}

function hexToRGB(hex: string) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

export function calculateFinalResults(
  historicalData: RoundHistory[],
  userScores: Record<string, number>
): FinalResult[] {
  const seasonAccum: Record<string, { dims: DimensionScores; count: number; userTotal: number }> = {};

  for (const round of historicalData) {
    const key = round.seasonKey;
    if (!seasonAccum[key]) {
      seasonAccum[key] = {
        dims: { skinLift: 0, warmth: 0, clarity: 0, harmony: 0, vibe: 0 },
        count: 0,
        userTotal: 0,
      };
    }
    const acc = seasonAccum[key];
    acc.dims.skinLift += round.aiScores.skinLift;
    acc.dims.warmth += round.aiScores.warmth;
    acc.dims.clarity += round.aiScores.clarity;
    acc.dims.harmony += round.aiScores.harmony;
    acc.dims.vibe += round.aiScores.vibe;
    acc.count++;
  }

  for (const key of Object.keys(userScores)) {
    if (seasonAccum[key]) {
      seasonAccum[key].userTotal = userScores[key];
    }
  }

  const results: FinalResult[] = [];
  const hasPhase2 = historicalData.some(r => r.phase === 2);

  for (const [key, acc] of Object.entries(seasonAccum)) {
    const avgDims: DimensionScores = {
      skinLift: acc.dims.skinLift / acc.count,
      warmth: acc.dims.warmth / acc.count,
      clarity: acc.dims.clarity / acc.count,
      harmony: acc.dims.harmony / acc.count,
      vibe: acc.dims.vibe / acc.count,
    };
    const avgSystem = historicalData
      .filter(r => r.seasonKey === key)
      .reduce((s, r) => s + r.systemScore, 0) / acc.count;

    const avgUser = (acc.userTotal / acc.count) / 10;

    let final = avgSystem * 0.65 + avgUser * 0.35;
    if (hasPhase2) final *= 1.2;

    results.push({ key, score: final, dimensions: avgDims });
  }

  return results.sort((a, b) => b.score - a.score);
}

export function getRoundFinalScore(userScore: number, aiScore: number): number {
  const normalizedUser = userScore / 10;
  const normalizedAi = Math.min(aiScore / 10, 1);
  return normalizedUser * 0.4 + normalizedAi * 0.6;
}
