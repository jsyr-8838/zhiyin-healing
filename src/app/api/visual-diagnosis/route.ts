import { NextRequest, NextResponse } from 'next/server';
import {
  DIAGNOSIS_CONFIGS,
  WUXING_MAP,
  imageFileToBase64,
  getApiConfig,
  buildVlMessages,
  callVlApi,
  extractContentFromResponse,
  parseDiagnosisContent,
  generateOfflineVisualResult,
} from '@/lib/visual-diagnosis-shared';

// ===== 统一视觉诊断 API =====
// 支持 tongue(舌诊) / face(面诊) / hand(手诊) 三种诊断类型

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const diagnosisType = (formData.get('type') as string) || 'tongue';
    const userId = formData.get('userId') as string | null;

    if (!imageFile) {
      return NextResponse.json({ error: '请上传照片' }, { status: 400 });
    }

    const validTypes = ['tongue', 'face', 'hand'];
    if (!validTypes.includes(diagnosisType)) {
      return NextResponse.json({ error: '不支持的诊断类型' }, { status: 400 });
    }

    const config = DIAGNOSIS_CONFIGS[diagnosisType];
    if (!config) {
      return NextResponse.json({ error: '诊断配置未找到' }, { status: 500 });
    }

    const { base64: imageBase64, mimeType, buffer: imageBuffer } = await imageFileToBase64(imageFile);

    const { apiKey, apiBase, model, isThinkModel } = getApiConfig();

    console.log(`[visual-diagnosis] type=${diagnosisType}, model=${model}, hasApiKey=${!!apiKey}`);

    if (!apiKey) {
      console.log('[visual-diagnosis] No API key, returning offline result');
      return NextResponse.json(generateOfflineVisualResult(diagnosisType, imageBuffer));
    }

    const messages = buildVlMessages({
      systemPrompt: config.systemPrompt,
      fewShot: config.fewShot,
      userPrompt: config.userPrompt,
      imageBase64,
      mimeType,
      isThinkModel,
    });

    try {
      const response = await callVlApi(messages, apiBase, apiKey, model);

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        console.error(`[${diagnosisType}] VL API error: status=${response.status}, body=${errBody.substring(0, 200)}`);
        return NextResponse.json(generateOfflineVisualResult(diagnosisType, imageBuffer));
      }

      const data = await response.json();
      const content = extractContentFromResponse(data);

      if (!content || content.length < 20) {
        return NextResponse.json(generateOfflineVisualResult(diagnosisType, imageBuffer));
      }

      const result = parseDiagnosisContent(content, config);
      return NextResponse.json(result);
    } catch (err) {
      console.error(`[${diagnosisType}] API error:`, err);
      return NextResponse.json(generateOfflineVisualResult(diagnosisType, imageBuffer));
    }
  } catch (error) {
    console.error('Visual diagnosis error:', error);
    return NextResponse.json({ error: '分析失败，请重试' }, { status: 500 });
  }
}
