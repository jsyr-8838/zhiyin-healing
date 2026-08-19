/**
 * 离线视觉诊断规则引擎
 * 
 * 核心：通过分析图片的 HSV 色彩直方图，匹配中医望诊规则
 * 不依赖任何 AI API，完全在服务端（Node.js）本地计算
 * 
 * 诊断流程：
 * 1. 将图片缩放到 64x64（降采样加速）
 * 2. RGB → HSV 转换，统计色相/饱和度/明度分布
 * 3. 根据诊断类型（舌/面/手）应用不同的规则权重
 * 4. 输出最匹配的体质类型 + 特征描述
 */

// ===== HSV 色彩空间 =====
interface RGB { r: number; g: number; b: number }
interface HSV { h: number; s: number; v: number }

function rgbToHsv(r: number, g: number, b: number): HSV {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
}

// ===== 色彩区域分类 =====
type ColorZone = 'red' | 'pale' | 'yellow' | 'dark' | 'purple' | 'white' | 'normal';

function classifyColor(h: number, s: number, v: number): ColorZone {
  // 极暗（近黑）
  if (v < 15) return 'dark';
  // 极亮低饱和（近白）
  if (v > 85 && s < 15) return 'white';
  // 低饱和偏白
  if (s < 12) return v > 60 ? 'pale' : 'dark';
  // 红色系 (h: 0-30, 330-360)
  if ((h >= 0 && h < 30) || h >= 330) {
    if (v > 60 && s > 50) return 'red';
    if (v < 40) return 'dark';
    return 'purple'; // 暗红偏紫
  }
  // 橙黄色系 (h: 30-75)
  if (h >= 30 && h < 75) return 'yellow';
  // 绿色系 (h: 75-165)
  if (h >= 75 && h < 165) return 'normal';
  // 青蓝色系 (h: 165-270)
  if (h >= 165 && h < 270) return 'purple';
  // 紫红色系 (h: 270-330)
  if (h >= 270 && h < 330) return 'purple';
  return 'normal';
}

// ===== 色彩直方图分析 =====
interface ColorHistogram {
  red: number;    // 红色占比
  pale: number;   // 淡白占比
  yellow: number; // 黄色占比
  dark: number;   // 暗色占比
  purple: number; // 紫色占比
  white: number;  // 白色占比
  normal: number; // 正常占比
  avgHue: number;
  avgSat: number;
  avgVal: number;
  redness: number; // 红色特征强度
  paleness: number; // 苍白特征强度
  darkness: number; // 暗沉特征强度
  yellowness: number; // 黄腻特征强度
}

function analyzeColors(rgbData: Uint8ClampedArray): ColorHistogram {
  const counts: Record<ColorZone, number> = { red: 0, pale: 0, yellow: 0, dark: 0, purple: 0, white: 0, normal: 0 };
  let totalH = 0, totalS = 0, totalV = 0, count = 0;

  for (let i = 0; i < rgbData.length; i += 4) {
    const r = rgbData[i], g = rgbData[i + 1], b = rgbData[i + 2];
    const hsv = rgbToHsv(r, g, b);
    const zone = classifyColor(hsv.h, hsv.s, hsv.v);
    counts[zone]++;
    totalH += hsv.h;
    totalS += hsv.s;
    totalV += hsv.v;
    count++;
  }

  const total = count || 1;
  return {
    red: counts.red / total,
    pale: counts.pale / total,
    yellow: counts.yellow / total,
    dark: counts.dark / total,
    purple: counts.purple / total,
    white: counts.white / total,
    normal: counts.normal / total,
    avgHue: totalH / total,
    avgSat: totalS / total,
    avgVal: totalV / total,
    redness: (counts.red + counts.purple * 0.5) / total,
    paleness: (counts.pale + counts.white) / total,
    darkness: (counts.dark + counts.purple * 0.3) / total,
    yellowness: counts.yellow / total,
  };
}

// ===== 中医体质匹配规则 =====
interface DiagnosisRule {
  type: string;      // 体质类型
  score: number;     // 基础分
  featureA: string;
  featureB: string;
  diagnosis: string;
}

function matchTongueRules(hist: ColorHistogram): DiagnosisRule[] {
  const rules: DiagnosisRule[] = [];

  // 阳虚：淡白舌，舌体胖嫩
  rules.push({
    type: '阳虚',
    score: hist.paleness * 60 + hist.white * 40 + (hist.avgVal < 50 ? 15 : 0) + (hist.avgSat < 20 ? 10 : 0),
    featureA: '淡白舌，舌体偏胖，色泽偏淡',
    featureB: hist.yellowness > 0.1 ? '白苔偏润略厚' : '白苔，薄润',
    diagnosis: '阳虚体质，阳气不足，温煦失职，见淡白舌为阳虚之象',
  });

  // 阴虚：红舌，少苔
  rules.push({
    type: '阴虚',
    score: hist.redness * 55 + (hist.avgVal > 60 ? 10 : 0) + (hist.avgSat > 40 ? 10 : 0) + hist.pale * (-20),
    featureA: '舌色偏红，舌体偏瘦',
    featureB: '少苔或无苔，舌面偏干',
    diagnosis: '阴虚体质，阴液亏虚，虚热内扰，见红舌为阴虚火旺之象',
  });

  // 气虚：淡红偏淡，齿痕
  rules.push({
    type: '气虚',
    score: hist.paleness * 35 + (hist.avgVal > 40 && hist.avgVal < 65 ? 15 : 0) + (hist.avgSat < 30 ? 15 : 0) + hist.normal * 10,
    featureA: '淡红舌偏淡，舌体略胖有齿痕',
    featureB: '薄白苔',
    diagnosis: '气虚体质，元气不足，脏腑功能衰退，见淡红偏淡舌为气虚之象',
  });

  // 痰湿：白厚腻苔
  rules.push({
    type: '痰湿',
    score: hist.yellowness * 40 + hist.white * 25 + hist.paleness * 15 + (hist.avgSat < 25 ? 10 : 0),
    featureA: '淡白舌，舌体胖大',
    featureB: '白厚腻苔，滑润',
    diagnosis: '痰湿体质，脾虚湿盛，痰浊内蕴，见胖大舌腻苔为痰湿之象',
  });

  // 湿热：红舌+黄腻苔
  rules.push({
    type: '湿热',
    score: hist.redness * 30 + hist.yellowness * 45 + (hist.avgSat > 35 ? 10 : 0) + (hist.avgVal > 55 ? 10 : 0),
    featureA: '红舌，舌尖偏红',
    featureB: '黄腻苔',
    diagnosis: '湿热体质，湿热内蕴，熏蒸肝胆，见红舌黄苔为湿热之象',
  });

  // 血瘀：暗紫舌
  rules.push({
    type: '血瘀',
    score: hist.darkness * 50 + hist.purple * 40 + (hist.avgVal < 45 ? 15 : 0),
    featureA: '暗红舌，有瘀点瘀斑',
    featureB: '薄白苔或薄黄苔',
    diagnosis: '血瘀体质，气滞血瘀，脉络不畅，见暗紫舌为血瘀之象',
  });

  // 气郁：淡暗偏紫
  rules.push({
    type: '气郁',
    score: hist.darkness * 25 + hist.purple * 20 + hist.normal * 15 + (hist.avgSat < 30 ? 10 : 0),
    featureA: '淡红偏暗，舌边偏红',
    featureB: '薄白苔',
    diagnosis: '气郁体质，肝气郁结，气机不畅，见偏暗舌为气郁之象',
  });

  // 平和：淡红润泽
  rules.push({
    type: '平和',
    score: hist.normal * 40 + (hist.avgVal > 50 && hist.avgVal < 75 ? 20 : 0) + (hist.avgSat > 15 && hist.avgSat < 45 ? 15 : 0) + hist.red * 5 - hist.darkness * 20 - hist.paleness * 15,
    featureA: '淡红舌，舌色红润有神',
    featureB: '薄白苔，润泽均匀',
    diagnosis: '舌象正常，阴阳调和，气血充盈，为平和之象',
  });

  return rules;
}

function matchFaceRules(hist: ColorHistogram): DiagnosisRule[] {
  const rules: DiagnosisRule[] = [];

  rules.push({
    type: '阳虚',
    score: hist.paleness * 55 + hist.white * 30 + hist.darkness * 10 + (hist.avgSat < 18 ? 10 : 0),
    featureA: '面色萎黄无光泽，唇色淡白',
    featureB: '目睛无神，面色偏白',
    diagnosis: '脾虚血少，阳气不足，面色萎黄为阳虚血少之象',
  });

  rules.push({
    type: '阴虚',
    score: hist.redness * 50 + (hist.avgVal > 60 ? 10 : 0) - hist.paleness * 25,
    featureA: '面色潮红，两颧发红，唇红干裂',
    featureB: '目睛偏红，面红不均',
    diagnosis: '阴虚火旺，虚火上炎，面色潮红为阴虚之象',
  });

  rules.push({
    type: '气虚',
    score: hist.paleness * 40 + hist.white * 15 + (hist.avgVal > 40 && hist.avgVal < 60 ? 10 : 0),
    featureA: '面色萎黄偏白，少光泽',
    featureB: '眼睑淡白，唇色淡白',
    diagnosis: '气血两虚，脾气亏虚，面色无华为气虚之象',
  });

  rules.push({
    type: '痰湿',
    score: hist.yellowness * 35 + hist.white * 25 + hist.paleness * 15,
    featureA: '面色虚浮微肿，偏油腻',
    featureB: '眼睑微肿，面部臃肿感',
    diagnosis: '痰湿内蕴，脾虚湿盛，面浮为痰湿之象',
  });

  rules.push({
    type: '湿热',
    score: hist.redness * 30 + hist.yellowness * 40 + (hist.avgSat > 35 ? 10 : 0),
    featureA: '面部油腻，偏红赤',
    featureB: '口唇偏红，面垢',
    diagnosis: '湿热内蕴，脾胃湿热，面垢油腻为湿热之象',
  });

  rules.push({
    type: '血瘀',
    score: hist.darkness * 50 + hist.purple * 35,
    featureA: '面色暗沉黧黑，眼眶暗黑',
    featureB: '口唇紫暗，皮肤偏暗',
    diagnosis: '血瘀，气滞血瘀，面色暗沉为血瘀之象',
  });

  rules.push({
    type: '气郁',
    score: hist.darkness * 20 + hist.purple * 25 + (hist.avgSat < 25 ? 10 : 0),
    featureA: '面色青灰无华',
    featureB: '表情抑郁，面色偏暗',
    diagnosis: '气郁，肝气郁结，面色青灰为气郁之象',
  });

  rules.push({
    type: '平和',
    score: hist.normal * 35 + (hist.avgVal > 50 && hist.avgVal < 70 ? 20 : 0) + (hist.avgSat > 15 && hist.avgSat < 40 ? 15 : 0) - hist.darkness * 20 - hist.paleness * 15,
    featureA: '面色红润有光泽',
    featureB: '五官端正，气色良好',
    diagnosis: '气血调和，脾胃健运，面色红润为平和之象',
  });

  return rules;
}

function matchHandRules(hist: ColorHistogram): DiagnosisRule[] {
  const rules: DiagnosisRule[] = [];

  rules.push({
    type: '阳虚',
    score: hist.paleness * 50 + hist.white * 25 + hist.darkness * 10,
    featureA: '掌色苍白偏青，手指偏凉',
    featureB: '掌纹浅淡模糊，月牙小或无',
    diagnosis: '阳虚，寒凝经脉，掌色苍白为阳气不达之象',
  });

  rules.push({
    type: '阴虚',
    score: hist.redness * 50 + (hist.avgVal > 60 ? 10 : 0) - hist.paleness * 20,
    featureA: '掌心潮红发热',
    featureB: '掌纹偏红，主线偏细',
    diagnosis: '阴虚内热，津液不足，掌心红为阴虚之象',
  });

  rules.push({
    type: '气虚',
    score: hist.paleness * 45 + hist.white * 20 + (hist.avgVal > 40 && hist.avgVal < 60 ? 10 : 0),
    featureA: '掌色淡白无血色，掌心凹陷',
    featureB: '掌纹浅淡，月牙小',
    diagnosis: '气血两虚，脾虚血少，掌色淡白为气虚之象',
  });

  rules.push({
    type: '痰湿',
    score: hist.yellowness * 40 + hist.white * 20 + hist.paleness * 15,
    featureA: '掌色黄腻，指缝有湿气',
    featureB: '掌纹深陷，有岛纹',
    diagnosis: '痰湿内蕴，脾虚湿盛，掌色黄腻为痰湿之象',
  });

  rules.push({
    type: '湿热',
    score: hist.redness * 35 + hist.yellowness * 35 + (hist.avgSat > 30 ? 10 : 0),
    featureA: '掌色偏红，指尖发热',
    featureB: '掌纹深红，汗出',
    diagnosis: '湿热内蕴，脾经湿热，掌色红黄为湿热之象',
  });

  rules.push({
    type: '血瘀',
    score: hist.darkness * 45 + hist.purple * 40,
    featureA: '掌色暗紫，指端青紫',
    featureB: '掌纹紫暗，有断裂',
    diagnosis: '血瘀，气滞血瘀，掌色暗紫为血瘀之象',
  });

  rules.push({
    type: '气郁',
    score: hist.darkness * 20 + hist.purple * 25 + (hist.avgSat < 25 ? 10 : 0),
    featureA: '掌色青暗，弹性偏差',
    featureB: '感情线紊乱，多岛纹',
    diagnosis: '气郁，肝气郁结，掌色青暗为气郁之象',
  });

  rules.push({
    type: '平和',
    score: hist.normal * 35 + (hist.avgVal > 50 && hist.avgVal < 70 ? 15 : 0) + (hist.avgSat > 15 && hist.avgSat < 40 ? 15 : 0) - hist.darkness * 15 - hist.paleness * 15,
    featureA: '掌色淡红均匀，掌纹清晰',
    featureB: '弹性良好，月牙清晰',
    diagnosis: '气血调和，脾胃健运，掌色红润为平和之象',
  });

  return rules;
}

// ===== 离线诊断主入口 =====
export interface OfflineDiagnosisResult {
  content: string;
  featureA: string;
  featureB: string;
  diagnosis: string;
  constitution: string;
  element: string;
  wuyin: string;
  organ: string;
  offline: true;
  confidence: number; // 0-1 置信度
}

const WUXING_MAP: Record<string, { element: string; wuyin: string; organ: string }> = {
  '阳虚': { element: '火', wuyin: '徵', organ: '心肾' },
  '阴虚': { element: '水', wuyin: '羽', organ: '肝肾' },
  '气虚': { element: '土', wuyin: '宫', organ: '脾肺' },
  '血瘀': { element: '木', wuyin: '角', organ: '肝' },
  '湿热': { element: '火', wuyin: '徵', organ: '脾胃' },
  '痰湿': { element: '土', wuyin: '宫', organ: '脾' },
  '气郁': { element: '木', wuyin: '角', organ: '肝' },
  '平和': { element: '五行均衡', wuyin: '五音调和', organ: '脏腑调和' },
};

const DIAGNOSIS_LABELS: Record<string, { featureA: string; featureB: string }> = {
  tongue: { featureA: '舌质特征', featureB: '舌苔特征' },
  face: { featureA: '面色特征', featureB: '五官特征' },
  hand: { featureA: '掌色特征', featureB: '掌纹特征' },
};

/**
 * 离线视觉诊断主函数
 * @param rgbData - 图片的 RGBA 像素数据（Uint8ClampedArray）
 * @param diagnosisType - 'tongue' | 'face' | 'hand'
 */
export function offlineVisualDiagnosis(
  rgbData: Uint8ClampedArray,
  diagnosisType: string
): OfflineDiagnosisResult {
  // 1. 色彩分析
  const hist = analyzeColors(rgbData);

  // 2. 匹配规则
  let rules: DiagnosisRule[];
  switch (diagnosisType) {
    case 'face': rules = matchFaceRules(hist); break;
    case 'hand': rules = matchHandRules(hist); break;
    default: rules = matchTongueRules(hist); break;
  }

  // 3. 按分数排序，取最高的
  rules.sort((a, b) => b.score - a.score);
  const best = rules[0];
  const second = rules[1];

  // 4. 计算置信度（与第二名差距越大越确信）
  const maxScore = Math.max(best.score, 0.01);
  const confidence = Math.min(1, (best.score - (second?.score || 0)) / maxScore + 0.3);

  // 5. 根据色彩分析补充动态描述
  const labels = DIAGNOSIS_LABELS[diagnosisType] || DIAGNOSIS_LABELS.tongue;
  const dynamicFeatureA = enrichFeatureA(best.featureA, hist, diagnosisType);

  const wuxing = WUXING_MAP[best.type] || WUXING_MAP['平和'];

  return {
    content: `【${labels.featureA}】${dynamicFeatureA}\n【${labels.featureB}】${best.featureB}\n【诊断结果】${best.diagnosis}\n【对应体质】${best.type}质`,
    featureA: dynamicFeatureA,
    featureB: best.featureB,
    diagnosis: best.diagnosis,
    constitution: best.type,
    element: wuxing.element,
    wuyin: wuxing.wuyin,
    organ: wuxing.organ,
    offline: true,
    confidence: Math.round(confidence * 100) / 100,
  };
}

/** 根据色彩数据丰富特征描述 */
function enrichFeatureA(base: string, hist: ColorHistogram, type: string): string {
  const parts: string[] = [base];

  // 亮度特征
  if (hist.avgVal < 35) parts.push('色泽偏暗');
  else if (hist.avgVal > 70) parts.push('色泽偏亮');

  // 饱和度特征
  if (hist.avgSat < 15) parts.push('色淡少华');
  else if (hist.avgSat > 50) parts.push('色泽偏浓');

  // 红色特征（舌诊特有）
  if (type === 'tongue' && hist.redness > 0.3) parts.push('舌色偏红');
  if (type === 'tongue' && hist.paleness > 0.4) parts.push('舌色偏淡');

  return parts.join('，');
}

/**
 * 快速缩放图片（降采样到 targetSize x targetSize）
 * 返回 RGBA Uint8ClampedArray
 */
export function downsampleImage(
  data: Uint8ClampedArray,
  srcWidth: number,
  srcHeight: number,
  targetSize = 64
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(targetSize * targetSize * 4);
  const xRatio = srcWidth / targetSize;
  const yRatio = srcHeight / targetSize;

  for (let y = 0; y < targetSize; y++) {
    for (let x = 0; x < targetSize; x++) {
      const srcX = Math.floor(x * xRatio);
      const srcY = Math.floor(y * yRatio);
      const srcIdx = (srcY * srcWidth + srcX) * 4;
      const dstIdx = (y * targetSize + x) * 4;
      out[dstIdx] = data[srcIdx];
      out[dstIdx + 1] = data[srcIdx + 1];
      out[dstIdx + 2] = data[srcIdx + 2];
      out[dstIdx + 3] = data[srcIdx + 3];
    }
  }

  return out;
}
