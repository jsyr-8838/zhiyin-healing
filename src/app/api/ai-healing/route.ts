import { NextRequest, NextResponse } from 'next/server';
import { buildEmotionalPrompt } from '@/lib/emotional-prompt';
import { httpsStreamPost } from '@/lib/https-stream';
import { aiHealingSchema, validateOrError } from '@/lib/validators';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AiHealingRequest {
  userId?: string;
  constitution?: string;
  element?: string;
  wuyin?: string;
  organ?: string;
  completedModules?: string[];
  message: string;
  context?: 'healing' | 'guasha' | 'tuina' | 'general' | 'emotional';
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

function buildSystemPrompt(data: AiHealingRequest): string {
  // 情绪陪伴模式使用专属提示词
  if (data.context === 'emotional') {
    return buildEmotionalPrompt({
      constitution: data.constitution,
      element: data.element,
      wuyin: data.wuyin,
      organ: data.organ,
      completedModules: data.completedModules,
    });
  }

  const contextLabel: Record<string, string> = {
    healing: '疗愈方案',
    guasha: '刮痧疗法',
    tuina: '推拿疗法',
    general: '中医咨询',
  };
  const contextName = contextLabel[data.context || 'general'] || '中医咨询';

  let prompt = `你是经验丰富的中医师，精通五音疗愈、灸疗、刮痧、推拿、六字诀、脉轮、颂钵等传统疗愈方法，深研《黄帝内经》《伤寒论》《针灸甲乙经》等经典。

核心能力：辨证论治、五行归经（五音五色五味五志配脏腑）、疗法组合、饮食调养、情志调摄、子午流注养生。

当前场景：${contextName}

输出规范：
- 辨证分析→病机阐释→疗法选择（含操作步骤）→饮食建议→作息建议→情志调摄→注意事项
- 引用经典标注出处，灸疗注明穴位/灸量/疗程，刮痧注明部位/方向/力度/禁忌，推拿注明手法/穴位/要领
- 六字诀注明对应脏腑和呼吸要领，五音注明音阶/曲目/聆听时段
- 不可遗漏禁忌（孕妇、出血性疾病、皮肤破损等）

语气：温和专业如医者关怀，通俗易懂。`;

  if (data.constitution || data.element || data.wuyin || data.organ) {
    prompt += `\n\n当前用户辨证数据：`;

    if (data.constitution) {
      prompt += `\n- 体质类型：${data.constitution}`;
      const constitutionAdvice: Record<string, string> = {
        平和质: '先天禀赋良好，后天调养得当，保持现状，注意四时养生',
        气虚质: '元气不足，宜补气健脾，忌过劳耗气，灸疗首选足三里、气海、关元',
        阳虚质: '阳气不足，宜温阳散寒，忌生冷寒凉，灸疗首选命门、肾俞、神阙',
        阴虚质: '阴液亏少，宜滋阴降火，忌辛温燥热，不宜重灸，宜轻刮、推拿',
        痰湿质: '痰湿凝聚，宜健脾化痰，忌肥甘厚味，刮痧首选背俞穴、丰隆',
        湿热质: '湿热内蕴，宜清热化湿，忌辛辣油腻，刮痧泄热为主，忌温灸',
        血瘀质: '血行不畅，宜活血化瘀，刮痧首选，配合艾灸温通经络',
        气郁质: '气机郁滞，宜疏肝解郁，六字诀"嘘"字诀最佳，五音选角音',
        特禀质: '先天禀赋异常，宜调和气血，增强体质，注意过敏源规避',
      };
      if (constitutionAdvice[data.constitution]) {
        prompt += `（${constitutionAdvice[data.constitution]}）`;
      }
    }

    if (data.element) {
      prompt += `\n- 五行归属：${data.element}`;
      const elementOrgans: Record<string, string> = {
        木: '肝胆系统，主疏泄、主藏血，在志为怒，在音为角，在味为酸，在色为青',
        火: '心小肠系统，主血脉、主神明，在志为喜，在音为徵，在味为苦，在色为赤',
        土: '脾胃系统，主运化、主统血，在志为思，在音为宫，在味为甘，在色为黄',
        金: '肺大肠系统，主气、主皮毛，在志为悲，在音为商，在味为辛，在色为白',
        水: '肾膀胱系统，主水、主纳气，在志为恐，在音为羽，在味为咸，在色为黑',
      };
      if (elementOrgans[data.element]) {
        prompt += `（${elementOrgans[data.element]}）`;
      }
    }

    if (data.wuyin) {
      prompt += `\n- 五音归属：${data.wuyin}`;
    }

    if (data.organ) {
      prompt += `\n- 脏腑归属：${data.organ}`;
    }

    if (data.completedModules && data.completedModules.length > 0) {
      prompt += `\n- 已完成诊断：${data.completedModules.join('、')}`;
    }

    prompt += `\n\n请基于以上辨证数据，为用户量身定制疗愈方案。方案须与体质、五行、脏腑归属精准对应，体现"因人制宜"的中医核心思想。`;
  }

  return prompt;
}

export async function POST(req: NextRequest) {
  console.log('[ai-healing] POST handler entered');
  try {
    const raw = await req.json();
    const validated = validateOrError(aiHealingSchema, raw);
    if ('error' in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const body = validated.data;
    console.log('[ai-healing] Parsed body, message:', body.message?.substring(0, 50));

    const apiKey = process.env.LLM_API_KEY;
    const apiBase = process.env.LLM_API_BASE || 'https://integrate.api.nvidia.com/v1';
    const model = process.env.LLM_MODEL || 'stepfun-ai/step-3.7-flash';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'LLM_API_KEY 环境变量未配置，请在 .env.local 中设置' },
        { status: 500 },
      );
    }

    const systemPrompt = buildSystemPrompt(body);

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
    ];

    if (body.history && Array.isArray(body.history)) {
      for (const msg of body.history) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    messages.push({ role: 'user', content: body.message.trim() });

    console.log('[ai-healing] Starting streaming request to NVIDIA, model:', model);

    // 使用流式请求，解决 NVIDIA API 非 stream 模式长请求挂起
    const nodeStream = httpsStreamPost(
      `${apiBase}/chat/completions`,
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      JSON.stringify({
        model,
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 8192,
      }),
      30000, // 连接超时30秒，流开始后不超时
    );

    // 将 Node.js Readable 转换为 Web ReadableStream
    // 同时解析 SSE 格式，只转发内容 delta
    const encoder = new TextEncoder();
    const webStream = new ReadableStream({
      start(controller) {
        let buffer = '';

        nodeStream.on('data', (chunk: Buffer) => {
          buffer += chunk.toString('utf-8');
          // 按行分割处理 SSE
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保留最后一行（可能不完整）

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;

            const dataStr = trimmed.slice(5).trim();
            if (dataStr === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              continue;
            }

            try {
              const parsed = JSON.parse(dataStr);
              // Check for API error response
              if (parsed.error) {
                console.error('[ai-healing] API error:', parsed.status, parsed.message?.substring(0, 100));
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: '\n[AI服务暂时不可用，请稍后重试]' })}\n\n`));
                continue;
              }
              const delta = parsed.choices?.[0]?.delta;
              if (delta?.content) {
                // 转发为纯文本流，前端更容易处理
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta.content })}\n\n`));
              }
            } catch {
              console.warn('[ai-healing] SSE parse skip:', dataStr.substring(0, 80));
            }
          }
        });

        nodeStream.on('end', () => {
          // 处理 buffer 中剩余的行
          if (buffer.trim()) {
            const trimmed = buffer.trim();
            if (trimmed.startsWith('data:')) {
              const dataStr = trimmed.slice(5).trim();
              if (dataStr === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              } else {
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.error) {
                    console.error('[ai-healing] Upstream API error:', parsed.message || parsed.error);
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: '抱歉，AI服务暂时不可用，请稍后重试。' })}\n\n`));
                  } else {
                    const delta = parsed.choices?.[0]?.delta;
                    if (delta?.content) {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta.content })}\n\n`));
                    }
                  }
                } catch {
                  console.warn('[ai-healing] SSE trailing parse skip:', dataStr.substring(0, 80));
                }
              }
            }
          }
          controller.close();
          console.log('[ai-healing] Stream completed');
        });

        nodeStream.on('error', (err: Error) => {
          console.error('[ai-healing] Stream error:', err.message);
          controller.error(err);
        });
      },
    });

    return new Response(webStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('[ai-healing] fatal error:', err);
    return NextResponse.json({ error: '服务内部错误，请稍后重试' }, { status: 500 });
  }
}
