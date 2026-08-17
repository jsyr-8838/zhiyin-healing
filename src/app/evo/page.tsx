'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { WUXING_STRATEGY_META, type WuXingStrategy } from '@/lib/evo/engine';

// ── 类型 ──
interface DashboardData {
  totalLogs: number;
  successRate: number;
  knowledgeCount: number;
  promptVersions: number;
  repairRules: number;
  recentLogs: {
    id: string;
    actionType: string;
    strategy: string;
    status: string;
    startedAt: string;
  }[];
}

interface TaskResult {
  tasksTotal: number;
  tasksSuccess: number;
  tasksFailed: number;
  details: string[];
}

// ── 五行色体系（与设计系统对齐）──
const WUXING = {
  wood:  { hex: '#5d8a63', glow: 'rgba(93,138,99,0.25)',  bg: 'rgba(93,138,99,0.08)',  ring: 'rgba(93,138,99,0.5)' },
  fire:  { hex: '#c26158', glow: 'rgba(194,97,88,0.25)',   bg: 'rgba(194,97,88,0.08)',  ring: 'rgba(194,97,88,0.5)' },
  earth: { hex: '#c9a94f', glow: 'rgba(201,169,79,0.25)',  bg: 'rgba(201,169,79,0.08)', ring: 'rgba(201,169,79,0.5)' },
  metal: { hex: '#5ba09a', glow: 'rgba(91,160,154,0.25)',  bg: 'rgba(91,160,154,0.08)', ring: 'rgba(91,160,154,0.5)' },
  water: { hex: '#3d7a75', glow: 'rgba(61,122,117,0.25)',  bg: 'rgba(61,122,117,0.08)', ring: 'rgba(61,122,117,0.5)' },
} as const;

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  success:    { label: '成功', color: WUXING.wood.hex },
  running:    { label: '运行中', color: WUXING.earth.hex },
  failed:     { label: '失败', color: WUXING.fire.hex },
  rolled_back: { label: '已回滚', color: '#666' },
};

// ── 脉搏动画组件 ──
function PulseDot({ color, size = 8 }: { color: string; size?: number }) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      <span
        className="absolute inset-0 rounded-full animate-ping"
        style={{ backgroundColor: color, opacity: 0.4 }}
      />
      <span
        className="relative rounded-full"
        style={{ width: size, height: size, backgroundColor: color }}
      />
    </span>
  );
}

// ── 五行环脉动画 ──
function WuXingOrb() {
  return (
    <div className="relative w-48 h-48 mx-auto mb-6">
      {/* 外环脉冲 */}
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          background: `conic-gradient(from 0deg, ${WUXING.wood.hex}33, ${WUXING.fire.hex}33, ${WUXING.earth.hex}33, ${WUXING.metal.hex}33, ${WUXING.water.hex}33, ${WUXING.wood.hex}33)`,
          animationDuration: '4s',
        }}
      />
      <div
        className="absolute inset-1 rounded-full"
        style={{ background: '#0d0d14' }}
      />
      {/* 内环 */}
      <div
        className="absolute inset-3 rounded-full animate-spin"
        style={{
          background: `conic-gradient(from 0deg, ${WUXING.wood.hex}55, transparent 18%, ${WUXING.fire.hex}55 20%, transparent 38%, ${WUXING.earth.hex}55 40%, transparent 58%, ${WUXING.metal.hex}55 60%, transparent 78%, ${WUXING.water.hex}55 80%, transparent 98%)`,
          animationDuration: '20s',
        }}
      />
      <div
        className="absolute inset-4 rounded-full"
        style={{ background: '#0d0d14' }}
      />
      {/* 中心文字 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-4xl select-none"
          style={{ fontWeight: 800, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.08em' }}
        >
          进化
        </span>
      </div>
    </div>
  );
}

// ── 指标卡片 ──
function MetricCard({ label, value, suffix, accent }: { label: string; value: number; suffix: string; accent: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* 顶部色条 */}
      <div
        className="absolute top-0 left-4 right-4 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      <div className="text-[11px] tracking-widest uppercase mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl tabular-nums" style={{ fontWeight: 780, color: accent }}>
          {value}
        </span>
        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>{suffix}</span>
      </div>
    </div>
  );
}

// ── 五行策略卡片 ──
function StrategyCard({ strategy, meta }: { strategy: WuXingStrategy; meta: typeof WUXING_STRATEGY_META.wood }) {
  const w = WUXING[strategy];
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-4 group transition-all duration-300 hover:scale-[1.03]"
      style={{
        background: w.bg,
        border: `1px solid ${w.hex}33`,
      }}
    >
      {/* 辉光角标 */}
      <div
        className="absolute -top-8 -right-8 w-16 h-16 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity"
        style={{ background: w.hex }}
      />
      <div className="relative">
        <div className="text-lg mb-0.5" style={{ fontWeight: 760, color: w.hex }}>
          {meta.emoji} {meta.label}
        </div>
        <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {meta.direction}
        </div>
      </div>
    </div>
  );
}

// ── 调度卡片 ──
function ScheduleCard({
  task,
  isRunning,
  onTrigger,
}: {
  task: {
    label: string;
    desc: string;
    endpoint: string;
    strategy: WuXingStrategy;
    duration: string;
    cron: string;
  };
  isRunning: boolean;
  onTrigger: (endpoint: string, label: string) => void;
}) {
  const w = WUXING[task.strategy];
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid ${w.hex}22`,
      }}
    >
      {/* 左侧色条 */}
      <div
        className="absolute top-4 bottom-4 left-0 w-0.5 rounded-full"
        style={{ background: w.hex }}
      />
      <div className="pl-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-base" style={{ fontWeight: 760, color: w.hex }}>
            {task.label}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: w.bg, color: w.hex }}>
            {task.cron}
          </span>
        </div>
        <p className="text-[12px] mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {task.desc}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            预计 {task.duration}
          </span>
          <button
            onClick={() => onTrigger(task.endpoint, task.label)}
            disabled={isRunning}
            className="relative px-5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 overflow-hidden"
            style={{
              background: isRunning ? 'rgba(255,255,255,0.05)' : w.bg,
              color: isRunning ? 'rgba(255,255,255,0.3)' : w.hex,
              border: `1px solid ${isRunning ? 'rgba(255,255,255,0.06)' : w.hex + '44'}`,
              cursor: isRunning ? 'not-allowed' : 'pointer',
            }}
          >
            {isRunning ? (
              <span className="flex items-center gap-2">
                <PulseDot color={w.hex} size={6} />
                执行中
              </span>
            ) : '手动触发'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 主页面 ──
export default function EvoDashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningTask, setRunningTask] = useState<string | null>(null);
  const [taskResult, setTaskResult] = useState<TaskResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/evo/dashboard');
      if (res.ok) setDashboard(await res.json());
    } catch { /* 静默 */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const runTask = async (endpoint: string, label: string) => {
    setRunningTask(label);
    setTaskResult(null);
    setShowResult(false);
    try {
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      setTaskResult(data);
      setShowResult(true);
      await fetchDashboard();
    } catch (err) {
      setTaskResult({ tasksTotal: 0, tasksSuccess: 0, tasksFailed: 0, details: [String(err)] });
      setShowResult(true);
    } finally {
      setRunningTask(null);
    }
  };

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#08080d' }}>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full animate-pulse"
            style={{ background: `conic-gradient(from 0deg, ${WUXING.wood.hex}44, ${WUXING.fire.hex}44, ${WUXING.earth.hex}44, ${WUXING.metal.hex}44, ${WUXING.water.hex}44)` }}
          />
          <div className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>进化引擎唤醒中...</div>
        </div>
      </div>
    );
  }

  const metrics = [
    { label: '进化日志', value: dashboard?.totalLogs || 0, suffix: '条', accent: WUXING.earth.hex },
    { label: '成功率', value: dashboard?.successRate || 0, suffix: '%', accent: WUXING.wood.hex },
    { label: '知识条目', value: dashboard?.knowledgeCount || 0, suffix: '条', accent: WUXING.water.hex },
    { label: '提示词版本', value: dashboard?.promptVersions || 0, suffix: '个', accent: WUXING.fire.hex },
    { label: '修复规则', value: dashboard?.repairRules || 0, suffix: '条', accent: WUXING.metal.hex },
  ];

  const schedules = [
    {
      label: '每日自检',
      desc: '错误扫描、修复规则匹配、基础指标采集',
      endpoint: '/api/evo/daily-check',
      strategy: 'earth' as WuXingStrategy,
      duration: '5-10min',
      cron: '03:00',
    },
    {
      label: '每周深度进化',
      desc: '提示词优化、内容扩充、UI改进',
      endpoint: '/api/evo/weekly-evolution',
      strategy: 'wood' as WuXingStrategy,
      duration: '30-60min',
      cron: '周一 04:00',
    },
    {
      label: '每月知识扩充',
      desc: '深度调研、知识库更新、策略调整',
      endpoint: '/api/evo/monthly-expansion',
      strategy: 'water' as WuXingStrategy,
      duration: '2-4h',
      cron: '1日 02:00',
    },
  ];

  return (
    <div className="min-h-screen text-gray-100" style={{ background: '#08080d' }}>
      {/* 全局纹理叠加 */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 py-8 md:px-8 md:py-12">
        {/* ── 标题区 ── */}
        <header className="mb-10">
          <WuXingOrb />
          <h1
            className="text-center text-3xl md:text-4xl tracking-[0.12em] mb-2"
            style={{ fontWeight: 800, color: 'rgba(255,255,255,0.9)' }}
          >
            知音进化引擎
          </h1>
          <p className="text-center text-[13px] tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.25)' }}>
            L1 感知 → L2 分析 → L3 决策 → L4 执行 → L5 反馈
          </p>
        </header>

        {/* ── 核心指标 ── */}
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </section>

        {/* ── 五行策略 ── */}
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
          {(Object.entries(WUXING_STRATEGY_META) as [WuXingStrategy, typeof WUXING_STRATEGY_META.wood][]).map(
            ([key, meta]) => <StrategyCard key={key} strategy={key} meta={meta} />
          )}
        </section>

        {/* ── 三级调度 ── */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)' }} />
            <h2 className="text-sm tracking-[0.2em] uppercase" style={{ fontWeight: 760, color: 'rgba(255,255,255,0.5)' }}>
              三级调度
            </h2>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {schedules.map((task) => (
              <ScheduleCard
                key={task.label}
                task={task}
                isRunning={runningTask === task.label}
                onTrigger={runTask}
              />
            ))}
          </div>
        </section>

        {/* ── 执行结果 ── */}
        {taskResult && showResult && (
          <section
            className="mb-8 rounded-2xl p-5 overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm tracking-[0.15em] uppercase" style={{ fontWeight: 760, color: 'rgba(255,255,255,0.5)' }}>
                执行结果
              </h2>
              <button
                onClick={() => setShowResult(false)}
                className="text-xs px-2 py-1 rounded"
                style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)' }}
              >
                关闭
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {[
                { label: '总任务', value: taskResult.tasksTotal, color: 'rgba(255,255,255,0.7)' },
                { label: '成功', value: taskResult.tasksSuccess, color: WUXING.wood.hex },
                { label: '失败', value: taskResult.tasksFailed, color: WUXING.fire.hex },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-[11px] mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.label}</div>
                  <div className="text-2xl tabular-nums" style={{ fontWeight: 780, color: item.color }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
            {taskResult.details.length > 0 && (
              <div
                className="rounded-lg p-3 space-y-0.5 font-mono text-[11px]"
                style={{ background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.4)' }}
              >
                {taskResult.details.map((d, i) => (
                  <div key={i}>{d}</div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── 最近进化日志 ── */}
        <section ref={logRef}>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)' }} />
            <h2 className="text-sm tracking-[0.2em] uppercase" style={{ fontWeight: 760, color: 'rgba(255,255,255,0.5)' }}>
              最近进化日志
            </h2>
            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1))' }} />
          </div>
          {dashboard?.recentLogs && dashboard.recentLogs.length > 0 ? (
            <div className="space-y-2">
              {dashboard.recentLogs.map((log, idx) => {
                const strategy = log.strategy as WuXingStrategy;
                const w = WUXING[strategy] || WUXING.earth;
                const status = STATUS_MAP[log.status] || STATUS_MAP.success;
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/[0.03]"
                    style={{
                      background: idx === 0 ? w.bg : 'transparent',
                      border: `1px solid ${idx === 0 ? w.hex + '22' : 'rgba(255,255,255,0.04)'}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <PulseDot color={w.hex} size={6} />
                      <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>{log.actionType}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-full"
                        style={{ background: status.color + '15', color: status.color }}
                      >
                        {status.label}
                      </span>
                      <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                        {new Date(log.startedAt).toLocaleString('zh-CN')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.15)' }}>暂无进化日志</div>
              <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.1)' }}>触发上方调度任务，开启进化之旅</div>
            </div>
          )}
        </section>

        {/* ── 页脚 ── */}
        <footer className="mt-16 text-center">
          <div className="h-px mb-6" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
          <p className="text-[11px] tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.15)' }}>
            知音进化引擎 · 自我学习 · 持续进化 · 疗愈万物
          </p>
        </footer>
      </div>
    </div>
  );
}
