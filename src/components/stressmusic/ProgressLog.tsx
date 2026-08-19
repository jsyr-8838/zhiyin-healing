'use client';

import React, { useEffect, useState, useRef } from 'react';
import { LOADING_LOGS } from './types';

/**
 * ProgressLog — 加载页进度文案
 * 移植自 StressMusic 的 startLoadingProgressLog
 * 有节奏的时间点切换文字，让等待变得有意义
 */
export default function ProgressLog({ active }: { active: boolean }) {
  const [text, setText] = useState('保持呼吸节奏，AI 正在为您编织专属旋律...');
  const [opacity, setOpacity] = useState(1);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!active) {
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current = [];
      return;
    }

    // 重置
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
    setText('保持呼吸节奏，AI 正在为您编织专属旋律...');
    setOpacity(1);

    LOADING_LOGS.forEach(log => {
      const t = setTimeout(() => {
        // 淡出
        setOpacity(0.2);
        setTimeout(() => {
          setText(log.text);
          setOpacity(1);
        }, 500);
      }, log.time);
      timeoutsRef.current.push(t);
    });

    return () => {
      timeoutsRef.current.forEach(t => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, [active]);

  return (
    <div className="text-center" style={{ color: '#636E72', fontSize: '1rem', fontWeight: 300, letterSpacing: '1px' }}>
      <p style={{ opacity, transition: 'opacity 0.5s ease-in-out' }}>
        {text}
      </p>
    </div>
  );
}
