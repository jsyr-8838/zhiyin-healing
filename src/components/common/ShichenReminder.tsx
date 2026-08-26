'use client';

import { useState, useEffect } from 'react';

/**
 * 时辰养生提醒组件
 * 
 * 基于子午流注（中医时辰养生）的定时提醒
 * 不依赖推送服务器，使用 localStorage + 定时检查
 * 
 * 功能：
 * 1. 检测当前时辰，给出养生建议
 * 2. 用户可开启/关闭提醒
 * 3. 在关键时辰（如子时23-1点提醒入睡）弹通知
 */

// 子午流注：12时辰对应经络
const MERIDIAN_CLOCK: { time: string; meridian: string; organ: string; tip: string; emoji: string }[] = [
  { time: '23:00-01:00', meridian: '胆经', organ: '足少阳胆经', tip: '子时当令，胆经旺盛。应入睡养胆气，熬夜伤胆。', emoji: '🌙' },
  { time: '01:00-03:00', meridian: '肝经', organ: '足厥阴肝经', tip: '丑时当令，肝经旺盛。深度睡眠助肝排毒养血。', emoji: '💤' },
  { time: '03:00-05:00', meridian: '肺经', organ: '手太阴肺经', tip: '寅时当令，肺经旺盛。宜深呼吸养肺，起身不宜过早。', emoji: '🌬' },
  { time: '05:00-07:00', meridian: '大肠经', organ: '手阳明大肠经', tip: '卯时当令，大肠经旺盛。宜起床饮水排便。', emoji: '🌅' },
  { time: '07:00-09:00', meridian: '胃经', organ: '足阳明胃经', tip: '辰时当令，胃经旺盛。宜吃早餐养胃。', emoji: '🍚' },
  { time: '09:00-11:00', meridian: '脾经', organ: '足太阴脾经', tip: '巳时当令，脾经旺盛。宜学习工作运化水谷。', emoji: '📚' },
  { time: '11:00-13:00', meridian: '心经', organ: '手少阴心经', tip: '午时当令，心经旺盛。宜午休养心。', emoji: '☀️' },
  { time: '13:00-15:00', meridian: '小肠经', organ: '手太阳小肠经', tip: '未时当令，小肠经旺盛。宜吸收营养。', emoji: '🍵' },
  { time: '15:00-17:00', meridian: '膀胱经', organ: '足太阳膀胱经', tip: '申时当令，膀胱经旺盛。宜多喝水排毒。', emoji: '💧' },
  { time: '17:00-19:00', meridian: '肾经', organ: '足少阴肾经', tip: '酉时当令，肾经旺盛。宜休息养肾藏精。', emoji: '🔮' },
  { time: '19:00-21:00', meridian: '心包经', organ: '手厥阴心包经', tip: '戌时当令，心包经旺盛。宜散步放松心情。', emoji: '🚶' },
  { time: '21:00-23:00', meridian: '三焦经', organ: '手少阳三焦经', tip: '亥时当令，三焦经旺盛。宜安睡准备入眠。', emoji: '🌙' },
];

function getCurrentShichen(): number {
  const hour = new Date().getHours();
  // 子时 = 23-1点 => index 0
  if (hour === 23 || hour === 0) return 0;
  return Math.floor((hour + 1) / 2) % 12;
}

function getLastNotifiedKey(shichen: number): string {
  const today = new Date().toDateString();
  return `evo-notified-${today}-${shichen}`;
}

export default function ShichenReminder() {
  const [enabled, setEnabled] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');

  useEffect(() => {
    // 加载设置
    const saved = localStorage.getItem('evo-shichen-reminder');
    if (saved === 'enabled') {
      setEnabled(true);
    }

    // 加载通知权限
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // 更新当前时辰
    setCurrentIdx(getCurrentShichen());

    // 每分钟检查一次
    const interval = setInterval(() => {
      const idx = getCurrentShichen();
      setCurrentIdx(idx);

      if (!enabled || Notification.permission !== 'granted') return;

      // 检查是否已通知过
      const key = getLastNotifiedKey(idx);
      if (localStorage.getItem(key)) return;

      // 发送通知
      const data = MERIDIAN_CLOCK[idx];
      new Notification(`${data.emoji} ${data.meridian}当令`, {
        body: data.tip,
        icon: '/brand/zhiyin-logo-seal-mini-v8.jpg',
        tag: 'shichen-reminder',
      });

      localStorage.setItem(key, '1');
    }, 60000);

    return () => clearInterval(interval);
  }, [enabled]);

  const toggleEnabled = async () => {
    if (!enabled) {
      // 请求通知权限
      if ('Notification' in window && Notification.permission === 'default') {
        const perm = await Notification.requestPermission();
        setPermission(perm);
        if (perm !== 'granted') {
          alert('需要允许通知权限才能收到时辰养生提醒');
          return;
        }
      }
      setEnabled(true);
      localStorage.setItem('evo-shichen-reminder', 'enabled');
    } else {
      setEnabled(false);
      localStorage.setItem('evo-shichen-reminder', 'disabled');
    }
  };

  const current = MERIDIAN_CLOCK[currentIdx];

  return (
    <div className="rounded-xl p-3 bg-gradient-to-br from-stone-50 to-amber-50/30 border border-stone-200/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{current.emoji}</span>
          <div>
            <div className="text-xs font-bold text-stone-700">
              {current.meridian}当令
            </div>
            <div className="text-[10px] text-stone-500">
              {current.time} · {current.organ}
            </div>
          </div>
        </div>
        <button
          onClick={toggleEnabled}
          className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
            enabled ? 'bg-emerald-500' : 'bg-stone-300'
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
      <p className="text-[10px] text-stone-500 mt-1.5 leading-relaxed">
        {current.tip}
      </p>
      {enabled && permission === 'granted' && (
        <p className="text-[9px] text-emerald-500 mt-1">✓ 已开启时辰提醒</p>
      )}
      {enabled && permission !== 'granted' && (
        <p className="text-[9px] text-amber-500 mt-1">请在浏览器设置中允许通知</p>
      )}
    </div>
  );
}
