'use client';

import { useCultivationStore } from '@/lib/cultivation-store';
import {
  ELEMENT_COLORS, ELEMENT_NAMES, ELEMENT_ORGANS,
  getTreeStage, TREE_STAGE_LABELS, TreeStage,
  totalXiuWei, avgXiuWei,
  type WuxingElement, type XiuWeiValues,
} from '@/lib/cultivation-engine';
import { calculateRank, getNextRank, getRankDisplay } from '@/lib/rank-system';

const ELEMENTS: WuxingElement[] = ['wood', 'fire', 'earth', 'metal', 'water'];

/** 五行色渐变（用于修为值条） */
function elementGradient(el: WuxingElement) {
  return `linear-gradient(90deg, ${ELEMENT_COLORS[el]}, ${ELEMENT_COLORS[el]}aa)`;
}

export default function XiuWeiOverview() {
  const { xiuwei, rankIndex, rankTitle, totalPractices, streakDays } = useCultivationStore();

  const total = totalXiuWei(xiuwei);
  const avg = avgXiuWei(xiuwei);
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
      {/* 段位 + 总修为 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{rankDisplay.current.icon}</span>
            <div>
              <p className="font-black text-base" style={{ color: rankDisplay.current.color }}>{rankDisplay.current.title}</p>
              <p className="text-[10px]" style={{ color: 'var(--ink-light)' }}>{rankDisplay.current.subtitle}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black tabular-nums" style={{ color: 'var(--ink-main)' }}>{total}</p>
          <p className="text-[10px]" style={{ color: 'var(--ink-light)' }}>总修为</p>
        </div>
      </div>

      {/* 下一段位进度 */}
      {rankDisplay.next && (
        <div className="mb-4 p-3 rounded-xl" style={{ background: 'rgba(30,45,38,0.03)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px]" style={{ color: 'var(--ink-light)' }}>
              下一阶：{rankDisplay.next.title}
            </span>
            <span className="text-[10px] font-bold" style={{ color: rankDisplay.next.color }}>
              {Math.round(rankDisplay.progress * 100)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(30,45,38,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${rankDisplay.progress * 100}%`,
                background: `linear-gradient(90deg, ${rankDisplay.current.color}, ${rankDisplay.next.color})`,
              }}
            />
          </div>
          <p className="text-[9px] mt-1" style={{ color: 'var(--ink-light)', opacity: 0.6 }}>
            {rankDisplay.next.condition}
          </p>
        </div>
      )}

      {/* 五行修为值条 */}
      <div className="space-y-2.5">
        {ELEMENTS.map(el => {
          const val = xiuwei[el];
          const stage = getTreeStage(val);
          const stageLabel = TREE_STAGE_LABELS[stage];
          return (
            <div key={el} className="flex items-center gap-2.5">
              <span className="w-5 text-[10px] font-bold text-center" style={{ color: ELEMENT_COLORS[el] }}>
                {ELEMENT_NAMES[el]}
              </span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(30,45,38,0.04)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${val}%`,
                    background: elementGradient(el),
                  }}
                />
              </div>
              <span className="w-6 text-[10px] font-bold tabular-nums text-right" style={{ color: 'var(--ink-light)' }}>
                {val}
              </span>
              <span className="w-8 text-[9px] text-right" style={{ color: ELEMENT_COLORS[el], opacity: 0.7 }}>
                {stageLabel}
              </span>
            </div>
          );
        })}
      </div>

      {/* 统计 */}
      <div className="flex items-center gap-4 mt-4 pt-3" style={{ borderTop: '1px solid rgba(30,45,38,0.06)' }}>
        <StatItem value={totalPractices} label="累计功法" color="var(--wood)" />
        <StatItem value={streakDays} label="连续天数" color="var(--earth)" />
        <StatItem value={avg} label="平均修为" color="var(--water)" />
      </div>
    </div>
  );
}

function StatItem({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex-1 text-center">
      <p className="text-lg font-black tabular-nums" style={{ color }}>{value}</p>
      <p className="text-[9px]" style={{ color: 'var(--ink-light)', opacity: 0.6 }}>{label}</p>
    </div>
  );
}
