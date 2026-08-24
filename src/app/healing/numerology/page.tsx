'use client';

import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import HealingHeader from '@/components/layout/HealingHeader';
import PageContainer from '@/components/layout/PageContainer';
import { Sparkles, Calculator, Star, RefreshCw, Moon, Sun, BookOpen, Heart, Compass, Lightbulb } from 'lucide-react';
import {
  calculateNumerology, getStarRating, getNumberKeyword, isChineseName,
  type NumerologyProfile, type NumerologyResult,
} from '@/lib/numerology-engine';
import { getMeaning, generateLifeGuidance, type LifeGuidance } from '@/lib/numerology-data';

/* ================================================================
 *  灵数命理 · 宋韵宣纸风格
 *  基于 motivational-numerology (MIT, Sally Faubion & Olivier Guilieri)
 *  7大维度：品格·灵魂渴望·隐藏议程·态度·个性·命运·神圣使命
 *  支持：中文名字(笔画) + 农历日期 + 自然语言解读
 * ================================================================ */

// 数字对应的配色
const NUMBER_COLORS: Record<number, string> = {
  1: '#E74C3C', 2: '#3498DB', 3: '#F39C12', 4: '#27AE60',
  5: '#9B59B6', 6: '#E67E22', 7: '#1ABC9C', 8: '#2C3E50',
  9: '#C0392B', 11: '#8E44AD', 22: '#16A085',
};

export default function NumerologyPage() {
  const [name, setName] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [isLunar, setIsLunar] = useState(false);
  const [profile, setProfile] = useState<NumerologyProfile | null>(null);
  const [guidance, setGuidance] = useState<LifeGuidance | null>(null);
  const [calculated, setCalculated] = useState(false);

  const handleCalculate = () => {
    if (!name.trim() || !birthMonth || !birthDay || !birthYear) return;
    const m = parseInt(birthMonth, 10);
    const d = parseInt(birthDay, 10);
    const y = parseInt(birthYear, 10);
    if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return;

    const result = calculateNumerology({ name: name.trim(), birthMonth: m, birthDay: d, birthYear: y, isLunar });
    setProfile(result);
    setGuidance(generateLifeGuidance(result));
    setCalculated(true);
  };

  const handleReset = () => {
    setProfile(null);
    setGuidance(null);
    setCalculated(false);
    setName('');
    setBirthMonth('');
    setBirthDay('');
    setBirthYear('');
  };

  const canCalculate = name.trim() && birthMonth && birthDay && birthYear;
  const chineseName = isChineseName(name);

  return (
    <PageContainer theme="healing">
      <HealingHeader title="灵数命理" subtitle="七维灵数 · 探索生命密码" />

      {/* 说明卡片 */}
      <div className="mx-4 mt-2 p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #f7f2ea 0%, #efe8d8 100%)', border: '1px solid #e0d8c8' }}>
        <div className="flex items-start gap-2">
          <Sparkles size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#8B2500' }} />
          <p className="text-[10px] leading-relaxed" style={{ color: '#5C3015' }}>
            灵数学源于古希腊数学家毕达哥拉斯，认为数字是宇宙的语言。
            输入姓名和生日，计算7个生命维度数字，探索你的天赋、内心渴望与人生方向。
            支持中文名字（按笔画计算）和农历生日。
          </p>
        </div>
      </div>

      {/* 输入区域 */}
      {!calculated && (
        <div className="px-4 pt-4 pb-28" style={{ background: 'linear-gradient(170deg, #FDF8F0 0%, #F5EFE0 50%, #EDE4D3 100%)' }}>
          <div className="max-w-md mx-auto space-y-4">
            {/* 姓名输入 */}
            <div>
              <label className="text-xs font-bold mb-2 block" style={{ color: '#5C1A00' }}>
                姓名（中文或英文拼音）
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="如：张三 或 Zhang San"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition"
                style={{
                  background: '#FDF8F0',
                  border: '1px solid #EDE4D3',
                  color: '#2C1810',
                }}
              />
              <p className="text-[10px] mt-1" style={{ color: '#8B7355' }}>
                {chineseName
                  ? '检测到中文名字，将按笔画数计算灵数'
                  : '支持中文名字或英文拼音，字母将按毕达哥拉斯体系转换为数字'}
              </p>
            </div>

            {/* 生日输入 */}
            <div>
              <label className="text-xs font-bold mb-2 block" style={{ color: '#5C1A00' }}>
                生日
              </label>
              {/* 公历/农历切换 */}
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setIsLunar(false)}
                  className="flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                  style={{
                    background: !isLunar ? '#8B2500' : '#FDF8F0',
                    color: !isLunar ? '#FDF8F0' : '#5C1A00',
                    border: `1px solid ${!isLunar ? '#8B2500' : '#EDE4D3'}`,
                  }}
                >
                  <Sun size={12} /> 公历
                </button>
                <button
                  onClick={() => setIsLunar(true)}
                  className="flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                  style={{
                    background: isLunar ? '#8B2500' : '#FDF8F0',
                    color: isLunar ? '#FDF8F0' : '#5C1A00',
                    border: `1px solid ${isLunar ? '#8B2500' : '#EDE4D3'}`,
                  }}
                >
                  <Moon size={12} /> 农历
                </button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    value={birthYear}
                    onChange={e => setBirthYear(e.target.value)}
                    placeholder="年"
                    min={1900}
                    max={2100}
                    className="w-full px-3 py-3 rounded-xl text-sm text-center outline-none transition"
                    style={{ background: '#FDF8F0', border: '1px solid #EDE4D3', color: '#2C1810' }}
                  />
                </div>
                <div className="w-20">
                  <input
                    type="number"
                    value={birthMonth}
                    onChange={e => setBirthMonth(e.target.value)}
                    placeholder="月"
                    min={1}
                    max={12}
                    className="w-full px-3 py-3 rounded-xl text-sm text-center outline-none transition"
                    style={{ background: '#FDF8F0', border: '1px solid #EDE4D3', color: '#2C1810' }}
                  />
                </div>
                <div className="w-20">
                  <input
                    type="number"
                    value={birthDay}
                    onChange={e => setBirthDay(e.target.value)}
                    placeholder="日"
                    min={1}
                    max={31}
                    className="w-full px-3 py-3 rounded-xl text-sm text-center outline-none transition"
                    style={{ background: '#FDF8F0', border: '1px solid #EDE4D3', color: '#2C1810' }}
                  />
                </div>
              </div>
              {isLunar && (
                <p className="text-[10px] mt-1" style={{ color: '#8B6914' }}>
                  农历日期请直接输入数字，如腊月十五输入月=12日=15
                </p>
              )}
            </div>

            {/* 计算按钮 */}
            <button
              onClick={handleCalculate}
              disabled={!canCalculate}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: canCalculate
                  ? 'linear-gradient(135deg, #8B2500, #B8860B)'
                  : '#EDE4D3',
                color: canCalculate ? '#FDF8F0' : '#8B7355',
                border: 'none',
              }}
            >
              <Calculator size={16} className="inline mr-2" />
              计算灵数
            </button>

            {/* 说明 */}
            <div className="rounded-xl p-4" style={{ background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
              <h4 className="font-bold text-xs mb-2" style={{ color: '#5C1A00' }}>七维灵数说明</h4>
              <div className="space-y-1.5 text-[10px]" style={{ color: '#5C3015' }}>
                <div><span className="font-bold" style={{ color: '#8B2500' }}>品格</span>：名字所有字母/笔画 → 你外在的样子和天赋</div>
                <div><span className="font-bold" style={{ color: '#8B2500' }}>灵魂渴望</span>：元音 → 你心里真正想要什么</div>
                <div><span className="font-bold" style={{ color: '#8B2500' }}>隐藏议程</span>：辅音 → 你自己都没意识到的行为习惯</div>
                <div><span className="font-bold" style={{ color: '#8B2500' }}>态度</span>：月+日 → 你面对世界时的自然反应</div>
                <div><span className="font-bold" style={{ color: '#8B2500' }}>个性</span>：日 → 别人对你的第一印象</div>
                <div><span className="font-bold" style={{ color: '#8B2500' }}>命运</span>：月+日+年 → 你这辈子的大方向</div>
                <div><span className="font-bold" style={{ color: '#8B2500' }}>神圣使命</span>：命运+品格 → 你灵性上的终极任务</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 结果展示 */}
      {calculated && profile && guidance && (
        <div className="px-4 pt-4 pb-28" style={{ background: 'linear-gradient(170deg, #FDF8F0 0%, #F5EFE0 50%, #EDE4D3 100%)' }}>
          {/* 重新计算按钮 */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition hover:shadow-sm"
              style={{ background: '#FDF8F0', border: '1px solid #EDE4D3', color: '#5C1A00' }}
            >
              <RefreshCw size={12} />
              重新计算
            </button>
          </div>

          {/* ===== 人生解读卡（自然语言） ===== */}
          <div className="mb-5 rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #5C1A00 0%, #8B2500 100%)' }}>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={16} style={{ color: '#E0C060' }} />
              <h3 className="font-bold text-sm" style={{ color: '#E0C060' }}>你的人生解读</h3>
            </div>
            {/* 一句话总结 */}
            <p className="text-sm leading-relaxed mb-4 font-bold" style={{ color: '#FDF8F0' }}>
              {guidance.summary}
            </p>
            {/* 你是怎样的人 */}
            <div className="mb-3 p-3 rounded-xl" style={{ background: 'rgba(253,248,240,0.08)' }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Heart size={12} style={{ color: '#E0C060' }} />
                <span className="text-xs font-bold" style={{ color: '#E0C060' }}>你是怎样的人</span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: '#F5EFE0' }}>{guidance.whoYouAre}</p>
            </div>
            {/* 优势 */}
            <div className="mb-3 p-3 rounded-xl" style={{ background: 'rgba(253,248,240,0.08)' }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Star size={12} style={{ color: '#E0C060' }} />
                <span className="text-xs font-bold" style={{ color: '#E0C060' }}>你的优势</span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: '#F5EFE0' }}>{guidance.yourStrengths}</p>
            </div>
            {/* 注意 */}
            <div className="mb-3 p-3 rounded-xl" style={{ background: 'rgba(253,248,240,0.08)' }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Compass size={12} style={{ color: '#E0C060' }} />
                <span className="text-xs font-bold" style={{ color: '#E0C060' }}>需要注意</span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: '#F5EFE0' }}>{guidance.watchOut}</p>
            </div>
            {/* 下一步 */}
            <div className="p-3 rounded-xl" style={{ background: 'rgba(224,192,96,0.12)', border: '1px solid rgba(224,192,96,0.2)' }}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Lightbulb size={12} style={{ color: '#E0C060' }} />
                <span className="text-xs font-bold" style={{ color: '#E0C060' }}>下一步怎么办</span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: '#F5EFE0' }}>{guidance.nextSteps}</p>
            </div>
          </div>

          {/* 七维灵数卡片 */}
          <div className="space-y-3">
            {([
              ['character', profile.character],
              ['soul', profile.soul],
              ['hidden', profile.hidden],
              ['attitude', profile.attitude],
              ['personality', profile.personality],
              ['destiny', profile.destiny],
              ['divine', profile.divine],
            ] as [string, NumerologyResult][]).map(([key, result]) => {
              const meaning = getMeaning(result.dimension, result.value);
              const color = NUMBER_COLORS[result.value] || '#8B7355';
              const stars = getStarRating(result.value);
              const keyword = getNumberKeyword(result.value);

              return (
                <div
                  key={key}
                  className="rounded-2xl p-4 transition hover:shadow-md"
                  style={{
                    background: '#FDF8F0',
                    border: `1px solid ${color}25`,
                  }}
                >
                  {/* 维度标题 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: color + '18', border: `1.5px solid ${color}`, color }}
                      >
                        {result.cn.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-sm" style={{ color: '#2C1810' }}>{result.cn}</div>
                        <div className="text-[9px]" style={{ color: '#8B7355' }}>{result.label}</div>
                      </div>
                    </div>
                    {/* 星级 */}
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          className={i < stars ? 'fill-current' : ''}
                          style={{ color: i < stars ? '#B8860B' : '#D4C5A9' }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 数字大显示 */}
                  <div className="flex items-center gap-4 mb-3">
                    <div
                      className="flex items-center justify-center rounded-2xl"
                      style={{
                        width: 56, height: 56,
                        background: `linear-gradient(135deg, ${color}20, ${color}08)`,
                        border: `2px solid ${color}40`,
                      }}
                    >
                      <span className="text-3xl font-black" style={{ color }}>{result.value}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm" style={{ color }}>{meaning?.keyword || keyword}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: '#8B7355' }}>{keyword}</div>
                    </div>
                  </div>

                  {/* 描述 */}
                  {meaning && (
                    <>
                      <p className="text-xs leading-relaxed mb-2" style={{ color: '#5C3015' }}>
                        {meaning.description}
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#27AE6015', color: '#27AE60', border: '1px solid #27AE6030' }}>
                          优势：{meaning.strengths}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#E74C3C15', color: '#E74C3C', border: '1px solid #E74C3C30' }}>
                          挑战：{meaning.challenges}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* 总览卡片 */}
          <div className="mt-5 rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, #5C1A00 0%, #8B2500 100%)' }}>
            <h3 className="font-bold text-sm mb-3" style={{ color: '#E0C060' }}>灵数总览</h3>
            <div className="grid grid-cols-4 gap-2">
              {([
                ['品格', profile.character.value],
                ['灵魂', profile.soul.value],
                ['隐藏', profile.hidden.value],
                ['态度', profile.attitude.value],
                ['个性', profile.personality.value],
                ['命运', profile.destiny.value],
                ['使命', profile.divine.value],
              ] as [string, number][]).map(([label, val]) => (
                <div key={label} className="text-center rounded-lg p-2" style={{ background: 'rgba(253,248,240,0.1)' }}>
                  <div className="text-2xl font-black" style={{ color: '#E0C060' }}>{val}</div>
                  <div className="text-[9px]" style={{ color: '#D4C5A9' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 说明 */}
          <div className="mt-4 rounded-xl p-4" style={{ background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
            <h4 className="font-bold text-xs mb-2" style={{ color: '#5C1A00' }}>灵数学原理</h4>
            <p className="text-[10px] leading-relaxed" style={{ color: '#5C3015' }}>
              灵数学源于古希腊数学家毕达哥拉斯的"万物皆数"哲学。
              每个字母或汉字笔画对应数字 1-9，通过数字缩减法获得核心频率。
              元音揭示内心渴望，辅音映射潜意识，生日数字指向人生方向。
              中文名字按康熙字典笔画计算，农历日期按实际数字计算。
              灵数仅供自我探索参考，不代表科学结论。
            </p>
          </div>
        </div>
      )}

      <BottomNav />
    </PageContainer>
  );
}
