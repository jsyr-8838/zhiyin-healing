/**
 * 知音进化系统 — L1 感知层客户端 SDK
 * 
 * 职责：行为埋点、错误监听、反馈收集、生理信号采集
 * 设计：批量上报 + 离线缓存 + 静默降级（不影响用户体验）
 */

// ── 事件类型 ──
export type EvoEventType = 
  | 'page_view'       // 页面访问
  | 'action'          // 用户操作（点击/提交等）
  | 'error'           // 运行时错误
  | 'feedback'        // 用户反馈/评分
  | 'healing_session' // 疗愈会话完成
  | 'api_call'        // API 调用
  | 'performance';    // 性能指标

export type EvoModule = 
  | 'diagnose' | 'healing' | 'divination' | 'classics' 
  | 'meridian' | 'tianlai' | 'cultivation' | 'auth' | 'general';

export interface TrackEvent {
  eventType: EvoEventType;
  module: EvoModule;
  action: string;
  detail?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  duration?: number;
  score?: number;
  errorFingerprint?: string;
}

// ── 批量上报队列 ──
const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 15000; // 15秒
const MAX_QUEUE_SIZE = 50;     // 最大队列长度，超出强制刷新

let eventQueue: TrackEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let isInitialized = false;

/**
 * 生成错误指纹（简单 hash）
 */
function fingerprint(msg: string, source?: string): string {
  const raw = `${source || ''}:${msg}`.slice(0, 200);
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  }
  return `fp_${Math.abs(hash).toString(36)}`;
}

/**
 * 获取或创建会话 ID
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  let sid = sessionStorage.getItem('evo-session-id');
  if (!sid) {
    sid = `sid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem('evo-session-id', sid);
  }
  return sid;
}

/**
 * 批量上报事件到后端
 */
async function flushQueue(): Promise<void> {
  if (eventQueue.length === 0) return;

  const batch = eventQueue.splice(0, eventQueue.length);

  try {
    // 逐条上报（批量接口暂不实现，逐条保证可靠性）
    const promises = batch.map(event =>
      fetch('/api/evo/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        keepalive: true, // 页面卸载时也能发送
      }).catch(() => {
        // 上报失败，静默回填队列（最多保留 MAX_QUEUE_SIZE）
        if (eventQueue.length < MAX_QUEUE_SIZE) {
          eventQueue.push(event);
        }
      })
    );
    await Promise.allSettled(promises);
  } catch {
    // 静默失败，不影响用户体验
  }
}

/**
 * 添加事件到队列
 */
function enqueue(event: TrackEvent): void {
  eventQueue.push(event);

  // 超出最大长度，强制刷新
  if (eventQueue.length >= MAX_QUEUE_SIZE) {
    flushQueue();
  }
}

// ── 公开 API ──

/**
 * 初始化进化感知层
 * - 注册全局错误监听
 * - 启动定时刷新
 * - 绑定页面卸载刷新
 */
export function initEvoTracker(userId?: string): void {
  if (isInitialized || typeof window === 'undefined') return;
  isInitialized = true;

  const sid = getSessionId();

  // 保存 userId 到 sessionStorage
  if (userId) {
    sessionStorage.setItem('evo-user-id', userId);
  }

  // 1. 注册全局错误监听
  window.addEventListener('error', (e) => {
    enqueue({
      eventType: 'error',
      module: 'general',
      action: 'runtime_error',
      detail: {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
      },
      errorFingerprint: fingerprint(e.message, e.filename),
      sessionId: sid,
      userId: userId || sessionStorage.getItem('evo-user-id') || undefined,
    });
  });

  // 2. 注册未捕获 Promise rejection
  window.addEventListener('unhandledrejection', (e) => {
    const msg = String(e.reason?.message || e.reason || 'unknown');
    enqueue({
      eventType: 'error',
      module: 'general',
      action: 'unhandled_rejection',
      detail: { reason: msg },
      errorFingerprint: fingerprint(msg),
      sessionId: sid,
      userId: userId || sessionStorage.getItem('evo-user-id') || undefined,
    });
  });

  // 3. 定时刷新
  flushTimer = setInterval(flushQueue, FLUSH_INTERVAL);

  // 4. 页面卸载时刷新
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushQueue();
    }
  });

  // 5. 页面关闭前刷新
  window.addEventListener('beforeunload', () => {
    if (eventQueue.length > 0) {
      // 使用 sendBeacon 作为兜底
      const payload = JSON.stringify(eventQueue.splice(0));
      navigator.sendBeacon?.('/api/evo/track', payload);
    }
  });
}

/**
 * 销毁感知层（清理定时器和监听器）
 */
export function destroyEvoTracker(): void {
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
  flushQueue();
  isInitialized = false;
}

/**
 * 追踪事件
 */
export function trackEvent(event: Omit<TrackEvent, 'sessionId' | 'userId'>): void {
  const sid = typeof window !== 'undefined' ? getSessionId() : 'server';
  const uid = typeof window !== 'undefined' ? sessionStorage.getItem('evo-user-id') : undefined;

  enqueue({
    ...event,
    sessionId: sid,
    userId: uid || undefined,
  });
}

/**
 * 追踪页面访问
 */
export function trackPageView(module: EvoModule, page: string, detail?: Record<string, unknown>): void {
  trackEvent({
    eventType: 'page_view',
    module,
    action: 'page_view',
    detail: { page, ...detail },
  });
}

/**
 * 追踪用户操作
 */
export function trackAction(module: EvoModule, action: string, detail?: Record<string, unknown>): void {
  trackEvent({
    eventType: 'action',
    module,
    action,
    detail,
  });
}

/**
 * 追踪用户反馈/评分
 */
export function trackFeedback(module: EvoModule, action: string, score: number, detail?: Record<string, unknown>): void {
  trackEvent({
    eventType: 'feedback',
    module,
    action,
    score,
    detail,
  });
}

/**
 * 追踪疗愈会话
 */
export function trackHealingSession(module: EvoModule, action: string, duration: number, detail?: Record<string, unknown>): void {
  trackEvent({
    eventType: 'healing_session',
    module,
    action,
    duration,
    detail,
  });
}

/**
 * 追踪 API 调用
 */
export function trackApiCall(module: EvoModule, endpoint: string, status: number, duration: number, detail?: Record<string, unknown>): void {
  trackEvent({
    eventType: 'api_call',
    module,
    action: endpoint,
    duration,
    detail: { status, ...detail },
  });
}

/**
 * 追踪性能指标
 */
export function trackPerformance(module: EvoModule, metric: string, value: number, detail?: Record<string, unknown>): void {
  trackEvent({
    eventType: 'performance',
    module,
    action: metric,
    detail: { value, ...detail },
  });
}
