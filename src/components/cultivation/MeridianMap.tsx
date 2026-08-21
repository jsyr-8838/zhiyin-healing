'use client';

import { useCultivationStore } from '@/lib/cultivation-store';
import { ELEMENT_COLORS, ELEMENT_NAMES, type WuxingElement } from '@/lib/cultivation-engine';
import { Check, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

/** 十二经脉数据 — 按子午流注顺序 */
const MERIDIAN_LIST = [
  { id: 'lung',            name: '手太阴肺经',   element: 'metal' as WuxingElement, time: '寅时 3-5时' },
  { id: 'largeIntestine',  name: '手阳明大肠经', element: 'metal' as WuxingElement, time: '卯时 5-7时' },
  { id: 'stomach',         name: '足阳明胃经',   element: 'earth' as WuxingElement, time: '辰时 7-9时' },
  { id: 'spleen',          name: '足太阴脾经',   element: 'earth' as WuxingElement, time: '巳时 9-11时' },
  { id: 'heart',           name: '手少阴心经',   element: 'fire' as WuxingElement,  time: '午时 11-13时' },
  { id: 'smallIntestine',  name: '手太阳小肠经', element: 'fire' as WuxingElement,  time: '未时 13-15时' },
  { id: 'bladder',         name: '足太阳膀胱经', element: 'water' as WuxingElement, time: '申时 15-17时' },
  { id: 'kidney',          name: '足少阴肾经',   element: 'water' as WuxingElement, time: '酉时 17-19时' },
  { id: 'pericardium',     name: '手厥阴心包经', element: 'fire' as WuxingElement,  time: '戌时 19-21时' },
  { id: 'tripleEnergizer', name: '手少阳三焦经', element: 'fire' as WuxingElement,  time: '亥时 21-23时' },
  { id: 'gallbladder',     name: '足少阳胆经',   element: 'wood' as WuxingElement,  time: '子时 23-1时' },
  { id: 'liver',           name: '足厥阴肝经',   element: 'wood' as WuxingElement,  time: '丑时 1-3时' },
];

export default function MeridianMap() {
  const { meridianProgs } = useCultivationStore();

  // 构建进度查找表
  const progMap = new Map(meridianProgs.map(m => [m.meridianId, m]));

  return (
    <div className="rounded-2xl p-5" style={{
      background: 'linear-gradient(145deg, rgba(255,255,255,0.55), rgba(255,255,255,0.25))',
border: '1px solid rgba(255,255,255,0.6)',
      boxShadow: '0 8px 32px rgba(30,45,38,0.08)',
    }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold" style={{ color: 'var(--ink-main)' }}>经络修行图</h3>
        <span className="text-[10px]" style={{ color: 'var(--ink-light)' }}>
          {meridianProgs.filter(m => m.isCompleted).length}/12 贯通
        </span>
      </div>

      <div className="space-y-2">
        {MERIDIAN_LIST.map((meridian, i) => {
          const prog = progMap.get(meridian.id);
          const completion = prog?.completion ?? 0;
          const isCompleted = prog?.isCompleted ?? false;
          const isUnlocked = i === 0 || (progMap.get(MERIDIAN_LIST[i - 1]?.id)?.completion ?? 0) >= 30;
          const color = ELEMENT_COLORS[meridian.element];

          return (
            <Link
              key={meridian.id}
              href={isUnlocked ? '/healing/acupoint' : '#'}
              className="flex items-center gap-3 p-2.5 rounded-xl transition-all"
              style={{
                background: isCompleted ? `${color}06` : 'transparent',
                opacity: isUnlocked ? 1 : 0.4,
              }}
            >
              {/* 序号 */}
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold" style={{
                background: isCompleted ? `${color}15` : 'rgba(30,45,38,0.04)',
                color: isCompleted ? color : 'var(--ink-light)',
              }}>
                {isCompleted ? <Check size={12} /> : !isUnlocked ? <Lock size={10} /> : i + 1}
              </div>

              {/* 经脉名 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-xs" style={{ color: 'var(--ink-main)' }}>{meridian.name}</p>
                  <span className="text-[9px] px-1 py-0.5 rounded" style={{ background: `${color}10`, color }}>
                    {ELEMENT_NAMES[meridian.element]}行
                  </span>
                </div>
                <p className="text-[9px] mt-0.5" style={{ color: 'var(--ink-light)', opacity: 0.6 }}>
                  {meridian.time} · 贯通度 {completion}%
                </p>
              </div>

              {/* 进度条 */}
              <div className="w-16">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(30,45,38,0.04)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${completion}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
                  />
                </div>
              </div>

              {isUnlocked && <ArrowRight size={12} style={{ color: 'var(--ink-light)', opacity: 0.3 }} />}
            </Link>
          );
        })}
      </div>

      <p className="text-[9px] mt-3 text-center" style={{ color: 'var(--ink-light)', opacity: 0.5 }}>
        按子午流注顺序解锁，前一经脉 30% 贯通后解锁下一经
      </p>
    </div>
  );
}
