'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import syndromeRaw from '@/data/tcm/syndrome_logic.json';

// 六经配色
const MERIDIAN_COLORS: Record<string, string> = {
  '太阳经': '#c26158', '阳明经': '#c9a94f', '少阳经': '#5d8a63',
  '太阴经': '#5ba09a', '少阴经': '#3d7a75', '厥阴经': '#8b5cf6',
};

interface TenQuestionSymptom {
  name: string; value: string;
  related_syndromes: string[]; related_formulas: string[]; related_acupoints: string[];
}

interface TenQuestion {
  category: string; description: string; symptoms: TenQuestionSymptom[];
}

interface SixMeridian {
  name: string; english_name: string; description: string;
  key_symptoms: string[]; tongue_pulse: { tongue: string; pulse: string };
  classic_formulas: string[]; key_acupoints: string[]; ni_comment: string;
}

function BianZhengPage() {
  const [activeTab, setActiveTab] = useState<'six_meridian' | 'ten_questions' | 'mapping'>('six_meridian');
  const [expandedMeridian, setExpandedMeridian] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());

  const data = syndromeRaw as {
    six_meridian_syndromes: SixMeridian[];
    ten_questions: TenQuestion[];
    symptom_syndrome_mapping: Array<{
      symptom: string; syndromes: string[]; rules: string;
      key_discriminators: string; formulas: string[];
    }>;
  };

  // 基于已选症状推荐辨证结果
  const diagnosisResults = useMemo(() => {
    if (selectedSymptoms.size === 0) return [];
    const results: Record<string, { syndrome: string; count: number; rules: string[] }> = {};

    for (const mapping of data.symptom_syndrome_mapping) {
      if (selectedSymptoms.has(mapping.symptom)) {
        for (const s of mapping.syndromes) {
          if (!results[s]) results[s] = { syndrome: s, count: 0, rules: [] };
          results[s].count++;
          results[s].rules.push(mapping.rules);
        }
      }
    }

    return Object.values(results).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [selectedSymptoms, data.symptom_syndrome_mapping]);

  const toggleSymptom = (name: string) => {
    setSelectedSymptoms(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#faf5ee]">
      {/* 顶部 */}
      <div className="sticky top-0 z-30 bg-[#faf5ee]/95 border-b border-[#e8ddd0]/60 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-[#1a1a1a]" style={{ fontWeight: 760 }}>
                辨证引擎
              </h1>
              <p className="text-xs text-[#8b7355] mt-0.5">
                六经辨证 · 十问歌 · 倪师注释
              </p>
            </div>
            <Link
              href="/healing"
              className="px-3 py-1.5 bg-[#f5efe6] text-[#8b7355] text-xs rounded-lg hover:bg-[#e8ddd0]/60 transition-colors"
            >
              返回疗愈
            </Link>
          </div>
        </div>
      </div>

      {/* 标签切换 */}
      <div className="px-4 py-2">
        <div className="max-w-4xl mx-auto flex gap-2">
          {[
            { key: 'six_meridian' as const, label: '六经辨证' },
            { key: 'ten_questions' as const, label: '十问歌' },
            { key: 'mapping' as const, label: '智能辨证' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-[#c9a94f] text-white shadow-sm'
                  : 'bg-white/60 text-[#8b7355] hover:bg-white/90 border border-[#e8ddd0]/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-8">
        {/* 六经辨证 */}
        {activeTab === 'six_meridian' && (
          <div className="space-y-3">
            {data.six_meridian_syndromes.map(m => {
              const isExpanded = expandedMeridian === m.name;
              const color = MERIDIAN_COLORS[m.name] || '#8b7355';
              return (
                <div key={m.name} className="bg-white/90 rounded-2xl border border-[#e8ddd0]/60 overflow-hidden shadow-sm">
                  <button
                    onClick={() => setExpandedMeridian(isExpanded ? null : m.name)}
                    className="w-full p-4 text-left flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ backgroundColor: color }}>
                      {m.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-[#1a1a1a]" style={{ fontWeight: 700 }}>{m.name}</span>
                        <span className="text-[10px] text-[#aaa]">{m.english_name}</span>
                      </div>
                      <p className="text-xs text-[#8b7355] mt-0.5 line-clamp-1">
                        {m.key_symptoms.slice(0, 3).join('、')}
                      </p>
                    </div>
                    <span className="text-[#bba89a] text-sm shrink-0">{isExpanded ? '▲' : '▼'}</span>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-[#e8ddd0]/40 pt-3">
                      <p className="text-sm text-[#555] leading-relaxed">{m.description}</p>

                      {/* 关键症状 */}
                      <div>
                        <p className="text-xs text-[#8b7355] font-medium mb-1">关键症状</p>
                        <div className="flex flex-wrap gap-1.5">
                          {m.key_symptoms.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-[#f5efe6] text-[#555] border border-[#e8ddd0]/60">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 舌脉 */}
                      <div className="flex gap-4">
                        <div>
                          <p className="text-xs text-[#8b7355] font-medium mb-1">舌象</p>
                          <p className="text-sm text-[#555]">{m.tongue_pulse.tongue}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#8b7355] font-medium mb-1">脉象</p>
                          <p className="text-sm text-[#555]">{m.tongue_pulse.pulse}</p>
                        </div>
                      </div>

                      {/* 要穴 */}
                      <div>
                        <p className="text-xs text-[#8b7355] font-medium mb-1">要穴</p>
                        <div className="flex flex-wrap gap-1.5">
                          {m.key_acupoints.map(code => (
                            <Link
                              key={code}
                              href={`/meridian?focus=${code}`}
                              className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors"
                            >
                              {code}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* 倪师注释 */}
                      {m.ni_comment && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                          <p className="text-xs text-amber-700 font-medium mb-1 flex items-center gap-1">
                            <span className="inline-block w-4 h-4 rounded bg-amber-200 text-amber-800 text-center text-[8px] leading-4 font-bold">倪</span>
                            倪师注释
                          </p>
                          <p className="text-sm text-amber-800/90 leading-relaxed">{m.ni_comment}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 十问歌 */}
        {activeTab === 'ten_questions' && (
          <div className="space-y-3">
            {data.ten_questions.map((q, idx) => {
              const isExpanded = expandedQuestion === idx;
              return (
                <div key={idx} className="bg-white/90 rounded-2xl border border-[#e8ddd0]/60 overflow-hidden shadow-sm">
                  <button
                    onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                    className="w-full p-4 text-left flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#c9a94f] text-white text-xs font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-bold text-[#1a1a1a]" style={{ fontWeight: 700 }}>{q.description}</span>
                      <span className="text-xs text-[#8b7355] ml-2">{q.category}</span>
                    </div>
                    <span className="text-[#bba89a] text-sm shrink-0">{isExpanded ? '▲' : '▼'}</span>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-2 border-t border-[#e8ddd0]/40 pt-3">
                      {q.symptoms.map((s, si) => (
                        <div key={si} className="p-3 bg-[#f5efe6] rounded-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-[#1a1a1a]">{s.name}</span>
                            <span className="text-xs text-[#8b7355]">→ {s.value}</span>
                          </div>
                          {s.related_syndromes.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {s.related_syndromes.map((rs, ri) => (
                                <span key={ri} className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100">
                                  {rs}
                                </span>
                              ))}
                            </div>
                          )}
                          {s.related_acupoints.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {s.related_acupoints.map(code => (
                                <Link
                                  key={code}
                                  href={`/meridian?focus=${code}`}
                                  className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors"
                                >
                                  {code}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 智能辨证 */}
        {activeTab === 'mapping' && (
          <div>
            {/* 症状选择 */}
            <div className="mb-4 bg-white/90 rounded-2xl border border-[#e8ddd0]/60 p-4 shadow-sm">
              <p className="text-xs text-[#8b7355] font-medium mb-2">选择当前症状（可多选）</p>
              <div className="flex flex-wrap gap-1.5">
                {data.symptom_syndrome_mapping.map(m => (
                  <button
                    key={m.symptom}
                    onClick={() => toggleSymptom(m.symptom)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedSymptoms.has(m.symptom)
                        ? 'bg-[#c9a94f] text-white shadow-sm'
                        : 'bg-white text-[#8b7355] hover:bg-[#f5efe6] border border-[#e8ddd0]/60'
                    }`}
                  >
                    {m.symptom}
                  </button>
                ))}
              </div>
              {selectedSymptoms.size > 0 && (
                <button
                  onClick={() => setSelectedSymptoms(new Set())}
                  className="mt-2 text-xs text-[#c26158] hover:underline"
                >
                  清除选择 ({selectedSymptoms.size})
                </button>
              )}
            </div>

            {/* 辨证结果 */}
            {diagnosisResults.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-[#8b7355] font-medium">辨证结果</p>
                {diagnosisResults.map((r, i) => (
                  <div key={i} className="bg-white/90 rounded-2xl border border-[#e8ddd0]/60 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center bg-[#c9a94f] text-white text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm font-bold text-[#1a1a1a]" style={{ fontWeight: 700 }}>{r.syndrome}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        匹配{r.count}项
                      </span>
                    </div>
                    {r.rules.length > 0 && (
                      <div className="space-y-1 ml-8">
                        {r.rules.map((rule, ri) => (
                          <p key={ri} className="text-xs text-[#555] leading-relaxed">
                            {rule}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : selectedSymptoms.size > 0 ? (
              <p className="text-sm text-[#aaa] text-center py-8">暂未匹配到辨证结果</p>
            ) : (
              <p className="text-sm text-[#aaa] text-center py-8">请选择症状开始辨证</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BianZhengPage;
