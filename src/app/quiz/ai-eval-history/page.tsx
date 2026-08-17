'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import PageContainer from '@/components/layout/PageContainer';
import {
  loadSessions,
  clearHistory,
  computeStats,
  type EvalSession,
  type QType,
} from '@/lib/ai-eval-history';
import { useCultivationStore } from '@/lib/cultivation-store';
import {
  ArrowLeft, Trash2, Trophy, Target, Flame, TrendingUp, Clock,
} from 'lucide-react';

const Q_TYPE_LABELS: Record<QType, string> = {
  location: '定位',
  indications: '主治',
  specialPoint: '特定穴',
  meridian: '归经',
  method: '取穴方法',
};

const DIM_COLORS: Record<QType, string> = {
  location: '#5d8a63',
  indications: '#c26158',
  specialPoint: '#c9a94f',
  meridian: '#5ba09a',
  method: '#3d7a75',
};

function formatTime(ms: number): string {
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}秒`;
  const min = Math.floor(sec / 60);
  const remainSec = sec % 60;
  return `${min}分${remainSec}秒`;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${h}:${m}`;
}

/** SVG 五维雷达图（小尺寸版） */
function MiniRadar({ subscores, size = 80 }: { subscores: { accuracy: number; coverage: number; key_terms: number; specificity: number; clarity: number }; size?: number }) {
  const dims = [
    { label: '准确性', value: subscores.accuracy },
    { label: '覆盖度', value: subscores.coverage },
    { label: '术语', value: subscores.key_terms },
    { label: '特异性', value: subscores.specificity },
    { label: '清晰度', value: subscores.clarity },
  ];
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;
  const points = dims.map((d, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const dist = (d.value / 5) * r;
    return `${cx + dist * Math.cos(angle)},${cy + dist * Math.sin(angle)}`;
  }).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.5, 1.0].map((frac) => {
        const ringPts = dims.map((_, i) => {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          return `${cx + r * frac * Math.cos(angle)},${cy + r * frac * Math.sin(angle)}`;
        }).join(' ');
        return <polygon key={frac} points={ringPts} fill="none" stroke="#e5e7eb" strokeWidth={0.5} />;
      })}
      <polygon points={points} fill="rgba(93,138,99,0.15)" stroke="#5d8a63" strokeWidth={1} />
    </svg>
  );
}

export default function AiEvalHistoryPage() {
  const [sessions, setSessions] = useState<EvalSession[]>(loadSessions);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const stats = useMemo(() => computeStats(sessions), [sessions]);
  const cultivation = useCultivationStore.getState();

  const handleClear = useCallback(() => {
    clearHistory();
    setSessions([]);
    setShowConfirmClear(false);
  }, []);

  return (
    <PageContainer theme="healing" className="text-gray-900 pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/quiz/ai-eval" className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-black">测评历史</h1>
            <p className="text-xs text-gray-400">AI 深度测评记录与统计</p>
          </div>
          {sessions.length > 0 && (
            <button
              onClick={() => setShowConfirmClear(!showConfirmClear)}
              className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* 确认清除 */}
        {showConfirmClear && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-sm text-red-700 mb-3">确定清除所有测评历史？此操作不可恢复。</p>
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition"
              >
                确定清除
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 bg-white text-gray-600 text-xs font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* ═══ 统计概览 ═══ */}
        {sessions.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
              <Trophy size={18} className="mx-auto mb-1 text-amber-500" />
              <div className="text-2xl font-black text-gray-900">{stats.totalSessions}</div>
              <div className="text-[10px] text-gray-400">测评轮次</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
              <Target size={18} className="mx-auto mb-1 text-emerald-500" />
              <div className="text-2xl font-black text-gray-900">{stats.totalPass}</div>
              <div className="text-[10px] text-gray-400">通过题目</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
              <TrendingUp size={18} className="mx-auto mb-1 text-blue-500" />
              <div className="text-2xl font-black text-gray-900">{stats.avgScore}</div>
              <div className="text-[10px] text-gray-400">平均得分</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
              <Flame size={18} className="mx-auto mb-1 text-red-500" />
              <div className="text-2xl font-black text-gray-900">{stats.streakPass}</div>
              <div className="text-[10px] text-gray-400">最长连续通过</div>
            </div>
          </div>
        )}

        {/* ═══ 维度通过率 ═══ */}
        {sessions.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
            <h3 className="text-xs font-bold text-gray-500 mb-3">维度通过率</h3>
            <div className="space-y-2">
              {(Object.keys(stats.dimCounts) as QType[]).map((d) => {
                const rate = stats.dimPassRates[d];
                const count = stats.dimCounts[d];
                if (count === 0) return null;
                return (
                  <div key={d} className="flex items-center gap-2 text-xs">
                    <span className="w-16 text-gray-500 shrink-0">{Q_TYPE_LABELS[d]}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${rate}%`,
                          background: rate >= 80 ? '#5d8a63' : rate >= 60 ? '#c9a94f' : '#c26158',
                        }}
                      />
                    </div>
                    <span className="w-10 text-right font-mono text-gray-600">{rate}%</span>
                    <span className="w-8 text-right text-gray-400">({count})</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ 历史列表 ═══ */}
        {sessions.length === 0 ? (
          <div className="text-center py-16">
            <Clock size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="text-gray-400 font-serif">暂无测评记录</p>
            <p className="text-xs text-gray-300 mt-1">完成 AI 深度测评后，记录将自动保存在这里</p>
            <Link
              href="/quiz/ai-eval"
              className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98]"
            >
              开始测评
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-500">测评记录</h3>
            {sessions.map((s, idx) => {
              const isExpanded = expandedIdx === idx;
              const passRate = s.questionCount > 0 ? Math.round((s.passCount / s.questionCount) * 100) : 0;
              // 汇总五维均分
              const avgSubs = s.answers.length > 0
                ? {
                    accuracy: s.answers.reduce((v, a) => v + a.subscores.accuracy, 0) / s.answers.length,
                    coverage: s.answers.reduce((v, a) => v + a.subscores.coverage, 0) / s.answers.length,
                    key_terms: s.answers.reduce((v, a) => v + a.subscores.key_terms, 0) / s.answers.length,
                    specificity: s.answers.reduce((v, a) => v + a.subscores.specificity, 0) / s.answers.length,
                    clarity: s.answers.reduce((v, a) => v + a.subscores.clarity, 0) / s.answers.length,
                  }
                : { accuracy: 0, coverage: 0, key_terms: 0, specificity: 0, clarity: 0 };

              return (
                <div
                  key={s.id}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden"
                >
                  {/* 摘要行 */}
                  <button
                    onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                        passRate >= 80 ? 'bg-emerald-500' : passRate >= 60 ? 'bg-amber-500' : 'bg-red-400'
                      }`}
                    >
                      {s.avgScore}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-700">{formatDate(s.startTime)}</span>
                        <span className="text-[10px] text-gray-400">
                          {s.questionCount}题 · {s.passCount}通过
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[120px]">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${passRate}%`,
                              background: passRate >= 80 ? '#5d8a63' : passRate >= 60 ? '#c9a94f' : '#c26158',
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400">{passRate}%</span>
                      </div>
                    </div>
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a7a60" strokeWidth="2"
                      style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {/* 展开详情 */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                      {/* 五维雷达 + 摘要 */}
                      <div className="flex items-center gap-4">
                        <MiniRadar subscores={avgSubs} size={90} />
                        <div className="flex-1 space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">耗时</span>
                            <span className="font-mono">{formatTime(s.endTime - s.startTime)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">修为获得</span>
                            <span className="font-mono text-emerald-600">+{s.totalXiuWei}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">维度</span>
                            <span>{s.selectedTypes.map((t) => Q_TYPE_LABELS[t]).join(' ')}</span>
                          </div>
                          {s.meridianFilter && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">经脉</span>
                              <span>{s.meridianFilter}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 题目列表 */}
                      <div className="space-y-2">
                        {s.answers.map((a, ai) => (
                          <div
                            key={ai}
                            className={`px-3 py-2 rounded-xl text-xs ${
                              a.pass ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${a.pass ? 'bg-emerald-500' : 'bg-red-400'}`}>
                                  {a.score}
                                </span>
                                <span className="font-bold text-gray-700">{a.pointName}</span>
                                <span className="text-gray-400">{a.meridianName}</span>
                              </div>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${DIM_COLORS[a.qType]}15`, color: DIM_COLORS[a.qType] }}>
                                {Q_TYPE_LABELS[a.qType]}
                              </span>
                            </div>
                            {!a.pass && (
                              <p className="text-[10px] text-red-500 truncate">{a.feedback}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </PageContainer>
  );
}
