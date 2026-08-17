import { NextRequest, NextResponse } from 'next/server';
import { getContextForQuestion } from '@/lib/classics-search';
import { classicsAskSchema, validateOrError } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const validated = validateOrError(classicsAskSchema, raw);
    if ('error' in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const { question } = validated.data;

    // 1. 搜索相关典籍内容作为上下文
    const { context, sources } = await getContextForQuestion(question, 6000);

    // 2. 构建系统提示词
    const systemPrompt = `你是"知音"AI智能助读，一个中医五行五音疗愈应用「知音」中的典籍阅读助手。

你的职责：
- 基于玄览典籍库中的内容回答用户的养生、中医、健康问题
- 融汇古今智慧，将古籍中的理论与现代养生实践相结合
- 回答时注明信息来源（书名和章节）
- 如典籍中无直接相关内容，可基于中医知识体系进行补充，但要说明
- 语言亲切自然，通俗易懂

玄览典籍库包含山（仙学）、医（医典）、命（命理）、相（相术）、卜（卜筮）、养（养生）六大类共52部典籍。

以下是检索到的相关典籍内容，请优先基于这些内容回答：

${context || '（未检索到直接相关内容，请基于你的知识回答）'}`;

    // 3. 调用 LLM API
    const apiKey = process.env.LLM_API_KEY;
    const apiBase = process.env.LLM_API_BASE || 'https://integrate.api.nvidia.com/v1';
    const model = process.env.LLM_MODEL || 'stepfun-ai/step-3.7-flash';

    if (!apiKey) {
      return NextResponse.json({ error: 'AI服务未配置' }, { status: 503 });
    }

    const llmResponse = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        max_tokens: 8192,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!llmResponse.ok) {
      const errText = await llmResponse.text();
      console.error('[classics/ask] LLM API error:', llmResponse.status, errText);
      return NextResponse.json({ error: 'AI服务暂时不可用' }, { status: 503 });
    }

    const llmData = await llmResponse.json();
    const answer = llmData.choices?.[0]?.message?.content || '抱歉，未能生成回答。';

    return NextResponse.json({
      answer,
      sources: sources.map(s => ({
        type: s.type,
        bookId: s.bookId,
        bookName: s.bookName,
        chapterTitle: s.chapterTitle,
      })),
    });
  } catch (err) {
    console.error('[classics/ask] Error:', err);
    return NextResponse.json({ error: '请求失败' }, { status: 500 });
  }
}
