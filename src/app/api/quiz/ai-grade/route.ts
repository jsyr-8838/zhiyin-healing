import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const aiGradeSchema = z.object({
  question: z.string().min(1),
  canonicalAnswer: z.string().min(1),
  userAnswer: z.string().min(1, '请输入答案'),
  qType: z.enum(['location', 'indications', 'specialPoint', 'meridian', 'method']),
  pointName: z.string().optional(),
});

interface SubScore {
  accuracy: number;
  coverage: number;
  key_terms: number;
  specificity: number;
  clarity: number;
}

interface GradeResult {
  subscores: SubScore;
  score: number;
  pass: boolean;
  feedback: string;
  model_answer: string;
  incorrect_reason?: string;
}

function calcLocalSimilarity(user: string, canonical: string): number {
  const uChars = new Set(user.replace(/\s/g, ''));
  const cChars = new Set(canonical.replace(/\s/g, ''));
  let overlap = 0;
  for (const ch of uChars) {
    if (cChars.has(ch)) overlap++;
  }
  const union = new Set([...uChars, ...cChars]).size;
  return union > 0 ? overlap / union : 0;
}

function scrubHomophoneTerms(text: string): string {
  return text
    .replace(/同音[词字]?\s*[:：].*?[，。；]/g, '')
    .replace(/拼音\s*[:：].*?[，。；]/g, '')
    .replace(/谐音\s*[:：].*?[，。；]/g, '')
    .trim();
}

function localGrade(userAnswer: string, canonicalAnswer: string, qType: string): GradeResult {
  const similarity = calcLocalSimilarity(userAnswer, canonicalAnswer);
  const score = Math.round(similarity * 100);

  const qTypeWeight: Record<string, number> = {
    location: 0.35,
    indications: 0.30,
    specialPoint: 0.40,
    meridian: 0.50,
    method: 0.30,
  };
  const threshold = qTypeWeight[qType] || 0.35;
  const adjustedScore = Math.min(100, Math.round(score / threshold * 0.8));
  const finalScore = Math.max(0, Math.min(100, adjustedScore));

  return {
    subscores: {
      accuracy: Math.round(similarity * 5),
      coverage: Math.round(similarity * 4.5),
      key_terms: Math.round(similarity * 4),
      specificity: Math.round(similarity * 3.5),
      clarity: Math.round(Math.min(5, (userAnswer.length / 20) * 2.5)),
    },
    score: finalScore,
    pass: finalScore >= 80,
    feedback: finalScore >= 80
      ? '回答基本正确，涵盖了主要要点。'
      : finalScore >= 60
      ? '回答部分正确，但有遗漏或不准确之处。'
      : '回答与标准答案差异较大，建议复习。',
    model_answer: canonicalAnswer,
    incorrect_reason: finalScore < 80 ? '与标准答案的关键内容存在差距' : undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = aiGradeSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数验证失败', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { question, canonicalAnswer, userAnswer, qType, pointName } = parsed.data;

    if (calcLocalSimilarity(userAnswer, canonicalAnswer) >= 0.92) {
      return NextResponse.json({
        subscores: { accuracy: 5, coverage: 5, key_terms: 5, specificity: 5, clarity: 5 },
        score: 100,
        pass: true,
        feedback: '回答完全正确！',
        model_answer: canonicalAnswer,
      });
    }

    const apiKey = process.env.LLM_API_KEY;
    const apiBase = process.env.LLM_API_BASE || 'https://integrate.api.nvidia.com/v1';
    const model = process.env.LLM_MODEL || 'stepfun-ai/step-3.7-flash';

    if (!apiKey) {
      return NextResponse.json(localGrade(userAnswer, canonicalAnswer, qType));
    }

    const systemPrompt = `你是中医针灸测评判卷官。只输出 JSON：{subscores:{accuracy:number,coverage:number,key_terms:number,specificity:number,clarity:number},score:number,pass:boolean,feedback:string,model_answer:string,incorrect_reason?:string}。评分 0~100，≥80 通过。5维度评分(0-5分)：accuracy(40%), coverage(25%), key_terms(15%), specificity(10%), clarity(10%)。总分 = weighted × 20。feedback 中不得提及同音字、拼音、谐音等提示词。`;

    const userMessage = `题目：${question}
${pointName ? `穴位：${pointName}` : ''}
标准答案：${canonicalAnswer}
学生答案：${userAnswer}
题型维度：${qType}

请评分。`;

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
        temperature: 0.0,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      return NextResponse.json(localGrade(userAnswer, canonicalAnswer, qType));
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(localGrade(userAnswer, canonicalAnswer, qType));
    }

    try {
      const result = JSON.parse(content);
      if (typeof result.score === 'number' && result.subscores) {
        result.feedback = scrubHomophoneTerms(result.feedback || '');
        result.score = Math.max(0, Math.min(100, Math.round(result.score)));
        result.pass = result.score >= 80;
        return NextResponse.json(result);
      }
    } catch {}

    return NextResponse.json(localGrade(userAnswer, canonicalAnswer, qType));
  } catch (error) {
    console.error('AI grade API error:', error);
    return NextResponse.json(localGrade('', '', 'location'));
  }
}
