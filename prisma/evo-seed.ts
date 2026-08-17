/**
 * 知音进化系统 — 种子数据初始化脚本
 * 
 * 运行方式：npx tsx prisma/evo-seed.ts
 * 
 * 包含：
 * 1. 自修复规则种子（7条常见错误指纹+修复动作）
 * 2. 优化提示词版本种子（3个AI场景的系统提示词）
 * 3. 知识库种子（5条核心领域知识）
 * 4. 调度任务种子（3条定时进化任务）
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── 1. 自修复规则种子 ──
const REPAIR_RULES = [
  {
    errorFingerprint: 'fp_audio_context_suspended',
    errorPattern: 'AudioContext.*suspended|audioContext was not allowed to start',
    repairAction: JSON.stringify({
      type: 'resume_audio_context',
      description: 'AudioContext 被浏览器策略暂停，需要用户交互后恢复',
      autoFix: '检测到 suspended 状态时，在下次用户点击/触摸事件中调用 audioContext.resume()',
      module: 'healing',
    }),
    maxRetries: 5,
    cooldownMs: 30000,
  },
  {
    errorFingerprint: 'fp_api_5xx',
    errorPattern: 'HTTP 5[0-9]{2}|Internal Server Error|Service Unavailable',
    repairAction: JSON.stringify({
      type: 'api_retry_with_fallback',
      description: 'API 返回 5xx 错误，需要重试或降级',
      autoFix: '指数退避重试3次(1s/2s/4s)，全部失败则切换到本地降级模式',
      module: 'general',
    }),
    maxRetries: 3,
    cooldownMs: 60000,
  },
  {
    errorFingerprint: 'fp_api_429',
    errorPattern: 'HTTP 429|Too Many Requests|rate limit',
    repairAction: JSON.stringify({
      type: 'rate_limit_backoff',
      description: 'API 限流，需要退避',
      autoFix: '读取 Retry-After 头，按指示等待后重试；无头则指数退避(5s/15s/45s)',
      module: 'general',
    }),
    maxRetries: 3,
    cooldownMs: 120000,
  },
  {
    errorFingerprint: 'fp_webkit_audio_error',
    errorPattern: 'NotAllowedError.*audio|play.*failed.*user gesture|play\\(\\) rejected',
    repairAction: JSON.stringify({
      type: 'user_gesture_required',
      description: 'WebKit 浏览器要求用户交互才能播放音频',
      autoFix: '显示"点击开始"覆盖层，用户点击后再执行 audio.play()，并设置 audioContext.resume()',
      module: 'healing',
    }),
    maxRetries: 3,
    cooldownMs: 10000,
  },
  {
    errorFingerprint: 'fp_network_offline',
    errorPattern: 'Failed to fetch|net::ERR_|NetworkError|FetchError',
    repairAction: JSON.stringify({
      type: 'offline_fallback',
      description: '网络离线或请求失败',
      autoFix: '切换到离线模式：使用本地缓存数据、本地音频文件、Service Worker 缓存页面',
      module: 'general',
    }),
    maxRetries: 2,
    cooldownMs: 30000,
  },
  {
    errorFingerprint: 'fp_prisma_connection',
    errorPattern: 'PrismaClient.*connection|SQLite.*busy|database is locked',
    repairAction: JSON.stringify({
      type: 'db_reconnect',
      description: 'SQLite 数据库连接失败或锁定',
      autoFix: '等待 1-3 秒后重试，连续失败则重新创建 PrismaClient 实例',
      module: 'general',
    }),
    maxRetries: 5,
    cooldownMs: 10000,
  },
  {
    errorFingerprint: 'fp_bluetooth_gatt',
    errorPattern: 'Bluetooth.*GATT|bluetooth.*not available|NavigatorBluetooth',
    repairAction: JSON.stringify({
      type: 'ble_fallback',
      description: 'Web Bluetooth API 不可用或 GATT 连接失败',
      autoFix: '降级到 PPG 摄像头检测或手动输入心率模式，显示友好提示',
      module: 'healing',
    }),
    maxRetries: 2,
    cooldownMs: 5000,
  },
];

// ── 2. 优化提示词版本种子 ──
const PROMPT_VERSIONS = [
  {
    promptId: 'ai-diagnosis',
    module: 'diagnose',
    systemPrompt: `你是一位精通中医五行理论的知音AI导诊助手。请严格按照以下五行归经推导链进行诊断分析：

## 强制结构（5段输出）
1. **症状归经**：将用户描述的症状对应到具体脏腑（心/肝/脾/肺/肾）
2. **五行定性**：明确脏腑对应的五行属性（火/木/土/金/水）
3. **生克分析**：基于五行生克关系（相生：木→火→土→金→水→木；相克：木→土→水→火→金→木）推导病机
4. **治则建议**：根据五行治则（虚则补其母、实则泻其子）给出调理方向
5. **疗愈推荐**：推荐对应的五音、六字诀、经络穴位方案

## 禁止事项
- 禁止给出西医主诊断（可提及参考但不可替代五行辨证）
- 禁止跳过五行归经推导链直接给结论
- 所有脏腑归属必须明确五行属性
- 每个建议必须关联到五行理论依据`,
    avgScore: 0.65,
    sampleSize: 120,
    hallucinationRate: 0.08,
    isActive: true,
  },
  {
    promptId: 'tongue-analysis',
    module: 'diagnose',
    systemPrompt: `你是知音AI舌诊分析助手。请严格按照四维结构化框架分析舌象：

## 四维分析框架
1. **舌质**（色/形/态）：淡白/淡红/红/绛红/青紫 → 对应气血虚实
2. **舌苔**（色/质/分布）：薄白/薄黄/白腻/黄腻/剥苔/无苔 → 对应寒热湿邪
3. **舌形**（大小/齿痕/裂纹/芒刺）：胖大/瘦薄/齿痕/裂纹/芒刺 → 对应脏腑虚损
4. **舌下络脉**（色/形/瘀点）：淡紫/紫暗/瘀点/怒张 → 对应血瘀程度

## 枚举锁定
- 舌质颜色仅限：淡白/淡红/红/绛红/青紫（5选1）
- 舌苔颜色仅限：薄白/薄黄/白腻/黄腻/灰黑/剥苔/无苔（7选1）
- 舌形仅限：正常/胖大/瘦薄/齿痕/裂纹/芒刺（6选1）

## 分区辨证
- 舌尖→心肺 | 舌中→脾胃 | 舌根→肾 | 舌边→肝胆

## 输出格式
每项分析必须给出：观察结果→五行归属→病机推导→置信度(0-1)`,
    avgScore: 0.72,
    sampleSize: 85,
    hallucinationRate: 0.05,
    isActive: true,
  },
  {
    promptId: 'divination-interpretation',
    module: 'divination',
    systemPrompt: `你是知音AI知几术数大师。请严格遵循以下解读规范：

## 强制引用规则
- 八字：必须引用具体天干地支、十神、纳音数据
- 紫微：必须引用具体宫位、星曜名称、四化（化禄/化权/化科/化忌）
- 奇门：必须引用具体天地人神四盘、九星、八门、八神
- 六爻：必须引用具体卦象、世应、六亲、六神
- 梅花易数：必须论体用关系（体卦=自己/用卦=事），不可只给结论

## 行动建议三要素（每条建议必须包含）
1. **方位**：吉方/凶方（基于后天八卦方位）
2. **时辰**：推荐/避开的具体时辰（基于十二地支）
3. **五行色**：推荐穿戴/环境的五行对应颜色

## 禁止事项
- 禁止无数据支撑的笼统解读
- 禁止跳过体用关系直接断吉凶
- 所有术数解读必须可追溯到具体卦象/星曜/干支数据`,
    avgScore: 0.58,
    sampleSize: 200,
    hallucinationRate: 0.15,
    isActive: true,
  },
];

// ── 3. 知识库种子 ──
const KNOWLEDGE_ENTRIES = [
  {
    domain: '中医体质',
    element: 'earth',
    title: 'GB/T 46939-2025 中医体质分类与判定国家标准',
    content: `GB/T 46939-2025《中医体质分类与判定》已于2025年正式实施，替代2009年版。

核心变化：
1. 体质分类从9种扩展，新增"郁质"（对应情志郁结人群）
2. 判定方法升级为加权评分法，权重基于大规模流行病学调查
3. 舌诊API准确率已达98.74%，可作为体质辨识的客观化工具
4. 新增体质转化标准：调理3个月后可重新评估，动态追踪体质变化

知音集成要点：
- 现有22题九种体质评估问卷需对标新国标，补充郁质相关题目
- 舌诊模块可引用新国标的舌象判定标准，提升诊断可信度
- 体质结果页应增加"按新国标GB/T 46939-2025评估"标识`,
    source: 'national_standard',
    sourceUrl: 'https://openstd.samr.gov.cn/',
    tags: ['国标', '体质分类', '2025', '舌诊'],
    qualityScore: 95,
  },
  {
    domain: '五行音乐',
    element: 'fire',
    title: '以情胜情智能推荐引擎——五行音乐情志相胜闭环',
    content: `以情胜情（情志相胜）是中医心理学的核心治法，源自《黄帝内经》"怒伤肝，悲胜怒；喜伤心，恐胜喜；思伤脾，怒胜思；悲伤肺，喜胜悲；恐伤肾，思胜恐"。

知音应用集成方案：
1. 五行情志映射：怒→木(角音)、喜→火(徵音)、思→土(宫音)、悲→金(商音)、恐→水(羽音)
2. 相胜推荐链：用户当前情志→对应所胜情志的五行音乐
3. 完整闭环：情志评估(8题问卷)→五行归经→以情胜情推荐→五音疗愈→效果评估
4. 核心差异化：区别于普通冥想APP，以情胜情是中医独有的情志疗法框架

技术实现：
- useHealingRecommendation Hook 已支持体质联动
- 需扩展为情志→以情胜情→五行音乐三级推荐链
- 天籁页面的天气+时辰联动推荐可叠加情志权重`,
    source: 'internal_research',
    tags: ['以情胜情', '五行音乐', '情志相胜', '核心差异化'],
    qualityScore: 90,
  },
  {
    domain: '六字诀',
    element: 'wood',
    title: '六字诀血氧实时反馈——"先降后升"生理指标',
    content: `六字诀呼吸练习中，血氧饱和度(SpO2)呈现"先降后升"的规律性变化：
- 呼气阶段（嘘/呵/呼/呬/吹/嘻）：延长呼气导致短暂SpO2下降2-4%
- 吸气阶段：深吸气后SpO2快速回升，甚至超过基线1-2%
- 完整一轮周期（约30秒）后SpO2净升约1%

知音集成方案：
1. PPG摄像头实时SpO2监测（复用心率监测的PPG基础设施）
2. 呼吸节奏→SpO2曲线可视化：实时展示"先降后升"生理响应
3. 6字诀×呼吸节奏匹配：每字诀对应不同频率/深度的呼吸模式
4. 生理反馈闭环：SpO2异常时自动调整呼吸节奏建议

技术路线：
- 复用 HeartRateMonitor 的 PPG 检测模块
- 新增 SpO2 算法层（红光/红外光双通道PPG提取）
- 六字诀页面增加SpO2实时曲线+呼吸同步可视化`,
    source: 'internal_research',
    tags: ['六字诀', '血氧', 'SpO2', 'PPG', '生理反馈'],
    qualityScore: 88,
  },
  {
    domain: '颂钵疗愈',
    element: 'metal',
    title: '颂钵脑波频率体系——市场40.6亿美元年增13%',
    content: `颂钵（Singing Bowl）疗愈市场数据：
- 全球市场规模：40.6亿美元（2024年）
- 年复合增长率：13%（2024-2030年预测）
- 主要驱动力：冥想疗愈需求增长、职场减压需求、瑜伽馆/SPA中心渗透

脑波频率映射：
- Delta波(0.5-4Hz)：深度睡眠、身体修复 → 颂钵低频共振
- Theta波(4-8Hz)：冥想、深度放松、创意 → 颂钵中频引导
- Alpha波(8-13Hz)：放松清醒、心流 → 颂钵高频安抚
- Beta波(13-30Hz)：专注、活跃思考 → 不推荐颂钵（需要降频过渡）

知音集成方案：
1. 现有3首颂钵曲目扩展为完整频率体系（4个脑波频段×3种颂钵=12首）
2. 颂钵播放页面增加脑波频率可视化（类似天籁的频谱环）
3. 用户脑波目标选择：想入睡→Delta、想冥想→Theta、想放松→Alpha
4. 与六字诀联动：呼吸节奏→脑波频率→颂钵共振同步`,
    source: 'internal_research',
    tags: ['颂钵', '脑波', '频率体系', '市场数据'],
    qualityScore: 85,
  },
  {
    domain: '经络穴位',
    element: 'water',
    title: 'WebXR经络沉浸式探索——AR投影+VR探索',
    content: `WebXR技术为3D经络系统带来全新交互维度：

AR投影方案：
- 通过手机摄像头识别身体部位
- 叠加显示对应经络走向和穴位位置
- 实时追踪手部位置，自动高亮附近穴位
- 技术栈：WebXR AR Module + Hit Test API

VR探索方案：
- 全沉浸式经络世界：走进人体内部观察经络走向
- 穴位互动：伸手触碰穴位，触发经络传导动画
- 五行空间：5个对应五行的VR空间，各自展示脏腑经络
- 技术栈：WebXR VR Module + React Three Fiber

知音现有基础：
- 已有 BodyParts3D 骨骼3D模型
- 已有183+穴位完整数据（定位/主治/取穴/特定穴/交会经络/古籍）
- 已有五行色标注和点击交互

分阶段实施：
1. Phase1(1月)：WebXR API 可用性检测 + 基础AR穴位叠加
2. Phase2(2月)：VR经络空间原型
3. Phase3(3月)：完整AR/VR经络探索上线`,
    source: 'internal_research',
    tags: ['WebXR', 'AR', 'VR', '经络', '3D', '沉浸式'],
    qualityScore: 82,
  },
];

// ── 4. 调度任务种子 ──
const SCHEDULE_TASKS = [
  {
    name: '每日自检',
    cronExpr: '0 3 * * *', // 每天凌晨3点
    actionType: 'daily_self_check',
    actionConfig: JSON.stringify({
      endpoint: '/api/evo/daily-check',
      method: 'POST',
      timeout: 600000, // 10分钟
    }),
    isEnabled: true,
  },
  {
    name: '每周深度进化',
    cronExpr: '0 4 * * 1', // 每周一凌晨4点
    actionType: 'weekly_deep_evolution',
    actionConfig: JSON.stringify({
      endpoint: '/api/evo/weekly-evolution',
      method: 'POST',
      timeout: 3600000, // 60分钟
    }),
    isEnabled: true,
  },
  {
    name: '每月知识扩充',
    cronExpr: '0 2 1 * *', // 每月1号凌晨2点
    actionType: 'monthly_knowledge_expansion',
    actionConfig: JSON.stringify({
      endpoint: '/api/evo/monthly-expansion',
      method: 'POST',
      timeout: 14400000, // 4小时
    }),
    isEnabled: true,
  },
];

// ── 执行种子 ──
async function main() {
  console.log('🌱 知音进化系统 — 种子数据初始化\n');

  // 1. 修复规则
  console.log('📌 写入修复规则...');
  let ruleCount = 0;
  for (const rule of REPAIR_RULES) {
    try {
      await prisma.evoRepairRule.upsert({
        where: { errorFingerprint: rule.errorFingerprint },
        update: {
          errorPattern: rule.errorPattern,
          repairAction: rule.repairAction,
          maxRetries: rule.maxRetries,
          cooldownMs: rule.cooldownMs,
        },
        create: rule,
      });
      ruleCount++;
    } catch (err) {
      console.error(`  ✗ ${rule.errorFingerprint}:`, err);
    }
  }
  console.log(`  ✓ ${ruleCount}/${REPAIR_RULES.length} 条修复规则\n`);

  // 2. 提示词版本
  console.log('📌 写入提示词版本...');
  let promptCount = 0;
  for (const pv of PROMPT_VERSIONS) {
    try {
      const existing = await prisma.evoPromptVersion.findFirst({
        where: { promptId: pv.promptId, isActive: true },
      });
      if (existing) {
        // 更新现有活跃版本
        await prisma.evoPromptVersion.update({
          where: { id: existing.id },
          data: {
            systemPrompt: pv.systemPrompt,
            avgScore: pv.avgScore,
            sampleSize: pv.sampleSize,
            hallucinationRate: pv.hallucinationRate,
          },
        });
      } else {
        // 创建新版本
        await prisma.evoPromptVersion.create({
          data: {
            promptId: pv.promptId,
            module: pv.module,
            version: 1,
            systemPrompt: pv.systemPrompt,
            avgScore: pv.avgScore,
            sampleSize: pv.sampleSize,
            hallucinationRate: pv.hallucinationRate,
            isActive: true,
            deployedAt: new Date(),
          },
        });
      }
      promptCount++;
    } catch (err) {
      console.error(`  ✗ ${pv.promptId}:`, err);
    }
  }
  console.log(`  ✓ ${promptCount}/${PROMPT_VERSIONS.length} 个提示词版本\n`);

  // 3. 知识库
  console.log('📌 写入知识库...');
  let knowledgeCount = 0;
  for (const entry of KNOWLEDGE_ENTRIES) {
    try {
      await prisma.evoKnowledge.upsert({
        where: { id: `${entry.domain}_${entry.element}` },
        update: {
          content: entry.content,
          qualityScore: entry.qualityScore,
          source: entry.source || 'ai_generated',
          sourceUrl: entry.sourceUrl || '',
          tags: JSON.stringify(entry.tags),
        },
        create: {
          id: `${entry.domain}_${entry.element}`,
          domain: entry.domain,
          element: entry.element,
          title: entry.title,
          content: entry.content,
          source: entry.source || 'ai_generated',
          sourceUrl: entry.sourceUrl || '',
          tags: JSON.stringify(entry.tags),
          qualityScore: entry.qualityScore,
          status: 'deployed',
        },
      });
      knowledgeCount++;
    } catch (err) {
      console.error(`  ✗ ${entry.title}:`, err);
    }
  }
  console.log(`  ✓ ${knowledgeCount}/${KNOWLEDGE_ENTRIES.length} 条知识库条目\n`);

  // 4. 调度任务
  console.log('📌 写入调度任务...');
  let scheduleCount = 0;
  for (const task of SCHEDULE_TASKS) {
    try {
      await prisma.evoSchedule.upsert({
        where: { id: task.name },
        update: {
          cronExpr: task.cronExpr,
          actionType: task.actionType,
          actionConfig: task.actionConfig,
        },
        create: {
          id: task.name,
          name: task.name,
          cronExpr: task.cronExpr,
          actionType: task.actionType,
          actionConfig: task.actionConfig,
          isEnabled: task.isEnabled,
        },
      });
      scheduleCount++;
    } catch (err) {
      console.error(`  ✗ ${task.name}:`, err);
    }
  }
  console.log(`  ✓ ${scheduleCount}/${SCHEDULE_TASKS.length} 条调度任务\n`);

  console.log('✅ 种子数据初始化完成！');
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('种子数据初始化失败:', err);
  prisma.$disconnect();
  process.exit(1);
});
