'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useCultivationStore } from '@/lib/cultivation-store';
import { generateDailyPractice, type DailyPractice, type PracticeStep } from '@/lib/daily-practice';
import { ELEMENT_COLORS, ELEMENT_NAMES, ELEMENT_ORGANS, type WuxingElement } from '@/lib/cultivation-engine';
import { Check, ArrowRight, Zap, Wind, Droplets } from 'lucide-react';

export default function DailyPracticeCard() {
  const { xiuwei, todayCompleted, todayDate, completeTodayStep } = useCultivationStore();
  const [practice, setPractice] = useState<DailyPractice | null>(null);

  useEffect(() => {
    const dp = generateDailyPractice(null, todayCompleted);
    setPractice(dp);
  }, [todayCompleted]);

  if (!practice) return null;

  const elementColor = ELEMENT_COLORS[practice.element];
  const allDone = practice.steps.every(s => s.done);
  const doneCount = practice.steps.filter(s => s.done).length;

  return (
    <div className="rounded-2xl overflow-hidden" style={{
      background: `linear-gradient(145deg, rgba(255,255,255,0.6), rgba(255,255,255,0.35))`,
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.6)',
      boxShadow: `0 8px 32px rgba(30,45,38,0.08), inset 0 1px 0 rgba(255,255,255,0.8)`,
    }}>
      {/* 顶部：时辰 + 问候 */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: elementColor }}>
              <Zap size={16} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: 'var(--ink-main)' }}>今日功法</p>
              <p className="text-[10px]" style={{ color: 'var(--ink-light)' }}>{practice.shichen}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: 'var(--ink-light)' }}>{practice.greeting}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] font-bold" style={{ color: elementColor }}>
                {ELEMENT_NAMES[practice.element]}行 · {practice.organ}经
              </span>
            </div>
          </div>
        </div>

        {/* 完成进度条 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(30,45,38,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(doneCount / practice.steps.length) * 100}%`,
                background: `linear-gradient(90deg, ${elementColor}, ${elementColor}88)`,
              }}
            />
          </div>
          <span className="text-[10px] font-bold tabular-nums" style={{ color: elementColor }}>
            {doneCount}/{practice.steps.length}
          </span>
        </div>
      </div>

      {/* 三步功法 */}
      <div className="px-5 pb-5 space-y-2.5">
        {practice.steps.map((step, i) => (
          <PracticeStepRow key={step.type} step={step} index={i} onComplete={() => completeTodayStep(step.type)} />
        ))}
      </div>

      {/* 全部完成 */}
      {allDone && (
        <div className="mx-5 mb-5 py-3 rounded-xl text-center" style={{
          background: `linear-gradient(135deg, ${elementColor}18, ${elementColor}08)`,
          border: `1px solid ${elementColor}20`,
        }}>
          <p className="font-bold text-sm" style={{ color: elementColor }}>今日功法已圆满</p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--ink-light)' }}>修为精进，日日不辍</p>
        </div>
      )}
    </div>
  );
}

function PracticeStepRow({ step, index, onComplete }: { step: PracticeStep; index: number; onComplete: () => void }) {
  const elementColor = ELEMENT_COLORS[step.element];

  return (
    <Link
      href={step.href}
      className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.01]"
      style={{
        background: step.done ? `${elementColor}08` : 'rgba(30,45,38,0.02)',
        border: `1px solid ${step.done ? elementColor + '20' : 'transparent'}`,
      }}
      onClick={() => {
        if (!step.done) {
          onComplete();
        }
      }}
    >
      {/* 序号/完成标记 */}
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{
        background: step.done ? `${elementColor}15` : 'rgba(30,45,38,0.06)',
        color: step.done ? elementColor : 'var(--ink-light)',
      }}>
        {step.done ? <Check size={14} /> : index + 1}
      </div>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm" style={{ color: step.done ? 'var(--ink-light)' : 'var(--ink-main)', textDecoration: step.done ? 'line-through' : 'none' }}>
            {step.label}
          </p>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${elementColor}12`, color: elementColor }}>
            {step.duration}
          </span>
        </div>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--ink-light)', opacity: 0.7 }}>{step.subLabel}</p>
      </div>

      {/* 右侧箭头 */}
      {!step.done && <ArrowRight size={14} style={{ color: 'var(--ink-light)', opacity: 0.4 }} />}
    </Link>
  );
}
