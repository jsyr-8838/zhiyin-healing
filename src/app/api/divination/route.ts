import { NextRequest, NextResponse } from 'next/server';
import { DIVINATION_SYSTEM_PROMPT } from '@/lib/divination-data';
import { loadPromptWithFallback, PROMPT_IDS } from '@/lib/evo/prompt-loader';
import { divine, DIVINATION_METHODS_V2, type DivinationMethod, type DivineResult } from '@/lib/taibu-adapter';
import { db, generateId, now } from '@/lib/db';
import { divinationPostSchema, divinationGetSchema, divinationFeedbackSchema, validateOrError } from '@/lib/validators';

// 术数方法名映射
const METHOD_LABELS: Record<string, string> = {
  meihua: '梅花易数', zhouyi: '周易占卜', liuyao: '六爻纳甲',
  qimen: '奇门遁甲', daliuren: '大六壬', bazi: '八字命盘',
  xiaoliuren: '小六壬', ziwei: '紫微斗数', taiyi: '太乙神数', tarot: '塔罗牌',
};

// POST: 执行占卜
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateOrError(divinationPostSchema, body);
    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const { userId, method, question, inputParams = {}, profile, destinee } = validation.data;

    // 1. 使用 taibu-core 精确排盘
    let divineResult: DivineResult;
    try {
      divineResult = await divine({
        method: method as DivinationMethod,
        question,
        number: inputParams.number,
        birthDate: inputParams.birthDate,
        birthHour: inputParams.birthHour,
        gender: 'male',
        seed: Date.now(),
      });
    } catch (calcError: unknown) {
      const msg = calcError instanceof Error ? calcError.message : String(calcError);
      return NextResponse.json({ error: `排盘失败：${msg}` }, { status: 400 });
    }

    const divinationResult = {
      hexagramName: divineResult.summary,
      hexagramData: divineResult.json as Record<string, unknown>,
      movingLine: ((divineResult.json as any)?.movingLine as number) || 0,
      extraInfo: divineResult.extraInfo,
    };

    // 2. 构建上下文（体质信息 + 历史占卜记录）
    let contextInfo = '';

    // 体质信息
    if (profile) {
      const wuyinMap: Record<string, string> = {
        jiao: '角音(木行/肝)',
        zhi: '徵音(火行/心)',
        gong: '宫音(土行/脾)',
        shang: '商音(金行/肺)',
        yu: '羽音(水行/肾)',
      };
      contextInfo += `【体质信息】主导${wuyinMap[profile.dominant] || '未知'}，五行得分：${JSON.stringify(profile.scores)}\n`;
    }

    // 命主档案
    if (destinee) {
      const genderLabel = destinee.gender === 'male' ? '男' : '女';
      const lunarLabel = destinee.isLunar ? '（农历）' : '（公历）';
      contextInfo += `【命主信息】姓名：${destinee.name}，性别：${genderLabel}，出生日期：${destinee.birthDate}${lunarLabel}，出生时辰：${destinee.birthHour}时\n`;
      contextInfo += `请根据命主的生辰八字和性别，给出更有针对性的解读和建议。如果术数方法需要八字排盘，请结合命主信息分析命局喜忌。\n`;
    }

    // 历史知几记录（自适应学习）
    try {
      const recentRecords = await db.findAll(
        'SELECT * FROM DivinationRecord WHERE userId = ? ORDER BY createdAt DESC LIMIT 5',
        [userId]
      );
      if (recentRecords.length > 0) {
        contextInfo += `【近期知几历史】\n`;
        recentRecords.forEach((r: Record<string, unknown>, i: number) => {
          contextInfo += `- ${r.date} ${r.methodLabel}：问"${(r.question as string).slice(0, 30)}"→${r.hexagram || '未排盘'}${r.feedback === 1 ? '（反馈：准）' : r.feedback === -1 ? '（反馈：不准）' : ''}\n`;
        });
        contextInfo += `\n请参考近期知几记录的连续性，给出更有针对性的解读。如近期多次问同类型问题，说明用户对此事特别关注，应给出更明确的指引。\n`;
      }
    } catch {
      // 数据库不可用跳过
    }

    // 卦象信息
    let hexagramContext = '';
    const hd = divinationResult.hexagramData;
    if (hd) {
      const hdAny = hd as Record<string, any>;
      const mainHex = (hdAny.mainHexagram || {}) as Record<string, any>;
      const hexName = hdAny.name || mainHex.name || divinationResult.hexagramName;
      const hexUpper = hdAny.upper || mainHex.upperTrigram || '';
      const hexLower = hdAny.lower || mainHex.lowerTrigram || '';
      const hexElement = hdAny.element || mainHex.element || '';
      const hexKeyword = hdAny.keyword || '';
      const hexJudgment = hdAny.judgment || '';
      const hexNumber = hdAny.number || mainHex.number || '';
      hexagramContext = `【卦象】${hexName}${hexNumber ? `（第${hexNumber}卦）` : ''}
${hexUpper && hexLower ? `上卦：${hexUpper} 下卦：${hexLower}` : ''}
${hexElement ? `五行属：${hexElement}` : ''}${hexKeyword ? ` 关键词：${hexKeyword}` : ''}
${hexJudgment ? `卦辞：${hexJudgment}` : ''}
${divinationResult.extraInfo}`;
    } else {
      hexagramContext = `【排盘结果】${divinationResult.hexagramName}\n${divinationResult.extraInfo}`;
    }

    // 3. 构建完整提示词（进化提示词：优先从 EvoPromptVersion 加载）
    const evoDivinationPrompt = await loadPromptWithFallback(PROMPT_IDS.DIVINATION, DIVINATION_SYSTEM_PROMPT);
    const fullPrompt = `${evoDivinationPrompt}

当前术数方法：${METHOD_LABELS[method]}

${hexagramContext}

${contextInfo ? contextInfo : ''}

用户的问题：「${question}」

请根据以上卦象/排盘结果，运用${METHOD_LABELS[method]}的理论给出详细解读。`;

    // 4. 调用LLM
    const apiKey = process.env.LLM_API_KEY;
    const apiBase = process.env.LLM_API_BASE || 'https://integrate.api.nvidia.com/v1';
    const model = process.env.LLM_MODEL || 'stepfun-ai/step-3.7-flash';

    let aiContent: string;

    if (!apiKey) {
      // 离线模式：基于卦象生成基础解读
      aiContent = generateOfflineDivination(method, divinationResult, question);
    } else {
      try {
        const response = await fetch(`${apiBase}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: fullPrompt },
              { role: 'user', content: question },
            ],
            max_tokens: 8192,
            temperature: 0.8,
          }),
        });

        if (!response.ok) {
          aiContent = generateOfflineDivination(method, divinationResult, question);
        } else {
          const data = await response.json();
          aiContent = data.choices?.[0]?.message?.content || '知几结果生成异常，请稍后再试。';
        }
      } catch {
        aiContent = generateOfflineDivination(method, divinationResult, question);
      }
    }

    // 5. 存入数据库
    let savedRecordId: string | undefined;
    try {
      const id = generateId();
      const ts = now();
      await db.execute(
        `INSERT INTO DivinationRecord (id, userId, method, methodLabel, question, inputType, inputParams, hexagram, result, summary, feedback, constitution, date, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
        [id, userId, method, METHOD_LABELS[method], question,
         method === 'bazi' ? 'time' : method === 'meihua' ? 'number' : 'text',
         JSON.stringify(inputParams), divinationResult.hexagramName, aiContent,
         aiContent.split('\n').find((l) => l.includes('吉凶提示') || l.includes('总结'))?.slice(0, 100) || '',
         profile?.dominant || '',
         new Date().toISOString().split('T')[0], ts]
      );
      savedRecordId = id;
    } catch {
      // 数据库不可用跳过保存
    }

    return NextResponse.json({
      content: aiContent,
      hexagram: divinationResult.hexagramName,
      hexagramData: divinationResult.hexagramData,
      movingLine: divinationResult.movingLine,
      extraInfo: divinationResult.extraInfo,
      recordId: savedRecordId,
    });
  } catch (error) {
    console.error('Divination API error:', error);
    return NextResponse.json({ error: '知几服务异常，请稍后重试' }, { status: 500 });
  }
}

// GET: 获取占卜历史
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validation = validateOrError(divinationGetSchema, {
      userId: searchParams.get('userId') || '',
      method: searchParams.get('method') || undefined,
      limit: searchParams.get('limit') || '10',
    });

    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { userId, method, limit } = validation.data;

    let records;
    if (method) {
      records = await db.findAll(
        'SELECT * FROM DivinationRecord WHERE userId = ? AND method = ? ORDER BY createdAt DESC LIMIT ?',
        [userId, method, limit]
      );
    } else {
      records = await db.findAll(
        'SELECT * FROM DivinationRecord WHERE userId = ? ORDER BY createdAt DESC LIMIT ?',
        [userId, limit]
      );
    }

    // 统计
    const statsResult = await db.findOne<{ count: number; avgFeedback: number }>(
      'SELECT COUNT(*) as count, AVG(feedback) as avgFeedback FROM DivinationRecord WHERE userId = ?',
      [userId]
    );

    return NextResponse.json({
      records,
      stats: {
        total: statsResult?.count ?? 0,
        avgFeedback: statsResult?.avgFeedback ?? 0,
      },
    });
  } catch (error) {
    console.error('Divination GET error:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}

// PATCH: 反馈（自适应学习）
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateOrError(divinationFeedbackSchema, body);
    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { id, userId, feedback } = validation.data;

    const record = await db.findOne(
      'SELECT id FROM DivinationRecord WHERE id = ? AND userId = ?',
      [id, userId]
    );

    if (!record) {
      return NextResponse.json({ error: '记录不存在' }, { status: 404 });
    }

    await db.execute(
      'UPDATE DivinationRecord SET feedback = ? WHERE id = ?',
      [feedback, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Divination feedback error:', error);
    return NextResponse.json({ error: '反馈失败' }, { status: 500 });
  }
}

// 离线占卜引擎
function generateOfflineDivination(
  method: string,
  result: { hexagramName: string; hexagramData: Record<string, unknown>; movingLine: number; extraInfo: string },
  question: string
): string {
  const methodLabel = METHOD_LABELS[method] || '术数';
  const hexagram = result.hexagramData as Record<string, any>;
  const mainHex = (hexagram.mainHexagram || {}) as Record<string, any>;

  if (!hexagram) {
    return `【卦象解析】${result.hexagramName}，${result.extraInfo}

【运势分析】根据${methodLabel}排盘结果，当前局势呈现变化之象。您所问之事暗藏玄机，需静心观变。

【行动建议】
1. 近期宜守不宜攻，等待时机成熟
2. 注意人际关系中的暗流变化
3. 可借助五音疗愈平复心境，再做决断

【五音调养】建议聆听宫调音乐，健脾和胃，安定心神

【吉凶提示】中吉，方位宜西南，忌正北`;
  }

  const element = hexagram.element || mainHex.element || '土';
  const name = hexagram.name || mainHex.name || result.hexagramName;
  const keyword = hexagram.keyword || '';
  const judgment = hexagram.judgment || mainHex.judgment || '';
  const number = hexagram.number || mainHex.number || '';

  const elementWuyinMap: Record<string, { name: string; organ: string; session: string }> = {
    '金': { name: '商音', organ: '肺', session: '商音清肺·午后净息' },
    '木': { name: '角音', organ: '肝', session: '角音疏肝·晨间唤醒' },
    '水': { name: '羽音', organ: '肾', session: '羽音固肾·夜间安眠' },
    '火': { name: '徵音', organ: '心', session: '徵音养心·午间静养' },
    '土': { name: '宫音', organ: '脾', session: '宫音健脾·餐后调养' },
  };

  const wuyin = elementWuyinMap[element as string] || elementWuyinMap['土'];
  const luckyDirection = ({ '金': '西方', '木': '东方', '水': '北方', '火': '南方', '土': '中央' } as Record<string, string>)[element as string] || '中央';

  return `【卦象解析】${name}${number ? `（第${number}卦）` : ''}
五行属${element}${keyword ? `，关键词"${keyword}"` : ''}。
${result.extraInfo}
${judgment ? `卦辞：${judgment}` : ''}

【运势分析】您所问"${question.slice(0, 30)}"，得${name}卦。${keyword ? `${keyword}之象，暗示此事正处于${keyword === '刚健' || keyword === '通泰' || keyword === '增益' ? '上升发展期，宜积极进取' : keyword === '闭塞' || keyword === '困难' || keyword === '困穷' ? '困难期，需耐心等待转机' : '变动期，需审时度势'}。` : ''}${result.movingLine ? `动爻第${result.movingLine}爻提示变化关键。` : ''}

【行动建议】
1. 此卦五行属${element}，宜采稳中求进之策
2. 吉利方位：${luckyDirection}，可朝此方向行事
3. 近期注意${wuyin.organ}部保养，${wuyin.organ}气调和则运势更顺

【五音调养】${element}行对应${wuyin.name}，关联${wuyin.organ}脏。推荐「${wuyin.session}」，调和${element}行之气，有助趋吉避凶。

【吉凶提示】中吉，方位宜${luckyDirection}`;
}
