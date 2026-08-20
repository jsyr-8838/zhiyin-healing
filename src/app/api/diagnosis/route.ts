import { NextRequest, NextResponse } from 'next/server';
import { DIAGNOSIS_SYSTEM_PROMPT } from '@/lib/tcm-data';
import { MASTER_NI_PROMPT, getCurrentSolarTermHealth, FOOD_THERAPY_PROMPT } from '@/lib/solar-terms-health';
import { loadPromptWithFallback, PROMPT_IDS } from '@/lib/evo/prompt-loader';
import { db } from '@/lib/db';
import { getHealthLevel, getHealthAdvice } from '@/lib/health-score';
import { diagnosisPostSchema, validateOrError } from '@/lib/validators';
import { getPrescriptionsForConstitution, CONSTITUTION_PRESCRIPTIONS, searchPrescriptions, type ConstitutionKey } from '@/lib/jiuliao-data';
import tuinaTechniques from '@/lib/tuina-techniques.json';
import { searchBySymptom, recommendByConstitution, CONSTITUTION_TUINA_MAP, type TuinaTechnique } from '@/lib/tuina-data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateOrError(diagnosisPostSchema, body);
    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const { messages, profile, userId, tongueDiagnosis, diagnosisSummary } = validation.data;

    // 检查API密钥
    const apiKey = process.env.LLM_API_KEY;
    const apiBase = process.env.LLM_API_BASE || 'https://integrate.api.nvidia.com/v1';
    const model = process.env.LLM_MODEL || 'stepfun-ai/step-3.7-flash';

    // 构建用户上下文
    let healthContext = '';

    // 1. 体质信息
    if (profile) {
      const wuyinMap: Record<string, string> = {
        jiao: '角音(木行/肝)',
        zhi: '徵音(火行/心)',
        gong: '宫音(土行/脾)',
        shang: '商音(金行/肺)',
        yu: '羽音(水行/肾)',
      };
      healthContext += `【体质测试结果】主导${wuyinMap[profile.dominant] || '未知'}，五行得分：${JSON.stringify(profile.scores)}\n`;
    }

    // 2. 舌诊结果
    if (tongueDiagnosis) {
      healthContext += `【AI舌诊分析结果】\n`;
      healthContext += `- 舌质特征：${tongueDiagnosis.tongueBody}\n`;
      healthContext += `- 舌苔特征：${tongueDiagnosis.tongueCoating}\n`;
      healthContext += `- 诊断结论：${tongueDiagnosis.diagnosis}\n`;
      healthContext += `- 体质判断：${tongueDiagnosis.constitution}质\n`;
      healthContext += `- 对应五行：${tongueDiagnosis.element}行，对应五音：${tongueDiagnosis.wuyin}音，对应脏腑：${tongueDiagnosis.organ}\n`;
    }

    // 3. 综合辩证摘要（多源诊断整合）
    if (diagnosisSummary && !diagnosisSummary.includes('尚未完成')) {
      healthContext += `\n${diagnosisSummary}\n`;
    }

    // 4. 灸疗处方推荐（基于体质）
    const constitutionMatch = diagnosisSummary?.match(/主体质[：:]\s*(.+?)[，,\n]/);
    const detectedConstitution = constitutionMatch?.[1]?.trim() as ConstitutionKey | undefined;
    if (detectedConstitution && CONSTITUTION_PRESCRIPTIONS[detectedConstitution]) {
      const mapping = CONSTITUTION_PRESCRIPTIONS[detectedConstitution];
      const top = getPrescriptionsForConstitution(detectedConstitution).slice(0, 6);
      healthContext += `\n【体质灸疗处方推荐】（${detectedConstitution}，${mapping.rationale}）\n`;
      top.forEach(p => {
        healthContext += `- ${p.name}（${p.category}）：主穴${p.points.join('、')}，${p.indication.slice(0, 30)}...\n`;
      });
      healthContext += `用户可在应用"灸疗处方"模块查看完整处方（共${getPrescriptionsForConstitution(detectedConstitution).length}方），建议推荐用户前往查看。\n`;
    }

    // 5. 推拿手法推荐（基于体质+症状）
    const lastUserMsg = messages[messages.length - 1]?.content || '';
    const tuinaByConstitution = detectedConstitution
      ? recommendByConstitution(detectedConstitution, tuinaTechniques as TuinaTechnique[], 5)
      : [];
    const symptomKeywords = lastUserMsg || diagnosisSummary || '';
    const tuinaBySymptom = symptomKeywords
      ? searchBySymptom(symptomKeywords, tuinaTechniques as TuinaTechnique[]).slice(0, 5)
      : [];
    const tuinaMerged = [...new Map([...tuinaByConstitution, ...tuinaBySymptom].map(t => [(t as TuinaTechnique).n, t])).values()].slice(0, 5);
    if (tuinaMerged.length > 0) {
      healthContext += `\n【体质推拿手法推荐】\n`;
      if (detectedConstitution) {
        const tuinaRationale = CONSTITUTION_TUINA_MAP[detectedConstitution]?.rationale || '根据体质推荐';
        healthContext += `（${detectedConstitution}，${tuinaRationale}）\n`;
      }
      tuinaMerged.forEach((t: TuinaTechnique) => {
        healthContext += `- ${t.n}（${t.c}）：主治${t.ind.slice(0, 3).join('、')}，常用穴${t.ac.slice(0, 3).join('、')}\n`;
      });
      healthContext += `建议在推荐灸疗处方的同时候选推拿手法，引导用户前往"推拿手法"模块查看详细操作和临床案例。\n`;
    }

    // 2. 打卡数据（如果提供了userId）
    if (userId) {
      try {
        const since = new Date();
        since.setDate(since.getDate() - 7);
        const sinceStr = since.toISOString().split('T')[0];

        const recentCheckins = await db.findAll(
          'SELECT * FROM Checkin WHERE userId = ? AND date >= ? ORDER BY date DESC LIMIT 7',
          [userId, sinceStr]
        );

        if (recentCheckins.length > 0) {
          healthContext += `【最近7天健康打卡数据】\n`;
          recentCheckins.forEach((c: Record<string, unknown>) => {
            const level = getHealthLevel(c.healthScore as number);
            healthContext += `- ${c.date}: 综合${c.healthScore}分(${level.label})，睡眠${c.sleepScore}(${c.sleepHours}h)·情绪${c.moodScore}·运动${c.exerciseScore}·饮食${c.dietScore}`;
            if (c.symptoms) healthContext += `，症状：${c.symptoms}`;
            healthContext += '\n';
          });

          const latest = recentCheckins[0] as Record<string, number>;
          const advice = getHealthAdvice(latest.sleepScore, latest.moodScore, latest.exerciseScore, latest.dietScore);
          healthContext += `【系统建议】${advice.join('；')}\n`;
        }

        // 3. 体质测评数据
        const latestAssessment = await db.findOne<{ primaryType: string; dominantWuyin: string }>(
          'SELECT primaryType, dominantWuyin FROM Assessment WHERE userId = ? ORDER BY date DESC LIMIT 1',
          [userId]
        );
        if (latestAssessment) {
          healthContext += `【最新体质测评】主导体质：${latestAssessment.primaryType}，主导五音：${latestAssessment.dominantWuyin}\n`;
        }
      } catch {
        // 数据库不可用时跳过
      }
    }

    // 4段式分析提示词（移植自LingSuHealth DeepSeekService）
    // 增强：加入当前节气养生上下文 + 倪海厦中医人设
    const currentTerm = getCurrentSolarTermHealth();
    const solarTermContext = `
【当前节气】：${currentTerm.name}（${currentTerm.date} ${currentTerm.time}）
【节气五行】：${currentTerm.element}行 · 对应脏腑：${currentTerm.organ}
【养生主题】：${currentTerm.theme}
【节气食疗】：${currentTerm.foodColors}，推荐食材：${currentTerm.foods.join('、')}
【节气穴位】：${currentTerm.acupoint}
【六字诀】：${currentTerm.sixSound}音
【节气禁忌】：${currentTerm.taboo}
【四季作息】：${currentTerm.season === '春' || currentTerm.season === '夏' ? '夜卧早起' : '早卧早起'}${currentTerm.season === '冬' ? '，待日光而起' : ''}`;

    const isFoodQuery = ['吃什么', '食谱', '菜谱', '今天吃', '推荐菜', '食疗'].some(k => lastUserMsg.includes(k));
    // 进化提示词：优先从 EvoPromptVersion 加载，降级到硬编码常量
    const evoDiagnosisPrompt = await loadPromptWithFallback(PROMPT_IDS.AI_DIAGNOSIS, DIAGNOSIS_SYSTEM_PROMPT);
    const enhancedSystemPrompt = `${evoDiagnosisPrompt}

${MASTER_NI_PROMPT}

${isFoodQuery ? `\n${FOOD_THERAPY_PROMPT}\n` : ''}

${solarTermContext}

${healthContext ? `用户健康数据：\n${healthContext}` : '用户尚未进行五音体质测试和健康打卡。'}

请按以下4段结构回复：
【健康总结】根据用户体质和近期打卡数据，总结当前健康状态
【个性化建议】针对用户体质和薄弱环节，给出具体的五音疗愈、饮食、起居、灸疗处方、推拿手法建议。结合当前节气"${currentTerm.name}"给出时令建议。如有体质灸疗处方推荐数据，请推荐2-3个灸方并说明主穴和适应症，引导用户前往"灸疗处方"模块查看详情。如有推拿手法推荐数据，请推荐2-3个手法并说明分类和主治，引导用户前往"推拿手法"模块查看详细操作。
【明日养生方案】根据当前节气"${currentTerm.name}"和用户体质，推荐明日的养生重点
【明日提醒】2-3条简短提醒，帮助用户坚持养生习惯`;

    if (!apiKey) {
      // 无API密钥时，返回离线分析
      const offlineResponse = generateOfflineAnalysis(profile, userId);
      return NextResponse.json({ content: offlineResponse });
    }

    // 调用LLM API
    const systemMessage = {
      role: 'system',
      content: enhancedSystemPrompt,
    };

    const response = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [systemMessage, ...messages],
        max_tokens: 8192,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('LLM API error:', response.status, errorData);
      return NextResponse.json({
        content: generateOfflineAnalysis(profile, userId),
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '抱歉，暂时无法生成回复。';

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Diagnosis API error:', error);
    return NextResponse.json({
      content: '网络连接异常，请检查网络后重试。',
    });
  }
}

// 离线分析引擎（无需LLM）
interface OfflineProfile {
  dominant?: string;
  scores?: Record<string, number>;
}

function generateOfflineAnalysis(profile: OfflineProfile | undefined, userId: string | undefined): string {
  const wuyinNames: Record<string, string> = {
    jiao: '角音(木行/肝)',
    zhi: '徵音(火行/心)',
    gong: '宫音(土行/脾)',
    shang: '商音(金行/肺)',
    yu: '羽音(水行/肾)',
  };

  if (!profile) {
    return `【健康总结】您好！建议先完成五音体质测试和每日打卡，这样我可以给出更精准的分析。

【个性化建议】
1. 养成每日打卡习惯，记录睡眠、情绪、运动、饮食
2. 尝试聆听基础五音疗愈音频，感受身体变化
3. 规律作息，23点前入睡

【明日养生方案】
- 晨起：5分钟深呼吸（商音清肺法）
- 午间：小憩15分钟养心
- 睡前：角音疏肝冥想10分钟

【明日提醒】
1. 完成五音体质测试
2. 23点前入睡
3. 30分钟中等强度运动`;
  }

  const dominant = profile.dominant || 'gong';
  const name = wuyinNames[dominant] || '宫音(土行/脾)';
  const adviceMap: Record<string, { diet: string[]; exercise: string[]; healing: string }> = {
    jiao: {
      diet: ['多吃绿色蔬菜', '枸杞菊花茶', '少食辛辣'],
      exercise: ['户外散步疏肝', '太极拳', '瑜伽拉伸'],
      healing: '角音疏肝·晨间唤醒',
    },
    zhi: {
      diet: ['红枣桂圆养心', '莲子百合清心', '少饮浓茶'],
      exercise: ['有氧运动养心', '慢跑', '游泳'],
      healing: '徵音养心·午间静养',
    },
    gong: {
      diet: ['山药薏米健脾', '大枣蜂蜜养胃', '规律饮食'],
      exercise: ['饭后散步助消化', '八段锦', '腹式呼吸'],
      healing: '宫音健脾·餐后调养',
    },
    shang: {
      diet: ['百合银耳润肺', '梨和白萝卜', '多饮温水'],
      exercise: ['深呼吸练习', '快走', '登山'],
      healing: '商音清肺·午后净息',
    },
    yu: {
      diet: ['黑芝麻黑豆养肾', '核桃枸杞益精', '温补忌寒凉'],
      exercise: ['站桩打坐', '慢跑', '太极'],
      healing: '羽音固肾·夜间安眠',
    },
  };

  const advice = adviceMap[dominant] || adviceMap.gong;

  const constitutionForTuina = Object.entries({
    jiao: '气郁质', zhi: '阴虚质', gong: '痰湿质', shang: '气虚质', yu: '阳虚质',
  }).find(([k]) => k === dominant)?.[1] || '平和质';
  const tuinaOffline = recommendByConstitution(constitutionForTuina, tuinaTechniques as TuinaTechnique[], 3);

  return `【健康总结】根据您的体质测试结果，您的五行偏${name.split('(')[0]}行，对应脏腑为${name.split('/')[1]?.replace(')', '') || '脾胃'}。建议重点调理相关脏腑，通过五音疗愈和生活方式调整，逐步达到阴阳平衡。

【个性化建议】
食疗建议：${advice.diet.join('、')}
运动建议：${advice.exercise.join('、')}
疗愈方案：推荐「${advice.healing}」作为每日核心疗愈${tuinaOffline.length > 0 ? `\n推拿手法：${tuinaOffline.map((t: TuinaTechnique) => `${t.n}（${t.c}，主治${t.ind.slice(0, 2).join('、')}）`).join('、')}，可在"推拿手法"模块查看详细操作` : ''}

【明日养生方案】
- 晨起：播放${name.split('(')[0]}调音乐5分钟唤醒
- 午间：10分钟冥想放松
- 晚间：${name.split('(')[0]}调疗愈15分钟，配合腹式呼吸

【明日提醒】
1. 坚持每日打卡，记录健康变化
2. 23点前入睡，保证7-8小时睡眠
3. 聆听推荐的五音疗愈音频`;
}
