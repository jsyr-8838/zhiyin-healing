import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const aiQuestionSchema = z.object({
  meridianCode: z.string().optional(),
  qType: z.enum(['location', 'indications', 'specialPoint', 'meridian', 'method']).default('location'),
  pointName: z.string().optional(),
  pointData: z.string().optional(),
});

const Q_TYPE_LABELS: Record<string, string> = {
  location: '定位',
  indications: '主治',
  specialPoint: '特定穴类别',
  meridian: '归经',
  method: '取穴方法',
};

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = aiQuestionSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数验证失败', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { meridianCode, qType, pointName, pointData } = parsed.data;

    const apiKey = process.env.LLM_API_KEY;
    const apiBase = process.env.LLM_API_BASE || 'https://integrate.api.nvidia.com/v1';
    const model = process.env.LLM_MODEL || 'stepfun-ai/step-3.7-flash';

    if (!apiKey) {
      return NextResponse.json(generateOfflineQuestion(meridianCode, qType, pointName, pointData));
    }

    const typeLabel = Q_TYPE_LABELS[qType] || qType;

    const systemPrompt = `你是中医针灸测评出题官。请严格按指定维度(forced_q_type)出题：仅输出 JSON：{"question":string,"canonical_answer":string,"q_type":string}；其中 q_type 必须等于 forced_q_type。题目需包含穴位名与维度。答案以题库原文为准，可以做必要整合，但不得凭空加入未提供信息。`;

    let userMessage = `forced_q_type: ${qType} (${typeLabel})`;
    if (meridianCode) userMessage += `\n经脉代码: ${meridianCode}`;
    if (pointName) userMessage += `\n穴位: ${pointName}`;
    if (pointData) userMessage += `\n参考数据: ${pointData}`;
    userMessage += `\n请为上述穴位出1道${typeLabel}维度的问答题（非选择题）。`;

    const response = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 8192,
        temperature: 0.35,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      return NextResponse.json(generateOfflineQuestion(meridianCode, qType, pointName, pointData));
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(generateOfflineQuestion(meridianCode, qType, pointName, pointData));
    }

    try {
      const parsed = JSON.parse(content);
      if (parsed.question && parsed.canonical_answer && parsed.q_type) {
        return NextResponse.json(parsed);
      }
    } catch {}

    return NextResponse.json(generateOfflineQuestion(meridianCode, qType, pointName, pointData));
  } catch (error) {
    console.error('AI question API error:', error);
    return NextResponse.json(generateOfflineQuestion(undefined, 'location', undefined, undefined));
  }
}

function generateOfflineQuestion(
  meridianCode: string | undefined,
  qType: string,
  pointName: string | undefined,
  pointData: string | undefined,
): { question: string; canonical_answer: string; q_type: string } {
  const typeLabel = Q_TYPE_LABELS[qType] || qType;
  const name = pointName || '合谷';
  const data = pointData || '大肠经原穴，定位：手背第1、2掌骨间，当第2掌骨桡侧的中点处';

  const templates: Record<string, { q: string; a: string }> = {
    location: {
      q: `请描述「${name}」的定位。`,
      a: data,
    },
    indications: {
      q: `请列举「${name}」的主治功效。`,
      a: data,
    },
    specialPoint: {
      q: `「${name}」属于哪类特定穴？`,
      a: data,
    },
    meridian: {
      q: `「${name}」归属于哪条经脉？`,
      a: data,
    },
    method: {
      q: `请描述「${name}」的取穴方法。`,
      a: data,
    },
  };

  const tmpl = templates[qType] || templates.location;
  return {
    question: tmpl.q,
    canonical_answer: tmpl.a,
    q_type: qType,
  };
}
