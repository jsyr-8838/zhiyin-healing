'use client';

import { useState, useMemo } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import BottomNav from '@/components/BottomNav';
import HealingHeader from '@/components/layout/HealingHeader';
import HealingCanvas, { HEALING_PRESET_LIUZIJUE } from '@/components/healing/HealingCanvas';
import { FITNESS_PLANS, type FitnessPlan } from '@/lib/tcm-lifestyle-data';
import { Dumbbell, ChevronRight, Clock, BarChart3, AlertTriangle, Sparkles, Search } from 'lucide-react';

/* ================================================================
 *  运动康复 · 宋韵光色系版
 *  8套运动方案 + 五行关联 + 动作详情 + 注意事项
 * ================================================================ */

const LEVEL_COLORS: Record<string, string> = {
  '初级': '#4ADE80', '中级': '#FBBF24', '高级': '#FB7185',
};

const ELEMENT_COLORS: Record<string, string> = {
  '金': '#60A5FA', '水': '#818CF8', '木': '#4ADE80', '火': '#FB7185', '土': '#FBBF24',
  '木→水': '#6366F1', '木→火': '#F59E0B',
};

export default function FitnessPage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlans = useMemo(() => {
    if (!searchQuery.trim()) return FITNESS_PLANS;
    const q = searchQuery.trim().toLowerCase();
    return FITNESS_PLANS.filter(p =>
      p.name.includes(q) || p.target.includes(q) || p.element.includes(q) ||
      p.muscles.some(m => m.includes(q)) || p.expectedEffect.includes(q) ||
      p.exercises.some(e => e.name.includes(q) || e.description.includes(q))
    );
  }, [searchQuery]);

  const selectedPlan = selectedIndex !== null ? FITNESS_PLANS[selectedIndex] : null;

  return (
    <PageContainer theme="healing">
      <HealingHeader title="运动康复" subtitle="中医导引 · 运动养生 · 康复调理" />

      <div className="absolute inset-0 z-0">
        <HealingCanvas energy={0.12} config={HEALING_PRESET_LIUZIJUE} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* 搜索 */}
        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#B8A080' }} />
            <input
              type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索方案、症状、肌肉..."
              className="w-full pl-8 pr-3 py-2 rounded-lg text-sm"
              style={{ background: 'rgba(253,248,240,0.9)', border: '1px solid #EDE4D3', color: '#5C1A00' }}
            />
          </div>
        </div>

        {selectedPlan ? (
          <div className="flex-1 px-4 pb-4 overflow-y-auto">
            <button onClick={() => setSelectedIndex(null)} className="text-xs mb-3 flex items-center gap-1" style={{ color: '#B8860B' }}>
              <ChevronRight size={12} className="rotate-180" />返回方案列表
            </button>
            <PlanDetail plan={selectedPlan} />
          </div>
        ) : (
          <div className="flex-1 px-4 pb-4 overflow-y-auto space-y-2">
            {filteredPlans.map((plan, i) => {
              const eColor = ELEMENT_COLORS[plan.element] || '#B8860B';
              const lColor = LEVEL_COLORS[plan.level] || '#B8A080';
              return (
                <button key={plan.name} onClick={() => setSelectedIndex(i)}
                  className="w-full text-left rounded-xl p-3 border transition active:scale-[0.98]"
                  style={{ background: 'rgba(253,248,240,0.9)', borderColor: '#EDE4D3' }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm" style={{ color: '#5C1A00' }}>{plan.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#8B7355' }}>{plan.target}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: eColor + '15', color: eColor, border: `1px solid ${eColor}30` }}>
                        {plan.element}行
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: lColor + '15', color: lColor, border: `1px solid ${lColor}30` }}>
                        {plan.level}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px]" style={{ color: '#B8A080' }}>
                    <span className="flex items-center gap-0.5"><Dumbbell size={10} />{plan.exercises.length}个动作</span>
                    <span className="flex items-center gap-0.5"><Clock size={10} />{plan.muscles.length}组肌群</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </PageContainer>
  );
}

function PlanDetail({ plan }: { plan: FitnessPlan }) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const eColor = ELEMENT_COLORS[plan.element] || '#B8860B';
  const lColor = LEVEL_COLORS[plan.level] || '#B8A080';

  return (
    <div className="space-y-3">
      {/* 标题 */}
      <div className="text-center">
        <div className="font-black font-serif" style={{ fontSize: 24, color: '#5C1A00' }}>{plan.name}</div>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: eColor + '15', color: eColor }}>{plan.element}行</span>
          <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: lColor + '15', color: lColor }}>{plan.level}</span>
        </div>
        <p className="text-xs mt-1" style={{ color: '#8B7355' }}>目标：{plan.target}</p>
      </div>

      {/* 涉及肌群 */}
      <div className="rounded-xl p-3" style={{ background: 'rgba(253,248,240,0.9)', border: '1px solid #EDE4D3' }}>
        <div className="flex items-center gap-1 mb-2"><BarChart3 size={12} style={{ color: eColor }} /><span className="text-xs font-bold" style={{ color: '#5C1A00' }}>涉及肌群</span></div>
        <div className="flex flex-wrap gap-1.5">
          {plan.muscles.map(m => (
            <span key={m} className="px-2 py-0.5 rounded-full text-xs" style={{ background: eColor + '10', color: '#5C3015', border: `1px solid ${eColor}25` }}>{m}</span>
          ))}
        </div>
      </div>

      {/* 动作列表 */}
      <div className="rounded-xl p-3" style={{ background: 'rgba(253,248,240,0.9)', border: '1px solid #EDE4D3' }}>
        <div className="flex items-center gap-1 mb-2"><Sparkles size={12} style={{ color: eColor }} /><span className="text-xs font-bold" style={{ color: '#5C1A00' }}>动作步骤</span></div>
        <div className="space-y-2">
          {plan.exercises.map((ex, i) => (
            <div key={i} className="rounded-lg border p-2 cursor-pointer transition"
              style={{ background: expandedStep === i ? eColor + '08' : 'transparent', borderColor: expandedStep === i ? eColor + '30' : '#EDE4D3' }}
              onClick={() => setExpandedStep(expandedStep === i ? null : i)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: eColor + '20', color: eColor }}>{i + 1}</span>
                  <span className="text-sm font-bold" style={{ color: '#5C1A00' }}>{ex.name}</span>
                </div>
                <ChevronRight size={12} className="transition-transform" style={{ color: '#B8A080', transform: expandedStep === i ? 'rotate(90deg)' : '' }} />
              </div>
              {expandedStep === i && (
                <div className="mt-2 pl-7 space-y-1">
                  <p className="text-xs" style={{ color: '#5C3015' }}>{ex.description}</p>
                  <div className="flex flex-wrap gap-2 text-[10px]" style={{ color: '#8B7355' }}>
                    <span>时长：{ex.duration}</span>
                    <span>组数：{ex.sets}</span>
                  </div>
                  <p className="text-[10px]" style={{ color: eColor }}>提示：{ex.tips}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 注意事项 */}
      <div className="rounded-xl p-3" style={{ background: '#FB718508', border: '1px solid #FB718520' }}>
        <div className="flex items-center gap-1 mb-1"><AlertTriangle size={12} style={{ color: '#FB7185' }} /><span className="text-xs font-bold" style={{ color: '#9F1239' }}>注意事项</span></div>
        <ul className="space-y-0.5">
          {plan.precautions.map((p, i) => (
            <li key={i} className="text-xs" style={{ color: '#9F1239' }}>· {p}</li>
          ))}
        </ul>
      </div>

      {/* 预期效果 */}
      <div className="rounded-xl p-3" style={{ background: eColor + '08', border: `1px solid ${eColor}25` }}>
        <span className="text-xs font-bold" style={{ color: eColor }}>预期效果：</span>
        <span className="text-xs" style={{ color: '#5C3015' }}> {plan.expectedEffect}</span>
      </div>
    </div>
  );
}
