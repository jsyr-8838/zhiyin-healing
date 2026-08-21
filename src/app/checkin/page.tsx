'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import PageContainer from '@/components/layout/PageContainer';
import { useAppStore } from '@/lib/store';
import { getClientUserId } from '@/lib/auth';
import { Moon, SmilePlus, Dumbbell, Utensils, Save, Check, ChevronRight, TrendingUp, Zap } from 'lucide-react';
import { useCultivationStore } from '@/lib/cultivation-store';
import { XIUWEI_GAINS } from '@/lib/cultivation-engine';

interface TodayCheckin {
  id: string;
  date: string;
  sleepHours: number;
  sleepScore: number;
  bedtime: string;
  mood: number;
  moodScore: number;
  exercise: number;
  exerciseScore: number;
  diet: number;
  dietScore: number;
  healthScore: number;
  symptoms: string;
  note: string;
}

export default function CheckinPage() {
  const [sleepHours, setSleepHours] = useState(7);
  const [bedtime, setBedtime] = useState('22:30');
  const [mood, setMood] = useState(3);
  const [exercise, setExercise] = useState(3);
  const [diet, setDiet] = useState(3);
  const [symptoms, setSymptoms] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [todayCheckin, setTodayCheckin] = useState<TodayCheckin | null>(null);
  const [streak, setStreak] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCheckinData();
  }, []);

  async function fetchCheckinData() {
    try {
      const res = await fetch(`/api/checkin?userId=${getClientUserId()}&days=7`);
      if (res.ok) {
        const data = await res.json();
        setTodayCheckin(data.todayCheckin);
        setStreak(data.streak);
        setAvgScore(data.avgHealthScore);

        if (data.todayCheckin) {
          // 已打卡，填充已有数据
          const c = data.todayCheckin;
          setSleepHours(c.sleepHours);
          setBedtime(c.bedtime || '22:30');
          setMood(c.mood);
          setExercise(c.exercise);
          setDiet(c.diet);
          setSymptoms(c.symptoms || '');
          setNote(c.note || '');
          setSaved(true);
        }
      }
    } catch (err) {
      console.warn('[checkin] fetchCheckinData failed, using offline mode:', err instanceof Error ? err.message : err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: getClientUserId(),
          sleepHours,
          bedtime,
          mood,
          exercise,
          diet,
          symptoms,
          note,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTodayCheckin(data.checkin);
        setSaved(true);
        setSaveError('');

        // ★ 打卡获得修为
        try {
          const gain = XIUWEI_GAINS.checkin;
          useCultivationStore.getState().addXiuWei('earth', gain);
          useCultivationStore.getState().recordPractice('checkin', 60, 'earth', gain);
          fetch('/api/cultivation/practice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: getClientUserId(),
              category: 'checkin',
              element: 'earth',
              durationSec: 60,
            }),
          }).catch((e) => {
            console.warn('[checkin] cultivation practice sync failed:', e instanceof Error ? e.message : e);
          });
        } catch (e) {
          console.warn('[checkin] cultivation store update failed:', e instanceof Error ? e.message : e);
        }

        // 刷新数据
        fetchCheckinData();
      } else {
        setSaveError('保存失败，请稍后重试');
      }
    } catch {
      setSaveError('网络异常，打卡数据未保存，请重试');
    } finally {
      setSaving(false);
    }
  }

  // 评分指标 Slider 组件
  function ScoreSlider({
    icon,
    label,
    value,
    onChange,
    labels,
    color,
  }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    onChange: (v: number) => void;
    labels: string[];
    color: string;
  }) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-white`}>
            {icon}
          </div>
          <span className="font-bold text-gray-900 text-sm">{label}</span>
        </div>
        <div className="flex gap-1">
          {labels.map((l, i) => (
            <button
              key={i}
              onClick={() => onChange(i + 1)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition ${
                value === i + 1
                  ? `${color} text-white shadow-sm`
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <PageContainer theme="healing" className="flex items-center justify-center">
        <div className="text-gray-400">加载中...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="healing" className="pb-24">
      {/* 头部 */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-6 pt-12 pb-8 text-white">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-black">每日打卡</h1>
          {saved && (
            <span className="flex items-center gap-1 bg-emerald-400/30 text-emerald-100 text-xs px-2.5 py-1 rounded-full">
              <Check size={12} /> 已打卡
            </span>
          )}
        </div>
        <p className="text-emerald-200 text-sm">记录今日状态，AI分析你的健康趋势</p>

        {/* 统计概览 */}
        <div className="flex gap-3 mt-4">
          <div className="flex-1 bg-white/15 rounded-xl p-3 text-center">
            <p className="text-2xl font-black">{streak}</p>
            <p className="text-[10px] text-emerald-200 mt-0.5">连续天数</p>
          </div>
          <div className="flex-1 bg-white/15 rounded-xl p-3 text-center">
            <p className="text-2xl font-black">{avgScore || '--'}</p>
            <p className="text-[10px] text-emerald-200 mt-0.5">近期均分</p>
          </div>
          <div className="flex-1 bg-white/15 rounded-xl p-3 text-center">
            <p className="text-2xl font-black">{todayCheckin?.healthScore || '--'}</p>
            <p className="text-[10px] text-emerald-200 mt-0.5">今日评分</p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-4">
        {/* 睡眠 */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
              <Moon size={16} />
            </div>
            <span className="font-bold text-gray-900 text-sm">睡眠</span>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">睡眠时长</span>
              <span className="text-sm font-bold text-indigo-600">{sleepHours}小时</span>
            </div>
            <input
              type="range"
              min="3"
              max="12"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>3h</span><span>7-8h</span><span>12h</span>
            </div>
          </div>

          <div>
            <span className="text-xs text-gray-500">就寝时间</span>
            <input
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="ml-3 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* 情绪 */}
        <ScoreSlider
          icon={<SmilePlus size={16} />}
          label="情绪"
          value={mood}
          onChange={setMood}
          labels={['很差', '差', '一般', '好', '极佳']}
          color="bg-amber-500"
        />

        {/* 运动 */}
        <ScoreSlider
          icon={<Dumbbell size={16} />}
          label="运动"
          value={exercise}
          onChange={setExercise}
          labels={['无', '少量', '适中', '充足', '充沛']}
          color="bg-emerald-500"
        />

        {/* 饮食 */}
        <ScoreSlider
          icon={<Utensils size={16} />}
          label="饮食规律"
          value={diet}
          onChange={setDiet}
          labels={['极差', '差', '一般', '良好', '很好']}
          color="bg-orange-500"
        />

        {/* 症状 */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <span className="text-sm font-bold text-gray-900 mb-2 block">不适症状（可选）</span>
          <div className="flex flex-wrap gap-2 mb-3">
            {['头痛', '失眠', '疲劳', '便秘', '口干', '胃胀', '腰酸', '心悸'].map((s) => (
              <button
                key={s}
                onClick={() => {
                  const newSymptoms = symptoms.includes(s)
                    ? symptoms.split('、').filter(x => x !== s).join('、')
                    : (symptoms ? symptoms + '、' + s : s);
                  setSymptoms(newSymptoms);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  symptoms.includes(s)
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="其他备注..."
            className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm resize-none h-16 placeholder:text-gray-300"
          />
        </div>

        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? (
            '保存中...'
          ) : saved ? (
            <>
              <Check size={16} /> 更新打卡
            </>
          ) : (
            <>
              <Save size={16} /> 提交打卡
            </>
          )}
        </button>

        {saveError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 text-center">
            {saveError}
          </div>
        )}

        {/* 今日评分结果 */}
        {todayCheckin && (
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-600" />
              今日健康评分
            </h3>
            <div className="flex items-center justify-center mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                <span className="text-3xl font-black text-white">{todayCheckin.healthScore}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/70 rounded-xl p-3">
                <p className="text-xs text-gray-500">睡眠</p>
                <p className="text-lg font-bold text-indigo-600">{todayCheckin.sleepScore}</p>
              </div>
              <div className="bg-white/70 rounded-xl p-3">
                <p className="text-xs text-gray-500">情绪</p>
                <p className="text-lg font-bold text-amber-600">{todayCheckin.moodScore}</p>
              </div>
              <div className="bg-white/70 rounded-xl p-3">
                <p className="text-xs text-gray-500">运动</p>
                <p className="text-lg font-bold text-emerald-600">{todayCheckin.exerciseScore}</p>
              </div>
              <div className="bg-white/70 rounded-xl p-3">
                <p className="text-xs text-gray-500">饮食</p>
                <p className="text-lg font-bold text-orange-600">{todayCheckin.dietScore}</p>
              </div>
            </div>
          </div>
        )}

        {/* AI 分析提示 */}
        {todayCheckin && (
          <Link
            href="/healing/ai-diagnosis"
            className="block bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Zap size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-800 text-sm">获取AI健康分析</h3>
                <p className="text-[11px] text-amber-600 mt-0.5">基于打卡数据，个性化养生建议</p>
              </div>
              <ChevronRight size={16} className="text-amber-400" />
            </div>
          </Link>
        )}
      </div>

      <BottomNav />
    </PageContainer>
  );
}
