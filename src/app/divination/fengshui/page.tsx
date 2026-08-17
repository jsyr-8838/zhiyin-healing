'use client';

import { useState } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import PageContainer from '@/components/layout/PageContainer';
import {
  fullFengShuiAnalysis,
  type FangWei,
  type Gender,
  type FengShuiResult,
  getErShiSiShan,
  getXuanKongFeiXing,
} from '@/lib/fengshui';
import { ArrowLeft, Compass, Home, User, Sparkles, Shield, MapPin } from 'lucide-react';

const FANG_WEI_OPTIONS: FangWei[] = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];

// 方位对应八卦符号
const FANGWEI_SYMBOL: Record<FangWei, string> = {
  '北': '☵', '东北': '☶', '东': '☳', '东南': '☴',
  '南': '☲', '西南': '☷', '西': '☱', '西北': '☰',
};

// 九星对应颜色
const JIUXING_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '生气': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  '天医': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  '延年': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  '伏位': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  '祸害': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  '六煞': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  '五鬼': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  '绝命': { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

// 吉凶对应标签
const JIXIONG_TAG: Record<string, { text: string; cls: string }> = {
  '大吉': { text: '大吉', cls: 'bg-emerald-100 text-emerald-700' },
  '吉': { text: '吉', cls: 'bg-green-100 text-green-700' },
  '小吉': { text: '小吉', cls: 'bg-teal-100 text-teal-700' },
  '平': { text: '平', cls: 'bg-gray-100 text-gray-600' },
  '凶': { text: '凶', cls: 'bg-orange-100 text-orange-700' },
  '大凶': { text: '大凶', cls: 'bg-red-100 text-red-700' },
};

export default function FengShuiPage() {
  const [year, setYear] = useState('1990');
  const [gender, setGender] = useState<Gender>('male');
  const [direction, setDirection] = useState<FangWei>('北');
  const [result, setResult] = useState<FengShuiResult | null>(null);
  const [showErShiSiShan, setShowErShiSiShan] = useState(false);
  const [showFeiXing, setShowFeiXing] = useState(false);

  function handleAnalyze() {
    const y = parseInt(year);
    if (isNaN(y) || y < 1900 || y > 2100) return;
    const analysis = fullFengShuiAnalysis(y, gender, direction);
    setResult(analysis);
  }

  function handleReset() {
    setResult(null);
  }

  // 评分圆环颜色
  function scoreColor(score: number): string {
    if (score >= 80) return '#10b981';
    if (score >= 65) return '#8b5cf6';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  }

  return (
    <PageContainer theme="divination" className="pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-6" style={{ background: 'linear-gradient(150deg, rgba(180,120,40,0.88), rgba(160,80,30,0.90))', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-3 mb-2">
          <Link href="/divination" className="text-white/70 hover:text-white"><ArrowLeft size={22} /></Link>
          <h1 className="text-xl font-black text-white" style={{ letterSpacing: '0.08em' }}>风水堪舆</h1>
        </div>
        <p className="text-sm text-amber-100/80">宅命相配 · 游年九星 · 玄空飞星 · 趋吉避凶</p>
      </div>

      <div className="px-4 pt-5 space-y-4">
        {!result ? (
          /* ===== 输入区 ===== */
          <>
            {/* 说明卡片 */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-start gap-3">
                <Compass size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-800 mb-1">阳宅风水分析</h4>
                  <p className="text-xs text-amber-600 leading-relaxed">
                    输入出生年份、性别和房屋坐向，即可推算命卦、宅命匹配、游年九星排布、玄空飞星和趋吉避凶建议
                  </p>
                </div>
              </div>
            </div>

            {/* 出生年份 */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <label className="text-sm text-gray-700 mb-2 block font-bold">出生年份</label>
              <input
                type="number"
                min={1900}
                max={2100}
                value={year}
                onChange={e => setYear(e.target.value)}
                placeholder="如：1990"
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-amber-400 focus:outline-none"
              />
              <p className="text-[10px] text-gray-400 mt-1">支持 1900-2100 年</p>
            </div>

            {/* 性别 */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <label className="text-sm text-gray-700 mb-2 block font-bold">性别</label>
              <div className="flex gap-3">
                {[
                  { v: 'male' as const, l: '男', icon: '♂' },
                  { v: 'female' as const, l: '女', icon: '♀' },
                ].map(g => (
                  <button
                    key={g.v}
                    onClick={() => setGender(g.v)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${
                      gender === g.v
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-lg">{g.icon}</span> {g.l}
                  </button>
                ))}
              </div>
            </div>

            {/* 房屋坐向 */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <label className="text-sm text-gray-700 mb-2 block font-bold">房屋坐向</label>
              <div className="grid grid-cols-4 gap-2">
                {FANG_WEI_OPTIONS.map(fw => (
                  <button
                    key={fw}
                    onClick={() => setDirection(fw)}
                    className={`py-3 rounded-xl text-sm font-bold transition flex flex-col items-center gap-1 ${
                      direction === fw
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-100'
                    }`}
                  >
                    <span className="text-lg">{FANGWEI_SYMBOL[fw]}</span>
                    <span className="text-xs">{fw}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">坐{direction}向{FANG_WEI_OPTIONS[(FANG_WEI_OPTIONS.indexOf(direction) + 4) % 8]}</p>
            </div>

            {/* 分析按钮 */}
            <button
              onClick={handleAnalyze}
              disabled={!year || parseInt(year) < 1900 || parseInt(year) > 2100}
              className="w-full py-4 rounded-xl font-black text-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition"
            >
              🧭 开始堪舆
            </button>
          </>
        ) : (
          /* ===== 结果区 ===== */
          <>
            {/* 综合评分 */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 text-center">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
                <Sparkles size={16} className="text-amber-600" /> 综合风水评分
              </h3>
              {/* 评分圆环 */}
              <div className="relative w-32 h-32 mx-auto mb-3">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke={scoreColor(result.综合评分)}
                    strokeWidth="8"
                    strokeDasharray={`${(result.综合评分 / 100) * 326.7} 326.7`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black" style={{ color: scoreColor(result.综合评分) }}>
                    {result.综合评分}
                  </span>
                  <span className="text-xs text-gray-400">分</span>
                </div>
              </div>
              <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
                result.综合判断 === '吉' ? 'bg-emerald-100 text-emerald-700' :
                result.综合判断 === '中吉' ? 'bg-purple-100 text-purple-700' :
                result.综合判断 === '中' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {result.综合判断}
              </div>
            </div>

            {/* 命主信息 + 宅型信息 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <User size={14} className="text-purple-500" />
                  <h4 className="text-xs font-bold text-gray-500">命主</h4>
                </div>
                <p className="text-2xl font-black text-gray-900">{result.命主信息.命卦}<span className="text-sm font-normal text-gray-400">卦</span></p>
                <p className="text-xs text-purple-600 mt-1">{result.命主信息.命型}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{result.命主信息.性别} · {result.命主信息.出生年份}年</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Home size={14} className="text-amber-500" />
                  <h4 className="text-xs font-bold text-gray-500">宅型</h4>
                </div>
                <p className="text-2xl font-black text-gray-900">{result.宅型信息.宅型}</p>
                <p className="text-xs text-amber-600 mt-1">坐{result.宅型信息.坐向}</p>
              </div>
            </div>

            {/* 宅命匹配 */}
            <div className={`rounded-xl p-4 border ${
              result.宅命匹配.match
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                <Shield size={16} className={result.宅命匹配.match ? 'text-emerald-600' : 'text-red-600'} />
                <h4 className="font-bold text-gray-900">宅命匹配</h4>
              </div>
              <p className={`text-sm mt-1 font-bold ${result.宅命匹配.match ? 'text-emerald-700' : 'text-red-700'}`}>
                {result.宅命匹配.msg}
              </p>
            </div>

            {/* 游年九星 */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin size={14} className="text-amber-600" /> 游年九星排布
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(result.游年九星).map(([star, fangwei]) => {
                  const colors = JIUXING_COLORS[star] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
                  const isJi = ['生气', '天医', '延年', '伏位'].includes(star);
                  return (
                    <div
                      key={star}
                      className={`rounded-lg p-3 border ${colors.bg} ${colors.border} ${
                        isJi ? 'ring-1 ring-emerald-100' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${colors.text}`}>{star}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          isJi ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {isJi ? '吉' : '凶'}
                        </span>
                      </div>
                      <p className={`text-sm font-black mt-1 ${colors.text}`}>{fangwei}方</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 布局建议 */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-3">布局建议</h4>
              <div className="space-y-2">
                {Object.entries(result.布局建议.建议).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2">
                    <span className="text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold flex-shrink-0 mt-0.5">
                      {key}
                    </span>
                    <p className="text-xs text-gray-600 leading-relaxed">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 趋吉避凶 */}
            {result.趋吉避凶 && (
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  ✨ 趋吉避凶
                </h4>

                {result.趋吉避凶.吉利方位.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-bold text-emerald-600 mb-1.5">吉利方位</p>
                    {result.趋吉避凶.吉利方位.map((a, i) => (
                      <p key={i} className="text-xs text-gray-600 leading-relaxed pl-2">• {a}</p>
                    ))}
                  </div>
                )}

                {result.趋吉避凶.吉利颜色.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-bold text-blue-600 mb-1.5">吉利颜色</p>
                    <p className="text-xs text-gray-600 leading-relaxed pl-2">{result.趋吉避凶.吉利颜色.join('、')}</p>
                  </div>
                )}

                {result.趋吉避凶.布局调整.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-bold text-purple-600 mb-1.5">布局调整</p>
                    {result.趋吉避凶.布局调整.map((a, i) => (
                      <p key={i} className="text-xs text-gray-600 leading-relaxed pl-2">• {a}</p>
                    ))}
                  </div>
                )}

                {result.趋吉避凶.化解建议.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-amber-600 mb-1.5">化解建议</p>
                    {result.趋吉避凶.化解建议.map((a, i) => (
                      <p key={i} className="text-xs text-gray-600 leading-relaxed pl-2">• {a}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 二十四山 & 玄空飞星 — 折叠区域 */}
            <details
              open={showErShiSiShan}
              onToggle={e => setShowErShiSiShan((e.target as HTMLDetailsElement).open)}
              className="bg-white rounded-xl border border-gray-200"
            >
              <summary className="p-4 font-bold text-gray-700 cursor-pointer text-sm">二十四山详解</summary>
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-2">
                  {FANG_WEI_OPTIONS.map(fw => {
                    const shan = getErShiSiShan(fw);
                    if (!shan) return null;
                    return (
                      <div key={fw} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold text-gray-900">
                            {FANGWEI_SYMBOL[fw]} {fw}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            shan.五行 === '金' ? 'bg-gray-100 text-gray-600' :
                            shan.五行 === '木' ? 'bg-emerald-100 text-emerald-600' :
                            shan.五行 === '水' ? 'bg-blue-100 text-blue-600' :
                            shan.五行 === '火' ? 'bg-red-100 text-red-600' :
                            'bg-amber-100 text-amber-600'
                          }`}>{shan.五行}</span>
                        </div>
                        <p className="text-xs text-gray-500">{shan.三山.join(' · ')}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </details>

            <details
              open={showFeiXing}
              onToggle={e => setShowFeiXing((e.target as HTMLDetailsElement).open)}
              className="bg-white rounded-xl border border-gray-200"
            >
              <summary className="p-4 font-bold text-gray-700 cursor-pointer text-sm">玄空飞星（{result.命主信息.出生年份}年）</summary>
              <div className="px-4 pb-4">
                <div className="space-y-2">
                  {FANG_WEI_OPTIONS.map(fw => {
                    const fx = getXuanKongFeiXing(result.命主信息.出生年份, fw);
                    return (
                      <div key={fw} className={`rounded-lg p-3 border flex items-center justify-between ${
                        fx.吉凶 === '吉' ? 'bg-emerald-50 border-emerald-100' :
                        fx.吉凶 === '凶' ? 'bg-red-50 border-red-100' :
                        'bg-gray-50 border-gray-100'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{FANGWEI_SYMBOL[fw]} {fw}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">{fx.方位飞星}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                            fx.吉凶 === '吉' ? 'bg-emerald-200 text-emerald-800' :
                            fx.吉凶 === '凶' ? 'bg-red-200 text-red-800' :
                            'bg-gray-200 text-gray-600'
                          }`}>{fx.吉凶}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-gray-400 mt-3 text-center">
                  年飞星：{getXuanKongFeiXing(result.命主信息.出生年份, '北').年飞星}
                </p>
              </div>
            </details>

            {/* 重新分析按钮 */}
            <button
              onClick={handleReset}
              className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 transition active:scale-[0.98]"
            >
              重新堪舆
            </button>

            <div className="text-center text-xs text-gray-500 py-4">
              堪舆为传统文化智慧，仅供参考，不作为决策依据
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </PageContainer>
  );
}
