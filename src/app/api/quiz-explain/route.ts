import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const quizExplainSchema = z.object({
  pointName: z.string().min(1, '穴位名称不能为空'),
  correctAnswer: z.string().min(1, '正确答案不能为空'),
  userAnswer: z.string().min(1, '用户答案不能为空'),
  questionType: z.enum(['location', 'indications', 'meridian', 'specialPoint']).default('location'),
});

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = quizExplainSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数验证失败', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { pointName, correctAnswer, userAnswer, questionType } = parsed.data;

    const apiKey = process.env.LLM_API_KEY;
    const apiBase = process.env.LLM_API_BASE || 'https://integrate.api.nvidia.com/v1';
    const model = process.env.LLM_MODEL || 'stepfun-ai/step-3.7-flash';

    if (!apiKey) {
      return NextResponse.json({
        content: generateOfflineExplanation(pointName, correctAnswer, userAnswer, questionType),
      });
    }

    const typeLabel: Record<string, string> = {
      location: '定位',
      indications: '主治',
      meridian: '归属经脉',
      specialPoint: '特定穴类别',
    };

    const systemPrompt = `你是一位资深中医针灸学教授，正在为学生讲解穴位知识。请用简洁明了的方式解释错题，帮助学生理解和记忆。
要求：
1. 先指出正确答案及其关键特征
2. 简要分析学生选错的可能原因
3. 给出1个记忆口诀或辨别技巧
4. 总字数不超过150字`;

    const userMessage = `题目类型：${typeLabel[questionType] || questionType}
穴位：${pointName}
正确答案：${correctAnswer}
学生选择：${userAnswer}
请解释这道题。`;

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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({
        content: generateOfflineExplanation(pointName, correctAnswer, userAnswer, questionType),
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '暂时无法生成解析。';
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Quiz explain API error:', error);
    return NextResponse.json({ content: '解析服务暂时不可用。' });
  }
}

function generateOfflineExplanation(
  pointName: string,
  correctAnswer: string,
  userAnswer: string,
  questionType: string
): string {
  const typeLabel: Record<string, string> = {
    location: '定位',
    indications: '主治',
    meridian: '归经',
    specialPoint: '特定穴',
  };
  return `${pointName}的${typeLabel[questionType] || questionType}应为"${correctAnswer}"，而非"${userAnswer}"。建议结合3D模型加深对该穴位的理解。`;
}
