'use client';

import { useState } from 'react';
import { useCultivationStore } from '@/lib/cultivation-store';
import { RANKS, getRankDisplay } from '@/lib/rank-system';
import type { XiuWeiValues } from '@/lib/cultivation-engine';

export default function RankDisplay() {
  const { xiuwei, rankIndex, rankTitle, totalPractices, streakDays } = useCultivationStore();

  const rankDisplay = getRankDisplay(xiuwei, {
    totalPractices,
    streakDays,
    completedMeridians: 0,
    diagnosisCount: 0,
  });

  return (
    <div className="rounded-2xl p-5" style={{
      background: 'linear-gradient(145deg, rgba(255,255,255,0.55), rgba(255,255,255,0.25))',
border: '1px solid rgba(255,255,255,0.6)',
      boxShadow: '0 8px 32px rgba(30,45,38,0.08)',
    }}>
      {/* 当前段位 */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{rankDisplay.current.icon}</span>
        <div>
          <p className="font-black text-xl" style={{ color: rankDisplay.current.color }}>
            {rankDisplay.current.title}
          </p>
          <p className="text-xs" style={{ color: 'var(--ink-light)' }}>{rankDisplay.current.subtitle}</p>
        </div>
      </div>

      {/* 当前解锁 */}
      <div className="p-3 rounded-xl mb-4" style={{ background: `${rankDisplay.current.color}08`, border: `1px solid ${rankDisplay.current.color}15` }}>
        <p className="text-[10px] font-bold" style={{ color: rankDisplay.current.color }}>
          已解锁：{rankDisplay.current.unlocks}
        </p>
      </div>

      {/* 段位列表 */}
      <div className="space-y-2">
        {RANKS.map((rank) => {
          const isCurrent = rank.index === rankDisplay.current.index;
          const isAchieved = rank.index <= rankDisplay.current.index;

          return (
            <div
              key={rank.index}
              className="flex items-center gap-2.5 p-2 rounded-lg transition-colors"
              style={{
                background: isCurrent ? `${rank.color}08` : 'transparent',
                border: isCurrent ? `1px solid ${rank.color}20` : '1px solid transparent',
              }}
            >
              <span className="text-base">{rank.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs" style={{
                  color: isAchieved ? rank.color : 'var(--ink-light)',
                  opacity: isAchieved ? 1 : 0.5,
                }}>
                  {rank.title}
                </p>
                <p className="text-[9px]" style={{ color: 'var(--ink-light)', opacity: 0.6 }}>
                  {rank.condition}
                </p>
              </div>
              {isAchieved && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{
                  background: `${rank.color}12`,
                  color: rank.color,
                }}>
                  {rank.unlocks}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
