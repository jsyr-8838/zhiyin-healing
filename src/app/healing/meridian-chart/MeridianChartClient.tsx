'use client';

import { useState, useMemo } from 'react';
import { ACUPOINT_LIST } from '@/lib/xws-data';
import { cosUrl } from '@/lib/cos-url';

// 十四正经 + 经外奇穴
const MERIDIAN_LIST = [
  { name: '手太阴肺经', element: '金', color: '#5ba09a', desc: '肺手太阴之脉，起于中焦，下络大肠，还循胃口，上膈属肺' },
  { name: '手阳明大肠经', element: '金', color: '#5ba09a', desc: '大肠手阳明之脉，起于大指次指之端，循指上廉' },
  { name: '足阳明胃经', element: '土', color: '#c9a94f', desc: '胃足阳明之脉，起于鼻之交頞中，旁纳太阳之脉' },
  { name: '足太阴脾经', element: '土', color: '#c9a94f', desc: '脾足太阴之脉，起于大指之端，循指内侧白肉际' },
  { name: '手少阴心经', element: '火', color: '#c26158', desc: '心手少阴之脉，起于心中，出属心系，下膈络小肠' },
  { name: '手太阳小肠经', element: '火', color: '#c26158', desc: '小肠手太阳之脉，起于小指之端，循手外侧上腕' },
  { name: '足太阳膀胱经', element: '水', color: '#3d7a75', desc: '膀胱足太阳之脉，起于目内眦，上额交巅' },
  { name: '足少阴肾经', element: '水', color: '#3d7a75', desc: '肾足少阴之脉，起于小指之下，邪走足心' },
  { name: '手厥阴心包经', element: '火', color: '#c26158', desc: '心主手厥阴心包络之脉，起于胸中，出属心包络' },
  { name: '手少阳三焦经', element: '木', color: '#5d8a63', desc: '三焦手少阳之脉，起于小指次指之端，上出两指之间' },
  { name: '足少阳胆经', element: '木', color: '#5d8a63', desc: '胆足少阳之脉，起于目锐眦，上抵头角' },
  { name: '足厥阴肝经', element: '木', color: '#5d8a63', desc: '肝足厥阴之脉，起于大指丛毛之际，上循足跗上廉' },
  { name: '督脉', element: '土', color: '#c9a94f', desc: '督脉者，起于少腹以下骨中央，入系廷孔' },
  { name: '任脉', element: '土', color: '#c9a94f', desc: '任脉者，起于中极之下，以上毛际' },
  { name: '经外奇穴', element: '', color: '#8b7355', desc: '不属十四经的穴位，有独特疗效' },
];

export default function MeridianChartClient() {
  const [selectedMeridian, setSelectedMeridian] = useState<string | null>(null);
  const [showModel, setShowModel] = useState(true);

  // 每条经络对应的穴位
  const meridianAcupoints = useMemo(() => {
    const map: Record<string, string[]> = {};
    ACUPOINT_LIST.forEach(a => {
      if (!map[a.meridian]) map[a.meridian] = [];
      map[a.meridian].push(a.name);
    });
    return map;
  }, []);

  const current = selectedMeridian ? MERIDIAN_LIST.find(m => m.name === selectedMeridian) : null;
  const acupoints = selectedMeridian ? (meridianAcupoints[selectedMeridian] || []) : [];

  return (
    <div className="min-h-screen bg-[#faf5ee]">
      {/* 顶部标题栏 */}
      <div className="sticky top-0 z-30 bg-[#faf5ee]/95 border-b border-[#e8ddd0]/60 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-lg font-bold text-[#1a1a1a]" style={{ fontWeight: 760 }}>
            经络图解
          </h1>
          <p className="text-xs text-[#8b7355] mt-0.5">
            {MERIDIAN_LIST.length}条经络 · 十二正经 + 奇经八脉
          </p>
        </div>
      </div>

      {/* 经络列表 */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MERIDIAN_LIST.map(m => {
            const isActive = selectedMeridian === m.name;
            return (
              <button
                key={m.name}
                onClick={() => setSelectedMeridian(isActive ? null : m.name)}
                className={`relative p-3 rounded-xl border transition-all text-left ${
                  isActive
                    ? 'bg-white border-2 shadow-md'
                    : 'bg-white/60 border-[#e8ddd0]/60 hover:bg-white/90 hover:shadow-sm'
                }`}
                style={isActive ? { borderColor: m.color } : undefined}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: m.color }}
                  />
                  <span className="text-sm font-bold text-[#1a1a1a] truncate" style={{ fontWeight: 760 }}>
                    {m.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-5">
                  {m.element && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: m.color, backgroundColor: m.color + '15' }}>
                      {m.element}行
                    </span>
                  )}
                  <span className="text-[10px] text-[#8b7355]">
                    {(meridianAcupoints[m.name] || []).length}穴
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 经络详情 */}
      {current && selectedMeridian && (
        <div className="max-w-4xl mx-auto px-4 pb-8">
          <div className="bg-white/90 rounded-2xl border border-[#e8ddd0]/60 overflow-hidden shadow-sm">
            {/* 切换按钮 */}
            <div className="flex border-b border-[#e8ddd0]/60">
              <button
                onClick={() => setShowModel(true)}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                  showModel ? 'bg-[#f5efe6] text-[#1a1a1a]' : 'text-[#8b7355] hover:bg-[#faf5ee]'
                }`}
              >
                动态图
              </button>
              <button
                onClick={() => setShowModel(false)}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                  !showModel ? 'bg-[#f5efe6] text-[#1a1a1a]' : 'text-[#8b7355] hover:bg-[#faf5ee]'
                }`}
              >
                静态图
              </button>
            </div>

            {/* 经络图 */}
            <div className="bg-[#f5efe6] flex items-center justify-center p-4 min-h-[300px]">
              {(() => {
                const suffix = showModel ? '_model.gif' : '_type.jpg';
                const imgSrc = cosUrl(`/images/meridians/${encodeURIComponent(selectedMeridian)}${suffix}`);
                return (
                  <img
                    src={imgSrc}
                    alt={selectedMeridian}
                    className="max-h-[60vh] rounded-xl shadow-md object-contain"
                  />
                );
              })()}
            </div>

            {/* 经络信息 */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded-full text-xs text-white font-medium"
                  style={{ backgroundColor: current.color }}
                >
                  {current.element}行
                </span>
                <h2 className="text-xl font-bold text-[#1a1a1a]" style={{ fontWeight: 760 }}>
                  {current.name}
                </h2>
                <span className="text-xs text-[#8b7355]">
                  {acupoints.length}个穴位
                </span>
              </div>
              {current.desc && (
                <p className="text-sm text-[#555] leading-relaxed italic">
                  {current.desc}
                </p>
              )}
              {acupoints.length > 0 && (
                <div>
                  <p className="text-xs text-[#8b7355] font-medium mb-2">穴位列表</p>
                  <div className="flex flex-wrap gap-1.5">
                    {acupoints.map(name => (
                      <span
                        key={name}
                        className="text-xs px-2 py-1 rounded-lg bg-[#f5efe6] text-[#333] border border-[#e8ddd0]/60"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
