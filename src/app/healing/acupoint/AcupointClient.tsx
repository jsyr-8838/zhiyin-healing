'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { getTcmAcupoints, getTcmMeridians, searchTcmAcupoints, type TcmAcupoint, type TcmMeridian } from '@/lib/tcm-acupoint-data';
import { XWS_VIDEO_ACUPOINTS } from '@/lib/xws-video-names';
import { ACUPOINT_LOCATION_IMAGES } from '@/lib/acupoint-image-names';

// 五行色
const ELEMENT_COLORS: Record<string, string> = {
  '金': '#5ba09a', '水': '#3d7a75', '木': '#5d8a63', '火': '#c26158', '土': '#c9a94f',
};

// 经络中文映射
const MERIDIAN_ZH: Record<string, string> = {
  LU: '手太阴肺经', LI: '手阳明大肠经', ST: '足阳明胃经', SP: '足太阴脾经',
  HT: '手少阴心经', SI: '手太阳小肠经', BL: '足太阳膀胱经', KI: '足少阴肾经',
  PC: '手厥阴心包经', TE: '手少阳三焦经', GB: '足少阳胆经', LV: '足厥阴肝经',
  DU: '督脉', REN: '任脉', DONG: '董氏奇穴',
};

export default function AcupointClient() {
  const [search, setSearch] = useState('');
  const [selectedMeridian, setSelectedMeridian] = useState('全部');
  const [selectedPoint, setSelectedPoint] = useState<TcmAcupoint | null>(null);

  const allPoints = useMemo(() => getTcmAcupoints(), []);
  const meridians = useMemo(() => getTcmMeridians(), []);

  // 经脉筛选列表
  const meridianOptions = useMemo(() => {
    const list = ['全部', ...meridians.map(m => m.nameZh)];
    return list;
  }, [meridians]);

  // 筛选穴位
  const filteredPoints = useMemo(() => {
    let list = allPoints;
    if (selectedMeridian !== '全部') {
      const mCode = meridians.find(m => m.nameZh === selectedMeridian)?.code;
      if (mCode) list = list.filter(a => a.meridian === mCode);
    }
    if (search.trim()) {
      const results = searchTcmAcupoints(search);
      const codes = new Set(results.map(r => r.code));
      list = list.filter(a => codes.has(a.code));
    }
    return list;
  }, [search, selectedMeridian, allPoints, meridians]);

  const currentMeridian = useMemo(() => {
    if (!selectedPoint) return null;
    return meridians.find(m => m.code === selectedPoint.meridian) || null;
  }, [selectedPoint, meridians]);

  const handleSelect = useCallback((point: TcmAcupoint) => {
    setSelectedPoint(prev => prev?.code === point.code ? null : point);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  }, []);

  const stats = useMemo(() => {
    const regular = allPoints.filter(p => p.meridian !== 'DONG');
    const dong = allPoints.filter(p => p.meridian === 'DONG');
    return { total: allPoints.length, regular: regular.length, dong: dong.length };
  }, [allPoints]);

  return (
    <div className="min-h-screen bg-[#faf5ee]">
      {/* 顶部标题栏 */}
      <div className="sticky top-0 z-30 bg-[#faf5ee]/95 backdrop-blur-sm border-b border-[#e8ddd0]/60 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-[#1a1a1a]" style={{ fontWeight: 760 }}>
                穴位定位
              </h1>
              <p className="text-xs text-[#8b7355] mt-0.5">
                {stats.total}个穴位（{stats.regular}正经+{stats.dong}董氏奇穴）· {XWS_VIDEO_ACUPOINTS.size}个视频
              </p>
            </div>
            {/* 3D交互入口 */}
            <Link
              href="/meridian"
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
              style={{ fontWeight: 700 }}
            >
              3D穴位
            </Link>
          </div>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="px-4 py-2">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索穴位名称、主治、倪师注释..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/80 border border-[#e8ddd0] rounded-xl text-sm text-[#1a1a1a] placeholder:text-[#bba89a] focus:outline-none focus:ring-2 focus:ring-[#c9a94f]/30"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#bba89a] text-sm">
              {filteredPoints.length}/{stats.total}
            </span>
          </div>
        </div>
      </div>

      {/* 经络筛选横滑 */}
      <div className="px-4 pb-2">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {meridianOptions.map(m => (
              <button
                key={m}
                onClick={() => setSelectedMeridian(m)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedMeridian === m
                    ? 'bg-[#c9a94f] text-white shadow-sm'
                    : 'bg-white/60 text-[#8b7355] hover:bg-white/90 border border-[#e8ddd0]/60'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-8">
        {/* 穴位详情 */}
        {selectedPoint && currentMeridian && (
          <div className="mb-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-[#e8ddd0]/60 overflow-hidden shadow-sm">
            {/* 头部 */}
            <div className="p-4 border-b border-[#e8ddd0]/40">
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded-full text-xs text-white font-medium"
                  style={{ backgroundColor: ELEMENT_COLORS[currentMeridian.wuxing] || '#8b7355' }}
                >
                  {currentMeridian.nameZh}
                </span>
                <h2 className="text-xl font-bold text-[#1a1a1a]" style={{ fontWeight: 760 }}>
                  {selectedPoint.name}
                </h2>
                <span className="text-xs text-[#8b7355] font-mono">{selectedPoint.code}</span>
                {selectedPoint.meridian === 'DONG' && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold">董氏奇穴</span>
                )}
                {(XWS_VIDEO_ACUPOINTS.has(selectedPoint.name) || XWS_VIDEO_ACUPOINTS.has(selectedPoint.name + '穴')) && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">视频</span>
                )}
              </div>
            </div>

            {/* 定位图 */}
            {ACUPOINT_LOCATION_IMAGES.has(selectedPoint.name) && (
              <div className="bg-[#f8f4ed] px-4 py-3">
                <p className="text-xs text-[#8b7355] font-medium mb-2">穴位定位图</p>
                <img
                  src={`/assets/acupoint/images/${encodeURIComponent(selectedPoint.name)}.jpg`}
                  alt={`${selectedPoint.name}穴位定位图`}
                  className="w-full rounded-xl bg-black/5 shadow-sm"
                  loading="lazy"
                />
              </div>
            )}

            {/* 视频播放 */}
            {(XWS_VIDEO_ACUPOINTS.has(selectedPoint.name) || XWS_VIDEO_ACUPOINTS.has(selectedPoint.name + '穴')) && (
              <div className="bg-[#f8f4ed] px-4 py-3">
                <p className="text-xs text-[#8b7355] font-medium mb-2">穴位定位视频</p>
                <video
                  src={`/videos/acupoints/${encodeURIComponent(selectedPoint.name + '穴')}.mp4`}
                  controls
                  preload="metadata"
                  playsInline
                  className="w-full rounded-xl bg-black/5 shadow-sm"
                  style={{ maxHeight: '40vh' }}
                  onError={(e) => { (e.target as HTMLVideoElement).parentElement!.style.display = 'none'; }}
                />
              </div>
            )}

            {/* 信息区 */}
            <div className="p-4 space-y-3">
              {selectedPoint.location && (
                <div>
                  <p className="text-xs text-[#8b7355] font-medium mb-1">定位</p>
                  <p className="text-sm text-[#333] leading-relaxed">{selectedPoint.location}</p>
                </div>
              )}
              {selectedPoint.indications && (
                <div>
                  <p className="text-xs text-[#8b7355] font-medium mb-1">主治</p>
                  <p className="text-sm text-[#555] leading-relaxed">{selectedPoint.indications}</p>
                </div>
              )}
              {selectedPoint.needlingMethod && (
                <div>
                  <p className="text-xs text-[#8b7355] font-medium mb-1">针刺方法</p>
                  <p className="text-sm text-[#555] leading-relaxed">{selectedPoint.needlingMethod}</p>
                </div>
              )}
              {selectedPoint.contraindications && (
                <div className="p-2 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-xs text-red-600 font-medium mb-1">禁忌</p>
                  <p className="text-sm text-red-700/80 leading-relaxed">{selectedPoint.contraindications}</p>
                </div>
              )}
              {selectedPoint.niComment && (
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs text-amber-700 font-medium mb-1 flex items-center gap-1">
                    <span className="inline-block w-4 h-4 rounded bg-amber-200 text-amber-800 text-center text-[8px] leading-4 font-bold">倪</span>
                    倪师注释
                  </p>
                  <p className="text-sm text-amber-800/90 leading-relaxed">{selectedPoint.niComment}</p>
                </div>
              )}
              <button
                onClick={() => setSelectedPoint(null)}
                className="w-full py-2 text-xs text-[#8b7355] border border-[#e8ddd0] rounded-lg hover:bg-[#f5efe6] transition-colors"
              >
                收起
              </button>
            </div>
          </div>
        )}

        {/* 穴位列表 */}
        <div className="grid grid-cols-1 gap-1.5">
          {filteredPoints.map(point => {
            const mZh = MERIDIAN_ZH[point.meridian] || point.meridian;
            const wuxing = meridians.find(m => m.code === point.meridian)?.wuxing || '土';
            const color = ELEMENT_COLORS[wuxing] || '#8b7355';
            const isSelected = selectedPoint?.code === point.code;
            return (
              <button
                key={point.code}
                onClick={() => handleSelect(point)}
                className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  isSelected
                    ? 'bg-white border-2 shadow-md'
                    : 'bg-white/60 border-[#e8ddd0]/60 hover:bg-white/90 hover:shadow-sm'
                }`}
                style={isSelected ? { borderColor: color } : undefined}
              >
                {/* 五行色标记 */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: color }}>
                  {wuxing}
                </div>
                {/* 名称与经络 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-[#1a1a1a]" style={{ fontWeight: 700 }}>{point.name}</span>
                    <span className="text-[10px] text-[#8b7355] font-mono">{point.code}</span>
                    {point.niComment && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">倪</span>
                    )}
                    {(XWS_VIDEO_ACUPOINTS.has(point.name) || XWS_VIDEO_ACUPOINTS.has(point.name + '穴')) && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">视频</span>
                    )}
                    {ACUPOINT_LOCATION_IMAGES.has(point.name) && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">定位图</span>
                    )}
                    {point.meridian === 'DONG' && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-purple-100 text-purple-700 font-bold">董氏</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-[#8b7355]">{mZh}</span>
                    {point.indications && (
                      <span className="text-[11px] text-[#aaa] truncate max-w-[200px]">
                        {point.indications.split(/[，,]/)[0]}
                      </span>
                    )}
                  </div>
                </div>
                {/* 3D查看链接 */}
                <Link
                  href={`/meridian?focus=${point.code}`}
                  className="px-2 py-1 bg-[#f5efe6] rounded-lg text-[10px] text-[#8b7355] font-medium hover:bg-[#e8ddd0]/60 transition-colors shrink-0"
                >
                  3D
                </Link>
              </button>
            );
          })}
        </div>

        {filteredPoints.length === 0 && (
          <div className="text-center py-16 text-[#bba89a]">
            <p className="text-sm">未找到匹配的穴位</p>
          </div>
        )}
      </div>
    </div>
  );
}
