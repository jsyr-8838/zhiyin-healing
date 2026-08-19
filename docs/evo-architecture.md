---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: 'cc0d09b9-90ff-4132-ae9e-b2dc6c616387'
  PropagateID: 'cc0d09b9-90ff-4132-ae9e-b2dc6c616387'
  ReservedCode1: 'fd69fb54-7270-4f52-ae79-e09e85209ebd'
  ReservedCode2: 'fd69fb54-7270-4f52-ae79-e09e85209ebd'
---

# 知音自我进化系统架构设计

> 版本：1.0 | 日期：2026-07-25  
> 项目：知音 ZhiYin — 中医五行五音疗愈应用  
> 技术栈：Next.js 16 + TypeScript + Tailwind CSS v4 + Zustand + SQLite (Prisma) + NextAuth.js + Zod

---

## 1. 进化引擎架构总览

```
┌─────────────────────────────────────────────────────────────────────┐
│                     知音自我进化引擎 ZhiYin Evo                      │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  L5 反馈层 ─ 效果评估 · 回滚 · 学习闭环                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │   │
│  │  │ 效果追踪  │  │ A/B决策  │  │ 回滚引擎 │  │ 知识固化     │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              ▲ 效果信号                              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  L4 执行层 ─ 内容生成 · 提示词优化 · UI改进 · Bug修复          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │   │
│  │  │ 疗愈内容  │  │ Prompt   │  │ UI/UX    │  │ 自修复       │ │   │
│  │  │ 生成器    │  │ 优化器   │  │ 改进器   │  │ 引擎         │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              ▲ 执行指令                              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  L3 决策层 ─ 进化策略 · 优先级排序 · A/B决策                    │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │   │
│  │  │ 策略引擎  │  │ 优先级   │  │ 实验分配 │  │ 变更审批     │ │   │
│  │  │ (五行权)  │  │ 排序器   │  │ 器       │  │ 网关         │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              ▲ 分析洞察                              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  L2 分析层 ─ 模式识别 · 知识提炼 · 问题诊断                     │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │   │
│  │  │ 行为模式  │  │ 知识     │  │ 问题     │  │ 疗愈效果     │ │   │
│  │  │ 识别器   │  │ 提炼器   │  │ 诊断器   │  │ 分析器       │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              ▲ 原始数据                              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  L1 感知层 ─ 数据采集：用户行为 · 错误日志 · 反馈评分            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │   │
│  │  │ 行为埋点  │  │ 错误    │  │ 反馈     │  │ 生理信号     │ │   │
│  │  │ 收集器   │  │ 监听器   │  │ 收集器   │  │ 采集器       │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 数据流

```
用户交互 → L1采集 → L2分析 → L3决策 → L4执行 → L5评估 → L2学习闭环
                              ↑                                  │
                              └──────── 回滚/固化 ←──────────────┘
```

---

## 2. 五层架构详细设计

### 2.1 L1 感知层 — 数据采集

**目标**：零侵入采集全维度运行数据，不影响主流程性能。

#### 2.1.1 行为埋点收集器

```typescript
// src/lib/evo/sensors/behavior-collector.ts

export interface BehaviorEvent {
  userId: string;
  sessionId: string;         // 会话ID（页面停留期间）
  timestamp: number;
  type: BehaviorEventType;
  module: EvoModule;         // 明辨/疗愈/知几/玄览/经络/天籁
  action: string;            // click/scroll/complete/abort/seek/rate
  target: string;            // 具体元素或功能ID
  metadata: Record<string, unknown>;
  duration?: number;        // 行为耗时(ms)
}

export type BehaviorEventType =
  | 'page_enter'     // 进入页面
  | 'page_leave'     // 离开页面
  | 'practice_start' // 开始功法
  | 'practice_complete' // 完成功法
  | 'practice_abort' // 中途退出
  | 'healing_rate'   // 疗愈评分
  | 'feature_use'    // 使用某功能
  | 'diagnosis_done' // 完成诊断
  | 'feedback'       // 用户反馈
  | 'error'          // 遇到错误
  | 'nav_click';     // 导航点击

export type EvoModule =
  | 'mingbian'    // 明辨（辨证）
  | 'liaoyu'      // 疗愈
  | 'zhiji'       // 知几（占卜）
  | 'xuanlan'     // 玄览（典籍）
  | 'jingluo'     // 经络
  | 'tianlai';    // 天籁
```

**采集策略**：
- 批量发送：本地缓冲 20 条或 10 秒周期，`navigator.sendBeacon` 发送
- 离线缓存：`IndexedDB` 队列，恢复网络后重放
- 采样率：100%采集关键事件（practice_complete/healing_rate/error），20% 采集 page_enter/page_leave
- 隐私：仅采集匿名行为，不含诊断内容原文

#### 2.1.2 错误监听器

```typescript
// src/lib/evo/sensors/error-listener.ts

export interface ErrorSignal {
  errorId: string;          // 错误唯一指纹（stack hash）
  type: 'runtime' | 'api' | 'audio' | 'render' | 'webgl';
  message: string;
  stack?: string;
  module: EvoModule;
  url: string;
  userId?: string;
  timestamp: number;
  frequency: number;         // 同指纹错误累计次数
  context: {
    userAgent: string;
    viewport: string;
    onlineStatus: boolean;
    memoryUsage?: number;    // performance.memory
  };
}
```

**监听范围**：
- `window.onerror` + `unhandledrejection`：全局运行时错误
- API 路由：统一 `try/catch` 包装器，捕获 5xx 和异常 4xx
- 音频错误：`AudioContext.state` + `HTMLAudioElement.error` 事件
- WebGL 错误：3D经络模型 `WebGL context lost` 事件
- 渲染错误：Next.js `error.tsx` 边界触发时上报

#### 2.1.3 反馈收集器

```typescript
// src/lib/evo/sensors/feedback-collector.ts

export interface FeedbackSignal {
  feedbackId: string;
  userId: string;
  timestamp: number;
  type: FeedbackType;
  module: EvoModule;
  rating: number;            // 1-5 星
  comment?: string;
  context: {
    sessionDuration: number; // 本次使用时长
    practicesCompleted: number;
    diagnosisResults?: string;
  };
}

export type FeedbackType =
  | 'healing_effect'     // 疗愈效果评分
  | 'content_quality'    // 内容质量
  | 'ui_experience'      // UI体验
  | 'feature_request'    // 功能请求
  | 'bug_report'         // Bug报告
  | 'nps';               // 净推荐值
```

**采集点**：
- 知音之境完成后心情对比（已有 `moodBefore`/`moodAfter`）
- 六字诀/五音疗愈完成后弹出1星-5星评分
- 每周NPS问卷（登录第7天触发）
- 错误边界弹窗附带反馈入口

#### 2.1.4 生理信号采集器

```typescript
// src/lib/evo/sensors/bio-signal-collector.ts

export interface BioSignal {
  userId: string;
  timestamp: number;
  source: 'ble' | 'ppg' | 'manual';
  bpm: number;
  hrv?: number;              // HRV (ms)
  sessionContext: {
    mode: string;            // zhijing/wuyin/liuzijue/stressmusic
    element?: string;
    durationSec: number;
  };
}
```

### 2.2 L2 分析层 — 模式识别与知识提炼

#### 2.2.1 行为模式识别器

```typescript
// src/lib/evo/analyzers/behavior-pattern-recognizer.ts

export interface BehaviorPattern {
  patternId: string;
  type: PatternType;
  description: string;
  confidence: number;        // 0-1 置信度
  affectedUsers: number;     // 影响用户数
  firstSeen: number;
  lastSeen: number;
  frequency: number;         // 日均发生次数
  severity: 'info' | 'warn' | 'critical';
  metadata: Record<string, unknown>;
}

export type PatternType =
  // 痛点模式
  | 'high_abort_rate'        // 高放弃率（某功法>40%退出）
  | 'low_completion'         // 低完成率（<30%用户走完流程）
  | 'feature_neglect'        // 功能忽视（某模块使用率<5%）
  | 'confusion_nav'          // 导航困惑（频繁回退/重复进入）
  | 'error_hotspot'          // 错误热点（某模块错误率>10%）
  // 价值模式
  | 'sticky_feature'         // 高粘性功能（日均使用>3次）
  | 'healing_improvement'    // 疗愈改善趋势（moodAfter持续提升）
  | 'cross_module_flow'      // 跨模块流转（明辨→疗愈→经络闭环）
  | 'peak_usage_time'        // 使用高峰时段
  | 'element_preference';    // 五行偏好（某行音乐/功法使用显著偏多）
```

**识别算法**（纯本地SQLite聚合，无需外部ML服务）：

```sql
-- 高放弃率检测：过去7天某功法 abort / start > 40%
SELECT
  category,
  COUNT(CASE WHEN action='practice_abort' THEN 1 END) * 1.0 /
  NULLIF(COUNT(CASE WHEN action='practice_start' THEN 1 END), 0) AS abort_rate
FROM EvoBehaviorEvent
WHERE timestamp > unixepoch('now', '-7 days') * 1000
GROUP BY category
HAVING abort_rate > 0.4;

-- 低完成率：某流程 step<N/total
-- 高粘性：日均 practice_complete > 3
-- 五行偏好：某 element 的 wuyin 播放次数占比 > 35%
```

#### 2.2.2 知识提炼器

```typescript
// src/lib/evo/analyzers/knowledge-distiller.ts

export interface DistilledKnowledge {
  knowledgeId: string;
  type: KnowledgeType;
  source: 'user_behavior' | 'feedback' | 'clinical_outcome' | 'literature';
  content: string;           // 提炼后的知识陈述
  evidence: Evidence[];      // 支撑证据链
  confidence: number;
  applicableModules: EvoModule[];
  createdAt: number;
  validatedAt?: number;
  status: 'draft' | 'validated' | 'deployed' | 'deprecated';
}

export type KnowledgeType =
  | 'healing_correlation'     // 疗愈关联（如：气郁质→角音疗愈→mood改善+32%）
  | 'element_timing'          // 五行时序（如：水行用户在子时使用效果最佳）
  | 'constitution_practice'  // 体质功法偏好（如：阳虚质用户偏好吹字诀+羽音）
  | 'abandon_reason'          // 放弃原因归纳
  | 'content_gap'             // 内容缺口（用户搜索但无结果的词条）
  | 'optimal_duration'        // 最优练习时长
  | 'seasonal_pattern';      // 季节性模式

export interface Evidence {
  source: string;
  sampleSize: number;
  effectSize: number;        // 效应量
  pValue?: number;           // 统计显著性
}
```

**提炼流程**：

```
行为数据 → 聚合统计(SQL) → 假设生成(规则引擎) → 证据验证(样本量检查) → 知识入库
                                                    ↓
                                          样本<30 → 标记 draft，等待更多数据
                                          p>0.05  → 丢弃（不显著）
                                          效应量小 → 降级为 info
```

#### 2.2.3 问题诊断器

```typescript
// src/lib/evo/analyzers/problem-diagnostician.ts

export interface DiagnosedProblem {
  problemId: string;
  type: ProblemType;
  severity: 'P0' | 'P1' | 'P2' | 'P3';
  module: EvoModule;
  description: string;
  rootCause: string;         // 根因分析
  affectedUsers: number;
  affectedRate: number;      // 影响率 0-1
  evidence: string[];        // 错误日志/行为数据引用
  suggestedFix: FixSuggestion;
  autoFixable: boolean;      // 是否可自动修复
  createdAt: number;
}

export type ProblemType =
  | 'crash'                  // 崩溃
  | 'api_failure'            // API故障
  | 'audio_failure'          // 音频播放失败
  | 'render_glitch'          // 渲染异常
  | 'ux_friction'            // 体验摩擦（流程中断/困惑）
  | 'content_error'          // 内容错误（体质建议不当等）
  | 'performance_degrade';   // 性能退化

export interface FixSuggestion {
  type: 'code_patch' | 'prompt_update' | 'content_update' | 'config_change';
  description: string;
  patch?: string;            // 代码补丁
  risk: 'low' | 'medium' | 'high';
}
```

#### 2.2.4 疗愈效果分析器

```typescript
// src/lib/evo/analyzers/healing-analyzer.ts

export interface HealingOutcome {
  userId: string;
  module: EvoModule;
  subCategory: string;       // zhijing_deepsea / wuyin_jiao / liuzijue_xu
  moodBefore: number;
  moodAfter: number;
  improvement: number;      // moodAfter - moodBefore
  durationSec: number;
  element: string;
  constitution?: string;
  bpmBefore?: number;
  bpmAfter?: number;
  timestamp: number;
}

// 聚合指标
export interface HealingMetrics {
  subCategory: string;
  avgImprovement: number;
  medianImprovement: number;
  sampleSize: number;
  completionRate: number;
  avgDuration: number;
  topConstitution: string;  // 效果最好的体质类型
  bottomConstitution: string; // 效果最差的体质类型
  bpmDelta?: number;        // 平均心率变化
  trend: 'improving' | 'stable' | 'declining';
}
```

### 2.3 L3 决策层 — 进化策略与优先级

#### 2.3.1 策略引擎（五行权重决策）

```typescript
// src/lib/evo/deciders/strategy-engine.ts

export interface EvoStrategy {
  strategyId: string;
  name: string;
  priority: number;          // 0=最高
  wuxingBias: WuxingElement; // 五行偏重
  actions: EvoAction[];
  preconditions: StrategyPrecondition[];
  expectedImpact: number;    // 预期改善幅度 0-1
  risk: 'low' | 'medium' | 'high';
  requiresApproval: boolean; // 是否需要人工审批
}

export interface EvoAction {
  type: EvoActionType;
  target: string;             // 目标文件/配置/prompt ID
  params: Record<string, unknown>;
  rollback: () => Promise<void>;
}

export type EvoActionType =
  | 'prompt_optimize'        // 提示词优化
  | 'content_generate'       // 内容生成
  | 'ui_adjust'              // UI调整
  | 'bug_fix'                // Bug修复
  | 'knowledge_expand'       // 知识扩充
  | 'config_update';         // 配置更新

export interface StrategyPrecondition {
  metric: string;
  operator: '>' | '<' | '==' | '!=' ;
  threshold: number;
}
```

**五行策略映射**：

| 五行 | 策略偏向 | 典型场景 |
|------|---------|---------|
| 木（生长） | 内容扩充、知识发现 | 新增疗愈曲目、发现新的体质-五音关联 |
| 火（活跃） | 提示词优化、AI响应增强 | 改进AI导诊话术、优化舌诊提示词 |
| 土（稳固） | Bug修复、体验优化 | 修复高频错误、降低流程摩擦 |
| 金（精炼） | 性能优化、内容精简 | 删减低价值功能、优化音频加载 |
| 水（适应） | 个性化适配、动态调整 | 根据体质调整推荐权重、时令策略 |

#### 2.3.2 优先级排序器

```typescript
// src/lib/evo/deciders/priority-sorter.ts

export function calculatePriority(problem: DiagnosedProblem, metrics: HealingMetrics): number {
  const severityWeight: Record<string, number> = {
    P0: 100, P1: 50, P2: 20, P3: 5,
  };
  const userImpact = problem.affectedUsers * problem.affectedRate;
  const severityScore = severityWeight[problem.severity] || 5;
  return severityScore * 0.4 + userImpact * 0.3 + (problem.autoFixable ? 15 : 0) * 0.3;
}
```

#### 2.3.3 实验分配器（A/B 测试）

```typescript
// src/lib/evo/deciders/experiment-allocator.ts

export interface EvoExperiment {
  experimentId: string;
  name: string;
  hypothesis: string;
  variants: ExperimentVariant[];
  startDate: number;
  endDate?: number;
  status: 'draft' | 'running' | 'completed' | 'cancelled';
  targetMetric: string;      // 如 'healing_improvement' / 'abort_rate'
  minimumSampleSize: number;
  currentSampleSize: number;
  result?: ExperimentResult;
}

export interface ExperimentVariant {
  variantId: string;
  label: string;             // 'control' | 'treatment_a' | 'treatment_b'
  allocation: number;        // 分配比例 0-1
  config: Record<string, unknown>; // 变量配置
}

export interface ExperimentResult {
  winner: string;
  confidence: number;
  effectSize: number;
  recommendation: string;
}
```

### 2.4 L4 执行层 — 内容生成与优化

#### 2.4.1 疗愈内容生成器

```typescript
// src/lib/evo/executors/healing-content-generator.ts

export interface ContentGenTask {
  type: 'narration' | 'music_recommendation' | 'practice_guide' | 'seasonal_advice';
  target: string;
  context: {
    constitution?: string;
    element?: string;
    season?: string;
    feedbackThemes?: string[];
  };
  output: {
    format: 'text' | 'audio' | 'json';
    language: 'zh-CN';
  };
}
```

**内容生成流程**：
1. L2 知识提炼器发现内容缺口（如：大雪节气无专属疗愈方案）
2. L3 策略引擎决定生成木行策略（内容扩充）
3. L4 调用 `immersive-healing-narration` 技能生成九境解说文案
4. 调用 `health-edu-infographic` 技能生成科普配图
5. 新内容写入 `EvoKnowledgeEntry` 表，标记 `status: draft`
6. L5 验证通过后 `status: deployed`

#### 2.4.2 提示词优化器

```typescript
// src/lib/evo/executors/prompt-optimizer.ts

export interface PromptOptimization {
  promptId: string;
  module: EvoModule;
  currentVersion: string;    // 当前提示词版本
  optimizedVersion: string;  // 优化后版本
  optimizationType: 'clarity' | 'safety' | 'relevance' | 'brevity';
  metric: {
    beforeScore: number;     // 优化前质量分
    afterScore: number;       // 优化后质量分（A/B测试结果）
  };
  deployedAt?: number;
  rolledBackAt?: number;
}
```

**优化对象**：
- AI 导诊提示词（`src/lib/emotional-prompt.ts`）
- 舌诊/面诊/手诊分析提示词（`src/app/api/tongue-diagnosis/route.ts`）
- 占卜解读提示词（`src/app/api/divination/route.ts`）
- 古典问答提示词（`src/app/api/classics/ask/route.ts`）

**优化流程**：
1. 收集用户对AI回答的反馈（`feedback: -1/0/1`）
2. L2 识别低评分提示词模式
3. L3 决策：调用 `prompt-engineer` 技能
4. 生成新版本提示词 → A/B测试分配
5. L5 评估：新版本评分是否显著高于旧版

#### 2.4.3 UI/UX 改进器

```typescript
// src/lib/evo/executors/ui-improver.ts

export interface UIImprovement {
  improvementId: string;
  type: 'layout' | 'color' | 'animation' | 'accessibility' | 'copy';
  module: EvoModule;
  trigger: 'high_abort' | 'low_engagement' | 'feedback' | 'accessibility';
  before: { description: string; metric: number };
  after: { description: string; metric: number };
  config: Record<string, unknown>; // 可序列化的UI配置变更
}
```

**典型改进场景**：
- 六字诀放弃率>40% → 增加进度提示和鼓励文案
- 经络3D页面首屏加载>5s → 添加骨架屏+延迟加载
- 移动端导航频繁回退 → 简化导航层级
- 五音疗愈页面用户停留<30s → 优化推荐展示

#### 2.4.4 自修复引擎

```typescript
// src/lib/evo/executors/self-repair-engine.ts

export interface RepairRule {
  ruleId: string;
  errorFingerprint: string;  // 匹配 ErrorSignal.errorId 的hash
  type: ProblemType;
  repair: RepairAction;
  maxRetries: number;
  cooldownMs: number;        // 修复冷却时间
  lastExecuted?: number;
  successRate: number;       // 历史成功率
}

export type RepairAction =
  | { type: 'retry_with_backoff'; delayMs: number; maxAttempts: number }
  | { type: 'fallback_to_cache'; cacheKey: string }
  | { type: 'disable_feature'; featureFlag: string }
  | { type: 'switch_provider'; from: string; to: string }
  | { type: 'reset_state'; scope: string }
  | { type: 'log_and_notify'; channel: string };
```

**内置修复规则**：

| 错误指纹 | 修复动作 | 说明 |
|---------|---------|------|
| `audio_context_suspended` | `retry_with_backoff(1000, 3)` | 音频上下文暂停，延迟重试 |
| `api_5xx_*` | `fallback_to_cache` | API 5xx，回退缓存数据 |
| `tts_quota_exceeded` | `switch_provider(edge→offline)` | TTS配额耗尽，切换离线合成 |
| `webgl_context_lost` | `reset_state('meridian-3d')` | WebGL丢失，重置3D状态 |
| `jamendo_cors_*` | `switch_provider(jamendo→local)` | Jamendo跨域，切换本地曲库 |
| `ppg_permission_denied` | `disable_feature('ppg_heartrate')` | PPG权限拒绝，关闭该功能 |

### 2.5 L5 反馈层 — 效果评估与学习闭环

#### 2.5.1 效果追踪

```typescript
// src/lib/evo/feedback/effect-tracker.ts

export interface EffectMeasurement {
  evoActionId: string;
  metric: string;            // 被测量的指标名
  beforeValue: number;       // 执行前值（7天均值）
  afterValue: number;        // 执行后值（7天均值）
  change: number;            // 变化量
  changeRate: number;        // 变化率 %
  significance: number;      // 统计显著性 p-value
  sampleSize: number;
  measuredAt: number;
}

// 跟踪的指标
export type TrackedMetric =
  | 'healing_improvement_avg'     // 平均疗愈改善
  | 'practice_completion_rate'    // 功法完成率
  | 'practice_abort_rate'        // 功法放弃率
  | 'daily_active_rate'          // 日活率
  | 'error_rate'                  // 错误率
  | 'nps_score'                   // 净推荐值
  | 'module_usage_*'             // 各模块使用率
  | 'avg_session_duration';      // 平均会话时长
```

#### 2.5.2 回滚引擎

```typescript
// src/lib/evo/feedback/rollback-engine.ts

export interface RollbackPolicy {
  metric: string;
  threshold: number;         // 恶化超过此值触发回滚
  windowDays: number;        // 观察窗口
  action: 'full_rollback' | 'partial_rollback' | 'disable_and_notify';
}

const DEFAULT_POLICIES: RollbackPolicy[] = [
  { metric: 'error_rate', threshold: 0.05, windowDays: 3, action: 'full_rollback' },
  { metric: 'healing_improvement_avg', threshold: -0.1, windowDays: 7, action: 'full_rollback' },
  { metric: 'practice_completion_rate', threshold: -0.15, windowDays: 7, action: 'partial_rollback' },
  { metric: 'nps_score', threshold: -0.5, windowDays: 14, action: 'disable_and_notify' },
];
```

#### 2.5.3 知识固化

```typescript
// src/lib/evo/feedback/knowledge-solidifier.ts

/**
 * 知识固化条件：
 * 1. 样本量 ≥ 100（足够统计显著性）
 * 2. 效应量 ≥ 0.3（中等以上效应）
 * 3. p-value < 0.05（统计显著）
 * 4. 跨 ≥2 个用户群体验证
 * 5. 观察 ≥14 天无回退
 */
export function shouldSolidify(knowledge: DistilledKnowledge, measurements: EffectMeasurement[]): boolean {
  const hasEnoughData = knowledge.evidence.every(e => e.sampleSize >= 100);
  const hasSignificantEffect = knowledge.evidence.some(e => e.effectSize >= 0.3);
  const isStable = measurements.every(m => m.significance < 0.05);
  const noRollback = !measurements.some(m => m.change < -0.1);
  return hasEnoughData && hasSignificantEffect && isStable && noRollback;
}
```

---

## 3. 知识积累数据模型 — Prisma Schema

```prisma
// ═══════════════════════════════════════════
// 知音自我进化系统 — 数据模型
// ═══════════════════════════════════════════

// ── L1 感知层 ──

/// 行为事件表（批量写入，高频）
model EvoBehaviorEvent {
  id          String   @id @default(cuid())
  userId      String   @default("anonymous")
  sessionId   String   @default("")
  timestamp   Int      // unix ms
  type        String   // page_enter / practice_complete / healing_rate ...
  module      String   // mingbian / liaoyu / zhiji / xuanlan / jingluo / tianlai
  action      String   // click / scroll / complete / abort / seek / rate
  target      String   @default("") // 目标元素/功能ID
  metadata    String   @default("{}") // JSON
  duration    Int      @default(0)  // 行为耗时(ms)
  createdAt   DateTime @default(now())

  @@index([module, type, timestamp])
  @@index([userId, timestamp])
}

/// 错误信号表
model EvoErrorSignal {
  id            String   @id @default(cuid())
  errorId       String   // 错误指纹 (stack hash)
  type          String   // runtime / api / audio / render / webgl
  message       String
  stack         String   @default("")
  module        String
  url           String   @default("")
  userId        String   @default("")
  timestamp     Int
  frequency     Int      @default(1) // 同指纹累计次数
  userAgent     String   @default("")
  viewport      String   @default("")
  resolved      Boolean  @default(false)
  resolvedAt    DateTime?
  createdAt     DateTime @default(now())

  @@unique([errorId])
  @@index([type, resolved, timestamp])
  @@index([module, timestamp])
}

/// 用户反馈表
model EvoFeedback {
  id              String   @id @default(cuid())
  userId          String
  timestamp       Int
  type            String   // healing_effect / content_quality / ui_experience / feature_request / bug_report / nps
  module          String
  rating          Int      // 1-5
  comment         String   @default("")
  sessionDuration Int      @default(0)
  practicesDone   Int      @default(0)
  constitution    String   @default("")
  createdAt       DateTime @default(now())

  @@index([module, type, timestamp])
  @@index([userId, timestamp])
}

/// 生理信号表
model EvoBioSignal {
  id          String   @id @default(cuid())
  userId      String
  timestamp   Int
  source      String   // ble / ppg / manual
  bpm         Int
  hrv         Int      @default(0)
  sessionMode String   @default("") // zhijing/wuyin/liuzijue/stressmusic
  element     String   @default("")
  durationSec Int      @default(0)
  createdAt   DateTime @default(now())

  @@index([userId, timestamp])
  @@index([sessionMode, timestamp])
}

// ── L2 分析层 ──

/// 行为模式表
model EvoBehaviorPattern {
  id            String   @id @default(cuid())
  patternId     String   @unique
  type          String   // high_abort_rate / low_completion / sticky_feature ...
  description   String
  confidence    Float    // 0-1
  affectedUsers Int      @default(0)
  firstSeen     Int
  lastSeen      Int
  frequency     Float    @default(0) // 日均次数
  severity      String   @default("info") // info / warn / critical
  metadata      String   @default("{}")
  status        String   @default("active") // active / acknowledged / resolved
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([type, severity, status])
}

/// 提炼知识表
model EvoKnowledgeEntry {
  id                String   @id @default(cuid())
  knowledgeId       String   @unique
  type              String   // healing_correlation / element_timing / constitution_practice ...
  source            String   // user_behavior / feedback / clinical_outcome / literature
  content           String   // 提炼后的知识陈述
  evidence          String   @default("[]") // JSON: Evidence[]
  confidence        Float    @default(0)
  applicableModules String   @default("[]") // JSON: EvoModule[]
  sampleSize        Int      @default(0)
  status            String   @default("draft") // draft / validated / deployed / deprecated
  validatedAt       DateTime?
  deployedAt        DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([type, status])
  @@index([confidence])
}

/// 诊断问题表
model EvoDiagnosedProblem {
  id             String   @id @default(cuid())
  problemId      String   @unique
  type           String   // crash / api_failure / audio_failure / ux_friction ...
  severity       String   @default("P3") // P0 / P1 / P2 / P3
  module         String
  description    String
  rootCause      String   @default("")
  affectedUsers  Int      @default(0)
  affectedRate   Float    @default(0)
  evidence       String   @default("[]") // JSON
  suggestedFix   String   @default("{}") // JSON: FixSuggestion
  autoFixable    Boolean  @default(false)
  status         String   @default("open") // open / fixing / fixed / wontfix
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([severity, status])
  @@index([module, status])
}

// ── L3 决策层 ──

/// 进化策略表
model EvoStrategy {
  id              String   @id @default(cuid())
  strategyId      String   @unique
  name            String
  priority        Int      @default(99)
  wuxingBias      String   @default("earth") // wood/fire/earth/metal/water
  preconditions   String   @default("[]") // JSON
  expectedImpact  Float    @default(0)
  risk            String   @default("low")
  requiresApproval Boolean @default(true)
  status          String   @default("draft") // draft / approved / executing / completed / cancelled
  experiments     EvoExperiment[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([status, priority])
}

/// A/B 实验表
model EvoExperiment {
  id              String   @id @default(cuid())
  experimentId    String   @unique
  strategyId      String
  name            String
  hypothesis      String
  variants        String   @default("[]") // JSON: ExperimentVariant[]
  startDate       Int
  endDate         Int?
  status          String   @default("draft") // draft / running / completed / cancelled
  targetMetric    String
  minSampleSize   Int      @default(100)
  currentSample   Int      @default(0)
  result          String   @default("{}") // JSON: ExperimentResult
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  strategy        EvoStrategy @relation(fields: [strategyId], references: [strategyId], onDelete: Cascade)

  @@index([status])
}

// ── L4 执行层 ──

/// 进化动作日志表
model EvoActionLog {
  id            String   @id @default(cuid())
  strategyId    String   @default("")
  experimentId  String   @default("")
  type          String   // prompt_optimize / content_generate / ui_adjust / bug_fix / knowledge_expand / config_update
  target        String   // 目标文件/配置/prompt ID
  params        String   @default("{}") // JSON
  status        String   @default("pending") // pending / executing / completed / failed / rolled_back
  result        String   @default("{}") // JSON
  executedAt    DateTime?
  completedAt   DateTime?
  rolledBackAt  DateTime?
  createdAt     DateTime @default(now())

  @@index([type, status])
  @@index([strategyId])
}

/// 提示词版本表
model EvoPromptVersion {
  id              String   @id @default(cuid())
  promptId        String   // 如 'tongue_diagnosis' / 'divination_bazi' / 'ai_healing'
  module          String
  version         Int      @default(1)
  content         String   // 提示词全文
  optimizationType String  @default("") // clarity / safety / relevance / brevity
  beforeScore     Float    @default(0)
  afterScore      Float    @default(0)
  isCurrent       Boolean  @default(false)
  deployedAt      DateTime?
  rolledBackAt    DateTime?
  createdAt       DateTime @default(now())

  @@unique([promptId, version])
  @@index([promptId, isCurrent])
}

/// 修复规则表
model EvoRepairRule {
  id              String   @id @default(cuid())
  errorFingerprint String  // 匹配 ErrorSignal.errorId
  type            String   // 问题类型
  repairAction    String   @default("{}") // JSON: RepairAction
  maxRetries      Int      @default(3)
  cooldownMs      Int      @default(60000)
  lastExecuted    DateTime?
  successRate     Float    @default(0)
  executions      Int      @default(0)
  successes      Int      @default(0)
  enabled         Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([errorFingerprint, enabled])
}

// ── L5 反馈层 ──

/// 效果测量表
model EvoEffectMeasurement {
  id            String   @id @default(cuid())
  actionId      String   // 关联 EvoActionLog
  metric        String   // 被测指标名
  beforeValue   Float
  afterValue    Float
  change        Float
  changeRate    Float    @default(0) // %
  significance  Float    @default(1) // p-value
  sampleSize    Int      @default(0)
  measuredAt    DateTime @default(now())

  @@index([actionId])
  @@index([metric])
}

// ── 调度配置 ──

/// 进化任务调度表
model EvoSchedule {
  id            String   @id @default(cuid())
  name          String
  cron          String   // cron 表达式
  taskType      String   // daily_check / weekly_evolve / monthly_expand / custom
  config        String   @default("{}") // JSON: 任务配置
  lastRunAt     DateTime?
  nextRunAt     DateTime?
  status        String   @default("active") // active / paused / disabled
  runCount      Int      @default(0)
  lastResult    String   @default("{}") // JSON
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([status, nextRunAt])
}

/// 进化运行时状态（单行，全局配置）
model EvoRuntimeState {
  id              String   @id @default("global")
  version         Int      @default(1)
  engineStatus    String   @default("idle") // idle / analyzing / deciding / executing / evaluating
  lastDailyCheck  DateTime?
  lastWeeklyEvo   DateTime?
  lastMonthlyExpand DateTime?
  totalEvolutions Int      @default(0)
  totalRollbacks Int      @default(0)
  activeExperiments Int    @default(0)
  config          String  @default("{}") // JSON: 全局配置
  updatedAt       DateTime @updatedAt
}
```

---

## 4. 进化任务调度设计

### 4.1 三级调度体系

```
┌─────────────────────────────────────────────────────┐
│                  调度体系架构                         │
│                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐│
│  │ 每日自检     │  │ 每周深度进化  │  │ 每月知识扩充││
│  │ (03:00 CST) │  │ (周日 04:00) │  │ (1日 05:00)││
│  │              │  │              │  │            ││
│  │ 5-10分钟     │  │ 30-60分钟    │  │ 2-4小时    ││
│  │ 自动执行     │  │ 自动+人工审批│  │ 人工审批   ││
│  └──────────────┘  └──────────────┘  └────────────┘│
│         │                 │                 │       │
│         ▼                 ▼                 ▼       │
│  ┌──────────────────────────────────────────────────┐│
│  │            Next.js API Route (Cron Trigger)       ││
│  │  /api/evo/scheduler/trigger                      ││
│  └──────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### 4.2 每日自检（Daily Check）

**触发时间**：每日 03:00 CST  
**执行时长**：5-10 分钟  
**审批要求**：无需人工审批（仅低风险操作）

```typescript
// src/lib/evo/scheduler/daily-check.ts

export async function runDailyCheck(): Promise<DailyCheckResult> {
  const result: DailyCheckResult = {
    date: new Date().toISOString().slice(0, 10),
    checks: [],
    repairs: [],
    knowledge: [],
  };

  // ① 错误扫描：过去24h新增错误
  const newErrors = await scanNewErrors(24);
  result.checks.push({ name: 'error_scan', findings: newErrors.length });

  // ② 自动修复：匹配已知修复规则
  for (const error of newErrors) {
    const rule = await findRepairRule(error.errorId);
    if (rule && shouldAutoRepair(rule)) {
      const repairResult = await executeRepair(rule, error);
      result.repairs.push(repairResult);
    }
  }

  // ③ 行为聚合：过去24h关键指标计算
  const metrics = await aggregateDailyMetrics();
  result.checks.push({ name: 'metrics', findings: metrics });

  // ④ 模式检测：更新活跃模式
  const newPatterns = await detectBehaviorPatterns({ window: '24h' });
  result.checks.push({ name: 'patterns', findings: newPatterns.length });

  // ⑤ 疗愈效果快照
  const healingSnapshot = await calculateHealingMetrics({ window: '24h' });
  result.checks.push({ name: 'healing_snapshot', findings: healingSnapshot });

  // ⑥ A/B 实验进度检查
  await checkExperimentProgress();

  // ⑦ 回滚检查：过去7天指标是否恶化
  await checkRollbackPolicies();

  // 更新运行时状态
  await updateRuntimeState({ lastDailyCheck: new Date() });

  return result;
}
```

**每日自检清单**：

| 序号 | 检查项 | 逻辑 | 自动修复 |
|------|--------|------|---------|
| 1 | 错误扫描 | 扫描24h新增 `EvoErrorSignal` | 匹配修复规则自动执行 |
| 2 | API健康 | 检查各API路由5xx率 | >5%时禁用功能+通知 |
| 3 | 音频可用性 | 检查音频文件404率 | 切换本地备用曲目 |
| 4 | 行为聚合 | 计算日活/完成率/放弃率 | 记录指标快照 |
| 5 | 模式检测 | 更新行为模式（滑动7天窗口） | 标记新发现的模式 |
| 6 | 实验进度 | 检查A/B实验是否达到最小样本量 | 自动结束实验 |
| 7 | 回滚检查 | 比较各指标与变更前基线 | 恶化超阈值触发回滚 |

### 4.3 每周深度进化（Weekly Evolution）

**触发时间**：每周日 04:00 CST  
**执行时长**：30-60 分钟  
**审批要求**：中高风险操作需人工审批

```typescript
// src/lib/evo/scheduler/weekly-evolve.ts

export async function runWeeklyEvolution(): Promise<WeeklyEvoResult> {
  const result: WeeklyEvoResult = {
    week: getWeekString(),
    analyses: [],
    strategies: [],
    executions: [],
    pendingApproval: [],
  };

  // ① 深度行为分析（7天窗口）
  const patterns = await detectBehaviorPatterns({ window: '7d' });
  result.analyses.push({ name: 'behavior_patterns', count: patterns.length });

  // ② 疗愈效果周报
  const healingWeekly = await calculateHealingMetrics({ window: '7d' });
  result.analyses.push({ name: 'healing_weekly', data: healingWeekly });

  // ③ 知识提炼
  const newKnowledge = await distillKnowledge({ window: '7d' });
  result.analyses.push({ name: 'knowledge_distilled', count: newKnowledge.length });

  // ④ 问题诊断
  const problems = await diagnoseProblems({ window: '7d' });
  result.analyses.push({ name: 'problems', count: problems.length });

  // ⑤ 策略生成
  const strategies = await generateStrategies(patterns, problems, healingWeekly);
  result.strategies = strategies;

  // ⑥ 执行低风险策略
  for (const strategy of strategies) {
    if (strategy.risk === 'low' && !strategy.requiresApproval) {
      const execResult = await executeStrategy(strategy);
      result.executions.push(execResult);
    } else {
      result.pendingApproval.push(strategy);
    }
  }

  // ⑦ 提示词优化（调用 prompt-engineer 技能）
  const promptUpdates = await optimizeStalePrompts();
  result.executions.push(...promptUpdates);

  // ⑧ 更新运行时状态
  await updateRuntimeState({ lastWeeklyEvo: new Date() });

  return result;
}
```

**每周进化清单**：

| 序号 | 任务 | 逻辑 | 输出 |
|------|------|------|------|
| 1 | 行为模式挖掘 | 7天窗口聚类分析 | `EvoBehaviorPattern` 更新 |
| 2 | 疗愈效果周报 | 各模块改善度/完成率/放弃率 | `EvoEffectMeasurement` |
| 3 | 知识提炼 | 行为数据→可操作知识 | `EvoKnowledgeEntry` (draft) |
| 4 | 问题诊断 | 根因分析+修复建议 | `EvoDiagnosedProblem` |
| 5 | 提示词优化 | 低评分提示词重写 | `EvoPromptVersion` (待A/B) |
| 6 | UI微调 | 高摩擦点UI参数调整 | `EvoActionLog` |
| 7 | 修复规则学习 | 新错误模式→修复规则 | `EvoRepairRule` |
| 8 | 实验结果分析 | 结束已达样本量的实验 | `EvoExperiment` (completed) |

### 4.4 每月知识扩充（Monthly Expansion）

**触发时间**：每月1日 05:00 CST  
**执行时长**：2-4 小时  
**审批要求**：所有操作需人工审批

```typescript
// src/lib/evo/scheduler/monthly-expand.ts

export async function runMonthlyExpansion(): Promise<MonthlyExpandResult> {
  const result: MonthlyExpandResult = {
    month: getMonthString(),
    research: [],
    content: [],
    knowledge: [],
    pendingApproval: [],
  };

  // ① 知识缺口分析
  const gaps = await analyzeKnowledgeGaps();
  result.research = gaps;

  // ② 调研最新中医五行疗愈方法（调用 deep-research 技能）
  for (const gap of gaps) {
    const research = await conductDeepResearch(gap);
    result.research.push(research);
  }

  // ③ 内容生成（调用各技能）
  const contentTasks = await planContentGeneration(gaps);
  result.content = contentTasks;

  // ④ 知识库更新
  const validatedKnowledge = await validateAndDeployKnowledge();
  result.knowledge = validatedKnowledge;

  // ⑤ 固化已验证知识
  await solidifyKnowledge();

  // ⑥ 节气内容预生成（下月节气）
  const nextSolarTerms = getNextMonthSolarTerms();
  const solarTermContent = await preGenerateSolarTermContent(nextSolarTerms);
  result.content.push(...solarTermContent);

  // ⑦ 更新运行时状态
  await updateRuntimeState({ lastMonthlyExpand: new Date() });

  return result;
}
```

**每月扩充清单**：

| 序号 | 任务 | 逻辑 | 技能调用 |
|------|------|------|---------|
| 1 | 知识缺口 | 用户搜索无结果+反馈请求 | — |
| 2 | 深度调研 | 新疗愈方法/节气养生/古籍新解 | `deep-research` |
| 3 | 解说文案 | 九境新文案/六字诀导引 | `immersive-healing-narration` |
| 4 | 科普配图 | 节气养生/体质科普 | `health-edu-infographic` |
| 5 | 知识固化 | draft→validated→deployed | — |
| 6 | 节气预生成 | 下月节气疗愈方案 | `prompt-engineer` + `deep-research` |
| 7 | 竞品洞察 | 同类应用新功能/新方法 | `deep-research` |

---

## 5. 核心文件清单

### 5.1 目录结构

```
src/lib/evo/
├── sensors/                    # L1 感知层
│   ├── behavior-collector.ts   # 行为埋点收集器
│   ├── error-listener.ts       # 错误监听器
│   ├── feedback-collector.ts   # 反馈收集器
│   └── bio-signal-collector.ts # 生理信号采集器
│
├── analyzers/                  # L2 分析层
│   ├── behavior-pattern-recognizer.ts  # 行为模式识别器
│   ├── knowledge-distiller.ts          # 知识提炼器
│   ├── problem-diagnostician.ts        # 问题诊断器
│   └── healing-analyzer.ts             # 疗愈效果分析器
│
├── deciders/                   # L3 决策层
│   ├── strategy-engine.ts      # 策略引擎（五行权重）
│   ├── priority-sorter.ts      # 优先级排序器
│   ├── experiment-allocator.ts  # 实验分配器
│   └── approval-gateway.ts      # 变更审批网关
│
├── executors/                  # L4 执行层
│   ├── healing-content-generator.ts  # 疗愈内容生成器
│   ├── prompt-optimizer.ts           # 提示词优化器
│   ├── ui-improver.ts                 # UI/UX改进器
│   └── self-repair-engine.ts          # 自修复引擎
│
├── feedback/                   # L5 反馈层
│   ├── effect-tracker.ts       # 效果追踪器
│   ├── rollback-engine.ts      # 回滚引擎
│   └── knowledge-solidifier.ts # 知识固化器
│
├── scheduler/                  # 调度系统
│   ├── daily-check.ts          # 每日自检
│   ├── weekly-evolve.ts        # 每周深度进化
│   ├── monthly-expand.ts       # 每月知识扩充
│   └── cron-runner.ts          # Cron触发器
│
├── shared/                     # 共享
│   ├── types.ts                # 类型定义
│   ├── constants.ts            # 常量（修复规则、回滚策略等）
│   └── utils.ts                # 工具函数
│
└── index.ts                    # 统一导出

src/app/api/evo/
├── behavior/route.ts           # 行为上报API
├── feedback/route.ts           # 反馈上报API
├── bio-signal/route.ts         # 生理信号上报API
├── scheduler/
│   ├── trigger/route.ts        # 手动触发调度
│   └── status/route.ts         # 调度状态查询
├── dashboard/
│   └── route.ts                # 进化仪表盘数据
└── approval/
    ├── list/route.ts           # 待审批列表
    └── decide/route.ts         # 审批决定

src/app/evo/
└── dashboard/
    └── page.tsx                # 进化控制台页面

src/components/evo/
├── BehaviorTracker.tsx         # 行为追踪Provider组件
├── FeedbackWidget.tsx          # 反馈评分小组件
├── ErrorReporter.tsx           # 错误上报Provider组件
├── EvoDashboard.tsx             # 进化仪表盘主组件
└── ApprovalPanel.tsx           # 审批面板组件
```

### 5.2 文件职责说明

| 文件 | 职责 | 依赖 |
|------|------|------|
| `sensors/behavior-collector.ts` | 采集用户行为事件，批量上报 | `EvoBehaviorEvent` model |
| `sensors/error-listener.ts` | 全局错误捕获与指纹生成 | `EvoErrorSignal` model |
| `sensors/feedback-collector.ts` | 反馈评分收集与持久化 | `EvoFeedback` model |
| `sensors/bio-signal-collector.ts` | 心率/HRV信号采集与上报 | `EvoBioSignal` model |
| `analyzers/behavior-pattern-recognizer.ts` | SQL聚合+规则引擎识别行为模式 | `EvoBehaviorEvent`, `EvoBehaviorPattern` |
| `analyzers/knowledge-distiller.ts` | 从模式中提炼可操作知识 | `EvoBehaviorPattern`, `EvoKnowledgeEntry` |
| `analyzers/problem-diagnostician.ts` | 根因分析+修复建议生成 | `EvoErrorSignal`, `EvoDiagnosedProblem` |
| `analyzers/healing-analyzer.ts` | 计算各疗愈模块效果指标 | `Checkin.healingDone`, `EvoFeedback` |
| `deciders/strategy-engine.ts` | 五行权重策略生成与匹配 | `EvoKnowledgeEntry`, `EvoDiagnosedProblem` |
| `deciders/priority-sorter.ts` | 多因子优先级评分排序 | `EvoDiagnosedProblem` |
| `deciders/experiment-allocator.ts` | A/B实验分配与进度追踪 | `EvoExperiment` |
| `deciders/approval-gateway.ts` | 变更审批流程管理 | `EvoActionLog` |
| `executors/healing-content-generator.ts` | 调用技能生成疗愈内容 | `immersive-healing-narration`, `health-edu-infographic` |
| `executors/prompt-optimizer.ts` | 调用技能优化AI提示词 | `prompt-engineer` |
| `executors/ui-improver.ts` | 生成UI改进方案并应用 | `frontend-design` |
| `executors/self-repair-engine.ts` | 匹配修复规则并自动执行 | `EvoRepairRule`, `EvoErrorSignal` |
| `feedback/effect-tracker.ts` | 进化前后指标对比测量 | `EvoEffectMeasurement` |
| `feedback/rollback-engine.ts` | 恶化检测与自动回滚 | `EvoActionLog`, `EvoEffectMeasurement` |
| `feedback/knowledge-solidifier.ts` | 验证条件检查→知识固化 | `EvoKnowledgeEntry` |
| `scheduler/daily-check.ts` | 每日自检编排 | 所有 analyzer + repair |
| `scheduler/weekly-evolve.ts` | 每周进化编排 | 所有层 |
| `scheduler/monthly-expand.ts` | 每月扩充编排 | `deep-research` + content generators |
| `scheduler/cron-runner.ts` | Next.js API Route cron 触发 | `EvoSchedule` |

---

## 6. 技能集成映射

| 技能 | 进化环节 | 对应层 | 触发条件 | 具体用途 |
|------|---------|--------|---------|---------|
| **deep-research** | 知识扩充 | L4→L5 | 每月/知识缺口检测 | 调研最新中医五行疗愈方法、竞品分析、古籍新解、节气养生知识 |
| **prompt-engineer** | 提示词优化 | L3→L4 | 每周/AI反馈低分 | 优化舌诊/面诊/导诊/占卜提示词，A/B测试新版提示词效果 |
| **immersive-healing-narration** | 内容生成 | L4 | 每月/新境文案需求 | 生成九境解说文案和TTS音频，更新六字诀深度导引文案 |
| **health-edu-infographic** | 内容生成 | L4 | 每月/节气科普需求 | 生成节气养生科普配图，体质辨识科普图，社区健康宣传图 |
| **skill-creator** | 系统自扩展 | L4 | 进化引擎自身迭代 | 创建知音进化专用技能包，更新修复规则，定义新的进化策略模板 |
| **frontend-design** | UI改进 | L4 | 每周/UX摩擦检测 | 优化高放弃率页面UI，改善移动端体验，生成新组件设计 |
| **magic-sdd-generator** | 文档生成 | L5 | 每月/架构变更 | 生成进化系统自身的设计文档，记录架构变更，生成版本对比报告 |
| **powerbi-pbix** | 数据分析 | L2→L5 | 每周/仪表盘需求 | 分析进化效果数据，生成可视化报告，制作进化指标仪表盘 |

### 技能调用流程图

```
每月知识扩充 ──┐
              ├── deep-research ──────→ 调研报告 → 知识提炼 → 知识库扩充
              │
每周深度进化 ──┤
              ├── prompt-engineer ────→ 新版提示词 → A/B测试 → 效果评估
              ├── frontend-design ────→ UI方案 → 低风险部署 → 效果追踪
              ├── immersive-healing ──→ 新文案/音频 → 审批 → 部署
              ├── health-edu-infographic → 科普配图 → 审批 → 部署
              └── powerbi-pbix ──────→ 进化仪表盘 → 周报 → 决策支撑
                                              │
每月归档 ──────── magic-sdd-generator ───→ 架构文档 → 版本记录
                                              │
系统自扩展 ────── skill-creator ──────────→ 新进化技能 → 规则模板 → 能力扩展
```

---

## 7. 实施路线图

### Phase 1：感知基建（第1-2周）

**目标**：建立数据采集基础，让进化系统"看得见"。

1. 创建 Prisma Schema 中所有 `Evo*` 模型
2. 实现 `behavior-collector.ts` + `BehaviorTracker.tsx` Provider
3. 实现 `error-listener.ts` + `ErrorReporter.tsx` Provider
4. 实现 `feedback-collector.ts` + `FeedbackWidget.tsx` 组件
5. 创建 `/api/evo/behavior`, `/api/evo/feedback` 上报路由
6. 在核心页面（知音之境、六字诀、五音疗愈）埋入行为追踪

**验证标准**：`EvoBehaviorEvent` 日均写入 ≥ 500 条，`EvoErrorSignal` 实时捕获错误

### Phase 2：分析引擎（第3-4周）

**目标**：让进化系统"懂分析"。

1. 实现 `behavior-pattern-recognizer.ts`（SQL聚合+规则引擎）
2. 实现 `healing-analyzer.ts`（复用已有 `Checkin.healingDone` 数据）
3. 实现 `problem-diagnostician.ts`（错误聚类+根因映射）
4. 实现 `knowledge-distiller.ts`（模式→知识提炼）
5. 创建 `/api/evo/dashboard` 数据接口
6. 搭建 `EvoDashboard.tsx` 基础版

**验证标准**：系统自动识别出 ≥3 个行为模式，疗愈效果周报可查看

### Phase 3：决策与执行（第5-6周）

**目标**：让进化系统"能行动"。

1. 实现 `strategy-engine.ts`（五行权重决策）
2. 实现 `self-repair-engine.ts`（内置6条修复规则）
3. 实现 `prompt-optimizer.ts`（对接 `prompt-engineer` 技能）
4. 实现 `experiment-allocator.ts`（A/B测试框架）
5. 实现 `approval-gateway.ts`（审批流程）
6. 创建 `/api/evo/approval/*` 审批路由

**验证标准**：自修复引擎成功修复 ≥1 个已知错误模式，A/B实验框架可分配流量

### Phase 4：闭环与进化（第7-8周）

**目标**：让进化系统"会学习"。

1. 实现 `effect-tracker.ts` + `rollback-engine.ts`
2. 实现 `knowledge-solidifier.ts`
3. 实现 `daily-check.ts` + `weekly-evolve.ts` + `monthly-expand.ts`
4. 实现 `cron-runner.ts`（对接 `scheduler` 技能或外部 cron）
5. 集成所有8个技能的调用链
6. 完善 `EvoDashboard.tsx` 全功能版（仪表盘+审批+回滚）

**验证标准**：完成一次完整的 日检→周进化→月扩充 闭环，至少1条知识从 draft→deployed

---

## 8. 安全与约束

| 约束 | 说明 |
|------|------|
| **数据隐私** | 行为数据仅采集匿名ID+操作类型，不含诊断原文、用户姓名等PII |
| **审批门槛** | 自动执行仅限 `risk=low` 的操作；`risk=medium/high` 必须人工审批 |
| **回滚保障** | 所有变更保留 before 快照，7天内指标恶化超阈值自动回滚 |
| **执行频率** | 自修复单规则冷却 ≥60s；策略执行单日上限 ≤10 次 |
| **资源约束** | 每日自检 ≤10min CPU；每周进化 ≤1h；每月扩充 ≤4h |
| **SQLite性能** | 行为事件批量写入（20条/批），7天后自动归档到归档表 |
| **技能调用限制** | 技能调用仅在 L4 执行层触发，L1-L3 不直接调用外部技能 |
| **离线容错** | 调度器不可用时，核心功能（疗愈/功法）不受影响 |

---

## 9. 进化指标体系

### 核心KPI

| 指标 | 计算方式 | 基线目标 | 进化目标 |
|------|---------|---------|---------|
| 疗愈改善率 | `avg(moodAfter - moodBefore) / 5` | ≥0.3 | 持续提升 |
| 功法完成率 | `practice_complete / practice_start` | ≥60% | ≥75% |
| 日活留存率 | 7日留存 | ≥30% | ≥45% |
| 错误率 | `errors / sessions` | <5% | <2% |
| NPS | 推荐者%-贬损者% | ≥20 | ≥40 |
| 知识增长率 | 月新增 validated 知识数 | ≥5 | ≥10 |

### 进化引擎自身指标

| 指标 | 说明 |
|------|------|
| 自修复成功率 | 自动修复成功次数 / 总修复次数 |
| 策略执行率 | 已执行策略 / 已批准策略 |
| 回滚率 | 回滚次数 / 总执行次数 |
| 知识转化率 | deployed知识 / 总提炼知识 |
| 审批响应时间 | 审批平均耗时 |
| 假阳性率 | 误报问题数 / 总报告问题数 |