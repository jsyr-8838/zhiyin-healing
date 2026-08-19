'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import BottomNav from '@/components/BottomNav';
import { useAppStore } from '@/lib/store';
import { consolidateDiagnosis } from '@/lib/unified-diagnosis';
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  Music,
  Flame,
  Leaf,
  Heart,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

export default function ComprehensivePage() {
  const {
    unifiedDiagnosis,
    diagnosisFlow,
    completeDiagnosisFlow,
    clearUnifiedDiagnosis,
  } = useAppStore();

  const consolidated = useMemo(
    () => consolidateDiagnosis(unifiedDiagnosis),
    [unifiedDiagnosis],
  );

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState('');
  const [error, setError] = useState('');

  // 发起AI综合分析
  const fetchComprehensiveDiagnosis = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    setReport('');

    try {
      const res = await fetch('/api/comprehensive-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jiuZhong: unifiedDiagnosis.jiuZhong,
          wuXing: unifiedDiagnosis.wuXing,
          tongue: unifiedDiagnosis.tongue,
          face: unifiedDiagnosis.face,
          hand: unifiedDiagnosis.hand,
        }),
      });

      // 检查是否为流式响应
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream')) {
        // SSE 流式处理
        const reader = res.body?.getReader();
        if (!reader) throw new Error('无法读取响应流');

        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split('\n');

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const jsonStr = trimmed.slice(6);
            if (jsonStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.content) {
                accumulated += parsed.content;
                setReport(accumulated);
              }
            } catch {
              /* skip */
            }
          }
        }
      } else {
        // JSON 非流式响应（离线模式）
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setReport(data.content || '分析完成，但未返回内容');
        }
      }

      // 完成流水线
      completeDiagnosisFlow();
    } catch (err) {
      setError('分析请求失败：' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [loading, unifiedDiagnosis, completeDiagnosisFlow]);

  // 重新分析
  const reanalyze = useCallback(() => {
    setReport('');
    setError('');
    fetchComprehensiveDiagnosis();
  }, [fetchComprehensiveDiagnosis]);

  // 完全重置
  const resetAll = useCallback(() => {
    clearUnifiedDiagnosis();
    setReport('');
    setError('');
  }, [clearUnifiedDiagnosis]);

  // 简易 Markdown 渲染
  const renderMarkdown = (text: string) => {
    return text
      .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold font-serif text-gray-800 mt-5 mb-2 border-l-[3px] border-amber-400 pl-2">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold font-serif text-gray-700 mt-3 mb-1">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<span class="font-bold text-gray-900">$1</span>')
      .replace(/^- (.+)$/gm, '<li class="text-xs text-gray-600 ml-4 list-disc">$1</li>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  };

  const completedCount = [
    unifiedDiagnosis.jiuZhong,
    unifiedDiagnosis.wuXing,
    unifiedDiagnosis.tongue,
    unifiedDiagnosis.face,
    unifiedDiagnosis.hand,
  ].filter(Boolean).length;

  return (
    <PageContainer theme="diagnose" className="pb-24">
      {/* 头部 */}
      <div
        className="px-5 pt-12 pb-8 text-white"
        style={{
          background:
            'linear-gradient(150deg, rgba(93,138,99,0.9), rgba(61,97,66,0.95))',
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={20} />
          <h1 className="text-xl font-black" style={{ letterSpacing: '0.12em' }}>
综合明辨分析
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>
          AI汇总{completedCount}项诊断 · 全面体质辨识 · 个性化方案
        </p>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {/* 数据源概览 */}
        <div className="glass-card p-4">
          <h3
            className="text-sm font-bold font-serif mb-3"
            style={{ color: '#456b4e' }}
          >
            诊断数据源
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {[
              {
                key: 'jiuzhong',
                name: '九种体质',
                done: !!unifiedDiagnosis.jiuZhong,
                detail: unifiedDiagnosis.jiuZhong?.primaryType,
              },
              {
                key: 'wuxing',
                name: '五行体质',
                done: !!unifiedDiagnosis.wuXing,
                detail: unifiedDiagnosis.wuXing?.fiveElement ? unifiedDiagnosis.wuXing.fiveElement + '行' : undefined,
              },
              {
                key: 'tongue',
                name: '舌诊',
                done: !!unifiedDiagnosis.tongue,
                detail: unifiedDiagnosis.tongue?.constitution ? unifiedDiagnosis.tongue.constitution + '质' : undefined,
              },
              {
                key: 'hand',
                name: '手诊',
                done: !!unifiedDiagnosis.hand,
                detail: unifiedDiagnosis.hand?.constitution ? unifiedDiagnosis.hand.constitution + '质' : undefined,
              },
              {
                key: 'face',
                name: '面诊',
                done: !!unifiedDiagnosis.face,
                detail: unifiedDiagnosis.face?.constitution ? unifiedDiagnosis.face.constitution + '质' : undefined,
              },
            ].map((src) => (
              <div
                key={src.key}
                className={`text-center p-2 rounded-lg ${
                  src.done ? 'bg-emerald-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex justify-center mb-1">
                  {src.done ? (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <p
                  className={`text-[10px] font-bold ${
                    src.done ? 'text-emerald-700' : 'text-gray-400'
                  }`}
                >
                  {src.name}
                </p>
                {src.detail && (
                  <p className="text-[9px] text-gray-500 mt-0.5">
                    {src.detail}
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            已完成 {completedCount}/5 项诊断
          </p>
        </div>

        {/* 快速体质概要（基于投票算法） */}
        {consolidated.completedModules.length > 0 && (
          <div className="glass-card p-4 ring-1 ring-amber-400/30">
            <h3
              className="text-sm font-bold font-serif mb-2 flex items-center gap-2"
              style={{ color: '#456b4e' }}
            >
              <span className="border-l-[3px] border-amber-400 pl-2">
                投票算法快速概要
              </span>
            </h3>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-lg font-black font-serif" style={{ color: '#27342c' }}>
                  {consolidated.primaryConstitution}
                </p>
                <p className="text-[10px] text-gray-400">综合体质</p>
              </div>
              <div className="w-px h-10 bg-amber-400/20" />
              <div className="text-center">
                <p className="text-base font-bold" style={{ color: '#456b4e' }}>
                  {consolidated.primaryElement}行
                </p>
                <p className="text-[10px] text-gray-400">五行偏性</p>
              </div>
              <div className="w-px h-10 bg-amber-400/20" />
              <div className="text-center">
                <p className="text-base font-bold" style={{ color: '#456b4e' }}>
                  {consolidated.primaryWuYin}音
                </p>
                <p className="text-[10px] text-gray-400">推荐五音</p>
              </div>
            </div>
          </div>
        )}

        {/* AI综合分析按钮 */}
        {!report && !loading && (
          <button
            onClick={fetchComprehensiveDiagnosis}
            disabled={completedCount === 0}
            className="w-full py-4 rounded-xl text-white font-bold font-serif text-sm tracking-wider shadow-lg active:scale-[0.98] transition-transform disabled:opacity-40"
            style={{
              background:
                'linear-gradient(135deg, #4a7c59, #d4a843)',
            }}
          >
            <Sparkles size={18} className="inline mr-2 -mt-0.5" />
            AI综合明辨分析
            <ArrowRight size={16} className="inline ml-1 -mt-0.5" />
          </button>
        )}

        {/* 加载状态 */}
        {loading && (
          <div className="glass-card p-8 text-center">
            <Loader2
              size={32}
              className="mx-auto mb-3 animate-spin"
              style={{ color: '#456b4e' }}
            />
            <p className="text-sm font-serif" style={{ color: '#456b4e' }}>
              AI正在综合分析...
            </p>
            <p className="text-xs text-gray-400 mt-1">
              汇总{completedCount}项诊断数据，生成个性化报告
            </p>
          </div>
        )}

        {/* AI报告内容 */}
        {report && (
          <div className="glass-card p-5 space-y-1">
            <div
              dangerouslySetInnerHTML={{ __html: renderMarkdown(report) }}
              className="text-sm leading-relaxed text-gray-700 font-serif"
            />
          </div>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm font-bold text-red-700">分析失败</p>
            <p className="text-xs text-red-500 mt-1">{error}</p>
            <button
              onClick={reanalyze}
              className="mt-2 text-xs text-red-600 font-bold underline"
            >
              重试
            </button>
          </div>
        )}

        {/* 疗愈方案快速入口 */}
        {consolidated.completedModules.length > 0 && (
          <div className="space-y-3">
            <h3
              className="text-sm font-bold font-serif"
              style={{ color: '#456b4e' }}
            >
              个性化疗愈入口
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/healing/wuyin"
                className="glass-card p-3 text-center hover:shadow-md transition"
              >
                <Music
                  size={20}
                  className="mx-auto mb-1.5"
                  style={{ color: '#456b4e' }}
                />
                <p className="text-xs font-bold font-serif text-gray-800">
                  五音疗愈
                </p>
                <p className="text-[10px] text-gray-400">
                  {consolidated.healingPlan.wuyin.tone}音调理
                </p>
              </Link>
              <Link
                href="/jiuliao"
                className="glass-card p-3 text-center hover:shadow-md transition"
              >
                <Flame
                  size={20}
                  className="mx-auto mb-1.5 text-amber-500"
                />
                <p className="text-xs font-bold font-serif text-gray-800">
                  灸疗处方
                </p>
                <p className="text-[10px] text-gray-400">
                  {consolidated.healingPlan.jiuLiao.meridian}
                </p>
              </Link>
              <Link
                href="/healing/liuzijue"
                className="glass-card p-3 text-center hover:shadow-md transition"
              >
                <Leaf
                  size={20}
                  className="mx-auto mb-1.5 text-emerald-500"
                />
                <p className="text-xs font-bold font-serif text-gray-800">
                  六字诀
                </p>
                <p className="text-[10px] text-gray-400">
                  「{consolidated.healingPlan.liuZiJue.sound}」字诀
                </p>
              </Link>
              <Link
                href="/healing/ai-diagnosis"
                className="glass-card p-3 text-center hover:shadow-md transition"
              >
                <Heart
                  size={20}
                  className="mx-auto mb-1.5 text-red-400"
                />
                <p className="text-xs font-bold font-serif text-gray-800">
                  AI导诊
                </p>
                <p className="text-[10px] text-gray-400">深度咨询</p>
              </Link>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="space-y-3">
          {report && (
            <button
              onClick={reanalyze}
              className="w-full py-3 rounded-xl text-sm font-serif text-gray-500 border border-gray-200 flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={14} />
              重新分析
            </button>
          )}

          <Link
            href="/healing"
            className="w-full py-3.5 rounded-xl text-white font-bold font-serif text-sm flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(145deg, #6e9e74, #8fc8bd)',
            }}
          >
            返回疗愈首页 <ArrowRight size={16} />
          </Link>

          <button
            onClick={resetAll}
            className="w-full py-3 rounded-xl text-xs text-gray-400 border border-gray-100"
          >
            清空所有诊断数据
          </button>
        </div>
      </div>

      <BottomNav />
    </PageContainer>
  );
}
