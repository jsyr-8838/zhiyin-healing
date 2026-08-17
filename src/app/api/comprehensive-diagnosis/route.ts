import { NextRequest, NextResponse } from 'next/server';
import { httpsStreamPost } from '@/lib/https-stream';

/**
 * 综合辩证分析 API
 *
 * 接收所有已完成的诊断数据，由AI生成综合辩证报告。
 * 使用共享的 httpsStreamPost 工具函数。
 */

interface DiagnosisData {
  jiuZhong?: { primaryType: string; scores: Record<string, number> } | null;
  wuXing?: { fiveElement: string; constitution: string; dayMasterStrength: string; yongShen: string; jiShen: string } | null;
  tongue?: { constitution: string; element: string; wuyin: string; organ: string; diagnosis: string; featureA: string; featureB: string } | null;
  face?: { constitution: string; element: string; wuyin: string; organ: string; diagnosis: string; featureA: string; featureB: string } | null;
  hand?: { constitution: string; element: string; wuyin: string; organ: string; diagnosis: string; featureA: string; featureB: string } | null;
}

function buildSystemPrompt(data: DiagnosisData): string {
  const parts: string[] = [];

  parts.push(`你是一位资深中医辨证专家，擅长综合多种诊断方法进行体质辨识。

请根据以下多源诊断数据，生成一份综合明辨报告。报告必须包含以下结构：

## 一、综合体质判定
综合所有诊断结果，给出最终体质判定（九种体质之一），并分析各诊断源的证据一致性。

## 二、五行偏盛偏衰分析
分析五行（木火土金水）的偏盛偏衰情况，指出最偏盛和最偏衰的五行。

## 三、脏腑功能评估
根据体质和五行分析，评估各脏腑（肝心脾肺肾）的功能状态。

## 四、情志特征
分析该体质的情志倾向（怒喜思悲恐），给出情志调养方向。

## 五、个性化疗愈方案
给出以下具体建议：
- 五音疗愈：推荐哪个音调（角徵宫商羽），为什么
- 六字诀：推荐哪个字诀，为什么
- 灸疗穴位：推荐3-4个穴位及灸法
- 经络疏通：重点疏通哪条经络
- 饮食调理：宜食和忌食
- 情志调养：具体建议
- 运动养生：推荐运动方式

## 六、季节养生指导
当前季节的养生重点和注意事项。

请用专业但通俗的中医语言撰写，避免过于学术化。`);

  if (data.jiuZhong) {
    const scores = Object.entries(data.jiuZhong.scores)
      .sort(([,a],[,b]) => b - a)
      .slice(0, 3)
      .map(([k,v]) => `${k}(${v}分)`)
      .join('、');
    parts.push(`\n【九种体质问卷结果】主型：${data.jiuZhong.primaryType}，前三：${scores}`);
  }

  if (data.wuXing) {
    parts.push(`\n【五行体质计算结果】偏旺五行：${data.wuXing.fiveElement}行，体质类型：${data.wuXing.constitution}，日主：${data.wuXing.dayMasterStrength}，用神：${data.wuXing.yongShen}行，忌神：${data.wuXing.jiShen}行`);
  }

  if (data.tongue) {
    parts.push(`\n【舌诊结果】体质：${data.tongue.constitution}，五行：${data.tongue.element}，五音：${data.tongue.wuyin}，脏腑：${data.tongue.organ}，诊断：${data.tongue.diagnosis}。舌质特征：${data.tongue.featureA}，舌苔特征：${data.tongue.featureB}`);
  }

  if (data.face) {
    parts.push(`\n【面诊结果】体质：${data.face.constitution}，五行：${data.face.element}，五音：${data.face.wuyin}，脏腑：${data.face.organ}，诊断：${data.face.diagnosis}。面色特征：${data.face.featureA}，五官特征：${data.face.featureB}`);
  }

  if (data.hand) {
    parts.push(`\n【手诊结果】体质：${data.hand.constitution}，五行：${data.hand.element}，五音：${data.hand.wuyin}，脏腑：${data.hand.organ}，诊断：${data.hand.diagnosis}。掌色特征：${data.hand.featureA}，掌纹特征：${data.hand.featureB}`);
  }

  const completedCount = [data.jiuZhong, data.wuXing, data.tongue, data.face, data.hand].filter(Boolean).length;
  parts.push(`\n共完成${completedCount}项诊断。`);

  return parts.join('\n');
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();

    // 输入验证：至少需要一项诊断数据
    if (!raw || typeof raw !== 'object') {
      return NextResponse.json({ error: '无效的请求数据' }, { status: 400 });
    }

    const hasAnyDiagnosis = !!(raw.jiuZhong || raw.wuXing || raw.tongue || raw.face || raw.hand);
    if (!hasAnyDiagnosis) {
      return NextResponse.json({ error: '至少需要一项诊断数据' }, { status: 400 });
    }

    const data: DiagnosisData = raw;

    const apiKey = process.env.LLM_API_KEY;
    const apiBase = process.env.LLM_API_BASE || 'https://integrate.api.nvidia.com/v1';
    const model = process.env.LLM_MODEL || 'stepfun-ai/step-3.7-flash';

    if (!apiKey) {
      // 无API key时，返回基于投票算法的离线结果
      const offlineResult = generateOfflineResult(data);
      return NextResponse.json({ content: offlineResult, offline: true });
    }

    const systemPrompt = buildSystemPrompt(data);

    const requestPayload = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: '请根据以上多源诊断数据，生成综合明辨分析报告。' },
      ],
      temperature: 0.7,
      max_tokens: 8192,
      stream: true,
    };

    const stream = httpsStreamPost(
      `${apiBase}/chat/completions`,
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      JSON.stringify(requestPayload),
      30000,
    );

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      start(controller) {
        let buffer = '';
        stream.on('data', (chunk: Buffer) => {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const jsonStr = trimmed.slice(6);
            if (jsonStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta;
              if (delta?.error || parsed.error) {
                console.error('[comprehensive-diagnosis] API error:', parsed.status, parsed.message?.substring(0, 100));
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: '\n[AI服务暂时不可用，请稍后重试]' })}\n\n`));
              } else if (delta?.content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta.content })}\n\n`));
              }
            } catch {
              console.warn('[comprehensive-diagnosis] SSE parse skip:', jsonStr.substring(0, 80));
            }
          }
        });

        stream.on('end', () => {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        });

        stream.on('error', (err: Error) => {
          controller.error(err);
        });
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('[comprehensive-diagnosis] Error:', err);
    return NextResponse.json(
      { error: '综合分析失败', details: (err as Error).message },
      { status: 500 },
    );
  }
}

/** 离线兜底：基于投票算法生成简化报告 */
function generateOfflineResult(data: DiagnosisData): string {
  // 简单统计最常出现的体质类型
  const votes: Record<string, number> = {};

  if (data.jiuZhong) {
    votes[data.jiuZhong.primaryType] = (votes[data.jiuZhong.primaryType] || 0) + 3;
    // 副型也记1分
    Object.entries(data.jiuZhong.scores)
      .sort(([,a],[,b]) => b - a)
      .slice(1, 3)
      .forEach(([k]) => { votes[k] = (votes[k] || 0) + 1; });
  }
  if (data.wuXing) {
    const mapped = data.wuXing.constitution + '质';
    votes[mapped] = (votes[mapped] || 0) + 2;
  }
  if (data.tongue) { votes[data.tongue.constitution + '质'] = (votes[data.tongue.constitution + '质'] || 0) + 2; }
  if (data.face) { votes[data.face.constitution + '质'] = (votes[data.face.constitution + '质'] || 0) + 1.5; }
  if (data.hand) { votes[data.hand.constitution + '质'] = (votes[data.hand.constitution + '质'] || 0) + 1.5; }

  const primary = Object.entries(votes).sort(([,a],[,b]) => b - a)[0];
  const primaryType = primary ? primary[0] : '平和质';

  const elements: string[] = [];
  if (data.wuXing) elements.push(`${data.wuXing.fiveElement}行偏旺`);
  if (data.tongue) elements.push(`舌诊：${data.tongue.element}行`);
  if (data.face) elements.push(`面诊：${data.face.element}行`);
  if (data.hand) elements.push(`手诊：${data.hand.element}行`);

  return `## 一、综合体质判定

综合${[data.jiuZhong, data.wuXing, data.tongue, data.face, data.hand].filter(Boolean).length}项诊断结果，您的体质为**${primaryType}**。

${data.jiuZhong ? `九种体质问卷显示主型为${data.jiuZhong.primaryType}。` : ''}
${data.wuXing ? `五行体质推算为${data.wuXing.constitution}，日主${data.wuXing.dayMasterStrength}。` : ''}
${data.tongue ? `舌诊判断为${data.tongue.constitution}质，${data.tongue.diagnosis}。` : ''}
${data.face ? `面诊判断为${data.face.constitution}质，${data.face.diagnosis}。` : ''}
${data.hand ? `手诊判断为${data.hand.constitution}质，${data.hand.diagnosis}。` : ''}

## 二、五行偏盛偏衰分析

${elements.length > 0 ? `各诊断源五行倾向：${elements.join('、')}。` : '暂无五行分析数据。'}
${data.wuXing ? `用神：${data.wuXing.yongShen}行，忌神：${data.wuXing.jiShen}行。` : ''}

## 五、个性化疗愈方案

请前往疗愈页面查看基于体质的个性化推荐，或使用AI导诊获取详细指导。

*（当前为离线分析结果，配置AI模型后可获得更详细的专业报告）*`;
}
