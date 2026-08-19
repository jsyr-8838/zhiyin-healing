'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCultivationStore } from '@/lib/cultivation-store';
import { ELEMENT_COLORS, ELEMENT_NAMES, ELEMENT_ORGANS, type WuxingElement } from '@/lib/cultivation-engine';
import { ArrowRight, Check, Wind, Droplets, Sun, Moon, CloudRain } from 'lucide-react';

const ONBOARDED_KEY = 'heytcm-onboarded';

/** 引导问题 */
interface FeelingOption {
  label: string;
  element: WuxingElement;
  desc: string;
}

interface TimeOption {
  label: string;
  value: string;
  desc: string;
}

interface FeelingQuestion {
  id: 'feeling';
  title: string;
  options: FeelingOption[];
}

interface TimeQuestion {
  id: 'time';
  title: string;
  options: TimeOption[];
}

type OnboardingQuestion = FeelingQuestion | TimeQuestion;

const QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'feeling',
    title: '此刻你感觉如何？',
    options: [
      { label: '疲惫乏力', element: 'earth' as WuxingElement, desc: '脾土虚弱，需要温补' },
      { label: '烦躁焦虑', element: 'fire' as WuxingElement, desc: '心火亢盛，需要清降' },
      { label: '低落消沉', element: 'wood' as WuxingElement, desc: '肝木郁滞，需要疏泄' },
      { label: '心神不宁', element: 'water' as WuxingElement, desc: '肾水不足，需要安神' },
      { label: '身心平和', element: 'metal' as WuxingElement, desc: '肺金肃降，保持即可' },
    ],
  },
  {
    id: 'time',
    title: '你想用多久开始？',
    options: [
      { label: '3 分钟', value: 'quick', desc: '一个字诀，快速回神' },
      { label: '10 分钟', value: 'medium', desc: '字诀 + 五音，深度疗愈' },
      { label: '20 分钟', value: 'full', desc: '完整功法，全面调养' },
    ],
  },
];

/** 根据选择推荐第一步 */
function getRecommendation(feeling: string, time: string) {
  const elMap: Record<string, WuxingElement> = {
    '疲惫乏力': 'earth', '烦躁焦虑': 'fire', '低落消沉': 'wood',
    '心神不宁': 'water', '身心平和': 'metal',
  };
  const element = elMap[feeling] || 'earth';

  if (time === 'quick') {
    return {
      title: '先做一个字诀',
      desc: `${ELEMENT_NAMES[element]}行${ELEMENT_ORGANS[element]}经——只需 3 分钟`,
      href: '/healing/liuzijue',
      element,
    };
  }
  if (time === 'medium') {
    return {
      title: '字诀 + 五音疗愈',
      desc: `先疏${ELEMENT_ORGANS[element]}，再以${ELEMENT_NAMES[element]}行音调养`,
      href: '/healing/liuzijue',
      element,
    };
  }
  return {
    title: '完整功法修行',
    desc: `六字诀 → 五音疗愈 → 穴位按揉，全面调养${ELEMENT_ORGANS[element]}经`,
    href: '/healing/liuzijue',
    element,
  };
}

export default function OnboardingFlow() {
  const [step, setStep] = useState(0); // 0: 问题1, 1: 问题2, 2: 推荐
  const [feeling, setFeeling] = useState('');
  const [timePref, setTimePref] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 检查是否已完成引导
    const onboarded = localStorage.getItem(ONBOARDED_KEY);
    if (!onboarded) {
      setVisible(true);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDED_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  const recommendation = feeling && timePref ? getRecommendation(feeling, timePref) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-sm rounded-2xl p-6 relative" style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(250,245,238,0.95))',
        boxShadow: '0 24px 64px rgba(30,45,38,0.2)',
      }}>
        {/* 关闭按钮 */}
        <button
          onClick={handleComplete}
          className="absolute top-4 right-4 text-xs px-2 py-1 rounded-full"
          style={{ color: 'var(--ink-light)', background: 'rgba(30,45,38,0.05)' }}
        >
          跳过
        </button>

        {step < 2 ? (
          <>
            {/* 问题标题 */}
            <h2 className="text-xl font-black mb-1" style={{ color: 'var(--ink-main)' }}>
              {QUESTIONS[step].title}
            </h2>
            <p className="text-xs mb-5" style={{ color: 'var(--ink-light)' }}>
              {step === 0 ? '我们会为你定制第一课' : '推荐最适合当下的练习'}
            </p>

            {/* 选项 */}
            <div className="space-y-2.5">
              {(step === 0 ? QUESTIONS[0].options : QUESTIONS[1].options).map((opt, i) => {
                const feelingOpt = step === 0 ? opt as FeelingOption : null;
                const timeOpt = step === 1 ? opt as TimeOption : null;
                const isSelected = step === 0 ? feeling === opt.label : timePref === timeOpt?.value;
                const optElement = feelingOpt?.element || 'earth';
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (step === 0) setFeeling(opt.label);
                      else if (timeOpt) setTimePref(timeOpt.value);
                    }}
                    className="w-full text-left p-3.5 rounded-xl transition-all"
                    style={{
                      background: isSelected ? `${ELEMENT_COLORS[optElement]}08` : 'rgba(30,45,38,0.02)',
                      border: `1.5px solid ${isSelected ? ELEMENT_COLORS[optElement] + '40' : 'transparent'}`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm" style={{ color: isSelected ? ELEMENT_COLORS[optElement] : 'var(--ink-main)' }}>
                        {opt.label}
                      </span>
                      {isSelected && <Check size={16} style={{ color: ELEMENT_COLORS[optElement] }} />}
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--ink-light)', opacity: 0.7 }}>
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* 下一步 */}
            <button
              onClick={() => {
                if (step === 0 && feeling) setStep(1);
                else if (step === 1 && timePref) setStep(2);
              }}
              disabled={step === 0 ? !feeling : !timePref}
              className="w-full mt-5 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-30"
              style={{
                background: recommendation ? `linear-gradient(135deg, ${recommendation.element === 'wood' ? ELEMENT_COLORS.wood : ELEMENT_COLORS.earth}, ${ELEMENT_COLORS.water})` : 'linear-gradient(135deg, var(--wood), var(--water))',
              }}
            >
              继续
            </button>
          </>
        ) : recommendation ? (
          <>
            {/* 推荐结果 */}
            <div className="text-center mb-5">
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white mb-4" style={{
                background: `linear-gradient(135deg, ${ELEMENT_COLORS[recommendation.element]}, ${ELEMENT_COLORS[recommendation.element]}cc)`,
                boxShadow: `0 8px 24px ${ELEMENT_COLORS[recommendation.element]}40`,
              }}>
                <Wind size={28} />
              </div>
              <h2 className="text-xl font-black" style={{ color: 'var(--ink-main)' }}>
                开始你的第一课
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--ink-light)' }}>
                {recommendation.title}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--ink-light)', opacity: 0.6 }}>
                {recommendation.desc}
              </p>
            </div>

            <Link
              href={recommendation.href}
              onClick={handleComplete}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all"
              style={{
                background: `linear-gradient(135deg, ${ELEMENT_COLORS[recommendation.element]}, ${ELEMENT_COLORS[recommendation.element]}cc)`,
                boxShadow: `0 4px 16px ${ELEMENT_COLORS[recommendation.element]}30`,
              }}
            >
              开始练习 <ArrowRight size={16} />
            </Link>

            <button
              onClick={handleComplete}
              className="w-full mt-2 py-2 text-xs"
              style={{ color: 'var(--ink-light)' }}
            >
              先逛逛再说
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
