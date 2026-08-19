import { NextRequest, NextResponse } from 'next/server';
import {
  TONGUE_FEW_SHOT_SIMPLE,
  TONGUE_SYSTEM_PROMPT_SIMPLE,
  TONGUE_FEW_SHOT_DETAILED,
  DIAGNOSIS_CONFIGS,
  TONGUE_USER_PROMPT_DETAILED,
  WUXING_MAP,
  imageFileToBase64,
  getApiConfig,
  buildVlMessages,
  callVlApi,
  extractContentFromResponse,
  generateOfflineTongueResult,
} from '@/lib/visual-diagnosis-shared';
import { loadPromptWithFallback, PROMPT_IDS } from '@/lib/evo/prompt-loader';

// 舌诊API - 基于Few-shot+VL模型的中医望诊
// 移植自 Traditional_Chinese_Medicine_Agent (releerr)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const userId = formData.get('userId') as string | null;

    if (!imageFile) {
      return NextResponse.json({ error: '请上传舌头照片' }, { status: 400 });
    }

    const { base64: imageBase64, mimeType, buffer: imageBuffer } = await imageFileToBase64(imageFile);

    const { apiKey, apiBase, model, isThinkModel } = getApiConfig();

    if (!apiKey) {
      const offlineResult = generateOfflineTongueResult();
      return NextResponse.json(offlineResult);
    }

    const systemContent = isThinkModel ? '/think' : await loadPromptWithFallback(PROMPT_IDS.TONGUE_ANALYSIS, TONGUE_SYSTEM_PROMPT_SIMPLE);
    const fewShotForApi = isThinkModel ? TONGUE_FEW_SHOT_DETAILED : TONGUE_FEW_SHOT_SIMPLE;
    const userPromptForApi = isThinkModel
      ? TONGUE_USER_PROMPT_DETAILED
      : '请分析这张舌苔图片并描述舌质、舌苔特征，判断证型和体质。';

    const messages = buildVlMessages({
      systemPrompt: systemContent,
      fewShot: fewShotForApi,
      userPrompt: userPromptForApi,
      imageBase64,
      mimeType,
      isThinkModel,
    });

    try {
      const response = await callVlApi(messages, apiBase, apiKey, model);

      if (!response.ok) {
        console.error('VL API error:', response.status);
        const errText = await response.text();
        console.error('VL API error body:', errText);
        return NextResponse.json(generateOfflineTongueResult());
      }

      const data = await response.json();
      let content = extractContentFromResponse(data);

      // Additional extraction for nemotron think model: try reasoning_content with keyword approach
      if ((!content || content.length < 20) && data.choices?.[0]?.message?.reasoning_content) {
        const reasoning = data.choices[0].message.reasoning_content;
        console.log('Using reasoning_content, length:', reasoning.length);
        const keywordIdx = Math.max(
          reasoning.lastIndexOf('舌质'),
          reasoning.lastIndexOf('舌苔'),
          reasoning.lastIndexOf('诊断'),
          reasoning.lastIndexOf('体质')
        );
        if (keywordIdx > 0) {
          content = reasoning.substring(keywordIdx);
        } else {
          content = reasoning;
        }
      }

      if (!content || content.length < 20) {
        console.log('Content too short, falling back to offline mode');
        return NextResponse.json(generateOfflineTongueResult());
      }

      const result = parseTongueResult(content);
      return NextResponse.json(result);
    } catch (err) {
      console.error('Tongue diagnosis API error:', err);
      return NextResponse.json(generateOfflineTongueResult());
    }
  } catch (error) {
    console.error('Tongue diagnosis error:', error);
    return NextResponse.json({ error: '舌诊分析失败，请重试' }, { status: 500 });
  }
}

function extractTongueSection(content: string, label: string): string {
  const patterns = [
    new RegExp(`(?:\\d+\\.\\s*)?${label}[：:\\s]*\\n?([\\s\\S]*?)(?=\\n*\\d+\\.\\s*(?:舌质|舌苔|诊断|对应)|$)`, 'i'),
    new RegExp(`${label}[：:]?\\s*([^\\n]+)`, 'i'),
    new RegExp(`${label}[：:]?\\s*([^\n，；]+)`, 'i'),
  ];
  for (const p of patterns) {
    const m = content.match(p);
    if (m && m[1].trim().length > 2) {
      return m[1].trim().replace(/\*\*/g, '').trim();
    }
  }
  return '';
}

function parseTongueResult(content: string) {
  const tongueBody = extractTongueSection(content, '舌质特征') || extractTongueSection(content, '舌质');
  const tongueCoating = extractTongueSection(content, '舌苔特征') || extractTongueSection(content, '舌苔');
  const diagnosisSection = extractTongueSection(content, '诊断结果') || extractTongueSection(content, '诊断');
  const constitutionSection = extractTongueSection(content, '对应体质') || extractTongueSection(content, '体质');

  let diagnosis = diagnosisSection;
  const diagMatch = diagnosisSection.match(/中医证型[：:]?\s*([^\n]+)/i);
  if (diagMatch) diagnosis = diagMatch[1].trim();
  if (diagnosis.length > 100) diagnosis = diagnosis.substring(0, 100);

  let constitution = constitutionSection;
  const constMatch = constitution.match(/(?:属于|为|是)\s*(\S+?体质)/);
  if (constMatch) constitution = constMatch[1].replace('体质', '');
  else {
    const directMatch = constitution.match(/(\S+?体质)/);
    if (directMatch) constitution = directMatch[1].replace('体质', '');
  }

  let matchedType = '平和';
  for (const type of Object.keys(WUXING_MAP)) {
    if (content.includes(type) || constitution.includes(type)) {
      matchedType = type;
      break;
    }
  }

  const wuxing = WUXING_MAP[matchedType] || WUXING_MAP['平和'];

  return {
    content,
    tongueBody: tongueBody || '未能提取',
    tongueCoating: tongueCoating || '未能提取',
    diagnosis: diagnosis || '未能提取',
    constitution: matchedType,
    element: wuxing.element,
    wuyin: wuxing.wuyin,
    organ: wuxing.organ,
  };
}
