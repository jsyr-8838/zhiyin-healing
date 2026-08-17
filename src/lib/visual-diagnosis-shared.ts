import { offlineVisualDiagnosis, type OfflineDiagnosisResult } from '@/lib/offline-diagnosis';

// ===== Shared Types =====

export interface WuxingEntry {
  element: string;
  wuyin: string;
  organ: string;
}

export interface FewShotExample {
  description: string;
  type: string;
}

export interface DiagnosisConfig {
  label: string;
  fewShot: FewShotExample[];
  systemPrompt: string;
  userPrompt: string;
  featureA: string;
  featureB: string;
}

export interface DiagnosisResult {
  content: string;
  featureA: string;
  featureB: string;
  diagnosis: string;
  constitution: string;
  element: string;
  wuyin: string;
  organ: string;
}

// ===== Wuxing Map (single source of truth) =====

export const WUXING_MAP: Record<string, WuxingEntry> = {
  '阳虚': { element: '火', wuyin: '徵', organ: '心肾' },
  '阴虚': { element: '水', wuyin: '羽', organ: '肝肾' },
  '气虚': { element: '土', wuyin: '宫', organ: '脾肺' },
  '血瘀': { element: '木', wuyin: '角', organ: '肝' },
  '湿热': { element: '火', wuyin: '徵', organ: '脾胃' },
  '痰湿': { element: '土', wuyin: '宫', organ: '脾' },
  '气郁': { element: '木', wuyin: '角', organ: '肝' },
  '平和': { element: '五行均衡', wuyin: '五音调和', organ: '脏腑调和' },
};

// ===== Few-shot Knowledge Bases =====

export const TONGUE_FEW_SHOT_SIMPLE: FewShotExample[] = [
  {
    description: '该舌苔为枯白舌，淡白，几无血色；形状为胖、嫩、轻度齿痕、少量裂纹；苔质为薄、润；苔色为白色。诊断结果为阳虚，气血虚，脾虚；阳虚水停、水湿内蕴。',
    type: '阳虚',
  },
  {
    description: '该舌质为红舌，舌色偏红；形状为偏瘦、有裂纹；苔质为薄、干；苔色为偏黄。诊断结果为阴虚内热，津液亏损；肝肾阴虚。',
    type: '阴虚',
  },
  {
    description: '该舌苔为淡红舌，舌色正常偏淡；形状为适中、有轻度齿痕；苔质为薄白、润；苔色为白色偏厚。诊断结果为气虚，脾虚湿困；脾气亏虚。',
    type: '气虚',
  },
  {
    description: '该舌质为暗红舌，有瘀点；形状为偏胖；苔质为薄、润；苔色为暗紫。诊断结果为血瘀，气滞血瘀；肝郁气滞。',
    type: '血瘀',
  },
  {
    description: '该舌质为红舌，舌尖偏红；形状为偏瘦；苔质为薄、干；苔色为黄。诊断结果为心火旺盛，热证；心火亢盛。',
    type: '湿热',
  },
  {
    description: '该舌苔为淡白舌，舌体胖大；形状为胖嫩、明显齿痕；苔质为厚、滑腻；苔色为白厚。诊断结果为痰湿内蕴，脾虚湿盛；痰湿困脾。',
    type: '痰湿',
  },
  {
    description: '该舌质为淡红偏暗；形状为偏瘦、舌边有瘀斑；苔质为薄白；苔色为正常。诊断结果为气郁，肝气郁结；气机不畅。',
    type: '气郁',
  },
  {
    description: '该舌质为淡红舌，舌色红润有神；形状为适中、无齿痕无裂纹；苔质为薄白、润；苔色为淡白均匀。诊断结果为正常舌象，阴阳调和，气血充盈。',
    type: '平和',
  },
];

export const TONGUE_FEW_SHOT_DETAILED: FewShotExample[] = [
  { description: '舌体整体偏淡白，几无血色；舌形胖嫩，边有轻度齿痕，舌中有浅裂纹；舌尖偏白淡，舌边色淡，舌根苔略厚；舌苔薄白而润，苔色偏白；舌下络脉淡紫，无迂曲；综合为阳虚水停、脾肾阳虚，气血亏虚不能上荣舌体。对应阳虚质。', type: '阳虚' },
  { description: '舌质红，舌色偏红明显，舌尖与舌边尤甚；舌形偏瘦，中央有纵行裂纹；舌边微红为肝胆有热；舌苔薄而干，苔色偏黄；舌下络脉暗紫略粗；综合为阴虚内热，津液亏损，肝肾阴虚，虚火上炎。对应阴虚质。', type: '阴虚' },
  { description: '舌质淡红，舌色正常偏淡；舌形适中，边缘有轻度齿痕；舌尖偏淡为心肺气虚；舌苔薄白偏润，苔色白略厚；舌下络脉淡紫，无异常；综合为脾气亏虚，运化无力，气虚湿困。对应气虚质。', type: '气虚' },
  { description: '舌质暗红，舌面有瘀点散在，舌边可见瘀斑；舌形偏胖；舌尖暗为心肺瘀阻；舌边青紫为肝郁血瘀；舌苔薄润，苔色暗紫；舌下络脉青黑迂曲粗张；综合为气滞血瘀，肝郁气滞，血行不畅。对应血瘀质。', type: '血瘀' },
  { description: '舌质红，舌尖偏红明显为心火亢盛；舌形偏瘦，舌面偏干；舌边红赤为肝胆有热；舌苔薄黄而干，苔色黄；舌下络脉暗红；综合为湿热内蕴，心火亢盛，脾胃湿热上蒸。对应湿热质。', type: '湿热' },
  { description: '舌体胖大，舌色淡白；舌形胖嫩，边缘有明显齿痕；舌中苔厚腻为脾胃湿困；舌苔厚滑腻，苔色白厚；舌下络脉淡紫；综合为痰湿内蕴，脾虚不运，水湿聚为痰饮。对应痰湿质。', type: '痰湿' },
  { description: '舌质淡红偏暗，舌边有瘀斑；舌形偏瘦，舌体略显僵硬；舌边色暗为肝气不舒；舌苔薄白，苔色正常；舌下络脉淡紫略迂曲；综合为肝气郁结，气机不畅，久郁致瘀。对应气郁质。', type: '气郁' },
  { description: '舌质淡红，舌色红润有神；舌形适中，无齿痕无裂纹；舌尖淡红为心肺正常；舌边淡红为肝胆调和；舌苔薄白匀净微润，苔色淡白均匀；舌下络脉淡紫细直，无迂曲；综合为正常舌象，阴阳调和，气血充盈，脏腑各安其位。对应平和质。', type: '平和' },
];

export const FACE_FEW_SHOT: FewShotExample[] = [
  { description: '面色萎黄无光泽，眼眶暗淡，唇色淡白，发质干枯。诊断为脾虚血少，气血不足；面色萎黄多见于脾胃虚弱。', type: '气虚' },
  { description: '面色㿠白或苍白，面部浮肿，眼睑淡白，唇色淡。诊断为阳虚，气血亏虚，寒湿内盛。', type: '阳虚' },
  { description: '面色潮红，两颧发红，唇红干裂，目睛红赤。诊断为阴虚火旺，虚火上炎；肝肾阴虚。', type: '阴虚' },
  { description: '面色暗沉黧黑，眼眶暗黑，口唇紫暗，皮肤粗糙。诊断为血瘀，肾阳虚；气滞血瘀，肾虚血瘀。', type: '血瘀' },
  { description: '面部油腻光亮，痘痘频发，口唇偏红，目眵多。诊断为湿热内蕴，脾胃湿热；湿邪上泛。', type: '湿热' },
  { description: '面色虚浮微肿，眼睑微肿，面部臃肿感。诊断为痰湿内蕴，脾虚不运；水湿泛溢。', type: '痰湿' },
  { description: '面色青灰无华，眉间青筋显露，表情抑郁。诊断为气郁，肝气郁结；气机不畅。', type: '气郁' },
];

export const HAND_FEW_SHOT: FewShotExample[] = [
  { description: '掌色淡白无血色，掌心凹陷，指甲淡白薄脆。诊断为气血两虚，脾虚血少；面色萎黄。', type: '气虚' },
  { description: '掌色苍白偏青，手指冰凉，掌心冷汗。诊断为阳虚，寒凝经脉；阳气不达四肢。', type: '阳虚' },
  { description: '掌心潮红发热，手指干燥，掌纹深红。诊断为阴虚内热，津液不足；五心烦热。', type: '阴虚' },
  { description: '掌色暗紫，指端青紫，掌纹紫暗。诊断为血瘀，气滞血瘀；络脉瘀阻。', type: '血瘀' },
  { description: '掌色黄腻，掌纹深陷，指缝有湿气。诊断为痰湿内蕴，脾虚湿盛；湿邪壅滞。', type: '痰湿' },
  { description: '掌色偏红，指尖发热，掌心汗出。诊断为湿热内蕴，脾经湿热；阴虚有热。', type: '湿热' },
  { description: '掌色淡红均匀，掌纹清晰，弹性良好。诊断为气血调和，脾胃健运；脏腑协调。', type: '平和' },
];

// ===== Shared Prompt Building =====

export const TONGUE_SYSTEM_PROMPT_SIMPLE = `你是一名专业的中医望诊专家，你能够专业的分析病人的舌苔图片并描述舌质和舌苔特征。

请按以下格式输出分析结果：
1. 舌质特征：描述舌色（淡白/淡红/红/绛红/暗红/青紫）、舌形（胖/瘦/适中/齿痕/裂纹/芒刺）、舌态（灵活/僵硬/颤动/歪斜）
2. 舡苔特征：描述苔质（薄/厚/润/燥/腻/腐/剥）、苔色（白色/黄色/灰黑色）
3. 诊断结果：综合判断中医证型（如阳虚/阴虚/气虚/痰湿/湿热/血瘀/气郁/平和等），说明主要病机
4. 对应体质：判断属于九种体质中的哪一种

如下述这些例子所示：`;

export const TONGUE_USER_PROMPT_DETAILED = `你是一名资深中医舌诊专家，拥有30年临床经验。请对用户上传的舌象照片进行专业分析。

【重要】首先确认照片中是否可见舌头。如果照片中无舌头或无法辨识，请直接回复"未能识别舌象"。

分析步骤（严格按此顺序）：

一、舌体定位与整体印象
- 确认舌体在画面中的位置与完整度
- 判断拍摄条件：光照是否自然充足、舌色是否因色温偏移失真（偏蓝/偏黄），如有请在后续分析中校正

二、舌质分析（舌体本体）
1. 舌色：淡白 / 淡红（正常） / 红 / 绛红 / 暗红 / 青紫 — 注意区分舌尖、舌边、舌根的色差
2. 舌形：胖大 / 瘦薄 / 适中 / 齿痕（程度：轻度/明显） / 裂纹（位置：中央/两侧/全舌） / 芒刺
3. 舌态：灵活 / 僵硬 / 颤动 / 歪斜 / 短缩
4. 舌下络脉：若可见舌底，观察络脉颜色（淡紫/暗紫/青黑）与形态（粗张/迂曲/正常）

三、舌苔分析
1. 苔质：薄 / 厚 / 润 / 燥 / 腻 / 腐 / 剥（地图舌） / 无苔（镜面舌）
2. 苔色：白色 / 微黄 / 深黄 / 灰黑 — 注意是否均匀分布
3. 苔之分布：全舌 / 仅舌根 / 仅舌中 / 偏侧

四、分区辨证（中医舌诊核心）
- 舌尖 → 心肺：红赤为心火，淡白为心肺气虚
- 舌边 → 肝胆：红赤为肝火，青紫为肝郁血瘀，淡白为肝血不足
- 舌中 → 脾胃：厚腻为脾胃湿滞，剥落为胃阴亏损
- 舌根 → 肾：腻苔为肾湿，无苔为肾阴亏

五、综合诊断
1. 中医证型：阳虚/阴虚/气虚/痰湿/湿热/血瘀/气郁/平和（必须选一个最接近的）
2. 主要病机：用一句话概括核心病机
3. 兼夹证：如有次要证型一并说明

六、对应体质：属于九种体质中的哪一种`;

export const FACE_USER_PROMPT = `你是一名资深中医面诊专家，拥有30年临床经验。请对用户上传的面部照片进行专业分析。

【重要】首先确认照片中是否可见面部。如果无法辨识面部，请直接回复"未能识别面象"。

分析步骤（严格按此顺序）：

一、面部整体印象
- 确认面部在画面中的位置与完整度
- 判断拍摄条件：光照是否自然、是否化妆

二、面色分析
1. 面色：萎黄 / 㿠白 / 潮红 / 黧黑 / 青灰 / 红润正常
2. 光泽度：有泽（明润） / 少泽 / 无泽（枯槁） — 五色之欲不欲，以明润为贵
3. 面色分布：是否均匀，两颧是否突出，额部与面下差异

三、五官特征
1. 眼睛：目光有神/无神、白睛颜色（红赤/淡白/黄染）、眼睑（浮肿/下垂/正常）
2. 嘴唇：唇色（淡白/深红/青紫/正常）、润燥
3. 鼻部：鼻翼颜色、山根青筋
4. 面部特殊体征：痤疮/色斑/浮肿/皱纹异常

四、五色主病（中医面诊核心）
- 青色 → 肝：寒证/痛证/瘀血/惊风
- 赤色 → 心：热证/实热/虚热
- 黄色 → 脾：湿证/虚证（萎黄为血虚，黄胖为湿盛）
- 白色 → 肺：寒证/虚证/脱血
- 黑色 → 肾：肾虚/水饮/寒证

五、综合诊断
1. 中医证型：阳虚/阴虚/气虚/痰湿/湿热/血瘀/气郁/平和（必须选一个最接近的）
2. 主要病机
3. 兼夹证

六、对应体质：属于九种体质中的哪一种`;

export const HAND_USER_PROMPT = `你是一名资深中医手诊专家，拥有30年临床经验。请对用户上传的手掌照片进行专业分析。

【重要】首先确认照片中是否可见手掌。如果无法辨识手掌，请直接回复"未能识别手象"。

分析步骤（严格按此顺序）：

一、手掌整体印象
- 确认手掌在画面中的位置与完整度
- 判断拍摄条件：光线是否自然、手指是否全部露出

二、掌色分析
1. 掌心颜色：淡白 / 淡红 / 鲜红 / 暗红 / 青紫 / 黄染
2. 掌心温度感：偏凉 / 偏热 / 潮热 / 正常
3. 掌心饱满度：丰满 / 干瘪 / 凹陷 / 正常
4. 大小鱼际：颜色差异、有无红赤（肝掌征）

三、掌纹特征
1. 主线：生命线/智慧线/感情线 — 深浅、清晰度、有无断裂/分叉
2. 特殊纹路：岛纹/十字纹/星纹/链状纹 — 位置与意义
3. 掌纹颜色：淡白/粉红/暗紫 — 反映气血状态

四、指甲特征
1. 甲色：淡白 / 粉红 / 暗紫 / 青灰
2. 甲形：厚薄、有无纵纹/横纹、月牙比例
3. 甲质：脆裂/软薄/坚韧

五、手诊五色主病
- 掌红 → 心火/血热；掌白 → 气血亏虚；掌黄 → 湿热/脾虚
- 掌青 → 寒证/痛证/肝郁；掌紫 → 血瘀/气滞

六、综合诊断
1. 中医证型：阳虚/阴虚/气虚/痰湿/湿热/血瘀/气郁/平和（必须选一个最接近的）
2. 主要病机
3. 兼夹证

七、对应体质：属于九种体质中的哪一种`;

// ===== Diagnosis Config Registry =====

export const DIAGNOSIS_CONFIGS: Record<string, DiagnosisConfig> = {
  tongue: {
    label: '舌诊',
    fewShot: TONGUE_FEW_SHOT_DETAILED,
    systemPrompt: '/think',
    userPrompt: TONGUE_USER_PROMPT_DETAILED,
    featureA: '舌质特征',
    featureB: '舌苔特征',
  },
  face: {
    label: '面诊',
    fewShot: FACE_FEW_SHOT,
    systemPrompt: '/think',
    userPrompt: FACE_USER_PROMPT,
    featureA: '面色特征',
    featureB: '五官特征',
  },
  hand: {
    label: '手诊',
    fewShot: HAND_FEW_SHOT,
    systemPrompt: '/think',
    userPrompt: HAND_USER_PROMPT,
    featureA: '掌色特征',
    featureB: '掌纹特征',
  },
};

// ===== Shared Image Utilities =====

export async function imageFileToBase64(imageFile: File): Promise<{ base64: string; mimeType: string; buffer: Buffer }> {
  const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
  const imageBase64 = imageBuffer.toString('base64');
  const mimeType = imageFile.type || 'image/jpeg';
  return { base64: imageBase64, mimeType, buffer: imageBuffer };
}

// ===== Shared Feature Extraction =====

const LABEL_VARIANTS: Record<string, string[]> = {
  '舌质特征': ['舌质特征', '舌质分析', '舌质', '舌体特征', '舌体分析'],
  '舌苔特征': ['舌苔特征', '舌苔分析', '舌苔'],
  '面色特征': ['面色特征', '面色分析', '面色'],
  '五官特征': ['五官特征', '五官分析', '五官'],
  '掌色特征': ['掌色特征', '掌色分析', '掌色', '掌心颜色'],
  '掌纹特征': ['掌纹特征', '掌纹分析', '掌纹', '指甲特征'],
  '诊断结果': ['诊断结果', '综合诊断', '中医证型', '诊断'],
  '对应体质': ['对应体质', '体质', '体质类型'],
};

function extractSection(content: string, label: string): string {
  const variants = LABEL_VARIANTS[label] || [label];

  for (const variant of variants) {
    const patterns = [
      new RegExp(`(?:\\d+[、.]\\s*)?${variant}[：:\\s]*\\n?([\\s\\S]*?)(?=\\n*(?:\\d+[、.]\\s*)?(?:\\S+(?:特征|分析|诊断|体质|分区|兼夹|对应|综合))|$)`, 'i'),
      new RegExp(`${variant}[：:]?\\s*([^\\n]+)`, 'i'),
      new RegExp(`${variant}[：:]?\\s*([^\n，；]+)`, 'i'),
    ];
    for (const p of patterns) {
      const m = content.match(p);
      if (m && m[1].trim().length > 2) {
        let result = m[1].trim().replace(/\*\*/g, '').trim();
        result = result.replace(/^[。，、；：\s]+/, '');
        result = result.replace(/^(方面|来说|如下|是)[，,：:\s]*/i, '');
        return result;
      }
    }
  }
  return '';
}

export function extractFeatures(content: string, featureALabel: string, featureBLabel: string) {
  const featureA = extractSection(content, featureALabel);
  const featureB = extractSection(content, featureBLabel);
  return { featureA, featureB };
}

export function extractDiagnosis(content: string): string {
  const diagnosisSection = extractSection(content, '诊断结果');
  let diagnosis = diagnosisSection;

  const diagMatch = diagnosisSection.match(/中医证型[：:]?\s*([^\n;；]+)/i);
  if (diagMatch) diagnosis = diagMatch[1].trim();

  if (!diagnosis || diagnosis === '未能提取') {
    const directDiag = content.match(/中医证型[：:]?\s*([^\n;；]+)/i);
    if (directDiag) diagnosis = directDiag[1].trim();
  }

  if (!diagnosis || diagnosis === '未能提取') {
    const bingjiMatch = content.match(/主要病机[：:]?\s*([^\n;；]+)/i);
    if (bingjiMatch) diagnosis = bingjiMatch[1].trim();
  }

  const compMatch = content.match(/兼夹证[：:]?\s*([^\n]+)/i);
  if (compMatch && diagnosis) {
    const compText = compMatch[1].trim();
    if (compText && !/^(无|没有|不明显|—|-)$/.test(compText)) {
      diagnosis += '；兼 ' + compText;
    }
  }

  if (diagnosis.length > 150) diagnosis = diagnosis.substring(0, 150);
  return diagnosis || '未能提取';
}

export function extractConstitution(content: string): string {
  let constitution = extractSection(content, '对应体质');

  const constMatch = constitution.match(/(?:属于|为|是)\s*(\S+?体质)/);
  if (constMatch) constitution = constMatch[1].replace('体质', '');
  else {
    const directMatch = constitution.match(/(\S+?体质)/);
    if (directMatch) constitution = directMatch[1].replace('体质', '');
  }

  if (!constitution || constitution === '未能提取') {
    const directConst = content.match(/对应体质[：:]?\s*(\S+质)/i);
    if (directConst) constitution = directConst[1].replace('体质', '');
  }

  return constitution;
}

export function matchConstitutionType(content: string, constitution: string): string {
  let matchedType = '平和';

  if (constitution && constitution !== '未能提取' && constitution !== '未知') {
    for (const type of Object.keys(WUXING_MAP)) {
      if (constitution.includes(type)) {
        matchedType = type;
        break;
      }
    }
  }

  if (matchedType === '平和') {
    const explicitMatch = content.match(/对应体质[：:]?\s*(\S+质)/i);
    if (explicitMatch) {
      for (const type of Object.keys(WUXING_MAP)) {
        if (explicitMatch[1].includes(type)) {
          matchedType = type;
          break;
        }
      }
    }
  }

  if (matchedType === '平和') {
    for (const type of Object.keys(WUXING_MAP)) {
      if (content.includes(type)) {
        matchedType = type;
        break;
      }
    }
  }

  return matchedType;
}

export function buildDiagnosisResult(
  content: string,
  featureA: string,
  featureB: string,
  diagnosis: string,
  constitution: string,
): DiagnosisResult {
  const wuxing = WUXING_MAP[constitution] || WUXING_MAP['平和'];
  return {
    content,
    featureA: featureA || '未能提取',
    featureB: featureB || '未能提取',
    diagnosis: diagnosis || '未能提取',
    constitution,
    element: wuxing.element,
    wuyin: wuxing.wuyin,
    organ: wuxing.organ,
  };
}

export function parseDiagnosisContent(content: string, config: DiagnosisConfig): DiagnosisResult {
  const { featureA, featureB } = extractFeatures(content, config.featureA, config.featureB);
  const diagnosis = extractDiagnosis(content);
  const constitutionRaw = extractConstitution(content);
  const constitution = matchConstitutionType(content, constitutionRaw);
  return buildDiagnosisResult(content, featureA, featureB, diagnosis, constitution);
}

// ===== Shared VL Model API Call =====

export interface VlApiOptions {
  systemPrompt: string;
  fewShot: FewShotExample[];
  userPrompt: string;
  imageBase64: string;
  mimeType: string;
  isThinkModel: boolean;
}

interface VlMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | VlContentPart[];
}

interface VlContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string };
}

export function buildVlMessages(options: VlApiOptions): VlMessage[] {
  const { systemPrompt, fewShot, userPrompt, imageBase64, mimeType, isThinkModel } = options;
  const fewShotStr = fewShot.map((ex, i) => `示例${i + 1}：${ex.description}`).join('\n\n');

  const messages: VlMessage[] = [
    { role: 'system', content: systemPrompt },
  ];

  if (!isThinkModel) {
    messages.push(
      { role: 'user', content: `以下是几个专业分析示例：\n\n${fewShotStr}\n\n现在请分析用户上传的照片。` },
      { role: 'assistant', content: '好的，我已了解分析格式。请提供照片。' },
    );
  }

  messages.push({
    role: 'user',
    content: [
      {
        type: 'text',
        text: isThinkModel
          ? `${userPrompt}\n\n参考示例：${fewShotStr}`
          : userPrompt,
      },
      { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
    ],
  });

  return messages;
}

export function getApiConfig() {
  const apiKey = process.env.LLM_API_KEY;
  const apiBase = process.env.LLM_API_BASE || 'https://integrate.api.nvidia.com/v1';
  const model = process.env.VISION_MODEL || process.env.LLM_MODEL || 'stepfun-ai/step-3.7-flash';
  const isThinkModel = model.includes('nemotron');
  return { apiKey, apiBase, model, isThinkModel };
}

export async function callVlApi(messages: VlMessage[], apiBase: string, apiKey: string, model: string) {
  return fetch(`${apiBase}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 4096,
      temperature: 0.3,
    }),
  });
}

interface VlApiChoice {
  message?: {
    content?: string;
    reasoning_content?: string;
  };
}

interface VlApiResponse {
  choices?: VlApiChoice[];
}

export function extractContentFromResponse(data: VlApiResponse): string {
  let content = data.choices?.[0]?.message?.content || '';

  if ((!content || content.length < 20) && data.choices?.[0]?.message?.reasoning_content) {
    const reasoning = data.choices[0].message.reasoning_content;
    const sectionHeaders = ['舌质', '舌苔', '面色', '掌色', '诊断', '体质', '对应'];
    let startIdx = reasoning.length;
    for (const header of sectionHeaders) {
      const idx = reasoning.lastIndexOf(header);
      if (idx > 0) {
        const lineStart = reasoning.lastIndexOf('\n', idx - 1) + 1;
        if (lineStart < startIdx) startIdx = lineStart;
      }
    }
    const minStart = Math.floor(reasoning.length * 0.2);
    content = reasoning.substring(Math.min(startIdx, minStart));
  }

  return content;
}

// ===== Shared Offline Fallback =====

export function generateOfflineVisualResult(diagnosisType: string, imageBuffer?: Buffer): DiagnosisResult & { offline?: boolean; confidence?: number } {
  if (imageBuffer && imageBuffer.length > 0) {
    try {
      const pixels = extractPixelsFromImage(imageBuffer);
      if (pixels) {
        return offlineVisualDiagnosis(pixels.data, diagnosisType) as DiagnosisResult & { offline?: boolean; confidence?: number };
      }
    } catch (err) {
      console.error('[offline-diagnosis] Image analysis failed, using fallback:', err);
    }
  }

  return {
    content: '【特征】无法分析（未提供图片）\n【诊断】请上传照片以获取分析结果',
    featureA: '未提供图片',
    featureB: '未提供图片',
    diagnosis: '请上传照片以获取分析结果',
    constitution: '平和',
    element: '五行均衡',
    wuyin: '五音调和',
    organ: '脏腑调和',
    offline: true,
    confidence: 0,
  };
}

function extractPixelsFromImage(buffer: Buffer): { data: Uint8ClampedArray; width: number; height: number } | null {
  const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50;
  const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8;
  const isWebP = buffer[8] === 0x57 && buffer[9] === 0x45;

  if (!isPNG && !isJPEG && !isWebP) return null;

  const size = 32;
  const data = new Uint8ClampedArray(size * size * 4);
  const headerSkip = buffer[0] === 0x89 ? 30 : (buffer[1] === 0xD8 ? 20 : 16);
  const step = Math.max(1, Math.floor((buffer.length - headerSkip) / (size * size * 3)));

  for (let i = 0; i < size * size; i++) {
    const offset = headerSkip + i * step * 3;
    if (offset + 2 < buffer.length) {
      data[i * 4] = buffer[offset];
      data[i * 4 + 1] = buffer[offset + 1];
      data[i * 4 + 2] = buffer[offset + 2];
      data[i * 4 + 3] = 255;
    } else {
      data[i * 4] = 128;
      data[i * 4 + 1] = 128;
      data[i * 4 + 2] = 128;
      data[i * 4 + 3] = 255;
    }
  }

  return { data, width: size, height: size };
}

// ===== Tongue-specific Offline Fallback (for backward compat with tongue-diagnosis route) =====

const OFFLINE_TONGUE_TEMPLATES: Record<string, Omit<DiagnosisResult, 'content'> & { offline?: boolean }> = {
  '阳虚': {
    featureA: '淡白舌，舌体胖嫩，有齿痕',
    featureB: '白苔，薄润',
    diagnosis: '阳虚体质，阳气不足，温煦失职',
    constitution: '阳虚',
    element: '火',
    wuyin: '徵',
    organ: '心肾',
  },
  '阴虚': {
    featureA: '红舌，舌体偏瘦，有裂纹',
    featureB: '少苔或无苔，舌面偏干',
    diagnosis: '阴虚体质，阴液亏虚，虚热内扰',
    constitution: '阴虚',
    element: '水',
    wuyin: '羽',
    organ: '肝肾',
  },
  '气虚': {
    featureA: '淡红舌偏淡，舌体有齿痕',
    featureB: '薄白苔',
    diagnosis: '气虚体质，元气不足，脏腑功能衰退',
    constitution: '气虚',
    element: '土',
    wuyin: '宫',
    organ: '脾肺',
  },
  '痰湿': {
    featureA: '淡白舌，舌体胖大',
    featureB: '白厚腻苔，滑润',
    diagnosis: '痰湿体质，脾虚湿盛，痰浊内蕴',
    constitution: '痰湿',
    element: '土',
    wuyin: '宫',
    organ: '脾',
  },
  '湿热': {
    featureA: '红舌，舌尖偏红',
    featureB: '黄腻苔',
    diagnosis: '湿热体质，湿热内蕴，熏蒸肝胆',
    constitution: '湿热',
    element: '火',
    wuyin: '徵',
    organ: '脾胃',
  },
  '血瘀': {
    featureA: '暗红舌，有瘀点瘀斑',
    featureB: '薄白苔或薄黄苔',
    diagnosis: '血瘀体质，气滞血瘀，脉络不畅',
    constitution: '血瘀',
    element: '木',
    wuyin: '角',
    organ: '肝',
  },
  '气郁': {
    featureA: '淡红偏暗，舌边偏红',
    featureB: '薄白苔',
    diagnosis: '气郁体质，肝气郁结，气机不畅',
    constitution: '气郁',
    element: '木',
    wuyin: '角',
    organ: '肝',
  },
};

export function generateOfflineTongueResult(): DiagnosisResult & { offline?: boolean } {
  const types = ['阳虚', '阴虚', '气虚', '痰湿', '湿热', '血瘀', '气郁'];
  const randomType = types[Math.floor(Math.random() * types.length)];
  const result = OFFLINE_TONGUE_TEMPLATES[randomType]!;
  return {
    content: `【舌质特征】${result.featureA}\n【舌苔特征】${result.featureB}\n【诊断结果】${result.diagnosis}\n【对应体质】${result.constitution}质`,
    ...result,
    offline: true,
  };
}
